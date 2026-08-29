// Backing store for admin sign-in (OTP + session) and request rate-limits.
//
// These used to live in plain in-process Map()s in api/index.js. That breaks on
// serverless (Vercel): concurrent lambda instances and cold starts don't share
// memory, so an admin's session token or OTP attempt could land on an instance
// that never saw it get created, and rate limits could be bypassed by simply
// hitting a different instance. Storing them here instead makes them shared and
// durable across instances. TTL indexes let Mongo garbage-collect expired rows
// on its own - the app still treats anything past `expiresAt` as invalid itself
// (via Date.now() checks), the TTL index is just cleanup.
//
// api/index.js falls back to in-memory storage when Mongo isn't connected
// (local dev without a database running) - these models are only used when
// mongoose.connection.readyState === 1.

import mongoose from "mongoose";

const adminOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  code: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
adminOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AdminOtp = mongoose.model("AdminOtp", adminOtpSchema);

const adminSessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AdminSession = mongoose.model("AdminSession", adminSessionSchema);

// generic bucket for the sliding-window rate limiters (OTP request/verify,
// contact form, payment creation, admin routes, ...) - `key` already encodes
// which limiter and which time bucket, e.g. "otp-verify:203.0.113.4:29123456"
const rateLimitHitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
rateLimitHitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitHit = mongoose.model("RateLimitHit", rateLimitHitSchema);
