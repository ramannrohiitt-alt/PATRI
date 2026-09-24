import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Wrench,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PriorityBadge } from '../components/PriorityBadge';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

export const GanttSchedule: React.FC<{ runId?: number }> = ({ runId = 1 }) => {
  const [ganttData, setGanttData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  // Time shift state for manual testing
  const [newStartTime, setNewStartTime] = useState('2026-09-06T02:00:00');
  const [newEndTime, setNewEndTime] = useState('2026-09-06T04:00:00');

  const fetchGantt = async () => {
    try {
      setLoading(true);
      const res = await api.getGanttSchedule(runId);
      setGanttData(res.data);
    } catch (err) {
      console.error('Failed to load Gantt schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGantt();
  }, [runId]);

  if (loading || !ganttData) {
    return (
      <div className="p-6 max-w-[1700px] mx-auto">
        <LoadingSkeleton rows={12} />
      </div>
    );
  }

  // Convert time string to percentage of 24h
  const getPositionStyle = (startTimeStr: string, endTimeStr: string) => {
    const parseMins = (str: string) => {
      if (!str) return 0;
      const t = str.includes('T') ? str.split('T')[1].slice(0, 5) : str.slice(0, 5);
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const sMins = parseMins(startTimeStr);
    let eMins = parseMins(endTimeStr);
    if (eMins <= sMins) eMins = sMins + 120; // default 2h window

    const leftPct = (sMins / 1440) * 100;
    const widthPct = Math.max(2.5, ((eMins - sMins) / 1440) * 100);

    return {
      left: `${leftPct}%`,
      width: `${widthPct}%`
    };
  };

  const handleValidateMove = async () => {
    if (!selectedItem) return;
    try {
      setValidating(true);
      const taskId = Number(selectedItem.id.replace('task_', ''));
      const res = await api.validateManualMove(runId, {
        task_id: taskId,
        new_start_time: newStartTime,
        new_end_time: newEndTime
      });
      setValidationResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setValidating(false);
    }
  };

  const rows = ganttData.rows || {};
  const hourTicks = Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  return (
    <div className="p-6 space-y-5 max-w-[1700px] mx-auto">
      {/* Control & Toolbar Bar */}
      <GlassCard className="!p-4 md:!p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5E4] border border-[#E7E0D2] flex items-center justify-center text-[#9C7B4F] shadow-warm-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-stone-900 font-mono">
                24-HOUR MULTI-DEPARTMENT TIMELINE &bull; {ganttData.run_code}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Drag or inspect scheduled items. Moving a task triggers instant CP-SAT hard constraint validation.
              </p>
            </div>
          </div>

          {/* Zoom & Action Controls */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-[#FAF6EE] rounded-xl border border-[#E7E0D2] p-1 shadow-warm-xs">
              <button
                onClick={() => setZoomLevel(Math.max(0.75, zoomLevel - 0.25))}
                className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-white disabled:opacity-40 cursor-pointer"
                disabled={zoomLevel <= 0.75}
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-xs text-[#82653D] font-bold">{zoomLevel}x</span>
              <button
                onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.25))}
                className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-white disabled:opacity-40 cursor-pointer"
                disabled={zoomLevel >= 2.5}
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <GlowButton
              variant="secondary"
              size="sm"
              onClick={fetchGantt}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset View
            </GlowButton>
          </div>
        </div>
      </GlassCard>

      {/* Interactive 24-Hour Gantt Matrix */}
      <div className="bg-white/95 border border-[#E7E0D2] rounded-2xl shadow-warm-sm overflow-hidden">
        {/* Department Track Rows Canvas */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${1200 * zoomLevel}px` }} className="p-4 space-y-3">
            {/* Hour Scale Header */}
            <div className="flex items-center border-b border-[#EFE9DC] pb-2 text-[10px] font-mono text-stone-500 font-bold">
              <div className="w-44 shrink-0 pr-3 uppercase tracking-wider text-stone-700">Track Category</div>
              <div className="flex-1 flex justify-between px-1">
                {hourTicks.map((h, i) => (
                  <span key={i} className="w-8 text-center">{h}</span>
                ))}
              </div>
            </div>

            {/* 1. Engineering Row */}
            <div className="flex items-center">
              <div className="w-44 pr-3 shrink-0 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-amber-600 shrink-0" />
                <span className="text-xs font-bold text-stone-800 font-mono">Engineering (ENG)</span>
              </div>
              <div className="flex-1 h-14 bg-[#FAF6EE] rounded-xl border border-[#E7E0D2] relative p-1 shadow-warm-xs">
                {rows.engineering?.map((item: any) => {
                  const style = getPositionStyle(item.start, item.end);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setValidationResult(null);
                      }}
                      style={style}
                      className="absolute top-1.5 bottom-1.5 bg-amber-100 border border-amber-400 hover:border-amber-600 rounded-lg p-1.5 cursor-pointer shadow-warm-xs overflow-hidden text-[10px] transition-all hover:scale-[1.02] hover:z-20 group"
                    >
                      <span className="font-mono font-bold text-amber-900 block truncate">{item.code}</span>
                      <p className="text-[9px] text-amber-800 truncate">{item.section}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. S&T Row */}
            <div className="flex items-center">
              <div className="w-44 pr-3 shrink-0 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-purple-600 shrink-0" />
                <span className="text-xs font-bold text-stone-800 font-mono">Signal &amp; Telecom</span>
              </div>
              <div className="flex-1 h-14 bg-[#FAF6EE] rounded-xl border border-[#E7E0D2] relative p-1 shadow-warm-xs">
                {rows.snt?.map((item: any) => {
                  const style = getPositionStyle(item.start, item.end);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setValidationResult(null);
                      }}
                      style={style}
                      className="absolute top-1.5 bottom-1.5 bg-purple-100 border border-purple-400 hover:border-purple-600 rounded-lg p-1.5 cursor-pointer shadow-warm-xs overflow-hidden text-[10px] transition-all hover:scale-[1.02] hover:z-20 group"
                    >
                      <span className="font-mono font-bold text-purple-900 block truncate">{item.code}</span>
                      <p className="text-[9px] text-purple-800 truncate">{item.section}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Traction Row */}
            <div className="flex items-center">
              <div className="w-44 pr-3 shrink-0 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-stone-800 font-mono">Traction / OHE</span>
              </div>
              <div className="flex-1 h-14 bg-[#FAF6EE] rounded-xl border border-[#E7E0D2] relative p-1 shadow-warm-xs">
                {rows.traction?.map((item: any) => {
                  const style = getPositionStyle(item.start, item.end);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setValidationResult(null);
                      }}
                      style={style}
                      className="absolute top-1.5 bottom-1.5 bg-indigo-100 border border-indigo-400 hover:border-indigo-600 rounded-lg p-1.5 cursor-pointer shadow-warm-xs overflow-hidden text-[10px] transition-all hover:scale-[1.02] hover:z-20 group"
                    >
                      <span className="font-mono font-bold text-indigo-900 block truncate">{item.code}</span>
                      <p className="text-[9px] text-indigo-800 truncate">{item.section}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Passenger Trains Row */}
            <div className="flex items-center">
              <div className="w-44 pr-3 shrink-0 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-stone-800 font-mono">Passenger Express</span>
              </div>
              <div className="flex-1 h-14 bg-[#FAF6EE] rounded-xl border border-[#E7E0D2] relative p-1 shadow-warm-xs">
                {rows.passenger_trains?.map((train: any) => {
                  const style = getPositionStyle(train.start, train.end);
                  return (
                    <div
                      key={train.id}
                      style={style}
                      className="absolute top-2 bottom-2 bg-emerald-100 border border-emerald-400 rounded-lg p-1 overflow-hidden text-[10px] shadow-warm-xs flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                      <span className="font-mono font-bold text-emerald-900 truncate">{train.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Freight Trains Row */}
            <div className="flex items-center">
              <div className="w-44 pr-3 shrink-0 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-stone-500 shrink-0" />
                <span className="text-xs font-bold text-stone-800 font-mono">Goods / Freight</span>
              </div>
              <div className="flex-1 h-12 bg-[#FAF6EE] rounded-xl border border-[#E7E0D2] relative p-1 shadow-warm-xs">
                {rows.freight_trains?.map((train: any) => {
                  const style = getPositionStyle(train.start, train.end);
                  return (
                    <div
                      key={train.id}
                      style={style}
                      className="absolute top-1.5 bottom-1.5 bg-stone-200 border border-stone-300 rounded-lg p-1 overflow-hidden text-[10px] text-stone-800 flex items-center"
                    >
                      <span className="font-mono font-semibold text-stone-700 truncate">{train.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. Coordinated Maintenance Blocks Row */}
            <div className="flex items-center pt-2.5 border-t border-[#EFE9DC]">
              <div className="w-44 pr-3 shrink-0 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-[#9C7B4F] shrink-0 animate-pulse" />
                <span className="text-xs font-bold text-[#82653D] font-mono">COORDINATED BLOCKS</span>
              </div>
              <div className="flex-1 h-16 bg-[#FAF5E4] rounded-xl border border-[#E7E0D2] relative p-1 shadow-warm-xs">
                {rows.blocks?.map((blk: any) => {
                  const style = getPositionStyle(blk.start, blk.end);
                  return (
                    <div
                      key={blk.id}
                      style={style}
                      className="absolute top-2 bottom-2 bg-[#9C7B4F] border border-[#82653D] rounded-xl p-1.5 shadow-warm-sm flex flex-col justify-center overflow-hidden"
                    >
                      <span className="font-mono font-bold text-[#FEFCE8] text-xs truncate">{blk.name}</span>
                      <span className="text-[10px] text-[#FFFDF0] font-mono font-semibold opacity-90">{blk.duration_hours}h Possession</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Task Inspector & Hard Constraint Move Validator */}
      {selectedItem && (
        <GlassCard
          title={
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#9C7B4F]" />
              <div>
                <h3 className="text-sm font-bold text-stone-900 font-mono">
                  {selectedItem.name || selectedItem.code}
                </h3>
                <p className="text-xs text-stone-500">
                  Section: {selectedItem.section} &bull; Window: {selectedItem.start?.split('T')[1]?.slice(0, 5)} - {selectedItem.end?.split('T')[1]?.slice(0, 5)}
                </p>
              </div>
            </div>
          }
          action={
            <button
              onClick={() => setSelectedItem(null)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E7E0D2] space-y-2">
              <span className="text-stone-500 block text-[11px] font-mono font-bold">Priority Classification:</span>
              <PriorityBadge category={selectedItem.priority_category || 'HIGH'} score={selectedItem.priority_score || 85} />
            </div>

            <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E7E0D2] space-y-2 col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 text-[11px] font-mono font-bold">Manual Move &amp; Constraint Validator:</span>
                <span className="text-[10px] text-[#82653D] font-mono font-semibold">Tests collision against timetable</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <input
                  type="text"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="bg-white border border-[#E7E0D2] rounded-xl px-3 py-1.5 text-stone-900 font-mono text-xs flex-1 shadow-warm-xs focus:outline-none focus:border-[#9C7B4F]"
                />
                <span className="text-stone-400">&rarr;</span>
                <input
                  type="text"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="bg-white border border-[#E7E0D2] rounded-xl px-3 py-1.5 text-stone-900 font-mono text-xs flex-1 shadow-warm-xs focus:outline-none focus:border-[#9C7B4F]"
                />
                <GlowButton
                  onClick={handleValidateMove}
                  disabled={validating}
                  variant="primary"
                  size="sm"
                  className="shrink-0"
                >
                  {validating ? 'Validating...' : 'Validate Shift'}
                </GlowButton>
              </div>
            </div>
          </div>

          {/* Validation Result Banner */}
          {validationResult && (
            <div
              className={`mt-4 p-4 rounded-xl border text-xs flex items-start gap-3 ${
                validationResult.is_valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {validationResult.is_valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {validationResult.is_valid
                    ? 'Valid Shift: Zero hard safety violations detected!'
                    : 'Hard Constraint Violation Detected! Schedule Infeasible.'}
                </p>
                {validationResult.violations?.map((v: string, i: number) => (
                  <p key={i} className="text-[11px] mt-1 font-mono text-red-700">
                    &bull; {v}
                  </p>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default GanttSchedule;
