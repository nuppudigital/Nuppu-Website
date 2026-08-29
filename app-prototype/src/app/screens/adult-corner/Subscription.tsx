import { useNavigate } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { useChild, type PlanTier } from '../../context/ChildContext';

const PLANS: {
  id: PlanTier;
  name: string;
  price: string;
  features: string[];
}[] = [
  {
    id: 'freemium',
    name: 'Freemium',
    price: '€4.99 / month',
    features: [
      'Nuppu the Bunny as the main storyteller',
      'No personalization at this stage',
      'Shorter stories (2–3 minutes)',
      'No parent micro-support content',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '€6.99 / month',
    features: [
      'Personalized stories using name & interests',
      'Longer stories (5–7 minutes)',
      'Parent micro-support content unlocked',
      'Full access to the Adult Corner tip library',
    ],
  },
];

export function Subscription() {
  const navigate = useNavigate();
  const { plan, setPlan } = useChild();

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
          <h1 className="text-lg font-bold text-white">Subscription & Plan</h1>
        </div>

        <div className="px-6 py-6">
          <p className="text-xs text-[#6B6660] mb-5 leading-relaxed">
            This is a demo switch for the prototype — toggle plans below to see how the app
            experience changes for Freemium vs. Premium families, e.g. on the story completion
            screen.
          </p>

          <div className="flex flex-col gap-4">
            {PLANS.map((p) => {
              const active = plan === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`text-left rounded-2xl border-2 p-5 transition-all ${
                    active ? 'border-[#6E4FD1] bg-[#C9BBF5]/10 shadow-md' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-base font-bold text-[#35322B]">{p.name}</p>
                    {active && (
                      <span className="text-[10px] font-bold text-white bg-[#6E4FD1] px-2 py-1 rounded-full">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#6E4FD1] mb-3">{p.price}</p>
                  <ul className="space-y-2">
                    {p.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-[#55504A]">
                        <Check className="w-3.5 h-3.5 text-[#6E4FD1] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[#6B6660] text-center mt-6 leading-relaxed">
            Pricing shown for concept validation only — final pricing to be confirmed by the
            Nuppu Digital team.
          </p>
        </div>
      </div>
    </MobileScreen>
  );
}
