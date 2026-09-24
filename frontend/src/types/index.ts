export type UserRole = 'ADMIN' | 'CONTROL_OFFICER' | 'ENGINEERING' | 'SNT' | 'TRACTION';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: number;
  department_name?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Station {
  id: number;
  code: string;
  name: string;
  lat: number;
  lng: number;
  zone: string;
  division: string;
}

export interface Section {
  id: number;
  code: string;
  from_station_id: number;
  to_station_id: number;
  from_station_code?: string;
  from_station_name?: string;
  to_station_code?: string;
  to_station_name?: string;
  length_km: number;
  tracks: number;
  electrified: boolean;
  max_speed: number;
  status: 'Available' | 'Planned Maintenance' | 'Active Block' | 'Critical/Conflict' | 'Inactive';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  pending_tasks_count?: number;
  next_train?: string;
}

export interface Asset {
  id: number;
  asset_code: string;
  name: string;
  section_id: number;
  section_code?: string;
  department_id: number;
  department_name?: string;
  type: string;
  installation_date?: string;
  condition: 'Good' | 'Fair' | 'Worn' | 'Critical';
  health_score: number;
  last_inspection?: string;
}

export interface MaintenanceTask {
  id: number;
  task_code: string;
  department_id: number;
  department_name?: string;
  asset_id?: number;
  asset_name?: string;
  section_id: number;
  section_code?: string;
  asset_type: string;
  defect_type: string;
  description?: string;
  criticality: number;
  urgency: number;
  overdue_days: number;
  impact: number;
  priority_score: number;
  priority_category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimated_duration_hours: number;
  required_crew: number;
  required_equipment?: string;
  earliest_start?: string;
  latest_completion?: string;
  due_date?: string;
  status: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  is_locked: boolean;
  created_at?: string;
}

export interface TrainMovement {
  id: number;
  train_id: number;
  train_number: string;
  train_name: string;
  train_type: string;
  section_id: number;
  section_code?: string;
  direction: 'UP' | 'DOWN';
  scheduled_arrival: string;
  scheduled_departure: string;
  date: string;
}

export interface BlockTask {
  id: number;
  block_id: number;
  task_id: number;
  task_code?: string;
  defect_type?: string;
  department_name?: string;
  start_time: string;
  end_time: string;
  sequence: number;
}

export interface Block {
  id: number;
  block_code: string;
  section_id: number;
  section_code?: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  block_type: 'COORDINATED' | 'ENG_EXCLUSIVE' | 'SNT_EXCLUSIVE' | 'TRAC_EXCLUSIVE' | string;
  status: 'PLANNED' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  tasks: BlockTask[];
}

export interface OptimizationRun {
  id: number;
  run_code: string;
  mode: 'balanced' | 'max_availability' | 'min_disruption';
  horizon: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  optimization_score: number;
  tasks_scheduled_count: number;
  blocks_created_count: number;
  conflicts_count: number;
  asset_availability_pct: number;
  block_efficiency_pct: number;
  coordination_gain_hours: number;
  reduction_pct?: number;
  blocks: Block[];
}

export interface Conflict {
  id: number;
  conflict_code: string;
  task_id?: number;
  task_code?: string;
  block_id?: number;
  section_id: number;
  section_code?: string;
  train_id?: number;
  train_number?: string;
  conflict_type: string;
  scheduled_block_start?: string;
  scheduled_block_end?: string;
  train_time?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  is_resolved: boolean;
  resolution_notes?: string;
}

export interface Approval {
  id: number;
  optimization_run_id: number;
  run_code?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver_name?: string;
  comments?: string;
  plan_version: string;
  timestamp: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  username?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_value?: string;
  new_value?: string;
  reason?: string;
  timestamp: string;
}

export interface DashboardAnalytics {
  active_maintenance_tasks: number;
  critical_tasks: number;
  planned_blocks: number;
  asset_availability_pct: number;
  total_block_hours: number;
  train_conflicts: number;
  maintenance_completion_pct: number;
  block_efficiency_pct: number;
  by_department: Record<string, number>;
  priority_distribution: Record<string, number>;
  asset_availability_trend: Array<{ time: string; availability: number; target: number }>;
  block_utilization: Array<{ section: string; useful_hours: number; idle_hours: number }>;
  train_conflict_trend: Array<{ day: string; conflicts: number }>;
  critical_alerts: Array<{ id: number; title: string; section: string; severity: string; timestamp: string; action: string }>;
  latest_optimization_run?: {
    id: number;
    run_code: string;
    mode: string;
    score: number;
    tasks_scheduled: number;
    blocks_created: number;
    coordination_gain: number;
  };
  pending_approvals_count: number;
}

export interface BeforeAfterMetric {
  metric_name: string;
  existing_manual: number;
  patri_optimized: number;
  unit: string;
  improvement_pct: number;
  is_positive: boolean;
}

export interface BeforeAfterAnalytics {
  metrics: BeforeAfterMetric[];
  coordination_gain_hours: number;
  coordination_reduction_pct: number;
  sih_narrative: string;
}

export interface SimulationResponse {
  scenario_name: string;
  baseline_metrics: {
    block_hours: number;
    train_conflicts: number;
    asset_availability_pct: number;
    block_efficiency_pct: number;
    optimization_score: number;
  };
  simulated_metrics: {
    block_hours: number;
    train_conflicts: number;
    asset_availability_pct: number;
    block_efficiency_pct: number;
    optimization_score: number;
  };
  delta: {
    block_hours: number;
    train_conflicts: number;
    asset_availability_pct: number;
    block_efficiency_pct: number;
    optimization_score: number;
  };
  affected_tasks_count: number;
  new_conflicts_count: number;
  new_conflicts: any[];
  ai_comparison_narrative: string;
}
