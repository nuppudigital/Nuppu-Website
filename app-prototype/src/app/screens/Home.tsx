import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Baby, BookOpen, Headphones, Map, Settings as SettingsIcon, Shield, User } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getAvatarImage } from '../utils/avatars';
import { useChild } from '../context/ChildContext';
import { CLASSIC_STORIES, STORY_CATEGORIES } from '../data/stories';
import { MOODS } from '../data/moods';

const PARENTAL_TIPS = [
  "Ask open-ended questions like \"How did that make you feel?\"",
  'Let silences sit — kids often need a moment before they answer.',
  'Celebrate small wins in emotional expression, not just big ones.',
];

type Mode = 'parent' | 'child';

export function Home() {
  const navigate = useNavigate();
  const { childData, generatedStories, dailyMood, setDailyMood, storyMode, setStoryMode, categoryListenCounts } =
    useChild();
  const [mode, setMode] = useState<Mode>('parent');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const totalStories = CLASSIC_STORIES.length + generatedStories.length;
  const skillsChosen = childData.interests.length;
  const selectedMood = MOODS.find((m) => m.id === dailyMood?.emotion);
  const favoriteCategories = [...STORY_CATEGORIES]
    .sort((a, b) => (categoryListenCounts[b.name] ?? 0) - (categoryListenCounts[a.name] ?? 0))
    .slice(0, 3);

  return (
    <MobileScreen>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className={`px-6 pt-8 pb-6 ${
            mode === 'parent'
              ? 'bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5]'
              : 'bg-gradient-to-r from-[#F9E5A8] to-[#FFD4C4]'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex bg-white/20 rounded-full p-1">
              <button
                onClick={() => setMode('parent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  mode === 'parent' ? 'bg-white text-[#6E4FD1] shadow' : 'text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Parent
              </button>
              <button
                onClick={() => setMode('child')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  mode === 'child' ? 'bg-white text-[#D4AF5E] shadow' : mode === 'parent' ? 'text-white' : 'text-[#35322B]'
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
                <h1 className="text-xl font-bold text-[#35322B]">Hi {childData.name}!</h1>
                <p className="text-sm text-[#55504A]">Ready for a story?</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
          {mode === 'parent' ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => navigate('/progress')}
                  className="bg-[#D4C5F9]/20 rounded-2xl p-4 text-left hover:bg-[#D4C5F9]/30 transition-colors"
                >
                  <p className="text-2xl font-bold text-[#6E4FD1]">{totalStories}</p>
                  <p className="text-xs text-[#6B6660] mt-0.5">Stories</p>
                </button>
                <button
                  onClick={() => navigate('/progress')}
                  className="bg-[#B8DDB8]/20 rounded-2xl p-4 text-left hover:bg-[#B8DDB8]/30 transition-colors"
                >
                  <p className="text-2xl font-bold text-[#4a9d7f]">{skillsChosen}</p>
                  <p className="text-xs text-[#6B6660] mt-0.5">Skills</p>
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#F9E5A8]/60 to-[#FFD4C4]/30 rounded-2xl p-4 mb-6 border border-[#F9E5A8]">
                <p className="text-sm font-semibold text-[#35322B] mb-2">Parental Tips</p>
                <ul className="space-y-1.5">
                  {PARENTAL_TIPS.map((tip) => (
                    <li key={tip} className="text-xs text-[#55504A] flex gap-1.5">
                      <span>💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm font-semibold text-[#55504A] mb-3">Story Categories</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {STORY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => navigate('/library', { state: { category: cat.name } })}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br ${cat.color} py-4 px-2 text-center active:scale-95 transition-transform`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <p className="text-xs font-semibold text-[#35322B] leading-tight">{cat.name}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#55504A] mb-3">How are you feeling today?</p>
              {dailyMood && !showMoodPicker ? (
                <button
                  onClick={() => setShowMoodPicker(true)}
                  className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl p-4 mb-6 text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="text-3xl">{selectedMood?.emoji ?? '😊'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#35322B]">
                      Feeling {selectedMood?.label ?? dailyMood.emotion} today
                    </p>
                    <p className="text-xs text-[#6B6660]">Tap to change</p>
                  </div>
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => {
                        setDailyMood(mood.id);
                        setShowMoodPicker(false);
                      }}
                      className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 transition-all ${mood.color} ${
                        dailyMood?.emotion === mood.id ? 'ring-4 ring-[#6E4FD1]' : ''
                      }`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-[10px] font-semibold text-[#35322B]">{mood.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-sm font-semibold text-[#55504A] mb-3">How do you want your story?</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setStoryMode('book')}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all ${
                    storyMode === 'book' ? 'border-[#6E4FD1] bg-[#C9BBF5]/15' : 'border-gray-200 bg-white'
                  }`}
                >
                  <BookOpen className="w-6 h-6 text-[#6E4FD1]" />
                  <span className="text-sm font-semibold text-[#35322B]">Story Book</span>
                </button>
                <button
                  onClick={() => setStoryMode('audio')}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all ${
                    storyMode === 'audio' ? 'border-[#6E4FD1] bg-[#C9BBF5]/15' : 'border-gray-200 bg-white'
                  }`}
                >
                  <Headphones className="w-6 h-6 text-[#6E4FD1]" />
                  <span className="text-sm font-semibold text-[#35322B]">Audio Stories</span>
                </button>
              </div>

              <p className="text-sm font-semibold text-[#55504A] mb-3">Your Favorite Categories</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {favoriteCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => navigate('/library', { state: { category: cat.name } })}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-br ${cat.color} py-4 px-2 text-center active:scale-95 transition-transform`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <p className="text-xs font-semibold text-[#35322B] leading-tight">{cat.name}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          <Button variant="ghost" fullWidth onClick={() => navigate('/library')}>
            Browse All Stories
          </Button>
        </div>
      </div>
    </MobileScreen>
  );
}
