import sys
import os

# Adjust path to import security module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from security.pii_masking import mask_name, mask_phone

class PrivacyAgent:
    def __init__(self):
        self.name = "Privacy Agent"

    def apply_protection(self, request: dict) -> dict:
        """Applies PII masking rules to the request dictionary."""
        protected = request.copy()
        protected["maskedName"] = mask_name(request.get("name", ""))
        protected["maskedPhone"] = mask_phone(request.get("phone", ""))
        return protected
