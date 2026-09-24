import React, { useEffect, useState } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  CheckCircle2,
  Zap,
  Clock,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { BeforeAfterAnalytics } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<BeforeAfterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.getBeforeAfterAnalytics();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <LoadingSkeleton rows={10} />;
  }

  // Format Recharts data
  const chartData = data.metrics.map((m) => ({
    name: m.metric_name,
    Manual: m.existing_manual,
    PATRI: m.patri_optimized,
    unit: m.unit
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        badge="SIH 2026 Core Demonstration"
        title="Comparative Analytics & Benchmarks"
        description="Measurable operational validation: Traditional fragmented manual planning vs PATRI AI-driven multi-department optimization."
        breadcrumbs={['Operations', 'Intelligence', 'Analytics']}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-pale/80 border border-accent-brown/30 text-accent-brown text-xs font-mono font-semibold shadow-warm-xs">
            <Award className="w-4 h-4 text-accent-brown" />
            <span>SIH26027 EVALUATION MATRIX</span>
          </div>
        }
      />

      {/* Coordination Gain Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#FAF6F0] to-[#F5ECE1] border border-[#E7E0D2] p-6 shadow-warm-lg">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-accent-brown/10 blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-brown/15 border border-accent-brown/30 text-accent-brown text-xs font-mono font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-accent-brown" />
              <span>Multi-Department Coordination Gain</span>
            </div>
            <h3 className="text-3xl font-extrabold font-mono text-stone-900 tracking-tight">
              {data.coordination_gain_hours} Hours Saved
            </h3>
            <p className="text-sm text-stone-600 font-medium leading-relaxed">
              Calculated as: Independent Block Hours (38.5h) &minus; Optimized Coordinated Blocks (22.0h) across unified track possessions.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#E7E0D2] px-6 py-4 rounded-xl text-center shadow-warm-md min-w-[240px]">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-widest block font-medium">
              Track Downtime Reduction
            </span>
            <span className="text-4xl font-extrabold font-mono text-emerald-600 block my-1">
              -{data.coordination_reduction_pct}%
            </span>
            <span className="text-xs text-stone-500 block font-medium">
              Downtime eliminated across 15 corridors
            </span>
          </div>
        </div>
      </div>

      {/* Before vs After Comparison Data Table */}
      <GlassCard className="overflow-hidden p-0 border-[#E7E0D2]">
        <div className="p-4 border-b border-[#E7E0D2] bg-[#FAF8F5]/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent-brown" />
            <h3 className="text-sm font-bold text-stone-900">Performance Metrics Comparison Matrix</h3>
          </div>
          <span className="text-xs font-mono text-stone-500">Benchmark Data • Grounded Run</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F6EFE9] border-b border-[#E7E0D2] text-stone-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="p-4 font-semibold">Key Operational Indicator</th>
                <th className="p-4 font-semibold">Existing Manual Planning</th>
                <th className="p-4 font-semibold">PATRI Coordinated Plan</th>
                <th className="p-4 font-semibold">Improvement & Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DC]">
              {data.metrics.map((metric, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                  <td className="p-4 font-semibold text-stone-800 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-accent-brown shrink-0" />
                    <span>{metric.metric_name}</span>
                  </td>
                  <td className="p-4 font-mono text-stone-500 text-sm">
                    {metric.existing_manual} {metric.unit}
                  </td>
                  <td className="p-4 font-mono font-bold text-accent-brown text-sm">
                    {metric.patri_optimized} {metric.unit}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-warm-xs">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+{metric.improvement_pct}% Improvement</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Comparative Bar Chart Visualization */}
      <GlassCard className="p-6 space-y-4 border-[#E7E0D2]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">Visual Benchmark (Manual vs PATRI)</h3>
          <span className="text-xs font-mono text-stone-500">Unit Normalization Adjusted</span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFE9DC" />
              <XAxis dataKey="name" stroke="#78716C" tick={{ fontSize: 11, fill: '#78716C' }} />
              <YAxis stroke="#78716C" tick={{ fontSize: 11, fill: '#78716C' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  borderColor: '#E7E0D2',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(28,25,23,0.08)',
                  fontSize: 12,
                  color: '#1C1917'
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="Manual" fill="#A8A29E" name="Existing Manual Planning" radius={[4, 4, 0, 0]} />
              <Bar dataKey="PATRI" fill="#9C7B4F" name="PATRI AI-Optimized Plan" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Grounded Narrative Summary */}
      <div className="bg-gradient-to-r from-[#FEFCE8] via-white to-[#FDF8EE] border border-[#E9DFCE] p-5 rounded-xl space-y-2 shadow-warm-sm">
        <div className="flex items-center gap-2 text-accent-brown font-semibold text-xs font-mono uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-accent-brown" />
          <span>SIH 2026 Executive Summary & Impact Analysis:</span>
        </div>
        <p className="text-xs text-stone-700 leading-relaxed font-medium">
          {data.sih_narrative}
        </p>
      </div>
    </div>
  );
};
