import { useNavigate, useParams } from 'react-router';
import { MessageCircle } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ProgressHeader } from '../../components/ProgressHeader';
import { StoryCover } from '../../components/StoryCover';
import { CHARACTERS } from '../../data/characters';
import { useStoryCatalog, coverCharacterId } from '../../hooks/useStoryCatalog';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function MicroSupport() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { continueReading } = useChild();
  const { resolve, all } = useStoryCatalog();

  const story = resolve(storyId ?? '') ?? resolve(continueReading?.storyId ?? '') ?? all[0];
  if (!story) return null;
  const character = CHARACTERS[coverCharacterId(story)];

  return (
    <MobileScreen>
      <ProgressHeader onBack={() => navigate(-1)} title={t('microSupport.title')} />
      <div className="flex flex-1 flex-col gap-5 px-6 pt-3 pb-8">
        <div className="card-soft flex items-center gap-3 bg-nuppu-lavender-light p-4">
          <span className={`flex h-14 w-14 shrink-0 overflow-hidden items-center justify-center rounded-xl ${character.bgLight}`}>
            <StoryCover photoUrl={story.photoUrl} character={character} avatarClassName="h-10 w-auto" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-nuppu-blue-deep">{t('microSupport.skillLabel')}</p>
            <p className="mt-0.5 font-bold text-nuppu-dark">{story.microSupportSkill}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-nuppu-gray">{t('microSupport.actionsLabel')}</p>
          <div className="card-soft divide-y divide-nuppu-border">
            {story.microSupportActions.map((action, i) => (
              <div key={action} className="flex items-start gap-3 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nuppu-butter font-display text-sm font-bold text-[#8a641f]">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-nuppu-dark">{action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-nuppu-butter-light p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#8a641f]">
            <MessageCircle size={14} /> {t('microSupport.conversationStarterLabel')}
          </p>
          <p className="mt-1.5 text-sm italic text-nuppu-dark">"{story.conversationStarter}"</p>
        </div>

        <p className="text-center text-xs text-nuppu-gray">{t('microSupport.privateNote')}</p>
      </div>
    </MobileScreen>
  );
}
