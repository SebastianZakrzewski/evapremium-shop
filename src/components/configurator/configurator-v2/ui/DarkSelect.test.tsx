import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DarkSelect } from "./DarkSelect"

describe("DarkSelect", () => {
  it("opens a dark list and reports the chosen value", () => {
    const onChange = vi.fn()

    render(
      <DarkSelect
        id="year"
        value=""
        placeholder="Wybierz rok"
        ariaLabel="Wybierz rok produkcji"
        options={[
          { value: "2011", label: "2011" },
          { value: "2010", label: "2010" },
        ]}
        onChange={onChange}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Wybierz rok produkcji" }))
    const list = screen.getByRole("listbox", { name: "Wybierz rok produkcji" })
    expect(list).toHaveClass("bg-black")

    fireEvent.click(screen.getByRole("option", { name: "2011" }))
    expect(onChange).toHaveBeenCalledWith("2011")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })
})
