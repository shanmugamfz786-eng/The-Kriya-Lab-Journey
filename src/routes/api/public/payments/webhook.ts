import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhook, type StripeEnv } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/public/payments/webhook")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = url.searchParams.get("env");
        const stripeEnv: StripeEnv = env === "live" ? "live" : "sandbox";

        let event: { type: string; data: { object: Record<string, any> } };
        try {
          event = await verifyWebhook(request, stripeEnv);
        } catch {
          return new Response("Invalid webhook signature", { status: 401 });
        }

        try {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            if (session["payment_status"] === "paid") {
              const { recordStudentPurchase } = await import("@/lib/purchases.server");
              await recordStudentPurchase({
                email: session["customer_details"]?.email ?? "",
                fullName: session["customer_details"]?.name ?? "",
                phone: session["customer_details"]?.phone ?? null,
                programSlug: session["metadata"]?.program ?? "",
                programLabel: session["metadata"]?.program ?? "",
                amountInr: session["amount_total"] != null ? session["amount_total"] / 100 : 0,
                provider: "stripe",
                paymentRef: session["id"],
              });
            }
          }
        } catch {
          // Recording failure must not cause Stripe to retry endlessly.
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
