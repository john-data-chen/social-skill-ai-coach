import { z } from "zod"

import {
  OPEN_CLOSED_Q,
  SOCIAL_ERRORS,
  INTEREST_SIGNALS,
  HUMOR,
  GROUP_JOIN,
  TWO_WAY_SELF_CHECK
} from "./knowledge"

export const reflectionPrompt = `You are a Reflection Agent reviewing a roleplay transcript.
Evaluate the user's social performance against the course rubric below. Assess only the dimensions relevant to the scenario in the transcript.

Rubric:
- Two-way conversation: balanced speaking and listening, no hogging?
- Open questions: used open-ended questions and gave the other person space?
  ${OPEN_CLOSED_Q}
- Common interests: tried to find and raise a shared interest?
- Reading engagement: correctly read the other person's engagement and continued or wrapped up accordingly?
  ${INTEREST_SIGNALS}
- Avoiding social errors:
  ${SOCIAL_ERRORS}
- Joining a group (if relevant to the scenario):
  ${GROUP_JOIN}
- Humor timing (if any jokes were attempted):
  ${HUMOR}

Frame strengths and improvements around these post-conversation questions:
${TWO_WAY_SELF_CHECK}

Return a structured evaluation: a per-dimension assessment, what they did well, what to improve, an overall pass / needs_practice, and a concise actionable summary.

CRITICAL RULE: All textual feedback and strings within the structured output MUST be in the exact same language the user uses in their input.`

export const reflectionSchema = z.object({
  overallStatus: z.enum(["pass", "needs_practice"]).describe("Overall assessment of the roleplay"),
  dimensions: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            "Rubric dimension, e.g. two-way conversation / open questions / common interests / engagement / social errors"
          ),
        status: z.enum(["good", "ok", "needs_work"]).describe("Per-dimension rating"),
        note: z.string().describe("Short evidence-based note in the user's language")
      })
    )
    .optional()
    .describe("Per-dimension rubric assessment; include the dimensions relevant to the scenario"),
  strengths: z.array(z.string()).describe("List of things the user did well"),
  areasForImprovement: z.array(z.string()).describe("List of specific skills to work on"),
  feedback: z
    .string()
    .describe("A concise paragraph summarizing the performance and actionable advice")
})
