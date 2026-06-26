import os
from datetime import datetime
import json

class AuditLogger:
    @staticmethod
    def log_event(source: str, message: str) -> dict:
        """Generates a structured log event with timestamp and source."""
        timestamp = datetime.utcnow().isoformat() + "Z"
        log_entry = {
            "timestamp": timestamp,
            "source": source,
            "message": message
        }
        
        # Also print to standard output
        print(f"[{timestamp}] [{source}] {message}")
        return log_entry
