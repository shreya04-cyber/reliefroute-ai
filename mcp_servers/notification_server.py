import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types

server = Server("notification-server")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="send_alert",
            description="Send a simulated SMS/WhatsApp dispatch alert to a citizen or field responder.",
            inputSchema={
                "type": "object",
                "properties": {
                    "recipient_phone": {"type": "string", "description": "Destination contact number"},
                    "message": {"type": "string", "description": "Text message content"}
                },
                "required": ["recipient_phone", "message"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent]:
    if name == "send_alert":
        phone = arguments.get("recipient_phone")
        msg = arguments.get("message")
        return [types.TextContent(type="text", text=f"NOTIFICATION DISPATCHED: Sent SMS alert to {phone} containing message: '{msg}'")]
        
    return [types.TextContent(type="text", text=f"Tool {name} not found.")]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
