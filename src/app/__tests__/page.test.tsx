import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import { useAppStore } from "@/lib/store"

import Page from "../page"

vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({ theme: "light", setTheme: vi.fn() }))
}))

// Mock window.HTMLElement.prototype.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe("Page", () => {
  afterEach(() => {
    cleanup()
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
    global.fetch = vi.fn( async () =>
      Promise.resolve({
        ok: true,
        body: {
          getReader: () => {
            let readCount = 0
            return {
              read:  async () => {
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

  it("jumps stage when typing jump command", async () => {
    render(<Page />)
    const input = screen.getByPlaceholderText(/Type your message/i)
    fireEvent.change(input, { target: { value: "give me advice" } })
    fireEvent.submit(input.closest("form")!)

    expect(useAppStore.getState().currentStage).toBe("coach")
  })
})
