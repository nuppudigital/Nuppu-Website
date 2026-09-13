import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Play, Pause, RotateCcw, RotateCw, Moon, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { IconButton } from '../components/IconButton';
import { StoryCover } from '../components/StoryCover';
import { CHARACTERS } from '../data/characters';
import { useStoryCatalog, coverCharacterId } from '../hooks/useStoryCatalog';
import { useLanguage } from '../i18n/LanguageContext';
import { parseMinSec, formatMinSec } from '../utils/time';

export function AudioPlayer() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { storyId = '' } = useParams();
  const { resolve } = useStoryCatalog();

  const story = resolve(storyId);
  const hasRealAudio = Boolean(story?.audioUrl);
  const chapters = story?.chapters ?? [];

  const audioRef = useRef<HTMLAudioElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(story ? story.durationMin * 60 : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sleepOn, setSleepOn] = useState(false);

  // Simulated playback for built-in stories, which have no real narration yet.
  useEffect(() => {
    if (hasRealAudio || !isPlaying) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + speed;
        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasRealAudio, isPlaying, speed, duration]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  if (!story) return null;
  const character = CHARACTERS[coverCharacterId(story)];

  const togglePlay = () => {
    if (hasRealAudio && audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
    setIsPlaying((p) => !p);
  };

  const seek = (delta: number) => {
    const next = Math.min(duration, Math.max(0, elapsed + delta));
    if (hasRealAudio && audioRef.current) audioRef.current.currentTime = next;
    setElapsed(next);
  };

  const seekTo = (seconds: number) => {
    if (hasRealAudio && audioRef.current) audioRef.current.currentTime = seconds;
    setElapsed(seconds);
  };

  const activeChapterIndex = chapters.reduce(
    (activeIdx, chapter, idx) => (parseMinSec(chapter.time) <= elapsed ? idx : activeIdx),
    0,
  );

  return (
    <MobileScreen bgClassName="bg-nuppu-lavender-light">
      {hasRealAudio && (
        <audio
          ref={audioRef}
          src={story.audioUrl}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || duration)}
          onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="flex items-center px-6 pt-2">
        <IconButton icon={ChevronLeft} onClick={() => navigate(-1)} aria-label={t('common.back')} />
        <p className="flex-1 text-center text-xs font-bold uppercase tracking-widest text-nuppu-gray">
          {t('audioPlayer.label')}
        </p>
        <div className="w-11" />
      </div>

      <div className="flex flex-1 flex-col items-center gap-1 px-6 pt-2">
        <div className={`relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl ${character.bgLight}`}>
          <StoryCover photoUrl={story.photoUrl} character={character} avatarClassName="h-28 w-auto" />
          {!hasRealAudio && (
            <span className="absolute -bottom-3 rounded-full bg-nuppu-butter px-3 py-1 text-[11px] font-bold text-[#8a641f] shadow">
              {t('audioPlayer.previewBadge')}
            </span>
          )}
        </div>

        <h1 className="mt-5 text-center font-display text-xl font-bold text-nuppu-dark">{story.title}</h1>
        <p className="text-center text-sm text-nuppu-gray">
          {character.species
            ? t('audioPlayer.narrator', { character: t(`characters.${character.id}.name`), skill: story.subtitleShort })
            : story.subtitleShort}
        </p>

        <div className="mt-6 w-full">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70">
            <div className="h-full rounded-full bg-nuppu-blue-deep" style={{ width: `${duration ? (elapsed / duration) * 100 : 0}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-xs font-semibold text-nuppu-gray">
            <span>{formatMinSec(elapsed)}</span>
            <span>-{formatMinSec(duration - elapsed)}</span>
          </div>
        </div>

        <div className="mt-4 flex w-full items-center justify-between px-2">
          <button
            className="text-sm font-bold text-nuppu-dark"
            onClick={() => setSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1))}
          >
            {speed === 1 ? '1.0' : speed}x
          </button>
          <button
            onClick={() => seek(-15)}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-nuppu-blue-light text-nuppu-blue-deep"
            aria-label="Back 15 seconds"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-nuppu-blue-deep text-white shadow-lg"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={26} fill="white" /> : <Play size={26} fill="white" />}
          </button>
          <button
            onClick={() => seek(30)}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-nuppu-blue-light text-nuppu-blue-deep"
            aria-label="Forward 30 seconds"
          >
            <RotateCw size={18} />
          </button>
          <button
            onClick={() => setSleepOn((v) => !v)}
            className={`flex h-11 w-11 items-center justify-center rounded-full ${sleepOn ? 'bg-nuppu-blue-deep text-white' : 'text-nuppu-dark'}`}
            aria-label="Sleep timer"
          >
            <Moon size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-6 pt-6">
        {chapters.length > 0 && (
          <>
            <p className="text-xs font-bold uppercase tracking-wide text-nuppu-gray">{t('audioPlayer.chapters')}</p>
            <div className="flex flex-col gap-1">
              {chapters.map((chapter, i) => (
                <button
                  key={chapter.title}
                  onClick={() => seekTo(parseMinSec(chapter.time))}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left ${
                    i === activeChapterIndex ? 'bg-nuppu-lavender-light/70' : ''
                  }`}
                >
                  <span className={`text-sm ${i === activeChapterIndex ? 'font-bold text-nuppu-blue-deep' : 'text-nuppu-dark'}`}>
                    {i + 1}. {chapter.title}
                  </span>
                  <span className="text-sm text-nuppu-gray">{chapter.time}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {!hasRealAudio && (
          <div className="mt-1 flex items-start gap-2.5 rounded-2xl bg-nuppu-butter-light p-4 text-sm text-[#8a641f]">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            {t('audioPlayer.prototypeNote')}
          </div>
        )}
      </div>
    </MobileScreen>
  );
}
