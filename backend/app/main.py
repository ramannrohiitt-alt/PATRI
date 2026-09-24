from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api import (
    auth, users, stations, sections, assets, maintenance,
    trains, crews, equipment, optimization, conflicts,
    simulator, analytics, approvals, audit, explanations
)
from app.models.models import Station
from app.seed import seed_database

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Predictive & Adaptive Track Resource Intelligence — SIH26027 Railway Maintenance Decision-Support & Optimization Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-seed if running fresh
@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        count = db.query(Station).count()
        if count < 10:
            print("Auto-seeding database on server startup...")
            seed_database()
    finally:
        db.close()

# Mount API V1 Routers
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(users.router, prefix=api_v1)
app.include_router(stations.router, prefix=api_v1)
app.include_router(sections.router, prefix=api_v1)
app.include_router(assets.router, prefix=api_v1)
app.include_router(maintenance.router, prefix=api_v1)
app.include_router(trains.router, prefix=api_v1)
app.include_router(crews.router, prefix=api_v1)
app.include_router(equipment.router, prefix=api_v1)
app.include_router(optimization.router, prefix=api_v1)
app.include_router(conflicts.router, prefix=api_v1)
app.include_router(simulator.router, prefix=api_v1)
app.include_router(analytics.router, prefix=api_v1)
app.include_router(approvals.router, prefix=api_v1)
app.include_router(audit.router, prefix=api_v1)
app.include_router(explanations.router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "platform": "PATRI",
        "name": "Predictive & Adaptive Track Resource Intelligence",
        "problem_statement": "SIH26027",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "api_docs": "/docs",
        "api_v1_base": api_v1
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "patri-backend", "engine": "OR-Tools CP-SAT"}
