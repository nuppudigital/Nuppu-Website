import { useNavigate } from 'react-router';
import { HeartHandshake, MessageCircle, Sparkles } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { ProgressBar } from './AddChildProfile';

const CARDS = [
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: 'Gentle prompts, right on time',
    example: '"Ask Emma how she thinks the character felt in that moment."',
  },
  {
    icon: <HeartHandshake className="w-5 h-5" />,
    title: 'Coaching for real conversations',
    example: '"Try reflecting her feelings back before offering a solution."',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Never intrusive',
    example: 'Tips appear briefly during stories and fade — you stay in control.',
  },
];

export function MicroSupportTutorial() {
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/40 via-[#A8D5E2]/20 to-white px-6 py-8">
        <ProgressBar step={5} />

        <h1 className="text-2xl font-bold text-[#2D3748] mb-1 mt-6">Meet micro-support</h1>
        <p className="text-sm text-[#718096] mb-6">
          Brief coaching tips that appear while your child listens to a story — helping you turn story time into
          connection time.
        </p>

        <div className="flex flex-col gap-4 mb-8">
          {CARDS.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4C5F9]/40 to-[#A8D5E2]/40 text-[#6B9AC4] flex items-center justify-center mb-3">
                {card.icon}
              </div>
              <p className="text-sm font-semibold text-[#2D3748] mb-2">{card.title}</p>
              <p className="text-xs text-[#718096] italic leading-relaxed bg-gray-50 rounded-lg p-3">
                {card.example}
              </p>
            </div>
          ))}
        </div>

        <Button fullWidth onClick={() => navigate('/home')}>
          Get Started
        </Button>
      </div>
    </MobileScreen>
  );
}
