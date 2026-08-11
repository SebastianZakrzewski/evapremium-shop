export type ProductVideo = {
  id: string
  src: string
  poster: string
  title: string
  alt: string
}

const optimized = (basename: string) =>
  `/video_carusela/optimized/${basename}`

export const productVideos: ProductVideo[] = [
  {
    id: "v1",
    src: optimized("V1.mp4"),
    poster: "/galeria/photo_2025-04-25_17.10.11.webp",
    title: "Montaż w aucie",
    alt: "Dywaniki EVA Premium zamontowane w samochodzie",
  },
  {
    id: "0703",
    src: optimized("0703.mp4"),
    poster: "/galeria/photo_2025-04-25_17.08.35.webp",
    title: "Struktura komórek",
    alt: "Głęboka struktura komórek dywaników EVA Premium",
  },
  {
    id: "0703-1",
    src: optimized("0703_1_.mp4"),
    poster: "/galeria/photo_2025-04-25_16.57.37.webp",
    title: "Dopasowanie 3D",
    alt: "Precyzyjne dopasowanie 3D dywaników EVA Premium",
  },
  {
    id: "0703-3-1",
    src: optimized("0703_3_1_.mp4"),
    poster: "/galeria/photo_2025-04-25_17.08.38.webp",
    title: "Czyszczenie",
    alt: "Łatwe czyszczenie dywaników EVA Premium",
  },
  {
    id: "0701-1-2",
    src: optimized("0701_1_2_.mp4"),
    poster: "/galeria/photo_2025-04-25_17.12.45.webp",
    title: "Dywaniki w aucie",
    alt: "Dywaniki EVA Premium w prawdziwym samochodzie",
  },
  {
    id: "copy-01fab278",
    src: optimized("copy_01FAB278-0557-4164-8701-6675268A48C9.mp4"),
    poster: "/galeria/photo_2025-04-25_16.57.33.webp",
    title: "Widok premium",
    alt: "Dywaniki EVA Premium — widok premium",
  },
  {
    id: "copy-0e041db3",
    src: optimized("copy_0E041DB3-375C-4419-8A26-DC5DAC66CFB5.mp4"),
    poster: "/galeria/photo_2025-04-25_17.04.39.webp",
    title: "Gotowy produkt",
    alt: "Gotowe dywaniki EVA Premium",
  },
  {
    id: "copy-10a1b7a3",
    src: optimized("copy_10A1B7A3-5715-4CBB-8B05-432A757CC211.mp4"),
    poster: "/galeria/photo_2025-04-25_17.08.33.webp",
    title: "Kolorystyka",
    alt: "Kolorystyka dywaników EVA Premium",
  },
  {
    id: "copy-1d17cd7f",
    src: optimized("copy_1D17CD7F-F14C-4A44-BB90-8DCAB22C431E.mp4"),
    poster: "/galeria/photo_2025-04-25_17.08.44.webp",
    title: "Jakość wykonania",
    alt: "Jakość wykonania dywaników EVA Premium",
  },
  {
    id: "copy-2546d97a",
    src: optimized("copy_2546D97A-CF00-4EE6-A230-2BF4E29AB359.mp4"),
    poster: "/galeria/photo_2025-04-25_17.10.12.webp",
    title: "Montaż w kabinie",
    alt: "Montaż dywaników EVA Premium w kabinie",
  },
  {
    id: "copy-57cdedb2",
    src: optimized("copy_57CDEDB2-A3CE-4647-848B-BD6862827900.mp4"),
    poster: "/galeria/photo_2025-04-25_17.12.47.webp",
    title: "Detal wykończenia",
    alt: "Detal wykończenia dywaników EVA Premium",
  },
  {
    id: "copy-58501d63",
    src: optimized("copy_58501D63-EB8A-4C90-A7FF-5943D141301F.mp4"),
    poster: "/galeria/photo_2025-04-25_17.12.48.webp",
    title: "Komplet dywaników",
    alt: "Komplet dywaników EVA Premium",
  },
  {
    id: "copy-6da2874d",
    src: optimized("copy_6DA2874D-18AB-49E0-B035-73D595BDF75E_1_.mp4"),
    poster: "/galeria/photo_2025-04-25_17.10.11.webp",
    title: "Profesjonalny montaż",
    alt: "Profesjonalny montaż dywaników EVA Premium",
  },
  {
    id: "copy-8e0de509",
    src: optimized("copy_8E0DE509-B731-4F6E-BB89-67D0DBE9662F_1_.mp4"),
    poster: "/galeria/photo_2025-04-25_17.08.35.webp",
    title: "Różne modele",
    alt: "Dywaniki EVA Premium do różnych modeli aut",
  },
  {
    id: "copy-9ab40a7d",
    src: optimized("copy_9AB40A7D-C4A5-42BD-9BBC-1C1101A3BE1A.mp4"),
    poster: "/galeria/photo_2025-04-25_17.04.39.webp",
    title: "Wykończenie premium",
    alt: "Wykończenie premium dywaników EVA",
  },
]
