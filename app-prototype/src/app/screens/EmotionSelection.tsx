import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { ParentAccessButton, ParentAccessModal } from '../components/ParentAccessModal';
import { AGE_GROUPS, useChild } from '../context/ChildContext';
import { generateStory, SAFETY_PIPELINE_STEPS } from '../services/geminiService';

const EMOTIONS = [
  { id: 'Happy', emoji: '😊', label: 'Happy', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'Sad', emoji: '😢', label: 'Sad', color: 'bg-blue-100 border-blue-300' },
  { id: 'Scared', emoji: '😰', label: 'Scared', color: 'bg-purple-100 border-purple-300' },
  { id: 'Angry', emoji: '😠', label: 'Angry', color: 'bg-red-100 border-red-300' },
  { id: 'Calm', emoji: '😌', label: 'Calm', color: 'bg-green-100 border-green-300' },
  { id: 'Confused', emoji: '😕', label: 'Confused', color: 'bg-orange-100 border-orange-300' },
];

export function EmotionSelection() {
  const navigate = useNavigate();
  const { childData, setCurrentEmotion, addGeneratedStory, setCurrentStory } = useChild();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const pipelineTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pipelineTimer.current) clearInterval(pipelineTimer.current);
    };
  }, []);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    setPipelineStep(0);
    setError(null);
    pipelineTimer.current = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % SAFETY_PIPELINE_STEPS.length);
    }, 550);
    try {
      setCurrentEmotion(selected);
      const story = await generateStory({
        childName: childData.name,
        emotion: selected,
        interests: childData.interests,
        ageGroupLabel: AGE_GROUPS[childData.ageGroup].label,
        topic: childData.topic,
      });
      addGeneratedStory(story);
      setCurrentStory(story);
      navigate('/breathing');
    } catch (err) {
      console.warn('Failed to generate story:', err);
      setError('Something went wrong creating your story. Please try again.');
    } finally {
      if (pipelineTimer.current) clearInterval(pipelineTimer.current);
      setLoading(false);
    }
  };

  return (
    <MobileScreen>
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#F9E5A8]/40 via-[#FFD4C4]/20 to-white px-6 py-10 relative">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#F9E5A8]/50 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-[#D4AF5E]" />
          </div>
          <h1 className="text-2xl font-bold text-[#35322B]">How are you feeling?</h1>
          <p className="text-sm text-[#6B6660] mt-1">Pick the feeling that's closest to yours right now</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8 flex-1">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => setSelected(emotion.id)}
              className={`rounded-2xl border-2 ${emotion.color} p-5 flex flex-col items-center gap-2 transition-all ${
                selected === emotion.id ? 'ring-4 ring-[#6E4FD1] scale-105' : ''
              }`}
            >
              <span className="text-4xl">{emotion.emoji}</span>
              <span className="text-sm font-semibold text-[#35322B]">{emotion.label}</span>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

        {loading && (
          <div className="bg-white/80 border border-[#F9E5A8] rounded-2xl p-3 mb-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#55504A]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6E4FD1] shrink-0" />
              {SAFETY_PIPELINE_STEPS.map((step, i) => (
                <span
                  key={step}
                  className={`flex items-center gap-1 ${i === pipelineStep ? 'text-[#35322B] font-semibold' : 'opacity-40'}`}
                >
                  {i < pipelineStep && <Check className="w-3 h-3 text-[#6E4FD1]" />}
                  {i === pipelineStep ? step : null}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button
          fullWidth
          disabled={!selected || loading}
          onClick={handleContinue}
          className="flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating your story...
            </>
          ) : (
            'Continue Story'
          )}
        </Button>

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
