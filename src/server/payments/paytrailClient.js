/**
 * PAYTRAIL PAYMENT CLIENT
 *
 * Thin wrapper around Paytrail's Payment API (https://docs.paytrail.com/).
 * Implements the HMAC-SHA256 request/response signing scheme exactly as documented
 * at https://github.com/paytrail/api-documentation (docs/README.md, "Authentication"
 * and "Redirect and callback URL signing" sections), verified against the reference
 * Node.js HMAC example published there.
 *
 * SWAP-IN DESIGN:
 * Reads PAYTRAIL_MERCHANT_ID / PAYTRAIL_SECRET_KEY from environment variables. If they
 * are not set, it falls back to Paytrail's published test-merchant credentials
 * (merchant ID 375917 / secret SAIPPUAKAUPPIAS - documented at
 * https://docs.paytrail.com under "Test credentials"). The moment real credentials are
 * set in the environment, this module automatically starts creating real charges -
 * no code changes required.
 *
 * Never log PAYTRAIL_SECRET_KEY or the raw signature payload in production.
 */

import crypto from "node:crypto";

const TEST_MERCHANT_ID = "375917";
const TEST_SECRET_KEY = "SAIPPUAKAUPPIAS";

const PAYTRAIL_MERCHANT_ID = process.env.PAYTRAIL_MERCHANT_ID || TEST_MERCHANT_ID;
const PAYTRAIL_SECRET_KEY = process.env.PAYTRAIL_SECRET_KEY || TEST_SECRET_KEY;
const PAYTRAIL_API_BASE_URL = (process.env.PAYTRAIL_API_BASE_URL || "https://services.paytrail.com").replace(
  /\/+$/,
  "",
);

/** True when no real Paytrail credentials have been configured yet. */
export const usingTestCredentials =
  PAYTRAIL_MERCHANT_ID === TEST_MERCHANT_ID && PAYTRAIL_SECRET_KEY === TEST_SECRET_KEY;

if (usingTestCredentials) {
  // Intentionally not an error - lets the whole checkout -> callback flow be
  // developed and demoed before a real Paytrail merchant agreement exists.
  console.warn(
    "[paytrailClient] PAYTRAIL_MERCHANT_ID / PAYTRAIL_SECRET_KEY are not set. " +
      "Falling back to Paytrail's published TEST merchant credentials. " +
      "No real charges will be created until real credentials are set in the environment.",
  );
}

/**
 * Calculate the Paytrail HMAC signature.
 *
 * Per the Paytrail spec: sort all `checkout-` prefixed params alphabetically,
 * join each as `key:value` with `\n`, append the raw request body (or an empty
 * string for GET requests / callback verification), and HMAC-SHA256 the result.
 *
 * @param {string} secret Merchant shared secret
 * @param {Record<string, string>} params Headers (for requests) or query string params (for callbacks)
 * @param {string} body Raw request body exactly as sent, or "" for GET/callback verification
 */
