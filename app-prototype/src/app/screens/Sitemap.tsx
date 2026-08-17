import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';

const ROUTES: { path: string; label: string; group: string }[] = [
  { path: '/', label: 'Splash', group: 'Onboarding' },
  { path: '/signup', label: 'Create Account', group: 'Onboarding' },
  { path: '/add-child', label: 'Add Child Profile', group: 'Onboarding' },
  { path: '/preferences', label: 'Preferences', group: 'Onboarding' },
  { path: '/privacy', label: 'Privacy Confirmation', group: 'Onboarding' },
  { path: '/tutorial', label: 'Micro-Support Tutorial', group: 'Onboarding' },
  { path: '/home', label: 'Home', group: 'Core' },
  { path: '/library', label: 'Story Library', group: 'Core' },
  { path: '/story/lunas-brave-day', label: 'Story Detail', group: 'Core' },
  { path: '/emotion-check', label: 'Emotion Selection', group: 'Story Experience' },
  { path: '/breathing', label: 'Breathing Exercise', group: 'Story Experience' },
  { path: '/story-playback', label: 'Story Playback', group: 'Story Experience' },
  { path: '/completion/lunas-brave-day', label: 'Story Completion', group: 'Story Experience' },
  { path: '/progress', label: 'Progress Tracker', group: 'Parent' },
  { path: '/settings', label: 'Settings', group: 'Parent' },
  { path: '/adult-corner', label: 'Adult Corner (hub)', group: 'Adult Corner' },
  { path: '/adult-corner/subscription', label: 'Subscription & Plan', group: 'Adult Corner' },
  { path: '/adult-corner/about', label: 'About Nuppu', group: 'Adult Corner' },
  { path: '/adult-corner/letter', label: 'Nuppu Letter', group: 'Adult Corner' },
  { path: '/adult-corner/tips', label: 'Micro-Support Tips Library', group: 'Adult Corner' },
  { path: '/adult-corner/feedback', label: 'Feedback & Development', group: 'Adult Corner' },
];

const GROUPS = ['Onboarding', 'Core', 'Story Experience', 'Parent', 'Adult Corner'];

export function Sitemap() {
  const navigate = useNavigate();

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/30 via-[#C9BBF5]/10 to-white">
        <div className="bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] px-6 pt-8 pb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Prototype Sitemap</h1>
            <p className="text-xs text-white/80">Jump to any screen</p>
          </div>
        </div>

        <div className="px-6 py-6">
          {GROUPS.map((group) => (
            <div key={group} className="mb-6">
              <p className="text-xs font-semibold text-[#6B6660] uppercase tracking-wide mb-2">{group}</p>
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
                {ROUTES.filter((r) => r.group === group).map((route) => (
                  <button
                    key={route.path}
                    onClick={() => navigate(route.path)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#35322B]">{route.label}</p>
                      <p className="text-xs text-[#6B6660]">{route.path}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileScreen>
  );
}
