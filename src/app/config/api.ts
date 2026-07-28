const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const isProduction = import.meta.env.PROD;

if (isProduction && !envApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required in production.");
}

// Default matches the backend's default port (see PORT in api/index.js / .env.example).
export const API_BASE_URL = envApiBaseUrl ?? "http://localhost:5050/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data;
}

export const contactAPI = {
  submit: async (data: {
    name: string;
    email: string;
    role: string;
    message: string;
  }) => {
    return apiRequest("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const paymentsAPI = {
  /**
   * Starts a Paytrail checkout and returns a redirect URL — navigate the
   * browser to it (window.location.href = url) to hand off to Paytrail's
   * hosted payment page.
   */
  create: async (data: {
    service: "emotional-support";
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerMessage: string;
  }) => {
    return apiRequest<{
      status: string;
      data: { url: string; transactionId: string; usingTestCredentials: boolean };
    }>("/payments/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const healthAPI = {
  check: async () => apiRequest("/health", { method: "GET" }),
};
