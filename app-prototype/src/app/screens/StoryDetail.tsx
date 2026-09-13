import { ChevronLeft, Headphones, BookOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { IconButton } from '../components/IconButton';
import { Button } from '../components/Button';
import { StoryCover } from '../components/StoryCover';
import { CHARACTERS } from '../data/characters';
import { useStoryCatalog, coverCharacterId } from '../hooks/useStoryCatalog';
import { useChild } from '../context/ChildContext';
import { useLanguage } from '../i18n/LanguageContext';

export function StoryDetail() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { storyId = '' } = useParams();
  const { ageBand } = useChild();
  const { resolve } = useStoryCatalog();

  const story = resolve(storyId);
  if (!story) return null;
  const character = CHARACTERS[coverCharacterId(story)];

  return (
    <MobileScreen>
      <div className={`relative flex h-64 shrink-0 items-center justify-center overflow-hidden ${character.bgLight}`}>
        <div className="absolute left-4 top-2">
          <IconButton icon={ChevronLeft} onClick={() => navigate(-1)} aria-label={t('common.back')} className="bg-white/90" />
        </div>
        <StoryCover photoUrl={story.photoUrl} character={character} avatarClassName="h-48 w-auto" />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 pt-5">
        <div className="flex flex-wrap gap-2">
          {character.species && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${character.bgLight} ${character.textStrong}`}>
              {t(`characters.${character.id}.name`)}
            </span>
          )}
          <span className="chip">
            {t(`ageBands.${ageBand}.name`)}
          </span>
          <span className="chip">{t('stories.min', { count: story.durationMin })}</span>
        </div>

        <h1 className="font-display text-2xl font-bold text-nuppu-dark">{story.title}</h1>
        <p className="text-sm leading-relaxed text-nuppu-secondary">{story.description}</p>

        <div className="rounded-2xl bg-nuppu-lavender-light p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-nuppu-blue-deep">{t('storyDetail.emotionalSkill')}</p>
          <p className="mt-1 font-bold text-nuppu-dark">{story.emotionalSkill}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-4 pt-2">
        {(!story.isCustom || story.audioUrl) ? (
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => navigate(`/stories/${story.id}/read`)}>
              <BookOpen size={18} /> {t('storyDetail.readStory')}
            </Button>
            <Button variant="outline" className="relative" onClick={() => navigate(`/stories/${story.id}/listen`)}>
              <Headphones size={18} /> {t('storyDetail.listen')}
              {!story.audioUrl && (
                <span className="absolute -top-2.5 right-2 rounded-full bg-nuppu-butter px-2 py-0.5 text-[10px] font-bold text-[#8a641f]">
                  {t('storyDetail.preview')}
                </span>
              )}
            </Button>
          </div>
        ) : (
          <Button onClick={() => navigate(`/stories/${story.id}/read`)}>
            <BookOpen size={18} /> {t('storyDetail.readStory')}
          </Button>
        )}
        {!story.isCustom && <p className="pb-6 text-center text-xs text-nuppu-gray">{t('storyDetail.audioNote')}</p>}
      </div>
    </MobileScreen>
  );
}
