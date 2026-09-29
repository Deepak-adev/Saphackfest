from typing import Dict, Any, List
from app.optimization.logistics_solver import LogisticsSolver

class LogisticsAgent:
    def __init__(self, db_session):
        self.db = db_session
        self.solver = LogisticsSolver()

    def evaluate_alternatives(self, disruption_scenario: Dict[str, Any]) -> Dict[str, Any]:
        """
        Interacts with the LogisticsSolver to find feasible alternatives.
        """
        # In a real app, query db for LogisticsOption where seasonal_feasibility is True
        # Using simulated DB records for now
        available_options = [
            {"route_id": "RT_PRIMARY", "mode": "Ship", "capacity": 5000, "base_eta_days": 14, "cost": 100000, "weather_risk_factor": 0.2, "seasonal_feasibility": True},
            {"route_id": "RT_AIR_EMERGENCY", "mode": "Air", "capacity": 100, "base_eta_days": 2, "cost": 500000, "weather_risk_factor": 0.6, "seasonal_feasibility": True},
            {"route_id": "RT_SECONDARY_SHIP", "mode": "Ship", "capacity": 3000, "base_eta_days": 21, "cost": 80000, "weather_risk_factor": 0.3, "seasonal_feasibility": True}
        ]
        
        # If primary is blocked by disruption
        blocked_routes = disruption_scenario.get("logistics_impact", {}).get("routes_blocked", [])
        filtered_options = [opt for opt in available_options if opt["route_id"] not in blocked_routes]
        
        required_capacity = 2500  # simulated demand for critical cargo
        max_acceptable_risk = 0.5
        
        evaluated = self.solver.evaluate_routes(filtered_options, required_capacity, max_acceptable_risk)
        
        # Determine recommendation
        feasible_options = [opt for opt in evaluated if opt["feasible"]]
        
        if not feasible_options:
            return {
                "status": "NO FEASIBLE LOGISTICS REROUTE AVAILABLE",
                "evaluated_options": evaluated,
                "recommendation": None
            }
            
        recommended = feasible_options[0]
        
        return {
            "status": "REROUTE_AVAILABLE",
            "evaluated_options": evaluated,
            "recommendation": recommended
        }
