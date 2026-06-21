import { describe, it, expect, vi } from "vitest"

vi.mock("mcp-handler", () => ({
  createMcpHandler: vi.fn().mockReturnValue("mocked-handler")
}))

describe("transport route", () => {
  it("exports GET, POST, DELETE", async () => {
    const route = await import("@/app/api/[transport]/route")
    expect(route.GET).toBe("mocked-handler")
    expect(route.POST).toBe("mocked-handler")
    expect(route.DELETE).toBe("mocked-handler")
  })
})
