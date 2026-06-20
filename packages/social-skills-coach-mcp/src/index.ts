#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { registerSocialSkillsMcp } from "./server"

// stdio entry point: the form MCP clients (e.g. Claude Desktop) spawn via `npx`.
const server = new McpServer({ name: "social-skills-coach", version: "1.0.0" })
registerSocialSkillsMcp(server)

await server.connect(new StdioServerTransport())
