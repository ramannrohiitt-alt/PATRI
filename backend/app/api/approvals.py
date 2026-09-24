from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from app.api.deps import get_db, get_current_user, require_roles
from app.models.models import Approval, OptimizationRun, User, AuditLog
from app.schemas.schemas import ApprovalCreate, ApprovalResponse

router = APIRouter(prefix="/approvals", tags=["Approval Workflow"])

SAFETY_DISCLAIMER = "AI-generated schedules are recommendations and require authorized railway personnel validation before operational execution."

@router.get("", response_model=List[ApprovalResponse])
def get_approvals(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Approval)
    if status and status != "ALL":
        query = query.filter(Approval.status == status)
    
    approvals = query.order_by(Approval.id.desc()).all()
    results = []
    for a in approvals:
        results.append({
            "id": a.id,
            "optimization_run_id": a.optimization_run_id,
            "run_code": a.optimization_run.run_code if a.optimization_run else "",
            "status": a.status,
            "approver_name": a.approver.full_name if a.approver else None,
            "comments": a.comments,
            "plan_version": a.plan_version,
            "timestamp": a.timestamp
        })
    return results

@router.post("", response_model=ApprovalResponse)
def submit_approval_decision(
    approval_in: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "CONTROL_OFFICER"]))
):
    run = db.query(OptimizationRun).filter(OptimizationRun.id == approval_in.optimization_run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Optimization run not found")

    appr = Approval(
        optimization_run_id=run.id,
        status=approval_in.status.upper(),
        approver_user_id=current_user.id,
        comments=approval_in.comments,
        plan_version=approval_in.plan_version or "v1.0",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(appr)

    # Update run status if approved
    if approval_in.status.upper() == "APPROVED":
        run.status = "APPROVED"
        for b in run.blocks:
            b.status = "APPROVED"

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action=f"PLAN_{approval_in.status.upper()}",
        entity_type="OPTIMIZATION_PLAN",
        entity_id=run.run_code,
        new_value=f"Decision: {approval_in.status.upper()}, Version: {appr.plan_version}",
        reason=approval_in.comments or "Operational review by authorized traffic control officer"
    )
    db.add(audit)
    db.commit()
    db.refresh(appr)

    return {
        "id": appr.id,
        "optimization_run_id": appr.optimization_run_id,
        "run_code": run.run_code,
        "status": appr.status,
        "approver_name": current_user.full_name,
        "comments": appr.comments,
        "plan_version": appr.plan_version,
        "timestamp": appr.timestamp
    }
