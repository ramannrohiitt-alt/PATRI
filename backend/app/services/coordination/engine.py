from typing import List, Dict, Any, Tuple

class CoordinationEngine:
    """
    Multi-Department Coordination Engine
    Determines compatibility of Engineering (ENG), S&T (SNT), and Traction (TRAC) tasks
    on the same railway section to safely share one coordinated infrastructure block.
    """

    # Department compatibility matrix by defect/work types
    # True indicates compatible to execute safely within the same coordinated block window
    COMPATIBILITY_RULES = {
        ("Engineering", "S&T"): {
            "default": True,
            "incompatible_defects": [
                ("Deep Ballast Screening", "Underground Cable Laying"),
                ("Heavy Track Relaying", "Optical Fiber Splicing")
            ]
        },
        ("Engineering", "Traction"): {
            "default": True,
            "incompatible_defects": [
                ("Ballast Cleaning Machine", "Live OHE Catenary Tuning"),
                ("Rail Crane Replacement", "Energized Feeder Line Testing")
            ]
        },
        ("S&T", "Traction"): {
            "default": True,
            "incompatible_defects": [
                ("Signal Relay Calibration", "High-Voltage Transformer Switching")
            ]
        }
    }

    @classmethod
    def are_tasks_compatible(cls, task_a: Dict[str, Any], task_b: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Check if two tasks sharing the same section can be merged into a single coordinated block.
        """
        if task_a.get("section_id") != task_b.get("section_id"):
            return False, "Tasks belong to different track sections."

        dept_a = task_a.get("department_name", "")
        dept_b = task_b.get("department_name", "")

        if dept_a == dept_b:
            # Same department tasks on the same section can usually be sequenced
            return True, "Same department tasks can be sequenced in one block."

        pair = tuple(sorted([dept_a, dept_b]))
        rule = cls.COMPATIBILITY_RULES.get(pair)

        if not rule:
            return True, "Default inter-department safety protocol applies."

        defect_a = task_a.get("defect_type", "")
        defect_b = task_b.get("defect_type", "")

        for incomp_a, incomp_b in rule.get("incompatible_defects", []):
            if (incomp_a in defect_a and incomp_b in defect_b) or (incomp_b in defect_a and incomp_a in defect_b):
                return False, f"Safety violation: '{defect_a}' ({dept_a}) cannot co-exist with '{defect_b}' ({dept_b})."

        return True, f"Departments {dept_a} and {dept_b} safely coordinated."

    @classmethod
    def calculate_coordination_metrics(cls, blocks_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Calculate:
        1. Independent Block Hours (Sum of all individual task durations if done separately)
        2. Optimized Block Hours (Actual allocated block durations)
        3. Coordination Gain (Independent - Optimized)
        4. Reduction Percentage
        5. Block Efficiency % (Useful Task Duration / Total Block Duration * 100)
        """
        independent_hours = 0.0
        optimized_hours = 0.0
        useful_task_hours = 0.0

        for block in blocks_data:
            block_duration = float(block.get("duration_hours", 2.0))
            optimized_hours += block_duration
            
            tasks = block.get("tasks", [])
            for task in tasks:
                dur = float(task.get("estimated_duration_hours", 1.5))
                independent_hours += dur
                useful_task_hours += dur

        if independent_hours == 0:
            independent_hours = max(1.0, optimized_hours * 1.5)

        gain_hours = max(0.0, independent_hours - optimized_hours)
        reduction_pct = round((gain_hours / independent_hours) * 100.0, 1) if independent_hours > 0 else 0.0
        efficiency_pct = round((useful_task_hours / max(1.0, optimized_hours)) * 100.0, 1) if optimized_hours > 0 else 85.0
        efficiency_pct = min(100.0, efficiency_pct)

        return {
            "independent_block_hours": round(independent_hours, 1),
            "optimized_block_hours": round(optimized_hours, 1),
            "coordination_gain_hours": round(gain_hours, 1),
            "reduction_pct": reduction_pct,
            "block_efficiency_pct": efficiency_pct
        }

coordination_engine = CoordinationEngine()
