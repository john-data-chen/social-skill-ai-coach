import { generateObject, type LanguageModel } from "ai"
import { z } from "zod"

import { TOPICS, type TopicKey, getKnowledgeMany } from "@/lib/knowledge"

/**
 * Server-only orchestration for the coaching pipeline.
 *
 * Stage routing stays deterministic and client-safe in `router.ts` (the UI also
 * exposes the four stages as tabs). The orchestration value the LLM adds here is
 * retrieval-augmented grounding for the Coach: pick the curriculum topics most
 * relevant to the user's situation, then read just those slices from the
 * `social-skills-coach` skill in-process. This module imports the fs-backed
 * knowledge loader, so it must only be used server-side (the chat route).
 */

const topicKeys = Object.keys(TOPICS) as [TopicKey, ...TopicKey[]]

const topicSelectionSchema = z.object({
  topics: z
    .array(z.enum(topicKeys))
    .min(1)
    .max(5)
    .describe("The most relevant curriculum topic keys for this situation, most relevant first")
})

const SELECTOR_SYSTEM = `You are the knowledge router for a social-skills coach.
Given the user's social situation, choose the 1-5 curriculum topics whose guidance is
most relevant for coaching them (most relevant first). Pick only what genuinely
applies — do not select everything.

Available topics:
${Object.entries(TOPICS)
  .map(([key, desc]) => `- ${key}: ${desc}`)
  .join("\n")}`

/**
 * Broadly-useful core slices for when topic selection is unavailable (e.g. a model
 * without structured-output support, or a transient failure). Keeps the Coach
 * grounded rather than ungrounded.
 */
export const FALLBACK_TOPICS: TopicKey[] = [
  "opening",
  "conversation-triangle",
  "open-closed-questions",
  "social-errors",
  "interest-signals"
]

/** LLM-select the curriculum topics relevant to the user's situation. */
export async function selectKnowledgeTopics(
  model: LanguageModel,
  situation: string
): Promise<TopicKey[]> {
  if (!situation.trim()) {
    return FALLBACK_TOPICS
  }
  try {
    const { object } = await generateObject({
      model,
      schema: topicSelectionSchema,
      system: SELECTOR_SYSTEM,
      prompt: situation
    })
    return object.topics
  } catch {
    return FALLBACK_TOPICS
  }
}

/** Read the selected curriculum slices from the skill, concatenated. */
export function groundingFor(topics: TopicKey[]): string {
  return getKnowledgeMany(topics)
}
