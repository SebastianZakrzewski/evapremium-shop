import { describe, expect, it } from "vitest";
import {
  getMobileStickyPreviewHeightPx,
  getMobileStickyStackHeightPx,
  getStickyMainImage,
  getStickyPreviewImage,
} from "../stickyPreview";

describe("getStickyPreviewImage", () => {
  const dynamicPreviewPath = "/dynamic.webp";
  const productPreviewPath = "/product.webp";
  const fallbackPath = "/fallback.webp";

  const matProductImage = "/mat-model.webp";

  it("returns dynamic image when dynamic tab is active", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "dynamic",
      hasFullPreview: true,
      dynamicPreviewPath,
      productPreviewPath,
      matProductImage,
      fallbackPath,
    });

    expect(result).toBe(dynamicPreviewPath);
  });

  it("returns mat-product image when mat-product tab is active", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "mat-product",
      hasFullPreview: false,
      dynamicPreviewPath,
      productPreviewPath: null,
      matProductImage,
      fallbackPath,
    });

    expect(result).toBe(matProductImage);
  });

  it("returns product image when product tab is active", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "product",
      hasFullPreview: true,
      dynamicPreviewPath,
      productPreviewPath,
      matProductImage: null,
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
      matProductImage: null,
      fallbackPath,
    });

    expect(result).toBe(dynamicPreviewPath);
  });

  it("falls back to mat product before fallback path", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "product",
      hasFullPreview: false,
      dynamicPreviewPath,
      productPreviewPath: null,
      matProductImage,
      fallbackPath,
    });

    expect(result).toBe(matProductImage);
  });

  it("falls back to fallback path when nothing is available", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "product",
      hasFullPreview: false,
      dynamicPreviewPath,
      productPreviewPath: null,
      matProductImage: null,
      fallbackPath,
    });

    expect(result).toBe(fallbackPath);
  });

  it("does not use dynamic preview when canShowDynamicPreview is false", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "dynamic",
      hasFullPreview: true,
      dynamicPreviewPath,
      productPreviewPath,
      matProductImage: null,
      fallbackPath,
      canShowDynamicPreview: false,
    });

    expect(result).toBe(productPreviewPath);
  });

  it("skips mat-product when includeMatProduct is false (mobile step 2+)", () => {
    const result = getStickyPreviewImage({
      activePreviewTab: "mat-product",
      hasFullPreview: false,
      dynamicPreviewPath,
      productPreviewPath: null,
      matProductImage,
      fallbackPath,
      includeMatProduct: false,
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

  it("returns fallback when dynamic preview is disabled", () => {
    const result = getStickyMainImage({
      hasFullPreview: true,
      dynamicPreviewPath,
      fallbackPath,
      canShowDynamicPreview: false,
    });

    expect(result).toBe(fallbackPath);
  });
});

describe("mobile sticky layout", () => {
  it("uses larger preview height than legacy 26vh cap", () => {
    const height = getMobileStickyPreviewHeightPx(800, 390);
    expect(height).toBeGreaterThanOrEqual(240);
    expect(height).toBeLessThanOrEqual(320);
  });

  it("stack height includes navbar, preview and controls", () => {
    const stack = getMobileStickyStackHeightPx(false, 800, 390);
    expect(stack).toBeGreaterThan(400);
  });
});
