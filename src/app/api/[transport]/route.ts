import { createMcpHandler } from "mcp-handler"
import { z } from "zod"

import { TOPICS, type TopicKey, getKnowledgeMany, listTopics } from "@/lib/knowledge"

/**
 * MCP server for the social-skills-coach knowledge base.
 *
 * Exposes the Agent Skill (`skills/social-skills-coach/`) over the Model Context
 * Protocol so any MCP client — this app's orchestrator, MCP Inspector, or Claude
 * Desktop — can pull the curriculum. Two read-only tools, no auth (the content is
 * static reference material, no secrets, no side effects).
 *
 * Route is `app/api/[transport]/route.ts` with basePath `/api`, so the streamable
 * HTTP endpoint resolves to `/api/mcp`. The static `/api/chat` route takes
 * precedence over this dynamic segment, so there is no collision.
 */

const topicKeys = Object.keys(TOPICS) as [TopicKey, ...TopicKey[]]

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_social_topics",
      {
        description:
          "List every social-skills curriculum topic (key + description) available from the social-skills-coach knowledge base. Call this first to discover valid topic keys for get_social_knowledge.",
        inputSchema: {}
      },
      () => ({
        content: [{ type: "text", text: JSON.stringify(listTopics(), null, 2) }]
      })
    )

    server.registerTool(
      "get_social_knowledge",
      {
        description:
          "Fetch the verbatim curriculum slice(s) for the given topic key(s) and return them concatenated. Use list_social_topics to discover valid keys.",
        inputSchema: {
          topics: z
            .array(z.enum(topicKeys))
            .min(1)
            .describe("One or more topic keys to fetch, e.g. ['opening', 'social-errors']")
        }
      },
      ({ topics }) => ({
        content: [{ type: "text", text: getKnowledgeMany(topics) }]
      })
    )
  },
  {
    serverInfo: { name: "social-skills-coach", version: "1.0.0" }
  },
  {
    // basePath "/api" + [transport]="mcp" -> streamable HTTP endpoint at /api/mcp.
    basePath: "/api",
    // SSE was removed from the MCP spec (2025-03-26); serve streamable HTTP only.
    disableSse: true,
    maxDuration: 60
  }
)

export { handler as GET, handler as POST, handler as DELETE }
