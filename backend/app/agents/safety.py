from typing import Dict, Any

class SafetyConstraintAgent:
    def __init__(self):
        # Hard limits
        self.MIN_FUEL_DAYS = 10
        self.MIN_BATTERY_SOC = 20.0
        self.MAX_WEATHER_RISK = 0.8
        self.REQUIRED_CRITICAL_COVERAGE = 50.0

    def verify_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifies that the recommended plan does not violate any safety constraints.
        """
        rejections = []
        
        logistics = plan["recommended_action"].get("logistics", {})
        energy = plan["recommended_action"].get("energy", {})
        
        # Check logistics recommendation
        if logistics.get("recommendation"):
            rec = logistics["recommendation"]
            if rec.get("risk", 0) > self.MAX_WEATHER_RISK:
                rejections.append(f"Logistics risk {rec['risk']} exceeds maximum allowed ({self.MAX_WEATHER_RISK}).")
            if rec.get("critical_cargo_coverage", 0) < self.REQUIRED_CRITICAL_COVERAGE:
                rejections.append(f"Critical cargo coverage {rec['critical_cargo_coverage']}% is below required ({self.REQUIRED_CRITICAL_COVERAGE}%).")
                
        # If there are rejections, fail the safety check
        if rejections:
            return {
                "safe": False,
                "reasons": rejections,
                "fallback_activated": True
            }
            
        return {
            "safe": True,
            "reasons": [],
            "fallback_activated": False
        }
