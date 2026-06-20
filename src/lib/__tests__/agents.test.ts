import { describe, it, expect } from "vitest"

import {
  analyzerPrompt,
  coachPrompt,
  roleplayPrompt,
  reflectionPrompt,
  reflectionSchema
} from "../agents"

describe("agents", () => {
  it("should export prompts", () => {
    expect(analyzerPrompt).toContain("Social Situation Analyzer")
    expect(coachPrompt).toContain("Social Skills Coach")
    expect(roleplayPrompt).toContain("Roleplay Partner")
    expect(reflectionPrompt).toContain("Reflection Agent")
    expect(reflectionSchema).toBeDefined()
  })
})
