import { Lock, Play, Moon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { BottomNav } from '../components/BottomNav';
import { IconButton } from '../components/IconButton';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { MOOD_LIST } from '../data/moods';
import { CHARACTERS } from '../data/characters';
import { useStoryCatalog, useLibraryCategories } from '../hooks/useStoryCatalog';
import { useChild, type MoodId } from '../context/ChildContext';
import { useLanguage } from '../i18n/LanguageContext';

export function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { name, mood, setMood, continueReading, ageBand } = useChild();
  const { all: stories } = useStoryCatalog();
  const categories = useLibraryCategories();

  const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  const continueStory = continueReading ? stories.find((s) => s.id === continueReading.storyId) : undefined;
  const continuePages = continueStory ? (ageBand === 'little' ? continueStory.pagesLittle : continueStory.pagesBig).length : 0;

  const forYouToday = stories.filter((s) => s.id !== continueReading?.storyId).slice(0, 2);

  return (
    <MobileScreen nav={<BottomNav />}>
      <div className="flex flex-col gap-5 px-6 pb-6 pt-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-2xl font-bold text-nuppu-dark">{t('home.greeting', { name })}</p>
            <p className="mt-1 text-lg font-semibold text-nuppu-secondary">{t('home.moodQuestion')}</p>
          </div>
          <IconButton icon={Lock} onClick={() => navigate('/parent-gate')} aria-label={t('adultCorner.title')} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {MOOD_LIST.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id as MoodId)}
              className={`flex min-w-[68px] flex-col items-center gap-1 rounded-2xl border-2 p-3 ${
                mood === m.id ? 'border-nuppu-blue-deep bg-nuppu-lavender-light' : 'border-nuppu-border bg-white'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-bold text-nuppu-dark">{t(`moods.${m.id}`)}</span>
            </button>
          ))}
        </div>

        {continueStory && (
          <div>
            <h2 className="mb-2 font-display text-lg font-bold text-nuppu-dark">{t('home.continueReading')}</h2>
            <button
              onClick={() => navigate(`/stories/${continueStory.id}/read`)}
              className={`card-soft flex w-full items-center gap-3 p-3 text-left ${CHARACTERS[continueStory.characterId].bgLight}`}
            >
              <span className={`flex h-14 w-14 shrink-0 overflow-hidden items-center justify-center rounded-xl ${CHARACTERS[continueStory.characterId].bgLight}`}>
                {continueStory.photoUrl ? (
                  <img src={continueStory.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <CharacterAvatar species={CHARACTERS[continueStory.characterId].species} className="h-10 w-auto" />
                )}
              </span>
              <span className="flex-1">
                <span className="block font-bold text-nuppu-dark">{continueStory.title}</span>
                <span className="mb-1.5 block text-sm text-nuppu-gray">
                  {t('home.page', { page: continueReading?.page ?? 1, total: continuePages })}
                </span>
                <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/70">
                  <span
                    className="block h-full rounded-full bg-nuppu-blue-deep"
                    style={{ width: `${((continueReading?.page ?? 1) / continuePages) * 100}%` }}
                  />
                </span>
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nuppu-blue-deep text-white">
                <Play size={18} fill="white" />
              </span>
            </button>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-nuppu-dark">{t('home.forYouToday')}</h2>
            <button className="text-sm font-bold text-nuppu-blue-deep" onClick={() => navigate('/stories')}>
              {t('home.all')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {forYouToday.map((story) => {
              const character = CHARACTERS[story.characterId];
              return (
                <button
                  key={story.id}
                  onClick={() => navigate(`/stories/${story.id}`)}
                  className="flex flex-col overflow-hidden rounded-2xl border border-nuppu-border bg-white text-left"
                >
                  <span className={`flex h-24 items-center justify-center overflow-hidden ${character.bgLight}`}>
                    {story.photoUrl ? (
                      <img src={story.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <CharacterAvatar species={character.species} wheelchair={character.wheelchair} className="h-16 w-auto" />
                    )}
                  </span>
                  <span className="p-2.5">
                    <span className="block text-sm font-bold leading-snug text-nuppu-dark">{story.title}</span>
                    <span className="block text-xs text-nuppu-gray">
                      {categoryLabel(story.categories[0])} · {t('stories.min', { count: story.durationMin })}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => navigate('/stories/quiet-evening')}
          className="card-soft flex items-center gap-3 bg-nuppu-butter-light p-4 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <Moon size={18} className="text-[#a37f1f]" />
          </span>
          <span className="flex-1">
            <span className="block font-bold text-nuppu-dark">{t('home.bedtimeStory')}</span>
            <span className="block text-sm text-nuppu-gray">{t('home.bedtimeStoryDesc')}</span>
          </span>
          <ChevronRight size={18} className="text-nuppu-gray" />
        </button>
      </div>
    </MobileScreen>
  );
}
