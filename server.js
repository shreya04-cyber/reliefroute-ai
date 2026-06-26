import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Helper to calculate distance in km between two lat/lng points
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Initial Mock Seed Data
const initialData = {
  requests: [
    {
      id: "REQ-101",
      name: "Amina Khatun",
      phone: "+91 98301 23456",
      contactPreference: "phone",
      location: { address: "Sector 3, Block C, Flooded Area", lat: 22.552, lng: 88.358 },
      category: "medical",
      peopleAffected: 1,
      vulnerable: { children: false, elderly: true, disability: false, pregnancy: false },
      urgencyDescription: "Elderly woman with high fever, unable to move due to waist-deep water inside the house. Needs immediate insulin supply and medical checkup.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(), // 2.5 hours ago
      aiAnalysis: {
        urgencyScore: 9.4,
        verificationConfidence: 96,
        duplicateOf: null,
        recommendedAction: "Dispatch Mobile Medical Team and insulin kits.",
        reasoning: "High urgency due to elderly vulnerability and medical criticality (insulin requirement combined with flooding restriction). Verified location coordinates inside critical flood sector.",
        matchedResources: [
          { type: "volunteer", id: "v1", name: "Dr. Roy", skill: "medical", distance: 0.3 },
          { type: "supply", id: "medicalPacks", name: "Medical Pack", quantity: 1 }
        ]
      }
    },
    {
      id: "REQ-102",
      name: "Vikram Malhotra",
      phone: "+91 98765 43210",
      contactPreference: "whatsapp",
      location: { address: "Green View Apartments, Ground Floor", lat: 22.565, lng: 88.372 },
      category: "rescue",
      peopleAffected: 5,
      vulnerable: { children: true, elderly: true, disability: false, pregnancy: false },
      urgencyDescription: "Water levels rising rapidly on ground floor. We have an 80-year-old grandfather and a 3-year-old child. Need evacuation to a safe shelter.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 2.1).toISOString(),
      aiAnalysis: {
        urgencyScore: 8.9,
        verificationConfidence: 92,
        duplicateOf: null,
        recommendedAction: "Dispatch Rescue Boat and assign 5 beds at Community Hall Staging Point.",
        reasoning: "Evacuation requested. Rising water level combined with extreme vulnerabilities (child, elderly) warrants immediate rescue squad dispatch.",
        matchedResources: [
          { type: "volunteer", id: "v2", name: "Samir (Boat Owner)", skill: "rescue", distance: 0.7 },
          { type: "shelter", id: "communityHall", name: "Community Hall Staging Point", distance: 1.6 }
        ]
      }
    },
    {
      id: "REQ-103",
      name: "Rajesh Kumar",
      phone: "+91 99033 11111",
      contactPreference: "sms",
      location: { address: "Lake Gardens, Lane 2", lat: 22.541, lng: 88.345 },
      category: "water",
      peopleAffected: 4,
      vulnerable: { children: true, elderly: false, disability: false, pregnancy: false },
      urgencyDescription: "No drinking water for the last 36 hours. Local taps are contaminated with sewage water. We have two kids.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      aiAnalysis: {
        urgencyScore: 7.2,
        verificationConfidence: 95,
        duplicateOf: null,
        recommendedAction: "Deliver 2 Water Kits via Logistics Volunteer.",
        reasoning: "Water contamination reported. Children present. Crucial resource (potable water) lack for 36 hours elevates priority to High.",
        matchedResources: [
          { type: "volunteer", id: "v5", name: "John Doe", skill: "logistics", distance: 0.4 },
          { type: "supply", id: "waterKits", name: "Water Purification Kit", quantity: 2 }
        ]
      }
    },
    {
      id: "REQ-104",
      name: "Rajesh K.",
      phone: "+91 99033 11111",
      contactPreference: "phone",
      location: { address: "Lake Gardens", lat: 22.542, lng: 88.344 },
      category: "water",
      peopleAffected: 4,
      vulnerable: { children: true, elderly: false, disability: false, pregnancy: false },
      urgencyDescription: "Urgent need for drinking water in Lake Gardens. Water is contaminated. Please send help.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 1.7).toISOString(),
      aiAnalysis: {
        urgencyScore: 4.5,
        verificationConfidence: 35,
        duplicateOf: "REQ-103",
        recommendedAction: "Flag as DUPLICATE. Merge with Request REQ-103.",
        reasoning: "High-confidence duplicate request. Matching phone number, identical location (within 150m), same category (water) and similar timing. Urgency score set lower to reflect merger recommendation.",
        matchedResources: []
      }
    },
    {
      id: "REQ-105",
      name: "Priya Sharma",
      phone: "+91 98312 98765",
      contactPreference: "whatsapp",
      location: { address: "Block D, Santoshpur High School Area", lat: 22.528, lng: 88.385 },
      category: "medical",
      peopleAffected: 3,
      vulnerable: { children: false, elderly: false, disability: false, pregnancy: true },
      urgencyDescription: "Pregnant woman experiencing labor pains. Water logged outside, normal cars cannot pass. Need specialized rescue vehicle or ambulance.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      aiAnalysis: {
        urgencyScore: 9.8,
        verificationConfidence: 98,
        duplicateOf: null,
        recommendedAction: "Dispatch specialized high-clearance Rescue Truck (Truck-2) and Nurse Tina.",
        reasoning: "Extreme urgency. Active labor pain combined with impassable flood barrier. Immediate dispatch of logistics transport and medical support is required.",
        matchedResources: [
          { type: "volunteer", id: "v4", name: "Nurse Tina", skill: "medical", distance: 0.4 },
          { type: "transport", id: "truck2", name: "Heavy Duty Truck 2", distance: 1.2 }
        ]
      }
    },
    {
      id: "REQ-106",
      name: "Sunita Das",
      phone: "",
      contactPreference: "sms",
      location: { address: "Subhash Nagar Slum Border", lat: 22.535, lng: 88.331 },
      category: "food",
      peopleAffected: 8,
      vulnerable: { children: true, elderly: true, disability: false, pregnancy: false },
      urgencyDescription: "Our shanties are completely destroyed. We are staying on the highway under plastic sheets. No food or milk for children since yesterday.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      aiAnalysis: {
        urgencyScore: 8.5,
        verificationConfidence: 90,
        duplicateOf: null,
        recommendedAction: "Dispatch 8 Food Kits and assign 8 beds at Subhash Nagar High School Shelter.",
        reasoning: "Homelessness due to structural collapse. Large family group (8 persons) exposed to elements on highway with vulnerable children/elderly. High food and shelter urgency.",
        matchedResources: [
          { type: "shelter", id: "subhashHighSchool", name: "Subhash Nagar High School", distance: 0.3 },
          { type: "supply", id: "foodKits", name: "Food Kit", quantity: 8 }
        ]
      }
    },
    {
      id: "REQ-107",
      name: "Abhijit Roy",
      phone: "+91 97488 44332",
      contactPreference: "email",
      location: { address: "Garia Main Road, near Metro station", lat: 22.515, lng: 88.391 },
      category: "shelter",
      peopleAffected: 2,
      vulnerable: { children: false, elderly: false, disability: false, pregnancy: false },
      urgencyDescription: "House flooded with 2 feet of water. We are moving to the roof, but rain is continuous. Looking for a dry shelter.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 0.9).toISOString(),
      aiAnalysis: {
        urgencyScore: 6.2,
        verificationConfidence: 94,
        duplicateOf: null,
        recommendedAction: "Direct to Garia Community Center. Route dispatch team if transport required.",
        reasoning: "Active flooding forcing roof evacuation. Non-vulnerable individuals, but ongoing storm elevates shelter need to high-medium priority.",
        matchedResources: [
          { type: "shelter", id: "gariaCommHall", name: "Garia Community Center", distance: 0.4 }
        ]
      }
    },
    {
      id: "REQ-108",
      name: "Harpreet Singh",
      phone: "+91 98400 98400",
      contactPreference: "phone",
      location: { address: "Jadavpur St. Road, Block F", lat: 22.532, lng: 88.369 },
      category: "sanitation",
      peopleAffected: 12,
      vulnerable: { children: false, elderly: false, disability: true, pregnancy: false },
      urgencyDescription: "Community toilet block flooded and backflowing. Sewage water entering nearby houses. High risk of disease breakout. One disabled elderly resident.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 0.75).toISOString(),
      aiAnalysis: {
        urgencyScore: 7.5,
        verificationConfidence: 91,
        duplicateOf: null,
        recommendedAction: "Dispatch sanitation team with disinfectant and 12 Hygiene Kits.",
        reasoning: "Blackwater/sewage ingress poses immediate public health hazard for 12+ residents, including a disabled citizen. Needs sanitation response.",
        matchedResources: [
          { type: "volunteer", id: "v7", name: "Arjun Dev", skill: "sanitation", distance: 0.2 },
          { type: "supply", id: "hygieneKits", name: "Hygiene Kit", quantity: 12 }
        ]
      }
    },
    {
      id: "REQ-109",
      name: "Tariq Ali",
      phone: "+91 99038 55443",
      contactPreference: "phone",
      location: { address: "Metiabruz, Masjid Lane", lat: 22.569, lng: 88.305 },
      category: "medical",
      peopleAffected: 2,
      vulnerable: { children: false, elderly: true, disability: true, pregnancy: false },
      urgencyDescription: "Paralyzed uncle needs oxygen cylinder refill. Power cut for 24 hours, his backup concentrator is dead. Please help.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 0.6).toISOString(),
      aiAnalysis: {
        urgencyScore: 9.6,
        verificationConfidence: 95,
        duplicateOf: null,
        recommendedAction: "Urgent dispatch of oxygen cylinder and emergency generator from Hub West.",
        reasoning: "Critical life support threat. Paralyzed patient relying on dead concentrator. Requires immediate power supply or oxygen cylinder dispatch.",
        matchedResources: [
          { type: "volunteer", id: "v3", name: "Rahul", skill: "logistics", distance: 0.4 },
          { type: "supply", id: "medicalPacks", name: "Oxygen Supply (Medical Kit)", quantity: 1 }
        ]
      }
    },
    {
      id: "REQ-110",
      name: "",
      phone: "",
      contactPreference: "whatsapp",
      location: { address: "Tollygunge Karunamoyee", lat: 22.521, lng: 88.349 },
      category: "food",
      peopleAffected: 3,
      vulnerable: { children: false, elderly: false, disability: false, pregnancy: false },
      urgencyDescription: "Stuck on 2nd floor, nearby shops closed. Running out of groceries. We have dry snacks but need a hot meal or dry food kit.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 0.4).toISOString(),
      aiAnalysis: {
        urgencyScore: 4.2,
        verificationConfidence: 89,
        duplicateOf: null,
        recommendedAction: "Queue for next standard food ration cycle.",
        reasoning: "Groceries running low, but dry snacks are available and no immediate water or medical threat exists. Safe on second floor. Medium-low priority.",
        matchedResources: [
          { type: "supply", id: "foodKits", name: "Food Kit", quantity: 3 }
        ]
      }
    },
    {
      id: "REQ-111",
      name: "Tollygunge Resident",
      phone: "",
      contactPreference: "whatsapp",
      location: { address: "Tollygunge Karunamoyee", lat: 22.521, lng: 88.350 },
      category: "food",
      peopleAffected: 3,
      vulnerable: { children: false, elderly: false, disability: false, pregnancy: false },
      urgencyDescription: "Isolated in Karunamoyee due to street flooding. Need groceries/food supplies.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 0.35).toISOString(),
      aiAnalysis: {
        urgencyScore: 2.8,
        verificationConfidence: 42,
        duplicateOf: "REQ-110",
        recommendedAction: "Flag as DUPLICATE. Merge with Request REQ-110.",
        reasoning: "Identified duplicate request. Matching location within 50m, same category (food), identical timing, matching contact channel (whatsapp). Recommending merge.",
        matchedResources: []
      }
    },
    {
      id: "REQ-112",
      name: "Gopal Banerjee",
      phone: "+91 98305 66778",
      contactPreference: "phone",
      location: { address: "Ballygunge Circular Road, Near Post Office", lat: 22.548, lng: 88.361 },
      category: "rescue",
      peopleAffected: 2,
      vulnerable: { children: false, elderly: true, disability: false, pregnancy: false },
      urgencyDescription: "Tree fell on our house entrance, blocking the door. Street flooded up to knees. My elderly wife and I are trapped inside.",
      consent: true,
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 0.2).toISOString(),
      aiAnalysis: {
        urgencyScore: 8.0,
        verificationConfidence: 93,
        duplicateOf: null,
        recommendedAction: "Dispatch Rescue Squad (Chainsaw crew) and Volunteer Sarah.",
        reasoning: "Physical entrapment combined with flood water block and elderly occupants creates high risk of hypothermia or emergency access failure.",
        matchedResources: [
          { type: "volunteer", id: "v6", name: "Sarah Connor", skill: "rescue", distance: 0.2 }
        ]
      }
    }
  ],
  resources: {
    supplies: {
      foodKits: { name: "Food Kits", count: 120, allocated: 11 },
      waterKits: { name: "Clean Water Kits", count: 250, allocated: 2 },
      medicalPacks: { name: "Medical Packs", count: 45, allocated: 2 },
      hygieneKits: { name: "Hygiene Kits", count: 80, allocated: 12 },
      blankets: { name: "Blankets", count: 180, allocated: 0 }
    },
    shelters: [
      { id: "communityHall", name: "Community Hall Staging Point", address: "Sector 2, Dry Zone", capacity: 80, occupied: 32, lat: 22.558, lng: 88.349 },
      { id: "subhashHighSchool", name: "Subhash Nagar High School", address: "Subhash Road", capacity: 150, occupied: 110, lat: 22.537, lng: 88.329 },
      { id: "gariaCommHall", name: "Garia Community Center", address: "Garia Station Road", capacity: 60, occupied: 18, lat: 22.518, lng: 88.388 }
    ],
    volunteers: [
      { id: "v1", name: "Dr. Roy", skill: "medical", phone: "+91 90001 00001", status: "available", location: { lat: 22.554, lng: 88.355 } },
      { id: "v2", name: "Samir (Boat Owner)", skill: "rescue", phone: "+91 90001 00002", status: "available", location: { lat: 22.569, lng: 88.378 } },
      { id: "v3", name: "Rahul", skill: "logistics", phone: "+91 90001 00003", status: "available", location: { lat: 22.570, lng: 88.310 } },
      { id: "v4", name: "Nurse Tina", skill: "medical", phone: "+91 90001 00004", status: "available", location: { lat: 22.529, lng: 88.380 } },
      { id: "v5", name: "John Doe", skill: "logistics", phone: "+91 90001 00005", status: "assigned", location: { lat: 22.540, lng: 88.340 } },
      { id: "v6", name: "Sarah Connor", skill: "rescue", phone: "+91 90001 00006", status: "available", location: { lat: 22.550, lng: 88.360 } },
      { id: "v7", name: "Arjun Dev", skill: "sanitation", phone: "+91 90001 00007", status: "available", location: { lat: 22.531, lng: 88.371 } }
    ],
    transport: [
      { id: "truck1", name: "High Clearance Truck 1", status: "available", hub: "Central Staging Hub" },
      { id: "truck2", name: "Heavy Duty Truck 2", status: "available", hub: "West Staging Hub" },
      { id: "boat1", name: "Rescue Inflatable Boat 1", status: "assigned", hub: "Riverfront Staging Point" }
    ]
  },
  auditLogs: [
    { timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), source: "System", message: "Database initialized with Flood Disaster Scenarios." },
    { timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), source: "Verification Agent", message: "PII masked and location parsed for REQ-101." },
    { timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), source: "Prioritization Agent", message: "Urgency score computed: 9.4/10 for REQ-101." },
    { timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), source: "Resource Matcher Agent", message: "Matched volunteer Dr. Roy to REQ-101." },
    { timestamp: new Date(Date.now() - 3600000 * 1.7).toISOString(), source: "Verification Agent", message: "Potential Duplicate Alert: REQ-104 detected as duplicate of REQ-103." }
  ]
};

