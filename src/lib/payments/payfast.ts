import crypto from "crypto";
import { CreatePaymentInput, PaymentProvider, PaymentResult } from "./provider";

/**
 * PayFast (payfast.co.za / payfast.io) integration.
 *
 * Flow:
 * 1. createPayment() builds the signed field set PayFast requires.
 * 2. The checkout page auto-submits a POST form with these fields to
 *    PAYFAST_HOST (sandbox or live) — PayFast then redirects the buyer
 *    back to return_url / cancel_url, and separately POSTs an ITN
 *    (Instant Transaction Notification) to notify_url.
 * 3. verifyWebhook() re-computes the signature and re-validates the
 *    postback against PayFast's own /eng/query/validate endpoint before
 *    trusting it (this server-to-server round trip is required for
 *    PayFast merchant approval, not optional).
 *
 * Required env vars:
 *   PAYFAST_MERCHANT_ID
 *   PAYFAST_MERCHANT_KEY
 *   PAYFAST_PASSPHRASE   (set on your PayFast account under Integration)
 *   PAYFAST_MODE         "sandbox" | "live"
 *   NEXT_PUBLIC_SITE_URL (used to build return/cancel/notify URLs)
 */

const HOSTS = {
  sandbox: "https://sandbox.payfast.co.za/eng/process",
  live: "https://www.payfast.co.za/eng/process",
};

const VALIDATE_HOSTS = {
  sandbox: "https://sandbox.payfast.co.za/eng/query/validate",
  live: "https://www.payfast.co.za/eng/query/validate",
};

function mode(): "sandbox" | "live" {
  return process.env.PAYFAST_MODE === "live" ? "live" : "sandbox";
}

// PayFast requires fields in the exact order they were added (not alphabetical),
// URL-encoded with spaces as '+', and passphrase appended last.
function buildSignature(fields: Record<string, string>): string {
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  let pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v.toString().trim()).replace(/%20/g, "+")}`);

  let str = pairs.join("&");
  if (passphrase) {
    str += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }
  return crypto.createHash("md5").update(str).digest("hex");
}

export interface PayFastFields {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  m_payment_id: string; // our internal order id
  amount: string; // e.g. "150.00"
  item_name: string;
  item_description?: string;
  signature: string;
}

export class PayFastProvider implements PaymentProvider {
  /** Builds the field set + signature for the auto-submit checkout form. */
  buildRedirectFields(input: {
    orderId: string;
    amount: number; // in whole currency units, e.g. 150.00
    itemName: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }): PayFastFields {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const base: Omit<PayFastFields, "signature"> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || "",
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || "",
      return_url: `${siteUrl}/checkout/success?order=${input.orderId}`,
      cancel_url: `${siteUrl}/checkout/cancel?order=${input.orderId}`,
      notify_url: `${siteUrl}/api/webhooks/payfast`,
      name_first: input.firstName,
      name_last: input.lastName,
      email_address: input.email,
      m_payment_id: input.orderId,
      amount: input.amount.toFixed(2),
      item_name: input.itemName,
    };

    const signature = buildSignature(base as unknown as Record<string, string>);
    return { ...base, signature };
  }

  getProcessUrl(): string {
    return HOSTS[mode()];
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    // Actual redirect happens client-side via the auto-submit form built
    // from buildRedirectFields(); this just records the pending state.
    return {
      providerRef: input.orderId,
      status: "pending",
      redirectUrl: this.getProcessUrl(),
    };
  }

  /**
   * Validates an incoming ITN postback:
   * 1. Recomputes the signature from the posted fields.
   * 2. Re-posts the raw body back to PayFast's validate endpoint —
   *    PayFast must respond "VALID" (server-to-server double-check).
   */
  async verifyWebhook(rawBody: string, signature: string): Promise<boolean> {
    const params = new URLSearchParams(rawBody);
    const fields: Record<string, string> = {};
    params.forEach((value, key) => {
      if (key !== "signature") fields[key] = value;
    });

    const expected = buildSignature(fields);
    if (expected !== signature) return false;

    try {
      const res = await fetch(VALIDATE_HOSTS[mode()], {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: rawBody,
      });
      const text = await res.text();
      return text.trim() === "VALID";
    } catch {
      return false;
    }
  }
}
