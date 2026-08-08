import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TeslaSwatchRow } from "./TeslaSwatchRow"
import { MATERIAL_COLOR_SWATCH_SIZE } from "../material-color/materialColorPresentation"

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    unoptimized,
    className,
  }: {
    src: string
    alt?: string
    width?: number
    height?: number
    unoptimized?: boolean
    className?: string
  }) => (
    <img
      src={src}
      alt={alt ?? ""}
      width={width}
      height={height}
      data-unoptimized={unoptimized ? "true" : "false"}
      className={className}
    />
  ),
}))

describe("TeslaSwatchRow", () => {
  it("renders material texture icon instead of flat color when imageSrc is provided", () => {
    render(
      <TeslaSwatchRow
        items={[
          {
            id: "red",
            label: "Czerwony",
            color: "#d12d1c",
            imageSrc: "/konfigurator/kolor-materialu/red.png",
          },
        ]}
        selectedId="red"
        onSelect={() => undefined}
      />,
    )

    const button = screen.getByRole("button", { name: "Czerwony" })
    expect(button).not.toHaveStyle({ backgroundColor: "rgb(209, 45, 28)" })

    const icon = button.querySelector("img")
    expect(icon).toHaveAttribute("src", "/konfigurator/kolor-materialu/red.png")
    expect(icon).toHaveAttribute("data-unoptimized", "true")
    expect(icon).toHaveAttribute("width", String(MATERIAL_COLOR_SWATCH_SIZE))
  })
})
