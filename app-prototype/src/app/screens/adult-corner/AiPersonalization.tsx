import { useNavigate } from 'react-router';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { Toggle } from '../../components/Toggle';
import { Chip } from '../../components/Chip';
import { PERSONALIZATION_THEME_LIST } from '../../data/interestTags';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function AiPersonalization() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { name, personalizationOn, setPersonalizationOn, permittedThemes, toggleTheme, freeTopicAllowed, setFreeTopicAllowed } =
    useChild();

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate('/adults')} title={t('aiPersonalization.title')} />
      <div className="flex flex-1 flex-col gap-5 px-6 pt-3 pb-8">
        <div className="card-soft flex items-start gap-3 p-4">
          <div className="flex-1">
            <p className="font-bold text-nuppu-dark">{t('aiPersonalization.toggleTitle')}</p>
            <p className="mt-1 text-sm text-nuppu-gray">{t('aiPersonalization.toggleDesc')}</p>
          </div>
          <Toggle checked={personalizationOn} onChange={setPersonalizationOn} label={t('aiPersonalization.toggleTitle')} />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-nuppu-gray">{t('aiPersonalization.previewLabel')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border-2 border-nuppu-blue-deep bg-white p-3">
              <span className="chip chip-selected mb-2">{t('aiPersonalization.on')}</span>
              <p className="text-sm text-nuppu-dark">{t('aiPersonalization.previewOn', { name })}</p>
            </div>
            <div className="rounded-2xl border-2 border-nuppu-border bg-white p-3">
              <span className="chip mb-2">{t('aiPersonalization.off')}</span>
              <p className="text-sm text-nuppu-dark">{t('aiPersonalization.previewOff')}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-nuppu-gray">{t('aiPersonalization.permittedThemes')}</p>
          <div className="flex flex-wrap gap-2">
            {PERSONALIZATION_THEME_LIST.map((theme) => (
              <Chip key={theme} selected={permittedThemes.includes(theme)} onClick={() => toggleTheme(theme)}>
                {t(`aiPersonalization.themes.${theme}`)}
              </Chip>
            ))}
          </div>
        </div>

        <div className="card-soft flex items-center gap-3 p-4">
          <div className="flex-1">
            <p className="font-bold text-nuppu-dark">{t('aiPersonalization.freeTopicAllowed')}</p>
            <p className="mt-1 text-sm text-nuppu-gray">{t('aiPersonalization.freeTopicAllowedDesc')}</p>
          </div>
          <Toggle checked={freeTopicAllowed} onChange={setFreeTopicAllowed} label={t('aiPersonalization.freeTopicAllowed')} />
        </div>

        <button
          className="text-center text-sm font-bold text-nuppu-red"
          onClick={() => setPersonalizationOn(false)}
        >
          {t('aiPersonalization.disable')}
        </button>
      </div>
    </MobileScreen>
  );
}
