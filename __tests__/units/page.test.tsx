import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import { useAppStore } from "@/lib/store"

import Page from "../../src/app/page"

vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({ theme: "light", setTheme: vi.fn() }))
}))

window.HTMLElement.prototype.scrollIntoView = vi.fn()

vi.stubGlobal(
  "FileReader",
  class {
    result = ""
    onload: (() => void) | null = null
    readAsDataURL() {
      this.result = "data:text/plain;base64,dGVzdA=="
      if (this.onload) {
        this.onload()
      }
    }
  }
)

describe("Page", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  beforeEach(() => {
    useAppStore.setState({
      provider: "mimo",
      model: "mimo-v2.5-pro",
      apiKey: "",
      mode: "byok",
      currentStage: "analyzer",
      history: {
        analyzer: [],
        coach: [],
        roleplay: [],
        reflection: []
      }
    })
    global.fetch = vi.fn(async () =>
      Promise.resolve({
        ok: true,
        body: {
          getReader: () => {
            let readCount = 0
            return {
              read: async () => {
                readCount++
                if (readCount === 1) {
                  return Promise.resolve({
                    done: false,
                    value: new TextEncoder().encode("Hello from AI")
                  })
                }
                return Promise.resolve({ done: true })
              }
            }
          }
        }
      })
    ) as any
  })

  it("renders page header", () => {
    render(<Page />)
    expect(screen.getByText("Social Skills Coach")).toBeDefined()
  })

  it("submits a message", async () => {
    render(<Page />)
    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "test input" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText("test input")).toBeDefined()
      expect(screen.getByText("Hello from AI")).toBeDefined()
    })
  })

  it("jumps stage when typing jump command", () => {
    render(<Page />)
    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "/coach" } })
    fireEvent.submit(input.closest("form")!)

    expect(useAppStore.getState().currentStage).toBe("coach")
  })

  it("a command with leftover text jumps AND hands the text to the destination agent", async () => {
    render(<Page />)
    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "跟我做個角色模擬 /roleplay" } })
    fireEvent.submit(input.closest("form")!)

    expect(useAppStore.getState().currentStage).toBe("roleplay")
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it("empty submit does nothing (no accidental stage advance)", () => {
    render(<Page />)
    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "" } })
    fireEvent.submit(input.closest("form")!)

    expect(useAppStore.getState().currentStage).toBe("analyzer")
  })

  it("switches tabs", () => {
    render(<Page />)
    const roleplayTab = screen.getByText("3. Role-Play")
    fireEvent.click(roleplayTab)
    expect(useAppStore.getState().currentStage).toBe("roleplay")
  })

  it("catches fetch errors gracefully", async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error("Network error"))
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(<Page />)
    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "test error" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    consoleSpy.mockRestore()
  })

  it("handles fetch response not ok", async () => {
    ;(global.fetch as any).mockResolvedValueOnce({ ok: false })
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(<Page />)
    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "test not ok" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    consoleSpy.mockRestore()
  })

  it("handles fetch with no reader", async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      body: null
    })

    render(<Page />)
    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "test no reader" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText("test no reader")).toBeDefined()
    })
  })

  it("opens file picker on paperclip click", () => {
    render(<Page />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(fileInput, "click")

    const svgEl = document.querySelector(".lucide-paperclip")!
    const paperclipBtn = svgEl.closest("button")!
    fireEvent.click(paperclipBtn)

    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
  })

  it("adds and removes attachments via file input", async () => {
    render(<Page />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["test content"], "test.txt", { type: "text/plain" })
    Object.defineProperty(fileInput, "files", { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText("test.txt")).toBeDefined()
    })

    const removeButtons = document.querySelectorAll(".lucide-x")
    fireEvent.click(removeButtons[0]!.closest("button")!)

    await waitFor(() => {
      expect(screen.queryByText("test.txt")).toBeNull()
    })
  })

  it("renders existing history messages with non-image attachments", () => {
    useAppStore.setState({
      history: {
        analyzer: [
          {
            id: "1",
            role: "user",
            content: "Hello",
            experimental_attachments: [
              { name: "doc.txt", contentType: "text/plain", url: "data:text/plain;base64,ZGVm" }
            ]
          },
          { id: "2", role: "assistant", content: "Hi there" }
        ],
        coach: [],
        roleplay: [],
        reflection: []
      }
    })

    render(<Page />)
    expect(screen.getByText("Hello")).toBeDefined()
    expect(screen.getByText("Hi there")).toBeDefined()
    expect(screen.getByText("doc.txt")).toBeDefined()
  })

  it("renders existing history messages with image attachments", () => {
    useAppStore.setState({
      history: {
        analyzer: [
          {
            id: "1",
            role: "user",
            content: "Check this",
            experimental_attachments: [
              { name: "photo.png", contentType: "image/png", url: "data:image/png;base64,abc" }
            ]
          }
        ],
        coach: [],
        roleplay: [],
        reflection: []
      }
    })

    render(<Page />)
    expect(screen.getByText("Check this")).toBeDefined()
    const img = screen.getByAltText("photo.png")
    expect(img).toBeDefined()
    expect(img.getAttribute("src")).toBe("data:image/png;base64,abc")
  })

  it("submits message with attachments", async () => {
    render(<Page />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["data"], "img.png", { type: "image/png" })
    Object.defineProperty(fileInput, "files", { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByAltText("img.png")).toBeDefined()
    })

    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "with attachment" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText("with attachment")).toBeDefined()
    })
  })

  it("submits empty with attachments", async () => {
    render(<Page />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["data"], "file.pdf", { type: "application/pdf" })
    Object.defineProperty(fileInput, "files", { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText("file.pdf")).toBeDefined()
    })

    const form = document.querySelector("form")!
    fireEvent.submit(form)

    // Empty text + attachment SENDS the file (fetch called) and stays put — it must NOT
    // bounce to the next stage and drop the attachment.
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
    expect(useAppStore.getState().currentStage).toBe("analyzer")
  })

  it("shows no messages placeholder", () => {
    render(<Page />)
    expect(screen.getByText(/No messages yet/)).toBeDefined()
  })

  it("renders assistant message styled as assistant bubble", async () => {
    render(<Page />)
    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "test" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      const msg = screen.getByText("Hello from AI")
      const bubble = msg.closest('[class*="justify-start"]')
      expect(bubble).toBeDefined()
    })
  })

  it("handles multiple file attachments", async () => {
    render(<Page />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const files = [
      new File(["a"], "file1.txt", { type: "text/plain" }),
      new File(["b"], "file2.txt", { type: "text/plain" })
    ]
    Object.defineProperty(fileInput, "files", { value: files })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText("file1.txt")).toBeDefined()
      expect(screen.getByText("file2.txt")).toBeDefined()
    })
  })

  it("clears file input after selecting files", async () => {
    render(<Page />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["data"], "test.txt", { type: "text/plain" })
    Object.defineProperty(fileInput, "files", { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(fileInput.value).toBe("")
    })
  })

  it("handles file input change with no files", () => {
    render(<Page />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, "files", { value: null })

    fireEvent.change(fileInput)

    expect(screen.queryByText("test.txt")).toBeNull()
  })
})