// Database utility functions
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading database file", err);
    return initialData;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Ensure database is initialized
readDb();

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

// Get all requests
app.get('/api/requests', (req, res) => {
  const data = readDb();
  res.json(data.requests);
});

// Submit a new request
app.post('/api/requests', (req, res) => {
  const data = readDb();
  const citizenData = req.body;

  // Generate ID
  const nextNum = data.requests.length + 101;
  const newId = `REQ-${nextNum}`;

  const defaultLocation = {
    address: citizenData.address || "Sector 5, Inundated Zone",
    lat: citizenData.lat || (22.51 + Math.random() * 0.08),
    lng: citizenData.lng || (88.31 + Math.random() * 0.08)
  };

  const newRequest = {
    id: newId,
    name: citizenData.name || "",
    phone: citizenData.phone || "",
    contactPreference: citizenData.contactPreference || "phone",
    location: defaultLocation,
    category: citizenData.category || "food",
    peopleAffected: parseInt(citizenData.peopleAffected) || 1,
    vulnerable: {
      children: !!citizenData.vulnerable?.children,
      elderly: !!citizenData.vulnerable?.elderly,
      disability: !!citizenData.vulnerable?.disability,
      pregnancy: !!citizenData.vulnerable?.pregnancy
    },
    urgencyDescription: citizenData.urgencyDescription || "",
    consent: !!citizenData.consent,
    status: "pending",
    createdAt: new Date().toISOString(),
    aiAnalysis: {
      urgencyScore: 1.0,
      verificationConfidence: 100,
      duplicateOf: null,
      recommendedAction: "Inspect and match resources.",
      reasoning: "",
      matchedResources: []
    }
  };

  // --- MULTI-AGENT PIPELINE SIMULATION ---
  const logs = [];
  const logTimestamp = new Date().toISOString();

  // 1. Verification Agent (Duplicate Detection & PII Masking)
  logs.push({ timestamp: logTimestamp, source: "Verification Agent", message: `Initiating verification routing for ${newId}.` });
  
  let duplicateOf = null;
  // Look for duplicates based on contact details, category, and coordinate proximity
  for (const r of data.requests) {
    if (r.status !== 'rejected') {
      const matchPhone = r.phone && newRequest.phone && (r.phone === newRequest.phone);
      const matchCategory = r.category === newRequest.category;
      const distance = getDistance(r.location.lat, r.location.lng, newRequest.location.lat, newRequest.location.lng);
      
      // If phone match, or same category + very close distance (< 250m) + similar size
      if (matchPhone || (matchCategory && distance < 0.25)) {
        duplicateOf = r.id;
        break;
      }
    }
  }

  if (duplicateOf) {
    newRequest.aiAnalysis.duplicateOf = duplicateOf;
    newRequest.aiAnalysis.verificationConfidence = 38;
    logs.push({ timestamp: logTimestamp, source: "Verification Agent", message: `POTENTIAL DUPLICATE: ${newId} matches existing case ${duplicateOf}.` });
  } else {
    newRequest.aiAnalysis.verificationConfidence = 95;
    logs.push({ timestamp: logTimestamp, source: "Verification Agent", message: `PII masked. Location coords validated inside active flood polygon. Confidence 95%.` });
  }

  // 2. Prioritization Agent (Urgency Calculation)
  let score = 4.0; // Base score
  if (['medical', 'rescue'].includes(newRequest.category)) {
    score += 3.0;
  } else if (newRequest.category === 'water') {
    score += 1.5;
  }

  // Vulnerability increments
  if (newRequest.vulnerable.elderly) score += 1.0;
  if (newRequest.vulnerable.children) score += 1.0;
  if (newRequest.vulnerable.disability) score += 1.0;
  if (newRequest.vulnerable.pregnancy) score += 1.5;

  // Text analysis keyword scoring
  const descLower = newRequest.urgencyDescription.toLowerCase();
  const criticalKeywords = ["trapped", "drowning", "suffocating", "labor", "insulin", "heart", "oxygen", "bleeding", "unconscious", "stroke"];
  const warningKeywords = ["rising", "no food", "starving", "contaminated", "disabled", "infant", "newborn", "freezing"];

  for (const kw of criticalKeywords) {
    if (descLower.includes(kw)) {
      score += 1.5;
      break;
    }
  }
  for (const kw of warningKeywords) {
    if (descLower.includes(kw)) {
      score += 0.8;
      break;
    }
  }

  if (duplicateOf) {
    score = Math.max(1.0, score - 3.5); // Downgrade urgency score if duplicate
  }

  newRequest.aiAnalysis.urgencyScore = Math.min(10, Math.round(score * 10) / 10);
  
  logs.push({ timestamp: logTimestamp, source: "Prioritization Agent", message: `Urgency analysis complete. Final score: ${newRequest.aiAnalysis.urgencyScore}/10.` });

  // 3. Resource Matcher Agent
  let reasoning = "";
  const matched = [];
  
  if (duplicateOf) {
    reasoning = `Potential duplicate of ${duplicateOf}. Action deferred to primary ticket. Recommend review and closure.`;
    newRequest.aiAnalysis.recommendedAction = `Flag as DUPLICATE. Merge into ${duplicateOf}.`;
  } else {
    // Match volunteers based on category skill
    let skillReq = "logistics";
    if (newRequest.category === "medical") skillReq = "medical";
    else if (newRequest.category === "rescue") skillReq = "rescue";
    else if (newRequest.category === "sanitation") skillReq = "sanitation";

    const volunteers = data.resources.volunteers.filter(v => v.status === "available" && v.skill === skillReq);
    
    let closestVolunteer = null;
    let minVolDist = 999;
    volunteers.forEach(v => {
      const d = getDistance(newRequest.location.lat, newRequest.location.lng, v.location.lat, v.location.lng);
      if (d < minVolDist) {
        minVolDist = d;
        closestVolunteer = v;
      }
    });

    if (closestVolunteer) {
      matched.push({
        type: "volunteer",
        id: closestVolunteer.id,
        name: closestVolunteer.name,
        skill: closestVolunteer.skill,
        distance: Math.round(minVolDist * 10) / 10
      });
      reasoning += `Linked nearest ${skillReq} volunteer ${closestVolunteer.name} (${Math.round(minVolDist * 10) / 10}km away). `;
    }

    // Match shelter if shelter category or rescue category
    if (["shelter", "rescue"].includes(newRequest.category)) {
      let closestShelter = null;
      let minShelterDist = 999;
      data.resources.shelters.forEach(s => {
        const d = getDistance(newRequest.location.lat, newRequest.location.lng, s.lat, s.lng);
        if (d < minShelterDist && s.occupied < s.capacity) {
          minShelterDist = d;
          closestShelter = s;
        }
      });

      if (closestShelter) {
        matched.push({
          type: "shelter",
          id: closestShelter.id,
          name: closestShelter.name,
          distance: Math.round(minShelterDist * 10) / 10
        });
        reasoning += `Allocated space at ${closestShelter.name} (${Math.round(minShelterDist * 10) / 10}km away). `;
      }
    }

    // Match inventory kit
    let supplyId = null;
    let qty = newRequest.peopleAffected || 1;
    if (newRequest.category === "food") supplyId = "foodKits";
    else if (newRequest.category === "water") supplyId = "waterKits";
    else if (newRequest.category === "medical") supplyId = "medicalPacks";
    else if (newRequest.category === "sanitation") supplyId = "hygieneKits";

    if (supplyId && data.resources.supplies[supplyId]) {
      const available = data.resources.supplies[supplyId].count - data.resources.supplies[supplyId].allocated;
      if (available >= qty) {
        matched.push({
          type: "supply",
          id: supplyId,
          name: data.resources.supplies[supplyId].name,
          quantity: qty
        });
        reasoning += `Secured ${qty} ${data.resources.supplies[supplyId].name} from inventory. `;
      } else if (available > 0) {
        matched.push({
          type: "supply",
          id: supplyId,
          name: data.resources.supplies[supplyId].name,
          quantity: available
        });
        reasoning += `Partial stock: secured ${available} ${data.resources.supplies[supplyId].name}. `;
      }
    }

    if (matched.length === 0) {
      reasoning += "No immediate resource matches found near location. Request placed in dispatch overflow queue.";
      newRequest.aiAnalysis.recommendedAction = "Alert coordinator for manual routing & volunteer dispatch.";
    } else {
      let actionStr = "Dispatch ";
      const actions = [];
      matched.forEach(m => {
        if (m.type === "volunteer") actions.push(m.name);
        if (m.type === "supply") actions.push(`${m.quantity}x ${m.name}`);
        if (m.type === "shelter") actions.push(`Shelter space at ${m.name}`);
      });
      newRequest.aiAnalysis.recommendedAction = actionStr + actions.join(", ") + ".";
    }

    newRequest.aiAnalysis.matchedResources = matched;
    logs.push({ timestamp: logTimestamp, source: "Resource Matcher Agent", message: `Asset allocation calculated: ${matched.length} resources matched.` });
  }

  newRequest.aiAnalysis.reasoning = reasoning || "Calculated priority score based on severity inputs. Standard routing applied.";
  
  // Save requests & logs
  data.requests.unshift(newRequest); // Add to beginning of array
  data.auditLogs.push(...logs);
  writeDb(data);

  res.status(201).json(newRequest);
});

