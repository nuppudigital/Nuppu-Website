import { useNavigate } from 'react-router';
import { ArrowLeft, Heart, Lightbulb, Mail } from 'lucide-react';
import { MobileScreen } from '../../components/MobileScreen';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { AVATAR_MAP } from '../../utils/avatars';

export function NuppuLetter() {
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#F9E5A8]/40 via-[#D4C5F9]/15 to-white">
        <div className="bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] px-6 pt-8 pb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Nuppu Letter</h1>
        </div>

        <div className="px-6 py-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <ImageWithFallback
                  src={AVATAR_MAP.bunny.image}
                  alt="Nuppu"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2D3748]">This Month's Letter</p>
                <p className="text-xs text-[#718096]">From the Nuppu Digital team</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-[#6B9AC4] mb-1.5">
                <Mail className="w-4 h-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Theme of the month</p>
              </div>
              <p className="text-sm text-[#2D3748] font-semibold">Naming big feelings, gently</p>
              <p className="text-xs text-[#4A5568] mt-1 leading-relaxed">
                This month's stories focus on helping children find words for big feelings —
                because a feeling that has a name is a little easier to carry.
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-[#6B9AC4] mb-1.5">
                <Lightbulb className="w-4 h-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">New expert tip</p>
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                "Try naming your own feelings out loud in front of your child — 'I feel a little
                tired today.' It shows them that all feelings are safe to say."
              </p>
            </div>

            <div className="bg-[#F9E5A8]/30 rounded-xl p-4 flex gap-2.5">
              <Heart className="w-4 h-4 text-[#6B9AC4] shrink-0 mt-0.5" />
              <p className="text-xs text-[#4A5568] leading-relaxed">
                A small encouragement: you don't need to get it right every time. Showing up,
                calmly and consistently, is already enough.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#718096] text-center leading-relaxed">
            The Nuppu Letter is sent monthly with a new theme, an expert tip, and a small
            encouragement for parents.
          </p>
        </div>
      </div>
    </MobileScreen>
  );
}
