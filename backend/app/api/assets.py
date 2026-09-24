from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db, require_roles
from app.models.models import Asset, Section, Department
from app.schemas.schemas import AssetResponse, AssetCreate, AssetUpdate

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.get("", response_model=List[AssetResponse])
def get_assets(
    section_id: Optional[int] = None,
    department_id: Optional[int] = None,
    condition: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asset)
    if section_id:
        query = query.filter(Asset.section_id == section_id)
    if department_id:
        query = query.filter(Asset.department_id == department_id)
    if condition:
        query = query.filter(Asset.condition == condition)
    
    assets = query.limit(100).all()
    results = []
    for a in assets:
        results.append({
            "id": a.id,
            "asset_code": a.asset_code,
            "name": a.name,
            "section_id": a.section_id,
            "section_code": a.section.code if a.section else None,
            "department_id": a.department_id,
            "department_name": a.department.name if a.department else None,
            "type": a.type,
            "installation_date": a.installation_date,
            "condition": a.condition,
            "health_score": a.health_score,
            "last_inspection": a.last_inspection
        })
    return results

@router.post("", response_model=AssetResponse)
def create_asset(
    asset_in: AssetCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["ADMIN", "ENGINEERING", "SNT", "TRACTION"]))
):
    asset = Asset(**asset_in.dict())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return {
        "id": asset.id,
        "asset_code": asset.asset_code,
        "name": asset.name,
        "section_id": asset.section_id,
        "section_code": asset.section.code if asset.section else None,
        "department_id": asset.department_id,
        "department_name": asset.department.name if asset.department else None,
        "type": asset.type,
        "installation_date": asset.installation_date,
        "condition": asset.condition,
        "health_score": asset.health_score,
        "last_inspection": asset.last_inspection
    }
