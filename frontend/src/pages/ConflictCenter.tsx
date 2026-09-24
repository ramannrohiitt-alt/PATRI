import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  Train,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { Conflict } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

export const ConflictCenter: React.FC<{ onNavigateToPlanner: () => void }> = ({ onNavigateToPlanner }) => {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const fetchConflicts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      const res = await api.getConflicts(params);
      setConflicts(res.data);
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, [severityFilter]);

  const handleResolve = async (conflictId: number, action: string) => {
    try {
      await api.resolveConflict(conflictId, {
        action,
        resolution_notes: `Resolved via controller command (${action})`
      });
      fetchConflicts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <GlassCard className="!p-5 md:!p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-warm-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-stone-900 font-mono tracking-tight">
                  TRAIN &amp; RESOURCE CONFLICT RESOLUTION CENTER
                </h2>
                <span className="text-xs bg-red-50 text-red-800 font-mono px-2.5 py-0.5 rounded-full border border-red-200 font-bold">
                  {conflicts.filter((c) => !c.is_resolved).length} ACTIVE CONFLICTS
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Detects spatial collisions between scheduled passenger express trains and requested maintenance possessions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-3 py-1.5 rounded-xl border border-[#E7E0D2] text-xs shadow-warm-xs">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-transparent text-stone-800 focus:outline-none font-mono text-xs cursor-pointer"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
              </select>
            </div>

            <GlowButton
              onClick={onNavigateToPlanner}
              variant="primary"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Re-optimize Schedule
            </GlowButton>
          </div>
        </div>
      </GlassCard>

      {/* Conflict Cards Feed */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : conflicts.length === 0 ? (
        <GlassCard className="!p-12 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-stone-900">Zero Active Train-Block Conflicts!</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            All proposed maintenance blocks safely observe required 25-minute train safety clearance buffers across all 15 corridors.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conf) => (
            <div
              key={conf.id}
              className={`p-5 rounded-2xl border transition-all ${
                conf.is_resolved
                  ? 'bg-[#FAF6EE]/60 border-[#E7E0D2] opacity-75'
                  : 'bg-white/95 border-red-200 shadow-warm-md hover:border-red-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFE9DC] pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-bold text-red-700 text-sm">{conf.conflict_code}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      conf.severity === 'CRITICAL'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {conf.severity}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    Type: {conf.conflict_type.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  {conf.is_resolved ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved: {conf.resolution_notes || 'Resolved'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 font-semibold text-xs animate-pulse">
                      <span>Conflict Active</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Conflict Context Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                {/* Train Information */}
                <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E7E0D2] space-y-2 shadow-warm-xs">
                  <div className="flex items-center gap-2 text-stone-700 font-semibold">
                    <Train className="w-4 h-4 text-blue-600" />
                    <span>Impending Scheduled Train</span>
                  </div>
                  <div className="font-mono text-stone-900 space-y-1">
                    <p className="font-bold text-sm">
                      {conf.train_number ? `Train #${conf.train_number}` : 'Scheduled Train'}
                    </p>
                    <p className="text-[11px] text-stone-600">
                      Scheduled Slot: {conf.train_time ? conf.train_time.split('T')[1]?.slice(0, 5) || conf.train_time : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Maintenance Possession Information */}
                <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E7E0D2] space-y-2 shadow-warm-xs">
                  <div className="flex items-center gap-2 text-stone-700 font-semibold">
                    <Wrench className="w-4 h-4 text-[#9C7B4F]" />
                    <span>Requested Track Possession</span>
                  </div>
                  <div className="font-mono text-stone-900 space-y-1">
                    <p className="font-bold text-sm">{conf.task_code || `Block #${conf.block_id || ''}`}</p>
                    <p className="text-[11px] text-stone-600">
                      Block Window: {conf.scheduled_block_start ? conf.scheduled_block_start.split('T')[1]?.slice(0, 5) : '00:00'} &rarr; {conf.scheduled_block_end ? conf.scheduled_block_end.split('T')[1]?.slice(0, 5) : '00:00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description & Breach Metrics */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E0D2] mb-4 text-xs text-stone-700 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#9C7B4F] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-stone-900">{conf.explanation}</p>
                  <p className="text-stone-500 font-mono text-[11px]">
                    Buffer Deficit: Safety distance breached on Section {conf.section_code || 'NDLS-GZB-UP'}.
                  </p>
                </div>
              </div>

              {/* Resolution Action Toolbar */}
              {!conf.is_resolved && (
                <div className="flex items-center justify-between pt-3 border-t border-[#EFE9DC] flex-wrap gap-2">
                  <span className="text-[11px] text-stone-500 font-mono font-semibold">
                    Recommended Solver Action:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolve(conf.id, 'RESCHEDULE_TASK')}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF5E4] hover:bg-[#F5EFE4] border border-[#E7E0D2] text-[#82653D] text-xs font-semibold shadow-warm-xs transition-colors cursor-pointer"
                    >
                      Reschedule Task
                    </button>
                    <button
                      onClick={() => handleResolve(conf.id, 'DETOUR_TRAIN')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF6EE] border border-[#E7E0D2] text-stone-800 text-xs font-semibold shadow-warm-xs transition-colors cursor-pointer"
                    >
                      Detour Loop Line
                    </button>
                    <button
                      onClick={() => handleResolve(conf.id, 'ACCEPT_SPEED_RESTRICTION')}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold shadow-warm-xs transition-colors cursor-pointer"
                    >
                      Accept PSR (30 km/h)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConflictCenter;
