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

  it("names the field with the selected year", () => {
    render(
      <DarkSelect
        id="year"
        value="2015"
        placeholder="Wybierz rok"
        ariaLabel="Rok produkcji"
        options={[
          { value: "2015", label: "2015" },
          { value: "2014", label: "2014" },
        ]}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: "Rok produkcji, 2015" })).toBeInTheDocument()
  })

  it("keeps an enabled light placeholder darker than a disabled one only on white", () => {
    const { rerender } = render(
      <DarkSelect
        id="brand"
        value=""
        placeholder="Wybierz markę"
        ariaLabel="Marka"
        options={[]}
        surface="light"
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText("Wybierz markę")).toHaveClass("text-[#525252]")
    expect(screen.getByRole("button", { name: "Marka" })).not.toHaveClass("disabled:opacity-50")

    rerender(
      <DarkSelect
        id="model"
        value=""
        placeholder="Wybierz model"
        ariaLabel="Model"
        options={[]}
        surface="light"
        disabled
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText("Wybierz model")).toHaveClass("text-[#737373]", "dark:text-[#8d8d8d]")
  })
})
