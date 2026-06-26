class IntakeAgent:
    def __init__(self):
        self.name = "Intake Agent"

    def process_input(self, raw_data: dict) -> dict:
        """Parses and structures raw input parameters from the citizen form."""
        vulnerable = raw_data.get("vulnerable", {})
        return {
            "name": raw_data.get("name", "").strip(),
            "phone": raw_data.get("phone", "").strip(),
            "contactPreference": raw_data.get("contactPreference", "phone"),
            "category": raw_data.get("category", "food"),
            "peopleAffected": int(raw_data.get("peopleAffected", 1)),
            "vulnerable": {
                "children": bool(vulnerable.get("children", False)),
                "elderly": bool(vulnerable.get("elderly", False)),
                "disability": bool(vulnerable.get("disability", False)),
                "pregnancy": bool(vulnerable.get("pregnancy", False))
            },
            "urgencyDescription": raw_data.get("urgencyDescription", "").strip(),
            "consent": bool(raw_data.get("consent", False))
        }
