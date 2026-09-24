import os
import json
import datetime
import random
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import (
    Department, User, Station, Section, Asset, MaintenanceTask,
    MaintenanceHistory, Train, TrainMovement, FreightForecast,
    MaintenanceCrew, Equipment, Block, BlockTask, OptimizationRun,
    OptimizationResult, Conflict, Approval, AuditLog
)
from app.services.priority.engine import priority_engine

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Station).count() >= 10:
        print("Database already seeded with railway network data.")
        db.close()
        return

    print("Seeding PATRI Railway Maintenance Planning & Optimization Database...")

    # 1. DEPARTMENTS
    depts_data = [
        {"name": "Engineering", "code": "ENG", "description": "Permanent Way, Track Alignment, Sleepers, Rail Fractures, Ballasting"},
        {"name": "Signal & Telecom", "code": "SNT", "description": "Interlocking, Point Machines, Track Circuits, Axle Counters, OFC"},
        {"name": "Traction / OHE", "code": "TRAC", "description": "Overhead Equipment (25kV AC), Catenary, Transformers, Sub-stations"},
        {"name": "Operations / Control", "code": "OPER", "description": "Divisional Traffic Control, Train Operations & Safety"}
    ]
    depts = []
    for d in depts_data:
        dept = Department(**d)
        db.add(dept)
        depts.append(dept)
    db.commit()

    eng_dept_id = depts[0].id
    snt_dept_id = depts[1].id
    trac_dept_id = depts[2].id
    oper_dept_id = depts[3].id

    # 2. USERS
    users_data = [
        {"username": "admin", "email": "admin@patri.railnet.gov.in", "full_name": "Chief Operations Manager", "role": "ADMIN", "department_id": oper_dept_id, "password": "admin"},
        {"username": "control_officer", "email": "control@patri.railnet.gov.in", "full_name": "Senior Divisional Operations Manager", "role": "CONTROL_OFFICER", "department_id": oper_dept_id, "password": "admin"},
        {"username": "eng_officer", "email": "eng@patri.railnet.gov.in", "full_name": "Senior Divisional Engineer (Coordination)", "role": "ENGINEERING", "department_id": eng_dept_id, "password": "admin"},
        {"username": "snt_officer", "email": "snt@patri.railnet.gov.in", "full_name": "Senior Divisional Signal & Telecom Engineer", "role": "SNT", "department_id": snt_dept_id, "password": "admin"},
        {"username": "trac_officer", "email": "trac@patri.railnet.gov.in", "full_name": "Senior Divisional Electrical Engineer (TRD)", "role": "TRACTION", "department_id": trac_dept_id, "password": "admin"}
    ]
    for u in users_data:
        pwd = u.pop("password")
        user = User(**u, hashed_password=get_password_hash(pwd))
        db.add(user)
    db.commit()

    # 3. 10 STATIONS (Delhi Division - High Density Northern Railway)
    stations_data = [
        {"code": "NDLS", "name": "New Delhi", "lat": 28.6429, "lng": 77.2195, "zone": "NR", "division": "Delhi"},
        {"code": "GZB", "name": "Ghaziabad Junction", "lat": 28.6678, "lng": 77.4326, "zone": "NR", "division": "Delhi"},
        {"code": "ANVT", "name": "Anand Vihar Terminal", "lat": 28.6508, "lng": 77.3153, "zone": "NR", "division": "Delhi"},
        {"code": "NZM", "name": "Hazrat Nizamuddin", "lat": 28.5888, "lng": 77.2536, "zone": "NR", "division": "Delhi"},
        {"code": "FDB", "name": "Faridabad", "lat": 28.4089, "lng": 77.3178, "zone": "NR", "division": "Delhi"},
        {"code": "PWL", "name": "Palwal", "lat": 28.1447, "lng": 77.3260, "zone": "NR", "division": "Delhi"},
        {"code": "DSA", "name": "Delhi Shahdara", "lat": 28.6738, "lng": 77.2915, "zone": "NR", "division": "Delhi"},
        {"code": "SBB", "name": "Sahibabad", "lat": 28.6722, "lng": 77.3683, "zone": "NR", "division": "Delhi"},
        {"code": "TKJ", "name": "Tilak Bridge", "lat": 28.6255, "lng": 77.2415, "zone": "NR", "division": "Delhi"},
        {"code": "DEC", "name": "Delhi Cantt", "lat": 28.5957, "lng": 77.1264, "zone": "NR", "division": "Delhi"}
    ]
    stations = []
    for s in stations_data:
        stn = Station(**s)
        db.add(stn)
        stations.append(stn)
    db.commit()

    # 4. 15 SECTIONS
    stn_map = {s.code: s.id for s in stations}
    sections_data = [
        {"code": "SEC-001", "from": "NDLS", "to": "TKJ", "len": 2.5, "tracks": 4, "speed": 110, "status": "Available", "risk": "Low"},
        {"code": "SEC-002", "from": "TKJ", "to": "NZM", "len": 4.8, "tracks": 4, "speed": 120, "status": "Available", "risk": "Low"},
        {"code": "SEC-003", "from": "NZM", "to": "FDB", "len": 21.3, "tracks": 3, "speed": 130, "status": "Critical/Conflict", "risk": "High"},
        {"code": "SEC-004", "from": "FDB", "to": "PWL", "len": 29.5, "tracks": 3, "speed": 130, "status": "Planned Maintenance", "risk": "Medium"},
        {"code": "SEC-005", "from": "NDLS", "to": "DSA", "len": 7.2, "tracks": 2, "speed": 100, "status": "Available", "risk": "Low"},
        {"code": "SEC-006", "from": "DSA", "to": "SBB", "len": 7.8, "tracks": 2, "speed": 110, "status": "Available", "risk": "Low"},
        {"code": "SEC-007", "from": "SBB", "to": "GZB", "len": 6.5, "tracks": 4, "speed": 130, "status": "Active Block", "risk": "Medium"},
        {"code": "SEC-008", "from": "ANVT", "to": "SBB", "len": 4.2, "tracks": 2, "speed": 110, "status": "Available", "risk": "Low"},
        {"code": "SEC-009", "from": "NDLS", "to": "DEC", "len": 14.1, "tracks": 2, "speed": 110, "status": "Available", "risk": "Low"},
        {"code": "SEC-010", "from": "TKJ", "to": "DSA", "len": 5.8, "tracks": 2, "speed": 100, "status": "Available", "risk": "Low"},
        {"code": "SEC-011", "from": "GZB", "to": "ANVT", "len": 12.4, "tracks": 2, "speed": 120, "status": "Planned Maintenance", "risk": "Medium"},
        {"code": "SEC-012", "from": "NZM", "to": "ANVT", "len": 9.5, "tracks": 2, "speed": 110, "status": "Available", "risk": "Low"},
        {"code": "SEC-013", "from": "PWL", "to": "FDB", "len": 29.5, "tracks": 3, "speed": 130, "status": "Available", "risk": "Low"},
        {"code": "SEC-014", "from": "GZB", "to": "NDLS", "len": 24.5, "tracks": 4, "speed": 130, "status": "Available", "risk": "Low"},
        {"code": "SEC-015", "from": "DEC", "to": "NZM", "len": 16.2, "tracks": 2, "speed": 110, "status": "Available", "risk": "Low"}
    ]
    sections = []
    for sec in sections_data:
        s_obj = Section(
            code=sec["code"],
            from_station_id=stn_map[sec["from"]],
            to_station_id=stn_map[sec["to"]],
            length_km=sec["len"],
            tracks=sec["tracks"],
            electrified=True,
            max_speed=sec["speed"],
            status=sec["status"],
            risk_level=sec["risk"]
        )
        db.add(s_obj)
        sections.append(s_obj)
    db.commit()

    # 5. 100 ASSETS
    asset_types = [
        (eng_dept_id, "Track Point / Switch", "Turnout No. 12 Curved"),
        (eng_dept_id, "Continuous Welded Rail", "60kg 90UTS Rail Line"),
        (eng_dept_id, "Glued Insulated Rail Joint", "G3L Insulated Joint"),
        (eng_dept_id, "Ballast Bed", "Cushion Depth 350mm Ballast"),
        (snt_dept_id, "Point Machine", "IRS Point Machine 220V"),
        (snt_dept_id, "Axle Counter", "Digital Axle Counter Multi-Section"),
        (snt_dept_id, "Colour Light Signal", "4-Aspect LED Signal Post"),
        (snt_dept_id, "Track Circuit", "Audio Frequency Track Circuit (AFTC)"),
        (trac_dept_id, "OHE Catenary Wire", "107 sq mm Hard Drawn Copper"),
        (trac_dept_id, "Traction Transformer", "25kV / 21.6MVA Power Transformer"),
        (trac_dept_id, "Isolator Switch", "Motorized Gang Operated Switch"),
        (trac_dept_id, "Cantilever Assembly", "Composite Insulator Swivelling Cantilever")
    ]
    assets = []
    for i in range(1, 101):
        sec = random.choice(sections)
        dept_id, atype, model = random.choice(asset_types)
        health = round(random.uniform(70.0, 99.0), 1)
        cond = "Good" if health > 85 else ("Fair" if health > 75 else "Worn")
        if i in [14, 27, 52]:  # Critical assets
            health = 54.0
            cond = "Critical"

        asset = Asset(
            asset_code=f"AST-{sec.code}-{i:03d}",
            name=f"{model} #{i}",
            section_id=sec.id,
            department_id=dept_id,
            type=atype,
            installation_date="2022-04-15",
            condition=cond,
            health_score=health,
            last_inspection="2026-08-20"
        )
        db.add(asset)
        assets.append(asset)
    db.commit()

    # 6. 20 MAINTENANCE CREWS
    crews = []
    crew_types = [
        (eng_dept_id, "Permanent Way Maintenance Gang", "Track Tamping, Rail Welding, Gauge Correction"),
        (snt_dept_id, "Signal Maintenance Squad", "Interlocking Testing, Point Machine Overhaul"),
        (trac_dept_id, "OHE Tower Wagon Crew", "Catenary Height Stagger Adjustment, Insulator Washing")
    ]
    for i in range(1, 21):
        dept_id, cname, skills = crew_types[(i - 1) % 3]
        crew = MaintenanceCrew(
            crew_code=f"CRW-{i:02d}",
            name=f"{cname} #{i}",
            department_id=dept_id,
            size=random.randint(6, 12),
            available_from="00:00",
            available_to="23:59",
            skills=skills,
            is_available=True,
            current_section_id=random.choice(sections).id
        )
        db.add(crew)
        crews.append(crew)
    db.commit()

    # 7. 30 EQUIPMENT RESOURCES
    equipments = []
    eq_catalog = [
        (eng_dept_id, "CSM 09-32 Continuous Tamping Machine", "Tamping Machine"),
        (eng_dept_id, "BCM 800 Ballast Cleaning Machine", "Ballast Cleaner"),
        (eng_dept_id, "FRM 85 Shoulder Ballast Cleaner", "Shoulder Ballast"),
        (eng_dept_id, "Flash Butt Welding Plant", "Rail Welder"),
        (trac_dept_id, "Self-Propelled 8-Wheeler Tower Wagon", "Tower Wagon"),
        (trac_dept_id, "OHE Wiring Train", "Wiring Machine"),
        (snt_dept_id, "Optical Time Domain Reflectometer (OTDR)", "Testing Tool"),
        (snt_dept_id, "Digital Track Circuit Analyzer", "Signal Analyzer")
    ]
    for i in range(1, 31):
        dept_id, ename, etype = eq_catalog[(i - 1) % len(eq_catalog)]
        eq = Equipment(
            equipment_code=f"EQP-{i:02d}",
            name=f"{ename} [UNIT-{i:02d}]",
            department_id=dept_id,
            type=etype,
            is_available=True,
            current_section_id=random.choice(sections).id
        )
        db.add(eq)
        equipments.append(eq)
    db.commit()

    # 8. 50 TRAINS & MOVEMENTS
    trains_catalog = [
        ("12004", "Lucknow Shatabdi Express", "Express", 1),
        ("22436", "Vande Bharat Express (Varanasi)", "Express", 1),
        ("12952", "Mumbai Rajdhani Express", "Express", 1),
        ("12302", "Howrah Rajdhani Express", "Express", 1),
        ("12011", "Kalka Shatabdi Express", "Express", 1),
        ("14041", "Mussoorie Express", "Passenger", 2),
        ("04408", "Palwal - New Delhi Shuttle", "Passenger", 3),
        ("04419", "Ghaziabad - Delhi EMU", "Passenger", 3),
        ("BOXN-401", "Coal Freightrake Dadri", "Goods", 4),
        ("BTPN-108", "POL Tanker Container Mathura", "Goods", 4),
        ("CONT-991", "CONCOR Container Freight", "Goods", 4),
        ("MTN-001", "Northern Railway Tower Inspection Special", "Maintenance", 2)
    ]
    trains = []
    for i in range(1, 51):
        sample = trains_catalog[(i - 1) % len(trains_catalog)]
        t = Train(
            train_number=f"{sample[0]}-{i:02d}" if i > 12 else sample[0],
            name=f"{sample[1]}",
            train_type=sample[2],
            priority_tier=sample[3],
            max_speed=130 if sample[2] == "Express" else 100
        )
        db.add(t)
        trains.append(t)
    db.commit()

    # Create Train Movements for tomorrow (2026-09-06) across sections
    hours_schedule = [
        ("06:15", "06:25"), ("07:30", "07:42"), ("08:45", "08:58"),
        ("10:10", "10:22"), ("12:30", "12:45"), ("14:15", "14:28"),
        ("16:00", "16:15"), ("17:45", "18:00"), ("19:20", "19:35"),
        ("21:00", "21:15"), ("23:15", "23:25"), ("04:45", "04:55")
    ]
    movements = []
    for idx, t in enumerate(trains):
        sec = sections[idx % len(sections)]
        times = hours_schedule[idx % len(hours_schedule)]
        tm = TrainMovement(
            train_id=t.id,
            section_id=sec.id,
            direction="UP" if idx % 2 == 0 else "DOWN",
            scheduled_arrival=f"2026-09-06T{times[0]}:00",
            scheduled_departure=f"2026-09-06T{times[1]}:00",
            date="2026-09-06"
        )
        db.add(tm)
        movements.append(tm)
    db.commit()

    # 9. FREIGHT FORECASTS
    for sec in sections:
        ff1 = FreightForecast(
            section_id=sec.id,
            time_window_start="2026-09-06T01:00:00",
            time_window_end="2026-09-06T05:00:00",
            expected_trains=random.randint(1, 3),
            probability=round(random.uniform(0.15, 0.45), 2),
            date="2026-09-06"
        )
        ff2 = FreightForecast(
            section_id=sec.id,
            time_window_start="2026-09-06T13:00:00",
            time_window_end="2026-09-06T17:00:00",
            expected_trains=random.randint(2, 5),
            probability=round(random.uniform(0.60, 0.90), 2),
            date="2026-09-06"
        )
        db.add(ff1)
        db.add(ff2)
    db.commit()

    # 10. 200 MAINTENANCE TASKS (With realistic multi-department coordination scenarios)
    defect_catalog = {
        eng_dept_id: [
            ("Rail Fracture Alert on Welded Joint", 95, 90, 4, 90, 2.5, "Flash Butt Welder"),
            ("Track Tamping & Ballast Packing", 60, 50, 0, 50, 3.0, "CSM 09-32 Continuous Tamping Machine"),
            ("Turnout Tongue Rail Wear Replacement", 85, 75, 2, 80, 2.0, "Rail Relayer"),
            ("Deep Ballast Screening & Shoulder Cleaning", 70, 60, 0, 65, 4.0, "BCM 800 Ballast Cleaning Machine"),
            ("Insulated Joint Insulation Failure", 90, 85, 3, 85, 1.5, "Track Tool Kit"),
            ("Track Gauge & Cross-Level Correction", 65, 55, 1, 55, 2.0, "Tamping Machine")
        ],
        snt_dept_id: [
            ("Point Machine Obstruction & Calibration", 90, 85, 2, 85, 1.5, "Point Testing Kit"),
            ("Axle Counter Reset & Counting Error", 88, 80, 1, 80, 1.0, "Digital Multimeter"),
            ("Signal Aspect LED Unit Replacement", 75, 70, 0, 65, 1.0, "Signal Toolkit"),
            ("AFTC Track Circuit Tuning & Bonding", 70, 60, 0, 60, 2.0, "Digital Track Circuit Analyzer"),
            ("Interlocking Relay Cable Resistance Test", 60, 50, 0, 50, 1.5, "Megger Insulation Tester")
        ],
        trac_dept_id: [
            ("OHE Catenary Wire Dropper Snapping", 92, 90, 3, 90, 2.0, "Tower Wagon"),
            ("Cantilever Insulator Flashover Cleaning", 70, 60, 0, 60, 1.5, "Insulator Washing Plant"),
            ("Section Insulator Neutral Section Tuning", 80, 75, 1, 75, 2.0, "Tower Wagon"),
            ("Power Sub-Station Isolator Greasing", 65, 55, 0, 55, 2.5, "Electrical Kit"),
            ("Earth Wire Bonding & Structure Grounding", 60, 50, 0, 50, 1.5, "Bonding Welder")
        ]
    }

    tasks = []
    for i in range(1, 201):
        # Rotate departments
        if i % 3 == 1:
            dept_id = eng_dept_id
            dept_name = "Engineering"
        elif i % 3 == 2:
            dept_id = snt_dept_id
            dept_name = "S&T"
        else:
            dept_id = trac_dept_id
            dept_name = "Traction"

        defect_info = random.choice(defect_catalog[dept_id])
        defect_type, crit, urg, overdue, imp, dur, eq_req = defect_info

        # Specific critical & coordinated opportunities
        # Force SEC-001, SEC-003, SEC-004 to have compatible ENG, SNT, TRAC pairs!
        sec = sections[(i - 1) % len(sections)]
        
        # Calculate priority using PATRI engine
        p_score, p_cat = priority_engine.calculate_score(crit, urg, overdue, imp)

        status = "Pending"
        if i in [1, 2, 3]:
            status = "Scheduled"
        elif i == 7:
            status = "In Progress"
        elif i > 185:
            status = "Completed"

        task = MaintenanceTask(
            task_code=f"TSK-2026-{i:04d}",
            department_id=dept_id,
            asset_id=assets[(i - 1) % len(assets)].id,
            section_id=sec.id,
            asset_type=assets[(i - 1) % len(assets)].type,
            defect_type=defect_type,
            description=f"{defect_type} detected during acoustic rail inspection. Scheduled for prioritized remediation.",
            criticality=float(crit),
            urgency=float(urg),
            overdue_days=overdue,
            impact=float(imp),
            priority_score=p_score,
            priority_category=p_cat,
            estimated_duration_hours=dur,
            required_crew=random.randint(4, 8),
            required_equipment=eq_req,
            earliest_start="2026-09-06T00:00:00",
            latest_completion="2026-09-06T23:59:00",
            due_date="2026-09-07",
            status=status,
            is_locked=(i == 1)
        )
        db.add(task)
        tasks.append(task)
    db.commit()

    # 11. BASELINE OPTIMIZATION RUN (Realistic Pre-computed OR-Tools Plan)
    run = OptimizationRun(
        run_code="RUN-20260906-001",
        mode="balanced",
        horizon="tomorrow",
        status="COMPLETED",
        optimization_score=94.2,
        tasks_scheduled_count=38,
        blocks_created_count=12,
        conflicts_count=0,
        asset_availability_pct=95.8,
        block_efficiency_pct=88.5,
        coordination_gain_hours=16.5,
        created_by_user_id=1
    )
    db.add(run)
    db.commit()

    # Create coordinated blocks for this run
    block1 = Block(
        block_code="BLK-2026-001",
        section_id=sections[0].id,
        start_time="2026-09-06T01:30:00",
        end_time="2026-09-06T04:30:00",
        duration_hours=3.0,
        block_type="COORDINATED",
        status="APPROVED",
        optimization_run_id=run.id
    )
    block2 = Block(
        block_code="BLK-2026-002",
        section_id=sections[2].id,
        start_time="2026-09-06T01:00:00",
        end_time="2026-09-06T04:45:00",
        duration_hours=3.75,
        block_type="COORDINATED",
        status="PLANNED",
        optimization_run_id=run.id
    )
    db.add(block1)
    db.add(block2)
    db.commit()

    # Block tasks
    bt1 = BlockTask(block_id=block1.id, task_id=tasks[0].id, crew_id=crews[0].id, equipment_id=equipments[0].id, start_time="2026-09-06T01:30:00", end_time="2026-09-06T03:30:00", sequence=1)
    bt2 = BlockTask(block_id=block1.id, task_id=tasks[1].id, crew_id=crews[1].id, equipment_id=equipments[6].id, start_time="2026-09-06T02:00:00", end_time="2026-09-06T03:00:00", sequence=2)
    bt3 = BlockTask(block_id=block1.id, task_id=tasks[2].id, crew_id=crews[2].id, equipment_id=equipments[4].id, start_time="2026-09-06T02:30:00", end_time="2026-09-06T04:30:00", sequence=3)
    db.add(bt1)
    db.add(bt2)
    db.add(bt3)
    db.commit()

    # Result
    opt_result = OptimizationResult(
        run_id=run.id,
        metrics_json={
            "independent_block_hours": 38.5,
            "optimized_block_hours": 22.0,
            "coordination_gain_hours": 16.5,
            "reduction_pct": 42.8,
            "block_efficiency_pct": 88.5
        },
        summary_text="OR-Tools CP-SAT generated optimal balanced schedule. 38 tasks consolidated into 12 blocks with zero train conflicts.",
        solver_status="OPTIMAL"
    )
    db.add(opt_result)

    # 12. INITIAL CONFLICT (For Conflict Center Demonstration)
    conf = Conflict(
        conflict_code="CONF-2026-0001",
        task_id=tasks[5].id,
        section_id=sections[2].id,
        train_id=trains[2].id,
        conflict_type="TRAIN_BLOCK_COLLISION",
        scheduled_block_start="2026-09-06T15:00:00",
        scheduled_block_end="2026-09-06T17:00:00",
        train_time="2026-09-06T16:00:00",
        severity="CRITICAL",
        explanation="Manual block request overlaps with Train 12952 Mumbai Rajdhani Express at 16:00. Safety margin breached.",
        is_resolved=False
    )
    db.add(conf)

    # 13. AUDIT LOGS
    log1 = AuditLog(
        user_id=2,
        action="SCHEDULE_OPTIMIZED",
        entity_type="OPTIMIZATION_RUN",
        entity_id=str(run.id),
        new_value="Run RUN-20260906-001 completed with 16.5h coordination gain",
        reason="Routine daily maintenance scheduling"
    )
    log2 = AuditLog(
        user_id=2,
        action="TASK_MOVED",
        entity_type="MAINTENANCE_TASK",
        entity_id="TSK-2026-0104",
        old_value="02:00",
        new_value="04:00",
        reason="Shifted to clear early morning suburban passenger rake"
    )
    db.add(log1)
    db.add(log2)
    db.commit()

    # Save JSON seed files for reference
    os.makedirs("seed", exist_ok=True)
    with open("seed/stations.json", "w") as f:
        json.dump(stations_data, f, indent=2)
    with open("seed/sections.json", "w") as f:
        json.dump(sections_data, f, indent=2)

    db.close()
    print("Database seeding completed successfully! 10 stations, 15 sections, 100 assets, 200 tasks, 50 trains seeded.")

if __name__ == "__main__":
    seed_database()
