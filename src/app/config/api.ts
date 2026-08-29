const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const isProduction = import.meta.env.PROD;

if (isProduction && !envApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required in production.");
}

// keep in sync with PORT in api/index.js / .env.example
export const API_BASE_URL = envApiBaseUrl ?? "http://localhost:5050/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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
    throw new ApiError(data.message || `API Error: ${response.status}`, response.status);
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
  // returns a Paytrail redirect URL - send the browser there (window.location.href = url)
  create: async (data: {
    service: "emotional-support";
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerMessage: string;
    scheduledAt: string;
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

export const availabilityAPI = {
  // ISO instants the consultant is actually free for - the booking form only ever lets
  // customers pick from this list
  listSlots: async () => {
    return apiRequest<{ status: string; data: { slots: string[] } }>("/availability/slots", {
      method: "GET",
    });
  },
};

export const healthAPI = {
  check: async () => apiRequest("/health", { method: "GET" }),
};
