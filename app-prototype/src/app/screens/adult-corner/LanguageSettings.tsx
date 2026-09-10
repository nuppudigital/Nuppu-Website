import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { useLanguage, type Lang } from '../../i18n/LanguageContext';

export function LanguageSettings() {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const options: { id: Lang; labelKey: string }[] = [
    { id: 'en', labelKey: 'languageSettings.english' },
    { id: 'fi', labelKey: 'languageSettings.finnish' },
  ];

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate(-1)} title={t('languageSettings.title')} />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-3 pb-8">
        <p className="text-sm text-nuppu-secondary">{t('languageSettings.description')}</p>
        <div className="card-soft divide-y divide-nuppu-border">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setLanguage(option.id)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="font-bold text-nuppu-dark">{t(option.labelKey)}</span>
              {language === option.id && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-nuppu-blue-deep">
                  <Check size={14} className="text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </MobileScreen>
  );
}