function calculateHmac(secret, params, body = "") {
  const payload = Object.keys(params)
    .filter((key) => key.toLowerCase().startsWith("checkout-"))
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .concat(body)
    .join("\n");

  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function buildRequestHeaders(method, transactionId) {
  const headers = {
    "checkout-account": PAYTRAIL_MERCHANT_ID,
    "checkout-algorithm": "sha256",
    "checkout-method": method,
    "checkout-nonce": crypto.randomUUID(),
    "checkout-timestamp": new Date().toISOString(),
  };

  if (transactionId) {
    headers["checkout-transaction-id"] = transactionId;
  }

  return headers;
}

/**
 * Create a new Paytrail payment.
 *
 * @param {object} order
 * @param {string} order.stamp Merchant-unique identifier for this payment attempt (max 200 chars)
 * @param {string} order.reference Order/booking reference for reconciliation (max 200 chars)
 * @param {number} order.amountCents Total amount in cents (currency minor units)
 * @param {string} order.description Line-item description shown to the payer
 * @param {string} order.customerEmail
 * @param {string} order.customerName
 * @param {string} order.successUrl Browser redirect target on success
 * @param {string} order.cancelUrl Browser redirect target on cancel
 * @param {string} order.callbackUrl Server-to-server webhook target (also GET, per Paytrail spec)
 * @returns {Promise<{ transactionId: string, href: string, reference: string }>}
 */
export async function createPayment(order) {
  const {
    stamp,
    reference,
    amountCents,
    description,
    customerEmail,
    customerName,
    successUrl,
    cancelUrl,
    callbackUrl,
  } = order;

  if (!stamp || !reference || !amountCents || !customerEmail || !successUrl || !cancelUrl) {
    throw new Error("createPayment: missing required order fields");
  }

  const nameParts = String(customerName || "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || customerName || "Customer";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const requestBody = {
    stamp,
    reference,
    amount: amountCents,
    currency: "EUR",
    language: "EN",
    items: [
      {
        unitPrice: amountCents,
        units: 1,
        // Finland's standard VAT rate (25.5% as of Sept 2024). Informational only -
        // Paytrail does not use it to recompute `amount`. Confirm with the company's
        // accountant if the emotional-support consultation should use a different rate.
        vatPercentage: 25.5,
        productCode: "emotional-support-45min",
        description: description || "Nuppu emotional support consultation (45 min)",
      },
    ],
    customer: {
      email: customerEmail,
      firstName,
      lastName,
    },
    redirectUrls: {
      success: successUrl,
      cancel: cancelUrl,
    },
    callbackUrls: {
      success: callbackUrl,
      cancel: callbackUrl,
    },
  };

  const bodyString = JSON.stringify(requestBody);
  const headers = buildRequestHeaders("POST");
  const signature = calculateHmac(PAYTRAIL_SECRET_KEY, headers, bodyString);

  const response = await fetch(`${PAYTRAIL_API_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      ...headers,
      "content-type": "application/json; charset=utf-8",
      signature,
    },
    body: bodyString,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || `Paytrail create-payment failed with status ${response.status}`;
    throw new Error(message);
  }

  return {
    transactionId: data.transactionId,
    href: data.href,
    reference: data.reference,
  };
}

/**
 * Verify the signature on redirect (success/cancel) or callback query string
 * parameters. Per Paytrail's guidance: do not hardcode which `checkout-*`
 * parameters to expect (new ones may be added) - filter by prefix, sort, and
 * recompute the HMAC with an empty body.
 *
 * @param {Record<string, string>} params req.query from the redirect/callback request
 * @returns {boolean}
 */
export function verifyCallbackSignature(params) {
  const { signature } = params;
  if (!signature || typeof signature !== "string") {
    return false;
  }

  const expected = calculateHmac(PAYTRAIL_SECRET_KEY, params, "");

  const provided = Buffer.from(signature, "utf8");
  const computed = Buffer.from(expected, "utf8");

  if (provided.length !== computed.length) {
    return false;
  }

  return crypto.timingSafeEqual(provided, computed);
}

/**
 * Fetch the current status of a payment directly from Paytrail.
 * Useful as a defensive re-check when a callback/redirect signature is valid
 * but you want authoritative confirmation before fulfilling an order.
 *
 * @param {string} transactionId Paytrail transaction ID
 */
export async function getPaymentStatus(transactionId) {
  if (!transactionId) {
    throw new Error("getPaymentStatus: transactionId is required");
  }

  const headers = buildRequestHeaders("GET", transactionId);
  const signature = calculateHmac(PAYTRAIL_SECRET_KEY, headers, "");

  const response = await fetch(`${PAYTRAIL_API_BASE_URL}/payments/${transactionId}`, {
    method: "GET",
    headers: {
      ...headers,
      signature,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || `Paytrail get-payment-status failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const __internal = { calculateHmac };
