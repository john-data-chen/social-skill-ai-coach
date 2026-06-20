import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Loads curriculum slices from the bundled Agent Skill. The `skill/` directory is
 * copied from the repo's single source of truth at build time (see
 * `scripts/sync-skill.mjs`) and shipped in the npm tarball, so it resolves relative
 * to the compiled file rather than the consumer's working directory.
 */
// ponytail: tsgo (native-preview beta) doesn't yet type `import.meta.url`; it is
// valid ESM and resolved correctly at runtime by tsup/Node. Cast to keep typecheck green.
const moduleUrl = (import.meta as { url: string }).url
const REFS_DIR = join(dirname(fileURLToPath(moduleUrl)), "..", "skill", "references")

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

export function getKnowledge(topic: TopicKey): string {
  const cached = cache.get(topic)
  if (cached !== undefined) {
    return cached
  }
  const value = readFileSync(join(REFS_DIR, `${topic}.md`), "utf-8").trim()
  cache.set(topic, value)
  return value
}

export function getKnowledgeMany(topics: TopicKey[]): string {
  return topics.map(getKnowledge).join("\n\n")
}

export function listTopics(): { key: TopicKey; description: string }[] {
  return (Object.keys(TOPICS) as TopicKey[]).map((key) => ({ key, description: TOPICS[key] }))
}
