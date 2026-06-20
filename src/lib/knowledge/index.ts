/**
 * Runtime loader for the `social-skills-coach` Agent Skill.
 *
 * The skill markdown in `skills/social-skills-coach/` is the single source of
 * truth for the curriculum. This loader reads a topic slice on demand and caches
 * it. It is server-only by construction (uses `node:fs`); the only importers are
 * server code paths (`/api/chat`, `/api/mcp`). On Vercel the skill files ship into
 * the function bundle via `outputFileTracingIncludes` in `next.config.mjs`.
 *
 * ponytail: read from disk + in-memory cache; if Turbopack file tracing ever
 * stops bundling the markdown, switch to a build-time codegen of this map instead.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

const REFS_DIR = join(process.cwd(), "skills", "social-skills-coach", "references")

// Topic key -> short description (mirrors the SKILL.md index, curriculum order).
export const TOPICS = {
  friendship: "Traits of friendship, depth levels, friendship as a two-way choice",
  opening: "Four steps to open, five opener families, the approach sequence",
  "conversation-triangle": "The ask / compliment / share loop that keeps a conversation balanced",
  "open-closed-questions": "Open vs closed questions and the three-follow-ups rule",
  "social-errors": "Errors to avoid, physical boundaries, eye contact, compliments, core mindset",
  "interest-signals": "Reading in-the-moment and longer-term engagement",
  "electronic-comms": "Exchanging contact info, calls, messaging, social media",
  humor: "Humor timing, hidden rules, reading reactions",
  "group-join": "Steps to join an ongoing group conversation",
  "group-exit": "When a group does not accept you: diagnose and exit gracefully",
  hosting: "Planning and hosting a social gathering",
  "two-way-self-check": "Post-conversation reflection questions"
} as const

export type TopicKey = keyof typeof TOPICS

const cache = new Map<TopicKey, string>()

/** Load one curriculum slice verbatim from the skill (cached). */
export function getKnowledge(topic: TopicKey): string {
  let value = cache.get(topic)
  if (value === undefined) {
    value = readFileSync(join(REFS_DIR, `${topic}.md`), "utf-8").trim()
    cache.set(topic, value)
  }
  return value
}

/** Concatenate several slices, in the order requested. */
export function getKnowledgeMany(topics: TopicKey[]): string {
  return topics.map(getKnowledge).join("\n\n")
}

/** List every available topic with its description (for tool discovery). */
export function listTopics(): { key: TopicKey; description: string }[] {
  return (Object.keys(TOPICS) as TopicKey[]).map((key) => ({ key, description: TOPICS[key] }))
}
