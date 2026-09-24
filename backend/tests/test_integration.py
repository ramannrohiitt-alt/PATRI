import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_and_auth():
    # Login as Control Officer
    res = client.post("/api/v1/auth/login", json={"username": "control_officer", "password": "admin"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "CONTROL_OFFICER"

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify /auth/me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "control_officer"

def test_stations_and_sections():
    stn_res = client.get("/api/v1/stations")
    assert stn_res.status_code == 200
    assert len(stn_res.json()) >= 10

    sec_res = client.get("/api/v1/sections")
    assert sec_res.status_code == 200
    assert len(sec_res.json()) >= 15

def test_maintenance_crud_and_priority():
    login_res = client.post("/api/v1/auth/login", json={"username": "control_officer", "password": "admin"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create task
    task_payload = {
        "department_id": 1,
        "section_id": 1,
        "asset_type": "Track Point / Switch",
        "defect_type": "Integration Test Welded Rail Gap",
        "description": "Critical acoustic test gap detected during automated QA",
        "criticality": 90.0,
        "urgency": 85.0,
        "overdue_days": 8,
        "impact": 80.0,
        "estimated_duration_hours": 2.5,
        "required_crew": 6,
        "required_equipment": "Flash Butt Welder"
    }
    create_res = client.post("/api/v1/maintenance", json=task_payload, headers=headers)
    assert create_res.status_code == 200
    task_data = create_res.json()
    assert task_data["priority_score"] >= 80.0
    assert task_data["priority_category"] in ["HIGH", "CRITICAL"]

    # List tasks with filters
    list_res = client.get("/api/v1/maintenance?department_id=1&limit=10")
    assert list_res.status_code == 200
    assert list_res.json()["total"] > 0

def test_optimization_solver_run():
    login_res = client.post("/api/v1/auth/login", json={"username": "control_officer", "password": "admin"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    opt_payload = {
        "horizon": "tomorrow",
        "mode": "balanced",
        "department_ids": [1, 2, 3],
        "priority_threshold": 50.0
    }
    opt_res = client.post("/api/v1/optimization/run", json=opt_payload, headers=headers)
    assert opt_res.status_code == 200
    opt_data = opt_res.json()
    assert opt_data["tasks_scheduled_count"] > 0
    assert opt_data["blocks_created_count"] > 0
    assert opt_data["coordination_gain_hours"] >= 0.0

    # Test Gantt endpoint
    gantt_res = client.get(f"/api/v1/optimization/runs/{opt_data['id']}/gantt")
    assert gantt_res.status_code == 200
    assert "rows" in gantt_res.json()

def test_whatif_simulation():
    login_res = client.post("/api/v1/auth/login", json={"username": "control_officer", "password": "admin"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    sim_payload = {
        "scenario_name": "Integration Test Surge Rake",
        "added_trains": [{
            "train_number": "QA-TEST-01",
            "type": "Express",
            "section_id": 1,
            "arrival": "03:00",
            "departure": "03:15"
        }],
        "unavailable_sections": [5],
        "freight_surge_multiplier": 1.2
    }
    sim_res = client.post("/api/v1/simulator/simulate", json=sim_payload, headers=headers)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "delta" in sim_data
    assert "ai_comparison_narrative" in sim_data

def test_analytics_and_sih_benchmarks():
    res = client.get("/api/v1/analytics/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["asset_availability_pct"] >= 90.0

    before_after = client.get("/api/v1/analytics/before-after")
    assert before_after.status_code == 200
    ba_data = before_after.json()
    assert ba_data["coordination_reduction_pct"] > 30.0

def test_ai_explanation_and_chat():
    chat_res = client.post("/api/v1/ai/chat", json={"message": "Why was T104 scheduled at 2 AM?"})
    assert chat_res.status_code == 200
    assert "T104" in chat_res.json()["response"]
