import { ChevronLeft, Pencil, Trash2, Plus, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileScreen } from '../../components/MobileScreen';
import { IconButton } from '../../components/IconButton';
import { Button } from '../../components/Button';
import { CharacterAvatar } from '../../components/CharacterAvatar';
import { CHARACTERS } from '../../data/characters';
import { useCustomStories } from '../../context/CustomStoriesContext';
import { useStoryCatalog, useLibraryCategories } from '../../hooks/useStoryCatalog';
import { useLanguage } from '../../i18n/LanguageContext';

export function StoryAdminList() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { all: stories } = useStoryCatalog();
  const { deleteStory } = useCustomStories();
  const categories = useLibraryCategories();

  const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <MobileScreen bgClassName="bg-white">
      <div className="flex items-center gap-3 px-6 pt-2">
        <IconButton icon={ChevronLeft} onClick={() => navigate(-1)} aria-label={t('common.back')} />
        <h1 className="font-display text-lg font-bold text-nuppu-dark">Story Admin</h1>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 pt-3 pb-8">
        <div className="flex items-start gap-2.5 rounded-2xl bg-nuppu-lavender-light p-4 text-sm text-nuppu-dark">
          <Lock size={18} className="mt-0.5 shrink-0 text-nuppu-blue-deep" />
          Prototype tool — stories you add here are saved only in this browser, not on a server.
        </div>

        <Button onClick={() => navigate('/story-admin/new')}>
          <Plus size={18} /> Add story
        </Button>

        <div className="flex flex-col gap-3">
          {stories.map((story) => {
            const character = CHARACTERS[story.characterId];
            return (
              <div key={story.id} className="card-soft flex items-center gap-3 p-3">
                <span className={`flex h-14 w-14 shrink-0 overflow-hidden items-center justify-center rounded-xl ${character.bgLight}`}>
                  {story.photoUrl ? (
                    <img src={story.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <CharacterAvatar species={character.species} wheelchair={character.wheelchair} className="h-10 w-auto" />
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-bold text-nuppu-dark">{story.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${character.bgLight} ${character.textStrong}`}>
                      {categoryLabel(story.categories[0])}
                    </span>
                    {!story.isCustom && (
                      <span className="rounded-full bg-nuppu-off-white px-2 py-0.5 text-xs font-bold text-nuppu-gray">
                        Built-in
                      </span>
                    )}
                    {story.audioUrl && (
                      <span className="rounded-full bg-nuppu-mint-light px-2 py-0.5 text-xs font-bold text-[#2f5c39]">
                        Audio
                      </span>
                    )}
                  </span>
                </span>
                {story.isCustom && (
                  <span className="flex shrink-0 gap-1">
                    <IconButton
                      icon={Pencil}
                      size={16}
                      className="h-9 w-9"
                      onClick={() => navigate(`/story-admin/${story.id}/edit`)}
                      aria-label="Edit"
                    />
                    <IconButton
                      icon={Trash2}
                      size={16}
                      className="h-9 w-9 text-nuppu-red"
                      onClick={() => {
                        if (window.confirm(`Delete "${story.title}"?`)) deleteStory(story.id);
                      }}
                      aria-label="Delete"
                    />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MobileScreen>
  );
}
