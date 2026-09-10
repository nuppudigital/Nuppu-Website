import { useNavigate } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { Bilingual } from '../../components/Bilingual';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { INTEREST_TAG_LIST } from '../../data/interestTags';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function InterestsStep() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { name, interests, toggleInterest, freeTopic, setOnboardingComplete } = useChild();

  const wordCount = freeTopic.trim() ? freeTopic.trim().split(/\s+/).length : 0;

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate('/onboarding/age')} progress={3 / 3} stepLabel="3/3" />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-6">
        <Bilingual
          k="onboardingInterests.title"
          vars={{ name }}
          as="h1"
          className="font-display text-2xl font-bold text-nuppu-dark"
          secondaryClassName="mt-1 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          {INTEREST_TAG_LIST.map((tag) => (
            <Chip key={tag.id} selected={interests.includes(tag.id)} onClick={() => toggleInterest(tag.id)}>
              <span>{tag.emoji}</span> {t(`interestTags.${tag.id}`)}
            </Chip>
          ))}
        </div>

        <div className="mt-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-nuppu-gray">
            {t('onboardingInterests.freeTopicLabel')}
          </span>
          <button
            type="button"
            onClick={() => navigate('/onboarding/free-topic')}
            className="w-full rounded-2xl border-2 border-nuppu-border bg-white px-4 py-3.5 text-left text-base font-semibold text-nuppu-dark"
          >
            {freeTopic || <span className="text-nuppu-gray font-normal">{t('onboardingInterests.freeTopicPlaceholder')}</span>}
          </button>
          <div className="mt-1.5 flex items-center justify-between text-xs text-nuppu-gray">
            <span>{t('onboardingInterests.freeTopicHint')}</span>
            <span>{wordCount}/3</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl bg-nuppu-amber-bg p-4 text-sm text-nuppu-amber-text">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          {t('onboardingInterests.callout')}
        </div>
      </div>
      <div className="px-6 pb-10">
        <Button
          onClick={() => {
            setOnboardingComplete(true);
            navigate('/onboarding/child-card');
          }}
        >
          {t('onboardingInterests.done')}
        </Button>
      </div>
    </MobileScreen>
  );
}
