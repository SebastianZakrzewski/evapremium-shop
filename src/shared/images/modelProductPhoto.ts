/**
 * Zdjęcia modeli są szerokimi plikami (ok. 2954×1620).
 * Karta na mobile jest kwadratem z object-cover, więc optimizer
 * dobiera szerokość do viewportu i wysokość zostaje za mała — obraz jest rozmyty.
 * Oryginalny plik ma dość pikseli, żeby po kadrowaniu zostać ostry.
 */
export const shouldServeModelProductPhotoOriginal = (src: string): boolean =>
  src.includes("/images/products/") ||
  src.includes("/storage/v1/object/public/")
