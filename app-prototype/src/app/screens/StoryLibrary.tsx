import { useState } from 'react';
import { ChevronRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { BottomNav } from '../components/BottomNav';
import { Chip } from '../components/Chip';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { CHARACTERS } from '../data/characters';
import { useStoryCatalog, useLibraryCategories } from '../hooks/useStoryCatalog';
import { useChild } from '../context/ChildContext';
import { useLanguage } from '../i18n/LanguageContext';

export function StoryLibrary() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { ageBand } = useChild();
  const { all: allStories } = useStoryCatalog();
  const libraryCategories = useLibraryCategories();
  const [category, setCategory] = useState('all');

  const stories = allStories.filter((s) => category === 'all' || s.categories.includes(category));

  return (
    <MobileScreen nav={<BottomNav />}>
      <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
        <h1 className="font-display text-2xl font-bold text-nuppu-dark">{t('stories.title')}</h1>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip selected={category === 'all'} onClick={() => setCategory('all')}>
            {t('categories.all')}
          </Chip>
          {libraryCategories.map((cat) => (
            <Chip key={cat.id} selected={category === cat.id} onClick={() => setCategory(cat.id)}>
              {cat.label}
            </Chip>
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-nuppu-gray">
          {t('stories.libraryHeader', {
            age: t(`ageBands.${ageBand}.name`),
            range: t(`ageBands.${ageBand}.range`),
            count: stories.length,
          })}
        </p>

        <div className="flex flex-col gap-3">
          {stories.map((story) => {
            const character = CHARACTERS[story.characterId];
            return (
              <button
                key={story.id}
                onClick={() => navigate(`/stories/${story.id}`)}
                className="card-soft flex items-center gap-3 p-3 text-left"
              >
                <span className={`flex h-16 w-16 shrink-0 overflow-hidden items-center justify-center rounded-xl ${character.bgLight}`}>
                  {story.photoUrl ? (
                    <img src={story.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <CharacterAvatar species={character.species} wheelchair={character.wheelchair} className="h-12 w-auto" />
                  )}
                </span>
                <span className="flex-1">
                  <span className="block font-bold text-nuppu-dark">{story.title}</span>
                  <span className="block text-sm text-nuppu-gray">{story.subtitleShort}</span>
                  <span className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${character.bgLight} ${character.textStrong}`}>
                      {t('stories.min', { count: story.durationMin })}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-nuppu-lavender-light px-2.5 py-1 text-xs font-bold text-nuppu-blue-deep">
                      <BookOpen size={12} /> {t('stories.readable')}
                    </span>
                  </span>
                </span>
                <ChevronRight size={18} className="text-nuppu-gray" />
              </button>
            );
          })}
        </div>
      </div>
    </MobileScreen>
  );
}
