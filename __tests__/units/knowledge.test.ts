import { describe, it, expect } from "vitest"

import { getKnowledge, getKnowledgeMany, listTopics, TOPICS } from "@/lib/knowledge"

describe("knowledge loader (social-skills-coach skill)", () => {
  it("lists all 12 curriculum topics", () => {
    expect(listTopics()).toHaveLength(12)
    expect(Object.keys(TOPICS)).toContain("social-errors")
  })

  it("loads a known slice verbatim from the skill", () => {
    expect(getKnowledge("social-errors")).toContain("don't hog the conversation")
    expect(getKnowledge("opening")).toContain("Four steps to open")
  })

  it("concatenates multiple slices in order", () => {
    const combo = getKnowledgeMany(["friendship", "humor"])
    expect(combo).toContain("Traits of friendship")
    expect(combo).toContain("Humor at the right time")
    expect(combo.indexOf("Traits of friendship")).toBeLessThan(combo.indexOf("Humor at the right"))
  })
})
