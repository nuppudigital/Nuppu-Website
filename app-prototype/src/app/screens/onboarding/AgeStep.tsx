import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { Bilingual } from '../../components/Bilingual';
import { Button } from '../../components/Button';
import { AiConsentFlow } from '../../components/AiConsentFlow';
import { AGE_BAND_LIST } from '../../data/ageBands';
import { useChild, type AgeBand } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function AgeStep() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { ageBand, setAgeBand, consentGiven, setConsentGiven } = useChild();

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate('/onboarding/name')} progress={2 / 3} stepLabel="2/3" />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-4">
        <Bilingual
          k="onboardingAge.title"
          as="h1"
          className="font-display text-2xl font-bold text-nuppu-dark"
          secondaryClassName="mt-1 text-sm"
        />

        <div className="flex flex-col gap-3">
          {AGE_BAND_LIST.map((band) => {
            const selected = ageBand === band.id;
            return (
              <button
                key={band.id}
                type="button"
                onClick={() => setAgeBand(band.id as AgeBand)}
                className={`card-soft flex items-center gap-4 p-4 text-left ${
                  selected ? 'border-nuppu-blue-deep bg-nuppu-lavender-light' : ''
                }`}
              >
                <span className="text-2xl">{band.icon}</span>
                <span className="flex-1">
                  <span className={`block font-display font-bold ${selected ? 'text-nuppu-blue-deep' : 'text-nuppu-dark'}`}>
                    {t(`ageBands.${band.id}.name`)}
                  </span>
                  <span className="block text-sm text-nuppu-gray">{t(`ageBands.${band.id}.range`)}</span>
                  <span className="mt-1 block text-sm text-nuppu-secondary">{t(`ageBands.${band.id}.desc`)}</span>
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-nuppu-blue-deep bg-nuppu-blue-deep' : 'border-nuppu-border'
                  }`}
                >
                  {selected && <Check size={16} className="text-white" />}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-sm leading-relaxed text-nuppu-gray">{t('onboardingAge.footer')}</p>
      </div>
      <div className="px-6 pb-10">
        <Button onClick={() => navigate('/onboarding/interests')}>{t('common.continue')}</Button>
      </div>

      {!consentGiven && (
        <AiConsentFlow onAccept={() => setConsentGiven(true)} onCancel={() => navigate('/onboarding/name')} />
      )}
    </MobileScreen>
  );
}
