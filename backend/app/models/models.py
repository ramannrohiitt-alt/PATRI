import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)  # Engineering, S&T, Traction, Operations
    code = Column(String(20), nullable=False, unique=True)  # ENG, SNT, TRAC, OPER
    description = Column(String(255), nullable=True)

    users = relationship("User", back_populates="department")
    tasks = relationship("MaintenanceTask", back_populates="department")
    crews = relationship("MaintenanceCrew", back_populates="department")
    equipment = relationship("Equipment", back_populates="department")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(30), nullable=False)  # ADMIN, CONTROL_OFFICER, ENGINEERING, SNT, TRACTION
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    department = relationship("Department", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    approvals = relationship("Approval", back_populates="approver")

class Station(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    zone = Column(String(20), default="NR")
    division = Column(String(50), default="Delhi")

class Section(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), unique=True, index=True, nullable=False)
    from_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    to_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    length_km = Column(Float, nullable=False)
    tracks = Column(Integer, default=2)  # Single / Double / Multiple
    electrified = Column(Boolean, default=True)
    max_speed = Column(Integer, default=130)  # km/h
    status = Column(String(30), default="Available")  # Available, Planned Maintenance, Active Block, Critical/Conflict, Inactive
    risk_level = Column(String(20), default="Low")  # Low, Medium, High, Critical

    from_station = relationship("Station", foreign_keys=[from_station_id])
    to_station = relationship("Station", foreign_keys=[to_station_id])
    assets = relationship("Asset", back_populates="section")
    tasks = relationship("MaintenanceTask", back_populates="section")
    blocks = relationship("Block", back_populates="section")
    train_movements = relationship("TrainMovement", back_populates="section")
    freight_forecasts = relationship("FreightForecast", back_populates="section")

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    asset_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    type = Column(String(50), nullable=False)  # Track, Turnout, Signal, Point Machine, OHE Catenary, Transformer, Axle Counter
    installation_date = Column(String(20), nullable=True)
    condition = Column(String(30), default="Good")  # Good, Fair, Worn, Critical
    health_score = Column(Float, default=95.0)  # 0 to 100
    last_inspection = Column(String(20), nullable=True)

    section = relationship("Section", back_populates="assets")
    tasks = relationship("MaintenanceTask", back_populates="asset")

class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"
    id = Column(Integer, primary_key=True, index=True)
    task_code = Column(String(30), unique=True, index=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    asset_type = Column(String(50), nullable=False)
    defect_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Priority Calculation Inputs (0 - 100)
    criticality = Column(Float, default=50.0)  # C
    urgency = Column(Float, default=50.0)      # U
    overdue_days = Column(Integer, default=0)  # O factor
    impact = Column(Float, default=50.0)       # I
    priority_score = Column(Float, default=50.0) # Calculated: 0.35C + 0.25U + 0.20O + 0.20I
    priority_category = Column(String(20), default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    
    # Operational constraints
    estimated_duration_hours = Column(Float, nullable=False, default=2.0)
    required_crew = Column(Integer, default=4)
    required_equipment = Column(String(100), nullable=True)  # Tamping Machine, Tower Wagon, etc.
    earliest_start = Column(String(30), nullable=True)
    latest_completion = Column(String(30), nullable=True)
    due_date = Column(String(30), nullable=True)
    
    # Status
    status = Column(String(30), default="Pending")  # Pending, Scheduled, In Progress, Completed, Cancelled
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    department = relationship("Department", back_populates="tasks")
    asset = relationship("Asset", back_populates="tasks")
    section = relationship("Section", back_populates="tasks")
    history = relationship("MaintenanceHistory", back_populates="task")
    block_tasks = relationship("BlockTask", back_populates="task")

class MaintenanceHistory(Base):
    __tablename__ = "maintenance_history"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    task = relationship("MaintenanceTask", back_populates="history")

class Train(Base):
    __tablename__ = "trains"
    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    train_type = Column(String(30), nullable=False)  # Passenger, Express, Goods, Maintenance
    priority_tier = Column(Integer, default=1)  # 1 (Highest, e.g. Vande Bharat/Rajdhani) to 4 (Freight)
    max_speed = Column(Integer, default=130)

    movements = relationship("TrainMovement", back_populates="train")

class TrainMovement(Base):
    __tablename__ = "train_movements"
    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    direction = Column(String(10), default="UP")  # UP or DOWN
    scheduled_arrival = Column(String(30), nullable=False)  # ISO timestamp string
    scheduled_departure = Column(String(30), nullable=False) # ISO timestamp string
    actual_arrival = Column(String(30), nullable=True)
    actual_departure = Column(String(30), nullable=True)
    date = Column(String(20), nullable=False)

    train = relationship("Train", back_populates="movements")
    section = relationship("Section", back_populates="train_movements")

class FreightForecast(Base):
    __tablename__ = "freight_forecasts"
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    time_window_start = Column(String(30), nullable=False)
    time_window_end = Column(String(30), nullable=False)
    expected_trains = Column(Integer, default=2)
    probability = Column(Float, default=0.7)  # 0.0 to 1.0
    date = Column(String(20), nullable=False)

    section = relationship("Section", back_populates="freight_forecasts")

class MaintenanceCrew(Base):
    __tablename__ = "maintenance_crews"
    id = Column(Integer, primary_key=True, index=True)
    crew_code = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    size = Column(Integer, default=6)
    available_from = Column(String(10), default="00:00")
    available_to = Column(String(10), default="23:59")
    skills = Column(String(255), nullable=True)
    is_available = Column(Boolean, default=True)
    current_section_id = Column(Integer, ForeignKey("sections.id"), nullable=True)

    department = relationship("Department", back_populates="crews")

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    equipment_code = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    type = Column(String(50), nullable=False)  # Tamping Machine, Tower Wagon, Rail Grinder, Flash Butt Welder
    is_available = Column(Boolean, default=True)
    current_section_id = Column(Integer, ForeignKey("sections.id"), nullable=True)

    department = relationship("Department", back_populates="equipment")

class OptimizationRun(Base):
    __tablename__ = "optimization_runs"
    id = Column(Integer, primary_key=True, index=True)
    run_code = Column(String(30), unique=True, index=True, nullable=False)
    mode = Column(String(30), default="balanced")  # balanced, max_availability, min_disruption
    horizon = Column(String(20), default="tomorrow")
    status = Column(String(30), default="COMPLETED")  # RUNNING, COMPLETED, INFEASIBLE, FAILED
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Key Results
    optimization_score = Column(Float, default=88.5)
    tasks_scheduled_count = Column(Integer, default=0)
    blocks_created_count = Column(Integer, default=0)
    conflicts_count = Column(Integer, default=0)
    asset_availability_pct = Column(Float, default=94.2)
    block_efficiency_pct = Column(Float, default=85.0)
    coordination_gain_hours = Column(Float, default=0.0)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    blocks = relationship("Block", back_populates="optimization_run")
    results = relationship("OptimizationResult", back_populates="optimization_run", uselist=False)
    approvals = relationship("Approval", back_populates="optimization_run")

class Block(Base):
    __tablename__ = "blocks"
    id = Column(Integer, primary_key=True, index=True)
    block_code = Column(String(30), unique=True, index=True, nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    start_time = Column(String(30), nullable=False)  # ISO string
    end_time = Column(String(30), nullable=False)    # ISO string
    duration_hours = Column(Float, nullable=False)
    block_type = Column(String(30), default="COORDINATED")  # COORDINATED, ENG_EXCLUSIVE, SNT_EXCLUSIVE, TRAC_EXCLUSIVE
    status = Column(String(30), default="PLANNED")  # PLANNED, APPROVED, ACTIVE, COMPLETED, CANCELLED
    optimization_run_id = Column(Integer, ForeignKey("optimization_runs.id"), nullable=True)

    section = relationship("Section", back_populates="blocks")
    optimization_run = relationship("OptimizationRun", back_populates="blocks")
    block_tasks = relationship("BlockTask", back_populates="block")

class BlockTask(Base):
    __tablename__ = "block_tasks"
    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(Integer, ForeignKey("blocks.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=False)
    crew_id = Column(Integer, ForeignKey("maintenance_crews.id"), nullable=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    start_time = Column(String(30), nullable=False)
    end_time = Column(String(30), nullable=False)
    sequence = Column(Integer, default=1)

    block = relationship("Block", back_populates="block_tasks")
    task = relationship("MaintenanceTask", back_populates="block_tasks")
    crew = relationship("MaintenanceCrew")
    equipment = relationship("Equipment")

class OptimizationResult(Base):
    __tablename__ = "optimization_results"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("optimization_runs.id"), nullable=False)
    metrics_json = Column(JSON, nullable=True)
    schedule_json = Column(JSON, nullable=True)
    summary_text = Column(Text, nullable=True)
    solver_status = Column(String(30), default="OPTIMAL")

    optimization_run = relationship("OptimizationRun", back_populates="results")

class Conflict(Base):
    __tablename__ = "conflicts"
    id = Column(Integer, primary_key=True, index=True)
    conflict_code = Column(String(30), unique=True, index=True, nullable=False)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=True)
    block_id = Column(Integer, ForeignKey("blocks.id"), nullable=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=True)
    conflict_type = Column(String(50), default="TRAIN_BLOCK_COLLISION")  # TRAIN_BLOCK_COLLISION, CREW_UNAVAILABLE, EQUIPMENT_OVERLAP
    scheduled_block_start = Column(String(30), nullable=True)
    scheduled_block_end = Column(String(30), nullable=True)
    train_time = Column(String(30), nullable=True)
    severity = Column(String(20), default="CRITICAL")  # CRITICAL, HIGH, MEDIUM, LOW
    explanation = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)

    task = relationship("MaintenanceTask")
    block = relationship("Block")
    section = relationship("Section")
    train = relationship("Train")

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(Integer, primary_key=True, index=True)
    optimization_run_id = Column(Integer, ForeignKey("optimization_runs.id"), nullable=False)
    status = Column(String(20), default="PENDING")  # PENDING, APPROVED, REJECTED
    approver_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    comments = Column(Text, nullable=True)
    plan_version = Column(String(20), default="v1.0")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    optimization_run = relationship("OptimizationRun", back_populates="approvals")
    approver = relationship("User", back_populates="approvals")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
