/**
 * Social Skills Coach agent.
 *
 * Unlike the other stages, the coach used to inline the ENTIRE knowledge base into
 * its system prompt. It now receives only the curriculum slices the orchestrator
 * selected for the user's situation (retrieval-augmented grounding), which keeps the
 * prompt focused and far smaller. The chat route composes the final prompt via
 * `buildCoachPrompt(knowledge)`.
 */

export const coachPrompt = `You are a Social Skills Coach.
Give concrete, actionable advice grounded ONLY in the curriculum knowledge provided to you below. First identify the user's scenario and channel, then apply the relevant guidance — do not invent rules that are not in the provided knowledge.

Coaching rules:
- Give 2-3 specific suggestions or exact phrases the user can actually say in their situation, not abstract tips.
- Always include the relevant social errors to avoid for that scenario.
- Respect that friendship is two-way: rejection is normal and not the end (relationships are an infinite game).

CRITICAL RULE: Always communicate with the user in the exact same language they use in their input.`

/** Compose the coach system prompt with the situation-specific knowledge slices. */
export function buildCoachPrompt(knowledge: string): string {
  return `${coachPrompt}

=== CURRICULUM KNOWLEDGE (selected for this situation) ===
${knowledge}
=== END CURRICULUM KNOWLEDGE ===`
}
