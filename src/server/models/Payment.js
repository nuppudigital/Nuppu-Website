// No card numbers/CVV/bank details ever land here - Paytrail's redirect checkout
// keeps those away from our server entirely, so this is just enough to reconcile
// payments and satisfy bookkeeping law.
//
// Kirjanpitolaki (Finnish accounting law) requires records kept 6 years from fiscal
// year end. retentionExpiresAt gets set at creation; once it passes we anonymise
// (clear name/email) instead of deleting, so the accounting trail survives. See
// GDPR-NOTES.md.
//
// note: computeRetentionExpiry assumes a Jan-Dec fiscal year - double check with
// whoever does the books if that's not actually Nuppu's fiscal year.

import mongoose from "mongoose";

export const RETENTION_YEARS = 6;

// retention runs from the end of the fiscal year the payment happened in
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
    // only collected for SMS receipts, E.164 format (+358401234567), same anonymisation as name/email
    customerPhone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    // what the customer wants, so the team can prep before the call, not after payment
    customerMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // the booked slot's UTC instant - see src/server/availability/slots.js for how it's computed
    scheduledAt: { type: Date, required: true },
    paidAt: { type: Date },
    retentionExpiresAt: { type: Date, required: true },
    anonymizedAt: { type: Date }, // set once erasure or the retention TTL anonymises this record
  },
  { timestamps: true },
);

// belt-and-suspenders double-booking guard, on top of the app-level availability check -
// the $exists clause matters: without it this collides against every pre-scheduling paid
// row (they all lack scheduledAt, which Mongo treats as the same null for uniqueness) and
// fails to build on every cold start
paymentSchema.index(
  { service: 1, scheduledAt: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["pending", "paid"] }, scheduledAt: { $exists: true } } },
);

paymentSchema.statics.computeRetentionExpiry = computeRetentionExpiry;

export const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
