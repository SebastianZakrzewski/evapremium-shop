import { describe, expect, it } from "vitest";
import { getStickyMainImage, getStickyPreviewImage } from "../stickyPreview";

describe("getStickyPreviewImage", () => {
  const dynamicPreviewPath = "/dynamic.webp";
  const productPreviewPath = "/product.webp";
  const fallbackPath = "/fallback.webp";

  it("returns dynamic image when dynamic tab is active", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "dynamic",
      hasFullPreview: true,
      dynamicPreviewPath,
      productPreviewPath,
      fallbackPath,
    });

    expect(result).toBe(dynamicPreviewPath);
  });

  it("returns product image when product tab is active", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "product",
      hasFullPreview: true,
      dynamicPreviewPath,
      productPreviewPath,
      fallbackPath,
    });

    expect(result).toBe(productPreviewPath);
  });

  it("falls back to dynamic image when product is missing", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "product",
      hasFullPreview: true,
      dynamicPreviewPath,
      productPreviewPath: null,
      fallbackPath,
    });

    expect(result).toBe(dynamicPreviewPath);
  });

  it("falls back to fallback path when nothing is available", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "product",
      hasFullPreview: false,
      dynamicPreviewPath,
      productPreviewPath: null,
      fallbackPath,
    });

    expect(result).toBe(fallbackPath);
  });
});

describe("getStickyMainImage", () => {
  const dynamicPreviewPath = "/dynamic.webp";
  const fallbackPath = "/fallback.webp";

  it("returns dynamic image when full preview exists", () => {
    const result = getStickyMainImage({
      hasFullPreview: true,
      dynamicPreviewPath,
      fallbackPath,
    });

    expect(result).toBe(dynamicPreviewPath);
  });

  it("returns fallback when full preview is missing", () => {
    const result = getStickyMainImage({
      hasFullPreview: false,
      dynamicPreviewPath,
      fallbackPath,
    });

    expect(result).toBe(fallbackPath);
  });
});
