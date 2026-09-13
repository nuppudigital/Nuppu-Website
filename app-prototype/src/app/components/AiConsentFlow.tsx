import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { Bilingual } from './Bilingual';
import { Button } from './Button';
import { useLanguage } from '../i18n/LanguageContext';

export function AiConsentFlow({ onAccept, onCancel }: { onAccept: () => void; onCancel: () => void }) {
  const { t, tRaw } = useLanguage();
  const [agreed, setAgreed] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const bullets = tRaw<string[]>('aiInfo.bullets');

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-[#322d47]/60 sm:items-center">
      {!showInfo ? (
        <div className="w-full rounded-t-3xl bg-white p-6 sm:max-w-sm sm:rounded-3xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-nuppu-lavender-light">
            <Sparkles size={22} className="text-nuppu-blue-deep" />
          </div>
          <Bilingual
            k="aiConsent.title"
            as="h2"
            className="font-display text-xl font-bold text-nuppu-dark"
            secondaryClassName="mt-1 text-sm"
          />
          <p className="mt-3 text-sm leading-relaxed text-nuppu-secondary">{t('aiConsent.body')}</p>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-nuppu-lavender-light p-3.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 accent-[#6e4fd1]"
            />
            <span className="text-sm font-semibold text-nuppu-dark">{t('aiConsent.checkbox')}</span>
          </label>

          <button type="button" className="mt-4 text-sm font-bold text-nuppu-blue-deep underline" onClick={() => setShowInfo(true)}>
            {t('aiConsent.learnMore')}
          </button>

          <div className="mt-5 flex flex-col gap-3">
            <Button disabled={!agreed} onClick={onAccept}>
              {t('aiConsent.accept')}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              {t('aiConsent.cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-t-3xl bg-white p-6 sm:max-w-sm sm:rounded-3xl">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-nuppu-border sm:hidden" />
          <Bilingual
            k="aiInfo.title"
            as="h2"
            className="font-display text-xl font-bold text-nuppu-dark"
            secondaryClassName="mt-1 text-sm"
          />
          <ul className="mt-4 flex flex-col gap-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm leading-relaxed text-nuppu-dark">
                <Check size={18} className="mt-0.5 shrink-0 text-nuppu-green" />
                {bullet}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl bg-nuppu-amber-bg p-4 text-sm text-nuppu-amber-text">
            <strong>{t('aiInfo.calloutTitle')}</strong> {t('aiInfo.calloutBody')}
          </div>
          <div className="mt-5">
            <Button variant="outline" onClick={() => setShowInfo(false)}>
              {t('aiInfo.close')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
