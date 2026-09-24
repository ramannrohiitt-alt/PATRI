from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, create_access_token
from app.models.models import User, Department
from app.schemas.schemas import Token, LoginRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect railway NetID username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    dept_name = user.department.name if user.department else "Operations"
    access_token = create_access_token(
        subject=user.username,
        role=user.role,
        department_id=user.department_id
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "department_id": user.department_id,
            "department_name": dept_name
        }
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "department_id": current_user.department_id,
        "department_name": current_user.department.name if current_user.department else "Operations"
    }

@router.get("/presets")
def get_demo_presets():
    """Provides instant role switching credentials for live SIH demonstration"""
    return [
        {"username": "control_officer", "role": "CONTROL_OFFICER", "label": "Traffic Control Officer (Approval & Planning)", "dept": "Operations"},
        {"username": "eng_officer", "role": "ENGINEERING", "label": "Sr. Divisional Engineer (Permanent Way)", "dept": "Engineering"},
        {"username": "snt_officer", "role": "SNT", "label": "Sr. Divisional S&T Engineer (Signals & Interlocking)", "dept": "S&T"},
        {"username": "trac_officer", "role": "TRACTION", "label": "Sr. Divisional Electrical Engineer (OHE/TRD)", "dept": "Traction"},
        {"username": "admin", "role": "ADMIN", "label": "Chief Operations Manager (Full Master Admin)", "dept": "Admin"}
    ]
