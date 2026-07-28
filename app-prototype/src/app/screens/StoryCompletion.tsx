import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lightbulb, Lock, MessageCircleHeart, Sparkles, TrendingUp } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { useChild } from '../context/ChildContext';

const RATINGS = ['😞', '😕', '😐', '😊', '🤩'];

const SKILLS = [
  { icon: <Sparkles className="w-5 h-5" />, label: 'Courage' },
  { icon: <Lightbulb className="w-5 h-5" />, label: 'Emotions' },
  { icon: <TrendingUp className="w-5 h-5" />, label: 'Breathing' },
];

export function StoryCompletion() {
  const navigate = useNavigate();
  const { childData, currentStory, plan } = useChild();
  const [rating, setRating] = useState<number | null>(null);

  const characterName = currentStory?.title?.split(' ')[0] ?? 'the character';
  const selTheme = currentStory?.selTheme ?? 'Emotional Awareness';

  const reflectionQuestion = `When was the last time ${childData.name} felt something similar to ${characterName} in the story?`;
  const conversationStarter = `Ask ${childData.name} what part of the story they liked most, and how they think ${characterName} felt at the end.`;
  const practicalTip = 'Keep it light — a quick, curious question works better than a long discussion right after story time.';

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#F9E5A8]/25 via-[#FFD4C4]/15 to-white px-6 py-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-[#F9E5A8]/70 blur-2xl scale-125" />
            <span className="relative text-6xl inline-block animate-bounce" style={{ animationDuration: '1.5s' }}>
              🎉
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#2D3748]">Amazing, {childData.name}!</h1>
          <p className="text-sm text-[#718096] mt-1">You finished your story</p>
        </div>

        <div className="bg-gradient-to-br from-[#F9E5A8]/50 to-[#FFD4C4]/30 rounded-2xl p-5 border border-[#F9E5A8] mb-6">
          <p className="text-sm font-semibold text-[#2D3748] mb-4">Skills Practiced Today</p>
          <div className="grid grid-cols-3 gap-3">
            {SKILLS.map((skill) => (
              <div key={skill.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#D4AF5E] shadow-sm">
                  {skill.icon}
                </div>
                <span className="text-xs font-medium text-[#4A5568]">{skill.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-[#4A5568] mb-3 text-center">How did this story make you feel?</p>
          <div className="flex justify-center gap-3">
            {RATINGS.map((emoji, index) => (
              <button
                key={emoji}
                onClick={() => setRating(index)}
                className="text-3xl transition-all"
                style={{
                  transform: `scale(${rating === index ? 1.25 : 1})`,
                  opacity: rating === null || rating === index ? 1 : 0.5,
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {rating !== null && rating >= 3 && (
          <div className="bg-white border border-[#A8D5E2]/60 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircleHeart className="w-4 h-4 text-[#6B9AC4]" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B9AC4]">
                Parent micro-support · {selTheme}
              </span>
            </div>

            {plan === 'premium' ? (
              <>
                <p className="text-xs text-[#718096] mb-4">
                  Today's story practiced <strong>{selTheme}</strong>. Here's how to keep the
                  conversation going, gently and without pressure.
                </p>
                <div className="flex flex-col gap-3">
                  <MicroTip label="Reflection question for you" body={reflectionQuestion} />
                  <MicroTip label="Conversation starter with your child" body={conversationStarter} />
                  <MicroTip label="Practical tip" body={practicalTip} />
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 mt-2">
                <div className="w-9 h-9 rounded-full bg-[#A8D5E2]/20 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-[#6B9AC4]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#4A5568] leading-relaxed mb-2">
                    Reflection questions, conversation starters, and practical tips for this story
                    are part of Nuppu Premium.
                  </p>
                  <button
                    onClick={() => navigate('/adult-corner/subscription')}
                    className="text-xs font-semibold text-[#6B9AC4] underline underline-offset-2"
                  >
                    Unlock Premium
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button fullWidth onClick={() => navigate('/library')}>
            Choose Another Story
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigate('/home')}>
            Back to Home
          </Button>
        </div>
      </div>
    </MobileScreen>
  );
}

function MicroTip({ label, body }: { label: string; body: string }) {
  return (
    <div className="bg-[#A8D5E2]/10 rounded-xl p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B9AC4] mb-1">{label}</p>
      <p className="text-xs text-[#4A5568] leading-relaxed">{body}</p>
    </div>
  );
}
