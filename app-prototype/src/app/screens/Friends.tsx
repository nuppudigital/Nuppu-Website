import { useState } from 'react';
import { X } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { BottomNav } from '../components/BottomNav';
import { IconButton } from '../components/IconButton';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { CHARACTER_LIST, type CharacterId } from '../data/characters';
import { useLanguage } from '../i18n/LanguageContext';

export function Friends() {
  const { t } = useLanguage();
  const [openId, setOpenId] = useState<CharacterId | null>(null);
  const openCharacter = CHARACTER_LIST.find((c) => c.id === openId);

  return (
    <MobileScreen nav={<BottomNav />}>
      <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-nuppu-dark">{t('friends.title')}</h1>
          <p className="mt-1 text-sm text-nuppu-secondary">{t('friends.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-3">
          {CHARACTER_LIST.map((character) => (
            <button
              key={character.id}
              onClick={() => setOpenId(character.id)}
              className="flex overflow-hidden rounded-2xl border border-nuppu-border bg-white text-left"
            >
              <div className={`flex w-24 shrink-0 items-center justify-center py-3 ${character.bgLight}`}>
                <CharacterAvatar species={character.species!} wheelchair={character.wheelchair} className="h-16 w-auto" />
              </div>
              <div className="flex-1 p-4">
                <p className={`font-display font-bold ${character.textStrong}`}>{t(`characters.${character.id}.name`)}</p>
                <p className="mt-0.5 font-bold text-nuppu-dark">{t(`characters.${character.id}.role`)}</p>
                <p className="mt-1 text-sm text-nuppu-gray">{t(`characters.${character.id}.skills`)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {openCharacter && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-[#322d47]/60 px-6"
          onClick={() => setOpenId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${openCharacter.bgLight}`}>
                <CharacterAvatar species={openCharacter.species!} wheelchair={openCharacter.wheelchair} className="h-14 w-auto" />
              </div>
              <IconButton icon={X} onClick={() => setOpenId(null)} aria-label={t('common.close')} />
            </div>
            <p className={`font-display text-xl font-bold ${openCharacter.textStrong}`}>
              {t(`characters.${openCharacter.id}.name`)}
            </p>
            <p className="mt-0.5 font-bold text-nuppu-dark">{t(`characters.${openCharacter.id}.role`)}</p>
            <p className="mt-1 text-sm text-nuppu-gray">{t(`characters.${openCharacter.id}.skills`)}</p>
            <p className="mt-3 text-sm leading-relaxed text-nuppu-secondary">{t(`characters.${openCharacter.id}.intro`)}</p>
          </div>
        </div>
      )}
    </MobileScreen>
  );
}
