import { render, screen, fireEvent } from "@testing-library/react"
import * as nextThemes from "next-themes"
import { describe, it, expect, vi } from "vitest"

import { ThemeToggle } from "../ThemeToggle"

vi.mock("next-themes", () => ({
  useTheme: vi.fn()
}))

describe("ThemeToggle", () => {
  it("toggles theme from light to dark", () => {
    const setTheme = vi.fn()
    vi.mocked(nextThemes.useTheme).mockReturnValue({ theme: "light", setTheme } as any)

    render(<ThemeToggle />)
    const btn = screen.getByRole("button")
    fireEvent.click(btn)

    expect(setTheme).toHaveBeenCalledWith("dark")
  })

  it("toggles theme from dark to light", () => {
    const setTheme = vi.fn()
    vi.mocked(nextThemes.useTheme).mockReturnValue({ theme: "dark", setTheme } as any)

    render(<ThemeToggle />)
    const btn = screen.getByRole("button")
    fireEvent.click(btn)

    expect(setTheme).toHaveBeenCalledWith("light")
  })
})
