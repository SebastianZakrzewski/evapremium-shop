import "@testing-library/jest-dom/vitest"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConfiguratorV2PreviewWithGallery } from "./ConfiguratorV2PreviewWithGallery"
import { MobilePreviewDockProvider } from "./MobilePreviewDockContext"

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

  it("renders realization caption under the preview image", () => {
    render(
      <ConfiguratorV2PreviewWithGallery
        layout="desktop"
        imageSrc="/realization/1.png"
        alt="Podgląd"
        showGallery
        galleryItems={[
          {
            id: "in-car-photo-1",
            imageUrl: "/realization/1.png",
            altText: "Realizacja",
            kind: "in-car-photo",
          },
        ]}
        activeGalleryId="in-car-photo-1"
        onSelectGalleryItem={vi.fn()}
        realizationCaption="Są to realne zdjęcia realizacji dywaników 3D z rantami do Nissan Qashqai(J12) III gen 2021-2028"
      />,
    )

    expect(screen.getByRole("note")).toHaveTextContent(
      "Są to realne zdjęcia realizacji dywaników 3D z rantami do Nissan Qashqai(J12) III gen 2021-2028",
    )
  })

  it("fits the whole product photo inside the preview without stretching it", () => {
    render(
      <ConfiguratorV2PreviewWithGallery
        layout="desktop"
        imageSrc="/mat/1.webp"
        alt="Podgląd"
        showGallery
        galleryItems={items}
        activeGalleryId="model-template-1"
        onSelectGalleryItem={vi.fn()}
      />,
    )

    const preview = screen.getByAltText("Podgląd")
    expect(preview).toHaveClass("object-contain", "h-full", "w-full")
    expect(preview).not.toHaveClass("h-auto")
    expect(preview).not.toHaveClass("object-cover")
    expect(preview.parentElement).toHaveClass("bg-white")
  })

  it("keeps a docked mobile product photo fully visible", () => {
    render(
      <MobilePreviewDockProvider docked>
        <ConfiguratorV2PreviewWithGallery
          layout="mobile"
          imageSrc="/mat/1.webp"
          alt="Podgląd"
          showGallery
          galleryItems={items}
          activeGalleryId="model-template-1"
          onSelectGalleryItem={vi.fn()}
        />
      </MobilePreviewDockProvider>,
    )

    const preview = screen.getByAltText("Podgląd")
    const frame = screen.getByRole("button", { name: "Powiększ: Podgląd" })
    expect(preview).toHaveClass("object-contain")
    expect(preview.parentElement?.parentElement).toHaveClass("scale-100")
    expect(preview.parentElement?.parentElement).not.toHaveClass("scale-110")
    expect(frame).toHaveClass("h-[52vw]", "max-h-[320px]")
    expect(frame).not.toHaveClass("h-[38vh]")
  })
})
