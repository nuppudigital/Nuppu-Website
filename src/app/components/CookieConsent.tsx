import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

const CONSENT_STORAGE_KEY = "nuppu-cookie-consent";

type ConsentValue = "accepted" | "essential-only";

function getStoredConsent(): ConsentValue | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "accepted" || value === "essential-only" ? value : null;
  } catch {
    // localStorage can throw in some privacy modes - fail safe by showing the banner.
    return null;
  }
}

function storeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Ignore write failures (e.g. private browsing) - banner will just reappear.
  }
}

/**
 * Simple EU/GDPR-style cookie consent banner.
 *
 * Nuppu currently only sets strictly necessary cookies (none at the time of
 * writing - no analytics or marketing pixels are wired in). This banner is
 * added ahead of that so that non-essential cookies (analytics, etc.) are
 * never set without consent, per ePrivacy/GDPR requirements.
 *
 * FLAGGED BUSINESS DECISION: if/when analytics (e.g. Plausible) or any other
 * non-essential script is added, it must only load after `getStoredConsent()
 * === "accepted"` - this component does not yet gate any such script because
 * none exists yet.
 */
export default function CookieConsent() {
  const { t } = useLanguage();
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConsent(getStoredConsent());
    setHydrated(true);
  }, []);

  if (!hydrated || consent) {
    return null;
  }

  const handleChoice = (value: ConsentValue) => {
    storeConsent(value);
    setConsent(value);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-[#E2E8F0] bg-white/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-[#4A5568] leading-relaxed flex-1">
          {t("cookieConsent.message")}{" "}
          <Link to="/cookies" className="text-[#6B9AC4] hover:underline">
            {t("cookieConsent.policyLink")}
          </Link>
          .
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleChoice("essential-only")}
            className="px-4 py-2 text-sm rounded-full border border-[#A8D5E2] text-[#2D3748] hover:bg-[#F7F6F3] transition-colors"
          >
            {t("cookieConsent.essentialOnly")}
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="px-4 py-2 text-sm rounded-full bg-[#6B9AC4] text-white hover:bg-[#5a89b3] transition-colors"
          >
            {t("cookieConsent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
