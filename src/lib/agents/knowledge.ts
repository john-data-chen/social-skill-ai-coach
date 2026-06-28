/**
 * Social-skills knowledge — now sourced from the `social-skills-coach` Agent Skill
 * (`skills/social-skills-coach/`). These named exports are a thin adapter so each
 * stage prompt can keep composing the exact slices it needs; the skill markdown is
 * the single source of truth (distilled from the 8-lesson course). The agents reply
 * to the user in the same language the user writes in — enforced by each prompt's
 * CRITICAL RULE, not by the language of this reference material.
 */
import { getKnowledge } from "@/lib/knowledge"

export const FRIENDSHIP = getKnowledge("friendship")
export const OPENING = getKnowledge("opening")
export const CONVERSATION_TRIANGLE = getKnowledge("conversation-triangle")
export const OPEN_CLOSED_Q = getKnowledge("open-closed-questions")
export const SOCIAL_ERRORS = getKnowledge("social-errors")
export const INTEREST_SIGNALS = getKnowledge("interest-signals")
export const ELECTRONIC_COMMS = getKnowledge("electronic-comms")
export const HUMOR = getKnowledge("humor")
export const GROUP_JOIN = getKnowledge("group-join")
export const GROUP_EXIT = getKnowledge("group-exit")
export const HOSTING = getKnowledge("hosting")
export const TWO_WAY_SELF_CHECK = getKnowledge("two-way-self-check")
