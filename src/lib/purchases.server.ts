type RecordPurchaseInput = {
  email: string;
  fullName?: string | null;
  phone?: string | null;
  programSlug: string;
  programLabel?: string | null;
  amountInr?: number;
  provider: "stripe" | "razorpay";
  paymentRef?: string | null;
  enrolment?: Record<string, string | number>;
};

/** Records a paid purchase and links it to the buyer's account when one exists. */
export async function recordStudentPurchase(input: RecordPurchaseInput): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const email = (input.email ?? "").trim().toLowerCase();
  if (!email) return;

  let userId: string | null = null;
  try {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    userId = data?.users.find((u) => (u.email ?? "").toLowerCase() === email)?.id ?? null;
  } catch {
    userId = null;
  }

  await supabaseAdmin.from("student_purchases").insert({
    user_id: userId,
    email,
    full_name: (input.fullName ?? "").slice(0, 120),
    phone: input.phone ?? null,
    program_slug: input.programSlug,
    program_label: input.programLabel ?? "",
    amount_inr: input.amountInr ?? 0,
    provider: input.provider,
    payment_ref: input.paymentRef ?? null,
    status: "paid",
    enrolment: (input.enrolment ?? {}) as never,
  });
}
