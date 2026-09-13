import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/payments.functions";

interface StripeEmbeddedCheckoutProps {
  programSlug: string;
  customerEmail?: string;
  customerName?: string;
  returnUrl: string;
}

export function StripeEmbeddedCheckout({
  programSlug,
  customerEmail,
  customerName,
  returnUrl,
}: StripeEmbeddedCheckoutProps) {
  const fetchClientSecret = async (): Promise<string> => {
    const result = await createCheckoutSession({
      data: {
        programSlug,
        ...(customerEmail && { customerEmail }),
        ...(customerName && { customerName }),
        returnUrl,
        environment: getStripeEnvironment(),
      },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Payment session could not be created");
    return result.clientSecret;
  };

  return (
    <div id="checkout" className="rounded-sm border border-border bg-background p-2">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
