from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="POLARRESILIENCE AI API",
    description="Agentic AI for Resilient Antarctic Supply Chain Planning",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel

class SimulateRequest(BaseModel):
    scenario: str

@app.post("/api/simulate")
def simulate_disruption(req: SimulateRequest):
    # Dummy DB session
    db_session = None
    
    from app.agents.logistics import LogisticsAgent
    from app.agents.inventory import InventoryAgent
    from app.agents.energy import EnergyAgent
    from app.agents.joint_opt import JointResilienceOptimizationEngine
    
    logistics_agent = LogisticsAgent(db_session)
    inventory_agent = InventoryAgent(db_session)
    energy_agent = EnergyAgent(db_session)
    
    engine = JointResilienceOptimizationEngine(logistics_agent, inventory_agent, energy_agent)
    
    # Create dummy scenario object based on frontend selection
    class DummyScenario:
        def __init__(self, scenario_str):
            self.risk_level = "HIGH"
            if scenario_str == 'no-reroute':
                self.logistics_impact = {"routes_blocked": ["RT_PRIMARY", "RT_AIR_EMERGENCY", "RT_SECONDARY_SHIP"]}
            else:
                self.logistics_impact = {"routes_blocked": ["RT_PRIMARY"]}
    
    class DummyForecast:
        pass
        
    scenario_obj = DummyScenario(req.scenario)
    forecast_obj = DummyForecast()
    
    plan = engine.create_coordinated_plan(scenario_obj, forecast_obj)
    
    return {"status": "success", "plan": plan}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

