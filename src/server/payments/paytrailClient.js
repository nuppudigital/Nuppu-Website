// wraps Paytrail's payment API (docs.paytrail.com) - HMAC-SHA256 signing scheme
// follows their spec exactly (github.com/paytrail/api-documentation, "Authentication"
// and "Redirect and callback URL signing")
//
// falls back to Paytrail's published test credentials (merchant 375917 / secret
// SAIPPUAKAUPPIAS) when PAYTRAIL_MERCHANT_ID/SECRET_KEY aren't set in the env - set
// real ones and this starts creating real charges automatically, no code changes
//
// never log PAYTRAIL_SECRET_KEY or the raw signature payload

import crypto from "node:crypto";

const TEST_MERCHANT_ID = "375917";
const TEST_SECRET_KEY = "SAIPPUAKAUPPIAS";

const PAYTRAIL_MERCHANT_ID = process.env.PAYTRAIL_MERCHANT_ID || TEST_MERCHANT_ID;
const PAYTRAIL_SECRET_KEY = process.env.PAYTRAIL_SECRET_KEY || TEST_SECRET_KEY;
const PAYTRAIL_API_BASE_URL = (process.env.PAYTRAIL_API_BASE_URL || "https://services.paytrail.com").replace(
  /\/+$/,
  "",
);

export const usingTestCredentials =
  PAYTRAIL_MERCHANT_ID === TEST_MERCHANT_ID && PAYTRAIL_SECRET_KEY === TEST_SECRET_KEY;

if (usingTestCredentials) {
  // just a warning, not an error - lets us build/demo the whole checkout flow
  // before there's a real Paytrail merchant agreement
  console.warn(
    "[paytrailClient] PAYTRAIL_MERCHANT_ID / PAYTRAIL_SECRET_KEY are not set. " +
      "Falling back to Paytrail's published TEST merchant credentials. " +
      "No real charges will be created until real credentials are set in the environment.",
  );
}

// sort checkout-* params alphabetically, join as key:value with \n, append the raw
// body (empty string for GET/callback verification), then HMAC-SHA256 it - this is
// exactly Paytrail's signing spec
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
        // Finland's standard VAT rate - informational only, Paytrail doesn't recompute
        // `amount` from it. Ask the accountant if this service needs a different rate.
        vatPercentage: 25.5,
        productCode: "emotional-support-30min",
        description: description || "Nuppu emotional support consultation (30 min)",
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

// don't hardcode which checkout-* params to expect (Paytrail can add new ones) -
// same filter/sort/HMAC as calculateHmac, just with an empty body
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

// not wired into a route yet (see the import comment in api/index.js) - useful for
// an authoritative re-check even after a valid callback signature
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
