from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.models import (
    MaintenanceTask, Block, BlockTask, TrainMovement, Section,
    OptimizationRun, Conflict
)
from app.schemas.schemas import (
    AIExplainRequest, AIExplainResponse, AIChatRequest, AIChatResponse
)
from app.services.explanations.engine import explanation_engine

router = APIRouter(prefix="/ai", tags=["AI Explanation & Assistant"])

@router.post("/explain-schedule", response_model=AIExplainResponse)
def explain_schedule(
    req: AIExplainRequest,
    db: Session = Depends(get_db)
):
    task = None
    if req.task_id:
        task = db.query(MaintenanceTask).filter(MaintenanceTask.id == req.task_id).first()
    elif req.query:
        import re
        m = re.search(r'\b(tsk[-_]?\d+|t\d+)\b', req.query.lower())
        if m:
            code = m.group(1).upper()
            task = db.query(MaintenanceTask).filter(MaintenanceTask.task_code.ilike(f"%{code}%")).first()
    
    if not task:
        task = db.query(MaintenanceTask).filter(MaintenanceTask.status == "Scheduled").first()

    if not task:
        raise HTTPException(status_code=404, detail="No maintenance task found to explain")

    # Find associated block
    bt = db.query(BlockTask).filter(BlockTask.task_id == task.id).first()
    block = bt.block if bt else None
    
    # Coordinated tasks in same block
    coord_tasks = []
    if block:
        for sibling_bt in block.block_tasks:
            st = sibling_bt.task
            if st:
                coord_tasks.append({
                    "id": st.id,
                    "task_code": st.task_code,
                    "department_name": st.department.name if st.department else "Engineering"
                })

    # Train movements on section
    movements = db.query(TrainMovement).filter(TrainMovement.section_id == task.section_id).all()
    mov_data = [{
        "section_id": m.section_id,
        "arrival": m.scheduled_arrival,
        "departure": m.scheduled_departure
    } for m in movements]

    task_dict = {
        "id": task.id,
        "task_code": task.task_code,
        "defect_type": task.defect_type,
        "priority_score": task.priority_score,
        "priority_category": task.priority_category,
        "department_name": task.department.name if task.department else "Engineering",
        "section_id": task.section_id
    }
    block_dict = {
        "block_code": block.block_code,
        "start_time": block.start_time,
        "end_time": block.end_time
    } if block else None

    sec_dict = {"code": task.section.code} if task.section else None

    explanation = explanation_engine.explain_task_schedule(
        task_dict, block_dict, sec_dict, mov_data, coord_tasks
    )

    return explanation

@router.post("/chat", response_model=AIChatResponse)
def chat_with_assistant(
    chat_in: AIChatRequest,
    db: Session = Depends(get_db)
):
    # Contextual db facts
    conflicts_count = db.query(Conflict).filter(Conflict.is_resolved == False).count()
    latest_run = db.query(OptimizationRun).order_by(OptimizationRun.id.desc()).first()
    gain_hours = latest_run.coordination_gain_hours if latest_run else 16.5
    reduc_pct = 42.8

    context = {
        "conflicts_count": conflicts_count,
        "coordination_gain_hours": gain_hours,
        "reduction_pct": reduc_pct
    }

    result = explanation_engine.answer_query(chat_in.message, context)
    return result
