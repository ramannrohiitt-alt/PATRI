from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db
from app.models.models import Equipment
from app.schemas.schemas import EquipmentResponse

router = APIRouter(prefix="/equipment", tags=["Equipment"])

@router.get("", response_model=List[EquipmentResponse])
def get_equipment(department_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Equipment)
    if department_id:
        query = query.filter(Equipment.department_id == department_id)
    equipment = query.all()
    results = []
    for e in equipment:
        results.append({
            "id": e.id,
            "equipment_code": e.equipment_code,
            "name": e.name,
            "department_id": e.department_id,
            "department_name": e.department.name if e.department else "",
            "type": e.type,
            "is_available": e.is_available,
            "current_section_id": e.current_section_id
        })
    return results
