import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ThemeProvider } from "../ThemeProvider"
import { ThemeToggle } from "../ThemeToggle"

const pushGtag = vi.hoisted(() => vi.fn())

vi.mock("@/lib/tracking/ga4/gtag", () => ({
  pushGtag,
}))

const installMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    pushGtag.mockClear()
    localStorage.clear()
    document.documentElement.classList.remove("light", "dark")
    installMatchMedia(false)
  })

  it("switches to dark and records theme_toggle with the new value", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    const button = screen.getByRole("button", { name: "Przełącz na ciemny motyw" })
    expect(button.className).toContain("min-h-11")
    expect(button.className).toContain("min-w-11")

    fireEvent.click(button)

    expect(pushGtag).toHaveBeenCalledWith("event", "theme_toggle", { theme: "dark" })
    expect(localStorage.getItem("theme")).toBe("dark")
    expect(screen.getByRole("button", { name: "Przełącz na jasny motyw" })).toBeInTheDocument()
  })
})
