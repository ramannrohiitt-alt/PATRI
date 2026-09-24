# PATRI — API Contracts Specification
## RESTful Endpoints & Schema Standards

### Base URL: `http://localhost:8000/api/v1`

---

### 1. Authentication & Users
- `POST /auth/login`
  - Body: `{ username, password }`
  - Response: `{ access_token, token_type: "bearer", user: { id, username, email, full_name, role, department_id } }`
- `GET /auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: User object
- `GET /users`
  - Query: `role`, `department_id`
  - Response: `User[]`

---

### 2. Network Topology & Assets
- `GET /stations`
  - Response: `Station[]` (`id, code, name, lat, lng, zone, division`)
- `GET /sections`
  - Response: `Section[]` (`id, code, from_station, to_station, length_km, tracks, electrified, max_speed, status, risk_level, pending_maintenance_count, next_train`)
- `GET /sections/{id}`
  - Response: Detailed section with connected stations, assets, and upcoming trains
- `GET /assets`
  - Query: `section_id`, `department_id`, `type`
  - Response: `Asset[]` (`id, asset_code, name, type, section_id, condition, health_score, last_inspection`)
- `POST /assets` | `PUT /assets/{id}` | `DELETE /assets/{id}`

---

### 3. Maintenance Tasks (CRUD)
- `GET /maintenance`
  - Query: `department_id`, `section_id`, `status`, `priority_category`, `search`, `page`, `limit`, `sort_by`, `order`
  - Response: `{ items: MaintenanceTask[], total, page, pages }`
- `POST /maintenance`
  - Body: `{ department_id, asset_id, section_id, asset_type, defect_type, description, criticality, urgency, overdue_days, impact, estimated_duration_hours, required_crew, required_equipment, earliest_start, latest_completion, due_date }`
  - Note: Server computes `priority_score` and `priority_category` automatically via Priority Engine.
  - Response: `MaintenanceTask`
- `GET /maintenance/{id}`
  - Response: `MaintenanceTask` with history audit logs
- `PUT /maintenance/{id}`
  - Body: Partial update
- `DELETE /maintenance/{id}`
- `GET /maintenance/stats`
  - Response: Summary counts by department, status, priority category

---

### 4. Trains & Movements
- `GET /trains`
  - Query: `type`, `search`
  - Response: `Train[]`
- `GET /trains/movements`
  - Query: `section_id`, `date`, `start_time`, `end_time`
  - Response: `TrainMovement[]` (`id, train_number, train_name, train_type, section_id, direction, arrival, departure, status`)
- `GET /freight-forecasts`
  - Query: `section_id`
  - Response: `FreightForecast[]`

---

### 5. Resources (Crews & Equipment)
- `GET /crews`
  - Query: `department_id`, `is_available`
  - Response: `Crew[]`
- `GET /equipment`
  - Query: `department_id`, `is_available`
  - Response: `Equipment[]`

---

### 6. Block Planner & OR-Tools Optimization
- `POST /optimization/run`
  - Body: `{ horizon: "today" | "tomorrow" | "7days" | "30days", mode: "balanced" | "max_availability" | "min_disruption", department_ids: number[], section_ids: number[], priority_threshold?: number }`
  - Response: `{ run_id, status, started_at, message }`
- `GET /optimization/runs`
  - Response: `OptimizationRun[]`
- `GET /optimization/runs/{id}`
  - Response: `OptimizationRun` with metrics, scheduled blocks, tasks, and coordination gain
- `GET /optimization/runs/{id}/gantt`
  - Response: Gantt timeline data organized by rows:
    - Engineering tasks
    - S&T tasks
    - Traction tasks
    - Passenger Trains
    - Freight Trains
    - Coordinated Maintenance Blocks
- `POST /optimization/runs/{id}/validate-move`
  - Body: `{ task_id, new_start_time, new_end_time, block_id }`
  - Response: `{ is_valid: boolean, violations: string[], conflicts_detected: Conflict[] }`

---

### 7. Conflicts Engine
- `GET /conflicts`
  - Query: `run_id`, `severity`, `is_resolved`
  - Response: `Conflict[]` (`id, conflict_code, task, section, block_time, train, train_time, severity, explanation, is_resolved`)
- `POST /conflicts/{id}/resolve`
  - Body: `{ action: "reoptimize" | "shift_window" | "dismiss", resolution_notes: string }`
  - Response: Updated conflict record

---

### 8. What-If Simulator
- `POST /simulator/simulate`
  - Body:
    ```json
    {
      "baseline_run_id": 1,
      "scenario_name": "Evening Express Added & Track 4 TSR",
      "modifications": {
        "added_trains": [{ "train_number": "12951", "type": "EXPRESS", "section_id": 3, "arrival": "15:30", "departure": "15:45" }],
        "removed_trains": [],
        "added_tasks": [{ "department_id": 1, "section_id": 3, "defect_type": "Rail Fracture Alert", "criticality": 95, "urgency": 90, "duration_hours": 3.0 }],
        "unavailable_sections": [5],
        "unavailable_crews": [2],
        "freight_surge_multiplier": 1.5
      },
      "optimization_mode": "balanced"
    }
    ```
  - Response: Simulation result comparison diff:
    ```json
    {
      "scenario_id": "sim_abc123",
      "baseline_metrics": { "block_hours": 14.5, "train_conflicts": 1, "asset_availability_pct": 92.4, "efficiency_pct": 84.1 },
      "simulated_metrics": { "block_hours": 16.0, "train_conflicts": 3, "asset_availability_pct": 88.0, "efficiency_pct": 79.5 },
      "delta": { "block_hours": 1.5, "train_conflicts": 2, "asset_availability_pct": -4.4, "efficiency_pct": -4.6 },
      "affected_tasks": [],
      "new_conflicts": [],
      "ai_comparison_narrative": "..."
    }
    ```

---

### 9. Analytics & SIH Demonstration
- `GET /analytics/dashboard`
  - Response: Live command center KPIs, distribution charts, utilization, alert feeds
- `GET /analytics/before-after`
  - Response: Dynamic comparison between traditional manual scheduling vs PATRI OR-Tools coordinated optimization:
    - Block Hours: Traditional 38.5h vs PATRI 22.0h (-42.8%)
    - Train Conflicts: Traditional 14 vs PATRI 0 (-100%)
    - Tasks Completed: Traditional 68% vs PATRI 94% (+26%)
    - Asset Availability: Traditional 81.2% vs PATRI 95.8% (+14.6%)
    - Block Efficiency: Traditional 54% vs PATRI 88.5% (+34.5%)

---

### 10. Approvals & Audit Log
- `GET /approvals`
  - Query: `status`
  - Response: `Approval[]`
- `POST /approvals`
  - Body: `{ run_id, status: "APPROVED" | "REJECTED", comments: string }`
  - Response: Updated approval record
- `GET /audit-logs`
  - Query: `limit`, `entity_type`
  - Response: `AuditLog[]`

---

### 11. AI Assistant & Explanations
- `POST /ai/explain-schedule`
  - Body: `{ run_id: number, task_id?: number, query?: string }`
  - Response: `{ query, answer, grounding_factors: { no_train_conflict: boolean, freight_probability: number, crew_assigned: string, coordinated_with_task: string, priority_score: number }, confidence: number }`
- `POST /ai/chat`
  - Body: `{ message: string, context_run_id?: number }`
  - Response: Grounded response answering questions like:
    - "Why was T104 scheduled at 2 AM?"
    - "What conflicts exist tomorrow?"
    - "Which sections have highest maintenance risk?"
    - "How much block time did PATRI save?"
