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

  it("auto-fixes gpt-4o model", () => {
    useAppStore.setState({ model: "gpt-4o", provider: "deepseek" })
    render(<Settings />)
    expect(useAppStore.getState().model).toBe("deepseek-v4-pro")
  })

  it("auto-fixes gpt-4o model for mimo provider", () => {
    useAppStore.setState({ model: "gpt-4o", provider: "mimo" })
    render(<Settings />)
    expect(useAppStore.getState().model).toBe("mimo-v2.5-pro")
  })

  it("updates model input", () => {
    useAppStore.setState({ mode: "byok" })
    render(<Settings />)

    fireEvent.click(screen.getByText("Settings"))

    const modelInput = screen.getAllByRole("textbox")[0]
    fireEvent.change(modelInput!, { target: { value: "test-model" } })
    expect(useAppStore.getState().model).toBe("test-model")
  })

  it("updates API key input", () => {
    useAppStore.setState({ mode: "byok" })
    render(<Settings />)

    fireEvent.click(screen.getByText("Settings"))

    const apiKeyInput = screen.getByPlaceholderText("sk-...")
    fireEvent.change(apiKeyInput!, { target: { value: "test-key" } })
    expect(useAppStore.getState().apiKey).toBe("test-key")
  })

  it("changes mode to demo", () => {
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    fireEvent.change(selects[0]!!, { target: { value: "demo" } })

    expect(useAppStore.getState().mode).toBe("demo")
  })

  it("changes mode to byok", () => {
    useAppStore.setState({ mode: "demo" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    fireEvent.change(selects[0]!, { target: { value: "byok" } })

    expect(useAppStore.getState().mode).toBe("byok")
  })

  it("changes provider to deepseek", () => {
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    fireEvent.change(selects[1]!, { target: { value: "deepseek" } })

    expect(useAppStore.getState().provider).toBe("deepseek")
    expect(useAppStore.getState().model).toBe("deepseek-v4-pro")
  })

  it("changes provider to mimo", () => {
    useAppStore.setState({ provider: "deepseek", model: "deepseek-v4-pro" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    fireEvent.change(selects[1]!, { target: { value: "mimo" } })

    expect(useAppStore.getState().provider).toBe("mimo")
    expect(useAppStore.getState().model).toBe("mimo-v2.5-pro")
  })

  it("hides API key field when in demo mode", () => {
    useAppStore.setState({ mode: "demo" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    expect(screen.queryByPlaceholderText("sk-...")).toBeNull()
  })

  it("shows API key field when in byok mode", () => {
    useAppStore.setState({ mode: "byok" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    expect(screen.getByPlaceholderText("sk-...")).toBeDefined()
  })
})
