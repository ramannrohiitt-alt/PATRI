from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db
from app.models.models import Section, Station, MaintenanceTask, TrainMovement
from app.schemas.schemas import SectionResponse

router = APIRouter(prefix="/sections", tags=["Sections"])

@router.get("", response_model=List[SectionResponse])
def get_sections(db: Session = Depends(get_db)):
    sections = db.query(Section).all()
    results = []
    
    for sec in sections:
        pending_count = db.query(MaintenanceTask).filter(
            MaintenanceTask.section_id == sec.id,
            MaintenanceTask.status.in_(["Pending", "Scheduled"])
        ).count()

        next_tm = db.query(TrainMovement).filter(
            TrainMovement.section_id == sec.id
        ).order_by(TrainMovement.scheduled_arrival.asc()).first()

        next_train_str = f"Train {next_tm.train.train_number} ({next_tm.scheduled_arrival.split('T')[1][:5]})" if next_tm and next_tm.train else "No imminent traffic"

        results.append({
            "id": sec.id,
            "code": sec.code,
            "from_station_id": sec.from_station_id,
            "to_station_id": sec.to_station_id,
            "from_station_code": sec.from_station.code if sec.from_station else None,
            "from_station_name": sec.from_station.name if sec.from_station else None,
            "to_station_code": sec.to_station.code if sec.to_station else None,
            "to_station_name": sec.to_station.name if sec.to_station else None,
            "length_km": sec.length_km,
            "tracks": sec.tracks,
            "electrified": sec.electrified,
            "max_speed": sec.max_speed,
            "status": sec.status,
            "risk_level": sec.risk_level,
            "pending_tasks_count": pending_count,
            "next_train": next_train_str
        })

    return results

@router.get("/{id}")
def get_section_detail(id: int, db: Session = Depends(get_db)):
    sec = db.query(Section).filter(Section.id == id).first()
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    
    tasks = db.query(MaintenanceTask).filter(MaintenanceTask.section_id == id).all()
    trains = db.query(TrainMovement).filter(TrainMovement.section_id == id).all()
    
    return {
        "section": {
            "id": sec.id,
            "code": sec.code,
            "from_station": sec.from_station.name,
            "to_station": sec.to_station.name,
            "length_km": sec.length_km,
            "tracks": sec.tracks,
            "electrified": sec.electrified,
            "max_speed": sec.max_speed,
            "status": sec.status,
            "risk_level": sec.risk_level
        },
        "tasks": [{
            "id": t.id,
            "task_code": t.task_code,
            "defect_type": t.defect_type,
            "department": t.department.name if t.department else "",
            "priority_category": t.priority_category,
            "priority_score": t.priority_score,
            "status": t.status,
            "duration_hours": t.estimated_duration_hours
        } for t in tasks],
        "train_movements": [{
            "train_number": tm.train.train_number if tm.train else "",
            "name": tm.train.name if tm.train else "",
            "type": tm.train.train_type if tm.train else "",
            "arrival": tm.scheduled_arrival,
            "departure": tm.scheduled_departure
        } for tm in trains]
    }