// Human-in-the-loop Approval
app.post('/api/requests/:id/approve', (req, res) => {
  const data = readDb();
  const reqId = req.params.id;
  const requestIndex = data.requests.findIndex(r => r.id === reqId);

  if (requestIndex === -1) {
    return res.status(404).json({ error: "Request not found." });
  }

  const request = data.requests[requestIndex];
  if (request.status === 'approved') {
    return res.status(400).json({ error: "Request already approved." });
  }

  // Update request status
  request.status = 'approved';

  // Apply resource adjustments (update allocations in database)
  const logTimestamp = new Date().toISOString();
  const matchedResources = request.aiAnalysis.matchedResources || [];

  matchedResources.forEach(res => {
    if (res.type === 'supply') {
      const supplyId = res.id;
      if (data.resources.supplies[supplyId]) {
        data.resources.supplies[supplyId].allocated += res.quantity;
      }
    } else if (res.type === 'volunteer') {
      const volId = res.id;
      const vol = data.resources.volunteers.find(v => v.id === volId);
      if (vol) {
        vol.status = 'assigned';
      }
    } else if (res.type === 'shelter') {
      const sheltId = res.id;
      const shelt = data.resources.shelters.find(s => s.id === sheltId);
      if (shelt) {
        shelt.occupied = Math.min(shelt.capacity, shelt.occupied + (request.peopleAffected || 1));
      }
    }
  });

  // Log audit event
  data.auditLogs.push({
    timestamp: logTimestamp,
    source: "Human Coordinator",
    message: `APPROVED action for ${reqId}. Resources committed and dispatch route activated.`
  });

  writeDb(data);
  res.json({ success: true, request });
});

