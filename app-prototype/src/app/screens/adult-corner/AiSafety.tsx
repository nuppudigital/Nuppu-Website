import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { useLanguage } from '../../i18n/LanguageContext';

interface Step {
  title: string;
  desc: string;
}

const STEP_COLORS = ['bg-nuppu-mint text-[#2f5c39]', 'bg-nuppu-blue-light text-[#3a2f7a]', 'bg-nuppu-lavender text-nuppu-blue-deep', 'bg-nuppu-butter text-[#8a641f]', 'bg-nuppu-peach text-[#a24a2d]'];

export function AiSafety() {
  const { t, tRaw } = useLanguage();
  const navigate = useNavigate();
  const steps = tRaw<Step[]>('aiSafety.steps');

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate(-1)} title={t('aiSafety.title')} />
      <div className="flex flex-1 flex-col gap-5 px-6 pt-3 pb-8">
        <p className="text-sm leading-relaxed text-nuppu-secondary">{t('aiSafety.subtitle')}</p>

        <div className="card-soft p-4">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display font-bold ${STEP_COLORS[i]}`}
                >
                  {i + 1}
                </span>
                {i < steps.length - 1 && <span className="my-1 w-px flex-1 bg-nuppu-border" />}
              </div>
              <div className={i < steps.length - 1 ? 'pb-5' : ''}>
                <p className="font-bold text-nuppu-dark">{step.title}</p>
                <p className="text-sm text-nuppu-gray">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-nuppu-amber-bg p-4 text-sm text-nuppu-amber-text">
          <p className="text-xs font-bold uppercase tracking-wide">{t('aiSafety.demoTitle')}</p>
          <p className="mt-1">{t('aiSafety.demoBody')}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['noProfiling', 'noConversation', 'dataInEU'] as const).map((badge) => (
            <div key={badge} className="flex flex-col items-center gap-1.5 rounded-2xl border border-nuppu-border p-3 text-center">
              <Check size={18} className="text-nuppu-green" />
              <span className="text-xs font-bold text-nuppu-dark">{t(`aiSafety.badges.${badge}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </MobileScreen>
  );
}
