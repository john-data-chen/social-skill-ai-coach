import { describe, it, expect } from "vitest"

import { parseStageCommand } from "../../src/lib/router"

describe("router / parseStageCommand", () => {
  it("bare slash commands resolve to their stage with empty rest", () => {
    expect(parseStageCommand("/coach")).toEqual({ stage: "coach", rest: "" })
    expect(parseStageCommand("/roleplay")).toEqual({ stage: "roleplay", rest: "" })
    expect(parseStageCommand("/reflect")).toEqual({ stage: "reflection", rest: "" })
    expect(parseStageCommand("/reflection")).toEqual({ stage: "reflection", rest: "" })
    expect(parseStageCommand("/analyzer")).toEqual({ stage: "analyzer", rest: "" })
    expect(parseStageCommand("/analyze")).toEqual({ stage: "analyzer", rest: "" })
  })

  it("/role-play is an alias for the roleplay stage", () => {
    expect(parseStageCommand("/role-play")).toEqual({ stage: "roleplay", rest: "" })
  })

  it("detects a command anywhere and returns the leftover message", () => {
    expect(parseStageCommand("跟我做個角色模擬 /roleplay")).toEqual({
      stage: "roleplay",
      rest: "跟我做個角色模擬"
    })
    expect(parseStageCommand("let's practice /role-play now")).toEqual({
      stage: "roleplay",
      rest: "let's practice now"
    })
    expect(parseStageCommand("ok /coach please")).toEqual({ stage: "coach", rest: "ok please" })
  })

  it("is case- and whitespace-insensitive", () => {
    expect(parseStageCommand("  /Coach  ")).toEqual({ stage: "coach", rest: "" })
  })

  it("only matches whole tokens", () => {
    expect(parseStageCommand("/coaching tips")).toBeNull()
    expect(parseStageCommand("/role-played it")).toBeNull()
  })

  it("when several commands appear, the earliest decides the stage", () => {
    expect(parseStageCommand("/coach then /roleplay")?.stage).toBe("coach")
  })

  it("returns null for empty or ordinary text", () => {
    expect(parseStageCommand("")).toBeNull()
    expect(parseStageCommand("   ")).toBeNull()
    // used to silently navigate via natural-language guessing — now ignored
    expect(parseStageCommand("i want to practice asking her out")).toBeNull()
  })
})
