import { describe, it, expect } from "vitest"

import {
  analyzerPrompt,
  coachPrompt,
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
    expect(coachPrompt).toContain(OPENING)
    expect(coachPrompt).toContain(FRIENDSHIP)
    expect(roleplayPrompt).toContain(SOCIAL_ERRORS)
    expect(roleplayPrompt).toContain(HUMOR)
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
      dimensions: [{ name: "two-way conversation", status: "good", note: "balanced speaking and listening" }]
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
