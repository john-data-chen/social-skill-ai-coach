import { describe, it, expect } from "vitest"

import { advancePipeline, determineNextStage } from "../../src/lib/router"

describe("router", () => {
  it("advancePipeline", () => {
    expect(advancePipeline("analyzer")).toBe("coach")
    expect(advancePipeline("coach")).toBe("roleplay")
    expect(advancePipeline("roleplay")).toBe("reflection")
    expect(advancePipeline("reflection")).toBe("analyzer")
    expect(advancePipeline("unknown" as any)).toBe("analyzer")
  })

  it("determineNextStage - empty input advances pipeline", () => {
    expect(determineNextStage("analyzer", "")).toBe("coach")
    expect(determineNextStage("analyzer", "   ")).toBe("coach")
  })

  it("determineNextStage - jump to roleplay", () => {
    expect(determineNextStage("analyzer", "let's roleplay")).toBe("roleplay")
    expect(determineNextStage("analyzer", "i want to practice")).toBe("roleplay")
    expect(determineNextStage("analyzer", "roleplay")).toBe("roleplay")
    expect(determineNextStage("analyzer", "can we skip to roleplay please")).toBe("roleplay")
    expect(determineNextStage("analyzer", "i will practice directly")).toBe("roleplay")
  })

  it("determineNextStage - jump to reflection", () => {
    expect(determineNextStage("roleplay", "review me")).toBe("reflection")
    expect(determineNextStage("roleplay", "give me feedback")).toBe("reflection")
    expect(determineNextStage("roleplay", "reflect")).toBe("reflection")
    expect(determineNextStage("roleplay", "skip to review")).toBe("reflection")
    expect(determineNextStage("roleplay", "evaluate me")).toBe("reflection")
  })

  it("determineNextStage - jump to coach", () => {
    expect(determineNextStage("analyzer", "give me advice")).toBe("coach")
    expect(determineNextStage("analyzer", "skip to coach")).toBe("coach")
    expect(determineNextStage("analyzer", "coach")).toBe("coach")
  })

  it("determineNextStage - jump to analyzer", () => {
    expect(determineNextStage("reflection", "start over")).toBe("analyzer")
    expect(determineNextStage("reflection", "new situation")).toBe("analyzer")
    expect(determineNextStage("reflection", "analyze")).toBe("analyzer")
  })

  it("determineNextStage - stay in current stage", () => {
    expect(determineNextStage("analyzer", "hello world")).toBe("analyzer")
    expect(determineNextStage("coach", "how do i say hi?")).toBe("coach")
  })
})
