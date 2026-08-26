import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Clock, Play, Tag } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { useChild } from '../context/ChildContext';
import { CLASSIC_STORIES } from '../data/stories';

export function StoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { recordCategoryListen } = useChild();
  const story = CLASSIC_STORIES.find((s) => s.id === id) ?? CLASSIC_STORIES[0];

  const handleStart = () => {
    recordCategoryListen(story.category);
    navigate(`/playback/${story.id}`);
  };

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#F9E5A8]/40 via-[#FFD4C4]/20 to-white">
        <div className={`bg-gradient-to-br ${story.color} px-6 pt-8 pb-10 relative`}>
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center mb-6"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#35322B]" />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="text-7xl mb-4 drop-shadow">{story.emoji}</div>
            <h1 className="text-2xl font-bold text-[#35322B]">{story.title}</h1>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 text-sm text-[#55504A] bg-white rounded-full px-3 py-1.5 border border-gray-100">
              <Tag className="w-3.5 h-3.5" />
              {story.category}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#55504A] bg-white rounded-full px-3 py-1.5 border border-gray-100">
              <Clock className="w-3.5 h-3.5" />
              {story.duration}
            </div>
          </div>

          <p className="text-sm text-[#55504A] leading-relaxed mb-8">{story.description}</p>

          <Button fullWidth onClick={handleStart} className="flex items-center justify-center gap-2">
            <Play className="w-4 h-4 fill-white" />
            Start Story
          </Button>
        </div>
      </div>
    </MobileScreen>
  );
}
