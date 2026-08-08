import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MatTypeOptionIcon } from "./MatTypeOptionIcon"
import { MAT_TYPE_OPTION_ICON_SRC_SIZE } from "./matTypePresentation"

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
    unoptimized,
  }: {
    src: string
    alt?: string
    width?: number
    height?: number
    className?: string
    unoptimized?: boolean
  }) => (
    <img
      src={src}
      alt={alt ?? ""}
      width={width}
      height={height}
      className={className}
      data-unoptimized={unoptimized ? "true" : "false"}
    />
  ),
}))

describe("MatTypeOptionIcon", () => {
  it("renders unoptimized high-resolution source for crisp display", () => {
    render(
      <MatTypeOptionIcon
        src="/konfigurator/typ-dywanika/3d-z-rantami.png"
        alt="Dywanik 3D z rantami"
      />,
    )

    const icon = screen.getByRole("img", { name: "Dywanik 3D z rantami" })
    expect(icon).toHaveAttribute("data-unoptimized", "true")
    expect(icon).toHaveAttribute("width", String(MAT_TYPE_OPTION_ICON_SRC_SIZE))
    expect(icon).toHaveAttribute("height", String(MAT_TYPE_OPTION_ICON_SRC_SIZE))
    expect(icon).toHaveClass("object-contain")
  })
})
