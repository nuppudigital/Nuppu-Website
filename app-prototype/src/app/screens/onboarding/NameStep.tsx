import { useNavigate } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { Bilingual } from '../../components/Bilingual';
import { Button } from '../../components/Button';
import { CharacterAvatar } from '../../components/CharacterAvatar';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function NameStep() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { name, setName, avatarSpecies } = useChild();

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate('/welcome')} progress={1 / 3} stepLabel="1/3" />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-4">
        <Bilingual
          k="onboardingName.title"
          as="h1"
          className="font-display text-2xl font-bold text-nuppu-dark"
          secondaryClassName="mt-1 text-sm"
        />

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('onboardingName.placeholder')}
          className="w-full rounded-2xl border-2 border-nuppu-blue-deep bg-white px-4 py-4 text-xl font-bold text-nuppu-dark outline-none"
        />
        <p className="text-sm leading-relaxed text-nuppu-secondary">{t('onboardingName.hint')}</p>

        <div className="flex items-start gap-2.5 rounded-2xl bg-nuppu-lavender-light p-4 text-sm font-semibold text-nuppu-dark">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-nuppu-blue-deep" />
          {t('onboardingName.safety')}
        </div>

        <div className="flex flex-1 items-end justify-center pb-4">
          <CharacterAvatar species={avatarSpecies} className="h-40 w-auto" />
        </div>
      </div>
      <div className="px-6 pb-10">
        <Button disabled={!name.trim()} onClick={() => navigate('/onboarding/age')}>
          {t('common.continue')}
        </Button>
      </div>
    </MobileScreen>
  );
}
