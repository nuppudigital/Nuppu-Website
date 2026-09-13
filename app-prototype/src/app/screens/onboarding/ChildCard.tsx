import { useState } from 'react';
import { X, Sparkles, BookOpen, Heart, Pencil, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileScreen } from '../../components/MobileScreen';
import { IconButton } from '../../components/IconButton';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { CharacterAvatar } from '../../components/CharacterAvatar';
import { CHARACTERS } from '../../data/characters';
import { AGE_BAND_LIST } from '../../data/ageBands';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function ChildCard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    name,
    setName,
    ageBand,
    avatarSpecies,
    interests,
    personalizationOn,
    storiesReadTotal,
    storiesReadThisWeek,
    favouriteFriendId,
  } = useChild();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);

  function saveName() {
    const trimmed = nameDraft.trim();
    if (trimmed) setName(trimmed);
    else setNameDraft(name);
    setEditingName(false);
  }

  const bandIcon = AGE_BAND_LIST.find((b) => b.id === ageBand)?.icon;
  const friend = CHARACTERS[favouriteFriendId as keyof typeof CHARACTERS];

  return (
    <MobileScreen bgClassName="bg-white">
      <div className="relative rounded-b-[2rem] bg-nuppu-lavender-light px-6 pb-8 pt-2 text-center">
        <div className="flex justify-end">
          <IconButton icon={X} onClick={() => navigate('/onboarding/interests')} aria-label={t('common.close')} />
        </div>
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-md">
          <CharacterAvatar species={avatarSpecies} className="h-20 w-auto" />
        </div>
        {editingName ? (
          <div className="mt-3 flex items-center justify-center gap-2">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              className="rounded-xl border-2 border-nuppu-blue-deep bg-white px-3 py-1.5 text-center font-display text-2xl font-bold text-nuppu-dark outline-none"
            />
            <IconButton icon={Check} onClick={saveName} aria-label={t('common.save')} />
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-center gap-2">
            <h1 className="font-display text-2xl font-bold text-nuppu-dark">{name}</h1>
            <IconButton
              icon={Pencil}
              size={16}
              onClick={() => {
                setNameDraft(name);
                setEditingName(true);
              }}
              aria-label={t('childCard.editName')}
            />
          </div>
        )}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="chip">
            {bandIcon} {t(`ageBands.${ageBand}.name`)}
          </span>
          <span className="chip">{t(`ageBands.${ageBand}.range`)}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 pt-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-nuppu-gray">{t('childCard.interests')}</p>
          <div className="flex flex-wrap gap-2">
            {interests.map((id) => (
              <Chip key={id} selected>
                {t(`interestTags.${id}`)}
              </Chip>
            ))}
          </div>
        </div>

        <div className="card-soft divide-y divide-nuppu-border">
          <div className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nuppu-lavender-light">
              <Sparkles size={18} className="text-nuppu-blue-deep" />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-nuppu-dark">{t('childCard.personalization')}</span>
              <span className="block text-sm text-nuppu-gray">{t('childCard.personalizationDesc')}</span>
            </span>
            <span className="rounded-full bg-nuppu-mint-light px-3 py-1 text-sm font-bold text-[#3f7a4a]">
              {personalizationOn ? t('childCard.on') : t('childCard.off')}
            </span>
          </div>
          <div className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nuppu-butter-light">
              <BookOpen size={18} className="text-[#a37f1f]" />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-nuppu-dark">{t('childCard.storiesRead')}</span>
              <span className="block text-sm text-nuppu-gray">{t('childCard.thisWeek', { count: storiesReadThisWeek })}</span>
            </span>
            <span className="text-lg font-bold text-nuppu-dark">{storiesReadTotal}</span>
          </div>
          <div className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-nuppu-peach-light">
              <Heart size={18} className="text-[#c1573f]" />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-nuppu-dark">{t('childCard.favouriteFriend')}</span>
              <span className="block text-sm text-nuppu-gray">
                {t(`characters.${friend.id}.name`)} — {t(`characters.${friend.id}.skills`)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-6 pb-10 pt-4">
        <Button variant="outline" onClick={() => navigate('/onboarding/name')}>
          {t('childCard.edit')}
        </Button>
        <Button onClick={() => navigate('/home')}>{t('childCard.startStory')}</Button>
      </div>
    </MobileScreen>
  );
}
