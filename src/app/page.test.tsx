import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Home from "./page"

vi.mock("@/features/marketing", () => ({
  HeroSection: () => <section aria-label="Sekcja promocyjna">hero</section>,
}))

vi.mock("./HomeBelowFold", () => ({
  HomeBelowFold: () => null,
}))

vi.mock("@/components/quick-search-bar", () => ({
  default: () => <section id="quick-search">search</section>,
}))

describe("Home lead order", () => {
  it("places the mat picker above the hero on every viewport", () => {
    render(<Home />)

    const hero = screen.getByRole("region", { name: "Sekcja promocyjna" })
    const search = document.getElementById("quick-search")

    expect(search).not.toBeNull()
    expect((search as HTMLElement).compareDocumentPosition(hero)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})
