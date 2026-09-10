import { MobileScreen } from '../components/MobileScreen';
import { BottomNav } from '../components/BottomNav';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { CHARACTER_LIST } from '../data/characters';
import { useLanguage } from '../i18n/LanguageContext';

export function Friends() {
  const { t } = useLanguage();

  return (
    <MobileScreen nav={<BottomNav />}>
      <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-nuppu-dark">{t('friends.title')}</h1>
          <p className="mt-1 text-sm text-nuppu-secondary">{t('friends.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-3">
          {CHARACTER_LIST.map((character) => (
            <div key={character.id} className="flex overflow-hidden rounded-2xl border border-nuppu-border bg-white">
              <div className={`flex w-24 shrink-0 items-center justify-center py-3 ${character.bgLight}`}>
                <CharacterAvatar species={character.species} wheelchair={character.wheelchair} className="h-16 w-auto" />
              </div>
              <div className="flex-1 p-4">
                <p className={`font-display font-bold ${character.textStrong}`}>{t(`characters.${character.id}.name`)}</p>
                <p className="mt-0.5 font-bold text-nuppu-dark">{t(`characters.${character.id}.role`)}</p>
                <p className="mt-1 text-sm text-nuppu-gray">{t(`characters.${character.id}.skills`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileScreen>
  );
}
