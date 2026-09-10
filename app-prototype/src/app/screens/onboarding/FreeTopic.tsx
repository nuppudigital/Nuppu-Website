import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldAlert, Info } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { Button } from '../../components/Button';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { isTopicBlocked } from '../../utils/topicFilter';

export function FreeTopic() {
  const { t, tRaw } = useLanguage();
  const navigate = useNavigate();
  const { freeTopic, setFreeTopic } = useChild();
  const [draft, setDraft] = useState(freeTopic);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const blocked = isTopicBlocked(draft);
  const suggestions = tRaw<string[]>('freeTopic.suggestions');

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate('/onboarding/interests')} title={t('freeTopic.header')} />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-4">
        <input
          autoFocus
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setSelectedSuggestion(null);
          }}
          placeholder={t('onboardingInterests.freeTopicPlaceholder')}
          className={`w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-base font-semibold text-nuppu-dark outline-none ${
            blocked ? 'border-nuppu-amber-border' : 'border-nuppu-border focus:border-nuppu-blue-deep'
          }`}
        />

        {blocked && (
          <div className="flex flex-col gap-3 rounded-2xl bg-nuppu-amber-bg p-4">
            <div className="flex items-start gap-2.5 text-sm text-nuppu-amber-text">
              <ShieldAlert size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">{t('freeTopic.calloutTitle')}</p>
                <p className="mt-1">{t('freeTopic.calloutBody')}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-nuppu-amber-text">
                {t('freeTopic.suggestionsLabel')}
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setSelectedSuggestion(suggestion)}
                    className={`rounded-2xl border-2 bg-white px-4 py-3 text-left text-sm font-semibold ${
                      selectedSuggestion === suggestion ? 'border-nuppu-amber-border' : 'border-transparent'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-2xl bg-nuppu-lavender-light p-4 text-sm text-nuppu-dark">
          <Info size={18} className="mt-0.5 shrink-0 text-nuppu-blue-deep" />
          <div>
            <p className="font-bold">{t('freeTopic.demoTitle')}</p>
            <p className="mt-1 text-nuppu-secondary">{t('freeTopic.demoBody')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-10">
        {blocked ? (
          <>
            <Button
              disabled={!selectedSuggestion}
              onClick={() => {
                setFreeTopic(selectedSuggestion ?? '');
                navigate('/onboarding/interests');
              }}
            >
              {t('freeTopic.chooseSuggestion')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFreeTopic('');
                navigate('/onboarding/interests');
              }}
            >
              {t('freeTopic.skip')}
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              setFreeTopic(draft);
              navigate('/onboarding/interests');
            }}
          >
            {t('common.done')}
          </Button>
        )}
      </div>
    </MobileScreen>
  );
}
