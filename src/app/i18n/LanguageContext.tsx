import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import fi from "./fi.json";
import en from "./en.json";

export type Lang = "fi" | "en";

const translations: Record<Lang, unknown> = { fi, en };
const STORAGE_KEY = "nuppu-lang";
const DEFAULT_LANG: Lang = "fi";

function getStoredLang(): Lang {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "fi" || value === "en" ? value : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function lookup(lang: Lang, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (obj, k) => (obj && typeof obj === "object" ? (obj as Record<string, unknown>)[k] : undefined),
      translations[lang],
    );
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a key to a string, e.g. t("home.heroTitle") */
  t: (key: string) => string;
  /** Translate a key to a string array, e.g. tList("emotionalSupport.forWhom.items") */
  tList: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore write failures (e.g. private browsing).
    }
  };

  const t = (key: string): string => {
    const value = lookup(lang, key);
    if (typeof value === "string") return value;
    // Fall back to English, then to the key itself so missing keys are visible.
    const fallback = lookup("en", key);
    return typeof fallback === "string" ? fallback : key;
  };

  const tList = (key: string): string[] => {
    const value = lookup(lang, key);
    if (Array.isArray(value)) return value as string[];
    const fallback = lookup("en", key);
    return Array.isArray(fallback) ? (fallback as string[]) : [key];
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tList }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
