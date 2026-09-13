import { Home, BookOpen, Heart, Lock, type LucideIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useLanguage } from '../i18n/LanguageContext';

interface Tab {
  id: string;
  path: string;
  matchPrefix?: string;
  icon: LucideIcon;
  key: string;
}

const TABS: Tab[] = [
  { id: 'home', path: '/home', icon: Home, key: 'nav.home' },
  { id: 'stories', path: '/stories', icon: BookOpen, key: 'nav.stories' },
  { id: 'friends', path: '/friends', icon: Heart, key: 'nav.friends' },
  { id: 'adults', path: '/parent-gate', matchPrefix: '/adults', icon: Lock, key: 'nav.adults' },
];

export function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const isActive = location.pathname.startsWith(tab.matchPrefix ?? tab.path);
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            {t(tab.key)}
          </button>
        );
      })}
    </nav>
  );
}
