import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Database, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { ProgressBar } from './AddChildProfile';

const TOGGLES = [
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Data Encryption',
    description: 'All child data is encrypted end-to-end and never sold to third parties.',
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Minimal Data Collection',
    description: 'We only store what is needed to personalize stories — name, age, and interests.',
  },
  {
    icon: <UserCheck className="w-5 h-5" />,
    title: 'Parental Control',
    description: 'You can view, export, or delete your child\'s data at any time from Settings.',
  },
];

export function PrivacyConfirmation() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState<boolean[]>(TOGGLES.map(() => true));

  const allAgreed = agreed.every(Boolean);

  const toggle = (index: number) => {
    setAgreed((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/40 via-[#C9BBF5]/20 to-white px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center mb-4"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-[#35322B]" />
        </button>
        <ProgressBar step={4} />

        <div className="flex flex-col items-center text-center mt-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#C9BBF5]/25 flex items-center justify-center mb-3">
            <ShieldCheck className="w-8 h-8 text-[#6E4FD1]" />
          </div>
          <h1 className="text-2xl font-bold text-[#35322B]">Your family's privacy</h1>
          <p className="text-sm text-[#6B6660] mt-1">GDPR compliant, always in your control</p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {TOGGLES.map((item, index) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9BBF5]/15 text-[#6E4FD1] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#35322B]">{item.title}</p>
                <p className="text-xs text-[#6B6660] mt-1 leading-relaxed">{item.description}</p>
              </div>
              <button
                onClick={() => toggle(index)}
                className={`w-11 h-6 rounded-full shrink-0 relative transition-colors ${
                  agreed[index] ? 'bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5]' : 'bg-gray-200'
                }`}
                aria-label={`Toggle ${item.title}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    agreed[index] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <Button fullWidth disabled={!allAgreed} onClick={() => navigate('/tutorial')}>
          I Agree
        </Button>
      </div>
    </MobileScreen>
  );
}
