import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { useLanguage, type Lang } from '../i18n/LanguageContext';
import nuppuMark from '../../assets/png/NUPPU MARK.png';

export function Splash() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const fillTimer = setTimeout(() => setFilled(true), 80);
    return () => clearTimeout(fillTimer);
  }, []);

  const languages: { id: Lang; label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'fi', label: 'FI' },
  ];

  function choose(lang: Lang) {
    setLanguage(lang);
    navigate('/welcome');
  }

  return (
    <MobileScreen bgClassName="bg-nuppu-butter">
      <div className="flex justify-center gap-2 pt-6">
        {languages.map((option) => (
          <button
            key={option.id}
            onClick={() => choose(option.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              language === option.id ? 'bg-[#b7a3e6] text-white' : 'bg-white/50 text-nuppu-secondary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 text-center">
        <img src={nuppuMark} alt="Nuppu" className="h-24 w-24 object-contain" />
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
