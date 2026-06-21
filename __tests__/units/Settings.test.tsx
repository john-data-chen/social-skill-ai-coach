import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { useAppStore } from "@/lib/store"

vi.mock("@/components/ui/select", () => {
  function MockSelect({
    value,
    onValueChange,
    children
  }: {
    value: string
    onValueChange: (val: string) => void
    children: React.ReactNode
  }) {
    return (
      <select
        data-testid="mock-select"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        {children}
      </select>
    )
  }
  function MockSelectItem({ value, children }: { value: string; children: React.ReactNode }) {
    return <option value={value}>{children}</option>
  }
  return {
    Select: MockSelect,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: MockSelectItem,
    SelectTrigger: () => null,
    SelectValue: () => null
  }
})

import { Settings } from "../../src/components/Settings"

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

  it("auto-fixes invalid model when dialog opens", () => {
    useAppStore.setState({ model: "invalid-model", provider: "deepseek", mode: "byok" })
    render(<Settings />)

    // Draft normalization only happens on open
    fireEvent.click(screen.getByText("Settings"))

    // Store shouldn't change until confirmed
    expect(useAppStore.getState().model).toBe("invalid-model")

    fireEvent.click(screen.getByText("Confirm"))
    expect(useAppStore.getState().model).toBe("deepseek-v4-pro")
  })

  it("changes in dialog do not affect store until confirmed", () => {
    useAppStore.setState({ mode: "byok", apiKey: "initial-key" })
    render(<Settings />)

    fireEvent.click(screen.getByText("Settings"))

    const apiKeyInput = screen.getByPlaceholderText("sk-...")
    fireEvent.change(apiKeyInput, { target: { value: "test-key" } })

    // Store unchanged
    expect(useAppStore.getState().apiKey).toBe("initial-key")

    // Cancel -> still unchanged
    fireEvent.click(screen.getByText("Cancel"))
    expect(useAppStore.getState().apiKey).toBe("initial-key")
  })

  it("updates store when confirmed", () => {
    useAppStore.setState({ mode: "byok", apiKey: "initial-key" })
    render(<Settings />)

    fireEvent.click(screen.getByText("Settings"))

    const apiKeyInput = screen.getByPlaceholderText("sk-...")
    fireEvent.change(apiKeyInput, { target: { value: "test-key" } })

    fireEvent.click(screen.getByText("Confirm"))
    expect(useAppStore.getState().apiKey).toBe("test-key")
  })

  it("updates model using select", () => {
    useAppStore.setState({ mode: "byok", provider: "mimo" })
    render(<Settings />)

    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    // index 0: mode, 1: provider, 2: model
    fireEvent.change(selects[2]!, { target: { value: "mimo-v2.5" } })

    fireEvent.click(screen.getByText("Confirm"))
    expect(useAppStore.getState().model).toBe("mimo-v2.5")
  })

  it("changes mode to demo", () => {
    useAppStore.setState({ mode: "byok" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    fireEvent.change(selects[0]!, { target: { value: "demo" } })
    fireEvent.click(screen.getByText("Confirm"))

    expect(useAppStore.getState().mode).toBe("demo")
  })

  it("changes provider and resets model", () => {
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    fireEvent.change(selects[1]!, { target: { value: "deepseek" } })
    fireEvent.click(screen.getByText("Confirm"))

    expect(useAppStore.getState().provider).toBe("deepseek")
    expect(useAppStore.getState().model).toBe("deepseek-v4-pro")
  })

  it("hides API key field when in demo mode", () => {
    useAppStore.setState({ mode: "demo" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    expect(screen.queryByPlaceholderText("sk-...")).toBeNull()
  })
})
