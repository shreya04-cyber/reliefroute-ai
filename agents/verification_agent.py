import math

class VerificationAgent:
    def __init__(self):
        self.name = "Verification Agent"

    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine formula to compute distance in km between two lat/lng points."""
        R = 6371.0 # Earth radius
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(d_lon / 2) ** 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def perform_checks(self, new_request: dict, existing_requests: list) -> dict:
        """Runs duplicate detection against existing active requests."""
        duplicate_of = None
        
        n_lat = new_request.get("location", {}).get("lat", 22.54)
        n_lng = new_request.get("location", {}).get("lng", 88.35)
        n_phone = new_request.get("phone", "")
        n_cat = new_request.get("category", "")
        
        for req in existing_requests:
            if req.get("status") == "rejected":
                continue
                
            # Check phone match
            phone_match = n_phone and req.get("phone") == n_phone
            
            # Check proximity + category match
            r_lat = req.get("location", {}).get("lat", 0)
            r_lng = req.get("location", {}).get("lng", 0)
            dist = self._calculate_distance(n_lat, n_lng, r_lat, r_lng)
            prox_match = (req.get("category") == n_cat) and (dist < 0.25) # Within 250m
            
            if phone_match or prox_match:
                duplicate_of = req.get("id")
                break
                
        confidence = 38 if duplicate_of else 95
        return {
            "duplicateOf": duplicate_of,
            "verificationConfidence": confidence
        }
