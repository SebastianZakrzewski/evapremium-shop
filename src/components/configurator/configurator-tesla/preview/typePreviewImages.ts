import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

const WITH_EDGES = [
  "/zrantamiprodukt/5_-_1.webp",
  "/zrantamiprodukt/5_-_2.webp",
  "/zrantamiprodukt/5_-_4.webp",
  "/zrantamiprodukt/5_-_5.webp",
] as const

const WITHOUT_EDGES = [
  "/bezrantowprodukt/5-_4_red.webp",
  "/bezrantowprodukt/5-_5_red.webp",
  "/bezrantowprodukt/6_-_1.webp",
  "/bezrantowprodukt/4_-_2_1.webp",
] as const

export const typePreviewImages = (
  matType: ConfiguratorState["matType"],
): readonly string[] =>
  matType === "3d-with-rims" ? WITH_EDGES : WITHOUT_EDGES

export const primaryTypePreviewImage = (
  matType: ConfiguratorState["matType"],
): string => typePreviewImages(matType)[0]
