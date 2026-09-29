import sys
import os
from datetime import datetime, timedelta

# Add backend to path so we can import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

from app.db.database import SessionLocal, engine
from app.models.domain import Base, Station, Material, Inventory, LogisticsOption, Shipment, EnergyState

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Stations
    stations = [
        Station(id="HUB_CT", name="Cape Town Logistics Hub", type="Hub", location="South Africa", max_capacity=10000),
        Station(id="ST_MAITRI", name="Maitri Research Station", type="Base", location="Antarctica", max_capacity=2000),
        Station(id="ST_BHARATI", name="Bharati Research Station", type="Base", location="Antarctica", max_capacity=2500)
    ]
    
    for station in stations:
        if not db.query(Station).filter_by(id=station.id).first():
            db.add(station)

    # 2. Materials
    materials = [
        Material(id="MAT_FUEL", name="Arctic Diesel", category="Fuel", criticality_level=5),
        Material(id="MAT_FOOD", name="Emergency Rations", category="Food", criticality_level=4),
        Material(id="MAT_MED", name="Medical Supplies", category="Medical", criticality_level=5),
    ]
    
    for material in materials:
        if not db.query(Material).filter_by(id=material.id).first():
            db.add(material)

    db.commit()

    # 3. Inventory
    inventory = [
        Inventory(station_id="ST_MAITRI", material_id="MAT_FUEL", current_stock=42000, safety_stock=20000, daily_consumption=1000), # 42 days
        Inventory(station_id="ST_MAITRI", material_id="MAT_FOOD", current_stock=3800, safety_stock=1500, daily_consumption=100),   # 38 days
        Inventory(station_id="ST_BHARATI", material_id="MAT_FUEL", current_stock=55000, safety_stock=25000, daily_consumption=1200) # ~45 days
    ]
    
    for inv in inventory:
        if not db.query(Inventory).filter_by(station_id=inv.station_id, material_id=inv.material_id).first():
            db.add(inv)

    # 4. Logistics Options
    options = [
        LogisticsOption(route_id="RT_PRIMARY", source="HUB_CT", destination="ST_MAITRI", mode="Ship", capacity=5000, base_eta_days=14, cost=100000, weather_risk_factor=0.2, seasonal_feasibility=True),
        LogisticsOption(route_id="RT_AIR_EMERGENCY", source="HUB_CT", destination="ST_MAITRI", mode="Air", capacity=100, base_eta_days=2, cost=500000, weather_risk_factor=0.6, seasonal_feasibility=True),
        LogisticsOption(route_id="RT_SECONDARY_SHIP", source="HUB_CT", destination="ST_MAITRI", mode="Ship", capacity=3000, base_eta_days=21, cost=80000, weather_risk_factor=0.3, seasonal_feasibility=True)
    ]
    
    for opt in options:
        if not db.query(LogisticsOption).filter_by(route_id=opt.route_id).first():
            db.add(opt)

    # 5. Energy State
    energy = [
        EnergyState(station_id="ST_MAITRI", battery_soc=85.0, diesel_reserve=42000, solar_gen=50.0, wind_gen=120.0, demand_load=150.0),
        EnergyState(station_id="ST_BHARATI", battery_soc=90.0, diesel_reserve=55000, solar_gen=75.0, wind_gen=80.0, demand_load=180.0)
    ]
    
    for st in energy:
        # Just insert new state
        db.add(st)

    db.commit()
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_db()
