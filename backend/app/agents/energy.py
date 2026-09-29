from typing import Dict, Any
from app.optimization.energy_solver import EnergySolver

class IntelligentEnergyManagementAgent:
    def __init__(self, db_session):
        self.db = db_session
        self.solver = EnergySolver()

    def optimize_energy(self, forecast: Any, inventory_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coordinates with forecasting and inventory to optimize the energy mix.
        """
        # Determine if we need to conserve fuel based on inventory gap
        conserve_fuel = False
        if inventory_analysis.get("status") == "RESOURCE_GAP_DETECTED":
            for gap in inventory_analysis.get("gaps", []):
                if gap["material_id"] == "MAT_FUEL":
                    conserve_fuel = True
                    break
                    
        # Extract forecast data
        demand_p50 = forecast.energy_demand_p50
        solar_p50 = forecast.solar_gen_p50
        wind_p50 = forecast.wind_gen_p50
        
        # In a real app, these come from db state
        current_battery_soc = 85.0
        current_fuel_l = 42000.0
        
        # Run optimization
        optimized_mix = self.solver.optimize_energy_mix(
            demand=demand_p50,
            solar=solar_p50,
            wind=wind_p50,
            battery_soc=current_battery_soc,
            fuel_available_l=current_fuel_l,
            conserve_fuel=conserve_fuel
        )
        
        recommendations = []
        if conserve_fuel:
            recommendations.append("Fuel conservation active: Maximizing renewable utilization and relying on battery where safe.")
            if optimized_mix["load_shedding_actions"]:
                recommendations.extend(optimized_mix["load_shedding_actions"])
        else:
            recommendations.append("Normal energy optimization: Maintaining standard loads and battery health.")
            
        return {
            "optimized_mix": optimized_mix,
            "recommendations": recommendations,
            "conserve_fuel_active": conserve_fuel
        }
