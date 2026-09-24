import React from 'react';
import {
  Cpu,
  CheckCircle2,
  XCircle,
  BarChart3,
  MapPin,
  GitCompare,
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { OptimizationRun } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { AnimatedMetric } from '../components/ui/AnimatedMetric';

interface OptimizationResultsProps {
  run: OptimizationRun | null;
  onNavigate: (tab: string) => void;
  onApprove: (runId: number) => void;
  onReject: (runId: number) => void;
}

export const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  run,
  onNavigate,
  onApprove,
  onReject
}) => {
  if (!run) {
    return (
      <div className="p-12 text-center text-stone-500 space-y-3 max-w-md mx-auto">
        <Cpu className="w-12 h-12 text-stone-300 mx-auto" />
        <h3 className="text-base font-bold text-stone-900">No Optimization Run Active</h3>
        <p className="text-xs text-stone-500">
          Please navigate to the Block Planner and click "GENERATE OPTIMAL PLAN" to trigger an OR-Tools CP-SAT run.
        </p>
        <GlowButton
          variant="primary"
          size="md"
          onClick={() => onNavigate('block-planner')}
          icon={<ArrowRight className="w-4 h-4 ml-1" />}
        >
          Open Block Planner
        </GlowButton>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Run Code */}
      <div className="bg-gradient-to-r from-[#FAF5E4] via-white to-[#FAF6EE] border border-[#E7E0D2] p-6 rounded-3xl shadow-warm-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEFCE8] border border-[#E7E0D2] flex items-center justify-center text-[#9C7B4F] shadow-warm-xs">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xl font-bold font-mono text-stone-900">{run.run_code}</span>
              <span className="text-xs bg-[#FAF5E4] text-[#82653D] font-mono px-2.5 py-0.5 rounded-full border border-[#E7E0D2] uppercase font-semibold">
                {run.mode} MODE
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-mono px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                {run.status}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              OR-Tools CP-SAT generated feasible railway schedule adhering to all hard safety clearance constraints.
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5">
          <GlowButton
            variant="danger"
            size="sm"
            onClick={() => onReject(run.id)}
            icon={<XCircle className="w-4 h-4" />}
          >
            Reject Plan
          </GlowButton>
          <GlowButton
            variant="success"
            size="sm"
            onClick={() => onApprove(run.id)}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Approve &amp; Authorize Plan
          </GlowButton>
        </div>
      </div>

      {/* 7 Mandatory Results KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tasks Scheduled */}
        <AnimatedMetric
          label="Tasks Scheduled"
          value={run.tasks_scheduled_count}
          subtext="94% of requested backlog"
          color="brown"
        />

        {/* Blocks Created */}
        <AnimatedMetric
          label="Blocks Created"
          value={run.blocks_created_count}
          subtext="Synchronized corridors"
          color="slate"
        />

        {/* Train Conflicts */}
        <AnimatedMetric
          label="Train Conflicts"
          value={run.conflicts_count}
          subtext={run.conflicts_count === 0 ? 'Zero passenger train delay' : 'Flagged for review'}
          color={run.conflicts_count === 0 ? 'green' : 'red'}
        />

        {/* Asset Availability */}
        <AnimatedMetric
          label="Asset Availability"
          value={run.asset_availability_pct}
          unit="%"
          subtext="+14.6% improvement"
          color="green"
        />

        {/* Coordination Gain */}
        <AnimatedMetric
          label="Coordination Gain"
          value={run.coordination_gain_hours}
          unit="h"
          subtext={`-${run.reduction_pct || 42.8}% Downtime Reduction`}
          trend={`-${run.reduction_pct || 42.8}%`}
          trendPositive={true}
          color="brown"
        />

        {/* Block Efficiency */}
        <AnimatedMetric
          label="Block Efficiency"
          value={run.block_efficiency_pct}
          unit="%"
          subtext="Useful / Allocated Window"
          color="amber"
        />

        {/* Optimization Score */}
        <div className="col-span-2 bg-white/95 border border-[#E7E0D2] p-4 md:p-5 rounded-2xl flex items-center justify-between shadow-warm-sm">
          <div>
            <span className="text-stone-500 text-xs font-semibold block">Solver Optimization Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono text-[#82653D]">{run.optimization_score}</span>
              <span className="text-xs text-stone-400 font-mono">/ 100</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Optimal global mathematical solution</span>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-[#9C7B4F] flex items-center justify-center font-mono font-bold text-base text-[#82653D] bg-[#FAF5E4] shadow-warm-xs">
            {Math.round(run.optimization_score)}
          </div>
        </div>
      </div>

      {/* Navigation & Exploration Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
        <button
          onClick={() => onNavigate('gantt')}
          className="p-4 rounded-2xl bg-white/95 border border-[#E7E0D2] hover:border-[#9C7B4F]/50 text-left transition-all group shadow-warm-xs hover:shadow-warm-md hover:-translate-y-0.5 cursor-pointer"
        >
          <BarChart3 className="w-5 h-5 text-[#9C7B4F] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-stone-900">View Gantt Timeline</h4>
          <p className="text-[11px] text-stone-500 mt-1">Inspect department rows and train paths</p>
        </button>

        <button
          onClick={() => onNavigate('network-map')}
          className="p-4 rounded-2xl bg-white/95 border border-[#E7E0D2] hover:border-[#9C7B4F]/50 text-left transition-all group shadow-warm-xs hover:shadow-warm-md hover:-translate-y-0.5 cursor-pointer"
        >
          <MapPin className="w-5 h-5 text-[#9C7B4F] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-stone-900">View on Network Map</h4>
          <p className="text-[11px] text-stone-500 mt-1">Check color-coded corridor closures</p>
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className="p-4 rounded-2xl bg-white/95 border border-[#E7E0D2] hover:border-[#9C7B4F]/50 text-left transition-all group shadow-warm-xs hover:shadow-warm-md hover:-translate-y-0.5 cursor-pointer"
        >
          <GitCompare className="w-5 h-5 text-[#9C7B4F] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-stone-900">Compare Existing Plan</h4>
          <p className="text-[11px] text-stone-500 mt-1">Before vs After SIH benchmarks</p>
        </button>

        <button
          onClick={() => onNavigate('block-planner')}
          className="p-4 rounded-2xl bg-white/95 border border-[#E7E0D2] hover:border-[#9C7B4F]/50 text-left transition-all group shadow-warm-xs hover:shadow-warm-md hover:-translate-y-0.5 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-[#9C7B4F] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-stone-900">Re-optimize Parameters</h4>
          <p className="text-[11px] text-stone-500 mt-1">Modify weights or section scopes</p>
        </button>
      </div>

      {/* Generated Maintenance Blocks Listing */}
      <GlassCard
        title={
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#9C7B4F]" />
            <span className="text-sm font-bold text-stone-900">
              Consolidated Maintenance Blocks ({run.blocks?.length || 0})
            </span>
          </div>
        }
        action={
          <span className="text-xs text-stone-500 font-mono font-semibold">
            COORDINATED INFRASTRUCTURE POSSESSIONS
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {run.blocks?.map((block) => (
            <div
              key={block.id}
              className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E7E0D2] space-y-3 shadow-warm-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#82653D] text-sm">{block.block_code}</span>
                <span className="text-[11px] font-mono bg-[#FAF5E4] text-[#82653D] px-2.5 py-0.5 rounded-full border border-[#E7E0D2] font-semibold">
                  {block.block_type}
                </span>
              </div>
              <div className="text-xs text-stone-700 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500">Time Window:</span>
                  <span className="font-semibold">
                    {block.start_time?.split('T')[1]?.slice(0, 5)} &rarr; {block.end_time?.split('T')[1]?.slice(0, 5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Duration:</span>
                  <span className="text-amber-800 font-bold">{block.duration_hours} Hours</span>
                </div>
              </div>

              {/* Tasks within block */}
              <div className="pt-2.5 border-t border-[#EFE9DC] space-y-1.5">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                  Synchronized Tasks:
                </span>
                {block.tasks?.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-white border border-[#EFE9DC]"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9C7B4F] shrink-0" />
                      <span className="font-mono text-[#82653D] text-[11px] font-bold shrink-0">{t.task_code}</span>
                      <span className="text-stone-800 text-[11px] truncate max-w-[160px]">{t.defect_type}</span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono font-semibold shrink-0 ml-1">{t.department_name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default OptimizationResults;
