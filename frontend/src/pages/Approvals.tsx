import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Clock,
  UserCheck,
  AlertTriangle,
  FileCheck,
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { Approval, OptimizationRun } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

export const Approvals: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [runs, setRuns] = useState<OptimizationRun[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval modal state
  const [selectedRun, setSelectedRun] = useState<OptimizationRun | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const [apprRes, runsRes] = await Promise.all([
        api.getApprovals(),
        api.getOptimizationRuns()
      ]);
      setApprovals(apprRes.data);
      setRuns(runsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRun) return;
    setSubmitting(true);
    try {
      await api.submitApproval({
        optimization_run_id: selectedRun.id,
        status: decision,
        comments,
        plan_version: 'v1.0'
      });
      setSelectedRun(null);
      setComments('');
      fetchApprovals();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={10} />;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <PageHeader
        badge="Human-in-the-Loop Governance"
        title="Official Plan Review & Authorization"
        description="Authorized sign-off workflow validating AI recommended track possession blocks before field dispatch."
        breadcrumbs={['Operations', 'Governance', 'Approvals']}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold shadow-warm-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DISPATCH LOCK ACTIVE</span>
          </div>
        }
      />

      {/* Mandatory Safety Notice */}
      <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-warm-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-950 text-xs">MANDATORY REGULATORY COMPLIANCE</span>
          <p className="font-medium leading-relaxed mt-0.5">
            &laquo; AI-generated schedules are operational recommendations and strictly require authorized railway personnel validation before track possession dispatch. &raquo;
          </p>
        </div>
      </div>

      {/* Pending Runs Awaiting Decision */}
      <GlassCard className="p-6 space-y-4 border-[#E7E0D2]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-accent-brown" />
            <h3 className="text-sm font-bold text-stone-900">Recommended Schedules Awaiting Authorization</h3>
          </div>
          <span className="text-xs font-mono text-stone-500">{runs.length} Pending Review</span>
        </div>

        {runs.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#E7E0D2]">
            <p className="text-xs text-stone-500 font-medium">No optimization runs currently available for review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {runs.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-white/95 border border-[#E7E0D2] flex flex-wrap items-center justify-between gap-4 shadow-warm-xs hover:border-accent-brown/50 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-accent-brown text-sm">{r.run_code}</span>
                    <span className="text-[10px] font-mono bg-accent-pale text-accent-brown px-2 py-0.5 rounded-full border border-accent-brown/30 font-semibold uppercase">
                      {r.mode} Mode
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-medium">
                    {r.tasks_scheduled_count} Tasks &bull; {r.blocks_created_count} Coordinated Blocks &bull;{' '}
                    <span className="text-emerald-700 font-semibold">{r.coordination_gain_hours}h Downtime Saved</span>
                  </p>
                </div>

                <GlowButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedRun(r);
                    setDecision('APPROVED');
                  }}
                  icon={<UserCheck className="w-4 h-4" />}
                >
                  Review & Sign Off
                </GlowButton>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Historical Approvals Trail */}
      <GlassCard className="overflow-hidden p-0 border-[#E7E0D2]">
        <div className="p-4 border-b border-[#E7E0D2] bg-[#FAF8F5]/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Signed Operational Authorization Trail</h3>
          <span className="text-xs font-mono text-stone-500">Immutable Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F6EFE9] border-b border-[#E7E0D2] text-stone-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3.5 font-semibold">Run ID</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Authorized Controller</th>
                <th className="p-3.5 font-semibold">Timestamp</th>
                <th className="p-3.5 font-semibold">Official Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DC] bg-white">
              {approvals.map((appr) => (
                <tr key={appr.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-accent-brown">
                    {appr.run_code || `Run #${appr.optimization_run_id}`}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        appr.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-red-50 text-red-800 border-red-300'
                      }`}
                    >
                      {appr.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-stone-800 font-semibold">{appr.approver_name || 'Senior Traffic Controller'}</td>
                  <td className="p-3.5 font-mono text-stone-500">{new Date(appr.timestamp).toLocaleString()}</td>
                  <td className="p-3.5 text-stone-600 italic font-medium">{appr.comments || 'Approved for line possession execution.'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Review Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E7E0D2] rounded-2xl max-w-lg w-full p-6 shadow-warm-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
              <h3 className="text-base font-bold text-stone-900 font-mono">
                Validate Schedule &bull; {selectedRun.run_code}
              </h3>
              <span className="text-[10px] font-mono text-stone-500 uppercase px-2 py-0.5 bg-white rounded border border-[#E7E0D2]">
                {selectedRun.mode}
              </span>
            </div>
            <p className="text-stone-600 font-medium">
              Confirm that this AI recommendation satisfies all field safety guidelines, corridor clearance protocols, and signal interlockings.
            </p>

            <form onSubmit={handleSubmitDecision} className="space-y-4">
              <div>
                <label className="text-stone-800 font-bold block mb-1.5">Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      decision === 'APPROVED'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-warm-xs ring-2 ring-emerald-500/20'
                        : 'bg-white border-[#E7E0D2] text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Authorize Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      decision === 'REJECTED'
                        ? 'bg-red-50 border-red-500 text-red-800 shadow-warm-xs ring-2 ring-red-500/20'
                        : 'bg-white border-[#E7E0D2] text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Reject Plan
                  </button>
                </div>
              </div>

              <div>
                <label className="text-stone-800 font-bold block mb-1.5">Controller Remarks / Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Schedule verified against high-speed Rajdhani corridor clearances and night work light availability."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-white border border-[#E7E0D2] rounded-xl p-3 text-stone-800 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent-brown/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E0D2]">
                <button
                  type="button"
                  onClick={() => setSelectedRun(null)}
                  className="px-4 py-2 bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-semibold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <GlowButton
                  type="submit"
                  variant={decision === 'APPROVED' ? 'success' : 'danger'}
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Sign & Record in Audit Log'}
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
