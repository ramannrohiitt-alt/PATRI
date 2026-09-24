import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PATRI — Predictive & Adaptive Track Resource Intelligence"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "patri_railway_secret_key_sih_2026_super_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./patri.db")
    
    # Solver configuration
    SOLVER_TIME_LIMIT_SECONDS: int = 15
    
    class Config:
        case_sensitive = True

settings = Settings()
