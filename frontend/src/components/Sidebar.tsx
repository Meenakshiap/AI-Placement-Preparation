import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  BookOpen, 
  Code2, 
  Calculator, 
  Building2, 
  Video, 
  UserCircle, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  isNew?: boolean;
}

export const Sidebar: React.FC = () => {
  const { skillProfile } = useAuth();
  const isAssessed = skillProfile?.assessmentCompleted;

  const navItems: NavItemProps[] = [
    { to: '/', icon: LayoutDashboard, label: 'Readiness Hub' },
    { 
      to: '/assessment', 
      icon: BrainCircuit, 
      label: 'Diagnostic Test', 
      badge: isAssessed ? 'Done' : 'Action Required' 
    },
    { to: '/learn', icon: BookOpen, label: 'Language Tracks', isNew: true },
    { to: '/coding', icon: Code2, label: 'Coding Arena' },
    { to: '/aptitude', icon: Calculator, label: 'Aptitude Training' },
    { to: '/company-prep', icon: Building2, label: 'Company Blueprints' },
    { to: '/interview', icon: Video, label: 'Face-to-Face AI Interview', badge: 'AI Live' },
    { to: '/profile', icon: UserCircle, label: 'Profile & Targets' }
  ];

  return (
    <aside className="w-64 border-r border-line-100 bg-stone-50 hidden md:flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Module Nav Links */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500 mb-2">
            Preparation Modules
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-pill flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-all group ${
                  isActive
                    ? 'active'
                    : 'text-ink-500 hover:text-ink-900 hover:bg-stone-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <item.icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-amber-600' : 'text-ink-400 group-hover:text-ink-700'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.badge === 'Done'
                          ? 'bg-success-100 text-success-500 border border-success-500/20'
                          : item.badge === 'AI Live'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-warn-100 text-warn-500 border border-warn-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* AI Readiness status helper card */}
        <div className="panel-muted p-3.5 rounded-xl text-xs">
          <div className="flex items-center space-x-2 text-amber-700 font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Placement Engine</span>
          </div>
          <p className="text-[11px] text-ink-500 leading-relaxed">
            {isAssessed
              ? 'Adaptive path is calibrated to your target company benchmarks.'
              : 'Complete your 10-min diagnostic test to calibrate your personalized roadmap.'}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-line-100 text-[11px] text-ink-500 flex items-center justify-between">
        <span>Placement OS v1.0</span>
        <span className="flex items-center space-x-1 text-success-500">
          <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-ping"></span>
          <span>Online</span>
        </span>
      </div>
    </aside>
  );
};
