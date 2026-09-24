import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Lock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Sparkles,
  X,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { MaintenanceTask, Section } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';

export const Maintenance: React.FC<{ initialSectionId?: number | null }> = ({ initialSectionId }) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [priorityCategory, setPriorityCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('ALL');
  const [sectionId, setSectionId] = useState<string>(initialSectionId ? String(initialSectionId) : '');
  const [sortBy, setSortBy] = useState<string>('priority_score');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Create Task Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formDeptId, setFormDeptId] = useState<number>(1);
  const [formSectionId, setFormSectionId] = useState<number>(1);
  const [formDefectType, setFormDefectType] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCriticality, setFormCriticality] = useState<number>(80);
  const [formUrgency, setFormUrgency] = useState<number>(75);
  const [formOverdueDays, setFormOverdueDays] = useState<number>(2);
  const [formImpact, setFormImpact] = useState<number>(70);
  const [formDuration, setFormDuration] = useState<number>(2.5);
  const [formCrew, setFormCrew] = useState<number>(4);
  const [formEquipment, setFormEquipment] = useState('Track Tamping Machine, Rail Saw');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit: 15,
        sort_by: sortBy,
        order
      };
      if (search) params.search = search;
      if (departmentId) params.department_id = Number(departmentId);
      if (priorityCategory) params.priority_category = priorityCategory;
      if (status !== 'ALL') params.status = status;
      if (sectionId) params.section_id = Number(sectionId);

      const res = await api.getMaintenanceTasks(params);
      const taskList = res.data?.items ?? res.data?.tasks ?? [];
      setTasks(Array.isArray(taskList) ? taskList : []);
      setTotal(res.data?.total ?? 0);
      setPages(res.data?.pages ?? 1);
    } catch (err: any) {
      console.error('Failed to load maintenance registry:', err);
      setError(err?.response?.data?.detail || err?.message || 'Unable to load maintenance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.getSections();
        setSections(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load sections:', err);
      }
    };
    fetchSections();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [page, departmentId, priorityCategory, status, sectionId, sortBy, order]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTasks();
  };

  const previewScore = Math.round(
    0.35 * formCriticality + 0.25 * formUrgency + 0.2 * Math.min(formOverdueDays * 10, 100) + 0.2 * formImpact
  );

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMaintenanceTask({
        task_code: `TSK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        department_id: formDeptId,
        section_id: formSectionId,
        asset_name: 'P-Way Track KM 142/6-8',
        defect_type: formDefectType,
        description: formDescription,
        criticality: Number(formCriticality),
        urgency: Number(formUrgency),
        overdue_days: Number(formOverdueDays),
        section_impact: Number(formImpact),
        estimated_duration_hours: Number(formDuration),
        required_crew: Number(formCrew),
        required_equipment: formEquipment,
        earliest_start: '2026-09-06T00:00:00',
        latest_completion: '2026-09-06T23:59:00',
        due_date: '2026-09-07'
      });
      setShowCreateModal(false);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (task: MaintenanceTask, newStatus: string) => {
    try {
      await api.updateMaintenanceTask(task.id, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this maintenance task from registry?')) {
      try {
        await api.deleteMaintenanceTask(id);
        fetchTasks();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete task');
      }
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Top Filter & Action Bar */}
      <GlassCard className="!p-4 md:!p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search defect type, description, or task code (e.g. TSK-2026-0012)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#FAF6EE] border border-[#E7E0D2] text-xs text-stone-900 rounded-xl pl-9 pr-3 py-2 placeholder-stone-400 focus:outline-none focus:border-[#9C7B4F] focus:bg-white font-mono shadow-warm-xs transition-all"
              />
            </div>
            <GlowButton type="submit" variant="secondary" size="sm">
              Search
            </GlowButton>
          </form>

          <div className="flex items-center gap-2">
            <GlowButton
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Log Maintenance Task
            </GlowButton>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#EFE9DC] text-xs">
          <div className="flex items-center gap-1.5 text-stone-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] uppercase font-mono font-bold">Filters:</span>
          </div>

          {/* Department */}
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-[#E7E0D2] text-stone-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#9C7B4F] shadow-warm-xs"
          >
            <option value="">All Departments</option>
            <option value="1">Engineering (ENG)</option>
            <option value="2">Signal & Telecom (S&T)</option>
            <option value="3">Traction / OHE (TRAC)</option>
          </select>

          {/* Section */}
          <select
            value={sectionId}
            onChange={(e) => {
              setSectionId(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-[#E7E0D2] text-stone-800 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#9C7B4F] shadow-warm-xs"
          >
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} ({s.from_station_name} - {s.to_station_name})
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priorityCategory}
            onChange={(e) => {
              setPriorityCategory(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-[#E7E0D2] text-stone-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#9C7B4F] shadow-warm-xs"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">CRITICAL (90+)</option>
            <option value="HIGH">HIGH (75-89)</option>
            <option value="MEDIUM">MEDIUM (50-74)</option>
            <option value="LOW">LOW (0-49)</option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-[#E7E0D2] text-stone-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#9C7B4F] shadow-warm-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Sort Column */}
          <div className="ml-auto flex items-center gap-1.5 text-stone-500">
            <span className="text-[11px] font-mono font-bold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E7E0D2] text-stone-800 rounded-lg px-2 py-1 text-xs shadow-warm-xs"
            >
              <option value="priority_score">Priority Score</option>
              <option value="criticality">Criticality</option>
              <option value="estimated_duration_hours">Duration</option>
              <option value="overdue_days">Overdue Days</option>
            </select>
            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded-lg bg-white hover:bg-[#FAF6EE] border border-[#E7E0D2] text-stone-700 shadow-warm-xs cursor-pointer"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Main Data Table */}
      <div className="bg-white/95 border border-[#E7E0D2] rounded-2xl overflow-hidden shadow-warm-sm">
        {loading ? (
          <LoadingSkeleton rows={10} />
        ) : error ? (
          <div className="p-12 text-center text-stone-600 space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-sm font-semibold text-stone-800">Unable to load maintenance data.</p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">{error}</p>
            <div className="pt-2">
              <GlowButton
                onClick={() => fetchTasks()}
                variant="secondary"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Retry
              </GlowButton>
            </div>
          </div>
        ) : (tasks || []).length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Wrench className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">No maintenance tasks matched your criteria.</p>
            <p className="text-xs text-stone-500 mt-1">Try resetting search filters or log a new defect task.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF6EE] border-b border-[#E7E0D2] text-stone-700 font-mono text-[11px] uppercase tracking-wider">
                  <th className="p-3.5">Task ID</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Section / Asset</th>
                  <th className="p-3.5">Defect Type</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Crew & Equipment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DC]">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-[#FAF6EE]/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#82653D] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {task.is_locked && (
                          <span title="Locked task">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                          </span>
                        )}
                        <span>{task.task_code}</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-semibold text-stone-900">{task.department_name}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono text-stone-900 font-bold">{task.section_code}</span>
                      <span className="text-[10px] text-stone-500 block truncate max-w-[140px]">{task.asset_name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-stone-900 block">{task.defect_type}</span>
                      <span className="text-[11px] text-stone-500 truncate block max-w-xs">{task.description}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <PriorityBadge category={task.priority_category} score={task.priority_score} />
                      {task.overdue_days > 0 && (
                        <span className="text-[10px] text-red-700 font-mono block mt-0.5 font-semibold">
                          +{task.overdue_days}d overdue
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono text-stone-800 font-semibold">
                      {task.estimated_duration_hours}h
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-stone-700">
                      <div className="text-[11px]">
                        <span className="font-bold text-stone-900">{task.required_crew} Crew</span>
                      </div>
                      <span className="text-[10px] text-stone-500 truncate block max-w-[140px]">
                        {task.required_equipment || 'Standard Gang Tools'}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                      {task.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(task, 'Scheduled')}
                          className="px-2.5 py-1 bg-[#FAF5E4] hover:bg-[#F5EFE4] border border-[#E7E0D2] text-[#82653D] rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-warm-xs"
                          title="Mark Ready for Solver"
                        >
                          Queue
                        </button>
                      )}
                      {task.status === 'Scheduled' && (
                        <button
                          onClick={() => handleUpdateStatus(task, 'In Progress')}
                          className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-warm-xs"
                          title="Start Work"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button
                          onClick={() => handleUpdateStatus(task, 'Completed')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-warm-xs"
                          title="Complete Task"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!error && (tasks || []).length > 0 && (
          <div className="p-3.5 border-t border-[#E7E0D2] bg-[#FAF6EE] flex items-center justify-between text-xs text-stone-600">
            <div>
              Showing <span className="text-stone-900 font-mono font-bold">{(tasks || []).length}</span> of{' '}
              <span className="text-stone-900 font-mono font-bold">{total}</span> total maintenance tasks
            </div>
            <div className="flex items-center gap-2 font-mono">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg bg-white hover:bg-[#FAF5E4] border border-[#E7E0D2] disabled:opacity-40 cursor-pointer shadow-warm-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold">
                Page {page} / {pages || 1}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-white hover:bg-[#FAF5E4] border border-[#E7E0D2] disabled:opacity-40 cursor-pointer shadow-warm-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E7E0D2] rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-warm-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EFE9DC] pb-3">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-[#9C7B4F]" />
                <h3 className="text-base font-bold text-stone-900">
                  Log Railway Maintenance Task
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Department</label>
                  <select
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(Number(e.target.value))}
                    className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#9C7B4F]"
                  >
                    <option value={1}>Engineering (Permanent Way)</option>
                    <option value={2}>Signal & Telecom (S&T)</option>
                    <option value={3}>Traction / OHE</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Target Section</label>
                  <select
                    value={formSectionId}
                    onChange={(e) => setFormSectionId(Number(e.target.value))}
                    className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl p-2.5 text-stone-900 font-mono focus:outline-none focus:border-[#9C7B4F]"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} ({s.from_station_name} - {s.to_station_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">Defect Classification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Butt Weld Acoustic Defect, Point Machine Backdrive"
                  value={formDefectType}
                  onChange={(e) => setFormDefectType(e.target.value)}
                  className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#9C7B4F]"
                />
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">Technical Description</label>
                <textarea
                  rows={2}
                  placeholder="Field defect observations, ultrasound test details, rail temperature status..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#9C7B4F]"
                />
              </div>

              {/* Priority Engine Factors Slider & Live Output */}
              <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#E7E0D2] space-y-3">
                <div className="flex items-center justify-between border-b border-[#EFE9DC] pb-2">
                  <div className="flex items-center gap-1.5 text-[#82653D] font-bold text-[11px] uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Priority Engine: P = 0.35C + 0.25U + 0.20O + 0.20I</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 text-[11px]">Computed Score:</span>
                    <span className="font-mono text-base font-bold text-[#82653D] bg-[#FAF5E4] px-2 py-0.5 rounded-lg border border-[#E7E0D2]">
                      {previewScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                      <span>Criticality (C):</span>
                      <span className="font-mono font-bold text-stone-900">{formCriticality}</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={formCriticality}
                      onChange={(e) => setFormCriticality(Number(e.target.value))}
                      className="w-full accent-[#9C7B4F]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                      <span>Urgency (U):</span>
                      <span className="font-mono font-bold text-stone-900">{formUrgency}</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={formUrgency}
                      onChange={(e) => setFormUrgency(Number(e.target.value))}
                      className="w-full accent-[#9C7B4F]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                      <span>Overdue Days (O):</span>
                      <span className="font-mono font-bold text-stone-900">{formOverdueDays} days</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={formOverdueDays}
                      onChange={(e) => setFormOverdueDays(Number(e.target.value))}
                      className="w-full accent-[#9C7B4F]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                      <span>Section Impact (I):</span>
                      <span className="font-mono font-bold text-stone-900">{formImpact}</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={formImpact}
                      onChange={(e) => setFormImpact(Number(e.target.value))}
                      className="w-full accent-[#9C7B4F]"
                    />
                  </div>
                </div>
              </div>

              {/* Resource Requirements */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="8"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl p-2.5 text-stone-900 font-mono focus:outline-none focus:border-[#9C7B4F]"
                  />
                </div>
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Required Crew</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={formCrew}
                    onChange={(e) => setFormCrew(Number(e.target.value))}
                    className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl p-2.5 text-stone-900 font-mono focus:outline-none focus:border-[#9C7B4F]"
                  />
                </div>
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Required Machinery</label>
                  <input
                    type="text"
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value)}
                    className="w-full bg-[#FAF6EE] border border-[#E7E0D2] rounded-xl p-2.5 text-stone-900 focus:outline-none focus:border-[#9C7B4F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFE9DC]">
                <GlowButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </GlowButton>
                <GlowButton
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  Save Task to Registry
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
