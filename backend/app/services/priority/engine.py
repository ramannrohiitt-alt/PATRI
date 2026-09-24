from typing import Tuple

class PriorityEngine:
    """
    PATRI Priority Engine
    Calculates composite priority score:
    P = 0.35 * C + 0.25 * U + 0.20 * O + 0.20 * I
    
    Replaceable interface to support XGBoost machine learning model in future releases.
    """
    
    W_CRITICALITY = 0.35
    W_URGENCY = 0.25
    W_OVERDUE = 0.20
    W_IMPACT = 0.20

    @classmethod
    def calculate_score(
        cls,
        criticality: float,
        urgency: float,
        overdue_days: int,
        impact: float
    ) -> Tuple[float, str]:
        """
        Calculate score and return (priority_score, priority_category)
        """
        # Normalize inputs
        c = max(0.0, min(100.0, float(criticality)))
        u = max(0.0, min(100.0, float(urgency)))
        o = max(0.0, min(100.0, float(overdue_days) * 10.0))
        i = max(0.0, min(100.0, float(impact)))

        score = (cls.W_CRITICALITY * c) + (cls.W_URGENCY * u) + (cls.W_OVERDUE * o) + (cls.W_IMPACT * i)
        score = round(max(0.0, min(100.0, score)), 1)

        if score >= 90.0:
            category = "CRITICAL"
        elif score >= 75.0:
            category = "HIGH"
        elif score >= 50.0:
            category = "MEDIUM"
        else:
            category = "LOW"

        return score, category

priority_engine = PriorityEngine()
