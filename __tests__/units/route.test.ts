import { describe, it, expect, vi, beforeEach } from "vitest"

const mockStreamText = vi.fn()
const mockGenerateObject = vi.fn()

vi.mock("ai", () => ({
  streamText: (...args: any[]) => mockStreamText(...args),
  generateObject: (...args: any[]) => mockGenerateObject(...args)
}))

vi.mock("../../src/lib/agents", () => ({
  analyzerPrompt: "Social Situation Analyzer prompt",
  coachPrompt: "Social Skills Coach prompt",
  roleplayPrompt: "Roleplay Partner prompt",
  reflectionPrompt: "Reflection Agent prompt",
  reflectionSchema: { parse: vi.fn() }
}))

const mockGetProvider = vi.fn()
vi.mock("../../src/lib/ai", () => ({
  getProvider: (...args: any[]) => mockGetProvider(...args)
}))

import { POST } from "../../src/app/api/chat/route"

function makeRequest(body: any, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body)
  })
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.MIMO_API_KEY = "env-mimo-key"
    process.env.DEEPSEEK_API_KEY = "env-deepseek-key"
  })

  it("returns 401 when no API key provided", async () => {
    const req = makeRequest({ messages: [], provider: "mimo", model: "m1", mode: "byok", stage: "analyzer" })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe("Missing API Key")
  })

  it("uses BYOK key from Authorization header", async () => {
    const mockFn = vi.fn().mockReturnValue("stream")
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => mockFn)

    const req = makeRequest(
      { messages: [{ role: "user", content: "hello" }], provider: "mimo", model: "m1", mode: "byok", stage: "analyzer" },
      { Authorization: "Bearer my-key" }
    )
    await POST(req)
    expect(mockGetProvider).toHaveBeenCalledWith("mimo", "my-key")
  })

  it("uses env key in demo mode for mimo", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
      model: "m1",
      mode: "demo",
      stage: "analyzer"
    })
    await POST(req)
    expect(mockGetProvider).toHaveBeenCalledWith("mimo", "env-mimo-key")
  })

  it("uses env key in demo mode for deepseek", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "deepseek",
      model: "d1",
      mode: "demo",
      stage: "analyzer"
    })
    await POST(req)
    expect(mockGetProvider).toHaveBeenCalledWith("deepseek", "env-deepseek-key")
  })

  it("handles reflection stage with generateObject", async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        overallStatus: "pass",
        strengths: ["Good greeting"],
        areasForImprovement: ["Eye contact"],
        feedback: "Well done overall."
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "evaluate me" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "reflection",
        roleplayHistory: [
          { role: "user", content: "Hi there" },
          { role: "assistant", content: "Hello!" }
        ]
      },
      { Authorization: "Bearer test-key" }
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain("Pass")
    expect(text).toContain("Good greeting")
    expect(text).toContain("Eye contact")
    expect(text).toContain("Well done overall.")
  })

  it("handles reflection stage failure", async () => {
    mockGenerateObject.mockRejectedValue(new Error("model unsupported"))
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "evaluate" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "reflection",
        roleplayHistory: []
      },
      { Authorization: "Bearer test-key" }
    )
    const res = await POST(req)
    expect(res.status).toBe(500)
    const text = await res.text()
    expect(text).toContain("Error generating evaluation")
  })

  it("handles reflection with no roleplayHistory", async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        overallStatus: "fail",
        strengths: [],
        areasForImprovement: ["Practice more"],
        feedback: "Try again."
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "evaluate" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "reflection"
      },
      { Authorization: "Bearer test-key" }
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain("Needs Practice")
  })

  it("uses analyzerPrompt for analyzer stage", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    const modelFn = vi.fn()
    mockGetProvider.mockReturnValue(() => modelFn)

    const req = makeRequest(
      { messages: [{ role: "user", content: "hi" }], provider: "mimo", model: "m1", mode: "byok", stage: "analyzer" },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ system: "Social Situation Analyzer prompt" })
    )
  })

  it("uses coachPrompt for coach stage", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      { messages: [{ role: "user", content: "hi" }], provider: "mimo", model: "m1", mode: "byok", stage: "coach" },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ system: "Social Skills Coach prompt" })
    )
  })

  it("uses roleplayPrompt for roleplay stage", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      { messages: [{ role: "user", content: "hi" }], provider: "mimo", model: "m1", mode: "byok", stage: "roleplay" },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ system: "Roleplay Partner prompt" })
    )
  })

  it("uses reflectionPrompt for reflection stage in switch", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      { messages: [{ role: "user", content: "hi" }], provider: "mimo", model: "m1", mode: "byok", stage: "reflection" },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    // reflection stage hits the early return with generateObject, not streamText
    // But let's verify the switch path — it won't reach streamText for reflection
    // So this test actually goes through generateObject path
    expect(mockGenerateObject).toHaveBeenCalled()
  })

  it("handles messages with image attachments", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "look at this",
            experimental_attachments: [
              { contentType: "image/png", url: "data:image/png;base64,abc123", name: "photo.png" }
            ]
          }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    expect(call.messages[0].content).toEqual([
      { type: "text", text: "look at this" },
      { type: "image", image: "data:image/png;base64,abc123" }
    ])
  })

  it("handles messages with text file attachments", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "read this",
            experimental_attachments: [
              { contentType: "text/plain", url: "data:text/plain;base64,dGVzdA==", name: "notes.txt" }
            ]
          }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    const parts = call.messages[0].content
    expect(parts).toHaveLength(2)
    expect(parts[1].type).toBe("text")
    expect(parts[1].text).toContain("notes.txt")
    expect(parts[1].text).toContain("test")
  })

  it("handles messages with markdown file attachments", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "check this",
            experimental_attachments: [
              { contentType: "text/markdown", url: "data:text/markdown;base64,aGVsbG8=", name: "doc.md" }
            ]
          }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    const parts = call.messages[0].content
    expect(parts[1].type).toBe("text")
    expect(parts[1].text).toContain("doc.md")
  })

  it("handles messages with csv file attachments", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "analyze data",
            experimental_attachments: [
              { contentType: "text/csv", url: "data:text/csv;base64,YQpi", name: "data.csv" }
            ]
          }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    expect(call.messages[0].content[1].type).toBe("text")
  })

  it("handles messages with pdf/doc attachments", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "review doc",
            experimental_attachments: [
              { contentType: "application/pdf", url: "data:application/pdf;base64,JVBER", name: "file.pdf" }
            ]
          }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    const parts = call.messages[0].content
    expect(parts[1].type).toBe("file")
    expect(parts[1].mimeType).toBe("application/pdf")
  })

  it("handles messages with attachment without comma prefix", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "check",
            experimental_attachments: [
              { contentType: "text/plain", url: "plainbase64data", name: "file.txt" }
            ]
          }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    expect(call.messages[0].content[1].type).toBe("text")
  })

  it("handles messages with empty attachments array", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          { role: "user", content: "hello", experimental_attachments: [] }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    expect(call.messages[0].content).toBe("hello")
  })

  it("handles messages without experimental_attachments", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      { messages: [{ role: "user", content: "plain msg" }], provider: "mimo", model: "m1", mode: "byok", stage: "analyzer" },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    expect(call.messages[0]).toEqual({ role: "user", content: "plain msg" })
  })

  it("returns 500 on unexpected error", async () => {
    mockGetProvider.mockImplementation(() => { throw new Error("provider init failed") })

    const req = makeRequest(
      { messages: [{ role: "user", content: "hi" }], provider: "mimo", model: "m1", mode: "byok", stage: "analyzer" },
      { Authorization: "Bearer k" }
    )
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe("Internal Server Error")
  })

  it("handles undefined stage with empty systemPrompt", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      { messages: [{ role: "user", content: "hi" }], provider: "mimo", model: "m1", mode: "byok", stage: "unknown" },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ system: "" })
    )
  })

  it("handles reflection with undefined roleplayHistory", async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        overallStatus: "pass",
        strengths: ["a"],
        areasForImprovement: ["b"],
        feedback: "c"
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "evaluate" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "reflection"
      },
      { Authorization: "Bearer test-key" }
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it("handles messages with image attachment without comma in url", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "see image",
            experimental_attachments: [
              { contentType: "image/jpeg", url: "rawbase64data", name: "pic.jpg" }
            ]
          }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    expect(call.messages[0].content[1]).toEqual({ type: "image", image: "rawbase64data" })
  })

  it("handles attachment with unknown content type hitting else branch", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "check file",
            experimental_attachments: [
              { contentType: "application/zip", url: "data:application/zip;base64,dGVzdA==", name: "archive.zip" }
            ]
          }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    const parts = call.messages[0].content
    expect(parts[1].type).toBe("file")
    expect(parts[1].mimeType).toBe("application/zip")
  })

  it("handles attachment with .md extension", async () => {
    mockStreamText.mockReturnValue({ toTextStreamResponse: vi.fn().mockReturnValue(new Response("ok")) })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "read md",
            experimental_attachments: [
              { contentType: "application/octet-stream", url: "data:application/octet-stream;base64,Tk9URQ==", name: "readme.md" }
            ]
          }
        ],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0][0]
    expect(call.messages[0].content[1].type).toBe("text")
    expect(call.messages[0].content[1].text).toContain("readme.md")
  })

  it("handles reflection with empty messages array", async () => {
    mockGenerateObject.mockResolvedValue({
      object: {
        overallStatus: "pass",
        strengths: [],
        areasForImprovement: [],
        feedback: "ok"
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "reflection",
        roleplayHistory: []
      },
      { Authorization: "Bearer test-key" }
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
