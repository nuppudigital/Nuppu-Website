import { useNavigate } from 'react-router';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AVATAR_MAP } from '../utils/avatars';

export function Splash() {
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#A8D5E2] via-[#D4C5F9] to-[#B8DDB8] px-8 text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-[#F9E5A8]/60 blur-2xl scale-125" />
          <div
            className="relative w-36 h-36 rounded-full overflow-hidden shadow-xl bg-white/40 animate-bounce"
            style={{ animationDuration: '2.5s' }}
          >
            <ImageWithFallback
              src={AVATAR_MAP.bunny.image}
              alt="Nuppu the Bunny"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="relative bg-white rounded-3xl rounded-bl-md px-5 py-4 shadow-lg mb-8 max-w-xs">
          <p className="text-sm font-bold text-[#2D3748] mb-1">
            ✨ Welcome! My name is Nuppu.
          </p>
          <p className="text-xs text-[#4A5568] leading-relaxed">
            I'm your child's best friend for emotional skills — I bring gentle, personalized
            stories that support safe emotional development.
          </p>
        </div>

        <p className="text-sm text-white/90 max-w-xs leading-relaxed mb-8">
          All content is age-appropriate and designed together with education professionals.
        </p>

        <Button fullWidth onClick={() => navigate('/login')} className="max-w-[220px]">
          Get started
        </Button>

        <p className="text-xs text-white/70 uppercase tracking-widest mt-10">Interactive Prototype</p>
      </div>
    </MobileScreen>
  );
}
