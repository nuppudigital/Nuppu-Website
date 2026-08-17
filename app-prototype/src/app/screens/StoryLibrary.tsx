import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Play, Search, Sparkles } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { ParentAccessButton, ParentAccessModal } from '../components/ParentAccessModal';
import { useChild } from '../context/ChildContext';
import { CATEGORIES, CLASSIC_STORIES } from '../data/stories';

export function StoryLibrary() {
  const navigate = useNavigate();
  const { generatedStories, setCurrentStory } = useChild();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [pinOpen, setPinOpen] = useState(false);

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

  return (
    <MobileScreen>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="bg-gradient-to-r from-[#F9E5A8] to-[#E8C468] px-6 pt-8 pb-5">
          <h1 className="text-xl font-bold text-white mb-4">Story Library</h1>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories..."
              className="w-full rounded-full bg-white/95 pl-10 pr-4 py-2.5 text-sm text-[#35322B] placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 px-6 py-3 overflow-x-auto shrink-0 border-b border-gray-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat ? 'bg-[#6E4FD1] text-white shadow' : 'bg-gray-100 text-[#55504A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 pb-24">
          {filteredAiStories.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-[#55504A] mb-3">AI Generated Stories</p>
              <div className="flex flex-col gap-3">
                {filteredAiStories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => {
                      setCurrentStory(story);
                      navigate('/story-playback');
                    }}
                    className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 text-left hover:bg-gray-100 transition-colors relative"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${story.color} flex items-center justify-center text-2xl shrink-0`}
                    >
                      {story.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#35322B] truncate">{story.title}</p>
                        <span className="shrink-0 flex items-center gap-0.5 bg-[#D4C5F9]/30 text-[#6E4FD1] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6660]">
                        {story.emotion} • {story.duration}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#6E4FD1] flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredClassics.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#55504A] mb-3">Classic Stories</p>
              <div className="flex flex-col gap-3">
                {filteredClassics.map((story) => (
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
                      <p className="text-sm font-semibold text-[#35322B] truncate">{story.title}</p>
                      <p className="text-xs text-[#6B6660]">
                        {story.category} • {story.duration}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#6E4FD1] flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredClassics.length === 0 && filteredAiStories.length === 0 && (
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
