import React, { useState, useEffect } from 'react';
import { Cpu, Radio, Sparkles, Clock, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../services/auth';
import { GlowButton } from './ui/GlowButton';

interface HeaderProps {
  currentTab: string;
  onOpenPlanner: () => void;
  onOpenAI: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenPlanner,
  onOpenAI,
  onToggleMobileMenu,
}) => {
  const { logout } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Divisional Operations Command Center',
      subtitle: 'Live track asset health, train conflicts & maintenance metrics',
    },
    'network-map': {
      title: 'Sectional Infrastructure & Route Map',
      subtitle: 'Geospatial corridor telemetry across 15 high-density routes',
    },
    maintenance: {
      title: 'Departmental Maintenance Registry',
      subtitle: 'Engineering, S&T and Traction defect logs & priority scores',
    },
    'block-planner': {
      title: 'Integrated Block Planning Engine',
      subtitle: 'Multi-department maintenance consolidation & window selection',
    },
    optimization: {
      title: 'OR-Tools CP-SAT Schedule Optimizer',
      subtitle: 'Mathematical constraint solver output & coordination gain',
    },
    gantt: {
      title: 'Interactive Multi-Department Gantt Timeline',
      subtitle: 'Train movements, coordinated blocks & drag constraint validation',
    },
    conflicts: {
      title: 'Train-Maintenance Conflict Resolution Center',
      subtitle: 'Safety buffer breach detection and automated rescheduling',
    },
    simulator: {
      title: 'What-If Operational Scenario Simulator',
      subtitle: 'Non-destructive sandbox perturbation analysis & capacity modeling',
    },
    analytics: {
      title: 'SIH 2026 Before vs After Comparative Analytics',
      subtitle: 'Dynamic benchmark: Traditional manual scheduling vs PATRI OR-Tools',
    },
    reports: {
      title: 'Divisional Engineering & Operational Reports',
      subtitle: 'Weekly/monthly asset downtime & coordination audits',
    },
    approvals: {
      title: 'Safety & Traffic Control Human Review Interface',
      subtitle: 'Authorized officer plan sign-off with audit logging',
    },
    'ai-assistant': {
      title: 'PATRI Grounded AI Explanation Assistant',
      subtitle: 'Mathematical solver rationale & operational decision support',
    },
    settings: {
      title: 'System Configuration & Solver Weights',
      subtitle: 'Adjust objective weightings and divisional parameters',
    },
  };

  const currentInfo = titles[currentTab] || {
    title: 'PATRI Intelligence',
    subtitle: 'Predictive & Adaptive Track Resource Intelligence',
  };

  return (
    <header className="h-16 bg-white/85 backdrop-blur-xl border-b border-[#E7E0D2] px-4 md:px-6 flex items-center justify-between shrink-0 z-30 shadow-warm-xs">
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#FAF5E4] border border-[#E7E0D2] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-sm md:text-base font-bold text-stone-900 flex items-center gap-2 truncate tracking-tight">
            {currentInfo.title}
          </h1>
          <p className="text-[11px] text-stone-500 truncate hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div className="hidden xl:flex items-center gap-3 bg-[#FAF6EE] px-3.5 py-1.5 rounded-xl border border-[#E7E0D2] text-xs font-mono shadow-warm-xs">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
            <span className="text-[11px] font-semibold">SOLVER: CP-SAT READY</span>
          </div>
          <span className="text-[#D9D0C1]">|</span>
          <div className="flex items-center gap-1.5 text-[#82653D]">
            <Cpu className="w-3.5 h-3.5 text-[#9C7B4F]" />
            <span className="text-[11px] font-semibold">15 SECTIONS ACTIVE</span>
          </div>
          <span className="text-[#D9D0C1]">|</span>
          <div className="flex items-center gap-1.5 text-stone-700">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-[11px] font-bold">{timeStr} IST</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <GlowButton
            variant="pale"
            size="sm"
            onClick={onOpenAI}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#9C7B4F]" />}
            className="hidden sm:inline-flex text-[#82653D]"
          >
            AI Assist
          </GlowButton>

          <GlowButton
            variant="primary"
            size="sm"
            onClick={onOpenPlanner}
            icon={<Cpu className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Generate</span> Plan
          </GlowButton>

          <GlowButton
            variant="ghost"
            size="sm"
            onClick={logout}
            icon={<LogOut className="w-3.5 h-3.5 text-stone-500 hover:text-red-600" />}
            title="Sign out as Control Officer and return to Login"
            aria-label="Logout"
            className="px-2"
          >
            <span className="sr-only">Logout</span>
          </GlowButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
