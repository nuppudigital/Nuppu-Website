import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import en from './en.json';
import fi from './fi.json';

export type Lang = 'en' | 'fi';

const dictionaries: Record<Lang, unknown> = { en, fi };

const STORAGE_KEY = 'nuppu-app-lang';

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function interpolate(value: string, vars?: Record<string, string | number>): string {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, key) => {
    const replacement = vars[key];
    return replacement === undefined ? match : String(replacement);
  });
}

interface LanguageContextValue {
  language: Lang;
  otherLanguage: Lang;
  setLanguage: (lang: Lang) => void;
  toggleLanguage: () => void;
  /** Translate a dot-path key, optionally interpolating {placeholders}, for a given language (defaults to current). */
  t: (key: string, vars?: Record<string, string | number>, lang?: Lang) => string;
  /** Get the raw value at a dot-path key (for arrays/objects), for a given language (defaults to current). */
  tRaw: <T = unknown>(key: string, lang?: Lang) => T;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLanguage(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'en' || stored === 'fi' ? stored : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>(readInitialLanguage);

  const setLanguage = (lang: Lang) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage unavailable — language just won't persist across reloads
    }
  };

  const toggleLanguage = () => setLanguage(language === 'fi' ? 'en' : 'fi');

  const value = useMemo<LanguageContextValue>(() => {
    const otherLanguage: Lang = language === 'fi' ? 'en' : 'fi';

    const tRaw = <T,>(key: string, lang: Lang = language): T => {
      return getByPath(dictionaries[lang], key) as T;
    };

    const t = (key: string, vars?: Record<string, string | number>, lang: Lang = language): string => {
      const raw = tRaw<unknown>(key, lang);
      if (typeof raw === 'string') return interpolate(raw, vars);
      if (raw === undefined) return key;
      return String(raw);
    };

    return { language, otherLanguage, setLanguage, toggleLanguage, t, tRaw };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
