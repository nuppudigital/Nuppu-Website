import type { ElementType } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Renders the active-language text plus a smaller italic caption in the
 * other language beneath it. Used only on the trust-sensitive onboarding
 * screens (sign-in, consent, profile setup) where showing both languages
 * side by side matters; the rest of the app just uses t() directly.
 */
export function Bilingual({
  k,
  vars,
  as: As = 'p',
  className = '',
  secondaryClassName = '',
}: {
  k: string;
  vars?: Record<string, string | number>;
  as?: ElementType;
  className?: string;
  secondaryClassName?: string;
}) {
  const { t, otherLanguage } = useLanguage();

  return (
    <div>
      <As className={className}>{t(k, vars)}</As>
      <p className={`italic text-nuppu-gray ${secondaryClassName}`}>{t(k, vars, otherLanguage)}</p>
    </div>
  );
}
