import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { useLanguage } from '../i18n/LanguageContext';

export function Splash() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const fillTimer = setTimeout(() => setFilled(true), 80);
    const navTimer = setTimeout(() => navigate('/login'), 1900);
    return () => {
      clearTimeout(fillTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <MobileScreen bgClassName="bg-nuppu-butter">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 text-center">
        <svg width="72" height="52" viewBox="0 0 72 52" fill="none">
          <path
            d="M14 4C10 16 10 28 20 36C20 24 22 16 28 8"
            stroke="#b7a3e6"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M58 4C62 16 62 28 52 36C52 24 50 16 44 8"
            stroke="#b7a3e6"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <h1 className="font-display text-5xl font-extrabold tracking-wide text-[#b7a3e6]">NUPPU</h1>
        <p className="font-display text-lg font-semibold text-nuppu-secondary">{t('splash.tagline')}</p>
      </div>
      <div className="flex flex-col items-center gap-3 px-10 pb-12">
        <div className="h-2 w-full max-w-[220px] overflow-hidden rounded-full bg-white/40">
          <div
            className="h-full rounded-full bg-[#b7a3e6] transition-[width] duration-[1700ms] ease-out"
            style={{ width: filled ? '100%' : '0%' }}
          />
        </div>
        <p className="text-sm font-semibold text-nuppu-secondary">{t('splash.preparing')}</p>
        <p className="mt-2 text-xs font-semibold text-nuppu-secondary/70">{t('splash.footer')}</p>
      </div>
    </MobileScreen>
  );
}
