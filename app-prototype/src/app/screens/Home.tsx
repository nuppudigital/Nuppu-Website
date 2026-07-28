import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Baby, Map, Play, Settings as SettingsIcon, Shield, User } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getAvatarImage } from '../utils/avatars';
import { useChild } from '../context/ChildContext';
import { CLASSIC_STORIES } from '../data/stories';

const RECOMMENDED_IDS = ['lunas-brave-day', 'the-friendship-garden', 'ocean-of-feelings'];
const recommendedStories = CLASSIC_STORIES.filter((s) => RECOMMENDED_IDS.includes(s.id));

const TIPS = [
  "Ask open-ended questions like \"How did that make you feel?\"",
  'Let silences sit — kids often need a moment before they answer.',
  'Celebrate small wins in emotional expression, not just big ones.',
];

type Mode = 'parent' | 'child';

export function Home() {
  const navigate = useNavigate();
  const { childData } = useChild();
  const [mode, setMode] = useState<Mode>('parent');

  return (
    <MobileScreen>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className={`px-6 pt-8 pb-6 ${
            mode === 'parent'
              ? 'bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2]'
              : 'bg-gradient-to-r from-[#F9E5A8] to-[#FFD4C4]'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex bg-white/20 rounded-full p-1">
              <button
                onClick={() => setMode('parent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  mode === 'parent' ? 'bg-white text-[#6B9AC4] shadow' : 'text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Parent
              </button>
              <button
                onClick={() => setMode('child')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  mode === 'child' ? 'bg-white text-[#D4AF5E] shadow' : mode === 'parent' ? 'text-white' : 'text-[#2D3748]'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                Child
              </button>
            </div>

            {mode === 'parent' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/adult-corner')}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
                  aria-label="Adult Corner"
                >
                  <Shield className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/sitemap')}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
                  aria-label="Sitemap"
                >
                  <Map className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
                  aria-label="Settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {mode === 'parent' ? (
            <div>
              <h1 className="text-xl font-bold text-white">Welcome back!</h1>
              <p className="text-sm text-white/80 mt-0.5">Here's how {childData.name} is doing</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden shadow-md border-2 border-white">
                <ImageWithFallback
                  src={childData.customAvatar || getAvatarImage(childData.avatar)}
                  alt={childData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D3748]">Hi {childData.name}!</h1>
                <p className="text-sm text-[#4A5568]">Ready for a story?</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          {mode === 'parent' && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => navigate('/progress')}
                  className="bg-[#D4C5F9]/20 rounded-2xl p-4 text-left hover:bg-[#D4C5F9]/30 transition-colors"
                >
                  <p className="text-2xl font-bold text-[#6B9AC4]">12</p>
                  <p className="text-xs text-[#718096] mt-0.5">Stories</p>
                </button>
                <button
                  onClick={() => navigate('/progress')}
                  className="bg-[#B8DDB8]/20 rounded-2xl p-4 text-left hover:bg-[#B8DDB8]/30 transition-colors"
                >
                  <p className="text-2xl font-bold text-[#4a9d7f]">5</p>
                  <p className="text-xs text-[#718096] mt-0.5">Skills</p>
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#F9E5A8]/60 to-[#FFD4C4]/30 rounded-2xl p-4 mb-6 border border-[#F9E5A8]">
                <p className="text-sm font-semibold text-[#2D3748] mb-2">Today's Tips</p>
                <ul className="space-y-1.5">
                  {TIPS.map((tip) => (
                    <li key={tip} className="text-xs text-[#4A5568] flex gap-1.5">
                      <span>💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <p className="text-sm font-semibold text-[#4A5568] mb-3">Recommended Stories</p>
          <div className="flex flex-col gap-3 mb-6">
            {recommendedStories.map((story) => (
              <button
                key={story.id}
                onClick={() => navigate(`/story/${story.id}`)}
                className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 text-left hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${story.color} flex items-center justify-center text-2xl shrink-0`}
                >
                  {story.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2D3748] truncate">{story.title}</p>
                  <p className="text-xs text-[#718096]">{story.duration}</p>
                </div>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    mode === 'parent' ? 'bg-[#6B9AC4]' : 'bg-[#E8C468]'
                  }`}
                >
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </button>
            ))}
          </div>

          <Button variant="ghost" fullWidth onClick={() => navigate('/library')}>
            Browse All Stories
          </Button>
        </div>
      </div>
    </MobileScreen>
  );
}
