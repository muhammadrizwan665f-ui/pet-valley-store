/**
 * Payment provider abstraction.
 *
 * The checkout flow calls this interface, never a specific SDK directly.
 * PayFast is the configured implementation (see ./payfast.ts). To add
 * another processor later, implement this same interface and switch it
 * in via the PAYMENT_PROVIDER env var — no checkout code changes needed.
 */

export interface CreatePaymentInput {
  orderId: string;
  amount: number; // in smallest currency unit (cents)
  currency: string;
}

export interface PaymentResult {
  providerRef: string;
  status: "pending" | "authorized" | "paid" | "failed";
  redirectUrl?: string;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  verifyWebhook(rawBody: string, signature: string): Promise<boolean>;
}

// Placeholder used only if PAYMENT_PROVIDER is unset or unrecognized.
// It never fabricates a "success" — it throws so nothing silently
// pretends to work, and tells you which env vars PayFast needs.
export class UnconfiguredPaymentProvider implements PaymentProvider {
  async createPayment(): Promise<PaymentResult> {
    throw new Error(
      "No payment provider configured. Set PAYMENT_PROVIDER=payfast and " +
        "PAYFAST_MERCHANT_ID / PAYFAST_MERCHANT_KEY / PAYFAST_PASSPHRASE in your environment."
    );
  }
  async verifyWebhook(): Promise<boolean> {
    return false;
  }
}

import { PayFastProvider } from "./payfast";

export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    case "payfast":
      return new PayFastProvider();
    default:
      return new UnconfiguredPaymentProvider();
  }
}
