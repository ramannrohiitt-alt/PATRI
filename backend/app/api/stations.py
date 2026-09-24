from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.models.models import Station
from app.schemas.schemas import StationResponse

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("", response_model=List[StationResponse])
def get_stations(db: Session = Depends(get_db)):
    return db.query(Station).all()

@router.get("/{id}", response_model=StationResponse)
def get_station(id: int, db: Session = Depends(get_db)):
    stn = db.query(Station).filter(Station.id == id).first()
    if not stn:
        raise HTTPException(status_code=404, detail="Station not found")
    return stn
