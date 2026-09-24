import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { SimulationResponse } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { PageHeader } from '../components/ui/PageHeader';

export const WhatIfSimulator: React.FC = () => {
  const [scenarioName, setScenarioName] = useState('Special Vande Bharat Rake Added at 03:00');
  const [addedTrainNumber, setAddedTrainNumber] = useState('22436-SPECIAL');
  const [addedTrainSection, setAddedTrainSection] = useState(3);
  const [addedTrainArrival, setAddedTrainArrival] = useState('03:00');
  const [addedTrainDeparture, setAddedTrainDeparture] = useState('03:15');

  const [unavailableSection, setUnavailableSection] = useState<number | ''>('');
  const [freightMultiplier, setFreightMultiplier] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        scenario_name: scenarioName,
        added_trains: [
          {
            train_number: addedTrainNumber,
            type: 'Express',
            section_id: Number(addedTrainSection),
            arrival: addedTrainArrival,
            departure: addedTrainDeparture
          }
        ],
        unavailable_sections: unavailableSection ? [Number(unavailableSection)] : [],
        freight_surge_multiplier: Number(freightMultiplier),
        optimization_mode: 'balanced'
      };

      const res = await api.simulateScenario(payload);
      setSimResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Simulation failed to solve.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <PageHeader
        title="WHAT-IF OPERATIONAL SCENARIO SIMULATOR"
        subtitle="Perturb operational timetables, section availability, or freight traffic without modifying live production schedules."
        icon={<FlaskConical className="w-5 h-5 text-[#9C7B4F]" />}
        badge={
          <span className="text-xs bg-[#FAF5E4] text-[#82653D] font-mono px-2.5 py-0.5 rounded-full border border-[#E7E0D2] font-semibold">
            SANDBOX MODE
          </span>
        }
      />

      {/* Simulator Scenario Builder Form */}
      <form onSubmit={handleRunSimulation}>
        <GlassCard className="!p-6 space-y-5 text-xs">
          <div className="border-b border-[#EFE9DC] pb-3.5">
            <label className="text-stone-800 font-bold block mb-1.5">Scenario Title</label>
            <input
              type="text"
              required
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl p-3 text-stone-900 font-mono text-xs focus:outline-none focus:border-[#9C7B4F] focus:bg-white shadow-warm-xs transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Perturbation 1: Inject Hypothetical Train */}
            <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#E7E0D2] space-y-3.5 shadow-warm-xs">
              <span className="font-bold text-stone-900 block text-xs uppercase font-mono tracking-wider">
                1. Inject Special / Ad-hoc Train
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Train Number</label>
                  <input
                    type="text"
                    value={addedTrainNumber}
                    onChange={(e) => setAddedTrainNumber(e.target.value)}
                    className="w-full bg-white border border-[#E7E0D2] rounded-xl p-2 font-mono text-xs text-stone-900 focus:outline-none focus:border-[#9C7B4F]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Target Corridor</label>
                  <select
                    value={addedTrainSection}
                    onChange={(e) => setAddedTrainSection(Number(e.target.value))}
                    className="w-full bg-white border border-[#E7E0D2] rounded-xl p-2 font-mono text-xs text-stone-900 focus:outline-none focus:border-[#9C7B4F]"
                  >
                    <option value={1}>SEC-001 (NDLS - TKJ)</option>
                    <option value={2}>SEC-002 (TKJ - NZM)</option>
                    <option value={3}>SEC-003 (NZM - FDB)</option>
                    <option value={4}>SEC-004 (FDB - PWL)</option>
                    <option value={7}>SEC-007 (SBB - GZB)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Arrival Time</label>
                  <input
                    type="text"
                    value={addedTrainArrival}
                    onChange={(e) => setAddedTrainArrival(e.target.value)}
                    className="w-full bg-white border border-[#E7E0D2] rounded-xl p-2 font-mono text-xs text-stone-900 focus:outline-none focus:border-[#9C7B4F]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-1">Departure Time</label>
                  <input
                    type="text"
                    value={addedTrainDeparture}
                    onChange={(e) => setAddedTrainDeparture(e.target.value)}
                    className="w-full bg-white border border-[#E7E0D2] rounded-xl p-2 font-mono text-xs text-stone-900 focus:outline-none focus:border-[#9C7B4F]"
                  />
                </div>
              </div>
            </div>

            {/* Perturbation 2: Infrastructure Restrictions */}
            <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#E7E0D2] space-y-3.5 shadow-warm-xs">
              <span className="font-bold text-stone-900 block text-xs uppercase font-mono tracking-wider">
                2. Infrastructure Outages &amp; Freight Surge
              </span>
              <div>
                <label className="text-[10px] font-semibold text-stone-600 block mb-1">Mark Section Inoperative / Emergency TSR</label>
                <select
                  value={unavailableSection}
                  onChange={(e) => setUnavailableSection(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-[#E7E0D2] rounded-xl p-2 font-mono text-xs text-stone-900 focus:outline-none focus:border-[#9C7B4F]"
                >
                  <option value="">None (All Sections Fully Operable)</option>
                  <option value={3}>SEC-003 (NZM - FDB) - Track Circuit Outage</option>
                  <option value={5}>SEC-005 (NDLS - DSA) - Overhead Line Fault</option>
                  <option value={7}>SEC-007 (SBB - GZB) - Turnout Rail Fracture</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-semibold text-stone-600 mb-1">
                  <span>Goods Freight Surge Multiplier:</span>
                  <span className="font-mono text-[#82653D] font-bold">{freightMultiplier}x</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={2.5}
                  step={0.1}
                  value={freightMultiplier}
                  onChange={(e) => setFreightMultiplier(Number(e.target.value))}
                  className="w-full accent-[#9C7B4F]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3.5 border-t border-[#EFE9DC] flex-wrap gap-3">
            <p className="text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sandbox guarantees zero changes to active production databases</span>
            </p>
            <GlowButton
              type="submit"
              disabled={loading}
              variant="primary"
              size="md"
              icon={<Play className="w-4 h-4 fill-current" />}
            >
              {loading ? 'Simulating with CP-SAT...' : 'Run What-If Simulation'}
            </GlowButton>
          </div>
        </GlassCard>
      </form>

      {/* Simulation Results Side-by-Side Comparison */}
      {simResult && (
        <GlassCard
          className="!p-6 space-y-6"
          title={
            <h3 className="text-base font-bold text-stone-900 font-mono">
              Simulation Impact Analysis &bull; {simResult.scenario_name}
            </h3>
          }
          subtitle="Evaluated against baseline optimal plan RUN-20260906-001"
        >
          {/* Side-by-Side Comparison Metrics Table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Block Hours Delta */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E7E0D2] shadow-warm-xs">
              <span className="text-stone-500 text-xs font-semibold block">Total Block Hours</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs text-stone-400 font-mono">Base: {simResult.baseline_metrics.block_hours}h</span>
                <span className="text-lg font-bold font-mono text-stone-900">{simResult.simulated_metrics.block_hours}h</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono mt-1 text-amber-800 font-semibold">
                <span>Delta: +{simResult.delta.block_hours}h</span>
              </div>
            </div>

            {/* Train Conflicts Delta */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E7E0D2] shadow-warm-xs">
              <span className="text-stone-500 text-xs font-semibold block">Train Conflicts</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs text-stone-400 font-mono">Base: {simResult.baseline_metrics.train_conflicts}</span>
                <span className={`text-lg font-bold font-mono ${simResult.simulated_metrics.train_conflicts > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {simResult.simulated_metrics.train_conflicts}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono mt-1 text-red-700 font-semibold">
                <span>Delta: +{simResult.delta.train_conflicts} new</span>
              </div>
            </div>

            {/* Asset Availability Delta */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E7E0D2] shadow-warm-xs">
              <span className="text-stone-500 text-xs font-semibold block">Asset Availability</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs text-stone-400 font-mono">Base: {simResult.baseline_metrics.asset_availability_pct}%</span>
                <span className="text-lg font-bold font-mono text-emerald-700">{simResult.simulated_metrics.asset_availability_pct}%</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono mt-1 text-stone-500">
                <span>Delta: {simResult.delta.asset_availability_pct}%</span>
              </div>
            </div>

            {/* Optimization Score Delta */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E7E0D2] shadow-warm-xs">
              <span className="text-stone-500 text-xs font-semibold block">Optimization Score</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xs text-stone-400 font-mono">Base: {simResult.baseline_metrics.optimization_score}</span>
                <span className="text-lg font-bold font-mono text-[#82653D]">{simResult.simulated_metrics.optimization_score}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono mt-1 text-[#82653D] font-semibold">
                <span>Delta: {simResult.delta.optimization_score} pts</span>
              </div>
            </div>
          </div>

          {/* AI Comparative Explanation */}
          <div className="bg-[#FAF5E4] p-4 rounded-2xl border border-[#E7E0D2] space-y-2">
            <div className="flex items-center gap-2 text-[#82653D] font-bold text-xs uppercase tracking-wide font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Grounded AI Comparative Narrative:</span>
            </div>
            <p className="text-xs text-stone-800 leading-relaxed font-sans">
              {simResult.ai_comparison_narrative}
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default WhatIfSimulator;
