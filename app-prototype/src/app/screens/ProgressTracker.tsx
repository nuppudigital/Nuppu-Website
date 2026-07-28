import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_DATA = [2, 1, 3, 1, 2, 0, 3];
const MAX_STORIES = 3;

const SKILLS = [
  { label: 'Emotional Awareness', value: 8, color: 'bg-[#6B9AC4]' },
  { label: 'Self-Confidence', value: 6, color: 'bg-[#4a9d7f]' },
  { label: 'Problem Solving', value: 7, color: 'bg-[#E8C468]' },
  { label: 'Empathy', value: 5, color: 'bg-[#F5B5A8]' },
  { label: 'Communication', value: 6, color: 'bg-[#9c8ae0]' },
];

const ACHIEVEMENTS = [
  { emoji: '🏆', title: 'First Story Completed', date: 'Jul 2, 2026' },
  { emoji: '🔥', title: '5-Day Story Streak', date: 'Jul 10, 2026' },
  { emoji: '💜', title: 'Emotional Explorer Badge', date: 'Jul 15, 2026' },
];

export function ProgressTracker() {
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/30 via-[#A8D5E2]/10 to-white">
        <div className="bg-gradient-to-r from-[#6B9AC4] to-[#A8D5E2] px-6 pt-8 pb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Progress</h1>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatTile value={12} label="Stories" />
            <StatTile value={5} label="Skills" />
            <StatTile value={8} label="Badges" />
          </div>

          <p className="text-sm font-semibold text-[#4A5568] mb-3">This Week</p>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8">
            <div className="flex items-end justify-between gap-2 h-28">
              {WEEK_DATA.map((count, i) => (
                <div key={WEEK_DAYS[i]} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full flex items-end justify-center h-20">
                    <div
                      className="w-full max-w-[22px] rounded-t-md bg-gradient-to-t from-[#6B9AC4] to-[#A8D5E2]"
                      style={{ height: `${(count / MAX_STORIES) * 100}%`, minHeight: count > 0 ? 6 : 2 }}
                    />
                  </div>
                  <span className="text-[10px] text-[#718096]">{WEEK_DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm font-semibold text-[#4A5568] mb-3">Emotional Skills</p>
          <div className="flex flex-col gap-4 mb-8">
            {SKILLS.map((skill) => (
              <div key={skill.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#4A5568] font-medium">{skill.label}</span>
                  <span className="text-[#718096]">{skill.value}/10</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${skill.color}`}
                    style={{ width: `${(skill.value / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm font-semibold text-[#4A5568] mb-3">Recent Achievements</p>
          <div className="flex flex-col gap-3">
            {ACHIEVEMENTS.map((achievement) => (
              <div
                key={achievement.title}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3"
              >
                <span className="text-2xl shrink-0">{achievement.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2D3748] truncate">{achievement.title}</p>
                  <p className="text-xs text-[#718096]">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileScreen>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
      <p className="text-2xl font-bold text-[#6B9AC4]">{value}</p>
      <p className="text-xs text-[#718096] mt-0.5">{label}</p>
    </div>
  );
}
