import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { analyzerPrompt, coachPrompt, reflectionPrompt, roleplayPrompt } from "@/lib/agents"
import { TOPICS, type TopicKey, getKnowledgeMany, listTopics } from "@/lib/knowledge"

/**
 * Registers the whole social-skills-coach capability on an MCP server so it can be
 * shared by every transport (the hosted Next.js route AND the npm stdio package).
 *
 * Two primitives, by design:
 *  - TOOLS expose the curriculum knowledge (`list_social_topics`,
 *    `get_social_knowledge`) for grounding.
 *  - PROMPTS expose the four coaching agents (analyze / coach / roleplay / reflect).
 *    MCP prompts run on the CONNECTING CLIENT'S model — so anyone can drive the full
 *    coaching loop with their own (more capable) model, and this server needs no API
 *    key and runs no inference itself.
 */
export function registerSocialSkillsMcp(server: McpServer): void {
  const topicKeys = Object.keys(TOPICS) as [TopicKey, ...TopicKey[]]

  // --- Knowledge tools ---------------------------------------------------------
  server.registerTool(
    "list_social_topics",
    {
      description:
        "List every social-skills curriculum topic (key + description). Call this first to discover valid topic keys for get_social_knowledge.",
      inputSchema: {}
    },
    () => ({ content: [{ type: "text", text: JSON.stringify(listTopics(), null, 2) }] })
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
    ({ topics }) => ({ content: [{ type: "text", text: getKnowledgeMany(topics) }] })
  )

  // --- Coaching prompts (executed by the client's own model) -------------------
  server.registerPrompt(
    "analyze_situation",
    {
      title: "Analyze a social situation",
      description: "Structure a social situation (who/what/where, channel, scenario type, goal).",
      argsSchema: { situation: z.string().describe("The social situation to analyze") }
    },
    ({ situation }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${analyzerPrompt}\n\n---\nSituation to analyze:\n${situation}`
          }
        }
      ]
    })
  )

  server.registerPrompt(
    "coach",
    {
      title: "Coach a social situation",
      description: "Give concrete, curriculum-grounded advice for a social situation.",
      argsSchema: { situation: z.string().describe("The social situation to get advice on") }
    },
    ({ situation }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${coachPrompt}\n\nGround your advice by calling the get_social_knowledge tool with the relevant topic keys (discover them via list_social_topics).\n\n---\nSituation:\n${situation}`
          }
        }
      ]
    })
  )

  server.registerPrompt(
    "roleplay",
    {
      title: "Roleplay a social scenario",
      description:
        "Play the other person so the user can practice; react to their social-skill level.",
      argsSchema: { scenario: z.string().describe("The scenario / context for the roleplay") }
    },
    ({ scenario }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${roleplayPrompt}\n\n---\nScenario / context for this roleplay:\n${scenario}`
          }
        }
      ]
    })
  )

  server.registerPrompt(
    "reflect",
    {
      title: "Reflect on a roleplay",
      description: "Evaluate a roleplay transcript against the social-skills rubric.",
      argsSchema: { transcript: z.string().describe("The roleplay transcript to evaluate") }
    },
    ({ transcript }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${reflectionPrompt}\n\n---\nRoleplay transcript to evaluate:\n${transcript}`
          }
        }
      ]
    })
  )
}
