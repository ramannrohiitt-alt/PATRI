import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Wrench,
  CalendarClock,
  Cpu,
  BarChart3,
  AlertTriangle,
  FlaskConical,
  LineChart,
  FileText,
  Settings,
  CheckCircle2,
  Bot,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../services/auth';
import { Logo } from './Logo';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, logout, switchRolePreset } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'network-map', label: 'Network Map', icon: MapPin },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'block-planner', label: 'Block Planner', icon: CalendarClock },
    { id: 'optimization', label: 'Optimization', icon: Cpu },
    { id: 'gantt', label: 'Gantt Schedule', icon: BarChart3 },
    { id: 'conflicts', label: 'Conflict Center', icon: AlertTriangle },
    { id: 'simulator', label: 'What-If Simulator', icon: FlaskConical },
    { id: 'analytics', label: 'Before/After SIH', icon: LineChart },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-label="Close sidebar"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#FAF8F5]/95 backdrop-blur-xl border-r border-[#E7E0D2] flex flex-col h-screen select-none shrink-0 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[#EFE9DC] flex items-center justify-between">
          <Logo variant="compact" size="sm" showHindi={true} showSubtitle={true} />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-[#F5EFE4] transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[#FEFCE8] text-stone-900 border border-[#9C7B4F]/40 shadow-warm-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#F5EFE4]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#9C7B4F]" />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#9C7B4F]' : 'text-stone-400 group-hover:text-stone-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'conflicts' && (
                  <span className="ml-auto relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Demo Switcher */}
        <div className="p-3.5 border-t border-[#EFE9DC] bg-[#FAF6EE]/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#FAF5E4] border border-[#E7E0D2] flex items-center justify-center text-xs font-bold text-[#82653D] shrink-0 shadow-warm-xs">
                {user?.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-semibold text-stone-900 truncate">
                  {user?.full_name || 'Officer'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-[#82653D] uppercase bg-[#FAF5E4] px-1 rounded border border-[#E7E0D2]">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout and return to Login screen"
              aria-label="Logout"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-red-50 border border-[#E7E0D2] hover:border-red-200 text-stone-600 hover:text-red-700 transition-colors text-xs font-mono shrink-0 shadow-warm-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-[10px]">Exit</span>
            </button>
          </div>

          {/* Quick Role Switcher for SIH Presentation */}
          <div className="pt-2 border-t border-[#EFE9DC]">
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block mb-1">
              SIH Quick Role Switch:
            </label>
            <select
              value={user?.username || 'control_officer'}
              onChange={(e) => switchRolePreset(e.target.value)}
              className="w-full bg-white border border-[#E7E0D2] text-stone-800 text-xs rounded-lg p-1.5 font-mono focus:outline-none focus:border-[#9C7B4F] shadow-warm-xs"
            >
              <option value="control_officer">Control Officer (Operations)</option>
              <option value="eng_officer">Engineering Officer (Track)</option>
              <option value="snt_officer">S&T Officer (Signals)</option>
              <option value="trac_officer">Traction Officer (OHE)</option>
              <option value="admin">Chief Operations Manager (Admin)</option>
            </select>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
