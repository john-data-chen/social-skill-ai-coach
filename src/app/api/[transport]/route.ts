import { createMcpHandler } from "mcp-handler"

import { registerSocialSkillsMcp } from "@/lib/mcp/server-setup"

/**
 * Hosted MCP server for the social-skills-coach capability.
 *
 * Exposes knowledge tools + the four coaching agents as MCP prompts (see
 * `registerSocialSkillsMcp`) so any MCP client — MCP Inspector, Claude Desktop, or
 * another agent — can drive the full coaching loop with its OWN model. The same
 * `registerSocialSkillsMcp` core powers the npm stdio package.
 *
 * Route is `app/api/[transport]/route.ts` with basePath `/api`, so the streamable
 * HTTP endpoint resolves to `/api/mcp`. The static `/api/chat` route takes
 * precedence over this dynamic segment, so there is no collision.
 */
const handler = createMcpHandler(
  registerSocialSkillsMcp,
  { serverInfo: { name: "social-skills-coach", version: "1.0.0" } },
  {
    // basePath "/api" + [transport]="mcp" -> streamable HTTP endpoint at /api/mcp.
    basePath: "/api",
    // SSE was removed from the MCP spec (2025-03-26); serve streamable HTTP only.
    disableSse: true,
    maxDuration: 60
  }
)

export { handler as GET, handler as POST, handler as DELETE }
