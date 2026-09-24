from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, get_current_user, require_roles
from app.models.models import Conflict, User, AuditLog
from app.schemas.schemas import ConflictResponse, ResolveConflictRequest

router = APIRouter(prefix="/conflicts", tags=["Conflict Center"])

@router.get("", response_model=List[ConflictResponse])
def get_conflicts(
    severity: Optional[str] = None,
    is_resolved: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Conflict)
    if severity and severity != "ALL":
        query = query.filter(Conflict.severity == severity)
    if is_resolved is not None:
        query = query.filter(Conflict.is_resolved == is_resolved)
    
    conflicts = query.all()
    results = []
    for c in conflicts:
        results.append({
            "id": c.id,
            "conflict_code": c.conflict_code,
            "task_id": c.task_id,
            "task_code": c.task.task_code if c.task else None,
            "block_id": c.block_id,
            "section_id": c.section_id,
            "section_code": c.section.code if c.section else None,
            "train_id": c.train_id,
            "train_number": c.train.train_number if c.train else None,
            "conflict_type": c.conflict_type,
            "scheduled_block_start": c.scheduled_block_start,
            "scheduled_block_end": c.scheduled_block_end,
            "train_time": c.train_time,
            "severity": c.severity,
            "explanation": c.explanation,
            "is_resolved": c.is_resolved,
            "resolution_notes": c.resolution_notes
        })
    return results

@router.post("/{id}/resolve")
def resolve_conflict(
    id: int,
    resolve_in: ResolveConflictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "CONTROL_OFFICER"]))
):
    conflict = db.query(Conflict).filter(Conflict.id == id).first()
    if not conflict:
        raise HTTPException(status_code=404, detail="Conflict not found")

    conflict.is_resolved = True
    conflict.resolution_notes = f"Action: {resolve_in.action}. Note: {resolve_in.resolution_notes or 'Resolved by controller'}"

    audit = AuditLog(
        user_id=current_user.id,
        action="CONFLICT_RESOLVED",
        entity_type="CONFLICT",
        entity_id=conflict.conflict_code,
        old_value="Unresolved",
        new_value=conflict.resolution_notes,
        reason=f"Action: {resolve_in.action}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Conflict resolved successfully", "conflict_code": conflict.conflict_code}
