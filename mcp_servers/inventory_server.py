import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types
import json
import os

server = Server("inventory-server")
DB_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db.json")

def load_stock():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                data = json.load(f)
                return data.get("resources", {}).get("supplies", {})
        except Exception:
            pass
    # Fail-safe static stock
    return {
        "foodKits": {"name": "Food Kits", "count": 120, "allocated": 11},
        "waterKits": {"name": "Clean Water Kits", "count": 250, "allocated": 2}
    }

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="check_inventory_stock",
            description="Retrieve active and allocated counts for all relief supplies.",
            inputSchema={"type": "object", "properties": {}}
        ),
        types.Tool(
            name="reserve_inventory_kit",
            description="Reserve supply kits for dispatch.",
            inputSchema={
                "type": "object",
                "properties": {
                    "item_id": {"type": "string", "description": "foodKits, waterKits, medicalPacks, hygieneKits, blankets"},
                    "quantity": {"type": "integer", "description": "Number of kits to reserve"}
                },
                "required": ["item_id", "quantity"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent]:
    supplies = load_stock()
    if name == "check_inventory_stock":
        out = []
        for k, v in supplies.items():
            avail = v.get("count", 0) - v.get("allocated", 0)
            out.append(f"{v.get('name')}: {avail} available ({v.get('allocated')} allocated of {v.get('count')} total)")
        return [types.TextContent(type="text", text="\n".join(out))]
    
    elif name == "reserve_inventory_kit":
        item_id = arguments.get("item_id")
        qty = arguments.get("quantity", 1)
        item = supplies.get(item_id)
        if not item:
            return [types.TextContent(type="text", text=f"Item {item_id} not found in inventory stock.")]
        
        avail = item.get("count", 0) - item.get("allocated", 0)
        if avail >= qty:
            return [types.TextContent(type="text", text=f"SUCCESS: Reserved {qty} {item.get('name')}.")]
        return [types.TextContent(type="text", text=f"INSUFFICIENT STOCK: Only {avail} {item.get('name')} available.")]
        
    return [types.TextContent(type="text", text=f"Tool {name} not found.")]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
