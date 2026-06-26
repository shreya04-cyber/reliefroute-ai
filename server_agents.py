from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from datetime import datetime

# Import Python Agents & Security Loggers
from agents.coordinator_agent import CoordinatorAgent
from security.permissions import check_permission
from security.audit_logger import AuditLogger

app = FastAPI(title="ReliefRoute AI - Multi-Agent Triage Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "ReliefRoute AI Triage Backend API",
        "documentation": "/docs"
    }

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db.json")

# Default Mock Data
default_resources = {
    "supplies": {
        "foodKits": { "name": "Food Kits", "count": 120, "allocated": 11 },
        "waterKits": { "name": "Clean Water Kits", "count": 250, "allocated": 2 },
        "medicalPacks": { "name": "Medical Packs", "count": 45, "allocated": 2 },
        "hygieneKits": { "name": "Hygiene Kits", "count": 80, "allocated": 12 },
        "blankets": { "name": "Blankets", "count": 180, "allocated": 0 }
    },
    "shelters": [
        { "id": "communityHall", "name": "Community Hall Staging Point", "address": "Sector 2, Dry Zone", "capacity": 80, "occupied": 32, "lat": 22.558, "lng": 88.349 },
        { "id": "subhashHighSchool", "name": "Subhash Nagar High School", "address": "Subhash Road", "capacity": 150, "occupied": 110, "lat": 22.537, "lng": 88.329 },
        { "id": "gariaCommHall", "name": "Garia Community Center", "address": "Garia Station Road", "capacity": 60, "occupied": 18, "lat": 22.518, "lng": 88.388 }
    ],
    "volunteers": [
        { "id": "v1", "name": "Dr. Roy", "skill": "medical", "phone": "+91 90001 00001", "status": "available", "location": { "lat": 22.554, "lng": 88.355 } },
        { "id": "v2", "name": "Samir (Boat Owner)", "skill": "rescue", "phone": "+91 90001 00002", "status": "available", "location": { "lat": 22.569, "lng": 88.378 } },
        { "id": "v3", "name": "Rahul", "skill": "logistics", "phone": "+91 90001 00003", "status": "available", "location": { "lat": 22.570, "lng": 88.310 } },
        { "id": "v4", "name": "Nurse Tina", "skill": "medical", "phone": "+91 90001 00004", "status": "available", "location": { "lat": 22.529, "lng": 88.380 } },
        { "id": "v5", "name": "John Doe", "skill": "logistics", "phone": "+91 90001 00005", "status": "assigned", "location": { "lat": 22.540, "lng": 88.340 } },
        { "id": "v6", "name": "Sarah Connor", "skill": "rescue", "phone": "+91 90001 00006", "status": "available", "location": { "lat": 22.550, "lng": 88.360 } },
        { "id": "v7", "name": "Arjun Dev", "skill": "sanitation", "phone": "+91 90001 00007", "status": "available", "location": { "lat": 22.531, "lng": 88.371 } }
    ],
    "transport": [
        { "id": "truck1", "name": "High Clearance Truck 1", "status": "available", "hub": "Central Staging Hub" },
        { "id": "truck2", "name": "Heavy Duty Truck 2", "status": "available", "hub": "West Staging Hub" },
        { "id": "boat1", "name": "Rescue Inflatable Boat 1", "status": "assigned", "hub": "Riverfront Staging Point" }
    ]
}

initial_db_content = {
    "requests": [],
    "resources": default_resources,
    "auditLogs": [
        {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "source": "System",
            "message": "Database initialized with Flood Disaster Scenarios (Python agents active)."
        }
    ]
}

def load_db() -> dict:
    if not os.path.exists(DB_FILE):
        # Create it and populate with mock flood files from demo-data if available
        requests_seed = []
        resources_seed = default_resources
        
        # Load from demo-data folder
        demo_req_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demo-data", "requests.json")
        demo_res_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demo-data", "resources.json")
        
        if os.path.exists(demo_req_path):
            try:
                with open(demo_req_path, "r") as f:
                    requests_seed = json.load(f)
            except Exception:
                pass
        if os.path.exists(demo_res_path):
            try:
                with open(demo_res_path, "r") as f:
                    resources_seed = json.load(f)
            except Exception:
                pass
                
        initial_data = {
            "requests": requests_seed,
            "resources": resources_seed,
            "auditLogs": [
                {
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "source": "System",
                    "message": "Database initialized with Flood Scenarios from demo-data seed."
                }
            ]
        }
        save_db(initial_data)
        return initial_data
        
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return initial_db_content

def save_db(data: dict):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

coordinator = CoordinatorAgent()

@app.get("/api/requests")
def get_requests():
    db = load_db()
    return db["requests"]

