import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck, Plus, X } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { Bilingual } from '../../components/Bilingual';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { INTEREST_TAG_LIST } from '../../data/interestTags';
import { useChild, MAX_CUSTOM_INTERESTS } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function InterestsStep() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    name,
    interests,
    toggleInterest,
    customInterests,
    addCustomInterest,
    removeCustomInterest,
    setOnboardingComplete,
  } = useChild();
  const [customInput, setCustomInput] = useState('');

  const customLimitReached = customInterests.length >= MAX_CUSTOM_INTERESTS;

  function submitCustomInterest() {
    if (!customInput.trim() || customLimitReached) return;
    addCustomInterest(customInput);
    setCustomInput('');
  }

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
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-nuppu-gray">
              {t('onboardingInterests.customLabel')}
            </span>
            <span className="text-xs text-nuppu-gray">
              {customInterests.length}/{MAX_CUSTOM_INTERESTS}
            </span>
          </div>

          {customInterests.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {customInterests.map((label) => (
                <Chip key={label} selected onClick={() => removeCustomInterest(label)}>
                  {label} <X size={12} />
                </Chip>
              ))}
            </div>
          )}

          {!customLimitReached && (
            <div className="flex gap-2">
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitCustomInterest();
                  }
                }}
                placeholder={t('onboardingInterests.customPlaceholder')}
                className="flex-1 rounded-2xl border-2 border-nuppu-border bg-white px-4 py-2.5 text-sm font-semibold text-nuppu-dark"
              />
              <button
                type="button"
                onClick={submitCustomInterest}
                disabled={!customInput.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-nuppu-blue-deep text-white disabled:opacity-40"
                aria-label={t('onboardingInterests.customAdd')}
              >
                <Plus size={18} />
              </button>
            </div>
          )}
          <p className="mt-1.5 text-xs text-nuppu-gray">{t('onboardingInterests.customHint')}</p>
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
