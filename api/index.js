import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";
import crypto from "node:crypto";
import path from "node:path";
import dns from "node:dns";
import { fileURLToPath } from "node:url";
import { Payment, computeRetentionExpiry } from "../src/server/models/Payment.js";

// Node's built-in DNS resolver can fail SRV lookups (needed for
// mongodb+srv:// URIs) against some network setups - e.g. a mobile hotspot
// handing out a link-local IPv6 nameserver - even when the OS's own resolver
// succeeds fine. Forcing a well-known public resolver avoids that class of
// failure in both local dev and production, with no real downside.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { AvailabilityBlock } from "../src/server/models/AvailabilityBlock.js";
// paytrailClient also exports getPaymentStatus, not used here yet - webhook signature
// verification is enough auth for updating status below, but it'd be handy for an
// admin "re-sync from Paytrail" button someday
import {
  createPayment as createPaytrailPayment,
  verifyCallbackSignature,
  usingTestCredentials as paytrailUsingTestCredentials,
} from "../src/server/payments/paytrailClient.js";
import {
  computeSlotStatuses,
  isSlotBookable,
  reclaimExpiredHold,
  formatHelsinkiSlot,
} from "../src/server/availability/slots.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = Number(process.env.PORT ?? 5050);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/nuppu";
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
// Admins who can sign into the dashboard with an emailed one-time code
// instead of pasting ADMIN_TOKEN directly. Comma-separated; the default
// covers the current admin team so this works even before this env var is
// set on a given host.
const ADMIN_OTP_EMAILS = (
  process.env.ADMIN_OTP_EMAILS ?? "laura@nuppuapp.fi,emmi@nuppuapp.fi,nuppudigital@gmail.com"
)
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
// Vercel Cron sends this as a Bearer token automatically once CRON_SECRET is set as
// an env var - that's what authorises the daily retention/anonymisation sweep.
const CRON_SECRET = process.env.CRON_SECRET;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const MONGODB_REQUIRED = process.env.MONGODB_REQUIRED === "true";
const NUPPU_EMAIL = process.env.NUPPU_EMAIL ?? "info@nuppuapp.fi";
// Notified alongside NUPPU_EMAIL specifically when a consultation booking is
// paid, e.g. whoever manages the booking calendar - not on general contact
// form submissions. Comma-separated for multiple recipients.
const BOOKING_NOTIFY_EMAILS = (process.env.BOOKING_NOTIFY_EMAIL ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);
const MAIL_FROM = process.env.MAIL_FROM ?? "noreply@nuppu.app";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const canSendEmail = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

// TWILIO_FROM_NUMBER should be a plain purchased number, not a branded alphanumeric
// sender name - Traficom now requires those to be pre-registered for Finnish numbers
// (Order 28 L/2025) or they get shown as "Tuntematon"/blocked as spam. A normal
// number sidesteps all of that.
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const canSendSms = Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
const smsClient = canSendSms ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;
if (!canSendSms) {
  console.warn(
    "SMS receipts disabled: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER to enable them.",
  );
}

let server;

const allowedOrigins = new Set([
  CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // admin-dashboard's dev server - Vite bumps to 5174 when 5173 is taken. Not needed
  // in prod since it's served same-origin from /admin there.
  "http://localhost:5174",
  "http://127.0.0.1:5174",
]);

