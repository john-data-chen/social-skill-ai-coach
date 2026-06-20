import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { describe, expect, test, vi } from "vitest"

import { registerSocialSkillsMcp } from "../server"

describe("server", () => {
  test("registerSocialSkillsMcp registers tools and prompts", () => {
    const server = new McpServer({ name: "test", version: "1.0" })

    const registerToolSpy = vi.spyOn(server, "registerTool")
    const registerPromptSpy = vi.spyOn(server, "registerPrompt")

    registerSocialSkillsMcp(server)

    expect(registerToolSpy).toHaveBeenCalledWith(
      "list_social_topics",
      expect.any(Object),
      expect.any(Function)
    )
    expect(registerToolSpy).toHaveBeenCalledWith(
      "get_social_knowledge",
      expect.any(Object),
      expect.any(Function)
    )

    expect(registerPromptSpy).toHaveBeenCalledWith(
      "analyze_situation",
      expect.any(Object),
      expect.any(Function)
    )
    expect(registerPromptSpy).toHaveBeenCalledWith(
      "coach",
      expect.any(Object),
      expect.any(Function)
    )
    expect(registerPromptSpy).toHaveBeenCalledWith(
      "roleplay",
      expect.any(Object),
      expect.any(Function)
    )
    expect(registerPromptSpy).toHaveBeenCalledWith(
      "reflect",
      expect.any(Object),
      expect.any(Function)
    )

    // Test callbacks to ensure coverage
    const listTopicsCall = (registerToolSpy.mock.calls as any[]).find(
      (c: any) => c[0] === "list_social_topics"
    )!
    const listTopicsCb = listTopicsCall[2]
    const listResult = listTopicsCb(
      {},
      {
        _meta: {},
        signal: new AbortController().signal,
        requestId: "1",
        sendNotification: vi.fn(),
        sendRequest: vi.fn()
      }
    )
    expect(listResult.content[0].type).toBe("text")
    expect(listResult.content[0].text).toContain("friendship")

    const getKnowledgeCall = (registerToolSpy.mock.calls as any[]).find(
      (c: any) => c[0] === "get_social_knowledge"
    )!
    const getKnowledgeCb = getKnowledgeCall[2]
    const getResult = getKnowledgeCb(
      { topics: ["opening"] },
      {
        _meta: {},
        signal: new AbortController().signal,
        requestId: "2",
        sendNotification: vi.fn(),
        sendRequest: vi.fn()
      }
    )
    expect(getResult.content[0].type).toBe("text")
    expect(typeof getResult.content[0].text).toBe("string")

    const analyzeCb = registerPromptSpy.mock.calls.find((c) => c[0] === "analyze_situation")![2]
    const analyzeResult = analyzeCb(
      { situation: "test_situation" },
      {
        _meta: {},
        signal: new AbortController().signal,
        requestId: "3",
        sendNotification: vi.fn(),
        sendRequest: vi.fn()
      }
    ) as any
    expect(analyzeResult.messages[0].content.text).toContain("test_situation")

    const coachCb = registerPromptSpy.mock.calls.find((c) => c[0] === "coach")![2]
    const coachResult = coachCb(
      { situation: "test_situation" },
      {
        _meta: {},
        signal: new AbortController().signal,
        requestId: "4",
        sendNotification: vi.fn(),
        sendRequest: vi.fn()
      }
    ) as any
    expect(coachResult.messages[0].content.text).toContain("test_situation")

    const roleplayCb = registerPromptSpy.mock.calls.find((c) => c[0] === "roleplay")![2]
    const roleplayResult = roleplayCb(
      { scenario: "test_scenario" },
      {
        _meta: {},
        signal: new AbortController().signal,
        requestId: "5",
        sendNotification: vi.fn(),
        sendRequest: vi.fn()
      }
    ) as any
    expect(roleplayResult.messages[0].content.text).toContain("test_scenario")

    const reflectCb = registerPromptSpy.mock.calls.find((c) => c[0] === "reflect")![2]
    const reflectResult = reflectCb(
      { transcript: "test_transcript" },
      {
        _meta: {},
        signal: new AbortController().signal,
        requestId: "6",
        sendNotification: vi.fn(),
        sendRequest: vi.fn()
      }
    ) as any
    expect(reflectResult.messages[0].content.text).toContain("test_transcript")
  })
})
