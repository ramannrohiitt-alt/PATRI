import React, { useEffect, useState } from 'react';
import {
  Wrench,
  AlertOctagon,
  CalendarCheck,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  RefreshCw,
  Cpu,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { DashboardAnalytics } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedMetric } from '../components/ui/AnimatedMetric';
import { GlowButton } from '../components/ui/GlowButton';
import { StatusIndicator } from '../components/ui/StatusIndicator';

const DEPARTMENT_COLORS = ['#9C7B4F', '#4338ca', '#b45309', '#15803d'];
const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#b91c1c',
  HIGH: '#c2410c',
  MEDIUM: '#b45309',
  LOW: '#15803d'
};

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  borderColor: '#E7E0D2',
  color: '#1C1917',
  borderRadius: 12,
  boxShadow: '0 8px 25px -4px rgba(28, 25, 23, 0.1)',
  fontSize: 12,
};

export const Dashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  // Format Department data for PieChart
  const deptChartData = Object.entries(data.by_department || {}).map(([name, value]) => ({
    name,
    value
  }));

  // Format Priority data for BarChart
  const priChartData = Object.entries(data.priority_distribution || {}).map(([category, count]) => ({
    category,
    count
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Banner with Quick Actions */}
      <GlassCard className="!p-4 md:!p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF5E4] border border-[#E7E0D2] flex items-center justify-center text-[#9C7B4F] shadow-warm-xs">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-sm md:text-base font-bold text-stone-900 tracking-tight">
                  Northern Railway Divisional Network Status
                </h2>
                <StatusIndicator status="safe" label="LIVE TELEMETRY" />
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                10 Junction Stations &bull; 15 High-Speed Track Sections &bull; 100 Monitored Railway Assets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <GlowButton
              variant="secondary"
              size="sm"
              onClick={fetchDashboardData}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Live DB
            </GlowButton>
            <GlowButton
              variant="primary"
              size="sm"
              onClick={() => onNavigate('block-planner')}
              icon={<Cpu className="w-3.5 h-3.5" />}
            >
              Run CP-SAT Optimizer
            </GlowButton>
          </div>
        </div>
      </GlassCard>

      {/* 8 Mandatory KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Maintenance Tasks */}
        <AnimatedMetric
          label="Active Maintenance Tasks"
          value={data.active_maintenance_tasks}
          subtext="tasks queued"
          icon={<Wrench className="w-4 h-4" />}
          color="brown"
          onClick={() => onNavigate('maintenance')}
        />

        {/* Critical Tasks */}
        <AnimatedMetric
          label="Critical Tasks (Score 90+)"
          value={data.critical_tasks}
          subtext="urgent speed restrictions"
          icon={<AlertOctagon className="w-4 h-4" />}
          color="red"
          onClick={() => onNavigate('maintenance')}
        />

        {/* Planned Blocks */}
        <AnimatedMetric
          label="Planned Blocks"
          value={data.planned_blocks}
          subtext="coordinated windows"
          icon={<CalendarCheck className="w-4 h-4" />}
          color="slate"
          onClick={() => onNavigate('optimization')}
        />

        {/* Asset Availability */}
        <AnimatedMetric
          label="Asset Availability"
          value={data.asset_availability_pct}
          unit="%"
          subtext="Target: >95%"
          icon={<Activity className="w-4 h-4" />}
          color="green"
          onClick={() => onNavigate('network-map')}
        />

        {/* Total Block Hours */}
        <AnimatedMetric
          label="Total Block Hours"
          value={data.total_block_hours}
          unit="h"
          subtext="-42.8% vs manual"
          trend="-42.8%"
          trendPositive={true}
          icon={<Clock className="w-4 h-4" />}
          color="amber"
          onClick={() => onNavigate('analytics')}
        />

        {/* Train Conflicts */}
        <AnimatedMetric
          label="Train Conflicts"
          value={data.train_conflicts}
          subtext={data.train_conflicts === 0 ? 'Zero disruption' : 'flagged overlaps'}
          icon={<AlertTriangle className="w-4 h-4" />}
          color={data.train_conflicts > 0 ? 'red' : 'green'}
          onClick={() => onNavigate('conflicts')}
        />

        {/* Maintenance Completion % */}
        <AnimatedMetric
          label="Maintenance Completion"
          value={data.maintenance_completion_pct}
          unit="%"
          subtext="of scheduled backlog"
          icon={<CheckCircle className="w-4 h-4" />}
          color="indigo"
          onClick={() => onNavigate('maintenance')}
        />

        {/* Block Efficiency % */}
        <AnimatedMetric
          label="Block Efficiency"
          value={data.block_efficiency_pct}
          unit="%"
          subtext="useful work ratio"
          icon={<Zap className="w-4 h-4" />}
          color="brown"
          onClick={() => onNavigate('analytics')}
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Availability Trend */}
        <GlassCard
          className="lg:col-span-2"
          title="Asset Availability 24-Hour Trend"
          subtitle="Track section infrastructure operational readiness"
          action={
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold shadow-warm-xs">
              Avg: 95.8%
            </span>
          }
        >
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.asset_availability_trend}>
                <defs>
                  <linearGradient id="availGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE9DC" />
                <XAxis dataKey="time" stroke="#78716C" tick={{ fontSize: 11, fill: '#78716C' }} />
                <YAxis domain={[85, 100]} stroke="#78716C" tick={{ fontSize: 11, fill: '#78716C' }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="availability" stroke="#15803d" strokeWidth={2.5} fillOpacity={1} fill="url(#availGrad)" />
                <Area type="monotone" dataKey="target" stroke="#b91c1c" strokeDasharray="4 4" strokeWidth={1.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Maintenance by Department */}
        <GlassCard
          title="Maintenance by Department"
          subtitle="Distribution across active branches"
        >
          <div className="h-64 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={deptChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs">
              {deptChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length] }} />
                  <span className="text-stone-700 font-medium">{entry.name}:</span>
                  <span className="font-mono text-stone-500 font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Secondary Charts & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Block Utilization by Section */}
        <GlassCard
          title="Block Utilization by Section"
          subtitle="Useful maintenance vs idle track possession hours"
        >
          <div className="h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.block_utilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE9DC" />
                <XAxis dataKey="section" stroke="#78716C" tick={{ fontSize: 10, fill: '#78716C' }} />
                <YAxis stroke="#78716C" tick={{ fontSize: 10, fill: '#78716C' }} unit="h" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="useful_hours" fill="#9C7B4F" name="Useful Hours" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="idle_hours" fill="#D5CBB8" name="Idle Hours" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Priority Distribution */}
        <GlassCard
          title="Task Priority Score Distribution"
          subtitle="Calculated via PATRI Priority Engine"
        >
          <div className="h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE9DC" />
                <XAxis dataKey="category" stroke="#78716C" tick={{ fontSize: 10, fill: '#78716C' }} />
                <YAxis stroke="#78716C" tick={{ fontSize: 10, fill: '#78716C' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priChartData.map((entry) => (
                    <Cell key={entry.category} fill={PRIORITY_COLORS[entry.category] || '#9C7B4F'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Critical Alerts & Emergency Feed */}
        <GlassCard
          title={
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-sm font-bold text-stone-900">Critical Railway Alerts</span>
            </div>
          }
          action={
            <span className="text-[10px] font-mono text-red-800 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 font-semibold shadow-warm-xs">
              ACTION REQUIRED
            </span>
          }
        >
          <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1">
            {data.critical_alerts?.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E7E0D2] text-xs space-y-1.5 shadow-warm-xs transition-all hover:border-[#9C7B4F]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-800">{alert.title}</span>
                  <span className="text-[10px] font-mono text-stone-500">{alert.timestamp}</span>
                </div>
                <p className="text-[11px] text-stone-600">Section: {alert.section}</p>
                <div className="flex items-center justify-between pt-1.5 border-t border-[#EFE9DC] text-[10px]">
                  <span className="text-[#82653D] font-mono font-semibold">Action: {alert.action}</span>
                  <button
                    onClick={() => onNavigate('conflicts')}
                    className="text-[#9C7B4F] hover:text-[#82653D] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Resolve</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Latest Optimization Run & Approvals Alert Card */}
      {data.latest_optimization_run && (
        <div className="bg-gradient-to-r from-[#FAF5E4] via-white to-[#FAF6EE] border border-[#E7E0D2] p-5 md:p-6 rounded-2xl shadow-warm-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEFCE8] border border-[#E7E0D2] flex items-center justify-center text-[#9C7B4F] shadow-warm-xs">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-base font-bold text-stone-900 font-mono">
                  {data.latest_optimization_run.run_code}
                </span>
                <span className="text-[10px] bg-[#FAF5E4] text-[#82653D] font-mono px-2.5 py-0.5 rounded-full border border-[#E7E0D2] uppercase font-semibold">
                  {data.latest_optimization_run.mode} MODE
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Consolidated {data.latest_optimization_run.tasks_scheduled} tasks into{' '}
                {data.latest_optimization_run.blocks_created} coordinated blocks &bull;{' '}
                <span className="text-emerald-700 font-bold">
                  {data.latest_optimization_run.coordination_gain}h Coordination Gain
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlowButton
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('gantt')}
            >
              View Gantt Schedule
            </GlowButton>
            <GlowButton
              variant="success"
              size="sm"
              onClick={() => onNavigate('approvals')}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Review & Approve Plan
            </GlowButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
