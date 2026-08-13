import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TeslaTrimOption } from "./TeslaTrimOption"
import { MAT_TYPE_OPTION_ICON_SIZE, MAT_TYPE_OPTION_ICON_SRC_SIZE } from "../mat-type/matTypePresentation"

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string
    alt?: string
    width?: number
    height?: number
    className?: string
  }) => (
    <img
      src={src}
      alt={alt ?? ""}
      width={width}
      height={height}
      className={className}
    />
  ),
}))

describe("TeslaTrimOption", () => {
  it("renders icon on the far left when provided", () => {
    render(
      <TeslaTrimOption
        selected={false}
        title="3D z rantami"
        subtitle="Wysokie ranty"
        iconSrc="/konfigurator/typ-dywanika/3d-z-rantami.png"
        iconAlt="Dywanik 3D z rantami"
        onSelect={() => undefined}
      />,
    )

    const icon = screen.getByRole("img", { name: "Dywanik 3D z rantami" })
    expect(icon).toHaveAttribute("src", "/konfigurator/typ-dywanika/3d-z-rantami.png")
    expect(icon).toHaveAttribute("width", String(MAT_TYPE_OPTION_ICON_SRC_SIZE))
    expect(icon).toHaveAttribute("height", String(MAT_TYPE_OPTION_ICON_SRC_SIZE))
    expect(icon).toHaveClass("rounded-lg")
  })
})
