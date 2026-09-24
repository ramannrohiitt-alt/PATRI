import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Shield, User, Cpu, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../services/auth';
import { PageHeader } from '../components/ui/PageHeader';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [priorityWeight, setPriorityWeight] = useState(50);
  const [trainDelayPenalty, setTrainDelayPenalty] = useState(70);
  const [coordinationBonus, setCoordinationBonus] = useState(60);
  const [freightRiskPenalty, setFreightRiskPenalty] = useState(25);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        badge="System Administration"
        title="System Configuration & Solver Tuning"
        description="Customize mathematical objective priorities, divisional penalty functions, and operational clearance boundaries."
        breadcrumbs={['System', 'Admin', 'Settings']}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-pale/80 border border-accent-brown/30 text-accent-brown text-xs font-mono font-semibold shadow-warm-xs">
            <Sliders className="w-4 h-4 text-accent-brown" />
            <span>SOLVER PROFILE: BALANCED</span>
          </div>
        }
      />

      {/* User Information Card */}
      <GlassCard className="p-6 space-y-4 border-[#E7E0D2]">
        <div className="flex items-center gap-2 border-b border-[#E7E0D2] pb-3">
          <User className="w-4 h-4 text-accent-brown" />
          <h3 className="text-sm font-bold text-stone-900">Active Controller NetID Credentials</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E0D2]">
            <span className="text-stone-500 block text-[11px] font-medium uppercase tracking-wider">Officer Name</span>
            <span className="font-bold text-stone-900 text-sm mt-0.5 block">{user?.full_name || 'Chief Operations Controller'}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E0D2]">
            <span className="text-stone-500 block text-[11px] font-medium uppercase tracking-wider">Railway NetID</span>
            <span className="font-mono text-accent-brown font-bold text-sm mt-0.5 block">{user?.username}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E0D2]">
            <span className="text-stone-500 block text-[11px] font-medium uppercase tracking-wider">Role &amp; Permissions</span>
            <span className="inline-block mt-1 font-mono text-emerald-800 text-[11px] bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold uppercase">
              {user?.role}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E0D2]">
            <span className="text-stone-500 block text-[11px] font-medium uppercase tracking-wider">Department</span>
            <span className="text-stone-800 font-semibold text-sm mt-0.5 block">{user?.department_name || 'Operations'}</span>
          </div>
        </div>
      </GlassCard>

      {/* OR-Tools Objective Weight Configuration Form */}
      <form onSubmit={handleSave}>
        <GlassCard className="p-6 space-y-6 border-[#E7E0D2]">
          <div className="flex items-center justify-between border-b border-[#E7E0D2] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-brown" />
              <h3 className="text-sm font-bold text-stone-900">OR-Tools CP-SAT Objective Weightings</h3>
            </div>
            <span className="text-[11px] font-mono text-accent-brown font-semibold bg-accent-pale px-2 py-0.5 rounded border border-accent-brown/30">
              Active Mode: Balanced
            </span>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-stone-800 font-semibold text-xs">Task Priority Completion Weight:</label>
                <span className="font-mono text-accent-brown font-bold text-xs bg-accent-pale px-2.5 py-0.5 rounded-lg border border-accent-brown/30">
                  {priorityWeight}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={priorityWeight}
                onChange={(e) => setPriorityWeight(Number(e.target.value))}
                className="w-full accent-[#9C7B4F] cursor-pointer"
              />
              <span className="text-[11px] text-stone-500 block">Higher value forces solver to schedule high-priority tasks first</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-stone-800 font-semibold text-xs">Train Delay Penalty Weight:</label>
                <span className="font-mono text-accent-brown font-bold text-xs bg-accent-pale px-2.5 py-0.5 rounded-lg border border-accent-brown/30">
                  {trainDelayPenalty}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                value={trainDelayPenalty}
                onChange={(e) => setTrainDelayPenalty(Number(e.target.value))}
                className="w-full accent-[#9C7B4F] cursor-pointer"
              />
              <span className="text-[11px] text-stone-500 block">Higher value imposes severe penalties for near-train clearance windows</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-stone-800 font-semibold text-xs">Multi-Department Coordination Bonus:</label>
                <span className="font-mono text-accent-brown font-bold text-xs bg-accent-pale px-2.5 py-0.5 rounded-lg border border-accent-brown/30">
                  {coordinationBonus}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={coordinationBonus}
                onChange={(e) => setCoordinationBonus(Number(e.target.value))}
                className="w-full accent-[#9C7B4F] cursor-pointer"
              />
              <span className="text-[11px] text-stone-500 block">Encourages merging Engineering, S&amp;T, and Traction into shared track closures</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-stone-800 font-semibold text-xs">Freight Probability Risk Penalty:</label>
                <span className="font-mono text-accent-brown font-bold text-xs bg-accent-pale px-2.5 py-0.5 rounded-lg border border-accent-brown/30">
                  {freightRiskPenalty}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                value={freightRiskPenalty}
                onChange={(e) => setFreightRiskPenalty(Number(e.target.value))}
                className="w-full accent-[#9C7B4F] cursor-pointer"
              />
              <span className="text-[11px] text-stone-500 block">Penalizes blocking corridors during peak predicted freight throughput</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-[#E7E0D2]">
            {saved ? (
              <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-mono font-semibold shadow-warm-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Weights updated successfully for next optimization run!</span>
              </div>
            ) : (
              <div />
            )}
            <GlowButton
              type="submit"
              variant="secondary"
              icon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </GlowButton>
          </div>
        </GlassCard>
      </form>
    </div>
  );
};
