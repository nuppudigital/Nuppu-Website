import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { ParentAccessButton, ParentAccessModal } from '../components/ParentAccessModal';

type PhaseName = 'inhale' | 'hold' | 'exhale';

interface Phase {
  name: PhaseName;
  duration: number;
  emoji: string;
  scale: number;
  label: string;
}

const TOTAL_CYCLES = 3;

export function BreathingExercise() {
  const navigate = useNavigate();
  const [includeHold, setIncludeHold] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const phases: Phase[] = useMemo(() => {
    const base: Phase[] = [
      { name: 'inhale', duration: 4, emoji: '👃', scale: 1.4, label: 'Breathe in' },
      { name: 'exhale', duration: 4, emoji: '💨', scale: 0.6, label: 'Breathe out' },
    ];
    if (includeHold) {
      base.splice(1, 0, { name: 'hold', duration: 2, emoji: '⏸️', scale: 1.2, label: 'Hold' });
    }
    return base;
  }, [includeHold]);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(phases[0].duration);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    setPhaseIndex(0);
    setSecondsLeft(phases[0].duration);
    setCycles(0);
  }, [includeHold]);

  useEffect(() => {
    if (cycles >= TOTAL_CYCLES) return;

    const interval = setInterval(() => {
      setSecondsLeft((prevSeconds) => {
        if (prevSeconds > 1) return prevSeconds - 1;

        setPhaseIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % phases.length;
          if (nextIndex === 0) {
            setCycles((prevCycles) => prevCycles + 1);
          }
          setSecondsLeft(phases[nextIndex].duration);
          return nextIndex;
        });

        return prevSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phases, cycles]);

  const currentPhase = phases[phaseIndex];
  const complete = cycles >= TOTAL_CYCLES;

  return (
    <MobileScreen>
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#F9E5A8] via-[#FFD4C4] to-[#D4C5F9] px-6 py-10 relative">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Let's breathe together</h1>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center"
            aria-label="Breathing settings"
          >
            <SettingsIcon className="w-4 h-4 text-white" />
          </button>
        </div>

        {showSettings && (
          <div className="bg-white/90 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-[#35322B]">Include hold phase</span>
            <button
              onClick={() => setIncludeHold((v) => !v)}
              className={`w-11 h-6 rounded-full relative transition-colors ${
                includeHold ? 'bg-[#6E4FD1]' : 'bg-gray-300'
              }`}
              aria-label="Toggle hold phase"
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  includeHold ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 flex items-center justify-center mb-8">
            <div
              className="absolute inset-0 rounded-full bg-white/40 transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${complete ? 1 : currentPhase.scale})` }}
            />
            <div
              className="absolute inset-4 rounded-full bg-white/60 transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${complete ? 1 : currentPhase.scale})` }}
            />
            <div className="relative flex flex-col items-center">
              <span className="text-4xl mb-1">{complete ? '🎉' : currentPhase.emoji}</span>
              <span className="text-3xl font-bold text-white">{complete ? '' : secondsLeft}</span>
            </div>
          </div>

          <p className="text-white font-semibold text-lg mb-6">
            {complete ? 'Great job breathing!' : currentPhase.label}
          </p>

          <div className="flex gap-3 mb-6">
            {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i < cycles ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {complete && (
          <Button
            fullWidth
            variant="secondary"
            onClick={() => navigate('/story-playback')}
          >
            Continue Story
          </Button>
        )}

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
