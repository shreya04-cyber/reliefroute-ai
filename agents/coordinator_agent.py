import sys
import os

# Adjust path to import other agents
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from intake_agent import IntakeAgent
from privacy_agent import PrivacyAgent
from verification_agent import VerificationAgent
from triage_agent import TriageAgent
from resource_agent import ResourceAgent
from security.audit_logger import AuditLogger

class CoordinatorAgent:
    def __init__(self):
        self.name = "Coordination Agent"
        self.intake = IntakeAgent()
        self.privacy = PrivacyAgent()
        self.verification = VerificationAgent()
        self.triage = TriageAgent()
        self.resource = ResourceAgent()

    def process_new_submission(self, raw_data: dict, existing_requests: list, resources: dict) -> tuple:
        """Coordinates triage by routing request details through the agent pipe."""
        logs = []
        
        # 1. Intake Agent structures the request
        structured = self.intake.process_input(raw_data)
        
        # 2. Verification Agent duplicate check
        verify_data = self.verification.perform_checks(structured, existing_requests)
        is_duplicate = verify_data["duplicateOf"] is not None
        
        if is_duplicate:
            logs.append(AuditLogger.log_event(self.verification.name, f"POTENTIAL DUPLICATE: Matches existing case {verify_data['duplicateOf']}."))
        else:
            logs.append(AuditLogger.log_event(self.verification.name, "Verified request coordinates. Unique incident ticket logged."))
            
        # 3. Privacy Agent masks PII
        masked_request = self.privacy.apply_protection(structured)
        logs.append(AuditLogger.log_event(self.privacy.name, "PII masked. Secured details saved for coordinators."))
        
        # 4. Triage Agent calculates urgency
        urgency_score = self.triage.calculate_urgency(structured, is_duplicate)
        logs.append(AuditLogger.log_event(self.triage.name, f"Urgency triage complete. Score: {urgency_score}/10."))
        
        # 5. Resource Agent matches assets
        matched_resources = []
        reasoning = ""
        recommended_action = "Manual routing recommended."
        
        if is_duplicate:
            reasoning = f"Potential duplicate of {verify_data['duplicateOf']}. Action deferred to primary request."
            recommended_action = f"Flag as DUPLICATE. Merge with Request {verify_data['duplicateOf']}."
        else:
            matched_resources = self.resource.match_resources(structured, resources)
            logs.append(AuditLogger.log_event(self.resource.name, f"Asset allocation complete: {len(matched_resources)} resources matched."))
            
            if matched_resources:
                actions = []
                for res in matched_resources:
                    if res["type"] == "volunteer":
                        actions.append(f"{res['name']} ({res['skill']})")
                    elif res["type"] == "supply":
                        actions.append(f"{res['quantity']}x {res['name']}")
                    elif res["type"] == "shelter":
                        actions.append(f"Shelter space at {res['name']}")
                recommended_action = "Dispatch " + ", ".join(actions) + "."
                reasoning = "Linked closest available responders and inventory."
            else:
                reasoning = "No immediate volunteer or supply assets found inside the coordinate sector."
                
        # Compile final dictionary
        masked_request["aiAnalysis"] = {
            "urgencyScore": urgency_score,
            "verificationConfidence": verify_data["verificationConfidence"],
            "duplicateOf": verify_data["duplicateOf"],
            "recommendedAction": recommended_action,
            "reasoning": reasoning,
            "matchedResources": matched_resources
        }
        
        return masked_request, logs
