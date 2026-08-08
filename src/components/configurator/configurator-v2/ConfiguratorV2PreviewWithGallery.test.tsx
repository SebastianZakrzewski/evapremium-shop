import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConfiguratorV2PreviewWithGallery } from "./ConfiguratorV2PreviewWithGallery"

const items = [
  {
    id: "dynamic",
    imageUrl: "/dywaniki/test.webp",
    altText: "Konfiguracja",
    kind: "dynamic" as const,
  },
  {
    id: "model-template-1",
    imageUrl: "/mat/1.webp",
    altText: "Schemat modelu",
    kind: "model-template" as const,
  },
]

describe("ConfiguratorV2PreviewWithGallery", () => {
  it("renders mobile gallery below hero instead of overlaying it", () => {
    const { container } = render(
      <ConfiguratorV2PreviewWithGallery
        layout="mobile"
        imageSrc="/mat/1.webp"
        alt="Podgląd"
        showGallery
        galleryItems={items}
        activeGalleryId="model-template-1"
        onSelectGalleryItem={vi.fn()}
      />,
    )

    expect(
      container.querySelector(".absolute.inset-x-0.bottom-0"),
    ).not.toBeInTheDocument()
    expect(screen.getByRole("list", { name: "Galeria zdjęć podglądowych" }))
      .toBeInTheDocument()
  })
})
