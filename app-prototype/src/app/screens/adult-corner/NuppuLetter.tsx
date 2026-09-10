import { useNavigate } from 'react-router';
import { Mail } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { useLanguage } from '../../i18n/LanguageContext';

export function NuppuLetter() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate(-1)} title={t('nuppuLetter.title')} />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-3 pb-8">
        <div className="card-soft flex items-center gap-3 bg-nuppu-peach-light p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
            <Mail size={20} className="text-[#c1573f]" />
          </span>
          <p className="font-bold text-nuppu-dark">{t('nuppuLetter.theme')}</p>
        </div>
        <p className="text-sm leading-relaxed text-nuppu-secondary">{t('nuppuLetter.body')}</p>
        <p className="text-sm leading-relaxed text-nuppu-dark">{t('nuppuLetter.closing')}</p>
      </div>
    </MobileScreen>
  );
}
