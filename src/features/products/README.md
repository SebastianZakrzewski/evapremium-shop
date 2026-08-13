# Products feature

Public UI for product marketing sections on the storefront (gallery, video shorts, brand selection).

## Usage

```tsx
import {
  ProductGallerySection,
  ProductVideoCarouselSection,
  ProductSelection,
} from "@/features/products"

export default function Home() {
  return (
    <>
      <ProductGallerySection />
      <ProductVideoCarouselSection />
      <ProductSelection />
    </>
  )
}
```

## Video shorts (`ProductVideoCarouselSection`)

Section title: **Premium w akcji**. Renders a Swiper carousel of short advertising videos.

### Adding videos

1. Place MP4 files in `public/video_carusela/`.
2. Update entries in [`src/features/products/data/productVideos.ts`](./data/productVideos.ts):

```ts
{
  id: "v1",
  src: "/video_carusela/V1.mp4",
  poster: "/galeria/your-poster.webp",
  title: "Montaż w aucie",
  alt: "Dywaniki EVA Premium zamontowane w samochodzie",
}
```

Encode spaces in filenames (e.g. `0701%20(1)(2).mp4`). Without a valid MP4 the slide still shows the poster (no crash).

### Playback rules

- Active slide autoplays muted when the section is in view
- Other slides pause
- `prefers-reduced-motion: reduce` → poster only until the user presses play
