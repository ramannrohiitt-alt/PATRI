import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/auth';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { NetworkMap } from './pages/NetworkMap';
import { Maintenance } from './pages/Maintenance';
import { BlockPlanner } from './pages/BlockPlanner';
import { OptimizationResults } from './pages/OptimizationResults';
import { GanttSchedule } from './pages/GanttSchedule';
import { ConflictCenter } from './pages/ConflictCenter';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Approvals } from './pages/Approvals';
import { AIAssistant } from './pages/AIAssistant';
import { Settings } from './pages/Settings';
import { OptimizationRun } from './types';
import { api } from './services/api';
import { LogoIcon } from './components/Logo';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRun, setCurrentRun] = useState<OptimizationRun | null>(null);
  const [sectionFilter, setSectionFilter] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load baseline optimization run on app start
    const fetchLatestRun = async () => {
      try {
        const res = await api.getOptimizationRuns();
        if (res.data && res.data.length > 0) {
          const detailed = await api.getOptimizationRun(res.data[0].id);
          setCurrentRun(detailed.data);
        }
      } catch (err) {
        console.error('Failed to load latest run:', err);
      }
    };
    if (isAuthenticated) {
      fetchLatestRun();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] railway-grid-bg flex flex-col items-center justify-center text-[#82653D] font-mono text-xs gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-[#FEFCE8] blur-xl opacity-80 animate-pulse" />
          <LogoIcon className="relative w-16 h-16 shadow-warm-lg animate-beacon" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="tracking-widest font-bold text-stone-800 text-sm">PATRI INTELLIGENCE PORTAL</span>
          <span className="text-[11px] text-stone-500 font-sans">Connecting to Divisional RailNet Telemetry...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentTab} />;
      case 'network-map':
        return (
          <NetworkMap
            onNavigateToMaintenance={(secId) => {
              setSectionFilter(secId);
              setCurrentTab('maintenance');
            }}
          />
        );
      case 'maintenance':
        return <Maintenance initialSectionId={sectionFilter} />;
      case 'block-planner':
        return (
          <BlockPlanner
            onPlanGenerated={(run) => {
              setCurrentRun(run);
              setCurrentTab('optimization');
            }}
          />
        );
      case 'optimization':
        return (
          <OptimizationResults
            run={currentRun}
            onNavigate={setCurrentTab}
            onApprove={() => setCurrentTab('approvals')}
            onReject={() => setCurrentTab('approvals')}
          />
        );
      case 'gantt':
        return <GanttSchedule runId={currentRun?.id || 1} />;
      case 'conflicts':
        return <ConflictCenter onNavigateToPlanner={() => setCurrentTab('block-planner')} />;
      case 'simulator':
        return <WhatIfSimulator />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'approvals':
        return <Approvals />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FAF8F5] text-stone-900 railway-grid-bg overflow-hidden select-none relative">
      {/* Subtle Telemetry Scanline */}
      <div className="telemetry-scanline" />

      {/* Persistent Railway Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header
          currentTab={currentTab}
          onOpenPlanner={() => setCurrentTab('block-planner')}
          onOpenAI={() => setCurrentTab('ai-assistant')}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto bg-transparent relative">
          <ErrorBoundary key={currentTab} fallbackTitle="Unable to display this view">
            {renderCurrentPage()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
