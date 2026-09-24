from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db
from app.models.models import Train, TrainMovement, FreightForecast
from app.schemas.schemas import TrainResponse, TrainMovementResponse, FreightForecastResponse

router = APIRouter(prefix="/trains", tags=["Trains & Movements"])

@router.get("", response_model=List[TrainResponse])
def get_trains(
    train_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Train)
    if train_type and train_type != "ALL":
        query = query.filter(Train.train_type == train_type)
    if search:
        s = f"%{search}%"
        query = query.filter(Train.name.ilike(s) | Train.train_number.ilike(s))
    return query.all()

@router.get("/movements", response_model=List[TrainMovementResponse])
def get_movements(
    section_id: Optional[int] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TrainMovement)
    if section_id:
        query = query.filter(TrainMovement.section_id == section_id)
    if date:
        query = query.filter(TrainMovement.date == date)
    
    movements = query.all()
    results = []
    for m in movements:
        results.append({
            "id": m.id,
            "train_id": m.train_id,
            "train_number": m.train.train_number if m.train else "",
            "train_name": m.train.name if m.train else "",
            "train_type": m.train.train_type if m.train else "",
            "section_id": m.section_id,
            "section_code": m.section.code if m.section else "",
            "direction": m.direction,
            "scheduled_arrival": m.scheduled_arrival,
            "scheduled_departure": m.scheduled_departure,
            "actual_arrival": m.actual_arrival,
            "actual_departure": m.actual_departure,
            "date": m.date
        })
    return results

@router.get("/freight-forecasts", response_model=List[FreightForecastResponse])
def get_freight_forecasts(
    section_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FreightForecast)
    if section_id:
        query = query.filter(FreightForecast.section_id == section_id)
    
    ffs = query.all()
    results = []
    for f in ffs:
        results.append({
            "id": f.id,
            "section_id": f.section_id,
            "section_code": f.section.code if f.section else "",
            "time_window_start": f.time_window_start,
            "time_window_end": f.time_window_end,
            "expected_trains": f.expected_trains,
            "probability": f.probability,
            "date": f.date
        })
    return results
