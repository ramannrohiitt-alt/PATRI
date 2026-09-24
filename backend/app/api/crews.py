from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db
from app.models.models import MaintenanceCrew
from app.schemas.schemas import CrewResponse

router = APIRouter(prefix="/crews", tags=["Maintenance Crews"])

@router.get("", response_model=List[CrewResponse])
def get_crews(department_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(MaintenanceCrew)
    if department_id:
        query = query.filter(MaintenanceCrew.department_id == department_id)
    crews = query.all()
    results = []
    for c in crews:
        results.append({
            "id": c.id,
            "crew_code": c.crew_code,
            "name": c.name,
            "department_id": c.department_id,
            "department_name": c.department.name if c.department else "",
            "size": c.size,
            "available_from": c.available_from,
            "available_to": c.available_to,
            "skills": c.skills,
            "is_available": c.is_available,
            "current_section_id": c.current_section_id
        })
    return results
