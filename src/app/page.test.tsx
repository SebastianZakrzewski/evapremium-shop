import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Home from "./page"

vi.mock("@/features/marketing", () => ({
  HeroSection: () => <section aria-label="Sekcja promocyjna">hero</section>,
}))

vi.mock("@/components/quick-search-bar", () => ({
  default: () => <section id="quick-search">search</section>,
}))

vi.mock("@/features/products", () => ({
  ProductGallerySection: () => <section aria-label="Galeria">gallery</section>,
  ProductSelection: () => <section aria-label="Wybór">selection</section>,
}))

vi.mock("next/dynamic", () => ({
  default: () => () => null,
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
