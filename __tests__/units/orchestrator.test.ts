import { generateObject } from "ai"
import { describe, it, expect, vi } from "vitest"

import { TOPICS } from "@/lib/knowledge"
import { FALLBACK_TOPICS, groundingFor, selectKnowledgeTopics } from "@/lib/orchestrator"

vi.mock("ai", () => ({
  generateObject: vi.fn()
}))

describe("orchestrator", () => {
  it("fallback topics are all valid curriculum keys", () => {
    expect(FALLBACK_TOPICS.length).toBeGreaterThan(0)
    FALLBACK_TOPICS.forEach((t) => expect(Object.keys(TOPICS)).toContain(t))
  })

  it("groundingFor returns the concatenated slice text", () => {
    const text = groundingFor(["opening", "social-errors"])
    expect(text).toContain("Four steps to open")
    expect(text).toContain("don't hog the conversation")
  })

  it("uses the fallback when there is no situation to route on", async () => {
    // Empty situation short-circuits before any model call.
    const topics = await selectKnowledgeTopics({} as never, "   ")
    expect(topics).toEqual(FALLBACK_TOPICS)
  })

  it("returns topics from model response", async () => {
    ;(generateObject as any).mockResolvedValueOnce({
      object: { topics: ["opening"] }
    })
    const topics = await selectKnowledgeTopics({} as never, "Hello")
    expect(topics).toEqual(["opening"])
  })

  it("falls back if generateObject throws", async () => {
    ;(generateObject as any).mockRejectedValueOnce(new Error("fail"))
    const topics = await selectKnowledgeTopics({} as never, "Hello")
    expect(topics).toEqual(FALLBACK_TOPICS)
  })
})
