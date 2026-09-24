from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional
import math
import uuid
from app.api.deps import get_db, get_current_user, require_roles
from app.models.models import MaintenanceTask, MaintenanceHistory, User, Department, Section, Asset, AuditLog
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskStatsResponse
from app.services.priority.engine import priority_engine

router = APIRouter(prefix="/maintenance", tags=["Maintenance Management"])

@router.get("", response_model=TaskListResponse)
def list_tasks(
    department_id: Optional[int] = None,
    section_id: Optional[int] = None,
    status: Optional[str] = None,
    priority_category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    sort_by: str = Query("priority_score"),
    order: str = Query("desc"),
    db: Session = Depends(get_db)
):
    query = db.query(MaintenanceTask)

    if department_id:
        query = query.filter(MaintenanceTask.department_id == department_id)
    if section_id:
        query = query.filter(MaintenanceTask.section_id == section_id)
    if status and status != "ALL":
        query = query.filter(MaintenanceTask.status == status)
    if priority_category and priority_category != "ALL":
        query = query.filter(MaintenanceTask.priority_category == priority_category)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                MaintenanceTask.task_code.ilike(search_fmt),
                MaintenanceTask.defect_type.ilike(search_fmt),
                MaintenanceTask.description.ilike(search_fmt)
            )
        )

    # Sorting
    sort_col = getattr(MaintenanceTask, sort_by, MaintenanceTask.priority_score)
    if order == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    tasks = query.offset((page - 1) * limit).limit(limit).all()

    items = []
    for t in tasks:
        items.append({
            "id": t.id,
            "task_code": t.task_code,
            "department_id": t.department_id,
            "department_name": t.department.name if t.department else None,
            "asset_id": t.asset_id,
            "asset_name": t.asset.name if t.asset else None,
            "section_id": t.section_id,
            "section_code": t.section.code if t.section else None,
            "asset_type": t.asset_type,
            "defect_type": t.defect_type,
            "description": t.description,
            "criticality": t.criticality,
            "urgency": t.urgency,
            "overdue_days": t.overdue_days,
            "impact": t.impact,
            "priority_score": t.priority_score,
            "priority_category": t.priority_category,
            "estimated_duration_hours": t.estimated_duration_hours,
            "required_crew": t.required_crew,
            "required_equipment": t.required_equipment,
            "earliest_start": t.earliest_start,
            "latest_completion": t.latest_completion,
            "due_date": t.due_date,
            "status": t.status,
            "is_locked": t.is_locked,
            "created_at": t.created_at
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": pages
    }

@router.get("/stats", response_model=TaskStatsResponse)
def get_task_stats(db: Session = Depends(get_db)):
    total = db.query(MaintenanceTask).count()
    crit = db.query(MaintenanceTask).filter(MaintenanceTask.priority_category == "CRITICAL").count()
    high = db.query(MaintenanceTask).filter(MaintenanceTask.priority_category == "HIGH").count()
    pending = db.query(MaintenanceTask).filter(MaintenanceTask.status == "Pending").count()
    scheduled = db.query(MaintenanceTask).filter(MaintenanceTask.status == "Scheduled").count()
    in_prog = db.query(MaintenanceTask).filter(MaintenanceTask.status == "In Progress").count()
    completed = db.query(MaintenanceTask).filter(MaintenanceTask.status == "Completed").count()

    # By department
    depts = db.query(Department).all()
    by_dept = {}
    for d in depts:
        by_dept[d.name] = db.query(MaintenanceTask).filter(MaintenanceTask.department_id == d.id).count()

    # By priority
    by_pri = {
        "CRITICAL": crit,
        "HIGH": high,
        "MEDIUM": db.query(MaintenanceTask).filter(MaintenanceTask.priority_category == "MEDIUM").count(),
        "LOW": db.query(MaintenanceTask).filter(MaintenanceTask.priority_category == "LOW").count()
    }

    return {
        "total_tasks": total,
        "critical_tasks": crit,
        "high_tasks": high,
        "pending_tasks": pending,
        "scheduled_tasks": scheduled,
        "in_progress_tasks": in_prog,
        "completed_tasks": completed,
        "by_department": by_dept,
        "by_priority": by_pri
    }

@router.get("/{id}")
def get_task(id: int, db: Session = Depends(get_db)):
    t = db.query(MaintenanceTask).filter(MaintenanceTask.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    
    history = db.query(MaintenanceHistory).filter(MaintenanceHistory.task_id == id).order_by(desc(MaintenanceHistory.timestamp)).all()
    
    return {
        "id": t.id,
        "task_code": t.task_code,
        "department_id": t.department_id,
        "department_name": t.department.name if t.department else None,
        "asset_id": t.asset_id,
        "asset_name": t.asset.name if t.asset else None,
        "section_id": t.section_id,
        "section_code": t.section.code if t.section else None,
        "asset_type": t.asset_type,
        "defect_type": t.defect_type,
        "description": t.description,
        "criticality": t.criticality,
        "urgency": t.urgency,
        "overdue_days": t.overdue_days,
        "impact": t.impact,
        "priority_score": t.priority_score,
        "priority_category": t.priority_category,
        "estimated_duration_hours": t.estimated_duration_hours,
        "required_crew": t.required_crew,
        "required_equipment": t.required_equipment,
        "earliest_start": t.earliest_start,
        "latest_completion": t.latest_completion,
        "due_date": t.due_date,
        "status": t.status,
        "is_locked": t.is_locked,
        "created_at": t.created_at,
        "history": [{
            "id": h.id,
            "action": h.action,
            "old_value": h.old_value,
            "new_value": h.new_value,
            "notes": h.notes,
            "timestamp": h.timestamp
        } for h in history]
    }

@router.post("", response_model=TaskResponse)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # RBAC: department check
    if current_user.role not in ["ADMIN", "CONTROL_OFFICER"]:
        user_dept_code = current_user.department.code if current_user.department else ""
        target_dept = db.query(Department).filter(Department.id == task_in.department_id).first()
        target_dept_code = target_dept.code if target_dept else ""
        if user_dept_code != target_dept_code:
            raise HTTPException(
                status_code=403,
                detail=f"You can only create maintenance tasks for your department ({user_dept_code})."
            )

    # Compute priority
    p_score, p_cat = priority_engine.calculate_score(
        task_in.criticality, task_in.urgency, task_in.overdue_days, task_in.impact
    )

    code = f"TSK-2026-{uuid.uuid4().hex[:6].upper()}"

    task = MaintenanceTask(
        **task_in.dict(),
        task_code=code,
        priority_score=p_score,
        priority_category=p_cat,
        status="Pending",
        is_locked=False
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    sec = db.query(Section).filter(Section.id == task.section_id).first()
    sec_code = sec.code if sec else str(task.section_id)
    dep = db.query(Department).filter(Department.id == task.department_id).first()
    dep_name = dep.name if dep else None
    ast = db.query(Asset).filter(Asset.id == task.asset_id).first() if task.asset_id else None
    ast_name = ast.name if ast else None

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="TASK_CREATED",
        entity_type="MAINTENANCE_TASK",
        entity_id=task.task_code,
        new_value=f"{task.defect_type} on Section {sec_code}",
        reason="New defect reported from field inspection"
    )
    db.add(audit)
    db.commit()

    return {
        "id": task.id,
        "task_code": task.task_code,
        "department_id": task.department_id,
        "department_name": dep_name,
        "asset_id": task.asset_id,
        "asset_name": ast_name,
        "section_id": task.section_id,
        "section_code": sec_code,
        "asset_type": task.asset_type,
        "defect_type": task.defect_type,
        "description": task.description,
        "criticality": task.criticality,
        "urgency": task.urgency,
        "overdue_days": task.overdue_days,
        "impact": task.impact,
        "priority_score": task.priority_score,
        "priority_category": task.priority_category,
        "estimated_duration_hours": task.estimated_duration_hours,
        "required_crew": task.required_crew,
        "required_equipment": task.required_equipment,
        "earliest_start": task.earliest_start,
        "latest_completion": task.latest_completion,
        "due_date": task.due_date,
        "status": task.status,
        "is_locked": task.is_locked,
        "created_at": task.created_at
    }

@router.put("/{id}")
def update_task(
    id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")

    old_status = task.status
    old_crit = task.criticality
    old_urg = task.urgency
    old_over = task.overdue_days
    old_imp = task.impact

    update_data = task_in.dict(exclude_unset=True)
    for key, val in update_data.items():
        setattr(task, key, val)

    # Recalculate priority if factors changed
    p_score, p_cat = priority_engine.calculate_score(
        task.criticality, task.urgency, task.overdue_days, task.impact
    )
    task.priority_score = p_score
    task.priority_category = p_cat

    # History record
    if "status" in update_data and old_status != task.status:
        hist = MaintenanceHistory(
            task_id=task.id,
            user_id=current_user.id,
            action="STATUS_CHANGED",
            old_value=old_status,
            new_value=task.status,
            notes=f"Updated by {current_user.full_name} ({current_user.role})"
        )
        db.add(hist)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="TASK_UPDATED",
        entity_type="MAINTENANCE_TASK",
        entity_id=task.task_code,
        old_value=f"status={old_status}, p_score={task.priority_score}",
        new_value=f"status={task.status}, p_score={p_score}",
        reason="Field adjustment or status progression"
    )
    db.add(audit)
    db.commit()
    db.refresh(task)

    return {"message": "Task updated successfully", "task_id": task.id, "priority_score": task.priority_score, "status": task.status}

@router.delete("/{id}")
def delete_task(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "CONTROL_OFFICER"]))
):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Audit log before delete
    audit = AuditLog(
        user_id=current_user.id,
        action="TASK_DELETED",
        entity_type="MAINTENANCE_TASK",
        entity_id=task.task_code,
        old_value=task.defect_type,
        reason="Administrative deletion"
    )
    db.add(audit)
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
