from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# ----------------- AUTH & USER -----------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- DEPARTMENT -----------------
class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- STATIONS & SECTIONS -----------------
class StationResponse(BaseModel):
    id: int
    code: str
    name: str
    lat: float
    lng: float
    zone: str
    division: str

    class Config:
        from_attributes = True

class SectionResponse(BaseModel):
    id: int
    code: str
    from_station_id: int
    to_station_id: int
    from_station_code: Optional[str] = None
    from_station_name: Optional[str] = None
    to_station_code: Optional[str] = None
    to_station_name: Optional[str] = None
    length_km: float
    tracks: int
    electrified: bool
    max_speed: int
    status: str
    risk_level: str
    pending_tasks_count: Optional[int] = 0
    next_train: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- ASSETS -----------------
class AssetBase(BaseModel):
    asset_code: str
    name: str
    section_id: int
    department_id: int
    type: str
    installation_date: Optional[str] = None
    condition: Optional[str] = "Good"
    health_score: Optional[float] = 95.0
    last_inspection: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    condition: Optional[str] = None
    health_score: Optional[float] = None
    last_inspection: Optional[str] = None

class AssetResponse(AssetBase):
    id: int
    section_code: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- MAINTENANCE TASKS -----------------
class TaskBase(BaseModel):
    department_id: int
    asset_id: Optional[int] = None
    section_id: int
    asset_type: str
    defect_type: str
    description: Optional[str] = None
    criticality: float = 50.0
    urgency: float = 50.0
    overdue_days: int = 0
    impact: float = 50.0
    estimated_duration_hours: float = 2.0
    required_crew: int = 4
    required_equipment: Optional[str] = None
    earliest_start: Optional[str] = None
    latest_completion: Optional[str] = None
    due_date: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    description: Optional[str] = None
    criticality: Optional[float] = None
    urgency: Optional[float] = None
    overdue_days: Optional[int] = None
    impact: Optional[float] = None
    estimated_duration_hours: Optional[float] = None
    required_crew: Optional[int] = None
    required_equipment: Optional[str] = None
    status: Optional[str] = None
    is_locked: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    task_code: str
    priority_score: float
    priority_category: str
    status: str
    is_locked: bool
    created_at: Optional[datetime] = None
    department_name: Optional[str] = None
    section_code: Optional[str] = None
    asset_name: Optional[str] = None

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    pages: int

class TaskStatsResponse(BaseModel):
    total_tasks: int
    critical_tasks: int
    high_tasks: int
    pending_tasks: int
    scheduled_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    by_department: Dict[str, int]
    by_priority: Dict[str, int]

# ----------------- TRAINS -----------------
class TrainResponse(BaseModel):
    id: int
    train_number: str
    name: str
    train_type: str
    priority_tier: int
    max_speed: int

    class Config:
        from_attributes = True

class TrainMovementResponse(BaseModel):
    id: int
    train_id: int
    train_number: Optional[str] = None
    train_name: Optional[str] = None
    train_type: Optional[str] = None
    section_id: int
    section_code: Optional[str] = None
    direction: str
    scheduled_arrival: str
    scheduled_departure: str
    actual_arrival: Optional[str] = None
    actual_departure: Optional[str] = None
    date: str

    class Config:
        from_attributes = True

class FreightForecastResponse(BaseModel):
    id: int
    section_id: int
    section_code: Optional[str] = None
    time_window_start: str
    time_window_end: str
    expected_trains: int
    probability: float
    date: str

    class Config:
        from_attributes = True

# ----------------- RESOURCES -----------------
class CrewResponse(BaseModel):
    id: int
    crew_code: str
    name: str
    department_id: int
    department_name: Optional[str] = None
    size: int
    available_from: str
    available_to: str
    skills: Optional[str] = None
    is_available: bool
    current_section_id: Optional[int] = None

    class Config:
        from_attributes = True

class EquipmentResponse(BaseModel):
    id: int
    equipment_code: str
    name: str
    department_id: int
    department_name: Optional[str] = None
    type: str
    is_available: bool
    current_section_id: Optional[int] = None

    class Config:
        from_attributes = True

# ----------------- OPTIMIZATION & BLOCKS -----------------
class OptimizationRequest(BaseModel):
    horizon: str = "tomorrow"  # today, tomorrow, 7days, 30days
    mode: str = "balanced"     # balanced, max_availability, min_disruption
    department_ids: Optional[List[int]] = None
    section_ids: Optional[List[int]] = None
    priority_threshold: Optional[float] = None

class BlockTaskResponse(BaseModel):
    id: int
    block_id: int
    task_id: int
    task_code: Optional[str] = None
    defect_type: Optional[str] = None
    department_name: Optional[str] = None
    crew_id: Optional[int] = None
    crew_name: Optional[str] = None
    equipment_id: Optional[int] = None
    equipment_name: Optional[str] = None
    start_time: str
    end_time: str
    sequence: int

    class Config:
        from_attributes = True

