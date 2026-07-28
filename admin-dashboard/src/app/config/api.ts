/**
 * API configuration for the standalone admin dashboard.
 *
 * Talks to the same backend as the main Nuppu site (Nuppu Website/api/index.js).
 * Set VITE_API_BASE_URL to point at it; defaults to the local dev server.
 */

const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const API_BASE_URL = envApiBaseUrl ?? 'http://localhost:5050/api';

export interface Payment {
  _id: string;
  paytrailTransactionId: string;
  paytrailReference: string;
  service: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'failed' | 'refunded';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerMessage?: string;
  paidAt?: string;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  role: 'parent' | 'teacher' | 'healthcare' | 'other';
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function adminRequest<T>(token: string, endpoint: string, params: Record<string, string | number | undefined> = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }

  const url = `${API_BASE_URL}${endpoint}${query.toString() ? `?${query}` : ''}`;
  const response = await fetch(url, { headers: { 'x-admin-token': token } });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`);
  }

  return data as T;
}

export const adminAPI = {
  listPayments: (token: string, params: { status?: string; page?: number; limit?: number } = {}) =>
    adminRequest<{ status: string; data: { payments: Payment[]; pagination: Pagination } }>(
      token,
      '/payments',
      params,
    ),

  listMessages: (token: string, params: { status?: string; page?: number; limit?: number } = {}) =>
    adminRequest<{ status: string; data: { messages: ContactMessage[]; pagination: Pagination } }>(
      token,
      '/contact',
      params,
    ),
};
