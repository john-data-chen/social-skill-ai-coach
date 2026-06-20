import * as ai from "ai"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { POST } from "../route"

vi.mock("ai", () => {
  return {
    streamText: vi.fn(() => ({
      toTextStreamResponse: () => new Response("mock-stream")
    })),
    generateObject: vi.fn().mockResolvedValue({
      object: {
        overallStatus: "pass",
        strengths: ["good question"],
        areasForImprovement: ["none"],
        feedback: "great job"
      }
    })
  }
})

describe("API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return 401 if missing API Key", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ mode: "byok" }),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it("should use DEMO key if mode is demo", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ mode: "demo", provider: "mimo", stage: "analyzer" }),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should use DEEPSEEK key in demo mode", async () => {
    process.env.DEEPSEEK_API_KEY = "ds-demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ mode: "demo", provider: "deepseek", stage: "analyzer" }),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should use byok key when provided", async () => {
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ mode: "byok", provider: "mimo", stage: "coach", messages: [] }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer my-custom-key"
      }
    })

    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should generate object for reflection stage", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        provider: "mimo",
        stage: "reflection",
        messages: [{ role: "user", content: "Review me" }],
        roleplayHistory: [
          { role: "user", content: "Hi" },
          { role: "assistant", content: "Hello" }
        ]
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const res = await POST(req)
    const text = await res.text()
    expect(text).toContain("✅ Pass")
    expect(text).toContain("good question")
  })

  it("should fallback to 500 if generateObject fails", async () => {
    vi.spyOn(ai, "generateObject").mockRejectedValueOnce(new Error("fail"))
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        provider: "mimo",
        stage: "reflection",
        messages: [{ role: "user", content: "Review me" }]
      })
    })

    const res = await POST(req)
    expect(res.status).toBe(500)
  })

  it("should catch general errors", async () => {
    const req = {
      json: async () => Promise.reject(new Error("bad json"))
    } as any

    const res = await POST(req)
    expect(res.status).toBe(500)
  })

  it("should streamText for coach stage", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ mode: "demo", provider: "mimo", stage: "coach", messages: [] })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should streamText for roleplay stage", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ mode: "demo", provider: "mimo", stage: "roleplay", messages: [] })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should streamText for reflection stage fallback", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ mode: "demo", provider: "mimo", stage: "reflection", messages: [] })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should process image attachments", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        provider: "mimo",
        stage: "analyzer",
        messages: [
          {
            role: "user",
            content: "Look at this image",
            experimental_attachments: [
              { name: "photo.png", contentType: "image/png", url: "data:image/png;base64,abc123" }
            ]
          }
        ]
      })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
    expect(ai.streamText).toHaveBeenCalled()
  })

  it("should process text file attachments", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        provider: "mimo",
        stage: "analyzer",
        messages: [
          {
            role: "user",
            content: "Read this file",
            experimental_attachments: [
              {
                name: "notes.txt",
                contentType: "text/plain",
                url: "data:text/plain;base64,aGVsbG8="
              }
            ]
          }
        ]
      })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should process markdown file attachments", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        provider: "mimo",
        stage: "analyzer",
        messages: [
          {
            role: "user",
            content: "Read this doc",
            experimental_attachments: [
              {
                name: "readme.md",
                contentType: "text/markdown",
                url: "data:text/markdown;base64,bWFyZGRvdw=="
              }
            ]
          }
        ]
      })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should process csv file attachments", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        provider: "mimo",
        stage: "analyzer",
        messages: [
          {
            role: "user",
            content: "Analyze this data",
            experimental_attachments: [
              {
                name: "data.csv",
                contentType: "text/csv",
                url: "data:text/csv;base64,Y29sMSxjb2wy"
              }
            ]
          }
        ]
      })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should process pdf attachments", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        provider: "mimo",
        stage: "analyzer",
        messages: [
          {
            role: "user",
            content: "Check this document",
            experimental_attachments: [
              {
                name: "report.pdf",
                contentType: "application/pdf",
                url: "data:application/pdf;base64,JVBERi0x"
              }
            ]
          }
        ]
      })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should process docx attachments", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        provider: "mimo",
        stage: "analyzer",
        messages: [
          {
            role: "user",
            content: "Check this doc",
            experimental_attachments: [
              {
                name: "file.docx",
                contentType:
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                url: "data:application/docx;base64,UEsFBg=="
              }
            ]
          }
        ]
      })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
  })

  it("should process messages without attachments", async () => {
    process.env.MIMO_API_KEY = "demo-key"
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "demo",
        provider: "mimo",
        stage: "analyzer",
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi" },
          { role: "user", content: "How are you?" }
        ]
      })
    })
    const res = await POST(req)
    expect(res).toBeDefined()
  })
})
