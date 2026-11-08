import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { Brand } from "@/entities/car"
import { useConfiguratorState } from "./useConfiguratorState"

const storageKey = "configurator-v2-state"

const savedVehicle = {
  brand: "Hyundai",
  model: "Tucson",
  year: "2024",
  gearbox: "Automatyczna",
  variant: "front",
  matType: "classic",
  structure: "honey",
  color: "black",
  edgeColor: "black",
}

describe("useConfiguratorState", () => {
  it("starts a brand and model from the link without restoring a saved configuration", async () => {
    localStorage.setItem(`${storageKey}::hyundai::tucson`, JSON.stringify(savedVehicle))

    const { result } = renderHook(() =>
      useConfiguratorState({
        searchParams: new URLSearchParams("brand=hyundai&model=tucson&bodyType=suv"),
        brands: [],
        storageKey,
      }),
    )

    await waitFor(() => expect(result.current.config.model.toLowerCase()).toContain("tucson"))
    expect(result.current.config.year).toBe("")
    expect(result.current.config.gearbox).toBe("")
    expect(result.current.config.variant).toBe("")
    expect(result.current.config.matType).toBe("3d-with-rims")
    expect(result.current.config.structure).toBe("diamonds")
    expect(result.current.config.color).toBe("black")
    expect(result.current.config.bodyType.toLowerCase()).toBe("suv")
  })

  it("starts a different brand and model from defaults", async () => {
    localStorage.setItem(
      `${storageKey}::hyundai::tucson`,
      JSON.stringify(savedVehicle),
    )
    localStorage.setItem(
      `${storageKey}::bmw::x5`,
      JSON.stringify({
        ...savedVehicle,
        model: "X5",
        year: "2019",
        gearbox: "Manualna",
        variant: "basic",
        matType: "classic",
        structure: "honey",
        color: "red",
        edgeColor: "grey",
        heelPad: true,
      }),
    )

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) =>
        useConfiguratorState({
          searchParams: new URLSearchParams(query),
          brands: [],
          storageKey,
        }),
      { initialProps: { query: "brand=hyundai&model=tucson" } },
    )

    await waitFor(() => expect(result.current.config.model.toLowerCase()).toContain("tucson"))
    expect(result.current.config.year).toBe("")
    rerender({ query: "brand=bmw&model=x5" })
    await waitFor(() => expect(result.current.config.model.toLowerCase()).toContain("x5"))
    expect(result.current.config.year).toBe("")
    expect(result.current.config.gearbox).toBe("")
    expect(result.current.config.variant).toBe("")
    expect(result.current.config.matType).toBe("3d-with-rims")
    expect(result.current.config.structure).toBe("diamonds")
    expect(result.current.config.color).toBe("black")
    expect(result.current.config.edgeColor).toBe("black")
    expect(result.current.config.heelPad).toBe(false)
    expect(JSON.parse(localStorage.getItem(`${storageKey}::hyundai::tucson`) || "{}").year).toBe("2024")
  })

  it("keeps a manual year when the brand list arrives and the year query stays", async () => {
    const { result, rerender } = renderHook(
      ({ brands }: { brands: Brand[] }) =>
        useConfiguratorState({
          searchParams: new URLSearchParams("brand=hyundai&model=tucson&year=2024"),
          brands,
          storageKey,
        }),
      { initialProps: { brands: [] as Brand[] } },
    )

    await waitFor(() => expect(result.current.config.model.toLowerCase()).toContain("tucson"))
    result.current.updateConfig({ year: "2023" })
    rerender({ brands: [{ id: 1, name: "Hyundai", logo: "/hyundai.webp" }] })
    await waitFor(() => expect(result.current.config.year).toBe("2023"))
  })

  it("applies a later year link and rejects a year that is not four digits", async () => {
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) =>
        useConfiguratorState({
          searchParams: new URLSearchParams(query),
          brands: [],
          storageKey,
        }),
      { initialProps: { query: "brand=hyundai&model=tucson&year=2024" } },
    )

    await waitFor(() => expect(result.current.config.model.toLowerCase()).toContain("tucson"))
    result.current.updateConfig({ year: "2024" })
    rerender({ query: "brand=hyundai&model=tucson&year=2020" })
    await waitFor(() => expect(result.current.config.year).toBe("2020"))
    rerender({ query: "brand=hyundai&model=tucson&year=abc" })
    await waitFor(() => expect(result.current.config.year).toBe(""))
  })

  it("ignores broken storage instead of throwing", async () => {
    localStorage.setItem(`${storageKey}::hyundai::tucson`, "{")

    const { result } = renderHook(() =>
      useConfiguratorState({
        searchParams: new URLSearchParams("brand=hyundai&model=tucson"),
        brands: [],
        storageKey,
      }),
    )

    await waitFor(() => expect(result.current.config.model.toLowerCase()).toContain("tucson"))
    expect(result.current.config.year).toBe("")
    expect(result.current.config.gearbox).toBe("")
  })
})
