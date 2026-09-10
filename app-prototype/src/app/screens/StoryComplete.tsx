import { useNavigate, useParams } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { CHARACTERS } from '../data/characters';
import { useStoryCatalog } from '../hooks/useStoryCatalog';
import { useChild } from '../context/ChildContext';
import { useLanguage } from '../i18n/LanguageContext';

export function StoryComplete() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { storyId = '' } = useParams();
  const { name } = useChild();
  const { resolve } = useStoryCatalog();

  const story = resolve(storyId);
  if (!story) return null;
  const character = CHARACTERS[story.characterId];
  const showPair = story.characterId !== 'nuppu';

  return (
    <MobileScreen bgClassName="bg-nuppu-butter-light">
      <div className="flex flex-1 flex-col items-center px-8 pt-14 text-center">
        <h1 className="font-display text-2xl font-bold text-nuppu-dark">{t('endOfStory.title')}</h1>
        <p className="mt-2 text-nuppu-secondary">{t('endOfStory.subtitle', { name })}</p>

        <div className="mt-10 flex items-end justify-center">
          <CharacterAvatar species={CHARACTERS.nuppu.species} className="h-40 w-auto" />
          {showPair && (
            <CharacterAvatar
              species={character.species}
              wheelchair={character.wheelchair}
              className="-ml-6 h-40 w-auto"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 pb-10 pt-6">
        <div className="card-soft p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-nuppu-gray">{t('endOfStory.skillLabel')}</p>
          <p className="mt-1 font-bold text-nuppu-dark">{story.emotionalSkill}</p>
          <p className="mt-1 text-sm text-nuppu-gray">{t('endOfStory.tipsNote')}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate(`/stories/${story.id}/read`)}>
            {t('endOfStory.readAgain')}
          </Button>
          <Button onClick={() => navigate('/home')}>{t('endOfStory.backHome')}</Button>
        </div>
      </div>
    </MobileScreen>
  );
}
