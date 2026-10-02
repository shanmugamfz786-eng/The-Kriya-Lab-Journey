import { createServerFn } from "@tanstack/react-start";
import { createHmac } from "crypto";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

export type PaidProgram = {
  slug: string;
  priceId: string;
  label: string;
  amountInr: number;
};

// Keep in sync with src/content/site.ts purchasePrograms.
export const PAID_PROGRAMS: PaidProgram[] = [
  { slug: "live-online-group-english", priceId: "group_english_onetime", label: "Kriya Yoga Initiation — Live Online Group (English)", amountInr: 0 },
  { slug: "live-online-individual", priceId: "individual_online_onetime", label: "Kriya Yoga Initiation — Individual Online (1-on-1)", amountInr: 0 },
  { slug: "live-online-group-tamil", priceId: "group_tamil_onetime", label: "Kriya Yoga Initiation — Live Online Group (Tamil)", amountInr: 0 },
  { slug: "in-person-initiation", priceId: "in_person_onetime", label: "Kriya Yoga Initiation — In-person (1-on-1)", amountInr: 0 },
  { slug: "gift-a-friend", priceId: "gift_friend_onetime", label: "Kriya Yoga Initiation — Gift a Friend", amountInr: 0 },
  { slug: "family-initiation", priceId: "family_initiation_onetime", label: "Kriya Yoga Initiation — Family Initiation", amountInr: 0 },
];

type CheckoutSessionResult = { clientSecret: string } | { error: string };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string | undefined; name?: string | undefined },
): Promise<string | undefined> {
  if (!options.email) return undefined;
  const existing = await stripe.customers.list({ email: options.email, limit: 1 });
  if (existing.data.length) return existing.data[0]!.id;
  const created = await stripe.customers.create({
    email: options.email,
    ...(options.name && { name: options.name }),
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: {
    programSlug: string;
    customerEmail?: string;
    customerName?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    const program = PAID_PROGRAMS.find((p) => p.slug === data.programSlug);
    if (!program) throw new Error("Unknown program");
    if (data.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
      throw new Error("Invalid email");
    }
    return { ...data, program };
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({ lookup_keys: [data.program.priceId] });
      if (!prices.data.length) return { error: "Price not found. Products may not be set up yet." };
      const stripePrice = prices.data[0]!;

      const customerId = await resolveOrCreateCustomer(stripe, {
        email: data.customerEmail,
        name: data.customerName,
      });

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        ...(customerId && { customer: customerId }),
        payment_intent_data: { description: data.program.label },
        metadata: { program: data.program.slug },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

// ---------- Razorpay ----------

type RazorpayOrderResult =
  | { orderId: string; amount: number; currency: string; keyId: string }
  | { error: string };

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { programSlug: string; customerName?: string; customerEmail?: string }) => {
    const program = PAID_PROGRAMS.find((p) => p.slug === data.programSlug);
    if (!program) throw new Error("Unknown program");
    if (data.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
      throw new Error("Invalid email");
    }
    return { ...data, program };
  })
  .handler(async ({ data }): Promise<RazorpayOrderResult> => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) {
      return { error: "Razorpay is not configured yet. Please use card payment." };
    }
    try {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        },
        body: JSON.stringify({
          amount: data.program.amountInr * 100,
          currency: "INR",
          receipt: `${data.program.slug}-${Date.now()}`,
          notes: {
            program: data.program.slug,
            name: data.customerName ?? "",
            email: data.customerEmail ?? "",
          },
        }),
      });
      const json = (await res.json()) as { id?: string; amount?: number; currency?: string; error?: { description?: string } };
      if (!res.ok || !json.id) {
        return { error: json.error?.description ?? "Razorpay order creation failed" };
      }
      return { orderId: json.id, amount: json.amount ?? data.program.amountInr * 100, currency: json.currency ?? "INR", keyId };
    } catch {
      return { error: "Could not reach Razorpay. Please try card payment." };
    }
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((data: {
    orderId: string;
    paymentId: string;
    signature: string;
    programSlug: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }) => {
    if (!/^[a-zA-Z0-9_]+$/.test(data.orderId) || !/^[a-zA-Z0-9_]+$/.test(data.paymentId)) {
      throw new Error("Invalid payment reference");
    }
    return data;
  })
  .handler(async ({ data }): Promise<{ ok: boolean; error?: string }> => {
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) return { ok: false, error: "Razorpay is not configured." };
    const expected = createHmac("sha256", keySecret)
      .update(`${data.orderId}|${data.paymentId}`)
      .digest("hex");
    if (expected !== data.signature) return { ok: false, error: "Payment verification failed" };

    const program = PAID_PROGRAMS.find((p) => p.slug === data.programSlug);
    try {
      const { recordStudentPurchase } = await import("@/lib/purchases.server");
      await recordStudentPurchase({
        email: data.customerEmail ?? "",
        fullName: data.customerName ?? "",
        phone: data.customerPhone ?? null,
        programSlug: data.programSlug,
        programLabel: program?.label ?? "",
        amountInr: program?.amountInr ?? 0,
        provider: "razorpay",
        paymentRef: data.paymentId,
      });
    } catch {
      // Payment is verified; recording failure should not block the buyer.
    }

    return { ok: true };
  });
