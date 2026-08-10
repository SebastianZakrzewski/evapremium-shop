import "@testing-library/jest-dom/vitest"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { AccessoriesStep } from "./AccessoriesStep"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import type { Accessory } from "@/entities/product"

const mockAccessory: Accessory = {
  id: "podpietka-1",
  name: "Podpiętka gumowa",
  slug: "podpietka-gumowa",
  price: 50,
  sku: "POD-GUM",
  inStock: true,
  isActive: true,
  productType: "podpietka",
  availableColors: ["Czarny"],
  images: ["/test.webp"],
  categoryId: 1,
  features: [],
  reviewCount: 0,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
}

vi.mock("@/features/accessories/hooks/useAccessories", () => ({
  useAccessories: () => ({
    accessories: [mockAccessory],
    isLoading: false,
  }),
}))

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt?: string
  }) => <img src={src} alt={alt ?? ""} {...props} />,
}))

vi.mock("@/components/products/accessories/accessory-details-sheet", () => ({
  default: ({
    isOpen,
    onAddToConfig,
    accessory,
  }: {
    isOpen: boolean
    onAddToConfig?: (accessory: Accessory, color?: string) => void
    accessory: Accessory
  }) =>
    isOpen ? (
      <button
        type="button"
        onClick={() => onAddToConfig?.(accessory, "Czarny")}
      >
        Dodaj do konfiguracji
      </button>
    ) : null,
}))

const baseConfig: ConfiguratorState = {
  brand: "Audi",
  brandKey: "audi",
  model: "A4",
  modelFamilyKey: "a4",
  modelKey: "a4",
  generation: "",
  templateId: "",
  recordKey: "",
  year: "2020",
  bodyType: "Sedan",
  bodyTypeKey: "sedan",
  pricingCategoryKey: "passenger_car",
  catalogVersionCode: "",
  matType: "3d-with-rims",
  variant: "basic",
  structure: "diamonds",
  color: "black",
  edgeColor: "black",
  heelPad: false,
  selectedPodpietka: undefined,
  podpietkaColor: undefined,
  podpietkaMounting: undefined,
}

describe("AccessoriesStep mounting flow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("opens mounting modal after adding podpietka and saves professional choice", async () => {
    const onUpdate = vi.fn()
    render(
      <AccessoriesStep
        config={baseConfig}
        onUpdate={onUpdate}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByLabelText(/Wybierz podpiętkę Podpiętka gumowa/i))
    fireEvent.click(screen.getByText("Dodaj do konfiguracji"))

    expect(await screen.findByText("Montaż podpiętki")).toBeInTheDocument()
    expect(onUpdate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("button", { name: /Montaż przez nas/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        selectedPodpietka: "podpietka-1",
        podpietkaColor: "Czarny",
        podpietkaMounting: "professional",
      })
    })
  })

  it("does not save podpietka when mounting modal is cancelled", async () => {
    const onUpdate = vi.fn()
    render(
      <AccessoriesStep
        config={baseConfig}
        onUpdate={onUpdate}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByLabelText(/Wybierz podpiętkę Podpiętka gumowa/i))
    fireEvent.click(screen.getByText("Dodaj do konfiguracji"))

    expect(await screen.findByText("Montaż podpiętki")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Zamknij" }))

    expect(onUpdate).not.toHaveBeenCalled()
    expect(screen.queryByText("Montaż podpiętki")).not.toBeInTheDocument()
  })

  it("clears mounting when podpietka is removed", () => {
    const onUpdate = vi.fn()
    render(
      <AccessoriesStep
        config={{
          ...baseConfig,
          selectedPodpietka: "podpietka-1",
          podpietkaColor: "Czarny",
          podpietkaMounting: "professional",
        }}
        onUpdate={onUpdate}
        onNext={vi.fn()}
        onPrevious={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText("Usuń"))
    expect(onUpdate).toHaveBeenCalledWith({
      selectedPodpietka: undefined,
      podpietkaColor: undefined,
      podpietkaMounting: undefined,
    })
  })
})
