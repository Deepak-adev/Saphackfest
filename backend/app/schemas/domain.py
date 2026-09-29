from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DisruptionEvent(BaseModel):
    disruption_id: str
    type: str
    severity: str
    duration_days: int
    affected_shipments: List[str] = []
    affected_stations: List[str] = []
    affected_resources: List[str] = []
    affected_energy_systems: List[str] = []
    immediate_impact: str
    cascading_risk: str

class ForecastRequest(BaseModel):
    station_id: str
    horizon_days: int

class ForecastResult(BaseModel):
    station_id: str
    horizon_days: int
    energy_demand_p50: float
    solar_gen_p50: float
    wind_gen_p50: float
    fuel_consumption_estimated: float
    inventory_depletion_estimates: Dict[str, float]  # material_id -> days remaining

class Scenario(BaseModel):
    scenario_id: str
    disruption_id: str
    description: str
    logistics_impact: Dict[str, Any]
    inventory_impact: Dict[str, Any]
    energy_impact: Dict[str, Any]
    risk_level: str
