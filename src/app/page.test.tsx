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

describe("Home lead order", () => {
  it("opens with the hero and keeps the vehicle search inside it", () => {
    render(<Home />)

    expect(screen.getByRole("region", { name: "Sekcja promocyjna" })).toBeInTheDocument()
    expect(document.getElementById("quick-search")).toBeNull()
  })
})
