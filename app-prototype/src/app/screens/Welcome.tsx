import { useNavigate } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { Bilingual } from '../components/Bilingual';
import { Button } from '../components/Button';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { useLanguage } from '../i18n/LanguageContext';

export function Welcome() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <MobileScreen bgClassName="bg-nuppu-butter-light">
      <div className="flex flex-1 flex-col px-6 pt-6">
        <div className="card-soft p-5">
          <Bilingual
            k="welcome.greeting"
            as="h1"
            className="font-display text-xl font-bold text-nuppu-dark"
            secondaryClassName="mt-2 text-sm"
          />
          <p className="mt-3 text-sm leading-relaxed text-nuppu-secondary">{t('welcome.body')}</p>
        </div>

        <div className="flex flex-1 items-center justify-center py-6">
          <CharacterAvatar species="bunny" className="h-56 w-auto" />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-10">
        <Button onClick={() => navigate('/onboarding/name')}>{t('welcome.cta')}</Button>
        <p className="text-center text-xs font-semibold text-nuppu-gray">{t('welcome.footer')}</p>
      </div>
    </MobileScreen>
  );
}
