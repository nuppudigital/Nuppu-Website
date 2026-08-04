import { useCallback, useEffect, useState } from 'react';
import { Lock, RefreshCw, LogOut, Users, CreditCard, Clock3, Mail } from 'lucide-react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { adminAPI, type Payment, type ContactMessage } from './config/api';

const TOKEN_STORAGE_KEY = 'nuppu_admin_token';

const PAYMENT_TABS = ['all', 'paid', 'pending', 'cancelled', 'failed', 'refunded'] as const;
const MESSAGE_TABS = ['all', 'new', 'read', 'replied'] as const;

const currencyFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' });

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
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
  const [tokenInput, setTokenInput] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState('');

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentTab, setPaymentTab] = useState<(typeof PAYMENT_TABS)[number]>('all');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [messageTab, setMessageTab] = useState<(typeof MESSAGE_TABS)[number]>('all');

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

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
      return true;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      return false;
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadData(token).then((ok) => {
        if (!ok) {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken('');
        }
      });
    } else {
      setAuthChecked(true);
    }
    // Only run on mount / when a newly-entered token is confirmed via handleSignIn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const candidate = tokenInput.trim();
    if (!candidate) return;

    const ok = await loadData(candidate);
    if (ok) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, candidate);
      setToken(candidate);
      setTokenInput('');
    } else {
      setAuthError("That token was rejected. Check ADMIN_TOKEN in the server's .env.");
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setPayments([]);
    setMessages([]);
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
          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              label="Admin token"
              type="password"
              autoComplete="off"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste ADMIN_TOKEN"
            />
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Checking...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const revenueCents = paidPayments.reduce((sum, p) => sum + p.amountCents, 0);
  const newMessages = messages.filter((m) => m.status === 'new');

  const filteredPayments = paymentTab === 'all' ? payments : payments.filter((p) => p.status === paymentTab);

  // Messages panel combines contact-form submissions with the message every
  // client writes when booking a paid consultation, so nothing gets missed
  // by only checking one list.
  const unifiedMessages: UnifiedMessage[] = [
    ...messages.map((m) => ({
      id: `contact-${m._id}`,
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

  // The new/read/replied tabs are a contact-form triage workflow; bookings
  // don't have that state, so they only surface under "All".
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

        <Card className="mb-8 p-6">
          <h2 className="text-lg font-semibold mb-4">Bookings</h2>
          <TabBar tabs={PAYMENT_TABS} active={paymentTab} onChange={setPaymentTab} />
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Date</th>
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
                    <td colSpan={6} className="text-center text-muted-foreground py-8">
                      {loading ? 'Loading...' : 'No bookings in this category.'}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="border-b border-border last:border-0">
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
                        <StatusBadge status={payment.status} classes={paymentStatusClasses(payment.status)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
          <p className="text-sm text-muted-foreground -mt-2 mb-4">
            Every message from a client, whether they wrote in through the contact form or left a note while booking
            a paid consultation.
          </p>
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
                </tr>
              </thead>
              <tbody>
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-8">
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
