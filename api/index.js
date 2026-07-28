import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";
import crypto from "node:crypto";
import { Payment, computeRetentionExpiry } from "../src/server/models/Payment.js";
import {
  createPayment as createPaytrailPayment,
  verifyCallbackSignature,
  usingTestCredentials as paytrailUsingTestCredentials,
  // getPaymentStatus is exported by paytrailClient.js as part of the required
  // three-function abstraction (createPayment / verifyCallbackSignature /
  // getPaymentStatus) but isn't wired into a route here - signature
  // verification on the webhook is already sufficient authentication for the
  // status update below. Available for future use (e.g. an admin "re-sync
  // status from Paytrail" action).
} from "../src/server/payments/paytrailClient.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = Number(process.env.PORT ?? 5050);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/nuppu";
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
// Used to authorise the daily retention/anonymisation cron (Vercel Cron sends this as
// a Bearer token automatically when CRON_SECRET is set as an env var on the project).
const CRON_SECRET = process.env.CRON_SECRET;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const MONGODB_REQUIRED = process.env.MONGODB_REQUIRED === "true";
const NUPPU_EMAIL = process.env.NUPPU_EMAIL ?? "nuppudigital@gmail.com";
const MAIL_FROM = process.env.MAIL_FROM ?? "noreply@nuppu.app";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const canSendEmail = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

// --- SMS (Twilio) ---
// Use a plain Twilio phone number as TWILIO_FROM_NUMBER, not a branded
// alphanumeric sender name. As of May 2026, Traficom (Finland's telecom
// regulator) requires alphanumeric SMS sender IDs sent to Finnish numbers to
// be pre-registered (Order 28 L/2025) or they're shown as "Tuntematon"
// (Unknown) and, from Nov 2026, blocked as spam. A normal purchased number
// sidesteps that registration process entirely.
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
  // admin-dashboard/'s own standalone dev server (see that project's README) -
  // Vite auto-increments to 5174 when 5173 (the main site) is already running.
  // Not needed in production: there it's served same-origin from /admin.
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

// Security headers (defense in depth - Vercel also sets HSTS at the edge for the
// static frontend, but this covers direct hits to the API, and any deployment
// where this Express app runs as a standalone service instead of a Vercel Function).
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Contact Message Schema
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

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(503).json({
      status: "error",
      message: "Admin routes are unavailable until ADMIN_TOKEN is configured.",
    });
  }

  const providedToken = req.header("x-admin-token");
  if (!providedToken || providedToken !== ADMIN_TOKEN) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  return next();
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

// Generic per-IP sliding-window rate limiter, reused by both the contact form
// and the payment-creation endpoint.
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

/**
 * Anonymise payment records whose retention period has expired. Preserves the
 * accounting trail (amounts, dates, status, transaction/reference IDs) while
 * clearing customerName/customerEmail, per the Kirjanpitolaki 6-year retention
 * + GDPR data-minimisation policy documented in GDPR-NOTES.md.
 */
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

function formatEuros(amountCents) {
  return `€${(amountCents / 100).toFixed(2)}`;
}

/**
 * Notify the company that a real payment came through, so they can verify it
 * against their own Paytrail merchant dashboard / bookkeeping.
 */
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
    to: NUPPU_EMAIL,
    subject,
    text,
  });
}

/** Send the customer their own payment receipt/confirmation by email. */
async function sendPaymentReceiptToCustomer(payment) {
  if (!mailTransport) {
    console.warn("Payment receipt to customer skipped: SMTP is not configured");
    return;
  }

  const subject = "Your Nuppu booking is confirmed";
  const text = [
    `Hi ${payment.customerName},`,
    "",
    "Thanks for your payment - your booking is confirmed!",
    "",
    `Service: ${payment.service}`,
    `Amount paid: ${formatEuros(payment.amountCents)}`,
    `Reference: ${payment.paytrailReference}`,
    "",
    "We'll be in touch shortly with next steps.",
    "",
    "- The Nuppu team",
  ].join("\n");

  const html = `
    <p>Hi ${payment.customerName},</p>
    <p>Thanks for your payment — your booking is confirmed!</p>
    <p>
      <strong>Service:</strong> ${payment.service}<br />
      <strong>Amount paid:</strong> ${formatEuros(payment.amountCents)}<br />
      <strong>Reference:</strong> ${payment.paytrailReference}
    </p>
    <p>We'll be in touch shortly with next steps.</p>
  `;

  await mailTransport.sendMail({
    from: MAIL_FROM,
    to: payment.customerEmail,
    subject,
    text,
    html,
  });
}

