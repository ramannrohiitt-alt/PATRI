"""
Migration script to enrich PATRI database with the complete East Coast Trunk Corridor:
Kolkata (Howrah) - Kharagpur - Balasore - Bhadrak - Jajpur - Cuttack - Bhubaneswar - Khurda Road - Balugaon - Chatrapur - Berhampur/Brahmapur (Ganjam District)
"""
import sys
import os
import random
import datetime

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.models import Station, Section, Asset, MaintenanceTask, Train, TrainMovement, Department
from app.services.priority.engine import priority_engine

def update_corridor():
    db = SessionLocal()
    try:
        print("Enriching PATRI with Howrah - Bhubaneswar - Berhampur (Ganjam) Trunk Route...")

        # 1. Fetch departments
        depts = db.query(Department).all()
        dept_map = {d.code: d.id for d in depts}
        eng_id = dept_map.get("ENG", 1)
        snt_id = dept_map.get("SNT", 2)
        trac_id = dept_map.get("TRAC", 3)

        # 2. Add Stations
        stations_data = [
            # Kolkata & South Eastern Railway (SER) Hub
            {"code": "HWH", "name": "Howrah Junction (Kolkata)", "lat": 22.5839, "lng": 88.3426, "zone": "SER", "division": "Howrah"},
            {"code": "SRC", "name": "Santragachi Junction", "lat": 22.5802, "lng": 88.2831, "zone": "SER", "division": "Kharagpur"},
            {"code": "MCA", "name": "Mecheda", "lat": 22.4285, "lng": 87.8631, "zone": "SER", "division": "Kharagpur"},
            {"code": "KGP", "name": "Kharagpur Junction", "lat": 22.3298, "lng": 87.3204, "zone": "SER", "division": "Kharagpur"},
            
            # Odisha Border & Northern Corridor (ECoR / SER)
            {"code": "JER", "name": "Jaleswar", "lat": 21.8055, "lng": 87.2135, "zone": "SER", "division": "Kharagpur"},
            {"code": "BLS", "name": "Balasore", "lat": 21.4934, "lng": 86.9325, "zone": "SER", "division": "Kharagpur"},
            {"code": "BHC", "name": "Bhadrak", "lat": 21.0577, "lng": 86.5142, "zone": "ECoR", "division": "Khurda Road"},
            {"code": "JJKR", "name": "Jajpur Keonjhar Road", "lat": 20.9535, "lng": 86.1362, "zone": "ECoR", "division": "Khurda Road"},
            
            # Central Core: Cuttack & Bhubaneswar Metro (ECoR)
            {"code": "CTC", "name": "Cuttack Junction", "lat": 20.4625, "lng": 85.8943, "zone": "ECoR", "division": "Khurda Road"},
            {"code": "BRAG", "name": "Barang Junction", "lat": 20.3956, "lng": 85.8512, "zone": "ECoR", "division": "Khurda Road"},
            {"code": "MCS", "name": "Mancheswar (Workshop)", "lat": 20.3188, "lng": 85.8569, "zone": "ECoR", "division": "Khurda Road"},
            {"code": "BBS", "name": "Bhubaneswar", "lat": 20.2648, "lng": 85.8436, "zone": "ECoR", "division": "Khurda Road"},
            {"code": "KUR", "name": "Khurda Road Junction", "lat": 20.1783, "lng": 85.7335, "zone": "ECoR", "division": "Khurda Road"},
            {"code": "PURI", "name": "Puri Terminal", "lat": 19.8143, "lng": 85.8340, "zone": "ECoR", "division": "Khurda Road"},
            
            # Southern Corridor: Chilika & Ganjam District (ECoR)
            {"code": "BALU", "name": "Balugaon (Chilika Lake)", "lat": 19.7490, "lng": 85.2078, "zone": "ECoR", "division": "Khurda Road"},
            {"code": "CAP", "name": "Chatrapur (Ganjam HQ)", "lat": 19.3562, "lng": 84.9912, "zone": "ECoR", "division": "Khurda Road"},
            {"code": "BAM", "name": "Brahmapur / Berhampur (Ganjam)", "lat": 19.3130, "lng": 84.7937, "zone": "ECoR", "division": "Khurda Road"},
        ]

        stn_objects = {}
        for s in stations_data:
            existing = db.query(Station).filter(Station.code == s["code"]).first()
            if not existing:
                stn = Station(**s)
                db.add(stn)
                db.flush()
                stn_objects[s["code"]] = stn
                print(f"  + Added Station: {s['code']} - {s['name']}")
            else:
                stn_objects[s["code"]] = existing
        db.commit()

        # 3. Add Sections
        sections_data = [
            # Kolkata & Kharagpur Sector
            {"code": "SEC-HWH-SRC", "from": "HWH", "to": "SRC", "len": 7.5, "tracks": 4, "speed": 110, "status": "Available", "risk": "Low"},
            {"code": "SEC-SRC-MCA", "from": "SRC", "to": "MCA", "len": 52.0, "tracks": 3, "speed": 130, "status": "Planned Maintenance", "risk": "Medium"},
            {"code": "SEC-MCA-KGP", "from": "MCA", "to": "KGP", "len": 56.0, "tracks": 3, "speed": 130, "status": "Available", "risk": "Low"},
            {"code": "SEC-KGP-JER", "from": "KGP", "to": "JER", "len": 68.0, "tracks": 2, "speed": 130, "status": "Available", "risk": "Low"},
            
            # Balasore & Bhadrak Sector
            {"code": "SEC-JER-BLS", "from": "JER", "to": "BLS", "len": 48.0, "tracks": 2, "speed": 130, "status": "Available", "risk": "Low"},
            {"code": "SEC-BLS-BHC", "from": "BLS", "to": "BHC", "len": 62.0, "tracks": 2, "speed": 130, "status": "Critical/Conflict", "risk": "High"},
            {"code": "SEC-BHC-JJKR", "from": "BHC", "to": "JJKR", "len": 43.0, "tracks": 2, "speed": 130, "status": "Available", "risk": "Low"},
            {"code": "SEC-JJKR-CTC", "from": "JJKR", "to": "CTC", "len": 72.0, "tracks": 2, "speed": 130, "status": "Planned Maintenance", "risk": "Medium"},
            
            # Cuttack & Bhubaneswar Metro Sector
            {"code": "SEC-CTC-BRAG", "from": "CTC", "to": "BRAG", "len": 11.5, "tracks": 3, "speed": 130, "status": "Active Block", "risk": "Medium"},
            {"code": "SEC-BRAG-MCS", "from": "BRAG", "to": "MCS", "len": 10.2, "tracks": 3, "speed": 120, "status": "Available", "risk": "Low"},
            {"code": "SEC-MCS-BBS", "from": "MCS", "to": "BBS", "len": 7.1, "tracks": 4, "speed": 110, "status": "Available", "risk": "Low"},
            {"code": "SEC-BBS-KUR", "from": "BBS", "to": "KUR", "len": 19.3, "tracks": 3, "speed": 130, "status": "Available", "risk": "Low"},
            {"code": "SEC-KUR-PURI", "from": "KUR", "to": "PURI", "len": 44.0, "tracks": 2, "speed": 110, "status": "Available", "risk": "Low"},
            
            # Ganjam District Sector towards Berhampur
            {"code": "SEC-KUR-BALU", "from": "KUR", "to": "BALU", "len": 73.0, "tracks": 2, "speed": 130, "status": "Planned Maintenance", "risk": "Medium"},
            {"code": "SEC-BALU-CAP", "from": "BALU", "to": "CAP", "len": 78.0, "tracks": 2, "speed": 130, "status": "Available", "risk": "Low"},
            {"code": "SEC-CAP-BAM", "from": "CAP", "to": "BAM", "len": 21.0, "tracks": 2, "speed": 120, "status": "Critical/Conflict", "risk": "High"}
        ]

        sec_objects = {}
        for sec in sections_data:
            existing = db.query(Section).filter(Section.code == sec["code"]).first()
            if not existing:
                from_id = stn_objects[sec["from"]].id
                to_id = stn_objects[sec["to"]].id
                s_obj = Section(
                    code=sec["code"],
                    from_station_id=from_id,
                    to_station_id=to_id,
                    length_km=sec["len"],
                    tracks=sec["tracks"],
                    electrified=True,
                    max_speed=sec["speed"],
                    status=sec["status"],
                    risk_level=sec["risk"]
                )
                db.add(s_obj)
                db.flush()
                sec_objects[sec["code"]] = s_obj
                print(f"  + Added Track Section: {sec['code']} ({sec['from']} -> {sec['to']}, {sec['len']} km)")
            else:
                sec_objects[sec["code"]] = existing
        db.commit()

        # 4. Add Key Assets along the Corridor
        asset_templates = [
            (eng_id, "Track Point / Switch", "Turnout No. 12 High Speed 60kg"),
            (eng_id, "Continuous Welded Rail", "60kg 90UTS Premium Rail Line"),
            (eng_id, "Ballast Bed", "Deep Screened Clean Ballast Cushion 350mm"),
            (snt_id, "Point Machine", "IRS 220V Heavy Duty Point Machine"),
            (snt_id, "Axle Counter", "Digital Axle Counter Multi-Section (MSDAC)"),
            (snt_id, "Track Circuit", "Audio Frequency Track Circuit (AFTC)"),
            (trac_id, "OHE Catenary Wire", "150 sq mm High Tensile Copper Contact Wire"),
            (trac_id, "Traction Transformer", "25kV / 30MVA Traction Sub-Station Transformer"),
            (trac_id, "Insulator String", "Silicone Composite Anti-Pollution Saline Insulator")
        ]

        created_assets = []
        for code, sec in sec_objects.items():
            # Check if assets already exist for this section
            existing_count = db.query(Asset).filter(Asset.section_id == sec.id).count()
            if existing_count < 3:
                for idx in range(3):
                    d_id, atype, model = asset_templates[(hash(code) + idx) % len(asset_templates)]
                    health = round(random.uniform(72.0, 98.0), 1)
                    cond = "Good" if health > 85 else ("Fair" if health > 75 else "Worn")
                    ast = Asset(
                        asset_code=f"AST-{sec.code}-{idx+1:03d}",
                        name=f"{model} ({sec.code})",
                        section_id=sec.id,
                        department_id=d_id,
                        type=atype,
                        installation_date="2023-01-15",
                        condition=cond,
                        health_score=health,
                        last_inspection="2026-08-25"
                    )
                    db.add(ast)
                    db.flush()
                    created_assets.append(ast)
        db.commit()

        # 5. Add Realistic Multi-Department Maintenance Tasks
        maintenance_scenarios = [
            # Ganjam / Berhampur
            ("SEC-CAP-BAM", eng_id, "Track Point / Switch", "Acoustic Rail Flaw Detection on Curves (Berhampur Yard)", 95, 90, 4, 90, 2.5, "Flash Butt Welder"),
            ("SEC-CAP-BAM", trac_id, "Insulator String", "Coastal Saline Insulator Washing (Chatrapur-Berhampur)", 92, 85, 3, 85, 2.0, "Tower Wagon"),
            ("SEC-CAP-BAM", snt_id, "Point Machine", "IRS Point Machine Calibration at Berhampur Jn Interlocking", 88, 80, 2, 80, 1.5, "Point Testing Kit"),
            
            # Chilika / Balugaon
            ("SEC-KUR-BALU", eng_id, "Ballast Bed", "Deep Ballast Screening on Chilika Lake Causeway", 75, 70, 1, 70, 3.5, "BCM 800 Ballast Cleaning Machine"),
            ("SEC-KUR-BALU", trac_id, "OHE Catenary Wire", "High-Wind Catenary Dropper Snapping Inspection", 85, 80, 2, 80, 2.0, "Tower Wagon"),
            
            # Khurda Road & Puri
            ("SEC-KUR-PURI", trac_id, "Insulator String", "Coastal Marine Fog Insulator Overhaul (Puri Coastal Branch)", 90, 85, 3, 85, 2.5, "Insulator Washing Plant"),
            ("SEC-BBS-KUR", eng_id, "Continuous Welded Rail", "Continuous Tamping & Ballast Packing (Bhubaneswar-Khurda Quad Track)", 65, 55, 0, 55, 3.0, "CSM 09-32 Continuous Tamping Machine"),
            ("SEC-BBS-KUR", snt_id, "Axle Counter", "Digital Axle Counter Reset & Multi-Section Tuning (Khurda Road Yard)", 92, 88, 2, 90, 1.5, "Digital Multimeter"),
            
            # Bhubaneswar & Mancheswar & Cuttack
            ("SEC-MCS-BBS", trac_id, "OHE Catenary Wire", "Overhead Catenary Wire Height & Stagger Adjustment (Mancheswar Workshop)", 80, 75, 1, 75, 2.0, "Tower Wagon"),
            ("SEC-CTC-BRAG", eng_id, "Continuous Welded Rail", "Mahanadi River Rail Bridge Ultrasonic Rail Flaw (USFD) Inspection", 98, 95, 5, 95, 3.0, "Ultrasonic Rail Flaw Detector"),
            ("SEC-CTC-BRAG", snt_id, "Track Circuit", "Audio Frequency Track Circuit (AFTC) Tuning at Barang Jn", 75, 70, 0, 70, 1.5, "Digital Track Circuit Analyzer"),
            
            # Jajpur & Bhadrak & Balasore
            ("SEC-JJKR-CTC", eng_id, "Track Point / Switch", "Turnout Tongue Rail Wear Replacement (Jajpur Keonjhar Road)", 86, 80, 2, 80, 2.0, "Rail Relayer"),
            ("SEC-BLS-BHC", eng_id, "Continuous Welded Rail", "Welded Joint Rail Fracture Emergency Clamp Stabilization (Balasore)", 96, 92, 4, 92, 2.5, "Flash Butt Welder"),
            ("SEC-BLS-BHC", snt_id, "Axle Counter", "Electronic Interlocking Logic Verification (Bhadrak-Balasore)", 88, 85, 2, 85, 2.0, "Interlocking Testing Kit"),
            
            # Kharagpur & Kolkata / Howrah
            ("SEC-MCA-KGP", eng_id, "Ballast Bed", "Heavy Track Tamping & Alignment Correction (Kharagpur Yard Approach)", 70, 60, 0, 60, 3.0, "CSM 09-32 Continuous Tamping Machine"),
            ("SEC-SRC-MCA", trac_id, "Traction Transformer", "25kV Traction Sub-Station Transformer Bushing Overhaul (Mecheda)", 82, 78, 1, 78, 2.5, "Substation Inspection Rig"),
            ("SEC-HWH-SRC", eng_id, "Track Point / Switch", "Scissor Crossover Turnout Replacement (Howrah South Terminal)", 94, 90, 3, 90, 3.0, "Track Relaying Train"),
            ("SEC-HWH-SRC", snt_id, "Point Machine", "IRS 220V Point Machine Overhaul at Santragachi Coaching Yard", 90, 85, 2, 85, 1.5, "Point Testing Kit")
        ]

        task_count = 0
        for item in maintenance_scenarios:
            sec_code, dept_id, asset_type, defect, crit, urg, overdue, imp, dur, equip = item
            sec = sec_objects.get(sec_code)
            if not sec:
                continue

            # Check if task already exists
            existing_t = db.query(MaintenanceTask).filter(
                MaintenanceTask.section_id == sec.id,
                MaintenanceTask.defect_type == defect
            ).first()

            if not existing_t:
                # Find matching asset
                ast = db.query(Asset).filter(Asset.section_id == sec.id, Asset.type == asset_type).first()
                ast_id = ast.id if ast else None

                p_score, cat = priority_engine.calculate_score(crit, urg, overdue, imp)
                t_code = f"TSK-ECOR-{random.randint(1000, 9999)}"

                task = MaintenanceTask(
                    task_code=t_code,
                    department_id=dept_id,
                    asset_id=ast_id,
                    section_id=sec.id,
                    asset_type=asset_type,
                    defect_type=defect,
                    description=f"{defect} along {sec_code} corridor. Strict train headway buffer mandatory.",
                    criticality=crit,
                    urgency=urg,
                    overdue_days=overdue,
                    impact=imp,
                    priority_score=p_score,
                    priority_category=cat,
                    estimated_duration_hours=dur,
                    required_crew=random.randint(4, 8),
                    required_equipment=equip,
                    earliest_start="2026-09-07T01:00:00",
                    latest_completion="2026-09-07T05:30:00",
                    due_date="2026-09-08",
                    status="Pending"
                )
                db.add(task)
                task_count += 1
                print(f"  + Added Maintenance Task: [{cat}] {defect} ({sec_code}) - Priority Score: {p_score}")
        db.commit()

        # 6. Add Express Trains on the Kolkata - Bhubaneswar - Berhampur Corridor
        trunk_trains = [
            ("22895", "Howrah - Puri Vande Bharat Express", "Express", 1),
            ("12841", "Coromandel Express (Howrah - Chennai)", "Express", 1),
            ("12073", "Howrah - Bhubaneswar Jan Shatabdi Express", "Express", 1),
            ("12703", "Falaknuma Express (Howrah - Secunderabad)", "Express", 1),
            ("18417", "Puri - Gunupur Express (via Berhampur)", "Passenger", 2),
            ("BOXN-ECOR", "Paradeep Port Iron Ore Freight Rake", "Goods", 4)
        ]

        for num, name, ttype, tier in trunk_trains:
            existing_trn = db.query(Train).filter(Train.train_number == num).first()
            if not existing_trn:
                trn = Train(
                    train_number=num,
                    name=name,
                    train_type=ttype,
                    priority_tier=tier,
                    max_speed=130 if ttype == "Express" else 100
                )
                db.add(trn)
                db.flush()

                # Add movements in Bhubaneswar - Khurda - Berhampur sections
                for sec_c in ["SEC-HWH-SRC", "SEC-BLS-BHC", "SEC-CTC-BRAG", "SEC-BBS-KUR", "SEC-CAP-BAM"]:
                    s = sec_objects.get(sec_c)
                    if s:
                        tm = TrainMovement(
                            train_id=trn.id,
                            section_id=s.id,
                            direction="DOWN" if "HWH" in sec_c else "UP",
                            scheduled_arrival="2026-09-07T06:30:00",
                            scheduled_departure="2026-09-07T06:45:00",
                            date="2026-09-07"
                        )
                        db.add(tm)
        db.commit()

        print(f"\n[SUCCESS] Successfully enriched PATRI with:")
        print(f" - {len(stations_data)} Corridor Stations")
        print(f" - {len(sections_data)} High-Speed Track Sections")
        print(f" - {task_count} Multi-Department Maintenance Tasks")
        print(f" - Dedicated Howrah-Puri-Berhampur Express Train Schedules")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Corridor update failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    update_corridor()
