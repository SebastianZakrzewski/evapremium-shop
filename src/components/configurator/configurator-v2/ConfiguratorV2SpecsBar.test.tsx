import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ConfiguratorV2SpecsBar } from "./ConfiguratorV2SpecsBar"

describe("ConfiguratorV2SpecsBar", () => {
  it("shows brand, model and generation on every viewport, next to the year", () => {
    render(
      <ConfiguratorV2SpecsBar
        title="Hyundai Accent 4 gen"
        year="2000"
      />,
    )

    const title = screen.getByRole("heading", { name: "Hyundai Accent 4 gen" })
    expect(title).toBeVisible()
    expect(title.className).not.toContain("hidden")
    expect(screen.getByText("2000")).toBeVisible()
  })
})