class BlockResponse(BaseModel):
    id: int
    block_code: str
    section_id: int
    section_code: Optional[str] = None
    start_time: str
    end_time: str
    duration_hours: float
    block_type: str
    status: str
    tasks: List[BlockTaskResponse] = []

    class Config:
        from_attributes = True

class OptimizationRunResponse(BaseModel):
    id: int
    run_code: str
    mode: str
    horizon: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    optimization_score: float
    tasks_scheduled_count: int
    blocks_created_count: int
    conflicts_count: int
    asset_availability_pct: float
    block_efficiency_pct: float
    coordination_gain_hours: float
    reduction_pct: Optional[float] = 0.0
    blocks: List[BlockResponse] = []

    class Config:
        from_attributes = True

class ValidateMoveRequest(BaseModel):
    task_id: int
    new_start_time: str
    new_end_time: str
    block_id: Optional[int] = None

class ValidateMoveResponse(BaseModel):
    is_valid: bool
    violations: List[str]
    conflicts_detected: List[Dict[str, Any]]

# ----------------- CONFLICTS -----------------
class ConflictResponse(BaseModel):
    id: int
    conflict_code: str
    task_id: Optional[int] = None
    task_code: Optional[str] = None
    block_id: Optional[int] = None
    section_id: int
    section_code: Optional[str] = None
    train_id: Optional[int] = None
    train_number: Optional[str] = None
    conflict_type: str
    scheduled_block_start: Optional[str] = None
    scheduled_block_end: Optional[str] = None
    train_time: Optional[str] = None
    severity: str
    explanation: str
    is_resolved: bool
    resolution_notes: Optional[str] = None

    class Config:
        from_attributes = True

class ResolveConflictRequest(BaseModel):
    action: str  # reoptimize, shift_window, dismiss
    resolution_notes: Optional[str] = None

# ----------------- SIMULATOR -----------------
class SimulationRequest(BaseModel):
    baseline_run_id: Optional[int] = None
    scenario_name: str
    added_trains: Optional[List[Dict[str, Any]]] = []
    removed_trains: Optional[List[int]] = []
    added_tasks: Optional[List[Dict[str, Any]]] = []
    unavailable_sections: Optional[List[int]] = []
    unavailable_crews: Optional[List[int]] = []
    freight_surge_multiplier: Optional[float] = 1.0
    optimization_mode: Optional[str] = "balanced"

class SimulationResponse(BaseModel):
    scenario_name: str
    baseline_metrics: Dict[str, Any]
    simulated_metrics: Dict[str, Any]
    delta: Dict[str, Any]
    affected_tasks_count: int
    new_conflicts_count: int
    new_conflicts: List[Dict[str, Any]]
    ai_comparison_narrative: str

# ----------------- ANALYTICS -----------------
class DashboardAnalyticsResponse(BaseModel):
    active_maintenance_tasks: int
    critical_tasks: int
    planned_blocks: int
    asset_availability_pct: float
    total_block_hours: float
    train_conflicts: int
    maintenance_completion_pct: float
    block_efficiency_pct: float
    by_department: Dict[str, int]
    priority_distribution: Dict[str, int]
    asset_availability_trend: List[Dict[str, Any]]
    block_utilization: List[Dict[str, Any]]
    train_conflict_trend: List[Dict[str, Any]]
    critical_alerts: List[Dict[str, Any]]
    latest_optimization_run: Optional[Dict[str, Any]] = None
    pending_approvals_count: int

class BeforeAfterMetric(BaseModel):
    metric_name: str
    existing_manual: float
    patri_optimized: float
    unit: str
    improvement_pct: float
    is_positive: bool

class BeforeAfterAnalyticsResponse(BaseModel):
    metrics: List[BeforeAfterMetric]
    coordination_gain_hours: float
    coordination_reduction_pct: float
    sih_narrative: str

# ----------------- APPROVALS & AUDIT -----------------
class ApprovalCreate(BaseModel):
    optimization_run_id: int
    status: str  # APPROVED, REJECTED
    comments: Optional[str] = None
    plan_version: Optional[str] = "v1.0"

class ApprovalResponse(BaseModel):
    id: int
    optimization_run_id: int
    run_code: Optional[str] = None
    status: str
    approver_name: Optional[str] = None
    comments: Optional[str] = None
    plan_version: str
    timestamp: datetime

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    username: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# ----------------- AI EXPLANATION & CHAT -----------------
class AIExplainRequest(BaseModel):
    run_id: Optional[int] = None
    task_id: Optional[int] = None
    query: Optional[str] = None

class AIExplainResponse(BaseModel):
    query: str
    answer: str
    grounding_factors: Dict[str, Any]
    confidence: float

class AIChatRequest(BaseModel):
    message: str
    context_run_id: Optional[int] = None

class AIChatResponse(BaseModel):
    query: str
    response: str
    relevant_entities: List[Dict[str, Any]]
    suggested_actions: List[str]
