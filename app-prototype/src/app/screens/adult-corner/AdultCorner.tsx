import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  Lightbulb,
  Mail,
  MessageSquareHeart,
  Sparkles,
  Users,
} from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AVATAR_MAP } from '../../utils/avatars';

const LINKS = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Subscription & Plan',
    description: 'Manage your Nuppu plan and billing',
    path: '/adult-corner/subscription',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Add / Switch Profile',
    description: 'Add another child or edit this profile',
    path: '/add-child',
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Micro-Support Tips Library',
    description: 'Expert parenting tips, updated monthly',
    path: '/adult-corner/tips',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'About Nuppu',
    description: 'Why Nuppu exists, SEL, AI safety & privacy',
    path: '/adult-corner/about',
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'Nuppu Letter',
    description: "This month's theme and encouragement",
    path: '/adult-corner/letter',
  },
  {
    icon: <MessageSquareHeart className="w-5 h-5" />,
    title: 'Feedback & Development',
    description: 'Give feedback, suggest themes, report content',
    path: '/adult-corner/feedback',
  },
];

export function AdultCorner() {
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/25 via-[#A8D5E2]/10 to-white">
        <div className="bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Adult Corner</h1>
              <p className="text-xs text-white/80">Parent-only content, never shown to your child</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/15 rounded-2xl p-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/60">
              <ImageWithFallback
                src={AVATAR_MAP.bunny.image}
                alt="Nuppu"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              Everything here is designed to support you — never to judge your parenting.
            </p>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
            {LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="w-10 h-10 rounded-xl bg-[#A8D5E2]/15 text-[#6B9AC4] flex items-center justify-center shrink-0">
                  {link.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2D3748]">{link.title}</p>
                  <p className="text-xs text-[#718096] mt-0.5">{link.description}</p>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileScreen>
  );
}
