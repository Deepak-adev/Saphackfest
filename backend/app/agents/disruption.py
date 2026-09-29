import uuid
from typing import Dict, Any
from app.schemas.domain import DisruptionEvent

class DisruptionSensingAgent:
    def __init__(self):
        pass

    def detect_disruption(self, simulation_input: Dict[str, Any]) -> DisruptionEvent:
        """
        Simulates detecting a disruption based on a trigger payload.
        In a real scenario, this would parse live external signals.
        """
        disruption_type = simulation_input.get("type", "ROUTE_CLOSURE")
        severity = simulation_input.get("severity", "HIGH")
        
        # Determine cascading risks and impacted entities based on the disruption type
        affected_shipments = []
        affected_stations = []
        affected_resources = []
        affected_energy = []
        immediate = "Unknown"
        cascading = "Unknown"
        
        if disruption_type == "ROUTE_CLOSURE":
            affected_shipments = ["SHP_MAITRI_01"]
            affected_stations = ["ST_MAITRI"]
            affected_resources = ["MAT_FUEL", "MAT_FOOD", "MAT_MED"]
            immediate = "Primary resupply route to Maitri is closed due to severe sea ice."
            cascading = "Extended reliance on existing inventory; potential fuel shortage leading to generator risks."
            
        elif disruption_type == "SEVERE_WEATHER":
            affected_stations = ["ST_MAITRI", "ST_BHARATI"]
            affected_energy = ["SOLAR", "WIND"]
            immediate = "Severe blizzard reducing solar generation to 0% and exceeding safe wind turbine speeds."
            cascading = "Increased diesel generator utilization to compensate for renewable loss; accelerated fuel burn."

        disruption_id = f"D-{str(uuid.uuid4())[:8].upper()}"

        return DisruptionEvent(
            disruption_id=disruption_id,
            type=disruption_type,
            severity=severity,
            duration_days=simulation_input.get("duration_days", 14),
            affected_shipments=affected_shipments,
            affected_stations=affected_stations,
            affected_resources=affected_resources,
            affected_energy_systems=affected_energy,
            immediate_impact=immediate,
            cascading_risk=cascading
        )
