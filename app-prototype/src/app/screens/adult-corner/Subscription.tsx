import { useNavigate } from 'react-router';
import { Check, Minus } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { useChild, type SubscriptionPlan } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface Feature {
  text: string;
  included: boolean;
}

function PlanCard({ plan, highlighted }: { plan: SubscriptionPlan; highlighted: boolean }) {
  const { t, tRaw } = useLanguage();
  const { subscriptionPlan } = useChild();
  const features = tRaw<Feature[]>(`subscription.${plan}.features`);

  return (
    <div className={`card-soft p-4 ${highlighted ? 'border-2 border-nuppu-blue-deep bg-nuppu-lavender-light' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold text-nuppu-dark">{t(`subscription.${plan}.name`)}</p>
        {subscriptionPlan === plan && (
          <span className="rounded-full bg-nuppu-butter px-3 py-1 text-xs font-bold text-[#8a641f]">
            {t('subscription.current')}
          </span>
        )}
      </div>
      <p className="mt-1">
        <span className="font-display text-2xl font-bold text-nuppu-dark">{t(`subscription.${plan}.price`)}</span>
        <span className="text-sm font-semibold text-nuppu-gray"> {t('subscription.perMonth')}</span>
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {features.map((feature) => (
          <li
            key={feature.text}
            className={`flex items-start gap-2 text-sm ${feature.included ? 'text-nuppu-dark' : 'text-nuppu-gray'}`}
          >
            {feature.included ? (
              <Check size={16} className="mt-0.5 shrink-0 text-nuppu-green" />
            ) : (
              <Minus size={16} className="mt-0.5 shrink-0 text-nuppu-border" />
            )}
            {feature.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Subscription() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate(-1)} title={t('subscription.title')} />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-3 pb-8">
        <PlanCard plan="basic" highlighted={false} />
        <PlanCard plan="premium" highlighted />

        <div className="rounded-2xl bg-nuppu-lavender-light p-4 text-sm text-nuppu-dark">{t('subscription.billingNote')}</div>
        <div className="rounded-2xl bg-nuppu-amber-bg p-4 text-sm text-nuppu-amber-text">
          <strong>{t('subscription.demoNote').split(':')[0]}:</strong>
          {t('subscription.demoNote').split(':').slice(1).join(':')}
        </div>
      </div>
    </MobileScreen>
  );
}
