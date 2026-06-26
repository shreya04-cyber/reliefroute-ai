class TriageAgent:
    def __init__(self):
        self.name = "Triage Agent"

    def calculate_urgency(self, request: dict, is_duplicate: bool) -> float:
        """Computes urgency triage score (1.0 to 10.0) based on categories and vulnerabilities."""
        score = 4.0 # Base priority score
        
        cat = request.get("category", "food")
        if cat in ["medical", "rescue"]:
            score += 3.0
        elif cat == "water":
            score += 1.5
            
        # Vulnerabilities weighting
        vulnerable = request.get("vulnerable", {})
        if vulnerable.get("elderly"): score += 1.0
        if vulnerable.get("children"): score += 1.0
        if vulnerable.get("disability"): score += 1.0
        if vulnerable.get("pregnancy"): score += 1.5
        
        # Text analysis keywords
        desc = request.get("urgencyDescription", "").lower()
        critical_keywords = ["trapped", "drowning", "suffocating", "labor", "insulin", "heart", "oxygen", "bleeding", "unconscious", "stroke"]
        warning_keywords = ["rising", "no food", "starving", "contaminated", "disabled", "infant", "newborn", "freezing"]
        
        for kw in critical_keywords:
            if kw in desc:
                score += 1.5
                break
        for kw in warning_keywords:
            if kw in desc:
                score += 0.8
                break
                
        if is_duplicate:
            score = max(1.0, score - 3.5)
            
        return min(10.0, round(score, 1))
