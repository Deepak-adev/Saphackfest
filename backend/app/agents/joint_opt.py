from typing import Dict, Any, List

class JointResilienceOptimizationEngine:
    def __init__(self, logistics_agent, inventory_agent, energy_agent):
        self.logistics_agent = logistics_agent
        self.inventory_agent = inventory_agent
        self.energy_agent = energy_agent

    def create_coordinated_plan(self, scenario: Any, forecast: Any) -> Dict[str, Any]:
        """
        Coordinates the agents to build a unified recovery plan.
        """
        # 1. Logistics Agent
        logistics_result = self.logistics_agent.evaluate_alternatives({"logistics_impact": scenario.logistics_impact})
        
        # 2. Inventory Agent
        inventory_result = self.inventory_agent.analyze_resource_gap(logistics_result, forecast)
        
        # 3. Energy Agent
        energy_result = self.energy_agent.optimize_energy(forecast, inventory_result)
        
        # 4. Synthesize final plan
        # In a real app, this is where a fast local LLM or rule engine could generate the natural language summary
        
        ai_reasoning = (
            f"The selected plan addresses a {scenario.risk_level} risk disruption. "
            f"Logistics rerouting is {logistics_result['status']}. "
            f"Inventory status is {inventory_result['status']}. "
        )
        
        if logistics_result['status'] == "REROUTE_AVAILABLE":
            ai_reasoning += f"Option {logistics_result['recommendation']['route_id']} was selected because it satisfies capacity constraints with a risk factor of {logistics_result['recommendation']['risk']}. "
        else:
            ai_reasoning += "No feasible logistics options available. Resilience relies entirely on resource conservation. "
            
        if energy_result['conserve_fuel_active']:
            ai_reasoning += "Fuel conservation is active to extend operational runway."
        
        return {
            "recommended_action": {
                "logistics": logistics_result,
                "inventory": inventory_result,
                "energy": energy_result
            },
            "ai_reasoning": ai_reasoning,
            "expected_impact": {
                "critical_inventory_coverage": "92%", # simulated
                "fuel_reserve_days": 28,             # simulated
                "energy_reliability": "99%",         # simulated
                "additional_eta_days": logistics_result.get("recommendation", {}).get("eta_days", 0) if logistics_result.get("recommendation") else "N/A",
                "risk": "LOW" if logistics_result['status'] == "REROUTE_AVAILABLE" else "HIGH"
            }
        }
