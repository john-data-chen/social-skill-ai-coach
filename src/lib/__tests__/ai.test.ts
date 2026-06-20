import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { describe, it, expect, vi } from "vitest"

import { getProvider } from "../ai"

vi.mock("@ai-sdk/openai-compatible", () => ({
  createOpenAICompatible: vi.fn((config) => config)
}))

describe("ai", () => {
  it("getProvider returns mimo config", () => {
    const config: any = getProvider("mimo", "test-key")
    expect(config.name).toBe("mimo")
    expect(config.baseURL).toBe("https://api.xiaomimimo.com/v1")
    expect(config.apiKey).toBe("test-key")
  })

  it("getProvider returns deepseek config", () => {
    const config: any = getProvider("deepseek", "test-key")
    expect(config.name).toBe("deepseek")
    expect(config.baseURL).toBe("https://api.deepseek.com")
    expect(config.apiKey).toBe("test-key")
  })
})
