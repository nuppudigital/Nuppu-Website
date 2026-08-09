import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';

const TIP_CATEGORIES = [
  {
    category: 'Everyday conversation',
    tips: [
      'Ask open-ended questions like "How did that make you feel?" instead of yes/no questions.',
      'Let silences sit — kids often need a moment before they answer.',
      'Get down to their eye level before starting a feelings conversation.',
    ],
  },
  {
    category: 'Big emotions',
    tips: [
      'Name the feeling before offering a solution: "You seem frustrated" lands better than "Calm down."',
      'Celebrate small wins in emotional expression, not just big ones.',
      'A breathing moment together can help before any conversation starts.',
    ],
  },
  {
    category: 'Bedtime & routine',
    tips: [
      'Keep story time calm and screen-free right before — it helps the wind-down stick.',
      'The same short phrase each night ("Story, breathe, sleep") builds a comforting rhythm.',
    ],
  },
];

export function MicroSupportLibrary() {
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/25 via-[#C9BBF5]/10 to-white">
        <div className="bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] px-6 pt-8 pb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Micro-Support Tips</h1>
            <p className="text-xs text-white/80">Expert tips, updated monthly</p>
          </div>
        </div>

        <div className="px-6 py-6">
          {TIP_CATEGORIES.map((group) => (
            <div key={group.category} className="mb-6">
              <p className="text-sm font-semibold text-[#55504A] mb-3">{group.category}</p>
              <div className="flex flex-col gap-2.5">
                {group.tips.map((tip) => (
                  <div
                    key={tip}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-2.5"
                  >
                    <span className="shrink-0">💡</span>
                    <p className="text-xs text-[#55504A] leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileScreen>
  );
}
