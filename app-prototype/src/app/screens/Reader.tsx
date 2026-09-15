import { useState } from 'react';
import { X, ChevronLeft, ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { IconButton } from '../components/IconButton';
import { Button } from '../components/Button';
import { StoryCover } from '../components/StoryCover';
import { CHARACTERS } from '../data/characters';
import { useStoryCatalog, coverCharacterId } from '../hooks/useStoryCatalog';
import { useChild } from '../context/ChildContext';
import { useLanguage } from '../i18n/LanguageContext';

export function Reader() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { storyId = '' } = useParams();
  const { ageBand, continueReading, setContinueReading, markStoryRead } = useChild();
  const { resolve } = useStoryCatalog();

  const story = resolve(storyId);
  const isLittle = ageBand === 'little';
  // Full story length for every age band for now, regardless of isLittle.
  const pages = story ? story.pagesBig : [];

  const startPage =
    continueReading?.storyId === storyId && continueReading.page <= pages.length ? continueReading.page - 1 : 0;
  const [page, setPage] = useState(startPage);

  if (!story) return null;
  const character = CHARACTERS[coverCharacterId(story)];
  const isLast = page === pages.length - 1;

  const goNext = () => {
    if (isLast) {
      markStoryRead();
      setContinueReading(null);
      navigate(`/stories/${story.id}/complete`);
      return;
    }
    const next = page + 1;
    setPage(next);
    setContinueReading({ storyId: story.id, page: next + 1 });
  };

  const goBack = () => setPage((p) => Math.max(0, p - 1));

  return (
    <MobileScreen>
      <div className="flex items-center gap-3 px-6 pt-2">
        <IconButton icon={X} onClick={() => navigate(-1)} aria-label={t('common.close')} />
        {isLittle ? (
          <div className="flex flex-1 justify-center gap-1.5">
            {pages.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === page ? 'w-6 bg-nuppu-blue-deep' : 'w-2 bg-nuppu-border'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-nuppu-border">
            <div className="h-full rounded-full bg-nuppu-blue-deep" style={{ width: `${((page + 1) / pages.length) * 100}%` }} />
          </div>
        )}
        {!isLittle && (
          <span className="shrink-0 text-sm font-bold text-nuppu-gray">
            {page + 1} / {pages.length}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6 px-6 pt-4">
        <div className={`flex h-48 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${character.bgLight}`}>
          <StoryCover photoUrl={story.photoUrl} character={character} avatarClassName="h-32 w-auto" />
        </div>
        <p className="whitespace-pre-line leading-relaxed text-nuppu-dark text-lg">{pages[page]}</p>
      </div>

      <div className="flex items-center gap-3 px-6 pb-10 pt-4">
        <IconButton icon={ChevronLeft} onClick={goBack} disabled={page === 0} className={page === 0 ? 'opacity-40' : ''} />
        <Button onClick={goNext}>
          {isLittle ? (
            <>
              {t('reader.next')} <ArrowRight size={18} />
            </>
          ) : (
            t('reader.nextPage')
          )}
        </Button>
      </div>
    </MobileScreen>
  );
}
