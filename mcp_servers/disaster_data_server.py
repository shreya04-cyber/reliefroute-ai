import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types

server = Server("disaster-data-server")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """List available disaster telemetry tools."""
    return [
        types.Tool(
            name="query_flood_level",
            description="Query live water level telemetry at a given latitude/longitude coordinate.",
            inputSchema={
                "type": "object",
                "properties": {
                    "lat": {"type": "number", "description": "Latitude coordinate"},
                    "lng": {"type": "number", "description": "Longitude coordinate"}
                },
                "required": ["lat", "lng"]
            }
        ),
        types.Tool(
            name="get_active_warnings",
            description="Retrieve meteorological and storm surge warnings from local emergency operations center.",
            inputSchema={"type": "object", "properties": {}}
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent]:
    """Execute disaster telemetry checks."""
    if name == "query_flood_level":
        lat = arguments.get("lat", 22.54)
        lng = arguments.get("lng", 88.35)
        # Mock depth based on proximity to river
        # River passes roughly near lat 22.54 - 22.56
        depth = 0.0
        if 22.52 <= lat <= 22.57 and 88.31 <= lng <= 88.38:
            depth = round(1.2 + (lat - 22.52) * 4.5, 2)
        return [types.TextContent(type="text", text=f"Telemetry report: Water depth at coord ({lat}, {lng}) is {depth} meters.")]
    
    elif name == "get_active_warnings":
        return [types.TextContent(type="text", text="EOC Warning: Category 3 Flash Flood warning remains in effect. Storm surge predicted for low-lying east banks.")]
        
    return [types.TextContent(type="text", text=f"Tool {name} not found.")]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    # If run standalone, execute stdio loop
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
