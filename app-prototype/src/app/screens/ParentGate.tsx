import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { useLanguage } from '../i18n/LanguageContext';

const HOLD_MS = 3000;

export function ParentGate() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const stop = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(0);
  };

  const start = () => {
    const startedAt = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, (elapsed / HOLD_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        stop();
        navigate('/adults');
      }
    }, 30);
  };

  useEffect(() => stop, []);

  return (
    <MobileScreen bgClassName="bg-[#8f8a9e]">
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="w-full rounded-3xl bg-white p-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-nuppu-lavender-light">
            <Lock size={24} className="text-nuppu-blue-deep" />
          </div>
          <h1 className="font-display text-xl font-bold text-nuppu-dark">{t('parentGate.title')}</h1>
          <p className="mt-2 text-sm text-nuppu-secondary">{t('parentGate.instructions')}</p>

          <button
            className="relative mt-6 w-full overflow-hidden rounded-full bg-nuppu-blue-light py-4 font-display font-bold text-white select-none"
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
          >
            <span
              className="absolute inset-y-0 left-0 bg-nuppu-blue-deep transition-[width]"
              style={{ width: `${progress}%` }}
            />
            <span className="relative">{t('parentGate.holdButton')}</span>
          </button>

          <p className="mt-3 text-xs text-nuppu-gray">{t('parentGate.note')}</p>
          <button className="mt-4 text-sm font-bold text-nuppu-blue-deep" onClick={() => navigate('/home')}>
            {t('parentGate.backToChild')}
          </button>
        </div>
      </div>
    </MobileScreen>
  );
}
