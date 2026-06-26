import math

class ResourceAgent:
    def __init__(self):
        self.name = "Resource Agent"

    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine formula to compute distance in km between two lat/lng points."""
        R = 6371.0 # Earth radius
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(d_lon / 2) ** 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def match_resources(self, request: dict, resources: dict) -> list:
        """Matches available resources near the request location."""
        category = request.get("category", "")
        n_lat = request.get("location", {}).get("lat", 22.54)
        n_lng = request.get("location", {}).get("lng", 88.35)
        people_affected = int(request.get("peopleAffected", 1))
        
        matched = []
        
        # 1. Match nearest Volunteer with category skill
        skill_req = "logistics"
        if category == "medical":
            skill_req = "medical"
        elif category == "rescue":
            skill_req = "rescue"
        elif category == "sanitation":
            skill_req = "sanitation"
            
        volunteers = resources.get("volunteers", [])
        available_volunteers = [v for v in volunteers if v.get("status") == "available" and v.get("skill") == skill_req]
        
        closest_vol = None
        min_vol_dist = 999.0
        
        for v in available_volunteers:
            v_lat = v.get("location", {}).get("lat", 0)
            v_lng = v.get("location", {}).get("lng", 0)
            dist = self._calculate_distance(n_lat, n_lng, v_lat, v_lng)
            if dist < min_vol_dist:
                min_vol_dist = dist
                closest_vol = v
                
        if closest_vol:
            matched.append({
                "type": "volunteer",
                "id": closest_vol.get("id"),
                "name": closest_vol.get("name"),
                "skill": closest_vol.get("skill"),
                "distance": round(min_vol_dist, 1)
            })
            
        # 2. Match Shelter if category is rescue/shelter
        if category in ["shelter", "rescue"]:
            shelters = resources.get("shelters", [])
            available_shelters = [s for s in shelters if s.get("occupied", 0) < s.get("capacity", 0)]
            closest_shelt = None
            min_shelt_dist = 999.0
            
            for s in available_shelters:
                s_lat = s.get("lat", 0)
                s_lng = s.get("lng", 0)
                dist = self._calculate_distance(n_lat, n_lng, s_lat, s_lng)
                if dist < min_shelt_dist:
                    min_shelt_dist = dist
                    closest_shelt = s
                    
            if closest_shelt:
                matched.append({
                    "type": "shelter",
                    "id": closest_shelt.get("id"),
                    "name": closest_shelt.get("name"),
                    "distance": round(min_shelt_dist, 1)
                })
                
        # 3. Match Supply Kit
        supply_id = None
        if category == "food":
            supply_id = "foodKits"
        elif category == "water":
            supply_id = "waterKits"
        elif category == "medical":
            supply_id = "medicalPacks"
        elif category == "sanitation":
            supply_id = "hygieneKits"
            
        if supply_id:
            supplies = resources.get("supplies", {})
            supply_item = supplies.get(supply_id)
            if supply_item:
                avail_qty = supply_item.get("count", 0) - supply_item.get("allocated", 0)
                if avail_qty >= people_affected:
                    matched.append({
                        "type": "supply",
                        "id": supply_id,
                        "name": supply_item.get("name"),
                        "quantity": people_affected
                    })
                elif avail_qty > 0:
                    matched.append({
                        "type": "supply",
                        "id": supply_id,
                        "name": supply_item.get("name"),
                        "quantity": avail_qty
                    })
                    
        return matched
