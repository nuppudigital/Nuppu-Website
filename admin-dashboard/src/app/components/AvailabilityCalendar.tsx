import { useCallback, useEffect, useState } from 'react';
import { Lock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { adminAPI, type AvailabilityDay, type AvailabilitySlot, type SlotStatus } from '../config/api';

// keep in sync with BOOKING_WINDOW_DAYS in src/server/availability/slots.js - this is just the
// UI nav clamp, the server is the real source of truth and clamps its own responses regardless
const BOOKING_WINDOW_DAYS = 42;
const HELSINKI_TZ = 'Europe/Helsinki';

function todayHelsinkiKey(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: HELSINKI_TZ }).format(new Date());
}

function addDaysToKey(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function mondayOfWeek(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  return addDaysToKey(dateKey, diffToMonday);
}

// on a weekend, this week's Mon-Fri already happened - default straight to next week instead of
// opening on a grid that's entirely grayed-out "past"
function defaultWeekStart(): string {
  const today = todayHelsinkiKey();
  const [y, m, d] = today.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (weekday === 6) return addDaysToKey(today, 2); // Sat -> next Mon
  if (weekday === 0) return addDaysToKey(today, 1); // Sun -> next Mon
  return mondayOfWeek(today);
}

// dateKey is already a plain "YYYY-MM-DD" calendar label from the server - format it back with
// timeZone: 'UTC' so the browser's own local zone can't shift it to an adjacent day
function formatDayHeader(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

const STATUS_CLASSES: Record<SlotStatus, string> = {
  available: 'bg-white border-border text-foreground hover:bg-green-50 hover:border-green-300 cursor-pointer',
  blocked: 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 cursor-pointer',
  booked: 'bg-violet-50 border-violet-200 text-violet-700 cursor-not-allowed',
  past: 'bg-muted border-border text-muted-foreground/50 cursor-not-allowed opacity-60',
};

export function AvailabilityCalendar({ token }: { token: string }) {
  const [weekStart, setWeekStart] = useState(defaultWeekStart);
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mutatingKey, setMutatingKey] = useState<string | null>(null);

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const weekEnd = addDaysToKey(weekStart, 4);
      const response = await adminAPI.getAvailabilityCalendar(token, { from: weekStart, to: weekEnd });
      setDays(response.data.days);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the availability calendar');
    } finally {
      setLoading(false);
    }
  }, [token, weekStart]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const currentWeekMonday = mondayOfWeek(todayHelsinkiKey());
  const maxWeekMonday = mondayOfWeek(addDaysToKey(todayHelsinkiKey(), BOOKING_WINDOW_DAYS));
  const canGoPrev = weekStart > currentWeekMonday;
  const canGoNext = weekStart < maxWeekMonday;

  async function toggleSlot(day: AvailabilityDay, slot: AvailabilitySlot) {
    if (slot.status !== 'available' && slot.status !== 'blocked') return;

    setMutatingKey(slot.startAt);
    setError('');
    try {
      if (slot.status === 'available') {
        await adminAPI.blockSlot(token, { date: day.date, startTime: slot.time });
      } else if (slot.blockId) {
        await adminAPI.unblockSlot(token, slot.blockId);
      }
      await loadCalendar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update that time');
    } finally {
      setMutatingKey(null);
    }
  }

  async function toggleWholeDay(day: AvailabilityDay) {
    setMutatingKey(day.date);
    setError('');
    try {
      if (day.wholeDayBlocked && day.wholeDayBlockId) {
        await adminAPI.unblockSlot(token, day.wholeDayBlockId);
      } else {
        await adminAPI.blockSlot(token, { date: day.date, startTime: null });
      }
      await loadCalendar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update that day');
    } finally {
      setMutatingKey(null);
    }
  }

  return (
    <Card className="mb-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Availability</h2>
          <p className="text-sm text-muted-foreground -mt-0.5">
            Click an open slot to block it, or a blocked one to reopen it. Customers only ever see what's left.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            aria-label="Previous week"
            onClick={() => setWeekStart((w) => addDaysToKey(w, -7))}
            disabled={!canGoPrev || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[11rem] text-center">
            {formatDayHeader(weekStart)} – {formatDayHeader(addDaysToKey(weekStart, 4))}
          </span>
          <Button
            variant="outline"
            aria-label="Next week"
            onClick={() => setWeekStart((w) => addDaysToKey(w, 7))}
            disabled={!canGoNext || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" aria-label="Refresh" onClick={loadCalendar} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="grid grid-cols-5 gap-3 min-w-[640px]">
          {days.map((day) => (
            <div key={day.date} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{formatDayHeader(day.date)}</span>
                <button
                  type="button"
                  onClick={() => toggleWholeDay(day)}
                  disabled={mutatingKey === day.date}
                  className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                    day.wholeDayBlocked
                      ? 'bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300'
                      : 'bg-white border-border text-muted-foreground hover:bg-muted'
                  }`}
                  title={day.wholeDayBlocked ? 'Reopens the whole day' : 'Blocks every hour this day'}
                >
                  {day.wholeDayBlocked ? 'Unblock day' : 'Block day'}
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {day.slots.map((slot) => (
                  <button
                    key={slot.startAt}
                    type="button"
                    onClick={() => toggleSlot(day, slot)}
                    disabled={mutatingKey === slot.startAt || (slot.status !== 'available' && slot.status !== 'blocked')}
                    className={`text-sm px-2 py-1.5 rounded-md border text-center transition-colors ${STATUS_CLASSES[slot.status]}`}
                    title={
                      slot.status === 'booked'
                        ? 'Already booked'
                        : slot.status === 'past'
                          ? 'In the past'
                          : slot.status === 'blocked'
                            ? 'Blocked - click to reopen'
                            : 'Open - click to block'
                    }
                  >
                    {slot.status === 'booked' && <Lock className="inline h-3 w-3 mr-1 -mt-0.5" />}
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!loading && days.length === 0 && (
            <p className="col-span-5 text-center text-muted-foreground py-8">No working days in this range.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-border bg-white inline-block" /> Open</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-gray-300 bg-gray-100 inline-block" /> Blocked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-violet-200 bg-violet-50 inline-block" /> Booked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-border bg-muted opacity-60 inline-block" /> Past</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Note: unblocking a whole blocked day reopens every hour in it. To keep just one hour closed within an
        otherwise-open day, block that hour individually instead of using "Block day".
      </p>
    </Card>
  );
}

export default AvailabilityCalendar;
