/**
 * API Configuration for Nuppu Frontend
 *
 * Set VITE_API_BASE_URL in your environment for both development and production.
 */

const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const isProduction = import.meta.env.PROD;

if (isProduction && !envApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required in production.");
}

// Default matches the backend's default port (see PORT in api/index.js / .env.example).
export const API_BASE_URL = envApiBaseUrl ?? "http://localhost:5050/api";

/**
 * API Request Helper
 * Handles common API request patterns with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Contact Form API
 */
export const contactAPI = {
  /**
   * Submit contact form
   */
  submit: async (data: {
    name: string;
    email: string;
    role: string;
    message: string;
  }) => {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Payments API (Paytrail)
 */
export const paymentsAPI = {
  /**
   * Start a Paytrail checkout for a paid service. Returns a redirect URL -
   * navigate the browser to it (window.location.href = url) to hand off to
   * Paytrail's hosted payment selection page.
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
    }>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Health Check API
 */
export const healthAPI = {
  /**
   * Check if API is running
   */
  check: async () => {
    return apiRequest('/health', {
      method: 'GET',
    });
  },
};
