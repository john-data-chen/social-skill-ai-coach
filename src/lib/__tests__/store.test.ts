import { describe, it, expect, beforeEach } from "vitest"

import { useAppStore } from "../store"

describe("store", () => {
  beforeEach(() => {
    useAppStore.setState({
      provider: "mimo",
      model: "mimo-v2.5-pro",
      apiKey: "",
      mode: "byok",
      currentStage: "analyzer",
      history: {
        analyzer: [],
        coach: [],
        roleplay: [],
        reflection: []
      }
    })
  })

  it("should setConfig", () => {
    useAppStore.getState().setConfig({ provider: "deepseek" })
    expect(useAppStore.getState().provider).toBe("deepseek")
  })

  it("should setStage", () => {
    useAppStore.getState().setStage("roleplay")
    expect(useAppStore.getState().currentStage).toBe("roleplay")
  })

  it("should setHistory", () => {
    const messages = [{ id: "1", role: "user", content: "hello" }]
    useAppStore.getState().setHistory("coach", messages)
    expect(useAppStore.getState().history.coach).toEqual(messages)
  })

  it("should clearHistory", () => {
    const messages = [{ id: "1", role: "user", content: "hello" }]
    useAppStore.getState().setHistory("coach", messages)
    useAppStore.getState().clearHistory()
    expect(useAppStore.getState().history.coach).toEqual([])
  })
})
