import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { PodpietkaMountingModal } from "./PodpietkaMountingModal"

describe("PodpietkaMountingModal", () => {
  it("renders mounting options when open", () => {
    render(
      <PodpietkaMountingModal
        isOpen
        onClose={vi.fn()}
        onSelect={vi.fn()}
        accessoryName="Podpiętka gumowa"
      />,
    )

    expect(screen.getByText("Montaż podpiętki")).toBeInTheDocument()
    expect(
      screen.getByText(/Czy „Podpiętka gumowa” ma być zamontowana przez nas\?/),
    ).toBeInTheDocument()
    expect(screen.getByText("Montaż przez nas")).toBeInTheDocument()
    expect(screen.getByText("Montaż indywidualny")).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    render(
      <PodpietkaMountingModal
        isOpen={false}
        onClose={vi.fn()}
        onSelect={vi.fn()}
      />,
    )

    expect(screen.queryByText("Montaż podpiętki")).not.toBeInTheDocument()
  })

  it("calls onSelect with professional when first option is clicked", () => {
    const onSelect = vi.fn()
    render(
      <PodpietkaMountingModal
        isOpen
        onClose={vi.fn()}
        onSelect={onSelect}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /Montaż przez nas/i }))
    expect(onSelect).toHaveBeenCalledWith("professional")
  })

  it("calls onSelect with self when second option is clicked", () => {
    const onSelect = vi.fn()
    render(
      <PodpietkaMountingModal
        isOpen
        onClose={vi.fn()}
        onSelect={onSelect}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /Montaż indywidualny/i }))
    expect(onSelect).toHaveBeenCalledWith("self")
  })

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn()
    render(
      <PodpietkaMountingModal
        isOpen
        onClose={onClose}
        onSelect={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Zamknij" }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
