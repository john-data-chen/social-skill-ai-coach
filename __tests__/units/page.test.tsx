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
      messages: []
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
    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "test input" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText("test input")).toBeDefined()
      expect(screen.getByText("Hello from AI")).toBeDefined()
    })
  })

  it("jumps stage when typing jump command", () => {
    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "/coach" } })
    fireEvent.submit(input.closest("form")!)

    expect(useAppStore.getState().currentStage).toBe("coach")
  })

  it("a command with leftover text jumps AND hands the text to the destination agent", async () => {
    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "跟我做個角色模擬 /roleplay" } })
    fireEvent.submit(input.closest("form")!)

    expect(useAppStore.getState().currentStage).toBe("roleplay")
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it("empty submit does nothing (no accidental stage advance)", () => {
    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)
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
    const input = screen.getByPlaceholderText(/Enter to send/i)
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
    const input = screen.getByPlaceholderText(/Enter to send/i)
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
    const input = screen.getByPlaceholderText(/Enter to send/i)
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
      messages: [
        {
          id: "1",
          role: "user",
          content: "Hello",
          experimental_attachments: [
            { name: "doc.txt", contentType: "text/plain", url: "data:text/plain;base64,ZGVm" }
          ]
        },
        { id: "2", role: "assistant", content: "Hi there" }
      ]
    })

    render(<Page />)
    expect(screen.getByText("Hello")).toBeDefined()
    expect(screen.getByText("Hi there")).toBeDefined()
    expect(screen.getByText("doc.txt")).toBeDefined()
  })

  it("renders existing history messages with image attachments", () => {
    useAppStore.setState({
      messages: [
        {
          id: "1",
          role: "user",
          content: "Check this",
          experimental_attachments: [
            { name: "photo.png", contentType: "image/png", url: "data:image/png;base64,abc" }
          ]
        }
      ]
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

    const input = screen.getByPlaceholderText(/Enter to send/i)
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
    const input = screen.getByPlaceholderText(/Enter to send/i)
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

  it("opens commands info dialog on Help button click", () => {
    render(<Page />)
    const helpBtn = screen.getByText("Help").closest("button")!
    fireEvent.click(helpBtn)

    expect(screen.getByText("Quick Commands")).toBeDefined()
  })

  it("submits on Enter key press", async () => {
    render(<Page />)
    const textarea = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(textarea, { target: { value: "hello via enter" } })
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false })

    await waitFor(() => {
      expect(screen.getByText("hello via enter")).toBeDefined()
    })
  })

  it("does not submit on Shift+Enter", () => {
    render(<Page />)
    const textarea = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(textarea, { target: { value: "shift enter" } })
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("does not submit on Enter during IME composition", () => {
    render(<Page />)
    const textarea = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(textarea, { target: { value: "IME text" } })

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      shiftKey: false,
      bubbles: true,
      cancelable: true
    })
    Object.defineProperty(event, "isComposing", { value: true })
    textarea.dispatchEvent(event)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("submits with attachments via Enter key", async () => {
    render(<Page />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["data"], "pic.png", { type: "image/png" })
    Object.defineProperty(fileInput, "files", { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByAltText("pic.png")).toBeDefined()
    })

    const textarea = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(textarea, { target: { value: "with pic" } })
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false })

    await waitFor(() => {
      expect(screen.getByText("with pic")).toBeDefined()
    })
  })

  it("shows reflection placeholder in reflection stage", () => {
    useAppStore.setState({ currentStage: "reflection" })
    render(<Page />)
    expect(screen.getByPlaceholderText(/Review me/i)).toBeDefined()
  })

  it("displays stage-specific card descriptions", () => {
    const stages = ["analyzer", "coach", "roleplay", "reflection"] as const
    const descriptions = [
      /Describe your social situation/,
      /Get concrete advice/,
      /Practice the conversation/,
      /Review your practice/
    ]

    stages.forEach((stage, i) => {
      useAppStore.setState({ currentStage: stage })
      render(<Page />)
      expect(screen.getByText(descriptions[i]!)).toBeDefined()
      cleanup()
    })
  })

  it("shows error on empty stream response", async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => Promise.resolve({ done: true })
        })
      }
    })

    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "test empty" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText(/Empty response/)).toBeDefined()
    })
  })

  it("shows error message for failed request", async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "Forbidden" }),
      text: async () => ""
    })

    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "test forbidden" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText(/Request failed \(403\)/)).toBeDefined()
    })
  })

  it("drops duplicate submits while loading", async () => {
    let resolveFetch: (v: any) => void
    ;(global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    )

    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)

    fireEvent.change(input, { target: { value: "first" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText("first")).toBeDefined()
    })

    fireEvent.change(input, { target: { value: "second" } })
    fireEvent.submit(input.closest("form")!)

    expect(global.fetch).toHaveBeenCalledTimes(1)

    resolveFetch!({
      ok: true,
      body: {
        getReader: () => ({
          read: async () => Promise.resolve({ done: true })
        })
      }
    })
  })

  it("handles fetch error that is not an Error instance", async () => {
    ;(global.fetch as any).mockRejectedValueOnce("string error")

    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "test non-error" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeDefined()
    })
  })

  it("handles error response with non-JSON body", async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("not json")
      },
      text: async () => "Bad Gateway"
    })

    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "test 502" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText(/Request failed \(502\)/)).toBeDefined()
    })
  })

  it("handles error response with empty body", async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("no json")
      },
      text: async () => ""
    })

    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "test 500" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText(/Request failed \(500\)/)).toBeDefined()
    })
  })

  it("shows error detail from response message field", async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ message: "Invalid model" }),
      text: async () => ""
    })

    render(<Page />)
    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "test 422" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText(/Invalid model/)).toBeDefined()
    })
  })

  it("jumps stage with attachments via slash command", async () => {
    render(<Page />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["data"], "doc.pdf", { type: "application/pdf" })
    Object.defineProperty(fileInput, "files", { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText("doc.pdf")).toBeDefined()
    })

    const input = screen.getByPlaceholderText(/Enter to send/i)
    fireEvent.change(input, { target: { value: "/coach check this" } })
    fireEvent.submit(input.closest("form")!)

    expect(useAppStore.getState().currentStage).toBe("coach")
  })
})
