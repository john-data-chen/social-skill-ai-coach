import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { MODELS } from "@/lib/ai"
import { useAppStore } from "@/lib/store"

vi.mock("@/components/ui/select", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createContext, useContext } = require("react") as typeof import("react")
  const SelectCtx = createContext<string | undefined>(undefined)

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
      <SelectCtx.Provider value={value}>
        <select
          data-testid="mock-select"
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value)
          }}
        >
          {children}
        </select>
      </SelectCtx.Provider>
    )
  }
  function MockSelectItem({ value, children }: { value: string; children: React.ReactNode }) {
    return <option value={value}>{children}</option>
  }
  function MockSelectValue({ children }: any) {
    const val = useContext(SelectCtx)
    return typeof children === "function" ? children(val) : (val ?? null)
  }
  return {
    Select: MockSelect,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: MockSelectItem,
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: MockSelectValue
  }
})

import { Settings } from "../../src/components/Settings"

describe("Settings", () => {
  beforeEach(() => {
    useAppStore.setState({
      provider: "mimo",
      model: MODELS.mimo[0],
      apiKey: "",
      mode: "byok"
    })
  })

  it("renders the trigger button", () => {
    render(<Settings />)
    expect(screen.getByText("Settings")).toBeDefined()
  })

  it("auto-fixes invalid model when dialog opens", () => {
    useAppStore.setState({
      model: "invalid-model",
      provider: "deepseek",
      mode: "byok",
      apiKey: "test-key"
    })
    render(<Settings />)

    // Draft normalization only happens on open
    fireEvent.click(screen.getByText("Settings"))

    // Store shouldn't change until confirmed
    expect(useAppStore.getState().model).toBe("invalid-model")

    fireEvent.click(screen.getByText("Confirm"))
    expect(useAppStore.getState().model).toBe(MODELS.deepseek[0])
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
    useAppStore.setState({ mode: "byok", apiKey: "initial-key", baseUrl: "https://test" })
    render(<Settings />)

    fireEvent.click(screen.getByText("Settings"))

    const apiKeyInput = screen.getByPlaceholderText("sk-...")
    fireEvent.change(apiKeyInput, { target: { value: "test-key" } })

    fireEvent.click(screen.getByText("Confirm"))
    expect(useAppStore.getState().apiKey).toBe("test-key")
  })

  it("updates model using select", () => {
    useAppStore.setState({
      mode: "byok",
      provider: "mimo",
      apiKey: "test-key",
      baseUrl: "https://test"
    })
    render(<Settings />)

    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    // index 0: mode, 1: provider, 2: model
    fireEvent.change(selects[2]!, { target: { value: MODELS.mimo[1] } })

    fireEvent.click(screen.getByText("Confirm"))
    expect(useAppStore.getState().model).toBe(MODELS.mimo[1])
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
    useAppStore.setState({ apiKey: "test-key" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    fireEvent.change(selects[1]!, { target: { value: "deepseek" } })
    fireEvent.click(screen.getByText("Confirm"))

    expect(useAppStore.getState().provider).toBe("deepseek")
    expect(useAppStore.getState().model).toBe(MODELS.deepseek[0])
  })

  it("hides API key field when in demo mode", () => {
    useAppStore.setState({ mode: "demo" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    expect(screen.queryByPlaceholderText("sk-...")).toBeNull()
  })

  it("updates base URL input", () => {
    useAppStore.setState({ mode: "byok", provider: "mimo", baseUrl: "", apiKey: "test-key" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    const baseUrlInput = screen.getByPlaceholderText(/token-plan/i)
    fireEvent.change(baseUrlInput, { target: { value: "https://custom.example.com/v1" } })

    fireEvent.click(screen.getByText("Confirm"))
    expect(useAppStore.getState().baseUrl).toBe("https://custom.example.com/v1")
  })

  it("hides base URL field for deepseek provider", () => {
    useAppStore.setState({ mode: "byok", provider: "deepseek" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    expect(screen.queryByPlaceholderText(/token-plan/i)).toBeNull()
  })

  it("hides base URL field in demo mode", () => {
    useAppStore.setState({ mode: "demo", provider: "mimo" })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    expect(screen.queryByPlaceholderText(/token-plan/i)).toBeNull()
  })

  it("normalizes model to first allowed when switching provider", () => {
    useAppStore.setState({
      provider: "mimo",
      model: MODELS.mimo[1],
      mode: "byok",
      apiKey: "test-key"
    })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    const selects = screen.getAllByTestId("mock-select")
    fireEvent.change(selects[1]!, { target: { value: "deepseek" } })
    fireEvent.click(screen.getByText("Confirm"))

    expect(useAppStore.getState().model).toBe(MODELS.deepseek[0])
  })

  it("falls back to grok models for unknown provider", () => {
    useAppStore.setState({
      provider: "unknown" as any,
      model: "retired-model-id",
      mode: "byok",
      apiKey: "test-key"
    })
    render(<Settings />)
    fireEvent.click(screen.getByText("Settings"))

    fireEvent.click(screen.getByText("Confirm"))
    expect(useAppStore.getState().model).toBe(MODELS.deepseek[0])
  })
})
