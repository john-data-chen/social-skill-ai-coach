import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { useAppStore } from "@/lib/store"

import { Settings } from "../../src/components/Settings"

// We need to test if the dialog renders and handles interactions
describe("Settings", () => {
  beforeEach(() => {
    useAppStore.setState({
      provider: "mimo",
      model: "mimo-v2.5-pro",
      apiKey: "",
      mode: "byok"
    })
  })

  it("renders the trigger button", () => {
    render(<Settings />)
    expect(screen.getByText("Settings")).toBeDefined()
  })

  it("auto-fixes gpt-4o model", () => {
    useAppStore.setState({ model: "gpt-4o", provider: "deepseek" })
    render(<Settings />)
    expect(useAppStore.getState().model).toBe("deepseek-v4-pro")
  })

  it("updates inputs", () => {
    useAppStore.setState({ mode: "byok" })
    render(<Settings />)

    // Simulate user typing in input (model id and api key)
    // First, open the dialog
    fireEvent.click(screen.getByText("Settings"))

    // Model ID input
    const modelInput = screen.getAllByRole("textbox")[0]
    fireEvent.change(modelInput!, { target: { value: "test-model" } })
    expect(useAppStore.getState().model).toBe("test-model")

    // API key input (password type so not standard textbox)
    const apiKeyInput = screen.getByPlaceholderText("sk-...")
    fireEvent.change(apiKeyInput!, { target: { value: "test-key" } })
    expect(useAppStore.getState().apiKey).toBe("test-key")
  })
})
