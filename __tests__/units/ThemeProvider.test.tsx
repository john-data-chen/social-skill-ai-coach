import { render } from "@testing-library/react"
import { describe, it, expect } from "vitest"

import { ThemeProvider } from "../../src/components/ThemeProvider"

describe("ThemeProvider", () => {
  it("renders children without crashing", () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    )
    expect(getByText("Test Child")).toBeDefined()
  })
})
