import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhook, type StripeEnv } from "@/lib/stripe.server";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/payments/webhook")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = url.searchParams.get("env");
        const stripeEnv: StripeEnv = env === "live" ? "live" : "sandbox";
        const razorpaySignature = request.headers.get("x-razorpay-signature");
        const stripeSignature = request.headers.get("stripe-signature");

        const { recordStudentPurchase, recordPaymentFailure, recordPaymentRefund } = await import(
          "@/lib/purchases.server"
        );

        // 1. Razorpay Webhook Handler
        if (razorpaySignature) {
          const rawBody = await request.text();
          const webhookSecret = process.env["RAZORPAY_WEBHOOK_SECRET"] || process.env["RAZORPAY_KEY_SECRET"] || "";
          if (!webhookSecret) {
            return new Response("Razorpay webhook secret not configured", { status: 500 });
          }

          const expectedSignature = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
          const isValid =
            expectedSignature.length === razorpaySignature.length &&
            timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));

          if (!isValid) {
            return new Response("Invalid Razorpay webhook signature", { status: 401 });
          }

          try {
            const payload = JSON.parse(rawBody);
            const eventType = payload.event;
            const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity || {};

            if (eventType === "payment.captured" || eventType === "order.paid") {
              await recordStudentPurchase({
                email: entity.email || "",
                fullName: entity.notes?.name || "",
                phone: entity.contact || null,
                programSlug: entity.notes?.program || "",
                amount: entity.amount ? entity.amount / 100 : 0,
                currency: entity.currency || "INR",
                provider: "razorpay",
                paymentRef: entity.id,
              });
            } else if (eventType === "payment.failed") {
              await recordPaymentFailure({
                paymentRef: entity.id,
                email: entity.email,
                reason: entity.error_description || "Payment failed",
                provider: "razorpay",
              });
            } else if (eventType === "refund.processed") {
              const refund = payload.payload?.refund?.entity || {};
              await recordPaymentRefund({
                paymentRef: refund.payment_id || entity.id,
                refundId: refund.id,
                amount: refund.amount ? refund.amount / 100 : 0,
                currency: refund.currency || "INR",
                provider: "razorpay",
              });
            }

            return new Response(JSON.stringify({ status: "success", provider: "razorpay" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          } catch {
            return new Response("Error parsing Razorpay payload", { status: 400 });
          }
        }

        // 2. Stripe Webhook Handler
        if (!stripeSignature) {
          return new Response("Missing payment webhook signature header", { status: 400 });
        }

        let event: { type: string; data: { object: Record<string, any> } };
        try {
          event = await verifyWebhook(request, stripeEnv);
        } catch (err: any) {
          return new Response(`Invalid webhook signature: ${err.message}`, { status: 401 });
        }

        try {
          // Success Event
          if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            if (session["payment_status"] === "paid") {
              await recordStudentPurchase({
                email: session["customer_details"]?.email ?? "",
                fullName: session["customer_details"]?.name ?? "",
                phone: session["customer_details"]?.phone ?? null,
                programSlug: session["metadata"]?.program ?? "",
                programLabel: session["metadata"]?.program ?? "",
                amount: session["amount_total"] != null ? session["amount_total"] / 100 : 0,
                currency: (session["currency"] || "USD").toUpperCase(),
                provider: "stripe",
                paymentRef: session["id"],
              });
            }
          }

          // Failure Event
          else if (event.type === "payment_intent.payment_failed") {
            const intent = event.data.object;
            await recordPaymentFailure({
              paymentRef: intent["id"],
              email: intent["receipt_email"],
              reason: intent["last_payment_error"]?.message || "Card declined or failed",
              provider: "stripe",
            });
          }

          // Refund Event
          else if (event.type === "charge.refunded") {
            const charge = event.data.object;
            const refund = charge["refunds"]?.data?.[0];
            await recordPaymentRefund({
              paymentRef: charge["id"],
              refundId: refund?.id || "ref_unknown",
              amount: charge["amount_refunded"] ? charge["amount_refunded"] / 100 : 0,
              currency: (charge["currency"] || "USD").toUpperCase(),
              provider: "stripe",
            });
          }

          // Cancelled / Expired Event
          else if (event.type === "checkout.session.expired") {
            const session = event.data.object;
            console.log(`[CHECKOUT_CANCELLED_OR_EXPIRED] Session ${session["id"]} expired without payment.`);
          }
        } catch (err) {
          console.error("Webhook processing error:", err);
        }

        return new Response(JSON.stringify({ received: true, provider: "stripe" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
