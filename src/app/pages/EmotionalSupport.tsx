import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle, XCircle, Clock3 } from "lucide-react";
import { ApiError, availabilityAPI, paymentsAPI } from "../config/api";
import { useLanguage, type Lang } from "../i18n/LanguageContext";

type PaymentUiState = "idle" | "loading" | "error";

const CheckIcon = () => (
  <svg className="w-5 h-5 mr-2 mt-1 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

const HELSINKI_TZ = "Europe/Helsinki";

// used for grouping/keying, so it goes through formatToParts for exact numeric parts rather
// than trusting a locale string format to always come back as "YYYY-MM-DD HH:mm"
const helsinkiPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: HELSINKI_TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function helsinkiParts(iso: string) {
  const parts = Object.fromEntries(helsinkiPartsFormatter.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return parts as Record<"year" | "month" | "day" | "hour" | "minute", string>;
}

function helsinkiDateKey(iso: string): string {
  const p = helsinkiParts(iso);
  return `${p.year}-${p.month}-${p.day}`;
}

function helsinkiTimeLabel(iso: string): string {
  const p = helsinkiParts(iso);
  return `${p.hour}:${p.minute}`;
}

// these are just display formatting, not translated app strings - Intl's timeZone option
// handles the UTC -> Helsinki conversion natively here, no manual offset math needed
function formatDatePill(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "fi" ? "fi-FI" : "en-GB", {
    timeZone: HELSINKI_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

function formatFullSlot(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "fi" ? "fi-FI" : "en-GB", {
    timeZone: HELSINKI_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

interface DayGroup {
  dateKey: string;
  dateLabel: string;
  times: { iso: string; timeLabel: string }[];
}

export function EmotionalSupport() {
  const { t, tList, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnStatus = searchParams.get("payment"); // success | cancelled | pending | error | null

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [paymentState, setPaymentState] = useState<PaymentUiState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsError(false);
    try {
      const response = await availabilityAPI.listSlots();
      setSlots(response.data.slots);
    } catch {
      setSlotsError(true);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const groupedDates = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();
    for (const iso of slots) {
      const key = helsinkiDateKey(iso);
      if (!map.has(key)) {
        map.set(key, { dateKey: key, dateLabel: formatDatePill(iso, lang), times: [] });
      }
      map.get(key)!.times.push({ iso, timeLabel: helsinkiTimeLabel(iso) });
    }
    return Array.from(map.values());
  }, [slots, lang]);

  // once slots load, jump straight to the first open day instead of making people click twice
  useEffect(() => {
    if (!selectedDate && groupedDates.length > 0) {
      setSelectedDate(groupedDates[0].dateKey);
    }
  }, [groupedDates, selectedDate]);

  const selectedDayTimes = groupedDates.find((d) => d.dateKey === selectedDate)?.times ?? [];

  // clear ?payment= after showing it once, otherwise a refresh re-shows a stale banner
  useEffect(() => {
    if (returnStatus) {
      const timeout = setTimeout(() => {
        const next = new URLSearchParams(searchParams);
        next.delete("payment");
        setSearchParams(next, { replace: true });
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [returnStatus, searchParams, setSearchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!selectedSlot) {
      setErrorMessage(t("emotionalSupport.errors.slot"));
      return false;
    }
    if (!formData.name.trim()) {
      setErrorMessage(t("emotionalSupport.errors.name"));
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage(t("emotionalSupport.errors.email"));
      return false;
    }
    if (formData.phone.trim() && !/^\+?[0-9\s-]{6,20}$/.test(formData.phone.trim())) {
      setErrorMessage(t("emotionalSupport.errors.phone"));
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMessage(t("emotionalSupport.errors.message"));
      return false;
    }
    return true;
  };

  const handleBookAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validate()) {
      setPaymentState("error");
      return;
    }

    setPaymentState("loading");

    try {
      const response = await paymentsAPI.create({
        service: "emotional-support",
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim() || undefined,
        customerMessage: formData.message.trim(),
        scheduledAt: selectedSlot as string,
      });

      const redirectUrl = response?.data?.url;
      if (!redirectUrl) {
        throw new Error(t("emotionalSupport.errors.noRedirect"));
      }

      // Hand off the browser to Paytrail's hosted payment selection page.
      window.location.href = redirectUrl;
    } catch (error) {
      setPaymentState("error");
      if (error instanceof ApiError && error.status === 409) {
        // someone else took the slot while this customer was filling in the form
        setErrorMessage(t("emotionalSupport.errors.slotTaken"));
        setSelectedSlot(null);
        loadSlots();
      } else {
        setErrorMessage(error instanceof Error ? error.message : t("emotionalSupport.errors.generic"));
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
            {t("emotionalSupport.title")}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            {t("emotionalSupport.intro1")}
          </p>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
            {t("emotionalSupport.intro2")}
          </p>
        </div>

        {/* Payment return status banner (from Paytrail redirect via /api/payments/success|cancel) */}
        {returnStatus === "success" && (
          <div
            role="status"
            aria-live="polite"
            className="mb-8 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
          >
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{t("emotionalSupport.banners.success")}</p>
          </div>
        )}
        {returnStatus === "pending" && (
          <div
            role="status"
            aria-live="polite"
            className="mb-8 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
          >
            <Clock3 className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{t("emotionalSupport.banners.pending")}</p>
          </div>
        )}
        {returnStatus === "cancelled" && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-8 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
          >
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{t("emotionalSupport.banners.cancelled")}</p>
          </div>
        )}
        {returnStatus === "error" && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-8 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
          >
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{t("emotionalSupport.banners.error")}</p>
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t("emotionalSupport.forWhom.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {tList("emotionalSupport.forWhom.items").map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t("emotionalSupport.includes.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {tList("emotionalSupport.includes.items").map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t("emotionalSupport.provider.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("emotionalSupport.provider.text")}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-purple-50 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t("emotionalSupport.price.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              {t("emotionalSupport.price.amount")}{" "}
              <span className="text-lg font-normal text-gray-600 dark:text-gray-300">{t("emotionalSupport.price.per")}</span>
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t("emotionalSupport.price.text")}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t("emotionalSupport.booking.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBookAndPay} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-2">
                  {t("emotionalSupport.booking.chooseTimeLabel")}
                </label>

                {slotsLoading && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("emotionalSupport.booking.loadingSlots")}
                  </p>
                )}

                {!slotsLoading && slotsError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {t("emotionalSupport.errors.generic")}
                  </p>
                )}

                {!slotsLoading && !slotsError && groupedDates.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("emotionalSupport.booking.noSlotsAtAll")}
                  </p>
                )}

                {!slotsLoading && !slotsError && groupedDates.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                        {groupedDates.map((day) => (
                          <button
                            key={day.dateKey}
                            type="button"
                            onClick={() => {
                              setSelectedDate(day.dateKey);
                              setSelectedSlot(null);
                            }}
                            disabled={paymentState === "loading"}
                            className={`px-4 py-2 rounded-xl text-sm border text-left transition-colors ${
                              selectedDate === day.dateKey
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-purple-400"
                            }`}
                          >
                            {day.dateLabel}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                        {selectedDayTimes.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("emotionalSupport.booking.noSlotsForDay")}
                          </p>
                        )}
                        {selectedDayTimes.map((slot) => (
                          <button
                            key={slot.iso}
                            type="button"
                            onClick={() => setSelectedSlot(slot.iso)}
                            disabled={paymentState === "loading"}
                            className={`px-4 py-2 rounded-xl text-sm border text-left transition-colors ${
                              selectedSlot === slot.iso
                                ? "bg-purple-600 text-white border-purple-600"
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-purple-400"
                            }`}
                          >
                            {slot.timeLabel}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedSlot && (
                      <p className="mt-3 text-sm text-purple-700 dark:text-purple-400">
                        {t("emotionalSupport.booking.selectedPrefix")} {formatFullSlot(selectedSlot, lang)}{" "}
                        {t("emotionalSupport.booking.timezoneNote")}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="payer-name" className="block text-gray-700 dark:text-gray-200 mb-2">
                    {t("emotionalSupport.booking.nameLabel")}
                  </label>
                  <input
                    type="text"
                    id="payer-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={paymentState === "loading"}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    placeholder={t("emotionalSupport.booking.namePlaceholder")}
                  />
                </div>
                <div>
                  <label htmlFor="payer-email" className="block text-gray-700 dark:text-gray-200 mb-2">
                    {t("emotionalSupport.booking.emailLabel")}
                  </label>
                  <input
                    type="email"
                    id="payer-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={paymentState === "loading"}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    placeholder={t("emotionalSupport.booking.emailPlaceholder")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="payer-phone" className="block text-gray-700 dark:text-gray-200 mb-2">
                    {t("emotionalSupport.booking.phoneLabel")}
                  </label>
                  <input
                    type="tel"
                    id="payer-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={paymentState === "loading"}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    placeholder={t("emotionalSupport.booking.phonePlaceholder")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="payer-message" className="block text-gray-700 dark:text-gray-200 mb-2">
                    {t("emotionalSupport.booking.messageLabel")}
                  </label>
                  <textarea
                    id="payer-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    disabled={paymentState === "loading"}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all resize-y"
                    placeholder={t("emotionalSupport.booking.messagePlaceholder")}
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {t("emotionalSupport.booking.messageHint")}
                  </p>
                </div>
              </div>

              {paymentState === "error" && errorMessage && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={paymentState === "loading"}>
                {paymentState === "loading" ? t("emotionalSupport.booking.redirecting") : t("emotionalSupport.booking.bookPay")}
              </Button>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {t("emotionalSupport.booking.paytrailNote")}
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
            {t("emotionalSupport.ask.title")}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            {t("emotionalSupport.ask.text")}
          </p>
          <Button className="mt-6" size="lg" variant="outline" asChild>
            <Link to="/contact">{t("emotionalSupport.ask.button")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EmotionalSupport;
