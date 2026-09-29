from typing import Dict, Any, List

class InventoryResilienceAgent:
    def __init__(self, db_session):
        self.db = db_session

    def analyze_resource_gap(self, logistics_evaluation: Dict[str, Any], forecast: Any) -> Dict[str, Any]:
        """
        Analyzes the resource gap based on current inventory, forecasted burn rates, and logistics delays.
        """
        # Extract forecast estimates
        inventory_estimates = forecast.inventory_depletion_estimates
        
        # Extract logistics delay if a reroute is chosen
        if logistics_evaluation["status"] == "REROUTE_AVAILABLE":
            eta_days = logistics_evaluation["recommendation"]["eta_days"]
        else:
            # If no route is available, we assume a severe delay (e.g. 30 days) before intervention is possible
            eta_days = 30
            
        gaps = []
        recommendations = []
        
        for material, days_remaining in inventory_estimates.items():
            if days_remaining < eta_days:
                gap_days = eta_days - days_remaining
                gaps.append({
                    "material_id": material,
                    "gap_days": gap_days,
                    "criticality": "HIGH"
                })
                
                if material == "MAT_FUEL":
                    recommendations.append("Activate resource conservation. Trigger energy optimization for fuel preservation.")
                elif material == "MAT_FOOD":
                    recommendations.append("Protect critical inventory. Delay non-critical allocations.")
                elif material == "MAT_MED":
                    recommendations.append("Preserve emergency medical reserves.")
                    
        if not gaps:
            status = "HEALTHY"
            recommendations.append("Inventory is sufficient to cover the logistics ETA.")
        else:
            status = "RESOURCE_GAP_DETECTED"
            
        return {
            "status": status,
            "gaps": gaps,
            "recommendations": list(set(recommendations))
        }
