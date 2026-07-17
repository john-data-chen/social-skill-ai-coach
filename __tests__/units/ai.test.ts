import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { describe, it, expect, vi } from "vitest"

import {
  DEFAULT_MIMO_BASE_URL,
  DEEPSEEK_BASE_URL,
  GROK_BASE_URL,
  MIMO_CUSTOM_BASE_URL_EXAMPLE,
  getProvider
} from "../../src/lib/ai"

vi.mock("@ai-sdk/openai-compatible", () => ({
  createOpenAICompatible: vi.fn((config) => config)
}))

describe("ai", () => {
  it("getProvider returns mimo config", () => {
    const config: any = getProvider("mimo", "test-key")
    expect(config.name).toBe("mimo")
    expect(config.baseURL).toBe(DEFAULT_MIMO_BASE_URL)
    expect(config.apiKey).toBe("test-key")
  })

  it("getProvider returns deepseek config", () => {
    const config: any = getProvider("deepseek", "test-key")
    expect(config.name).toBe("deepseek")
    expect(config.baseURL).toBe(DEEPSEEK_BASE_URL)
    expect(config.apiKey).toBe("test-key")
  })

  it("getProvider returns grok config, ignoring any baseURL override", () => {
    const config: any = getProvider("grok", "test-key", "https://ignored.example.com")
    expect(config.name).toBe("grok")
    expect(config.baseURL).toBe(GROK_BASE_URL)
    expect(config.apiKey).toBe("test-key")
  })

  it("getProvider uses a custom mimo baseURL when provided", () => {
    const config: any = getProvider("mimo", "k", MIMO_CUSTOM_BASE_URL_EXAMPLE)
    expect(config.baseURL).toBe(MIMO_CUSTOM_BASE_URL_EXAMPLE)
  })

  it("getProvider falls back to default mimo baseURL when blank", () => {
    const config: any = getProvider("mimo", "k", "")
    expect(config.baseURL).toBe(DEFAULT_MIMO_BASE_URL)
  })
})
