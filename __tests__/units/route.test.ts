import { describe, it, expect, vi, beforeEach } from "vitest"

const mockStreamText = vi.fn()
const mockGenerateText = vi.fn()

vi.mock("ai", () => ({
  streamText: (...args: any[]) => mockStreamText(...args),
  generateText: (...args: any[]) => mockGenerateText(...args)
}))

vi.mock("../../src/lib/agents", () => ({
  analyzerPrompt: "Social Situation Analyzer prompt",
  buildCoachPrompt: (k: string) => "COACH_SYS::" + k,
  roleplayPrompt: "Roleplay Partner prompt",
  reflectionPrompt: "Reflection Agent prompt",
  reflectionSchema: { safeParse: (v: any) => ({ success: true, data: v }) }
}))

vi.mock("../../src/lib/orchestrator", () => ({
  selectKnowledgeTopics: vi.fn().mockResolvedValue(["opening"]),
  groundingFor: vi.fn().mockReturnValue("KB")
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
    const req = makeRequest({
      messages: [],
      provider: "mimo",
      model: "m1",
      mode: "byok",
      stage: "analyzer"
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe("Missing API Key")
  })

  it("returns 400 when the body shape is invalid", async () => {
    const req = makeRequest(
      { messages: "not-an-array", provider: "mimo", stage: "analyzer" },
      { Authorization: "Bearer k" }
    )
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("Invalid request body")
  })

  it("returns 400 on malformed JSON", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer k" },
      body: "{not valid json"
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("uses BYOK key from Authorization header", async () => {
    const mockFn = vi.fn().mockReturnValue("stream")
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => mockFn)

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hello" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer my-key" }
    )
    await POST(req)
    expect(mockGetProvider).toHaveBeenCalledWith("mimo", "my-key", undefined)
  })

  it("passes BYOK baseUrl through to getProvider", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "mimo",
        model: "m1",
        baseUrl: "https://token-plan-cn.xiaomimimo.com/v1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer my-key" }
    )
    await POST(req)
    expect(mockGetProvider).toHaveBeenCalledWith(
      "mimo",
      "my-key",
      "https://token-plan-cn.xiaomimimo.com/v1"
    )
  })

  it("uses MIMO_API_BASE_URL env in demo mode", async () => {
    process.env.MIMO_API_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1"
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
      model: "m1",
      mode: "demo",
      stage: "analyzer"
    })
    await POST(req)
    expect(mockGetProvider).toHaveBeenCalledWith(
      "mimo",
      "env-mimo-key",
      "https://token-plan-cn.xiaomimimo.com/v1"
    )
    delete process.env.MIMO_API_BASE_URL
  })

  it("uses env key in demo mode for mimo", async () => {
    process.env.MIMO_API_BASE_URL = "test"
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
      model: "m1",
      mode: "demo",
      stage: "analyzer"
    })
    await POST(req)
    expect(mockGetProvider).toHaveBeenCalledWith("mimo", "env-mimo-key", "test")
    delete process.env.MIMO_API_BASE_URL
  })

  it("uses env key in demo mode for deepseek", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "deepseek",
      model: "d1",
      mode: "demo",
      stage: "analyzer"
    })
    await POST(req)
    expect(mockGetProvider).toHaveBeenCalledWith("deepseek", "env-deepseek-key", undefined)
  })

  it("handles reflection stage with generateText", async () => {
    mockGenerateText.mockResolvedValue({
      text: JSON.stringify({
        overallStatus: "pass",
        strengths: ["Good greeting"],
        areasForImprovement: ["Eye contact"],
        feedback: "Well done overall."
      })
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
    mockGenerateText.mockRejectedValue(new Error("model unsupported"))
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
    expect(text).toContain("model unsupported")
  })

  it("handles reflection with no roleplayHistory", async () => {
    mockGenerateText.mockResolvedValue({
      text: JSON.stringify({
        overallStatus: "needs_practice",
        strengths: [],
        areasForImprovement: ["Practice more"],
        feedback: "Try again."
      })
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
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    const modelFn = vi.fn()
    mockGetProvider.mockReturnValue(() => modelFn)

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ system: "Social Situation Analyzer prompt" })
    )
  })

  it("uses coachPrompt for coach stage", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "coach"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ system: "COACH_SYS::KB" })
    )
  })

  it("uses roleplayPrompt for roleplay stage", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "roleplay"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ system: "Roleplay Partner prompt" })
    )
  })

  it("uses reflectionPrompt for reflection stage in switch", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "reflection"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    // reflection stage uses generateText (not streamText): openai-compatible models can't do
    // schema-enforced structured output, so we parse the JSON out of plain text ourselves.
    expect(mockGenerateText).toHaveBeenCalled()
  })

  it("handles messages with image attachments", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
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
    const call = mockStreamText.mock.calls[0]![0]
    expect(call.messages[0].content).toEqual([
      { type: "text", text: "look at this" },
      { type: "image", image: "data:image/png;base64,abc123" }
    ])
  })

  it("handles messages with text file attachments", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "read this",
            experimental_attachments: [
              {
                contentType: "text/plain",
                url: "data:text/plain;base64,dGVzdA==",
                name: "notes.txt"
              }
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
    const call = mockStreamText.mock.calls[0]![0]
    const parts = call.messages[0].content
    expect(parts).toHaveLength(2)
    expect(parts[1].type).toBe("text")
    expect(parts[1].text).toContain("notes.txt")
    expect(parts[1].text).toContain("test")
  })

  it("handles messages with markdown file attachments", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "check this",
            experimental_attachments: [
              {
                contentType: "text/markdown",
                url: "data:text/markdown;base64,aGVsbG8=",
                name: "doc.md"
              }
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
    const call = mockStreamText.mock.calls[0]![0]
    const parts = call.messages[0].content
    expect(parts[1].type).toBe("text")
    expect(parts[1].text).toContain("doc.md")
  })

  it("handles messages with csv file attachments", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
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
    const call = mockStreamText.mock.calls[0]![0]
    expect(call.messages[0].content[1].type).toBe("text")
  })

  it("handles messages with pdf/doc attachments", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "review doc",
            experimental_attachments: [
              {
                contentType: "application/pdf",
                url: "data:application/pdf;base64,JVBER",
                name: "file.pdf"
              }
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
    const call = mockStreamText.mock.calls[0]![0]
    const parts = call.messages[0].content
    expect(parts[1].type).toBe("file")
    expect(parts[1].mimeType).toBe("application/pdf")
  })

  it("handles messages with attachment without comma prefix", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
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
    const call = mockStreamText.mock.calls[0]![0]
    expect(call.messages[0].content[1].type).toBe("text")
  })

  it("handles messages with empty attachments array", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hello", experimental_attachments: [] }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0]![0]
    expect(call.messages[0].content).toBe("hello")
  })

  it("handles messages without experimental_attachments", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "plain msg" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    const call = mockStreamText.mock.calls[0]![0]
    expect(call.messages[0]).toEqual({ role: "user", content: "plain msg" })
  })

  it("returns 500 on unexpected error", async () => {
    mockGetProvider.mockImplementation(() => {
      throw new Error("provider init failed")
    })

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe("Internal Server Error")
  })

  it("handles undefined stage with empty systemPrompt", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "unknown"
      },
      { Authorization: "Bearer k" }
    )
    await POST(req)
    expect(mockStreamText).toHaveBeenCalledWith(expect.objectContaining({ system: "" }))
  })

  it("handles reflection with undefined roleplayHistory", async () => {
    mockGenerateText.mockResolvedValue({
      text: JSON.stringify({
        overallStatus: "pass",
        strengths: ["a"],
        areasForImprovement: ["b"],
        feedback: "c"
      })
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
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
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
    const call = mockStreamText.mock.calls[0]![0]
    expect(call.messages[0].content[1]).toEqual({ type: "image", image: "rawbase64data" })
  })

  it("handles attachment with unknown content type hitting else branch", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "check file",
            experimental_attachments: [
              {
                contentType: "application/zip",
                url: "data:application/zip;base64,dGVzdA==",
                name: "archive.zip"
              }
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
    const call = mockStreamText.mock.calls[0]![0]
    const parts = call.messages[0].content
    expect(parts[1].type).toBe("file")
    expect(parts[1].mimeType).toBe("application/zip")
  })

  it("handles attachment with .md extension", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi.fn().mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [
          {
            role: "user",
            content: "read md",
            experimental_attachments: [
              {
                contentType: "application/octet-stream",
                url: "data:application/octet-stream;base64,Tk9URQ==",
                name: "readme.md"
              }
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
    const call = mockStreamText.mock.calls[0]![0]
    expect(call.messages[0].content[1].type).toBe("text")
    expect(call.messages[0].content[1].text).toContain("readme.md")
  })

  it("handles reflection with empty messages array", async () => {
    mockGenerateText.mockResolvedValue({
      text: JSON.stringify({
        overallStatus: "pass",
        strengths: [],
        areasForImprovement: [],
        feedback: "ok"
      })
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
  it("falls back to deepseek if mimo throws 401 on read in demo mode", async () => {
    process.env.MIMO_API_BASE_URL = "test"
    mockStreamText
      .mockReturnValueOnce({
        textStream: {
          getReader: vi
            .fn()
            .mockReturnValue({ read: vi.fn().mockRejectedValue(new Error("401 Unauthorized")) })
        }
      })
      .mockReturnValueOnce({
        textStream: {
          getReader: vi.fn().mockReturnValue({
            read: vi
              .fn()
              .mockResolvedValueOnce({ done: false, value: "fallback-success" })
              .mockResolvedValueOnce({ done: true })
          })
        }
      })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
      model: "m1",
      mode: "demo",
      stage: "analyzer"
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const stream = res.body as ReadableStream
    const reader = stream.getReader()
    const { value } = await reader.read()
    expect(new TextDecoder().decode(value)).toBe("fallback-success")
  })

  it("returns 401 if mimo throws 401 on read and no deepseek key is available", async () => {
    process.env.MIMO_API_BASE_URL = "test"
    delete process.env.DEEPSEEK_API_KEY
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi
          .fn()
          .mockReturnValue({ read: vi.fn().mockRejectedValue(new Error("401 Unauthorized")) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
      model: "m1",
      mode: "demo",
      stage: "analyzer"
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toContain("expired and no DEEPSEEK_API_KEY fallback is available")
  })

  it("falls back to deepseek if generateObject throws 401 in mimo demo mode", async () => {
    process.env.MIMO_API_BASE_URL = "test"
    mockGenerateText.mockRejectedValueOnce(new Error("401 Unauthorized")).mockResolvedValueOnce({
      text: JSON.stringify({
        overallStatus: "pass",
        strengths: ["a"],
        areasForImprovement: ["b"],
        feedback: "fallback-reflection",
        dimensions: [{ name: "tone", status: "good", note: "good tone" }]
      })
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
      model: "m1",
      mode: "demo",
      stage: "reflection"
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain("fallback-reflection")
  })

  it("returns 401 if generateObject throws 401 and no deepseek key available", async () => {
    process.env.MIMO_API_BASE_URL = "test"
    delete process.env.DEEPSEEK_API_KEY
    mockGenerateText.mockRejectedValueOnce(new Error("401 Unauthorized"))
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
      model: "m1",
      mode: "demo",
      stage: "reflection"
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toContain("expired and no DEEPSEEK_API_KEY fallback is available")
  })

  it("returns 500 if deepseek fallback fails on read", async () => {
    process.env.MIMO_API_BASE_URL = "test"
    mockStreamText
      .mockReturnValueOnce({
        textStream: {
          getReader: vi
            .fn()
            .mockReturnValue({ read: vi.fn().mockRejectedValue(new Error("401 Unauthorized")) })
        }
      })
      .mockReturnValueOnce({
        textStream: {
          getReader: vi
            .fn()
            .mockReturnValue({ read: vi.fn().mockRejectedValue(new Error("Fallback error")) })
        }
      })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest({
      messages: [{ role: "user", content: "hi" }],
      provider: "mimo",
      model: "m1",
      mode: "demo",
      stage: "analyzer"
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain("Fallback error")
  })

  it("returns 500 on non-auth stream read error in byok mode", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi
          .fn()
          .mockReturnValue({ read: vi.fn().mockRejectedValue(new Error("Network timeout")) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe("Network timeout")
  })

  it("returns 500 on non-auth stream read error for deepseek provider", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi
          .fn()
          .mockReturnValue({ read: vi.fn().mockRejectedValue(new Error("Connection reset")) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "deepseek",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe("Connection reset")
  })

  it("handles empty first chunk (done immediately)", async () => {
    mockStreamText.mockReturnValue({
      textStream: {
        getReader: vi
          .fn()
          .mockReturnValue({ read: vi.fn().mockResolvedValue({ done: true }) })
      }
    })
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "hi" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "analyzer"
      },
      { Authorization: "Bearer k" }
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toBe("")
  })

  it("returns 500 on non-auth reflection error in byok mode", async () => {
    mockGenerateText.mockRejectedValue(new Error("structured output not supported"))
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "evaluate me" }],
        provider: "mimo",
        model: "m1",
        mode: "byok",
        stage: "reflection"
      },
      { Authorization: "Bearer test-key" }
    )
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain("structured output not supported")
  })

  it("returns 500 on non-auth reflection error for deepseek in demo mode", async () => {
    mockGenerateText.mockRejectedValue(new Error("quota exceeded"))
    mockGetProvider.mockReturnValue(() => vi.fn())

    const req = makeRequest(
      {
        messages: [{ role: "user", content: "evaluate" }],
        provider: "deepseek",
        model: "m1",
        mode: "demo",
        stage: "reflection"
      },
      { Authorization: "Bearer k" }
    )
    const res = await POST(req)
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain("quota exceeded")
  })

  it("returns 500 on auth-like reflection error in byok mode", async () => {
    mockGenerateText.mockRejectedValue(new Error("401 Unauthorized"))
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
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain("401 Unauthorized")
  })
})
