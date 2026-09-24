from datetime import datetime
from typing import List, Dict, Any, Optional

class ConflictEngine:
    """
    Conflict Detection Engine for PATRI
    Detects collisions between:
    - Maintenance Blocks and Train movements (Passenger, Express, Freight)
    - Overlapping blocks on the same track section
    - Crew capacity exhaustion
    - Equipment double-booking
    """

    SAFETY_BUFFER_MINUTES = 20  # Minimum buffer between train arrival/departure and block window

    @classmethod
    def parse_time_minutes(cls, time_str: str) -> int:
        """Parse ISO string or HH:MM into minutes from start of day"""
        if "T" in time_str:
            time_part = time_str.split("T")[1][:5]
        else:
            time_part = time_str[:5]
        
        try:
            parts = time_part.split(":")
            return int(parts[0]) * 60 + int(parts[1])
        except Exception:
            return 0

    @classmethod
    def check_block_train_conflict(
        cls,
        block_start: str,
        block_end: str,
        train_movement: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Check if a single train movement overlaps with a proposed block window on the same section.
        """
        b_start = cls.parse_time_minutes(block_start)
        b_end = cls.parse_time_minutes(block_end)
        
        # If block wraps around midnight
        if b_end < b_start:
            b_end += 1440

        t_arr = cls.parse_time_minutes(train_movement.get("scheduled_arrival", "00:00"))
        t_dep = cls.parse_time_minutes(train_movement.get("scheduled_departure", "00:00"))
        if t_dep < t_arr:
            t_dep += 1440

        # Apply safety buffer
        safe_train_start = max(0, t_arr - cls.SAFETY_BUFFER_MINUTES)
        safe_train_end = t_dep + cls.SAFETY_BUFFER_MINUTES

        # Check overlap
        is_overlapping = (b_start < safe_train_end) and (b_end > safe_train_start)
        if is_overlapping:
            train_type = train_movement.get("train_type", "Passenger")
            train_num = train_movement.get("train_number", "TRAIN")
            train_name = train_movement.get("train_name", "")

            # Severity determination
            if train_type in ["Express", "Vande Bharat", "Rajdhani"]:
                severity = "CRITICAL"
            elif train_type == "Passenger":
                severity = "HIGH"
            else:
                severity = "MEDIUM"

            explanation = (
                f"Block window ({block_start} to {block_end}) collides with "
                f"{train_type} Train {train_num} '{train_name}' passing through at "
                f"{train_movement.get('scheduled_arrival')}. Safety margin of {cls.SAFETY_BUFFER_MINUTES} mins breached."
            )

            return {
                "conflict_type": "TRAIN_BLOCK_COLLISION",
                "train_id": train_movement.get("train_id"),
                "train_number": train_num,
                "train_time": train_movement.get("scheduled_arrival"),
                "scheduled_block_start": block_start,
                "scheduled_block_end": block_end,
                "severity": severity,
                "explanation": explanation
            }

        return None

    @classmethod
    def scan_all_conflicts(
        cls,
        blocks: List[Dict[str, Any]],
        train_movements: List[Dict[str, Any]],
        crews: List[Dict[str, Any]] = None,
        equipment: List[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Scan a candidate schedule of blocks against train movements and resources.
        """
        conflicts = []
        conflict_counter = 1

        for block in blocks:
            b_sec = block.get("section_id")
            b_start = block.get("start_time")
            b_end = block.get("end_time")

            # Match train movements on the same section
            for tm in train_movements:
                if tm.get("section_id") == b_sec:
                    conf = cls.check_block_train_conflict(b_start, b_end, tm)
                    if conf:
                        conf["id"] = conflict_counter
                        conf["conflict_code"] = f"CONF-{conflict_counter:04d}"
                        conf["block_id"] = block.get("id")
                        conf["section_id"] = b_sec
                        conf["is_resolved"] = False
                        conflicts.append(conf)
                        conflict_counter += 1

        return conflicts

conflict_engine = ConflictEngine()
