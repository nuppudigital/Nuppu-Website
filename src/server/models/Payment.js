/**
 * PAYMENT MODEL (GDPR-minimised)
 *
 * Stores only what's needed to reconcile Paytrail payments and fulfil the
 * booking, plus statutory bookkeeping. No card numbers, CVV, or bank
 * credentials are ever stored - with Paytrail's redirect-based checkout flow
 * they never reach this server, so there is nothing here to encrypt or leak.
 *
 * Retention: Finnish accounting law (Kirjanpitolaki 1336/1997) requires
 * bookkeeping records to be kept for 6 years from the end of the fiscal year.
 * `retentionExpiresAt` is set at creation time. After it passes, records are
 * ANONYMISED (customerName/customerEmail cleared), not deleted, preserving the
 * accounting trail while removing personal data. See GDPR-NOTES.md.
 *
 * ASSUMPTION FLAGGED: retention is computed from a calendar-year fiscal year
 * (Jan 1 - Dec 31). If Nuppu's actual fiscal year differs, update
 * computeRetentionExpiry() below - this is a business/accounting decision the
 * company's bookkeeper should confirm.
 */

import mongoose from "mongoose";

export const RETENTION_YEARS = 6;

/**
 * Compute the retention expiry timestamp for a payment made on `date`.
 * Runs from the end of the fiscal year in which the payment occurred.
 */
export function computeRetentionExpiry(date = new Date()) {
  const fiscalYearEnd = new Date(Date.UTC(date.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
  fiscalYearEnd.setUTCFullYear(fiscalYearEnd.getUTCFullYear() + RETENTION_YEARS);
  return fiscalYearEnd;
}

const paymentSchema = new mongoose.Schema(
  {
    paytrailTransactionId: { type: String, required: true, unique: true },
    paytrailReference: { type: String, required: true },
    service: { type: String, enum: ["emotional-support"], required: true },
    amountCents: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "failed", "refunded"],
      default: "pending",
    },
    customerName: { type: String, required: true, maxlength: 100 },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    // Optional - only collected if the customer wants an SMS receipt. Stored in
    // E.164 format (e.g. +358401234567). Same GDPR anonymisation as name/email.
    customerPhone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    // Required at the API layer (see POST /api/payments/create) - what
    // product/package the customer wants, so the team can prepare before the
    // consultation instead of finding out after payment.
    customerMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // No payment card, bank account, or Paytrail-side PII beyond what's needed for support/refunds
    paidAt: { type: Date },
    retentionExpiresAt: { type: Date, required: true },
    // Set once a data-subject erasure request or the retention TTL anonymises the record.
    anonymizedAt: { type: Date },
  },
  { timestamps: true },
);

paymentSchema.statics.computeRetentionExpiry = computeRetentionExpiry;

export const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
