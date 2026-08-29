// hits the same backend as the main site (Nuppu Website/api/index.js) - point
// VITE_API_BASE_URL at it, otherwise falls back to the local dev server
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
  scheduledAt?: string; // absent on bookings made before the availability calendar shipped
  paidAt?: string;
  createdAt: string;
}

export type SlotStatus = 'available' | 'blocked' | 'booked' | 'past';

export interface AvailabilitySlot {
  time: string; // "09:00".."16:00"
  startAt: string;
  status: SlotStatus;
  blockId?: string;
}

export interface AvailabilityDay {
  date: string; // "YYYY-MM-DD"
  weekday: number;
  wholeDayBlocked: boolean;
  wholeDayBlockId: string | null;
  slots: AvailabilitySlot[];
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

// GET-by-default, but blocking/unblocking a slot needs POST/DELETE with a body too
async function adminRequest<T>(
  token: string,
  endpoint: string,
  options: { method?: string; params?: Record<string, string | number | undefined>; body?: unknown } = {},
) {
  const { method = 'GET', params = {}, body } = options;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }

  const url = `${API_BASE_URL}${endpoint}${query.toString() ? `?${query}` : ''}`;
  const response = await fetch(url, {
    method,
    headers: {
      'x-admin-token': token,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`);
  }

  return data as T;
}

// Admins recognised by the OTP sign-in flow - keep in sync with the backend's
// ADMIN_OTP_EMAILS default (api/index.js) since there's no unauthenticated
// endpoint to fetch this list.
export const ADMIN_EMAILS = ['laura@nuppuapp.fi', 'emmi@nuppuapp.fi', 'nuppudigital@gmail.com'];

async function authRequest<T>(endpoint: string, body: unknown) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`);
  }

  return data as T;
}

export const authAPI = {
  requestOtp: (email: string) =>
    authRequest<{ status: string; message: string }>('/admin/otp/request', { email }),

  verifyOtp: (email: string, code: string) =>
    authRequest<{ status: string; data: { token: string; email: string } }>('/admin/otp/verify', { email, code }),
};

export const adminAPI = {
  listPayments: (token: string, params: { status?: string; page?: number; limit?: number } = {}) =>
    adminRequest<{ status: string; data: { payments: Payment[]; pagination: Pagination } }>(
      token,
      '/payments',
      { params },
    ),

  listMessages: (token: string, params: { status?: string; page?: number; limit?: number } = {}) =>
    adminRequest<{ status: string; data: { messages: ContactMessage[]; pagination: Pagination } }>(
      token,
      '/contact',
      { params },
    ),

  updatePaymentStatus: (token: string, id: string, status: Payment['status']) =>
    adminRequest<{ status: string; data: Payment }>(token, `/payments/${id}`, { method: 'PATCH', body: { status } }),

  getAvailabilityCalendar: (token: string, params: { from: string; to: string }) =>
    adminRequest<{ status: string; data: { days: AvailabilityDay[] } }>(token, '/availability/calendar', { params }),

  blockSlot: (token: string, body: { date: string; startTime: string | null }) =>
    adminRequest<{ status: string; data: unknown }>(token, '/availability/blocks', { method: 'POST', body }),

  unblockSlot: (token: string, blockId: string) =>
    adminRequest<{ status: string; data: unknown }>(token, `/availability/blocks/${blockId}`, { method: 'DELETE' }),

  deleteMessage: (token: string, id: string) =>
    adminRequest<{ status: string; data: { id: string } }>(token, `/contact/${id}`, { method: 'DELETE' }),

  clearAllMessages: (token: string) =>
    adminRequest<{ status: string; data: { deletedCount: number } }>(token, '/contact', { method: 'DELETE' }),

  // Erases a booking's personal data (name/email/phone/message) - the message
  // disappears from the dashboard as a side effect, without deleting the
  // underlying payment record, which has a statutory retention period.
  eraseBookingPersonalData: (token: string, paymentId: string) =>
    adminRequest<{ status: string; data: Payment }>(token, `/payments/${paymentId}/personal-data`, { method: 'DELETE' }),
};
