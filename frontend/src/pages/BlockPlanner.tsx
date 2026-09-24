import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Cpu,
  CheckCircle2,
  Play,
  Shield,
} from 'lucide-react';
import { api } from '../services/api';
import { Section, OptimizationRun } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { PageHeader } from '../components/ui/PageHeader';

interface BlockPlannerProps {
  onPlanGenerated: (run: OptimizationRun) => void;
}

export const BlockPlanner: React.FC<BlockPlannerProps> = ({ onPlanGenerated }) => {
  const [horizon, setHorizon] = useState('tomorrow');
  const [mode, setMode] = useState<'balanced' | 'max_availability' | 'min_disruption'>('balanced');
  const [selectedDepts, setSelectedDepts] = useState<number[]>([1, 2, 3]);
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [priorityThreshold, setPriorityThreshold] = useState<number>(50);
  const [sections, setSections] = useState<Section[]>([]);

  // Animated optimization progress stepper
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const optimizationSteps = [
    'Checking maintenance tasks in database...',
    'Checking train movements & passenger timetables...',
    'Checking available crews & heavy machinery...',
    'Detecting multi-department compatible tasks (ENG + S&T + TRAC)...',
    'Running Google OR-Tools CP-SAT mathematical solver...',
    'Validating schedule hard safety clearance constraints...',
    'Optimization Complete! Generating blocks & Gantt data...'
  ];

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.getSections();
        setSections(res.data);
        // Default to all sections
        setSelectedSections(res.data.map((s) => s.id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchSections();
  }, []);

  const handleToggleDept = (id: number) => {
    if (selectedDepts.includes(id)) {
      if (selectedDepts.length > 1) {
        setSelectedDepts(selectedDepts.filter((d) => d !== id));
      }
    } else {
      setSelectedDepts([...selectedDepts, id]);
    }
  };

  const handleGeneratePlan = async () => {
    setIsOptimizing(true);
    setCurrentStep(0);

    // Progressive visual stepper
    for (let i = 0; i < optimizationSteps.length - 1; i++) {
      setCurrentStep(i);
      await new Promise((resolve) => setTimeout(resolve, 650));
    }

    try {
      const res = await api.runOptimization({
        horizon,
        mode,
        department_ids: selectedDepts,
        section_ids: selectedSections,
        priority_threshold: priorityThreshold
      });

      setCurrentStep(optimizationSteps.length - 1);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsOptimizing(false);
      onPlanGenerated(res.data);
    } catch (err) {
      console.error('Optimization failed:', err);
      setIsOptimizing(false);
      alert('Optimization encountered an issue. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <PageHeader
        title="INTEGRATED BLOCK PLANNER"
        subtitle="Configure horizons, departmental filters, and mathematical objective modes before dispatching OR-Tools CP-SAT."
        icon={<CalendarClock className="w-5 h-5 text-[#9C7B4F]" />}
      />

      {isOptimizing ? (
        /* Optimization Loading Stepper */
        <GlassCard className="!p-8 md:!p-10 space-y-6 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FAF5E4] border border-[#E7E0D2] text-[#9C7B4F] mb-2 shadow-warm-sm">
              <Cpu className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              OR-Tools CP-SAT Optimization In Progress
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Solving multi-commodity railway track assignment with hard train separation constraints
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-3 pt-4 text-left">
            {optimizationSteps.map((stepText, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-warm-xs'
                      : isCurrent
                      ? 'bg-[#FEFCE8] border-[#9C7B4F] text-stone-900 shadow-warm-md animate-pulse font-semibold'
                      : 'bg-[#FAF6EE] border-[#E7E0D2] text-stone-400 opacity-60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9C7B4F] animate-ping shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-stone-300 shrink-0" />
                  )}
                  <span className="font-medium">{stepText}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      ) : (
        /* Configuration Form */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Horizon & Mode */}
          <div className="space-y-6">
            {/* 1. Planning Horizon */}
            <GlassCard
              title="1. Planning Horizon"
              subtitle="Target Time Window"
            >
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'today', label: 'Today (Intra-Day)', desc: 'Immediate emergency windows' },
                  { id: 'tomorrow', label: 'Tomorrow (24h)', desc: 'Standard divisional planning' },
                  { id: '7days', label: 'Next 7 Days', desc: 'Weekly corridor maintenance' },
                  { id: '30days', label: 'Next 30 Days', desc: 'Monthly deep-screening blocks' }
                ].map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHorizon(h.id)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      horizon === h.id
                        ? 'bg-[#FAF5E4] border-[#9C7B4F] text-stone-900 shadow-warm-xs font-semibold'
                        : 'bg-[#FAF6EE] border-[#E7E0D2] text-stone-700 hover:bg-white'
                    }`}
                  >
                    <span className="font-bold block text-stone-900">{h.label}</span>
                    <span className="text-[10px] text-stone-500 mt-1 block">{h.desc}</span>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* 2. Optimization Mode */}
            <GlassCard
              title="2. Optimization Objective Mode"
              subtitle="Algorithmic goal configuration"
              action={
                <span className="text-[10px] text-[#82653D] font-mono font-bold bg-[#FAF5E4] px-2 py-0.5 rounded-full border border-[#E7E0D2]">
                  Default: Balanced
                </span>
              }
            >
              <div className="space-y-2.5">
                {[
                  {
                    id: 'balanced',
                    label: 'Balanced Optimization (Recommended)',
                    desc: 'Optimal trade-off: high task completion + multi-department gain + minimal train buffer violation.'
                  },
                  {
                    id: 'max_availability',
                    label: 'Maximum Asset Availability',
                    desc: 'Heavily penalizes track downtime hours. Prioritizes quick turnaround and night-only windows.'
                  },
                  {
                    id: 'min_disruption',
                    label: 'Minimum Train Disruption',
                    desc: 'Zero tolerance for passenger delays. Guarantees maximum buffer for Rajdhani, Shatabdi & Vande Bharat rakes.'
                  }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as any)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      mode === m.id
                        ? 'bg-[#FAF5E4] border-[#9C7B4F] text-stone-900 shadow-warm-xs'
                        : 'bg-[#FAF6EE] border-[#E7E0D2] text-stone-700 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{m.label}</span>
                      {mode === m.id && <CheckCircle2 className="w-4 h-4 text-[#9C7B4F]" />}
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1">{m.desc}</p>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Filters & Parameters */}
          <div className="space-y-6">
            {/* 3. Department Coordination Inclusion */}
            <GlassCard
              title="3. Multi-Department Scope"
              subtitle="Consolidation across engineering branches"
            >
              <p className="text-[11px] text-stone-500 mb-3">
                PATRI automatically coordinates tasks across selected departments to merge independent track blocks:
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 1, name: 'Engineering', code: 'ENG' },
                  { id: 2, name: 'Signal & Telecom', code: 'S&T' },
                  { id: 3, name: 'Traction / OHE', code: 'TRAC' }
                ].map((d) => {
                  const active = selectedDepts.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleToggleDept(d.id)}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#FEFCE8] border-[#9C7B4F] text-[#82653D] shadow-warm-xs'
                          : 'bg-[#FAF6EE] border-[#E7E0D2] text-stone-400'
                      }`}
                    >
                      <span className="font-mono font-bold block text-sm">{d.code}</span>
                      <span className="text-[10px] font-semibold block mt-0.5">{d.name}</span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            {/* 4. Priority Cutoff Threshold */}
            <GlassCard
              title="4. Minimum Priority Score Threshold"
              subtitle="Filter lower criticality backlog"
              action={
                <span className="font-mono text-[#82653D] font-bold text-xs bg-[#FAF5E4] px-2 py-0.5 rounded-full border border-[#E7E0D2]">
                  {priorityThreshold}+
                </span>
              }
            >
              <div className="space-y-3">
                <input
                  type="range"
                  min={30}
                  max={90}
                  step={5}
                  value={priorityThreshold}
                  onChange={(e) => setPriorityThreshold(Number(e.target.value))}
                  className="w-full accent-[#9C7B4F]"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono font-semibold">
                  <span>30 (All Medium)</span>
                  <span>50 (High &amp; Critical)</span>
                  <span>90 (Emergency Only)</span>
                </div>
              </div>
            </GlassCard>

            {/* Primary Action Button */}
            <div className="pt-2">
              <GlowButton
                onClick={handleGeneratePlan}
                variant="primary"
                size="lg"
                className="w-full py-4 text-sm font-bold tracking-wider shadow-warm-md"
                icon={<Play className="w-5 h-5 fill-current" />}
              >
                GENERATE OPTIMAL PLAN
              </GlowButton>
              <p className="text-[11px] text-stone-500 text-center mt-2.5 flex items-center justify-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hard train safety constraints strictly validated during CP-SAT pass</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockPlanner;
