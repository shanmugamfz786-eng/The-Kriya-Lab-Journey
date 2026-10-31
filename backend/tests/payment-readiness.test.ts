import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "crypto";
import {
  toSmallestCurrencyUnit,
  fromSmallestCurrencyUnit,
  calculateAuthoritativePrice,
  validateGatewayPaymentRules,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
  verifyStripeWebhookSignature,
  PaymentIdempotencyManager,
  SUPPORTED_CURRENCIES,
} from "../src/services/payment/payment-verifier.service.js";

describe("Payment Gateway Integration Readiness Audit Suite", () => {
  const TEST_RAZORPAY_SECRET = "rzp_test_secret_99887766";
  const TEST_STRIPE_WEBHOOK_SECRET = "whsec_stripe_test_secret_1122334455";

  // =========================================================================
  // 1. SMALLEST CURRENCY UNIT CONVERSIONS (Paise, Cents, Pence, Fils)
  // =========================================================================
  describe("1. Currency Smallest Unit Conversions (Zero-Loss Precision)", () => {
    it("converts INR to paise (factor 100)", () => {
      assert.equal(toSmallestCurrencyUnit(4999, "INR"), 499900);
      assert.equal(fromSmallestCurrencyUnit(499900, "INR"), 4999);
    });

    it("converts USD to cents (factor 100)", () => {
      assert.equal(toSmallestCurrencyUnit(59, "USD"), 5900);
      assert.equal(fromSmallestCurrencyUnit(5900, "USD"), 59);
    });

    it("converts GBP to pence (factor 100)", () => {
      assert.equal(toSmallestCurrencyUnit(47, "GBP"), 4700);
      assert.equal(fromSmallestCurrencyUnit(4700, "GBP"), 47);
    });

    it("converts SGD to cents (factor 100)", () => {
      assert.equal(toSmallestCurrencyUnit(79, "SGD"), 7900);
      assert.equal(fromSmallestCurrencyUnit(7900, "SGD"), 79);
    });

    it("converts AED to fils (factor 100)", () => {
      assert.equal(toSmallestCurrencyUnit(219, "AED"), 21900);
      assert.equal(fromSmallestCurrencyUnit(21900, "AED"), 219);
    });

    it("handles decimal fractional amounts with banker rounding", () => {
      assert.equal(toSmallestCurrencyUnit(59.99, "USD"), 5999);
      assert.equal(toSmallestCurrencyUnit(47.50, "GBP"), 4750);
      assert.equal(toSmallestCurrencyUnit(219.25, "AED"), 21925);
    });

    it("rejects invalid or negative amounts", () => {
      assert.throws(() => toSmallestCurrencyUnit(-10, "USD"), /Invalid amount/);
      assert.throws(() => toSmallestCurrencyUnit(NaN, "INR"), /Invalid amount/);
    });
  });

  // =========================================================================
  // 2. STRIPE WEBHOOK SIGNATURE & SECURITY AUDIT
  // =========================================================================
  describe("2. Stripe Webhook Signature Security", () => {
    const rawPayload = JSON.stringify({
      id: "evt_test_123",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_session_123",
          payment_status: "paid",
          amount_total: 5900,
          currency: "usd",
          customer_details: { email: "student@example.com", name: "Ananya Sharma" },
          metadata: { program: "prg_1" },
        },
      },
    });

    it("passes verification for a valid Stripe signature within tolerance window", () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const signatureHmac = createHmac("sha256", TEST_STRIPE_WEBHOOK_SECRET)
        .update(`${nowSec}.${rawPayload}`)
        .digest("hex");
      const signatureHeader = `t=${nowSec},v1=${signatureHmac}`;

      const res = verifyStripeWebhookSignature({
        rawBody: rawPayload,
        signatureHeader,
        webhookSecret: TEST_STRIPE_WEBHOOK_SECRET,
        currentTimestampSeconds: nowSec,
      });

      assert.equal(res.valid, true);
      assert.equal(res.reason, undefined);
    });

    it("rejects tampered payload even with 1 character modified", () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const signatureHmac = createHmac("sha256", TEST_STRIPE_WEBHOOK_SECRET)
        .update(`${nowSec}.${rawPayload}`)
        .digest("hex");
      const signatureHeader = `t=${nowSec},v1=${signatureHmac}`;

      const tamperedPayload = rawPayload.replace("prg_1", "prg_3");

      const res = verifyStripeWebhookSignature({
        rawBody: tamperedPayload,
        signatureHeader,
        webhookSecret: TEST_STRIPE_WEBHOOK_SECRET,
        currentTimestampSeconds: nowSec,
      });

      assert.equal(res.valid, false);
      assert.equal(res.reason, "Invalid Stripe signature");
    });

    it("rejects replay attacks older than 300 seconds (5 minutes)", () => {
      const pastTime = Math.floor(Date.now() / 1000) - 305; // 305s in past
      const signatureHmac = createHmac("sha256", TEST_STRIPE_WEBHOOK_SECRET)
        .update(`${pastTime}.${rawPayload}`)
        .digest("hex");
      const signatureHeader = `t=${pastTime},v1=${signatureHmac}`;

      const res = verifyStripeWebhookSignature({
        rawBody: rawPayload,
        signatureHeader,
        webhookSecret: TEST_STRIPE_WEBHOOK_SECRET,
        currentTimestampSeconds: Math.floor(Date.now() / 1000),
      });

      assert.equal(res.valid, false);
      assert.match(res.reason!, /outside tolerance window/);
    });

    it("rejects missing or malformed signature header", () => {
      const missing = verifyStripeWebhookSignature({
        rawBody: rawPayload,
        signatureHeader: null,
        webhookSecret: TEST_STRIPE_WEBHOOK_SECRET,
      });
      assert.equal(missing.valid, false);
      assert.equal(missing.reason, "Missing stripe-signature header");

      const malformed = verifyStripeWebhookSignature({
        rawBody: rawPayload,
        signatureHeader: "invalid_sig_without_v1",
        webhookSecret: TEST_STRIPE_WEBHOOK_SECRET,
      });
      assert.equal(malformed.valid, false);
      assert.equal(malformed.reason, "Invalid Stripe signature format");
    });
  });

  // =========================================================================
  // 3. RAZORPAY SIGNATURE & WEBHOOK AUDIT
  // =========================================================================
  describe("3. Razorpay Payment and Webhook Signature Security", () => {
    it("validates authentic client callback HMAC-SHA256 signature (orderId|paymentId)", () => {
      const orderId = "order_N123456789";
      const paymentId = "pay_N987654321";
      const validSignature = createHmac("sha256", TEST_RAZORPAY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const res = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: validSignature,
        keySecret: TEST_RAZORPAY_SECRET,
      });

      assert.equal(res.valid, true);
    });

    it("rejects forged or tampered client callback signature", () => {
      const orderId = "order_N123456789";
      const paymentId = "pay_N987654321";
      const forgedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

      const res = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: forgedSignature,
        keySecret: TEST_RAZORPAY_SECRET,
      });

      assert.equal(res.valid, false);
      assert.equal(res.reason, "Invalid Razorpay payment signature");
    });

    it("rejects payment verification when paymentId is tampered", () => {
      const orderId = "order_N123456789";
      const genuinePaymentId = "pay_genuine_111";
      const attackerPaymentId = "pay_attacker_999";
      const signature = createHmac("sha256", TEST_RAZORPAY_SECRET)
        .update(`${orderId}|${genuinePaymentId}`)
        .digest("hex");

      const res = verifyRazorpayPaymentSignature({
        orderId,
        paymentId: attackerPaymentId,
        signature,
        keySecret: TEST_RAZORPAY_SECRET,
      });

      assert.equal(res.valid, false);
    });

    it("validates Razorpay webhook raw body HMAC-SHA256 signature", () => {
      const webhookPayload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_captured_777",
              amount: 499900,
              currency: "INR",
              status: "captured",
              email: "student@example.com",
            },
          },
        },
      });

      const validWebhookSignature = createHmac("sha256", TEST_RAZORPAY_SECRET)
        .update(webhookPayload)
        .digest("hex");

      const res = verifyRazorpayWebhookSignature({
        rawBody: webhookPayload,
        signatureHeader: validWebhookSignature,
        webhookSecret: TEST_RAZORPAY_SECRET,
      });

      assert.equal(res.valid, true);
    });

    it("rejects tampered Razorpay webhook payload", () => {
      const webhookPayload = JSON.stringify({ event: "payment.captured", id: "pay_1" });
      const signature = createHmac("sha256", TEST_RAZORPAY_SECRET).update(webhookPayload).digest("hex");
      const tamperedPayload = JSON.stringify({ event: "payment.captured", id: "pay_2" });

      const res = verifyRazorpayWebhookSignature({
        rawBody: tamperedPayload,
        signatureHeader: signature,
        webhookSecret: TEST_RAZORPAY_SECRET,
      });

      assert.equal(res.valid, false);
    });
  });

  // =========================================================================
  // 4. SERVER-SIDE AUTHORITATIVE CATALOG & PRICE TAMPERING PREVENTION
  // =========================================================================
  describe("4. Price Tampering Prevention & Authoritative Catalog", () => {
    it("calculates server-authoritative price regardless of client input", () => {
      const result = calculateAuthoritativePrice({
        programSlug: "prg_1",
        currency: "INR",
        participantCount: 1,
      });

      assert.equal(result.unitPrice, 4999);
      assert.equal(result.totalAmount, 4999);
      assert.equal(result.smallestUnitAmount, 499900);
      assert.equal(result.currency, "INR");
    });

    it("multiplies authoritative unit price by participant count correctly", () => {
      const result = calculateAuthoritativePrice({
        programSlug: "prg_1",
        currency: "USD",
        participantCount: 3,
      });

      assert.equal(result.unitPrice, 59);
      assert.equal(result.participantCount, 3);
      assert.equal(result.totalAmount, 177); // 59 * 3
      assert.equal(result.smallestUnitAmount, 17700);
      assert.equal(result.currency, "USD");
    });

    it("rejects invalid program slug", () => {
      assert.throws(
        () => calculateAuthoritativePrice({ programSlug: "prg_hacked_free", currency: "INR" }),
        /Unknown program slug/
      );
    });

    it("rejects unsupported currency", () => {
      assert.throws(
        () => calculateAuthoritativePrice({ programSlug: "prg_1", currency: "BITCOIN" }),
        /Unsupported payment currency/
      );
    });
  });

  // =========================================================================
  // 5. GATEWAY CURRENCY RULES & RESTRICTIONS (UPI / NETBANKING)
  // =========================================================================
  describe("5. Payment Method & Currency Rules", () => {
    it("allows Razorpay UPI for INR currency", () => {
      const res = validateGatewayPaymentRules({
        gateway: "razorpay",
        paymentMethod: "upi",
        currency: "INR",
      });
      assert.equal(res.allowed, true);
      assert.equal(res.settlementCurrency, "INR");
    });

    it("blocks Razorpay UPI for international currencies (USD, GBP, SGD, AED) and enforces INR settlement", () => {
      for (const curr of ["USD", "GBP", "SGD", "AED"]) {
        const res = validateGatewayPaymentRules({
          gateway: "razorpay",
          paymentMethod: "upi",
          currency: curr,
        });
        assert.equal(res.allowed, false);
        assert.equal(res.settlementCurrency, "INR");
        assert.match(res.reason!, /exclusively support INR settlement/);
      }
    });

    it("allows Card payments across all 5 supported currencies on Razorpay and Stripe", () => {
      for (const curr of SUPPORTED_CURRENCIES) {
        const stripeRes = validateGatewayPaymentRules({
          gateway: "stripe",
          paymentMethod: "card",
          currency: curr,
        });
        assert.equal(stripeRes.allowed, true);

        const rzpRes = validateGatewayPaymentRules({
          gateway: "razorpay",
          paymentMethod: "card",
          currency: curr,
        });
        assert.equal(rzpRes.allowed, true);
      }
    });
  });

  // =========================================================================
  // 6. IDEMPOTENCY & DUPLICATE PAYMENT PREVENTION
  // =========================================================================
  describe("6. Idempotency & Duplicate Payment Prevention", () => {
    let idempotency: PaymentIdempotencyManager;

    beforeEach(() => {
      idempotency = new PaymentIdempotencyManager();
    });

    it("records initial payment success and identifies replay as duplicate", () => {
      const paymentRef = "pay_unique_test_443322";

      const firstAttempt = idempotency.recordSuccess({
        paymentRef,
        email: "student@example.com",
        amount: 4999,
        currency: "INR",
      });
      assert.equal(firstAttempt.recorded, true);
      assert.equal(firstAttempt.duplicate, false);
      assert.equal(idempotency.isProcessed(paymentRef), true);

      // Replay attempt with same payment ref
      const secondAttempt = idempotency.recordSuccess({
        paymentRef,
        email: "student@example.com",
        amount: 4999,
        currency: "INR",
      });
      assert.equal(secondAttempt.recorded, true);
      assert.equal(secondAttempt.duplicate, true); // Flagged as duplicate, skipping double-credit
    });

    it("handles refunds idempotently", () => {
      const paymentRef = "pay_test_refund_target";
      const refund1 = idempotency.recordRefund({
        paymentRef,
        refundId: "rfnd_001",
        amount: 4999,
      });
      assert.equal(refund1.recorded, true);
      assert.equal(refund1.duplicate, false);

      const refund2 = idempotency.recordRefund({
        paymentRef,
        refundId: "rfnd_002",
        amount: 4999,
      });
      assert.equal(refund2.recorded, true);
      assert.equal(refund2.duplicate, true);

      assert.equal(idempotency.getRefund(paymentRef)?.refundId, "rfnd_001");
    });

    it("records failure without flagging payment as processed", () => {
      const failedRef = "pay_failed_declined_card";
      const failRes = idempotency.recordFailure({
        paymentRef: failedRef,
        email: "declined@example.com",
        reason: "Insufficient funds / card declined",
      });

      assert.equal(failRes.recorded, true);
      assert.equal(idempotency.isProcessed(failedRef), false); // Still not marked as paid!
    });
  });

  // =========================================================================
  // 7. REALISTIC MULTI-COUNTRY CHECKOUT MAPPING AUDIT
  // =========================================================================
  describe("7. Multi-Country Checkout Consistency Audit (All 5 Target Countries)", () => {
    const testMatrix = [
      { country: "India", code: "IN", currency: "INR", expectedAmount: 4999, expectedSmallestUnit: 499900 },
      { country: "USA", code: "US", currency: "USD", expectedAmount: 59, expectedSmallestUnit: 5900 },
      { country: "UK", code: "GB", currency: "GBP", expectedAmount: 47, expectedSmallestUnit: 4700 },
      { country: "Singapore", code: "SG", currency: "SGD", expectedAmount: 79, expectedSmallestUnit: 7900 },
      { country: "UAE", code: "AE", currency: "AED", expectedAmount: 219, expectedSmallestUnit: 21900 },
    ];

    for (const item of testMatrix) {
      it(`verifies ${item.country} (${item.code}) uses ${item.currency} with exact amount ${item.expectedAmount} and unit ${item.expectedSmallestUnit}`, () => {
        const result = calculateAuthoritativePrice({
          programSlug: "prg_1",
          currency: item.currency,
          participantCount: 1,
        });

        assert.equal(result.currency, item.currency);
        assert.equal(result.totalAmount, item.expectedAmount);
        assert.equal(result.smallestUnitAmount, item.expectedSmallestUnit);
      });
    }
  });
});

