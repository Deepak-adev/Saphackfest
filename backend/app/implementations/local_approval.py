from typing import Dict, Any
from app.interfaces.approval import ApprovalProvider
from sqlalchemy.orm import Session
from app.models.domain import Decision

class LocalApprovalProvider(ApprovalProvider):
    def __init__(self, db_session: Session):
        self.db = db_session

    def trigger_approval_workflow(self, decision_id: str, plan: Dict[str, Any]) -> str:
        # In Phase 1, it simply relies on the frontend modal pulling the Pending decision
        return "LOCAL_WORKFLOW_TRIGGERED"
        
    def process_approval(self, decision_id: str, action: str, modified_plan: Dict[str, Any] = None) -> bool:
        decision = self.db.query(Decision).filter(Decision.id == decision_id).first()
        if not decision:
            return False
            
        if action == "APPROVE":
            decision.status = "Approved"
        elif action == "REJECT":
            decision.status = "Rejected"
        elif action == "MODIFY" and modified_plan:
            decision.status = "Modified"
            decision.recommended_action = modified_plan
            
        self.db.commit()
        return True
