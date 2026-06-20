import { describe, it, expect } from "vitest"

import {
  analyzerPrompt,
  coachPrompt,
  buildCoachPrompt,
  roleplayPrompt,
  reflectionPrompt,
  reflectionSchema,
  FRIENDSHIP,
  OPENING,
  SOCIAL_ERRORS,
  HUMOR
} from "../../src/lib/agents"

describe("agents", () => {
  it("should export prompts", () => {
    expect(analyzerPrompt).toContain("Social Situation Analyzer")
    expect(coachPrompt).toContain("Social Skills Coach")
    expect(roleplayPrompt).toContain("Roleplay Partner")
    expect(reflectionPrompt).toContain("Reflection Agent")
    expect(reflectionSchema).toBeDefined()
  })

  it("composes shared knowledge into the prompts", () => {
    expect(FRIENDSHIP.length).toBeGreaterThan(0)
    expect(roleplayPrompt).toContain(SOCIAL_ERRORS)
    expect(roleplayPrompt).toContain(HUMOR)
  })

  it("coach grounds on injected curriculum knowledge", () => {
    // Coach no longer inlines the whole KB; the route injects selected slices.
    const composed = buildCoachPrompt(`${OPENING}\n\n${FRIENDSHIP}`)
    expect(composed).toContain("Social Skills Coach")
    expect(composed).toContain(OPENING)
    expect(composed).toContain(FRIENDSHIP)
  })
})

describe("reflectionSchema", () => {
  const base = {
    overallStatus: "pass" as const,
    strengths: ["opened proactively"],
    areasForImprovement: ["use more open questions"],
    feedback: "Solid overall."
  }

  it("accepts an object without dimensions (optional)", () => {
    expect(() => reflectionSchema.parse(base)).not.toThrow()
  })

  it("accepts per-dimension rubric entries", () => {
    const parsed = reflectionSchema.parse({
      ...base,
      dimensions: [
        { name: "two-way conversation", status: "good", note: "balanced speaking and listening" }
      ]
    })
    expect(parsed.dimensions?.[0]?.status).toBe("good")
  })

  it("rejects an invalid dimension status", () => {
    expect(() =>
      reflectionSchema.parse({
        ...base,
        dimensions: [{ name: "two-way conversation", status: "bad", note: "x" }]
      })
    ).toThrow()
  })
})
