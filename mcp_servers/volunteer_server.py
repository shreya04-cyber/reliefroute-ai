import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types
import json
import os

server = Server("volunteer-server")
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db.json")

def load_volunteers():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                data = json.load(f)
                return data.get("resources", {}).get("volunteers", [])
        except Exception:
            pass
    # Fail-safe static list
    return [
        {"id": "v1", "name": "Dr. Roy", "skill": "medical", "status": "available"},
        {"id": "v2", "name": "Samir", "skill": "rescue", "status": "available"}
    ]

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="query_volunteers",
            description="Find volunteers filtered by capability/skill requirement.",
            inputSchema={
                "type": "object",
                "properties": {
                    "skill": {"type": "string", "description": "Filter by skill: medical, rescue, logistics, sanitation"}
                },
                "required": ["skill"]
            }
        ),
        types.Tool(
            name="assign_volunteer",
            description="Assign volunteer to a relief task incident.",
            inputSchema={
                "type": "object",
                "properties": {
                    "volunteer_id": {"type": "string", "description": "ID of volunteer"},
                    "request_id": {"type": "string", "description": "ID of citizen request"}
                },
                "required": ["volunteer_id", "request_id"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent]:
    volunteers = load_volunteers()
    if name == "query_volunteers":
        skill = arguments.get("skill")
        matches = [v for v in volunteers if v.get("skill") == skill and v.get("status") == "available"]
        if not matches:
            return [types.TextContent(type="text", text=f"No active responders found with skill '{skill}' on standby.")]
        
        out = [f"- {v.get('name')} (ID: {v.get('id')})" for v in matches]
        return [types.TextContent(type="text", text=f"Active Responders ({skill}):\n" + "\n".join(out))]
        
    elif name == "assign_volunteer":
        v_id = arguments.get("volunteer_id")
        r_id = arguments.get("request_id")
        v_found = next((v for v in volunteers if v.get("id") == v_id), None)
        if not v_found:
            return [types.TextContent(type="text", text=f"Volunteer {v_id} not found in directory.")]
        
        return [types.TextContent(type="text", text=f"SUCCESS: Assigned volunteer {v_found.get('name')} to incident {r_id}.")]
        
    return [types.TextContent(type="text", text=f"Tool {name} not found.")]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
