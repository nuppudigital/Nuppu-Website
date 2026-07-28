import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Flag, MessageSquareHeart, Sparkles } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { Button } from '../../components/Button';

type Mode = 'feedback' | 'theme' | 'report';

const MODES: { id: Mode; label: string; icon: React.ReactNode; placeholder: string }[] = [
  {
    id: 'feedback',
    label: 'Give feedback',
    icon: <MessageSquareHeart className="w-4 h-4" />,
    placeholder: 'Tell us what is working well or what could be better...',
  },
  {
    id: 'theme',
    label: 'Suggest a theme',
    icon: <Sparkles className="w-4 h-4" />,
    placeholder: 'What story theme or emotional skill should Nuppu cover next?',
  },
  {
    id: 'report',
    label: 'Report content',
    icon: <Flag className="w-4 h-4" />,
    placeholder: 'Let us know which story felt off and why — we review every report.',
  },
];

export function Feedback() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('feedback');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const active = MODES.find((m) => m.id === mode)!;

  const handleSubmit = () => {
    if (!message.trim()) return;
    setSent(true);
    setMessage('');
  };

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/25 via-[#A8D5E2]/10 to-white">
        <div className="bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] px-6 pt-8 pb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Feedback & Development</h1>
        </div>

        <div className="px-6 py-6">
          <div className="flex bg-white rounded-full p-1 border border-gray-200 mb-6">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setSent(false);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-full text-[11px] font-semibold transition-all ${
                  mode === m.id ? 'bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] text-white shadow' : 'text-[#4A5568]'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {sent ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-[#6B9AC4] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#2D3748] mb-1">Thank you!</p>
              <p className="text-xs text-[#718096]">
                Your message has been noted. The Nuppu Digital team reviews every submission.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={active.placeholder}
                rows={5}
                className="w-full rounded-xl border border-gray-200 p-3 text-sm text-[#2D3748] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B9AC4] focus:border-transparent resize-none mb-4"
              />
              <Button fullWidth disabled={!message.trim()} onClick={handleSubmit}>
                Send
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileScreen>
  );
}
