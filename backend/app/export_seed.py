import json
import os
from app.core.database import SessionLocal
from app.models.models import (
    Station, Section, Asset, MaintenanceTask, Train, MaintenanceCrew, FreightForecast, Equipment
)

def export_seed_json():
    db = SessionLocal()
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "seed"))
    os.makedirs(out_dir, exist_ok=True)

    # 1. Stations
    stations = db.query(Station).all()
    stn_data = [{"id": s.id, "code": s.code, "name": s.name, "lat": s.lat, "lng": s.lng, "zone": s.zone, "division": s.division} for s in stations]
    with open(os.path.join(out_dir, "stations.json"), "w") as f:
        json.dump(stn_data, f, indent=2)

    # 2. Sections
    sections = db.query(Section).all()
    sec_data = [{"id": s.id, "code": s.code, "from_station_id": s.from_station_id, "to_station_id": s.to_station_id, "length_km": s.length_km, "tracks": s.tracks, "electrified": s.electrified, "max_speed": s.max_speed, "status": s.status, "risk_level": s.risk_level} for s in sections]
    with open(os.path.join(out_dir, "sections.json"), "w") as f:
        json.dump(sec_data, f, indent=2)

    # 3. Assets
    assets = db.query(Asset).all()
    ast_data = [{"id": a.id, "asset_code": a.asset_code, "name": a.name, "section_id": a.section_id, "department_id": a.department_id, "type": a.type, "condition": a.condition, "health_score": a.health_score} for a in assets]
    with open(os.path.join(out_dir, "assets.json"), "w") as f:
        json.dump(ast_data, f, indent=2)

    # 4. Trains
    trains = db.query(Train).all()
    trn_data = [{"id": t.id, "train_number": t.train_number, "name": t.name, "train_type": t.train_type, "priority_tier": t.priority_tier, "max_speed": t.max_speed} for t in trains]
    with open(os.path.join(out_dir, "trains.json"), "w") as f:
        json.dump(trn_data, f, indent=2)

    # 5. Maintenance
    tasks = db.query(MaintenanceTask).all()
    tsk_data = [{"id": t.id, "task_code": t.task_code, "department_id": t.department_id, "asset_id": t.asset_id, "section_id": t.section_id, "defect_type": t.defect_type, "criticality": t.criticality, "urgency": t.urgency, "priority_score": t.priority_score, "priority_category": t.priority_category, "estimated_duration_hours": t.estimated_duration_hours, "status": t.status} for t in tasks]
    with open(os.path.join(out_dir, "maintenance.json"), "w") as f:
        json.dump(tsk_data, f, indent=2)

    # 6. Crews
    crews = db.query(MaintenanceCrew).all()
    crw_data = [{"id": c.id, "crew_code": c.crew_code, "name": c.name, "department_id": c.department_id, "size": c.size, "skills": c.skills} for c in crews]
    with open(os.path.join(out_dir, "crews.json"), "w") as f:
        json.dump(crw_data, f, indent=2)

    # 7. Freight Forecast
    ffs = db.query(FreightForecast).all()
    ff_data = [{"id": f.id, "section_id": f.section_id, "time_window_start": f.time_window_start, "time_window_end": f.time_window_end, "expected_trains": f.expected_trains, "probability": f.probability} for f in ffs]
    with open(os.path.join(out_dir, "freight_forecast.json"), "w") as f:
        json.dump(ff_data, f, indent=2)

    db.close()
    print("Seed JSON files exported to patri/seed successfully!")

if __name__ == "__main__":
    export_seed_json()
