import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Gauge, Pause, Play, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { ParentAccessButton, ParentAccessModal } from '../components/ParentAccessModal';
import { AGE_GROUPS, useChild } from '../context/ChildContext';
import { CLASSIC_STORIES } from '../data/stories';
import { ttsService } from '../services/textToSpeech';
import { generateStorySuggestions, type StorySuggestion } from '../services/geminiService';

const SPEEDS = [0.8, 0.9, 1.0, 1.1, 1.2];

const FALLBACK_SUGGESTIONS: StorySuggestion[] = [
  { emoji: '🦋', title: "Butterfly's Journey", theme: 'Change & Growth' },
  { emoji: '🌟', title: 'The Wishing Star', theme: 'Hope & Dreams' },
  { emoji: '🌈', title: 'After the Storm', theme: 'Resilience' },
  { emoji: '🐉', title: 'The Gentle Dragon', theme: 'Courage & Kindness' },
];

export function StoryPlayback() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { childData, currentStory, currentEmotion } = useChild();

  const classicStory = id ? CLASSIC_STORIES.find((s) => s.id === id) : undefined;

  const title = currentStory?.title ?? classicStory?.title ?? 'A Nuppu Story';
  const emoji = currentStory?.emoji ?? classicStory?.emoji ?? '📖';
  const content =
    currentStory?.content ||
    classicStory?.content ||
    classicStory?.description ||
    'Once upon a time, in a cozy little town, a small creature learned something wonderful about being brave, kind, and true to themselves.';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(2);
  const [suggestions, setSuggestions] = useState<StorySuggestion[]>(FALLBACK_SUGGESTIONS);
  const [pinOpen, setPinOpen] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = 180;

  useEffect(() => {
    generateStorySuggestions(
      {
        childName: childData.name,
        emotion: currentEmotion ?? 'Calm',
        interests: childData.interests,
        ageGroupLabel: AGE_GROUPS[childData.ageGroup].label,
        topic: childData.topic,
      },
      4,
    ).then(setSuggestions);
  }, [childData.name, childData.interests, childData.ageGroup, childData.topic, currentEmotion]);

  useEffect(() => {
    return () => {
      ttsService.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startProgressTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 100;
        }
        return prev + 0.5;
      });
    }, 100);
  };

  const stopProgressTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      ttsService.pause();
      stopProgressTimer();
      setIsPlaying(false);
    } else if (ttsService.isPausedState()) {
      ttsService.resume();
      startProgressTimer();
      setIsPlaying(true);
    } else {
      ttsService.speak(content, {
        rate: SPEEDS[speedIndex],
        volume: isMuted ? 0 : 1,
        onEnd: () => setIsPlaying(false),
      });
      startProgressTimer();
      setIsPlaying(true);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (isPlaying) {
        ttsService.speak(content, { rate: SPEEDS[speedIndex], volume: next ? 0 : 1 });
      }
      return next;
    });
  };

  const handleSpeedCycle = () => {
    const nextIndex = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(nextIndex);
    if (isPlaying) {
      ttsService.speak(content, { rate: SPEEDS[nextIndex], volume: isMuted ? 0 : 1, onEnd: () => setIsPlaying(false) });
    }
  };

  const handleClose = () => {
    ttsService.stop();
    stopProgressTimer();
    navigate('/home');
  };

  const handleSkip = () => {
    ttsService.stop();
    stopProgressTimer();
    navigate('/emotion-check');
  };

  const elapsedSeconds = Math.round((progress / 100) * totalSeconds);

  return (
    <MobileScreen>
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#E8C468] via-[#FFD4C4] to-[#D4C5F9] relative">
        <div className="flex items-center justify-between px-5 pt-6 pb-2 shrink-0">
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-sm font-bold text-white truncate max-w-[60%]">{title}</h1>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#F9E5A8]/70 blur-2xl scale-110 animate-pulse" />
              <span className="relative text-7xl">{emoji}</span>
            </div>
          </div>

          <p className="text-white text-base leading-relaxed whitespace-pre-line mb-4">{content}</p>

          {progress >= 30 && (
            <div className="bg-white/10 border border-white/30 rounded-2xl p-4 mb-4 flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-white/30 text-white text-xs font-bold flex items-center justify-center">
                P
              </span>
              <p className="text-xs text-white/90 leading-relaxed">
                Micro-tip: Ask {childData.name} how they think the character is feeling right now — and why.
              </p>
            </div>
          )}

          <div className="mb-2">
            <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/70 mt-1">
              <span>
                {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')}
              </span>
              <span>
                {Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 my-6">
            <button
              onClick={handleMuteToggle}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              aria-label="Toggle mute"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              aria-label="Play or pause"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-[#D4AF5E] fill-[#D4AF5E]" />
              ) : (
                <Play className="w-7 h-7 text-[#D4AF5E] fill-[#D4AF5E] ml-1" />
              )}
            </button>
            <button
              onClick={handleSkip}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
              aria-label="Skip"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={handleSpeedCycle}
              className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              <Gauge className="w-3.5 h-3.5" />
              {SPEEDS[speedIndex]}x
            </button>
          </div>

          <p className="text-white text-sm font-semibold mb-3">More stories for you</p>
          <div className="grid grid-cols-2 gap-3 pb-4">
            {suggestions.map((s) => (
              <button
                key={s.title}
                onClick={() => navigate('/library')}
                className="bg-white/15 rounded-2xl p-3 text-left"
              >
                <span className="text-2xl">{s.emoji}</span>
                <p className="text-xs font-semibold text-white mt-1.5 truncate">{s.title}</p>
                <p className="text-[10px] text-white/70 truncate">{s.theme}</p>
              </button>
            ))}
          </div>
        </div>

        <ParentAccessButton onClick={() => setPinOpen(true)} />
        <ParentAccessModal
          open={pinOpen}
          onClose={() => setPinOpen(false)}
          onSuccess={() => {
            setPinOpen(false);
            navigate('/home');
          }}
        />
      </div>
    </MobileScreen>
  );
}
