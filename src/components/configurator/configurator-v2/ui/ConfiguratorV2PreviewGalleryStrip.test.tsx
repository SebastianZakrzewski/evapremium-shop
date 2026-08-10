import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { ConfiguratorV2PreviewGalleryStrip } from "./ConfiguratorV2PreviewGalleryStrip"

const items = [
  {
    id: "dynamic",
    imageUrl: "/dywaniki/test.webp",
    altText: "Konfiguracja",
    kind: "dynamic" as const,
  },
  {
    id: "model-template-1",
    imageUrl: "/mat/template.webp",
    altText: "Schemat modelu",
    kind: "model-template" as const,
  },
  {
    id: "in-car-photo-2",
    imageUrl: "/mat/2.webp",
    altText: "Zdjęcie 2",
    kind: "in-car-photo" as const,
  },
]

describe("ConfiguratorV2PreviewGalleryStrip", () => {
  it("selects gallery item on thumbnail tap", () => {
    const onSelect = vi.fn()

    render(
      <ConfiguratorV2PreviewGalleryStrip
        items={items}
        activeId="dynamic"
        onSelect={onSelect}
      />,
    )

    fireEvent.keyDown(screen.getByRole("listitem", { name: "Schemat modelu" }), {
      key: "Enter",
    })
    expect(onSelect).toHaveBeenCalledWith("model-template-1")
  })

  it("does not select thumbnail after drag gesture", () => {
    const onSelect = vi.fn()

    render(
      <ConfiguratorV2PreviewGalleryStrip
        items={items}
        activeId="dynamic"
        onSelect={onSelect}
      />,
    )

    const thumbnail = screen.getByRole("listitem", { name: "Schemat modelu" })
    const list = screen.getByRole("list", { name: "Galeria zdjęć podglądowych" })

    fireEvent.pointerDown(thumbnail, { button: 0, pointerId: 1 })
    fireEvent.pointerMove(list, { button: 0, pointerId: 1, clientX: 80 })
    fireEvent.pointerUp(list, { button: 0, pointerId: 1, clientX: 80 })

    expect(onSelect).not.toHaveBeenCalled()
  })

  it("navigates with next button", () => {
    const onSelect = vi.fn()

    render(
      <ConfiguratorV2PreviewGalleryStrip
        items={items}
        activeId="dynamic"
        onSelect={onSelect}
      />,
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Następne zdjęcie w galerii" }),
    )
    expect(onSelect).toHaveBeenCalledWith("model-template-1")
  })

  it("renders strip with empty in-car placeholders for a single model item", () => {
    render(
      <ConfiguratorV2PreviewGalleryStrip
        items={[items[1]!]}
        activeId="model-template-1"
        onSelect={vi.fn()}
        showEmptyInCarSlot
      />,
    )

    expect(screen.getByRole("list", { name: "Galeria zdjęć podglądowych" }))
      .toBeInTheDocument()
    expect(
      screen.getByRole("group", { name: "Zdjęcia w aucie — wkrótce" }),
    ).toBeInTheDocument()
  })

  it("renders nothing when there are no items and no placeholder", () => {
    const { container } = render(
      <ConfiguratorV2PreviewGalleryStrip
        items={[]}
        activeId={null}
        onSelect={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