/** Send the customer an SMS receipt, if they provided a phone number. */
async function sendPaymentReceiptSms(payment) {
  if (!payment.customerPhone) {
    return;
  }
  if (!smsClient) {
    console.warn("SMS receipt skipped: Twilio is not configured");
    return;
  }

  const body = `Nuppu: payment of ${formatEuros(payment.amountCents)} received, booking confirmed. Ref: ${payment.paytrailReference}`;

  try {
    await smsClient.messages.create({
      to: payment.customerPhone,
      from: TWILIO_FROM_NUMBER,
      body,
    });
  } catch (error) {
    // Don't let an SMS failure (e.g. bad number) break the payment flow -
    // the email receipt above is the source of truth either way.
    console.error("Error sending SMS receipt:", error);
  }
}

/** Fire all payment-confirmed notifications. Failures here are logged, never thrown. */
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

// Routes

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Nuppu API is running",
    timestamp: new Date().toISOString(),
  });
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

// ---------------------------------------------------------------------------
// Payments (Paytrail)
// ---------------------------------------------------------------------------

// Canonical prices are enforced server-side - the client only sends a service
// name, never a trusted amount. This prevents a tampered request from paying
// less than the real price.
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

/**
 * Shared handler for Paytrail's success/cancel redirect targets and the
 * success/cancel webhook callback. Always verifies the HMAC signature before
 * trusting anything in the query string, per Paytrail's documentation.
 */
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
        // Fire-and-forget: don't hold up the redirect/webhook response waiting
        // on email/SMS delivery. Errors are caught and logged inside.
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

app.post("/api/payments/create", rateLimitPayments, requireDatabase, async (req, res) => {
  try {
    const { service, customerName, customerEmail, customerPhone, customerMessage } = req.body ?? {};

    if (!service || !SERVICE_PRICES_CENTS[service]) {
      return res.status(400).json({ status: "error", message: "Unknown or missing service" });
    }
    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ status: "error", message: "Please enter your name" });
    }
    if (!customerEmail || !/\S+@\S+\.\S+/.test(customerEmail)) {
      return res.status(400).json({ status: "error", message: "Please enter a valid email address" });
    }
    // Optional - only validated (loosely, E.164-ish) if the customer provided one.
    const trimmedPhone = customerPhone ? String(customerPhone).trim() : "";
    if (trimmedPhone && !/^\+?[0-9\s-]{6,20}$/.test(trimmedPhone)) {
      return res.status(400).json({ status: "error", message: "Please enter a valid phone number" });
    }
    // Required - what product/package the customer wants, so the team knows
    // before the consultation instead of finding out after payment.
    if (!customerMessage || !String(customerMessage).trim()) {
      return res.status(400).json({
        status: "error",
        message: "Please write a message describing what you're interested in before booking",
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
    await payment.save();

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

// Paytrail's server-to-server webhook. Per the current Paytrail API docs
// (docs.paytrail.com / github.com/paytrail/api-documentation), callback URLs
// are called with HTTP GET and the same "checkout-*" query string parameters
// as the redirect URLs - not POST. This route accepts GET to match the real
// spec; a POST alias is kept for forward-compatibility in case Paytrail
// changes this in the future.
app.get("/api/payments/callback", (req, res) => handlePaytrailReturn(req, res, { isWebhook: true }));
app.post("/api/payments/callback", (req, res) => handlePaytrailReturn(req, res, { isWebhook: true }));

// --- Admin: GDPR access / rectification / erasure / portability -----------

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

// Retention/anonymisation sweep. Intended to be triggered daily by a Vercel
// Cron Job (see vercel.json `crons`), which authenticates via CRON_SECRET.
// Can also be triggered manually with the admin token.
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

// Right to rectification - correct a stored name/email.
app.patch("/api/payments/:id", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const { customerName, customerEmail } = req.body ?? {};
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

// Right to erasure - anonymises rather than deletes, to preserve the
// statutory accounting trail (see GDPR-NOTES.md).
app.delete("/api/payments/:id/personal-data", requireAdmin, requireDatabase, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { $set: { customerName: null, customerEmail: null, customerPhone: null, anonymizedAt: new Date() } },
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

  mongoose.connect(MONGODB_URI);
}

// On Vercel, this module is imported and invoked per-request by the platform's
// Node.js runtime, so it must NOT bind a port there. For local development
// (`npm run server`) and any other standalone Node host, start the HTTP server
// here so the API is actually reachable - previously nothing ever called
// app.listen(), so this file could not be run locally at all.
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`Nuppu API listening on http://localhost:${PORT}`);
  });
}

export default app;
