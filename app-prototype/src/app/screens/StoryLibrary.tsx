import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, Headphones, Search, Sparkles } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { ParentAccessButton, ParentAccessModal } from '../components/ParentAccessModal';
import { useChild } from '../context/ChildContext';
import { CATEGORIES, CLASSIC_STORIES, STORY_CATEGORIES } from '../data/stories';
import { MOODS } from '../data/moods';

export function StoryLibrary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { generatedStories, setCurrentStory, storyMode, setStoryMode, dailyMood, setDailyMood, categoryListenCounts } =
    useChild();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(() => {
    const incoming = (location.state as { category?: string } | null)?.category;
    return incoming && CATEGORIES.includes(incoming) ? incoming : 'All';
  });
  const [pinOpen, setPinOpen] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const selectedMood = MOODS.find((m) => m.id === dailyMood?.emotion);
  const favoriteCategories = [...STORY_CATEGORIES]
    .sort((a, b) => (categoryListenCounts[b.name] ?? 0) - (categoryListenCounts[a.name] ?? 0))
    .slice(0, 3);

  const filteredClassics = useMemo(() => {
    return CLASSIC_STORIES.filter((story) => {
      const matchesCategory = category === 'All' || category === story.category;
      const matchesSearch = story.title.toLowerCase().includes(search.toLowerCase());
      return (category === 'All' || category !== 'AI Stories') && matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const filteredAiStories = useMemo(() => {
    if (category !== 'All' && category !== 'AI Stories') return [];
    return generatedStories.filter((story) => story.title.toLowerCase().includes(search.toLowerCase()));
  }, [generatedStories, search, category]);

  const cards = [
    ...filteredAiStories.map((story) => ({
      key: story.id,
      title: story.title,
      emoji: story.emoji,
      color: story.color,
      isAi: true,
      onSelect: () => {
        setCurrentStory(story);
        navigate('/story-playback');
      },
    })),
    ...filteredClassics.map((story) => ({
      key: story.id,
      title: story.title,
      emoji: story.emoji,
      color: story.color,
      isAi: false,
      onSelect: () => navigate(`/story/${story.id}`),
    })),
  ];

  return (
    <MobileScreen>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="bg-gradient-to-r from-[#F9E5A8] to-[#E8C468] px-6 pt-7 pb-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Story Library</h1>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories..."
              className="w-full rounded-2xl bg-white pl-11 pr-4 py-3 text-base text-[#35322B] placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <p className="text-sm font-semibold text-[#55504A] mb-2 mt-4">Your Favorite Categories</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {favoriteCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br ${cat.color} py-3 px-2 text-center active:scale-95 transition-transform ${
                  category === cat.name ? 'ring-2 ring-[#6E4FD1]' : ''
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <p className="text-xs font-semibold text-[#35322B] leading-tight">{cat.name}</p>
              </button>
            ))}
          </div>

          <p className="text-sm font-semibold text-[#55504A] mb-2">How are you feeling today?</p>
          {dailyMood && !showMoodPicker ? (
            <button
              onClick={() => setShowMoodPicker(true)}
              className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl p-3 mb-4 text-left hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">{selectedMood?.emoji ?? '😊'}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#35322B]">
                  Feeling {selectedMood?.label ?? dailyMood.emotion} today
                </p>
                <p className="text-xs text-[#6B6660]">Tap to change</p>
              </div>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => {
                    setDailyMood(mood.id);
                    setShowMoodPicker(false);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-2 transition-all ${mood.color} ${
                    dailyMood?.emotion === mood.id ? 'ring-4 ring-[#6E4FD1]' : ''
                  }`}
                >
                  <span className="text-xl">{mood.emoji}</span>
                  <span className="text-[10px] font-semibold text-[#35322B]">{mood.label}</span>
                </button>
              ))}
            </div>
          )}

          <p className="text-sm font-semibold text-[#55504A] mb-2">How do you want your story?</p>
          <div className="flex bg-gray-100 rounded-full p-1 mb-4">
            <button
              onClick={() => setStoryMode('book')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition-all ${
                storyMode === 'book' ? 'bg-white text-[#6E4FD1] shadow' : 'text-[#55504A]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Story Book
            </button>
            <button
              onClick={() => setStoryMode('audio')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-semibold transition-all ${
                storyMode === 'audio' ? 'bg-white text-[#6E4FD1] shadow' : 'text-[#55504A]'
              }`}
            >
              <Headphones className="w-4 h-4" />
              Audio Stories
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  category === cat ? 'bg-[#6E4FD1] text-white' : 'bg-gray-100 text-[#55504A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-sm font-semibold text-[#55504A] mb-3">
            {storyMode === 'audio' ? '🎧 Audio Stories' : '📖 Story Books'}
          </p>
          {cards.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {cards.map((card) => (
                <button
                  key={card.key}
                  onClick={card.onSelect}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br ${card.color} py-5 px-3 text-center active:scale-95 transition-transform`}
                >
                  {card.isAi && (
                    <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#6E4FD1]" />
                    </span>
                  )}
                  <span className="text-5xl leading-none">{card.emoji}</span>
                  <p className="text-sm font-bold text-[#35322B] leading-snug line-clamp-2">{card.title}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 mt-10">No stories found</p>
          )}
        </div>

        <ParentAccessButton onClick={() => setPinOpen(true)} />
        <ParentAccessModal
          open={pinOpen}
          onClose={() => setPinOpen(false)}
          onSuccess={() => {
            setPinOpen(false);
            navigate('/home');
          }}
        />
      </div>
    </MobileScreen>
  );
}
