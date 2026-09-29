from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Station(Base):
    __tablename__ = "stations"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # Hub, Base
    location = Column(String)
    max_capacity = Column(Float)

class Material(Base):
    __tablename__ = "materials"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Fuel, Food, Medical, etc.
    criticality_level = Column(Integer, default=1)

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id"))
    material_id = Column(String, ForeignKey("materials.id"))
    current_stock = Column(Float, nullable=False)
    safety_stock = Column(Float, nullable=False)
    daily_consumption = Column(Float, nullable=False)
    
    station = relationship("Station")
    material = relationship("Material")

class LogisticsOption(Base):
    __tablename__ = "logistics_options"
    route_id = Column(String, primary_key=True, index=True)
    source = Column(String, ForeignKey("stations.id"))
    destination = Column(String, ForeignKey("stations.id"))
    mode = Column(String)  # Ship, Air
    capacity = Column(Float)
    base_eta_days = Column(Integer)
    cost = Column(Float)
    weather_risk_factor = Column(Float)
    seasonal_feasibility = Column(Boolean, default=True)

class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(String, primary_key=True, index=True)
    route_id = Column(String, ForeignKey("logistics_options.route_id"))
    status = Column(String)  # Planned, In_Transit, Delayed, Rerouted
    cargo_details = Column(JSON)
    expected_arrival = Column(DateTime)
    
    route = relationship("LogisticsOption")

class EnergyState(Base):
    __tablename__ = "energy_state"
    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    battery_soc = Column(Float)
    diesel_reserve = Column(Float)
    solar_gen = Column(Float)
    wind_gen = Column(Float)
    demand_load = Column(Float)

class EnergyForecast(Base):
    __tablename__ = "energy_forecasts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    horizon_hours = Column(Integer)
    p10_gen = Column(Float)
    p50_gen = Column(Float)
    p90_gen = Column(Float)
    expected_demand = Column(Float)

class Disruption(Base):
    __tablename__ = "disruptions"
    id = Column(String, primary_key=True, index=True)
    type = Column(String)
    severity = Column(String)
    affected_entities = Column(JSON)
    duration_days = Column(Integer)
    status = Column(String)

class Scenario(Base):
    __tablename__ = "scenarios"
    id = Column(String, primary_key=True, index=True)
    disruption_id = Column(String, ForeignKey("disruptions.id"))
    description = Column(String)
    logistics_impact = Column(JSON)
    inventory_impact = Column(JSON)
    
    disruption = relationship("Disruption")

class Decision(Base):
    __tablename__ = "decisions"
    id = Column(String, primary_key=True, index=True)
    scenario_id = Column(String, ForeignKey("scenarios.id"))
    recommended_action = Column(JSON)
    ai_reasoning = Column(String)
    status = Column(String, default="Pending")  # Pending, Approved, Rejected

class AuditLog(Base):
    __tablename__ = "audit_log"
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)
    agent_name = Column(String)
    entity_id = Column(String)
    input_data = Column(JSON)
    output_data = Column(JSON)
    status = Column(String)