const mailTransport = canSendEmail
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: false,
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// belt-and-suspenders - Vercel already sets HSTS at the edge for the static frontend,
// but this covers direct API hits and non-Vercel deployments
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["parent", "teacher", "healthcare", "other"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

const validRoles = ["parent", "teacher", "healthcare", "other"];
const messageWindowMs = 60_000;
const maxSubmissionsPerWindow = 5;
const contactRateState = new Map();

function rateLimitContact(req, res, next) {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const data = contactRateState.get(key) ?? { count: 0, startedAt: now };

  if (now - data.startedAt > messageWindowMs) {
    data.count = 0;
    data.startedAt = now;
  }

  data.count += 1;
  contactRateState.set(key, data);

  if (data.count > maxSubmissionsPerWindow) {
    return res.status(429).json({
      status: "error",
      message: "Too many requests. Please try again in a minute.",
    });
  }

  return next();
}

// In-memory, per-process admin OTP + session state. Losing these on a
// restart just means an admin requests a fresh code or signs in again -
// nothing here is worth persisting to the database.
const adminOtpStore = new Map(); // email -> { code, expiresAt, attempts }
const adminSessions = new Map(); // sessionToken -> { email, expiresAt }
const ADMIN_OTP_TTL_MS = 10 * 60 * 1000;
const ADMIN_OTP_MAX_ATTEMPTS = 5;
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function requireAdmin(req, res, next) {
  const providedToken = req.header("x-admin-token");
  if (!providedToken) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // The long static token still works too - handy for scripts/curl and as a
  // fallback that doesn't depend on email delivery being configured.
  if (ADMIN_TOKEN && providedToken === ADMIN_TOKEN) {
    return next();
  }

  const session = adminSessions.get(providedToken);
  if (session) {
    if (session.expiresAt > Date.now()) {
      return next();
    }
    adminSessions.delete(providedToken);
  }

  return res.status(401).json({
    status: "error",
    message: "Unauthorized",
  });
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function requireDatabase(req, res, next) {
  if (!isMongoConnected()) {
    return res.status(503).json({
      status: "error",
      message: "Database is temporarily unavailable. Please try again shortly.",
    });
  }

  return next();
}

// same sliding-window limiter shape as rateLimitContact above, just parameterised
// so the payments route can use its own window/max
function createRateLimiter({ windowMs, max }) {
  const state = new Map();

  return (req, res, next) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const data = state.get(key) ?? { count: 0, startedAt: now };

    if (now - data.startedAt > windowMs) {
      data.count = 0;
      data.startedAt = now;
    }

    data.count += 1;
    state.set(key, data);

    if (data.count > max) {
      return res.status(429).json({
        status: "error",
        message: "Too many requests. Please try again in a minute.",
      });
    }

    return next();
  };
}

function requireCronOrAdmin(req, res, next) {
  const authHeader = req.header("authorization") ?? "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);

  if (CRON_SECRET && bearerMatch && bearerMatch[1] === CRON_SECRET) {
    return next();
  }

  return requireAdmin(req, res, next);
}

// clears customerName/Email/Phone/Message on expired payments, keeps everything
// else (amounts, dates, transaction IDs) for the accounting trail - see GDPR-NOTES.md
async function anonymizeExpiredPayments() {
  const now = new Date();
  const result = await Payment.updateMany(
    { retentionExpiresAt: { $lte: now }, anonymizedAt: { $exists: false } },
    { $set: { customerName: null, customerEmail: null, customerPhone: null, customerMessage: null, anonymizedAt: now } },
    { runValidators: false },
  );

  return result.modifiedCount ?? result.nModified ?? 0;
}

async function sendContactInterestEmail({ name, email, role, message, submittedAt }) {
  if (!mailTransport) {
    console.warn("Contact email notification skipped: SMTP is not configured");
    return;
  }

  const subject = `New contact interest from ${name}`;
  const text = [
    "A new contact interest was submitted on Nuppu.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Role: ${role}`,
    `Submitted At: ${submittedAt.toISOString()}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <h2>New contact interest from Nuppu website</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Role:</strong> ${role}</p>
    <p><strong>Submitted At:</strong> ${submittedAt.toISOString()}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br />")}</p>
  `;

  await mailTransport.sendMail({
    from: MAIL_FROM,
    to: NUPPU_EMAIL,
    replyTo: email,
    subject,
    text,
    html,
  });
}

async function sendAdminOtpEmail(email, code) {
  if (!mailTransport) {
    // No SMTP configured (e.g. still on local dev) - log it so the flow is
    // still testable end-to-end without real email delivery.
    console.warn(`Admin OTP email skipped (SMTP not configured): ${email} code is ${code}`);
    return;
  }

  const subject = `${code} is your Nuppu admin sign-in code`;
  const text = `Your Nuppu admin sign-in code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`;
  const html = `
    <p>Your Nuppu admin sign-in code is:</p>
    <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
    <p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
  `;

  await mailTransport.sendMail({
    from: MAIL_FROM,
    to: email,
    subject,
    text,
    html,
  });
}

function formatEuros(amountCents) {
  return `€${(amountCents / 100).toFixed(2)}`;
}

async function sendPaymentReceiptToCompany(payment) {
  if (!mailTransport) {
    console.warn("Payment notification to company skipped: SMTP is not configured");
    return;
  }

  const subject = `New paid booking: ${payment.service} (${formatEuros(payment.amountCents)})`;
  const text = [
    "A new payment was confirmed by Paytrail.",
    "",
    `Service: ${payment.service}`,
    `Scheduled for: ${formatHelsinkiSlot(payment.scheduledAt)} (Finnish time)`,
    `Amount: ${formatEuros(payment.amountCents)}`,
    `Customer: ${payment.customerName} <${payment.customerEmail}>`,
    payment.customerPhone ? `Phone: ${payment.customerPhone}` : null,
    "",
    "Message:",
    payment.customerMessage,
    "",
    `Paytrail transaction: ${payment.paytrailTransactionId}`,
    `Reference: ${payment.paytrailReference}`,
    `Paid at: ${(payment.paidAt ?? new Date()).toISOString()}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  await mailTransport.sendMail({
    from: MAIL_FROM,
    to: [NUPPU_EMAIL, ...BOOKING_NOTIFY_EMAILS],
    subject,
    text,
  });
}

async function sendPaymentReceiptToCustomer(payment) {
  if (!mailTransport) {
    console.warn("Payment receipt to customer skipped: SMTP is not configured");
    return;
  }

  const scheduledText = `${formatHelsinkiSlot(payment.scheduledAt)} (Finnish time)`;
  const subject = "Your Nuppu booking is confirmed";
  const text = [
    `Hi ${payment.customerName},`,
    "",
    "Thanks for your payment - your booking is confirmed!",
    "",
    `Service: ${payment.service}`,
    `When: ${scheduledText}`,
    `Amount paid: ${formatEuros(payment.amountCents)}`,
    `Reference: ${payment.paytrailReference}`,
    "",
    "We'll see you then - reach out if anything changes.",
    "",
    "- The Nuppu team",
  ].join("\n");

  const html = `
    <p>Hi ${payment.customerName},</p>
    <p>Thanks for your payment — your booking is confirmed!</p>
    <p>
      <strong>Service:</strong> ${payment.service}<br />
      <strong>When:</strong> ${scheduledText}<br />
      <strong>Amount paid:</strong> ${formatEuros(payment.amountCents)}<br />
      <strong>Reference:</strong> ${payment.paytrailReference}
    </p>
    <p>We'll see you then — reach out if anything changes.</p>
  `;

  await mailTransport.sendMail({
    from: MAIL_FROM,
    to: payment.customerEmail,
    subject,
    text,
    html,
  });
}

async function sendPaymentReceiptSms(payment) {
  if (!payment.customerPhone) {
    return;
  }
  if (!smsClient) {
    console.warn("SMS receipt skipped: Twilio is not configured");
    return;
  }

  const body = `Nuppu: payment of ${formatEuros(payment.amountCents)} received, booking confirmed for ${formatHelsinkiSlot(payment.scheduledAt)} (Finnish time). Ref: ${payment.paytrailReference}`;

  try {
    await smsClient.messages.create({
      to: payment.customerPhone,
      from: TWILIO_FROM_NUMBER,
      body,
    });
  } catch (error) {
    // a bad number shouldn't break the payment flow - email receipt is still sent
    console.error("Error sending SMS receipt:", error);
  }
}

// runs all three notifications in parallel, logs failures instead of throwing
async function notifyPaymentConfirmed(payment) {
  const results = await Promise.allSettled([
    sendPaymentReceiptToCompany(payment),
    sendPaymentReceiptToCustomer(payment),
    sendPaymentReceiptSms(payment),
  ]);

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const label = ["company email", "customer email", "customer SMS"][i];
      console.error(`Error sending payment ${label} notification:`, result.reason);
    }
  });
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Nuppu API is running",
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Admin sign-in via emailed one-time code
// ---------------------------------------------------------------------------

const rateLimitOtpRequest = createRateLimiter({ windowMs: 15 * 60_000, max: 10 });
const rateLimitOtpVerify = createRateLimiter({ windowMs: 15 * 60_000, max: 20 });

app.post("/api/admin/otp/request", rateLimitOtpRequest, async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();

  // Same response whether or not the email is a recognised admin, so this
  // endpoint can't be used to enumerate who has admin access.
  const genericResponse = {
    status: "success",
    message: "If that email has admin access, a sign-in code has been sent.",
  };

  if (!email || !ADMIN_OTP_EMAILS.includes(email)) {
    return res.status(200).json(genericResponse);
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  adminOtpStore.set(email, { code, expiresAt: Date.now() + ADMIN_OTP_TTL_MS, attempts: 0 });

  try {
    await sendAdminOtpEmail(email, code);
  } catch (error) {
    console.error("Error sending admin OTP email:", error);
    adminOtpStore.delete(email);
    return res.status(502).json({ status: "error", message: "Could not send the sign-in code. Please try again shortly." });
  }

  return res.status(200).json(genericResponse);
});

app.post("/api/admin/otp/verify", rateLimitOtpVerify, (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const code = String(req.body?.code ?? "").trim();

  const entry = adminOtpStore.get(email);
  if (!entry || entry.expiresAt < Date.now()) {
    adminOtpStore.delete(email);
    return res.status(401).json({ status: "error", message: "That code is invalid or has expired." });
  }

  entry.attempts += 1;
  if (entry.attempts > ADMIN_OTP_MAX_ATTEMPTS) {
    adminOtpStore.delete(email);
    return res.status(401).json({ status: "error", message: "Too many attempts. Request a new code." });
  }

  if (code !== entry.code) {
    return res.status(401).json({ status: "error", message: "That code is invalid or has expired." });
  }

  adminOtpStore.delete(email); // one-time use
  const sessionToken = crypto.randomBytes(32).toString("hex");
  adminSessions.set(sessionToken, { email, expiresAt: Date.now() + ADMIN_SESSION_TTL_MS });

  return res.status(200).json({ status: "success", data: { token: sessionToken, email } });
});

app.post("/api/contact", rateLimitContact, async (req, res) => {
  try {
    const { name, email, role, message } = req.body;

    if (!name || !email || !role || !message) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid email address",
      });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role selected",
      });
    }

    const ipAddress = req.ip ?? req.socket.remoteAddress;

    let contactMessage = null;

    if (isMongoConnected()) {
      contactMessage = new ContactMessage({
        name,
        email,
        role,
        message,
        ipAddress,
      });

      await contactMessage.save();
    } else {
      console.warn("Skipping contact DB persistence: MongoDB is not connected");
    }

    await sendContactInterestEmail({
      name,
      email,
      role,
      message,
      submittedAt: contactMessage?.createdAt ?? new Date(),
    });

    res.status(200).json({
      status: "success",
      message: "Thank you for contacting us! We will get back to you soon.",
      data: {
        id: contactMessage?._id ?? null,
        submittedAt: contactMessage?.createdAt ?? new Date().toISOString(),
        persisted: Boolean(contactMessage),
      },
    });

    console.log(`New contact form submission from ${email}`);
  } catch (error) {
    console.error("Error processing contact form:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request. Please try again later.",
    });
  }
});

app.get("/api/contact", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await ContactMessage.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: {
        messages,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch contact messages",
    });
  }
});

app.patch("/api/contact/:id", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["new", "read", "replied"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status value",
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        status: "error",
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: message,
    });
  } catch (error) {
    console.error("Error updating contact message:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update contact messages",
    });
  }
});

app.delete("/api/contact/:id", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ status: "error", message: "Contact message not found" });
    }
    res.status(200).json({ status: "success", data: { id: req.params.id } });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ status: "error", message: "Failed to delete contact message" });
  }
});

// Bulk clear - deliberately scoped to contact-form messages only. Booking
// messages live on Payment records, which have a statutory retention period
// (see GDPR-NOTES.md) and must be anonymised individually via
// DELETE /api/payments/:id/personal-data instead of wiped in bulk here.
app.delete("/api/contact", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const result = await ContactMessage.deleteMany({});
    res.status(200).json({ status: "success", data: { deletedCount: result.deletedCount } });
  } catch (error) {
    console.error("Error clearing contact messages:", error);
    res.status(500).json({ status: "error", message: "Failed to clear contact messages" });
  }
});

// prices live here, not on the client - it only sends a service name, so a
// tampered request can't pay less than the real price
const SERVICE_PRICES_CENTS = {
  "emotional-support": 2900, // EUR 29.00 pilot rate
};

const rateLimitPayments = createRateLimiter({ windowMs: 60_000, max: 10 });

function apiBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

function paytrailRedirectUrls(req) {
  const base = apiBaseUrl(req);
  return {
    successUrl: `${base}/api/payments/success`,
    cancelUrl: `${base}/api/payments/cancel`,
    callbackUrl: `${base}/api/payments/callback`,
  };
}

function frontendReturnUrl(paymentQueryValue) {
  return `${CLIENT_URL}/emotional-support?payment=${paymentQueryValue}`;
}

// shared by the redirect endpoints and the webhook - always check the HMAC
// signature before trusting anything in the query string
async function handlePaytrailReturn(req, res, { isWebhook }) {
  const params = req.query;
  const isValid = verifyCallbackSignature(params);

  if (!isValid) {
    console.warn("Paytrail signature verification failed", { transactionId: params["checkout-transaction-id"] });
    if (isWebhook) {
      return res.status(400).json({ status: "error", message: "Invalid signature" });
    }
    return res.redirect(302, frontendReturnUrl("error"));
  }

  const transactionId = params["checkout-transaction-id"];
  const checkoutStatus = params["checkout-status"]; // ok | pending | delayed | fail

  let paymentStatus = "pending";
  if (checkoutStatus === "ok") paymentStatus = "paid";
  else if (checkoutStatus === "fail") paymentStatus = "failed";
  else if (checkoutStatus === "pending" || checkoutStatus === "delayed") paymentStatus = "pending";

  try {
    if (isMongoConnected() && transactionId) {
      const existing = await Payment.findOne({ paytrailTransactionId: transactionId });
      const wasAlreadyPaid = existing?.status === "paid";

      const update = { status: paymentStatus };
      if (paymentStatus === "paid") {
        update.paidAt = new Date();
      }
      const updated = await Payment.findOneAndUpdate(
        { paytrailTransactionId: transactionId },
        { $set: update },
        { new: true },
      );

      if (updated && paymentStatus === "paid" && !wasAlreadyPaid) {
        // fire-and-forget, don't make the redirect wait on email/SMS delivery
        notifyPaymentConfirmed(updated).catch((error) =>
          console.error("Unexpected error in notifyPaymentConfirmed:", error),
        );
      }
    }
  } catch (error) {
    console.error("Error updating payment record from Paytrail return:", error);
  }

  if (isWebhook) {
    return res.status(200).json({ status: "success" });
  }

  const queryValue = paymentStatus === "paid" ? "success" : paymentStatus === "failed" ? "cancelled" : "pending";
  return res.redirect(302, frontendReturnUrl(queryValue));
}

const rateLimitAvailability = createRateLimiter({ windowMs: 60_000, max: 30 });

// public - only ever returns what's actually bookable, never who booked what
app.get("/api/availability/slots", rateLimitAvailability, requireDatabase, async (req, res) => {
  try {
    const days = await computeSlotStatuses({ from: req.query.from, to: req.query.to });
    const slots = days.flatMap((day) => day.slots.filter((slot) => slot.status === "available").map((slot) => slot.startAt));
    res.status(200).json({ status: "success", data: { slots } });
  } catch (error) {
    console.error("Error computing available slots:", error);
    res.status(500).json({ status: "error", message: "Failed to load available times" });
  }
});

// admin - full status per slot (available/blocked/booked/past) plus block IDs to unblock
app.get("/api/availability/calendar", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const days = await computeSlotStatuses({ from: req.query.from, to: req.query.to });
    res.status(200).json({ status: "success", data: { days } });
  } catch (error) {
    console.error("Error computing availability calendar:", error);
    res.status(500).json({ status: "error", message: "Failed to load the availability calendar" });
  }
});

app.post("/api/availability/blocks", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const { date, startTime } = req.body ?? {};
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ status: "error", message: "date must be YYYY-MM-DD" });
    }
    const normalizedStartTime = startTime ? String(startTime) : null;
    if (normalizedStartTime && !/^\d{2}:00$/.test(normalizedStartTime)) {
      return res.status(400).json({ status: "error", message: "startTime must be like \"09:00\", or omitted for a whole day" });
    }

    if (normalizedStartTime === null) {
      // whole-day block supersedes any specific-hour blocks already on that date - otherwise
      // unblocking just the whole-day row later would let those stale hour-blocks resurface
      await AvailabilityBlock.deleteMany({ date, startTime: { $ne: null } });
    }

    const block = await AvailabilityBlock.findOneAndUpdate(
      { date, startTime: normalizedStartTime },
      { date, startTime: normalizedStartTime },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(200).json({ status: "success", data: block });
  } catch (error) {
    console.error("Error creating availability block:", error);
    res.status(500).json({ status: "error", message: "Failed to block that time" });
  }
});

app.delete("/api/availability/blocks/:id", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const block = await AvailabilityBlock.findByIdAndDelete(req.params.id);
    if (!block) {
      return res.status(404).json({ status: "error", message: "Block not found" });
    }
    res.status(200).json({ status: "success", data: block });
  } catch (error) {
    console.error("Error removing availability block:", error);
    res.status(500).json({ status: "error", message: "Failed to unblock that time" });
  }
});

app.post("/api/payments/create", rateLimitPayments, requireDatabase, async (req, res) => {
  try {
    const { service, customerName, customerEmail, customerPhone, customerMessage, scheduledAt } = req.body ?? {};

    if (!service || !SERVICE_PRICES_CENTS[service]) {
      return res.status(400).json({ status: "error", message: "Unknown or missing service" });
    }
    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ status: "error", message: "Please enter your name" });
    }
    if (!customerEmail || !/\S+@\S+\.\S+/.test(customerEmail)) {
      return res.status(400).json({ status: "error", message: "Please enter a valid email address" });
    }
    // phone is optional, just loosely checked if given
    const trimmedPhone = customerPhone ? String(customerPhone).trim() : "";
    if (trimmedPhone && !/^\+?[0-9\s-]{6,20}$/.test(trimmedPhone)) {
      return res.status(400).json({ status: "error", message: "Please enter a valid phone number" });
    }
    // message is required so the team knows what they're booking before the call
    if (!customerMessage || !String(customerMessage).trim()) {
      return res.status(400).json({
        status: "error",
        message: "Please write a message describing what you're interested in before booking",
      });
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
    if (!scheduledDate || Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ status: "error", message: "Please choose a time for your consultation" });
    }

    // free up anything held by an abandoned checkout for this exact slot before checking
    // availability, so the DB unique index below doesn't reject a slot the UI shows as open
    await reclaimExpiredHold(service, scheduledDate);

    if (!(await isSlotBookable(scheduledDate))) {
      return res.status(409).json({
        status: "error",
        message: "That time is no longer available - please choose another.",
      });
    }

    const amountCents = SERVICE_PRICES_CENTS[service];
    const stamp = crypto.randomUUID();
    const reference = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
    const now = new Date();

    const payment = new Payment({
      paytrailTransactionId: `pending-${stamp}`, // replaced once Paytrail responds
      paytrailReference: reference,
      service,
      amountCents,
      status: "pending",
      customerName: String(customerName).trim().slice(0, 100),
      customerEmail: String(customerEmail).trim().toLowerCase(),
      customerPhone: trimmedPhone || undefined,
      customerMessage: String(customerMessage).trim().slice(0, 2000),
      scheduledAt: scheduledDate,
      retentionExpiresAt: computeRetentionExpiry(now),
    });

    const { successUrl, cancelUrl, callbackUrl } = paytrailRedirectUrls(req);

    const paytrailPayment = await createPaytrailPayment({
      stamp,
      reference,
      amountCents,
      description: "Nuppu emotional support consultation (45 min)",
      customerEmail: payment.customerEmail,
      customerName: payment.customerName,
      successUrl,
      cancelUrl,
      callbackUrl,
    });

    payment.paytrailTransactionId = paytrailPayment.transactionId;

    try {
      await payment.save();
    } catch (saveError) {
      // the partial unique index on {service, scheduledAt} is the real double-booking guard -
      // isSlotBookable above is just a pre-check to avoid wasting a Paytrail call most of the time
      if (saveError?.code === 11000) {
        return res.status(409).json({
          status: "error",
          message: "That time was just booked by someone else - please choose another.",
        });
      }
      throw saveError;
    }

    res.status(200).json({
      status: "success",
      data: {
        url: paytrailPayment.href,
        transactionId: paytrailPayment.transactionId,
        usingTestCredentials: paytrailUsingTestCredentials,
      },
    });
  } catch (error) {
    console.error("Error creating Paytrail payment:", error);
    res.status(502).json({
      status: "error",
      message: "Could not start the payment. Please try again shortly.",
    });
  }
});

app.get("/api/payments/success", (req, res) => handlePaytrailReturn(req, res, { isWebhook: false }));
app.get("/api/payments/cancel", (req, res) => handlePaytrailReturn(req, res, { isWebhook: false }));

// Paytrail actually calls webhooks with GET + checkout-* query params, not POST -
// keeping the POST alias too in case that ever changes
app.get("/api/payments/callback", (req, res) => handlePaytrailReturn(req, res, { isWebhook: true }));
app.post("/api/payments/callback", (req, res) => handlePaytrailReturn(req, res, { isWebhook: true }));

// admin: GDPR access/rectification/erasure/portability

app.get("/api/payments/export", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ status: "error", message: "email query parameter is required" });
    }

    const payments = await Payment.find({ customerEmail: String(email).toLowerCase() }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: payments,
    });
  } catch (error) {
    console.error("Error exporting payment history:", error);
    res.status(500).json({ status: "error", message: "Failed to export payment history" });
  }
});

// triggered daily by Vercel Cron (see vercel.json crons, auth'd via CRON_SECRET),
// or manually with the admin token
app.get("/api/payments/anonymize-expired", requireCronOrAdmin, requireDatabase, async (req, res) => {
  try {
    const anonymizedCount = await anonymizeExpiredPayments();
    res.status(200).json({ status: "success", data: { anonymizedCount } });
  } catch (error) {
    console.error("Error anonymising expired payments:", error);
    res.status(500).json({ status: "error", message: "Failed to anonymise expired payments" });
  }
});

app.get("/api/payments", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const payments = await Payment.find(query).sort({ createdAt: -1 }).limit(limitNum).skip(skip);
    const total = await Payment.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: {
        payments,
        pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch payments" });
  }
});

app.get("/api/payments/:id", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ status: "error", message: "Payment not found" });
    }
    res.status(200).json({ status: "success", data: payment });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch payment" });
  }
});

// right to rectification - correct a stored name/email
const PAYMENT_STATUSES = ["pending", "paid", "cancelled", "failed", "refunded"];

app.patch("/api/payments/:id", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const { customerName, customerEmail, status } = req.body ?? {};
    const update = {};

    if (customerName !== undefined) {
      if (!String(customerName).trim()) {
        return res.status(400).json({ status: "error", message: "customerName cannot be empty" });
      }
      update.customerName = String(customerName).trim().slice(0, 100);
    }
    if (customerEmail !== undefined) {
      if (!/\S+@\S+\.\S+/.test(customerEmail)) {
        return res.status(400).json({ status: "error", message: "Invalid customerEmail" });
      }
      update.customerEmail = String(customerEmail).trim().toLowerCase();
    }
    // setting status to cancelled/refunded is also how a booked slot gets freed up again -
    // the partial unique index only matches pending/paid, see slots.js
    if (status !== undefined) {
      if (!PAYMENT_STATUSES.includes(status)) {
        return res.status(400).json({ status: "error", message: "Invalid status value" });
      }
      update.status = status;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ status: "error", message: "Nothing to update" });
    }

    const payment = await Payment.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!payment) {
      return res.status(404).json({ status: "error", message: "Payment not found" });
    }

    res.status(200).json({ status: "success", data: payment });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ status: "error", message: "Failed to update payment" });
  }
});

// right to erasure - anonymises rather than deletes, keeps the accounting trail
// intact (see GDPR-NOTES.md)
app.delete("/api/payments/:id/personal-data", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          customerName: null,
          customerEmail: null,
          customerPhone: null,
          customerMessage: null,
          anonymizedAt: new Date(),
        },
      },
      { new: true, runValidators: false },
    );

    if (!payment) {
      return res.status(404).json({ status: "error", message: "Payment not found" });
    }

    res.status(200).json({ status: "success", data: payment });
  } catch (error) {
    console.error("Error anonymising payment:", error);
    res.status(500).json({ status: "error", message: "Failed to anonymise payment" });
  }
});

// Vercel serves dist/ itself via vercel.json rewrites, so this block only matters
// off Vercel (plain Node on a VPS etc.) - static files, then SPA fallback to
// index.html (or admin/index.html) mirroring those same rewrites
if (!process.env.VERCEL) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distDir = path.join(__dirname, "..", "dist");

  app.use(express.static(distDir));
  app.get(/^\/admin(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(distDir, "admin", "index.html"));
  });
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

if (MONGODB_REQUIRED) {
  mongoose.connection.once("open", () => {
    console.log("MongoDB connection ready!");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  // Without this .catch(), a rejection here (e.g. a transient DNS hiccup
  // resolving the Atlas SRV record) is an unhandled promise rejection that
  // crashes the whole process - not just the database-dependent routes that
  // requireDatabase()/MONGODB_REQUIRED are designed to degrade gracefully.
  // Mongoose retries the connection on its own after this.
  mongoose.connect(MONGODB_URI).catch((err) => {
    console.error("MongoDB initial connection failed:", err);
  });
}

// Vercel imports and invokes this module per-request, so it must not bind a port
// there - but locally (npm run server) nothing else calls app.listen(), so do it here
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`Nuppu API listening on http://localhost:${PORT}`);
  });
}

export default app;
