// Computes the consultant's bookable time slots: a fixed Mon-Fri 9-17 Europe/Helsinki template,
// minus whatever's in AvailabilityBlock, minus whatever's already booked in Payment. No date
// library anywhere in this repo, so timezone conversion here is hand-rolled on top of the native
// Intl API rather than pulling one in for this alone.

import { Payment } from "../models/Payment.js";
import { AvailabilityBlock } from "../models/AvailabilityBlock.js";

export const TIMEZONE = "Europe/Helsinki";
export const WORKING_WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri, per Date#getUTCDay()
export const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16]; // local hour starts - 16:00 + 30min still fits before 17:00 close
export const CONSULTATION_MINUTES = 30;
export const PENDING_HOLD_MINUTES = 30; // how long an unpaid checkout holds a slot before it's up for grabs again
export const BOOKING_WINDOW_DAYS = 42; // how far ahead customers can book - change this one constant to adjust it

const pad2 = (n) => String(n).padStart(2, "0");

const helsinkiFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  hourCycle: "h23", // hour12: false has a known ICU bug returning "24" for midnight
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function helsinkiOffsetMinutesAt(utcInstant) {
  const parts = Object.fromEntries(helsinkiFormatter.formatToParts(utcInstant).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asUtc - utcInstant.getTime()) / 60000;
}

// converts a Helsinki local date/time to the UTC instant it represents. Guesses the offset from
// a naive UTC reading, then re-checks at the guessed instant and corrects once if DST shifted it -
// in practice Finland's DST changeovers land at 3-4am local, well outside the 9-17 slot window, but
// the double-check makes this correct by construction instead of by that coincidence.
export function helsinkiLocalToUtc(year, month, day, hour, minute = 0) {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset1 = helsinkiOffsetMinutesAt(guess);
  let utc = new Date(guess.getTime() - offset1 * 60000);
  const offset2 = helsinkiOffsetMinutesAt(utc);
  if (offset2 !== offset1) {
    utc = new Date(guess.getTime() - offset2 * 60000);
  }
  return utc;
}