@app.post("/api/requests")
def create_request(payload: dict = Body(...)):
    db = load_db()
    
    # Calculate next request id
    next_id_num = len(db["requests"]) + 101
    new_id = f"REQ-{next_id_num}"
    
    # Coordinates boundary defaults
    import random
    default_lat = payload.get("lat") or round(22.51 + random.random() * 0.07, 4)
    default_lng = payload.get("lng") or round(88.31 + random.random() * 0.08, 4)
    
    raw_data = payload.copy()
    raw_data["id"] = new_id
    raw_data["location"] = {
        "address": payload.get("address", "Sector 5, Inundated Zone"),
        "lat": default_lat,
        "lng": default_lng
    }
    
    # Route through Coordinator agent workflow pipeline
    processed_request, agent_logs = coordinator.process_new_submission(
        raw_data, db["requests"], db["resources"]
    )
    
    processed_request["id"] = new_id
    processed_request["status"] = "pending"
    processed_request["createdAt"] = datetime.utcnow().isoformat() + "Z"
    
    # Save request and append logs
    db["requests"].insert(0, processed_request)
    db["auditLogs"].extend(agent_logs)
    save_db(db)
    
    return processed_request

@app.post("/api/requests/{req_id}/approve")
def approve_request(req_id: str, role: str = "coordinator"):
    if not check_permission(role, "approve_dispatch"):
        raise HTTPException(status_code=403, detail="Forbidden: insufficient permissions for dispatch action.")
        
    db = load_db()
    req_index = next((i for i, r in enumerate(db["requests"]) if r["id"] == req_id), -1)
    
    if req_index == -1:
        raise HTTPException(status_code=404, detail="Request not found.")
        
    request = db["requests"][req_index]
    if request["status"] == "approved":
        raise HTTPException(status_code=400, detail="Request already approved.")
        
    request["status"] = "approved"
    
    # Commit resources allocations
    matched_resources = request.get("aiAnalysis", {}).get("matchedResources", [])
    for res in matched_resources:
        if res["type"] == "supply":
            supply_id = res["id"]
            if supply_id in db["resources"]["supplies"]:
                db["resources"]["supplies"][supply_id]["allocated"] += res["quantity"]
        elif res["type"] == "volunteer":
            v_id = res["id"]
            for v in db["resources"]["volunteers"]:
                if v["id"] == v_id:
                    v["status"] = "assigned"
        elif res["type"] == "shelter":
            s_id = res["id"]
            for s in db["resources"]["shelters"]:
                if s["id"] == s_id:
                    s["occupied"] = min(s["capacity"], s["occupied"] + request.get("peopleAffected", 1))

    # Log audit event
    log_event = AuditLogger.log_event("Human Coordinator", f"APPROVED action for {req_id}. Dispatch route activated.")
    db["auditLogs"].append(log_event)
    save_db(db)
    
    return {"success": True, "request": request}

@app.post("/api/requests/{req_id}/reject")
def reject_request(req_id: str, role: str = "coordinator"):
    if not check_permission(role, "approve_dispatch"):
        raise HTTPException(status_code=403, detail="Forbidden: insufficient permissions.")
        
    db = load_db()
    req_index = next((i for i, r in enumerate(db["requests"]) if r["id"] == req_id), -1)
    
    if req_index == -1:
        raise HTTPException(status_code=404, detail="Request not found.")
        
    request = db["requests"][req_index]
    request["status"] = "rejected"
    
    # Log audit event
    log_event = AuditLogger.log_event("Human Coordinator", f"REJECTED/RESOLVED request {req_id}. Removed from priority queue.")
    db["auditLogs"].append(log_event)
    save_db(db)
    
    return {"success": True, "request": request}

@app.get("/api/resources")
def get_resources():
    db = load_db()
    return db["resources"]

@app.post("/api/resources/update")
def update_resources(payload: dict = Body(...), role: str = "coordinator"):
    if not check_permission(role, "update_inventory"):
        raise HTTPException(status_code=403, detail="Forbidden: insufficient permissions.")
        
    db = load_db()
    
    if "supplies" in payload:
        for k, v in payload["supplies"].items():
            if k in db["resources"]["supplies"]:
                db["resources"]["supplies"][k]["count"] = int(v)
                
    if "newVolunteer" in payload:
        new_vol = payload["newVolunteer"]
        next_id = f"v{len(db['resources']['volunteers']) + 1}"
        db["resources"]["volunteers"].append({
            "id": next_id,
            "name": new_vol["name"],
            "skill": new_vol.get("skill", "logistics"),
            "phone": new_vol.get("phone", "+91 90000 00000"),
            "status": "available",
            "location": {
                "lat": float(new_vol.get("lat", 22.54)),
                "lng": float(new_vol.get("lng", 88.35))
            }
        })
        log_event = AuditLogger.log_event("Coordinator", f"Registered new Volunteer {new_vol['name']} ({new_vol.get('skill', 'logistics')})")
        db["auditLogs"].append(log_event)
        
    save_db(db)
    return {"success": True, "resources": db["resources"]}

@app.get("/api/audit-logs")
def get_audit_logs():
    db = load_db()
    return db["auditLogs"]

@app.post("/api/reset")
def reset_database():
    # Remove file to force reload from demo-data seeds
    if os.path.exists(DB_FILE):
        try:
            os.remove(DB_FILE)
        except Exception:
            pass
    db = load_db()
    return {"success": True, "message": "Database reset to initial flood scenarios."}

if __name__ == "__main__":
    import uvicorn
    # Load database on start
    load_db()
    uvicorn.run("server_agents:app", host="0.0.0.0", port=8000, reload=True)
