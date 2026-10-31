import { createHmac, timingSafeEqual } from "crypto";

export interface AuthoritativeProgram {
  slug: string;
  label: string;
  amountInr: number;
  amountUsd?: number;
}

export const AUTHORITATIVE_CATALOG: AuthoritativeProgram[] = [
  { slug: "prg_1", label: "Inner Awakening Kriya", amountInr: 4999, amountUsd: 59 },
  { slug: "prg_2", label: "Advanced Pranayama", amountInr: 7999, amountUsd: 99 },
  { slug: "prg_3", label: "Himalayan Retreat", amountInr: 25000, amountUsd: 350 },
  { slug: "prg_4", label: "Foundation Weekend Workshop", amountInr: 1999, amountUsd: 29 },
];

/**
 * Currency smallest unit multipliers according to ISO 4217 standard
 */
export const CURRENCY_SMALLEST_UNIT_FACTORS: Record<string, number> = {
  INR: 100, // 1 INR = 100 paise
  USD: 100, // 1 USD = 100 cents
  GBP: 100, // 1 GBP = 100 pence
  SGD: 100, // 1 SGD = 100 cents
  AED: 100, // 1 AED = 100 fils
  EUR: 100, // 1 EUR = 100 cents
  CAD: 100, // 1 CAD = 100 cents
  AUD: 100, // 1 AUD = 100 cents
  JPY: 1,   // 0 decimals
  KWD: 1000 // 3 decimals
};

export const SUPPORTED_CURRENCIES = ["INR", "USD", "GBP", "SGD", "AED"] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Converts a standard decimal currency amount into the smallest unit (paise, cents, pence, fils)
 */
export function toSmallestCurrencyUnit(amount: number, currency: string): number {
  if (typeof amount !== "number" || isNaN(amount) || amount < 0) {
    throw new Error(`Invalid amount for conversion: ${amount}`);
  }
  const factor = CURRENCY_SMALLEST_UNIT_FACTORS[currency.toUpperCase()] ?? 100;
  return Math.round(amount * factor);
}

/**
 * Converts smallest currency unit back to decimal currency
 */
export function fromSmallestCurrencyUnit(unitAmount: number, currency: string): number {
  if (typeof unitAmount !== "number" || isNaN(unitAmount) || unitAmount < 0) {
    throw new Error(`Invalid unit amount: ${unitAmount}`);
  }
  const factor = CURRENCY_SMALLEST_UNIT_FACTORS[currency.toUpperCase()] ?? 100;
  return Number((unitAmount / factor).toFixed(factor === 1 ? 0 : factor === 1000 ? 3 : 2));
}

/**
 * Calculates authoritative order price on server side, strictly ignoring any client-provided price
 */
export function calculateAuthoritativePrice(params: {
  programSlug: string;
  currency: string;
  participantCount?: number;
}): {
  currency: string;
  unitPrice: number;
  participantCount: number;
  totalAmount: number;
  smallestUnitAmount: number;
} {
  const currency = params.currency.toUpperCase();
  const count = Math.min(20, Math.max(1, Number(params.participantCount) || 1));
  const program = AUTHORITATIVE_CATALOG.find((p) => p.slug === params.programSlug);

  if (!program) {
    throw new Error(`Unknown program slug: ${params.programSlug}`);
  }

  let unitPrice = program.amountInr;
  if (currency === "USD") {
    unitPrice = program.amountUsd ?? Math.round(program.amountInr / 84);
  } else if (currency === "GBP") {
    unitPrice = Math.round(program.amountInr / 106);
  } else if (currency === "SGD") {
    unitPrice = Math.round(program.amountInr / 63);
  } else if (currency === "AED") {
    unitPrice = Math.round(program.amountInr / 22.8);
  } else if (currency !== "INR") {
    throw new Error(`Unsupported payment currency: ${currency}`);
  }

  const totalAmount = unitPrice * count;
  const smallestUnitAmount = toSmallestCurrencyUnit(totalAmount, currency);

  return {
    currency,
    unitPrice,
    participantCount: count,
    totalAmount,
    smallestUnitAmount,
  };
}

/**
 * Validates gateway-specific payment method rules (e.g., UPI strictly requires INR)
 */
export function validateGatewayPaymentRules(params: {
  gateway: "stripe" | "razorpay";
  paymentMethod: "card" | "upi" | "netbanking";
  currency: string;
}): { allowed: boolean; settlementCurrency: string; reason?: string } {
  const currency = params.currency.toUpperCase();

  if (params.gateway === "razorpay") {
    if (params.paymentMethod === "upi" || params.paymentMethod === "netbanking") {
      if (currency !== "INR") {
        return {
          allowed: false,
          settlementCurrency: "INR",
          reason: `${params.paymentMethod.toUpperCase()} payments exclusively support INR settlement.`,
        };
      }
    }
  }

  return {
    allowed: true,
    settlementCurrency: currency,
  };
}

