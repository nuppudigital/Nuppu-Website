import { useCallback, useEffect, useState } from 'react';
import { Lock, RefreshCw, LogOut, Users, CreditCard, Clock3, Mail, Trash2 } from 'lucide-react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { adminAPI, authAPI, ADMIN_EMAILS, type Payment, type ContactMessage } from './config/api';
import { AvailabilityCalendar } from './components/AvailabilityCalendar';

const TOKEN_STORAGE_KEY = 'nuppu_admin_token';

const PAYMENT_TABS = ['all', 'paid', 'pending', 'cancelled', 'failed', 'refunded'] as const;
const MESSAGE_TABS = ['all', 'new', 'read', 'replied'] as const;

const currencyFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' });

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

// bookings are always for Helsinki working hours, regardless of what timezone the admin is in
function formatScheduled(iso?: string) {
  if (!iso) return '—'; // bookings made before the availability calendar shipped
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Helsinki',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

function paymentStatusClasses(status: Payment['status']) {
  switch (status) {
    case 'paid':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'refunded':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'cancelled':
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function messageStatusClasses(status: ContactMessage['status']) {
  switch (status) {
    case 'replied':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'new':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'read':
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

type MessageSource = 'contact' | 'booking';

interface UnifiedMessage {
  id: string;
  rawId: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  source: MessageSource;
  detail: string;
  message: string;
  statusLabel: string;
  statusClasses: string;
}

function sourceClasses(source: MessageSource) {
  return source === 'contact'
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-violet-50 text-violet-700 border-violet-200';
}

function StatusBadge({ status, classes }: { status: string; classes: string }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${classes}`}>
      {status}
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <Card className="flex items-start gap-4 p-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
    </Card>
  );
}

function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
            active === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.title = 'Nuppu Admin Dashboard';
  }, []);

  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? '');
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState('');

  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [otpEmail, setOtpEmail] = useState(ADMIN_EMAILS[0] ?? '');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentTab, setPaymentTab] = useState<(typeof PAYMENT_TABS)[number]>('all');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [messageTab, setMessageTab] = useState<(typeof MESSAGE_TABS)[number]>('all');

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  // Returns null on success, or the failure reason otherwise - callers need the
  // actual message (e.g. "Unauthorized" vs a network error), not just a boolean,
  // since loadError's state update isn't visible to a caller reading it back
  // synchronously in the same handler.
  const loadData = useCallback(async (activeToken: string) => {
    setLoading(true);
    setLoadError('');
    try {
      const [paymentsRes, messagesRes] = await Promise.all([
        adminAPI.listPayments(activeToken, { limit: 100 }),
        adminAPI.listMessages(activeToken, { limit: 100 }),
      ]);
      setPayments(paymentsRes.data.payments);
      setPaymentsTotal(paymentsRes.data.pagination.total);
      setMessages(messagesRes.data.messages);
      setMessagesTotal(messagesRes.data.pagination.total);
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setLoadError(message);
      return message;
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadData(token).then((errorMessage) => {
        if (errorMessage) {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken('');
        }
      });
    } else {
      setAuthChecked(true);
    }
    // only on mount - loadData also runs from handleVerifyOtp once a new token is confirmed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setOtpSending(true);
    try {
      await authAPI.requestOtp(otpEmail);
      setOtpStep('code');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not send the code. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setOtpSending(true);
    try {
      const verified = await authAPI.verifyOtp(otpEmail, otpCode.trim());
      const sessionToken = verified.data.token;

      const errorMessage = await loadData(sessionToken);
      if (errorMessage) {
        setAuthError(`Signed in, but couldn't load dashboard data: ${errorMessage}`);
        return;
      }

      sessionStorage.setItem(TOKEN_STORAGE_KEY, sessionToken);
      setToken(sessionToken);
      setOtpCode('');
      setOtpStep('email');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'That code is invalid or has expired.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setPayments([]);
    setMessages([]);
  };

  // cancelling/refunding here is also what frees the booked slot back up on the calendar
  const handlePaymentStatusChange = async (id: string, status: Payment['status']) => {
    setStatusUpdatingId(id);
    try {
      const response = await adminAPI.updatePaymentStatus(token, id, status);
      setPayments((prev) => prev.map((p) => (p._id === id ? response.data : p)));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to update booking status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteMessage = async (message: UnifiedMessage) => {
    const confirmed = window.confirm(
      message.source === 'contact'
        ? `Delete this contact message from ${message.name}? This can't be undone.`
        : `Clear ${message.name}'s booking message and personal details? The booking record itself is kept (required for accounting), but their name, email, phone and message are permanently removed. This can't be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(message.id);
    try {
      if (message.source === 'contact') {
        await adminAPI.deleteMessage(token, message.rawId);
        setMessages((prev) => prev.filter((m) => m._id !== message.rawId));
        setMessagesTotal((prev) => prev - 1);
      } else {
        const response = await adminAPI.eraseBookingPersonalData(token, message.rawId);
        setPayments((prev) => prev.map((p) => (p._id === message.rawId ? response.data : p)));
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to delete message');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllContactMessages = async () => {
    const contactCount = messages.length;
    if (contactCount === 0) return;
    const confirmed = window.confirm(
      `Delete all ${contactCount} contact-form message${contactCount === 1 ? '' : 's'}? Booking messages aren't affected - clear those individually. This can't be undone.`,
    );
    if (!confirmed) return;

    setClearingAll(true);
    try {
      await adminAPI.clearAllMessages(token);
      setMessages([]);
      setMessagesTotal(0);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to clear contact messages');
    } finally {
      setClearingAll(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <Card className="w-full max-w-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold">Admin sign-in</h1>
          </div>
          {otpStep === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="w-full">
                <label htmlFor="admin-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Admin email
                </label>
                <select
                  id="admin-email"
                  className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                >
                  {ADMIN_EMAILS.map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
              {authError && <p className="text-sm text-destructive">{authError}</p>}
              <Button type="submit" fullWidth disabled={otpSending}>
                {otpSending ? 'Sending...' : 'Send sign-in code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <span className="font-medium text-foreground">{otpEmail}</span>. It expires in 10
                minutes.
              </p>
              <Input
                label="Sign-in code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
              />
              {authError && <p className="text-sm text-destructive">{authError}</p>}
              <Button type="submit" fullWidth disabled={otpSending || otpCode.length !== 6}>
                {otpSending ? 'Verifying...' : 'Verify and sign in'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setOtpStep('email');
                  setOtpCode('');
                  setAuthError('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Use a different email or resend
              </button>
            </form>
          )}
        </Card>
      </div>
    );
  }

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const revenueCents = paidPayments.reduce((sum, p) => sum + p.amountCents, 0);
  const newMessages = messages.filter((m) => m.status === 'new');

  const filteredPayments = paymentTab === 'all' ? payments : payments.filter((p) => p.status === paymentTab);

  // combine contact-form messages with the note clients leave when booking, so nothing's missed
  const unifiedMessages: UnifiedMessage[] = [
    ...messages.map((m) => ({
      id: `contact-${m._id}`,
      rawId: m._id,
      createdAt: m.createdAt,
      name: m.name,
      email: m.email,
      source: 'contact' as const,
      detail: m.role,
      message: m.message,
      statusLabel: m.status,
      statusClasses: messageStatusClasses(m.status),
    })),
    ...payments
      .filter((p) => p.customerMessage && p.customerMessage.trim())
      .map((p) => ({
        id: `booking-${p._id}`,
        rawId: p._id,
        createdAt: p.createdAt,
        name: p.customerName,
        email: p.customerEmail,
        phone: p.customerPhone,
        source: 'booking' as const,
        detail: p.service,
        message: p.customerMessage as string,
        statusLabel: p.status,
        statusClasses: paymentStatusClasses(p.status),
      })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // new/read/replied is a contact-form thing only, so bookings just live under "All"
  const filteredMessages =
    messageTab === 'all' ? unifiedMessages : unifiedMessages.filter((m) => m.source === 'contact' && m.statusLabel === messageTab);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
            <p className="text-muted-foreground mt-1">Bookings and contact messages, from the pilot database.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadData(token)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatTile
            icon={<Users className="h-5 w-5" />}
            label="Total bookings"
            value={String(paymentsTotal)}
            sublabel={paymentsTotal > payments.length ? `Showing latest ${payments.length}` : undefined}
          />
          <StatTile
            icon={<CreditCard className="h-5 w-5" />}
            label="Paid"
            value={String(paidPayments.length)}
            sublabel={`${currencyFormatter.format(revenueCents / 100)} collected`}
          />
          <StatTile
            icon={<Clock3 className="h-5 w-5" />}
            label="Pending"
            value={String(pendingPayments.length)}
            sublabel="Awaiting payment"
          />
          <StatTile
            icon={<Mail className="h-5 w-5" />}
            label="Messages"
            value={String(unifiedMessages.length)}
            sublabel={`${newMessages.length} new · ${messagesTotal} contact, ${paymentsTotal} booking`}
          />
        </div>

        <AvailabilityCalendar token={token} />

        <Card className="mb-8 p-6">
          <h2 className="text-lg font-semibold mb-4">Bookings</h2>
          <TabBar tabs={PAYMENT_TABS} active={paymentTab} onChange={setPaymentTab} />
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Scheduled</th>
                  <th className="py-2 pr-4 font-medium">Booked on</th>
                  <th className="py-2 pr-4 font-medium">Client</th>
                  <th className="py-2 pr-4 font-medium">Contact</th>
                  <th className="py-2 pr-4 font-medium">Wants</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground py-8">
                      {loading ? 'Loading...' : 'No bookings in this category.'}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 whitespace-nowrap font-medium">
                        {formatScheduled(payment.scheduledAt)}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="py-3 pr-4 font-medium">{payment.customerName}</td>
                      <td className="py-3 pr-4">
                        <div>{payment.customerEmail}</div>
                        {payment.customerPhone && (
                          <div className="text-muted-foreground text-xs">{payment.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 max-w-xs truncate" title={payment.customerMessage}>
                        {payment.customerMessage || <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">{currencyFormatter.format(payment.amountCents / 100)}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={payment.status}
                          onChange={(e) => handlePaymentStatusChange(payment._id, e.target.value as Payment['status'])}
                          disabled={statusUpdatingId === payment._id}
                          className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${paymentStatusClasses(payment.status)}`}
                        >
                          {PAYMENT_TABS.filter((tab) => tab !== 'all').map((tab) => (
                            <option key={tab} value={tab}>
                              {tab}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Messages</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Every message from a client, whether they wrote in through the contact form or left a note while
                booking a paid consultation.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleClearAllContactMessages}
              disabled={clearingAll || messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              {clearingAll ? 'Clearing...' : 'Clear all contact messages'}
            </Button>
          </div>
          <TabBar tabs={MESSAGE_TABS} active={messageTab} onChange={setMessageTab} />
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">From</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Message</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-8">
                      {loading ? 'Loading...' : 'No messages in this category.'}
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => (
                    <tr key={message.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{message.name}</div>
                        <div className="text-muted-foreground text-xs">{message.email}</div>
                        {message.phone && <div className="text-muted-foreground text-xs">{message.phone}</div>}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge
                          status={message.source === 'contact' ? 'Contact' : 'Booking'}
                          classes={sourceClasses(message.source)}
                        />
                        <div className="text-muted-foreground text-xs mt-1 capitalize">{message.detail}</div>
                      </td>
                      <td className="py-3 pr-4 max-w-xs truncate" title={message.message}>
                        {message.message}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={message.statusLabel} classes={message.statusClasses} />
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(message)}
                          disabled={deletingId === message.id}
                          title={message.source === 'contact' ? 'Delete message' : "Erase this booking's personal data"}
                          className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
