from typing import List, Dict, Any

class LogisticsSolver:
    def __init__(self):
        pass

    def evaluate_routes(self, available_routes: List[Dict[str, Any]], required_capacity: float, max_acceptable_risk: float) -> List[Dict[str, Any]]:
        """
        Evaluates and ranks alternative logistics routes.
        Returns a sorted list of feasible options.
        """
        evaluated = []
        
        for route in available_routes:
            # Check hard constraints
            if not route.get("seasonal_feasibility", False):
                continue
            
            # Capacity check
            capacity_coverage = min(100.0, (route.get("capacity", 0) / required_capacity) * 100)
            
            # Objective scoring: lower score is better (cost + delay penalty + risk penalty)
            # Normalize to create a unified score
            cost_score = route.get("cost", 0) / 10000.0
            delay_score = route.get("base_eta_days", 0) * 2.0
            risk_score = route.get("weather_risk_factor", 0) * 50.0
            
            total_penalty = cost_score + delay_score + risk_score
            
            evaluated.append({
                "route_id": route["route_id"],
                "mode": route["mode"],
                "capacity": route["capacity"],
                "critical_cargo_coverage": capacity_coverage,
                "eta_days": route["base_eta_days"],
                "risk": route["weather_risk_factor"],
                "score": total_penalty,
                "feasible": route.get("weather_risk_factor", 1.0) <= max_acceptable_risk and capacity_coverage > 50.0
            })
            
        # Sort by best score (lowest penalty)
        evaluated.sort(key=lambda x: x["score"])
        return evaluated
