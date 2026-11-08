import { describe, expect, it } from "vitest"
import { shouldServeModelProductPhotoOriginal } from "@/shared/images/modelProductPhoto"

describe("shouldServeModelProductPhotoOriginal", () => {
  it("serves stored product photos without Next compression", () => {
    expect(
      shouldServeModelProductPhotoOriginal(
        "https://kmepxyervpeujwvgdqtm.supabase.co/storage/v1/object/public/product-images/products/hyundai/accent-4-gen-sedan-wide.webp?v=20261106w",
      ),
    ).toBe(true)
    expect(
      shouldServeModelProductPhotoOriginal("/images/products/bmw/BMW_X5.png"),
    ).toBe(true)
  })

  it("leaves logos and placeholders on the optimizer", () => {
    expect(shouldServeModelProductPhotoOriginal("/modele/hyundai.avif")).toBe(
      false,
    )
    expect(shouldServeModelProductPhotoOriginal("/vercel.svg")).toBe(false)
  })
})
