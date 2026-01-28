/**
 * BottomNav - Institutional bottom navigation bar
 * Primary navigation for the mobile-first experience
 */

import type { ViewType } from '../../types';
import { COLORS } from '../../constants';

interface BottomNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

interface NavItem {
  view: ViewType;
  label: string;
  icon: React.ReactNode;
  isAction?: boolean;
}

const navItems: NavItem[] = [
  {
    view: 'overview',
    label: 'Overview',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    view: 'score',
    label: 'Score',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    view: 'session-init',
    label: 'Session',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
    isAction: true,
  },
  {
    view: 'metrics',
    label: 'Metrics',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 2 5-6" />
      </svg>
    ),
  },
  {
    view: 'trust',
    label: 'Profile',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.view ||
            (item.view === 'session-init' && currentView === 'session-active');

          if (item.isAction) {
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: COLORS.accent,
                    color: COLORS.background,
                    boxShadow: `0 0 20px ${COLORS.accent}50`,
                  }}
                >
                  {item.icon}
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className="flex flex-col items-center justify-center py-2 px-4 transition-colors"
              style={{
                color: isActive ? COLORS.accent : COLORS.textMuted,
              }}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-[10px] font-mono uppercase tracking-wider">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