export function helsinkiPartsFromUtc(utcInstant) {
  const parts = Object.fromEntries(helsinkiFormatter.formatToParts(utcInstant).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function dateString({ year, month, day }) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

// weekday is a pure calendar property once you have y/m/d - no timezone math needed for this part
export function weekdayOf({ year, month, day }) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function addDays({ year, month, day }, delta) {
  const d = new Date(Date.UTC(year, month - 1, day + delta));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function parseDateString(s) {
  const [year, month, day] = s.split("-").map(Number);
  return { year, month, day };
}

export function todayHelsinki() {
  const { year, month, day } = helsinkiPartsFromUtc(new Date());
  return { year, month, day };
}

// never trust a client-supplied range - bound it to +/- BOOKING_WINDOW_DAYS around today. The
// admin calendar legitimately asks for a recent-past range (e.g. "this week" when today is a
// Saturday, so Mon-Fri already passed) - those days should come back marked "past", not vanish.
// Clamping from all the way up to today instead of a backward bound used to collapse that into
// an empty, inverted range.
export function clampRange(fromStr, toStr) {
  const today = todayHelsinki();
  const minStart = addDays(today, -BOOKING_WINDOW_DAYS);
  const maxEnd = addDays(today, BOOKING_WINDOW_DAYS);

  let from = fromStr ? parseDateString(fromStr) : today;
  let to = toStr ? parseDateString(toStr) : maxEnd;

  if (dateString(from) < dateString(minStart)) from = minStart;
  if (dateString(to) > dateString(maxEnd)) to = maxEnd;
  if (dateString(to) < dateString(from)) to = from;

  return { from, to };
}

// human-readable Helsinki time for emails/SMS/admin display - this direction needs no manual
// offset math, Intl's timeZone option handles it natively
export function formatHelsinkiSlot(date, locale = "en-GB") {
  return new Intl.DateTimeFormat(locale, {
    timeZone: TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

// full per-slot status for a date range - used by both the public picker (filtered to
// "available" only) and the admin calendar (shown in full, with block IDs to unblock)
export async function computeSlotStatuses({ from, to } = {}) {
  const { from: fromParts, to: toParts } = clampRange(from, to);

  const queryFromUtc = helsinkiLocalToUtc(fromParts.year, fromParts.month, fromParts.day, 0, 0);
  const queryToUtc = helsinkiLocalToUtc(toParts.year, toParts.month, toParts.day, 23, 59);

  const [blocks, payments] = await Promise.all([
    AvailabilityBlock.find({ date: { $gte: dateString(fromParts), $lte: dateString(toParts) } }).lean(),
    Payment.find({
      service: "emotional-support",
      status: { $in: ["pending", "paid"] },
      scheduledAt: { $gte: queryFromUtc, $lte: queryToUtc },
    })
      .select("scheduledAt status createdAt")
      .lean(),
  ]);

  const blocksByDate = new Map();
  for (const block of blocks) {
    if (!blocksByDate.has(block.date)) {
      blocksByDate.set(block.date, { wholeDay: null, byHour: new Map() });
    }
    const entry = blocksByDate.get(block.date);
    if (block.startTime === null) entry.wholeDay = block;
    else entry.byHour.set(block.startTime, block);
  }

  const holdCutoff = Date.now() - PENDING_HOLD_MINUTES * 60000;
  const bookedInstants = new Set();
  for (const payment of payments) {
    if (payment.status === "paid" || new Date(payment.createdAt).getTime() > holdCutoff) {
      bookedInstants.add(payment.scheduledAt.toISOString());
    }
  }

  const now = Date.now();
  const days = [];
  let cursor = fromParts;
  while (dateString(cursor) <= dateString(toParts)) {
    const weekday = weekdayOf(cursor);
    if (WORKING_WEEKDAYS.includes(weekday)) {
      const dStr = dateString(cursor);
      const blockEntry = blocksByDate.get(dStr);

      const slots = SLOT_HOURS.map((hour) => {
        const startAt = helsinkiLocalToUtc(cursor.year, cursor.month, cursor.day, hour, 0);
        const time = `${pad2(hour)}:00`;
        const hourBlock = blockEntry?.byHour.get(time);

        // priority: booked > blocked > past > available, so the UI never shows a contradiction
        let status;
        let blockId;
        if (bookedInstants.has(startAt.toISOString())) {
          status = "booked";
        } else if (blockEntry?.wholeDay) {
          status = "blocked";
          blockId = String(blockEntry.wholeDay._id);
        } else if (hourBlock) {
          status = "blocked";
          blockId = String(hourBlock._id);
        } else if (startAt.getTime() <= now) {
          status = "past";
        } else {
          status = "available";
        }

        return { time, startAt: startAt.toISOString(), status, blockId };
      });

      days.push({
        date: dStr,
        weekday,
        wholeDayBlocked: Boolean(blockEntry?.wholeDay),
        wholeDayBlockId: blockEntry?.wholeDay ? String(blockEntry.wholeDay._id) : null,
        slots,
      });
    }
    cursor = addDays(cursor, 1);
  }

  return days;
}

// re-validates a client-picked slot server-side before it's booked - same "never trust the
// client" principle already applied to price via SERVICE_PRICES_CENTS
export async function isSlotBookable(scheduledAt) {
  const date = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return false;

  const parts = helsinkiPartsFromUtc(date);
  if (parts.minute !== 0 || !SLOT_HOURS.includes(parts.hour)) return false;
  if (!WORKING_WEEKDAYS.includes(weekdayOf(parts))) return false;

  // reconstruct from the parsed local parts and compare - rejects anything that isn't exactly
  // one of the canonical slot instants, not just something that happens to fall in the same hour
  const reconstructed = helsinkiLocalToUtc(parts.year, parts.month, parts.day, parts.hour, 0);
  if (reconstructed.getTime() !== date.getTime()) return false;

  if (date.getTime() <= Date.now()) return false;

  const { from, to } = clampRange();
  const dStr = dateString(parts);
  if (dStr < dateString(from) || dStr > dateString(to)) return false;

  const time = `${pad2(parts.hour)}:00`;
  const block = await AvailabilityBlock.findOne({
    date: dStr,
    $or: [{ startTime: null }, { startTime: time }],
  }).lean();
  if (block) return false;

  const holdCutoff = new Date(Date.now() - PENDING_HOLD_MINUTES * 60000);
  const conflicting = await Payment.findOne({
    service: "emotional-support",
    scheduledAt: date,
    $or: [{ status: "paid" }, { status: "pending", createdAt: { $gt: holdCutoff } }],
  }).lean();
  if (conflicting) return false;

  return true;
}

// frees a slot that's been held by an abandoned (never completed) checkout - without this the
// DB unique index would lock the slot forever even though the UI shows it as open again
export async function reclaimExpiredHold(service, scheduledAt) {
  const holdCutoff = new Date(Date.now() - PENDING_HOLD_MINUTES * 60000);
  await Payment.updateMany(
    { service, scheduledAt, status: "pending", createdAt: { $lt: holdCutoff } },
    { $set: { status: "cancelled" } },
  );
}
