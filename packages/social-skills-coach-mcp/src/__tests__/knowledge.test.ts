import { describe, expect, test } from "vitest"

import { TOPICS, getKnowledge, getKnowledgeMany, listTopics } from "../knowledge"

describe("knowledge", () => {
  test("listTopics", () => {
    const topics = listTopics()
    expect(topics.length).toBe(Object.keys(TOPICS).length)
    expect(topics[0]).toHaveProperty("key")
    expect(topics[0]).toHaveProperty("description")
  })

  test("getKnowledge and cache", () => {
    const content1 = getKnowledge("opening")
    expect(typeof content1).toBe("string")
    expect(content1.length).toBeGreaterThan(0)

    // Call again to hit the cache branch
    const content2 = getKnowledge("opening")
    expect(content1).toBe(content2)
  })

  test("getKnowledgeMany", () => {
    const content = getKnowledgeMany(["opening", "friendship"])
    expect(typeof content).toBe("string")
    expect(content).toContain("\n\n")
  })
})
