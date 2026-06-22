import { describe, it, expect, beforeEach } from "vitest"

import { useAppStore } from "../../src/lib/store"

describe("store", () => {
  beforeEach(() => {
    useAppStore.setState({
      provider: "mimo",
      model: "mimo-v2.5-pro",
      apiKey: "",
      mode: "byok",
      currentStage: "analyzer",
      messages: []
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

  it("should setMessages", () => {
    const messages = [{ id: "1", role: "user", content: "hello" }]
    useAppStore.getState().setMessages(messages)
    expect(useAppStore.getState().messages).toEqual(messages)
  })

  it("should clearMessages", () => {
    useAppStore.getState().setMessages([{ id: "1", role: "user", content: "hello" }])
    useAppStore.getState().clearMessages()
    expect(useAppStore.getState().messages).toEqual([])
  })
})
