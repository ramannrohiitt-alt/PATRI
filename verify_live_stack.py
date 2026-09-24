import urllib.request
import json

def verify():
    # 1. Health
    with urllib.request.urlopen("http://127.0.0.1:8000/health") as r:
        health = json.loads(r.read())
        print(f"[OK] Backend Health: {health}")

    # 2. Login
    req_data = json.dumps({"username": "control_officer", "password": "admin"}).encode('utf-8')
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/auth/login",
        data=req_data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as r:
        login = json.loads(r.read())
        token = login["access_token"]
        print(f"[OK] Logged in as: {login['user']['full_name']} ({login['user']['role']})")

    # 3. Dashboard Stats
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/analytics/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )
    with urllib.request.urlopen(req) as r:
        stats = json.loads(r.read())
        print(f"[OK] Dashboard Stats: Active Tasks: {stats['active_maintenance_tasks']} | Critical Tasks: {stats['critical_tasks']} | Asset Availability: {stats['asset_availability_pct']}% | Conflicts: {stats['train_conflicts']} | Efficiency: {stats['block_efficiency_pct']}%")

    # 4. Sections & Stations
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/sections") as r:
        sections = json.loads(r.read())
        print(f"[OK] Loaded {len(sections)} railway sections")

    # 5. Frontend index
    with urllib.request.urlopen("http://127.0.0.1:5173/") as r:
        content = r.read().decode('utf-8')
        assert "PATRI" in content or "vite" in content or "root" in content
        print(f"[OK] Frontend HTML served successfully (HTTP 200, {len(content)} bytes)")

if __name__ == "__main__":
    verify()