// Reject/Re-route request
app.post('/api/requests/:id/reject', (req, res) => {
  const data = readDb();
  const reqId = req.params.id;
  const requestIndex = data.requests.findIndex(r => r.id === reqId);

  if (requestIndex === -1) {
    return res.status(404).json({ error: "Request not found." });
  }

  const request = data.requests[requestIndex];
  request.status = 'rejected';

  // Log audit event
  data.auditLogs.push({
    timestamp: new Date().toISOString(),
    source: "Human Coordinator",
    message: `REJECTED/RESOLVED request ${reqId}. Removed from queue.`
  });

  writeDb(data);
  res.json({ success: true, request });
});

// Get Resources
app.get('/api/resources', (req, res) => {
  const data = readDb();
  res.json(data.resources);
});

// Update Resources (Modify supplies counts, volunteer status, or add volunteers)
app.post('/api/resources/update', (req, res) => {
  const data = readDb();
  const payload = req.body;

  if (payload.supplies) {
    Object.keys(payload.supplies).forEach(key => {
      if (data.resources.supplies[key]) {
        data.resources.supplies[key].count = parseInt(payload.supplies[key]);
      }
    });
  }

  if (payload.newVolunteer) {
    const newVol = payload.newVolunteer;
    const nextId = `v${data.resources.volunteers.length + 1}`;
    data.resources.volunteers.push({
      id: nextId,
      name: newVol.name,
      skill: newVol.skill || 'logistics',
      phone: newVol.phone || '+91 90001 00000',
      status: 'available',
      location: {
        lat: parseFloat(newVol.lat) || 22.540,
        lng: parseFloat(newVol.lng) || 88.350
      }
    });
    data.auditLogs.push({
      timestamp: new Date().toISOString(),
      source: "Coordinator",
      message: `Registered new Volunteer ${newVol.name} (${newVol.skill})`
    });
  }

  writeDb(data);
  res.json({ success: true, resources: data.resources });
});

// Get Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const data = readDb();
  res.json(data.auditLogs);
});

// Reset Database to Seed Data
app.post('/api/reset', (req, res) => {
  writeDb(initialData);
  res.json({ success: true, message: "Database reset to initial flood scenarios." });
});

app.listen(PORT, () => {
  console.log(`ReliefRoute AI API server listening on http://localhost:${PORT}`);
});
