from abc import ABC, abstractmethod
from typing import Dict, Any

class ApprovalProvider(ABC):
    @abstractmethod
    def trigger_approval_workflow(self, decision_id: str, plan: Dict[str, Any]) -> str:
        """
        Triggers an external or internal approval workflow.
        Returns a tracking ID or status.
        """
        pass
    
    @abstractmethod
    def process_approval(self, decision_id: str, action: str, modified_plan: Dict[str, Any] = None) -> bool:
        """
        Processes APPROVE, REJECT, MODIFY
        """
        pass
