export type StickyPreviewTab = "dynamic" | "product";

type StickyPreviewImageArgs = {
  activePreviewTab: StickyPreviewTab;
  hasFullPreview: boolean;
  dynamicPreviewPath: string;
  productPreviewPath: string | null;
  fallbackPath: string;
};

type StickyMainImageArgs = {
  hasFullPreview: boolean;
  dynamicPreviewPath: string;
  fallbackPath: string;
};

export const getStickyPreviewImage = ({
  activePreviewTab,
  hasFullPreview,
  dynamicPreviewPath,
  productPreviewPath,
  fallbackPath,
}: StickyPreviewImageArgs): string => {
  if (activePreviewTab === "dynamic" && hasFullPreview) {
    return dynamicPreviewPath;
  }

  if (activePreviewTab === "product" && productPreviewPath) {
    return productPreviewPath;
  }

  if (hasFullPreview) {
    return dynamicPreviewPath;
  }

  if (productPreviewPath) {
    return productPreviewPath;
  }

  return fallbackPath;
};

export const getStickyMainImage = ({
  hasFullPreview,
  dynamicPreviewPath,
  fallbackPath,
}: StickyMainImageArgs): string => {
  if (hasFullPreview) {
    return dynamicPreviewPath;
  }

  return fallbackPath;
};
