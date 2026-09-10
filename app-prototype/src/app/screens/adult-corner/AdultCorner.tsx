import { ChevronRight, Sparkles, Lightbulb, Mail, ShieldCheck, CreditCard, User, Globe, MessageCircle, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileScreen } from '../../components/MobileScreen';
import { BottomNav } from '../../components/BottomNav';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface Row {
  id: string;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
  path: string;
}

const ROWS: Row[] = [
  { id: 'aiPersonalization', icon: Sparkles, bg: 'bg-nuppu-lavender-light', iconColor: 'text-nuppu-blue-deep', path: '/adults/ai-personalization' },
  { id: 'microSupport', icon: Lightbulb, bg: 'bg-nuppu-butter-light', iconColor: 'text-[#a37f1f]', path: '/adults/micro-support' },
  { id: 'nuppuLetter', icon: Mail, bg: 'bg-nuppu-peach-light', iconColor: 'text-[#c1573f]', path: '/adults/nuppu-letter' },
  { id: 'safety', icon: ShieldCheck, bg: 'bg-nuppu-mint-light', iconColor: 'text-[#3f7a4a]', path: '/adults/ai-safety' },
  { id: 'subscription', icon: CreditCard, bg: 'bg-nuppu-butter-light', iconColor: 'text-[#a37f1f]', path: '/adults/subscription' },
  { id: 'childProfiles', icon: User, bg: 'bg-nuppu-off-white', iconColor: 'text-nuppu-secondary', path: '/adults/child-profiles' },
  { id: 'language', icon: Globe, bg: 'bg-nuppu-lavender-light', iconColor: 'text-nuppu-blue-deep', path: '/adults/language' },
  { id: 'feedback', icon: MessageCircle, bg: 'bg-nuppu-off-white', iconColor: 'text-nuppu-secondary', path: '/adults/feedback' },
];

export function AdultCorner() {
  const { t, tRaw } = useLanguage();
  const navigate = useNavigate();
  const { name, personalizationOn, subscriptionPlan } = useChild();

  const describe = (id: string): string => {
    if (id === 'aiPersonalization') return t(`adultCorner.items.aiPersonalization.${personalizationOn ? 'on' : 'off'}`);
    if (id === 'childProfiles') return t('adultCorner.items.childProfiles.desc', { name });
    if (id === 'subscription') {
      return `${t(`subscription.${subscriptionPlan}.name`)} · ${t(`subscription.${subscriptionPlan}.price`)}${t('subscription.perMonth')}`;
    }
    const hasDesc = typeof tRaw(`adultCorner.items.${id}.desc`) === 'string';
    return hasDesc ? t(`adultCorner.items.${id}.desc`) : '';
  };

  return (
    <MobileScreen nav={<BottomNav />}>
      <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-nuppu-dark">{t('adultCorner.title')}</h1>
          <p className="mt-1 text-sm text-nuppu-secondary">{t('adultCorner.subtitle')}</p>
        </div>

        <div className="card-soft divide-y divide-nuppu-border">
          {ROWS.map((row) => {
            const Icon = row.icon;
            const desc = describe(row.id);
            return (
              <button
                key={row.id}
                onClick={() => navigate(row.path)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${row.bg}`}>
                  <Icon size={18} className={row.iconColor} />
                </span>
                <span className="flex-1">
                  <span className="block font-bold text-nuppu-dark">{t(`adultCorner.items.${row.id}.label`)}</span>
                  {desc && <span className="block text-sm text-nuppu-gray">{desc}</span>}
                </span>
                <ChevronRight size={18} className="text-nuppu-gray" />
              </button>
            );
          })}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-nuppu-gray">Prototype tools</p>
          <button
            onClick={() => navigate('/story-admin')}
            className="card-soft flex w-full items-center gap-3 p-4 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nuppu-off-white">
              <Wrench size={18} className="text-nuppu-secondary" />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-nuppu-dark">Story Admin</span>
              <span className="block text-sm text-nuppu-gray">Add or edit stories, audio and photos</span>
            </span>
            <ChevronRight size={18} className="text-nuppu-gray" />
          </button>
        </div>
      </div>
    </MobileScreen>
  );
}