/**
 * Validates Razorpay client-side payment signature: HMAC-SHA256(orderId + "|" + paymentId, secret)
 */
export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): { valid: boolean; reason?: string } {
  const { orderId, paymentId, signature, keySecret } = params;

  if (!orderId || !paymentId || !signature || !keySecret) {
    return { valid: false, reason: "Missing required parameters for Razorpay signature verification" };
  }

  const payload = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", keySecret).update(payload).digest("hex");

  if (expected.length !== signature.length) {
    return { valid: false, reason: "Signature length mismatch" };
  }

  const match = timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  return { valid: match, reason: match ? undefined : "Invalid Razorpay payment signature" };
}

/**
 * Validates Razorpay webhook signature: HMAC-SHA256(rawBody, webhookSecret)
 */
export function verifyRazorpayWebhookSignature(params: {
  rawBody: string;
  signatureHeader: string | null | undefined;
  webhookSecret: string;
}): { valid: boolean; reason?: string } {
  const { rawBody, signatureHeader, webhookSecret } = params;

  if (!signatureHeader) {
    return { valid: false, reason: "Missing x-razorpay-signature header" };
  }
  if (!webhookSecret) {
    return { valid: false, reason: "Razorpay webhook secret not configured" };
  }

  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  if (expected.length !== signatureHeader.length) {
    return { valid: false, reason: "Signature length mismatch" };
  }

  const match = timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  return { valid: match, reason: match ? undefined : "Invalid Razorpay webhook signature" };
}

/**
 * Validates Stripe webhook signature with timestamped HMAC-SHA256 and replay protection
 */
export function verifyStripeWebhookSignature(params: {
  rawBody: string;
  signatureHeader: string | null | undefined;
  webhookSecret: string;
  toleranceSeconds?: number;
  currentTimestampSeconds?: number;
}): { valid: boolean; reason?: string } {
  const {
    rawBody,
    signatureHeader,
    webhookSecret,
    toleranceSeconds = 300,
    currentTimestampSeconds = Math.floor(Date.now() / 1000),
  } = params;

  if (!signatureHeader) {
    return { valid: false, reason: "Missing stripe-signature header" };
  }
  if (!webhookSecret) {
    return { valid: false, reason: "Stripe webhook secret not configured" };
  }

  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const part of signatureHeader.split(",")) {
    const [key, val] = part.trim().split("=", 2);
    if (key === "t" && val) {
      timestamp = parseInt(val, 10);
    } else if (key === "v1" && val) {
      signatures.push(val);
    }
  }

  if (!timestamp || isNaN(timestamp) || signatures.length === 0) {
    return { valid: false, reason: "Invalid Stripe signature format" };
  }

  // Replay attack protection (tolerance window)
  const age = Math.abs(currentTimestampSeconds - timestamp);
  if (age > toleranceSeconds) {
    return { valid: false, reason: `Timestamp outside tolerance window (${age}s > ${toleranceSeconds}s)` };
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = createHmac("sha256", webhookSecret).update(signedPayload).digest("hex");

  const valid = signatures.some((sig) => {
    if (sig.length !== expectedSignature.length) return false;
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature));
  });

  return { valid, reason: valid ? undefined : "Invalid Stripe signature" };
}

/**
 * Idempotent Payment Processor to eliminate duplicate charges and double credits
 */
export class PaymentIdempotencyManager {
  private processedRefs = new Set<string>();
  private failedRefs = new Set<string>();
  private refundedRefs = new Map<string, { refundId: string; amount: number; timestamp: string }>();

  public isProcessed(paymentRef: string): boolean {
    return this.processedRefs.has(paymentRef.trim());
  }

  public recordSuccess(params: {
    paymentRef: string;
    email: string;
    amount: number;
    currency: string;
  }): { recorded: boolean; duplicate: boolean } {
    const ref = params.paymentRef.trim();
    if (this.processedRefs.has(ref)) {
      return { recorded: true, duplicate: true };
    }
    this.processedRefs.add(ref);
    return { recorded: true, duplicate: false };
  }

  public recordFailure(params: {
    paymentRef: string;
    email?: string;
    reason: string;
  }): { recorded: boolean } {
    const ref = params.paymentRef.trim();
    this.failedRefs.add(ref);
    return { recorded: true };
  }

  public recordRefund(params: {
    paymentRef: string;
    refundId: string;
    amount: number;
  }): { recorded: boolean; duplicate: boolean } {
    const ref = params.paymentRef.trim();
    if (this.refundedRefs.has(ref)) {
      return { recorded: true, duplicate: true };
    }
    this.refundedRefs.set(ref, {
      refundId: params.refundId,
      amount: params.amount,
      timestamp: new Date().toISOString(),
    });
    return { recorded: true, duplicate: false };
  }

  public getRefund(paymentRef: string) {
    return this.refundedRefs.get(paymentRef.trim());
  }

  public clear(): void {
    this.processedRefs.clear();
    this.failedRefs.clear();
    this.refundedRefs.clear();
  }
}

