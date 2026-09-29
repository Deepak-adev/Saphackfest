from typing import Dict, Any

class EnergySolver:
    def __init__(self):
        pass

    def optimize_energy_mix(self, demand: float, solar: float, wind: float, battery_soc: float, fuel_available_l: float, conserve_fuel: bool = False) -> Dict[str, Any]:
        """
        Determines the optimal energy mix to minimize fuel consumption while meeting demand.
        If conserve_fuel is True, it activates tiered load shedding to stretch fuel.
        """
        # Tiered loads (simulated percentage of total demand)
        tier1_load = demand * 0.5   # Critical
        tier2_load = demand * 0.3   # Essential
        tier3_load = demand * 0.2   # Non-essential
        
        load_shedding = []
        active_demand = demand
        
        if conserve_fuel:
            # Shed Tier 3
            active_demand -= tier3_load
            load_shedding.append("Tier 3 (Non-essential) load curtailed.")
            
            # If fuel is critically low and renewables are poor, we might even shed Tier 2
            if (solar + wind) < (tier1_load * 0.5) and fuel_available_l < 5000:
                active_demand -= tier2_load
                load_shedding.append("Tier 2 (Essential) load curtailed to preserve emergency reserves.")
                
        # Calculate generation
        renewable_total = solar + wind
        battery_contribution = 0.0
        diesel_contribution = 0.0
        
        net_demand = active_demand - renewable_total
        
        if net_demand > 0:
            # Try battery first if SOC > 20%
            if battery_soc > 20.0:
                available_battery_kw = (battery_soc - 20.0) * 10 # 10 kW per % as a simulation factor
                if available_battery_kw >= net_demand:
                    battery_contribution = net_demand
                    net_demand = 0
                else:
                    battery_contribution = available_battery_kw
                    net_demand -= available_battery_kw
                    
            # Remainder from diesel
            diesel_contribution = net_demand
            
        elif net_demand < 0:
            # Excess renewables, charge battery
            excess = abs(net_demand)
            # simulate charging logic here
            pass
            
        return {
            "target_demand": active_demand,
            "solar_utilized": solar,
            "wind_utilized": wind,
            "battery_utilized": battery_contribution,
            "diesel_utilized": diesel_contribution,
            "load_shedding_actions": load_shedding,
            "status": "OPTIMIZED"
        }
