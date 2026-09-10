import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { CharacterAvatar } from '../../components/CharacterAvatar';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function ChildProfiles() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { name, ageBand, avatarSpecies } = useChild();

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate(-1)} title={t('childProfiles.title')} />
      <div className="flex flex-1 flex-col gap-4 px-6 pt-3 pb-8">
        <div className="card-soft flex items-center gap-3 p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-nuppu-lavender-light">
            <CharacterAvatar species={avatarSpecies} className="h-9 w-auto" />
          </span>
          <div>
            <p className="font-bold text-nuppu-dark">{name}</p>
            <p className="text-sm text-nuppu-gray">{t(`ageBands.${ageBand}.name`)}</p>
          </div>
        </div>

        <div className="card-soft flex items-center justify-center gap-2 p-4 text-sm font-bold text-nuppu-gray opacity-70">
          <Plus size={18} /> {t('childProfiles.addProfile')}
        </div>
        <p className="text-center text-xs text-nuppu-gray">{t('childProfiles.addProfileNote')}</p>
      </div>
    </MobileScreen>
  );
}
