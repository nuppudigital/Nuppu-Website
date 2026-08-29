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
    // some private-browsing modes throw here, just show the banner again
    return null;
  }
}

function storeConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // same deal, ignore and let the banner reappear next time
  }
}

// GDPR cookie banner. We don't set any non-essential cookies yet, but the banner is
// here so that whenever analytics gets added later, it can gate on getStoredConsent() === "accepted"
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
      className="fixed bottom-0 inset-x-0 z-50 border-t border-[#E7E1D2] bg-white/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-[#55504A] leading-relaxed flex-1">
          {t("cookieConsent.message")}{" "}
          <Link to="/cookies" className="text-[#6E4FD1] hover:underline">
            {t("cookieConsent.policyLink")}
          </Link>
          .
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleChoice("essential-only")}
            className="px-4 py-2 text-sm rounded-full border border-[#C9BBF5] text-[#35322B] hover:bg-[#F2EDDE] transition-colors"
          >
            {t("cookieConsent.essentialOnly")}
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="px-4 py-2 text-sm rounded-full bg-[#6E4FD1] text-white hover:bg-[#5E3FC0] transition-colors"
          >
            {t("cookieConsent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
