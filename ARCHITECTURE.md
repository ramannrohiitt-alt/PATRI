# PATRI — Predictive & Adaptive Track Resource Intelligence
## System Architecture & Technical Specification (SIH26027)

### 1. System Overview
PATRI is an AI-assisted railway maintenance decision-support and optimization platform designed for Indian Railways traffic control officers, engineering teams (Permanent Way), Signal & Telecommunication (S&T) engineers, and Traction/OHE (Overhead Equipment) personnel.

PATRI solves the fundamental challenge:
> **"When, where, and how should railway maintenance activities be scheduled so that maximum maintenance work can be completed using minimum infrastructure downtime and minimum disruption to train operations?"**

---

### 2. Multi-Role & Permissions Matrix
| Role | Code | Permissions |
|------|------|-------------|
| **Administrator** | `ADMIN` | Full system access, user management, audit logs, configuration, master data CRUD |
| **Control Officer** | `CONTROL_OFFICER` | View dashboard, network map, maintenance, run optimization, view/resolve conflicts, run simulations, approve/reject plans |
| **Engineering** | `ENGINEERING` | Create/edit Engineering tasks, view schedules, view relevant conflicts and assets |
| **Signal & Telecom** | `SNT` | Create/edit S&T tasks, view schedules, view relevant conflicts and assets |
| **Traction / OHE** | `TRACTION` | Create/edit Traction/OHE tasks, view schedules, view relevant conflicts and assets |

---

### 3. Core Mathematical Models

#### 3.1 Priority Engine
Every task receives a calculated Priority Score $P \in [0, 100]$:
$$P = 0.35 \times C + 0.25 \times U + 0.20 \times O + 0.20 \times I$$
Where:
- $C$ = Criticality score $[0 - 100]$ based on defect severity (e.g., Rail fracture = 100, Joint bolt loose = 65)
- $U$ = Urgency score $[0 - 100]$ based on proximity to due date
- $O$ = Overdue score $[0 - 100]$: $\min(100, \text{overdue\_days} \times 10)$
- $I$ = Section Operational Impact score $[0 - 100]$ based on track speed, passenger traffic density, and section bottleneck index

**Priority Classifications:**
- $90 - 100$: **CRITICAL** (Red)
- $75 - 89$: **HIGH** (Orange)
- $50 - 74$: **MEDIUM** (Yellow)
- $0 - 49$: **LOW** (Green)

#### 3.2 Coordination Gain & Multi-Department Merging
When tasks from different departments (Engineering, S&T, Traction) require access to the same track section, PATRI checks their safety compatibility matrix:
- **Compatible Matrix**:
  - `ENG_TRACK_RENEWAL` + `SNT_POINT_MACHINE_MAINT` (Compatible with caution)
  - `ENG_TAMPING` + `TRAC_OHE_INSPECTION` (Compatible under OHE power cut window)
  - `SNT_AXLE_COUNTER_TEST` + `ENG_WELD_TEST` (Compatible)
- **Incompatible Matrix**:
  - Deep screening ballasting while high-voltage OHE remains energized without grounding
  - Heavy rail crane replacement during signal cable excavation

**Coordination Gain Formula:**
$$\text{Coordination Gain (Hours)} = \sum \text{Independent Block Durations} - \text{Total Coordinated Block Duration}$$
$$\text{Reduction Percentage} = \frac{\text{Coordination Gain}}{\sum \text{Independent Block Durations}} \times 100\%$$

#### 3.3 Block Efficiency Formula
$$\text{Block Efficiency (\%)} = \frac{\sum_{\text{task} \in \text{Block}} \text{Useful Task Duration}}{\text{Block Allocated Window Duration}} \times 100\%$$

---

### 4. Google OR-Tools CP-SAT Optimization Model

#### 4.1 Variables
For each task $i \in T$ and candidate block window $w \in W$:
- $x_{i,w} \in \{0, 1\}$: Task $i$ scheduled in block window $w$
- $s_w$: Start time of maintenance block $w$ (in integer minutes)
- $e_w$: End time of maintenance block $w$ (in integer minutes)
- $b_w \in \{0, 1\}$: Block window $w$ is activated

#### 4.2 Hard Constraints
1. **Duration Compliance**: For any activated block $w$, $e_w - s_w \ge \max_{i: x_{i,w}=1}(\text{duration}_i)$
2. **Train Separation (Safety Buffer)**: For any scheduled train movement $k$ on section $sec(w)$ with departure/arrival $[t_{k}^{start}, t_{k}^{end}]$:
   $$e_w + \text{Buffer} \le t_{k}^{start} \quad \lor \quad s_w \ge t_{k}^{end} + \text{Buffer}$$
3. **Crew Capacity**: Total crew members demanded in overlapping active blocks for department $d$ cannot exceed total available crew in $d$.
4. **Equipment Exclusivity**: Heavy machinery (e.g., Track Relaying Train, Tower Wagon, Tamping Machine) can only be assigned to one section at any moment.
5. **Locked Tasks**: If task $i$ is locked by a human controller at $(s_i^*, e_i^*)$, this interval is strictly enforced.
6. **Department Compatibility**: Incompatible task pairs cannot be assigned to the same block window.

#### 4.3 Soft Objectives & Penalty Function
Maximize weighted multi-objective utility:
$$Z = w_1 \sum P_i x_{i} - w_2 \sum (\text{TrainDelayRisk}_w) - w_3 \sum (\text{FreightConflictProb}_w) + w_4 \sum (\text{CoordinationGainHours}) - w_5 \sum (\text{UnusedBlockBuffer})$$

Modes:
- **Balanced** (Default): $w_1=0.35, w_2=0.30, w_3=0.15, w_4=0.20$
- **Maximum Asset Availability**: $w_1=0.20, w_2=0.45, w_3=0.20, w_4=0.15$
- **Minimum Train Disruption**: $w_1=0.15, w_2=0.55, w_3=0.20, w_4=0.10$

---

### 5. What-If Simulation Engine
The simulator operates on **non-persistent scenario workspaces**:
1. Clones the current active baseline state (tasks, trains, sections, crews) in-memory.
2. Injects user-specified modifications:
   - Inject emergency express train into section at specific hour
   - Mark a track section as emergency speed restriction (TSR) or unavailable
   - Add urgent maintenance task (e.g. Broken rail weld)
   - Remove crew/machinery due to mechanical failure
3. Solves using OR-Tools CP-SAT in simulation sandbox mode.
4. Computes diff analytics: Delta block hours, delta train delays, delta coordination gain, newly flagged conflicts.
5. Displays side-by-side comparison without altering production schedule.
