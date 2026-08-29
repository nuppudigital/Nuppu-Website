import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Clock,
  HelpCircle,
  LogOut,
  Map,
  Mic,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getAvatarImage } from '../utils/avatars';
import { AGE_GROUPS, useChild } from '../context/ChildContext';

const FREQUENCIES = ['Daily Tips', 'Weekly Summary', 'During Each Story', 'Off'];

export function Settings() {
  const navigate = useNavigate();
  const { childData } = useChild();
  const [frequency, setFrequency] = useState('Daily Tips');
  const [notificationsOn, setNotificationsOn] = useState(true);

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/30 via-[#C9EDE1]/10 to-white">
        <div className="bg-gradient-to-r from-[#D4C5F9] to-[#C9EDE1] px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-[#35322B]" />
            </button>
            <h1 className="text-lg font-bold text-[#35322B]">Settings</h1>
          </div>

          <div className="flex items-center gap-3 bg-white/60 rounded-2xl p-3">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
              <ImageWithFallback
                src={childData.customAvatar || getAvatarImage(childData.avatar)}
                alt={childData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#35322B]">{childData.name}</p>
              <p className="text-xs text-[#55504A]">{AGE_GROUPS[childData.ageGroup].label} · {AGE_GROUPS[childData.ageGroup].range}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9BBF5]/20 flex items-center justify-center text-[#6E4FD1]">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#35322B]">
                {childData.parentName || 'Parent Account'}
              </p>
              <p className="text-xs text-[#6B6660]">{childData.parentEmail || 'parent@email.com'}</p>
              {childData.parentPhone && (
                <p className="text-xs text-[#6B6660]">{childData.parentPhone}</p>
              )}
            </div>
          </div>

          <p className="text-sm font-semibold text-[#55504A] mb-3">Micro-Support Frequency</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq}
                onClick={() => setFrequency(freq)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  frequency === freq
                    ? 'bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] text-white shadow'
                    : 'bg-white border border-gray-200 text-[#55504A]'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>

          <SectionLabel>Child Profiles</SectionLabel>
          <SettingsGroup>
            <SettingsRow icon={<Users className="w-4 h-4" />} label="Manage Profiles" />
            <SettingsRow icon={<Clock className="w-4 h-4" />} label="Daily Listening Limits" value="30 min" />
          </SettingsGroup>

          <SectionLabel>Story Settings</SectionLabel>
          <SettingsGroup>
            <SettingsRow icon={<Mic className="w-4 h-4" />} label="Voice & Narration" />
          </SettingsGroup>

          <SectionLabel>App Settings</SectionLabel>
          <SettingsGroup>
            <SettingsToggleRow
              icon={<Bell className="w-4 h-4" />}
              label="Notifications"
              checked={notificationsOn}
              onChange={() => setNotificationsOn((v) => !v)}
            />
            <SettingsRow icon={<ShieldCheck className="w-4 h-4" />} label="Privacy & Safety" />
            <SettingsRow icon={<HelpCircle className="w-4 h-4" />} label="Help & Support" />
          </SettingsGroup>

          <SectionLabel>Adult Corner</SectionLabel>
          <SettingsGroup>
            <SettingsRow
              icon={<Users className="w-4 h-4" />}
              label="Subscriptions, Tips & About Nuppu"
              onClick={() => navigate('/adult-corner')}
            />
          </SettingsGroup>

          <SectionLabel>For Presentations</SectionLabel>
          <SettingsGroup>
            <SettingsRow
              icon={<Map className="w-4 h-4" />}
              label="View Prototype Sitemap"
              onClick={() => navigate('/sitemap')}
            />
          </SettingsGroup>

          <div className="bg-gradient-to-br from-[#E8C468] to-[#FFD4C4] rounded-2xl p-5 mb-6 text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Nuppu Premium</p>
              <p className="text-xs text-white/90">Unlock unlimited AI stories</p>
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>

          <button className="w-full flex items-center justify-center gap-2 text-red-500 font-semibold text-sm py-3">
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </MobileScreen>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-[#6B6660] uppercase tracking-wide mb-2 mt-2">{children}</p>;
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-5">{children}</div>;
}

function SettingsRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
      <span className="text-[#6E4FD1]">{icon}</span>
      <span className="flex-1 text-sm text-[#35322B]">{label}</span>
      {value && <span className="text-xs text-[#6B6660]">{value}</span>}
      <ChevronRight className="w-4 h-4 text-gray-300" />
    </button>
  );
}

function SettingsToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="w-full flex items-center gap-3 px-4 py-3.5">
      <span className="text-[#6E4FD1]">{icon}</span>
      <span className="flex-1 text-sm text-[#35322B]">{label}</span>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5]' : 'bg-gray-200'}`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
