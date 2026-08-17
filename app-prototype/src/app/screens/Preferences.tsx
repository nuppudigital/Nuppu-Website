import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, BookOpen, ShieldCheck } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Button } from '../components/Button';
import { ProgressBar } from './AddChildProfile';

const GENRES = ['Emotional growth', 'Bedtime calm', 'Friendship', 'Adventure', 'Problem-solving'];
const CONTENT_FILTERS = ['Filter scary themes', 'Filter conflict themes', 'Gentle language only'];
const NOTIFICATIONS = ['Daily story reminder', 'Weekly progress summary', 'New feature updates'];

export function Preferences() {
  const navigate = useNavigate();
  const [genres, setGenres] = useState<string[]>(['Emotional growth', 'Friendship']);
  const [filters, setFilters] = useState<string[]>(['Filter scary themes']);
  const [notifications, setNotifications] = useState<string[]>(['Daily story reminder']);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/40 via-[#C9BBF5]/20 to-white px-6 py-8">
        <ProgressBar step={3} />

        <h1 className="text-2xl font-bold text-[#35322B] mb-1 mt-6">Story preferences</h1>
        <p className="text-sm text-[#6B6660] mb-6">Tell us what kind of stories to prioritize</p>

        <Section icon={<BookOpen className="w-4 h-4" />} title="Preferred genres">
          <div className="grid grid-cols-1 gap-2">
            {GENRES.map((genre) => (
              <Checkbox
                key={genre}
                label={genre}
                checked={genres.includes(genre)}
                onChange={() => toggle(genres, setGenres, genre)}
              />
            ))}
          </div>
        </Section>

        <Section icon={<ShieldCheck className="w-4 h-4" />} title="Content filters">
          <div className="grid grid-cols-1 gap-2">
            {CONTENT_FILTERS.map((filter) => (
              <Checkbox
                key={filter}
                label={filter}
                checked={filters.includes(filter)}
                onChange={() => toggle(filters, setFilters, filter)}
              />
            ))}
          </div>
        </Section>

        <Section icon={<Bell className="w-4 h-4" />} title="Notifications">
          <div className="grid grid-cols-1 gap-2">
            {NOTIFICATIONS.map((notification) => (
              <Checkbox
                key={notification}
                label={notification}
                checked={notifications.includes(notification)}
                onChange={() => toggle(notifications, setNotifications, notification)}
              />
            ))}
          </div>
        </Section>

        <Button fullWidth onClick={() => navigate('/privacy')} className="mt-4">
          Continue
        </Button>
      </div>
    </MobileScreen>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 text-[#55504A]">
        {icon}
        <p className="text-sm font-semibold">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3 text-left"
    >
      <span
        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
          checked ? 'bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5]' : 'bg-gray-100 border border-gray-300'
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-sm bg-white" />}
      </span>
      <span className="text-sm text-[#35322B]">{label}</span>
    </button>
  );
}
