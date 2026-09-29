import uuid
from typing import List, Dict, Any
from app.schemas.domain import DisruptionEvent, ForecastResult, Scenario

class ScenarioPlanningAgent:
    def __init__(self):
        pass

    def generate_scenarios(self, disruption: DisruptionEvent, forecast: ForecastResult) -> List[Scenario]:
        """
        Generates multiple cascading "what-if" scenarios based on the disruption.
        """
        scenarios = []
        
        # Base Scenario (A) - Direct Impact
        base_scenario = Scenario(
            scenario_id=f"SCN-{str(uuid.uuid4())[:8].upper()}",
            disruption_id=disruption.disruption_id,
            description=f"{disruption.type} continues for {disruption.duration_days} days under normal weather conditions.",
            logistics_impact={"delayed_days": disruption.duration_days, "routes_blocked": ["RT_PRIMARY"]},
            inventory_impact={"MAT_FUEL": max(0, forecast.inventory_depletion_estimates.get("MAT_FUEL", 0) - disruption.duration_days)},
            energy_impact={"diesel_burn_rate": "normal", "renewables": "normal"},
            risk_level="MEDIUM"
        )
        scenarios.append(base_scenario)

        # Extended Scenario (B) - Compounding delay
        extended_delay = disruption.duration_days + 7
        extended_scenario = Scenario(
            scenario_id=f"SCN-{str(uuid.uuid4())[:8].upper()}",
            disruption_id=disruption.disruption_id,
            description=f"{disruption.type} extends to {extended_delay} days.",
            logistics_impact={"delayed_days": extended_delay, "routes_blocked": ["RT_PRIMARY"]},
            inventory_impact={"MAT_FUEL": max(0, forecast.inventory_depletion_estimates.get("MAT_FUEL", 0) - extended_delay)},
            energy_impact={"diesel_burn_rate": "normal", "renewables": "normal"},
            risk_level="HIGH"
        )
        scenarios.append(extended_scenario)
        
        # Worst-Case Scenario (C) - Delay + Low Renewables
        worst_scenario = Scenario(
            scenario_id=f"SCN-{str(uuid.uuid4())[:8].upper()}",
            disruption_id=disruption.disruption_id,
            description=f"{disruption.type} for {disruption.duration_days} days WITH severe weather reducing renewable generation.",
            logistics_impact={"delayed_days": disruption.duration_days, "routes_blocked": ["RT_PRIMARY"]},
            inventory_impact={"MAT_FUEL": max(0, forecast.inventory_depletion_estimates.get("MAT_FUEL", 0) - disruption.duration_days - 5)}, # 5 days penalty
            energy_impact={"diesel_burn_rate": "high", "renewables": "low"},
            risk_level="CRITICAL"
        )
        scenarios.append(worst_scenario)

        return scenarios
