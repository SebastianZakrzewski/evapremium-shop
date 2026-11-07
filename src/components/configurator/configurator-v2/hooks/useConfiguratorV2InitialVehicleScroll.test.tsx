import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useConfiguratorV2InitialVehicleScroll } from "./useConfiguratorV2InitialVehicleScroll"

describe("useConfiguratorV2InitialVehicleScroll", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  it("does not move the options pane when a mobile entry target becomes ready", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("max-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    document.body.innerHTML = `
      <main data-testid="options">
        <section id="vehicle-year">Rok</section>
      </main>
    `
    const main = document.querySelector("main") as HTMLElement
    main.scrollTop = 0
    const scrollTo = vi.fn()
    main.scrollTo = scrollTo

    renderHook(() =>
      useConfiguratorV2InitialVehicleScroll({
        scrollTargetId: "vehicle-year",
        isReady: true,
      }),
    )

    expect(scrollTo).not.toHaveBeenCalled()
    expect(main.scrollTop).toBe(0)
  })
})
