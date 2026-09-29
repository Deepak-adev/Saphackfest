import json
from datetime import datetime
from typing import Any, Dict
from sqlalchemy.orm import Session
from app.models.domain import AuditLog

class ComplianceAuditAgent:
    def __init__(self, db_session: Session):
        self.db = db_session

    def log_event(self, event_type: str, agent_name: str, entity_id: str, input_data: Any, output_data: Any, status: str = "SUCCESS"):
        """
        Records every important action and decision across the agent chain.
        """
        # Convert to dict if pydantic model, else use as is
        inp = input_data.model_dump() if hasattr(input_data, 'model_dump') else input_data
        outp = output_data.model_dump() if hasattr(output_data, 'model_dump') else output_data

        log_entry = AuditLog(
            timestamp=datetime.utcnow(),
            event_type=event_type,
            agent_name=agent_name,
            entity_id=entity_id,
            input_data=inp,
            output_data=outp,
            status=status
        )
        
        try:
            self.db.add(log_entry)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"Audit log failed: {e}")
