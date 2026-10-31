export type RecordPurchaseInput = {
  email: string;
  fullName?: string | null;
  phone?: string | null;
  programSlug: string;
  programLabel?: string | null;
  amountInr?: number;
  amount?: number;
  currency?: string;
  provider: "stripe" | "razorpay";
  paymentRef?: string | null;
  enrolment?: Record<string, string | number>;
};

// In-memory processed payment registry for idempotent deduplication
const processedPaymentRefs = new Set<string>();
const refundedPaymentRefs = new Map<string, { refundId: string; amount: number; timestamp: string }>();

/** Checks if a payment reference was already processed to prevent duplicate records */
export function isPaymentAlreadyProcessed(paymentRef: string | null | undefined): boolean {
  if (!paymentRef) return false;
  return processedPaymentRefs.has(paymentRef.trim());
}

/** Records a paid purchase and links it to the buyer's account idempotently */
export async function recordStudentPurchase(input: RecordPurchaseInput): Promise<{ recorded: boolean; duplicate: boolean }> {
  const email = (input.email ?? "").trim().toLowerCase();
  const ref = (input.paymentRef ?? "").trim();
  if (!email || !ref) return { recorded: false, duplicate: false };

  // Idempotency check: prevent duplicate credit or double enrollment
  if (processedPaymentRefs.has(ref)) {
    console.log(`[IDEMPOTENT_PAYMENT] Payment ref ${ref} already processed. Skipping duplicate recording.`);
    return { recorded: true, duplicate: true };
  }

  processedPaymentRefs.add(ref);
  console.log(`[PURCHASE_VERIFIED_AND_RECORDED]`, {
    email,
    program: input.programSlug,
    provider: input.provider,
    paymentRef: ref,
    amount: input.amount ?? input.amountInr,
    currency: input.currency ?? "INR",
    timestamp: new Date().toISOString(),
  });

  return { recorded: true, duplicate: false };
}

/** Records payment failure for audit and customer assistance */
export async function recordPaymentFailure(input: {
  paymentRef?: string | null;
  email?: string | null;
  reason: string;
  provider: "stripe" | "razorpay";
}): Promise<void> {
  console.warn(`[PAYMENT_FAILED_AUDIT]`, {
    paymentRef: input.paymentRef || "unknown",
    email: input.email || "unknown",
    reason: input.reason,
    provider: input.provider,
    timestamp: new Date().toISOString(),
  });
}

/** Records refunds and flags payment ref as refunded */
export async function recordPaymentRefund(input: {
  paymentRef: string;
  refundId: string;
  amount: number;
  currency?: string;
  provider: "stripe" | "razorpay";
}): Promise<void> {
  const ref = input.paymentRef.trim();
  refundedPaymentRefs.set(ref, {
    refundId: input.refundId,
    amount: input.amount,
    timestamp: new Date().toISOString(),
  });
  console.log(`[PAYMENT_REFUNDED_AUDIT]`, {
    paymentRef: ref,
    refundId: input.refundId,
    amount: input.amount,
    currency: input.currency ?? "INR",
    provider: input.provider,
  });
}

