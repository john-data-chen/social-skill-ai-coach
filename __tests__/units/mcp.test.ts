import { describe, it, expect, vi } from "vitest"
import { registerSocialSkillsMcp } from "@/lib/mcp/server-setup"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

describe("registerSocialSkillsMcp", () => {
  it("registers tools and prompts", () => {
    const mockServer = {
      registerTool: vi.fn(),
      registerPrompt: vi.fn(),
    } as unknown as McpServer

    registerSocialSkillsMcp(mockServer)

    expect(mockServer.registerTool).toHaveBeenCalledWith("list_social_topics", expect.any(Object), expect.any(Function))
    expect(mockServer.registerTool).toHaveBeenCalledWith("get_social_knowledge", expect.any(Object), expect.any(Function))
    
    expect(mockServer.registerPrompt).toHaveBeenCalledWith("analyze_situation", expect.any(Object), expect.any(Function))
    expect(mockServer.registerPrompt).toHaveBeenCalledWith("coach", expect.any(Object), expect.any(Function))
    expect(mockServer.registerPrompt).toHaveBeenCalledWith("roleplay", expect.any(Object), expect.any(Function))
    expect(mockServer.registerPrompt).toHaveBeenCalledWith("reflect", expect.any(Object), expect.any(Function))

    // Call the tools and prompts to cover their bodies
    const listToolCallback = (mockServer.registerTool as any).mock.calls.find((call: any) => call[0] === "list_social_topics")[2]
    expect(listToolCallback().content[0].type).toBe("text")

    const getKnowledgeCallback = (mockServer.registerTool as any).mock.calls.find((call: any) => call[0] === "get_social_knowledge")[2]
    expect(getKnowledgeCallback({ topics: ["opening"] }).content[0].type).toBe("text")

    const analyzePromptCallback = (mockServer.registerPrompt as any).mock.calls.find((call: any) => call[0] === "analyze_situation")[2]
    expect(analyzePromptCallback({ situation: "test" }).messages[0].role).toBe("user")

    const coachPromptCallback = (mockServer.registerPrompt as any).mock.calls.find((call: any) => call[0] === "coach")[2]
    expect(coachPromptCallback({ situation: "test" }).messages[0].role).toBe("user")

    const roleplayPromptCallback = (mockServer.registerPrompt as any).mock.calls.find((call: any) => call[0] === "roleplay")[2]
    expect(roleplayPromptCallback({ scenario: "test" }).messages[0].role).toBe("user")

    const reflectPromptCallback = (mockServer.registerPrompt as any).mock.calls.find((call: any) => call[0] === "reflect")[2]
    expect(reflectPromptCallback({ transcript: "test" }).messages[0].role).toBe("user")
  })
})
