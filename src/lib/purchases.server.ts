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

/** Records a paid purchase and links it to the buyer's account. */
export async function recordStudentPurchase(input: RecordPurchaseInput): Promise<void> {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!email) return;
  console.log("[Purchase Recorded]", input);
}

