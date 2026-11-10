# Image delivery strategy

Product photographs stay sharp. Decorative and UI images can get smaller. Original files stay in the repository or in storage. This audit did not recompress anything.

Evidence: file sizes were measured on disk at commit `528cfba`. Requests were taken from Lighthouse 13.6.0 network logs against the local production server, unless a row says production.

## What is on disk

`public/` is 2,251 files and 1,433 MB.

| Kind | Files | Size |
|---|---:|---:|
| PNG | 634 | 852 MB |
| WebP | 1,441 | 492 MB |
| JPG | 104 | 56 MB |
| MP4 | 17 | 28 MB |
| AVIF | 28 | 3.5 MB |

`public/images/products/` is 460 files and 745 MB, of which 440 PNGs are 739 MB. Many of those PNGs are about 2 MB each for a single vehicle. `public/dywaniki/` is 362 MB. `public/modele/` is 55 MB across 158 files. The largest brand masters are `daf.jpg` 11.4 MB, `fiat.png` 7.1 MB, and `Maybach.jpg` 3.3 MB. The live brand API does not point at those three; they are still deployed with the site.

Gallery originals and display derivatives both exist. `public/galeria/` outside `display/` is 21 MB, including `IMG_8951.JPG` at 8.4 MB. `public/galeria/display/` is 33 files and 2.2 MB.

## What the browser actually downloaded

### Homepage hero

The picture element is correct on a current Chrome, and it does not pull the 2.4 MB PNG when a source matches.

| Viewport | LCP file | Transfer | Evidence |
|---|---|---:|---|
| Mobile 412 px | `/zimowa_mobile_hero.png` | 123 KB | VERIFIED, local mobile run |
| Desktop | `/images/hero/responsive/jesien-hero-1234.avif` | 98 KB | VERIFIED, local desktop run |
| Either | `/jesien_hero.png` (2,456 KB, 2168×725) | not requested | VERIFIED absent from both network logs |

The PNG remains the `<img src>` fallback. That is acceptable for old browsers. It must not be preloaded.

The winter mobile file has no AVIF or WebP sibling. 123 KB for a full-bleed phone banner is already reasonable. A lossless or high-quality AVIF sibling can be added only after a side-by-side check against the PNG. Do not replace the PNG.

`fetchpriority="high"` is applied in a React ref, so the first request is not prioritized. Lighthouse marked the priority hint as missing. Put `fetchPriority="high"` on the server-rendered `<img>`.

The hero box starts around y = 466 px on the mobile lab viewport because the navbar and quick search sit above it. The banner is still the LCP element (about 396×704 px painted). Moving the search below the banner, or shortening the search block, gets the product image into the first screen. That is a layout change with a commercial tradeoff: the search is useful. It should not sit on top of an unprioritized image while 1.6 MB of other images download in parallel.

### Images that compete with the hero

Homepage mobile transferred about 1,677 KB of images across 22 requests. The largest were:

| File | Transfer | Displayed | Verdict |
|---|---:|---|---|
| `/eva-chat-icon.png?v=3` | 359 KB | about 80×80 px, file is 1024×1024 | OPTIMIZE. Lighthouse estimated about 360 KB wasted. A 160 px WebP is enough for 2x. Keep the PNG master |
| `/images/eva-mat-comparison.webp` | 200 KB | below the fold, eager | Lazy-load. Master stays |
| `/images/gumowe-mat-comparison.webp` | 119 KB | below the fold, eager | Lazy-load |
| Gallery `display/*.webp` plus `/_next/image` of the same files | both appeared on desktop | tiles are about 192–288 px | Stop requesting each tile twice |

The comparison photos are commercial. They show the product against a dirty rubber mat. They are not the LCP. `loading="lazy"` and no `<link rel="preload">` is the change. Quality stays at the current WebP until someone compares a tighter encode on a calibrated screen.

The chat icon is not a product photo. It can be a small derivative. The 1024 px PNG stays as the source.

### Brand grids

`shouldServeBrandImageUnoptimized` in `src/shared/brands/brandImage.ts` skips the Next optimizer for every `/modele/` URL. The comment says those files are already optimized. The bytes say otherwise.

| Page | Lab | Image bytes | Image requests | Notes |
|---|---|---:|---:|---|
| `/modele` | mobile Slow 4G | 4,122 KB | 45 | Largest files 150–299 KB for cards around 180 px |
| `/modele` | desktop | part of 9,694 KB total | 144 requests overall | CLS 0.345 |
| `/dywaniki` | mobile and desktop | about 13.5 MB | 115 | Largest is `/modele/mclaren.avif` at 790 KB, which matches the file on disk |

`BrandPopularGridCard` does not set `priority` or an explicit lazy hint, uses `quality={100}`, and sets `unoptimized`. `BrandGridCard` does the same and marks the first five cards `priority`, so they are preloaded.

The live brand API (`/api/car-brands`, 108 brands, 13 KB) points at 104 files that exist, totaling 12.4 MB. The first five alphabetical logos are small (13–84 KB). The damage is scrolling, or Chrome pulling lazy images early on a fast connection and then the Slow 4G model charging the whole queue against LCP.

Strategy:

- Generate a display derivative per brand at the card size: 360 px wide, and 720 px for 2x. AVIF and WebP. Quality high enough that paint, badges, and body lines stay clean. Keep the current file as the master, including the 11 MB DAF photo.
- Serve the derivative through `next/image` with `sizes` already defined in `BRAND_GRID_SIZES_*`. Turn `unoptimized` off for those derivatives.
- Do not set `quality={100}` on a card thumbnail.
- Lazy-load every card except the first row.
- Reserve the grid height. Today `/modele` renders a spinner and then the grid (`car-models-section.tsx`). That single swap is CLS 0.564. A min-height or a static first row from the server removes the shift without softening the photos.

### Vehicle product photos

`shouldServeModelProductPhotoOriginal` returns true for `/images/products/` and for Supabase storage URLs. The comment explains why: cards are square and `object-cover`, and the optimizer was cropping so aggressively that the mat looked soft. The source PNGs are about 2954×1620 and often about 2 MB.

That rule is the right instinct and the wrong default for a listing. A 2 MB PNG on a 180 px card is not what keeps the texture. A sharp listing needs a derivative at roughly 2× the CSS box (about 800 px on a wide card), encoded as AVIF or WebP at a high quality, with `object-cover` tested against the PNG. The zoom and the configurator lightbox keep the original URL.

The production Audi model API sampled during this audit (`/api/models?brand=audi`, 114 KB, 4.2 s, 203 generations) returned no `modelImage` values. The listing therefore repeats the brand logo. When images are filled in later, the current `unoptimized` + `quality={100}` path in `car-models-section.tsx` will start shipping the PNGs. Fix the derivative path before that backfill.

### Configurator

The configurator HTML contains no `<img>`. The mobile LCP node is the crossfade layer of `/modele/audi.avif` (23 KB on disk), with a 275 ms discovery delay on localhost and a simulated LCP of 8.3 s. The file is small. The wait is JavaScript.

Preload the known entry image from the URL (`previewImage` or the brand logo) in the server document. After the shopper changes color, load that one derivative at the preview box size (2× CSS width). Keep the full-resolution file for the lightbox and zoom (`ConfiguratorV2MatPreviewLightbox`). Do not preload every color combination up front.

### Gallery and video

Homepage tiles already rewrite `/galeria/*.jpg` to `/galeria/display/*.webp`. The lightbox `fullSrc` stays on the original, including multi-megabyte JPGs. That split is right: the grid stays light, the zoom stays sharp, and the original is only fetched when the shopper opens it.

Stop the duplicate request. Desktop traces fetched both the raw display WebP (about 45–93 KB) and a `/_next/image` version of the same file (about 9–13 KB). One response per tile is enough. Prefer the existing display WebP with `srcset`, or the optimizer, not both.

Video posters in `ProductVideoCarouselSection` use the display WebP. The active slide uses `preload="auto"`. Below-the-fold autoplay should use `preload="none"` until the section is near the viewport. The component already gates `shouldLoadMedia` on an intersection observer, which kept the MP4s out of the homepage Lighthouse log. Keep that gate. The MP4s in `public/video_carusela/optimized/` are 2.2–2.6 MB each and must not join the first load.

### Caching

`vercel.json` sets `Cache-Control: public, max-age=31536000, immutable` for `/hero*`, `/modele/*`, and `/video_carusela/optimized/*`. That is appropriate for fingerprinted or rarely replaced files. The hero URLs are cache-busted with `?v=2168` and `?v=577`, so a new banner needs a new query. Do not add a short max-age that re-downloads the banner.

Next image optimizer settings in `next.config.js` already allow AVIF and WebP, device widths through 2048, and qualities 75, 80, 90, and 100. Use 75–80 for UI and brand cards. Use 90 for product derivatives only where a 75 encode softens the cell texture. `quality={100}` on cards bypasses the point of the optimizer.

`minimumCacheTTL` is 3600 seconds. Hashed optimizer URLs can live longer. That is a P3 change.

## Fidelity rule for every future encode

1. Keep the current file.
2. Write the derivative next to it, or under a `display/` directory that already exists for the gallery.
3. Compare on a phone and on a 2× desktop at the real CSS size, not zoomed out.
4. Reject the derivative if the hex cell texture, stitching, or body color shifts.
5. Point the listing at the derivative. Point zoom at the original.

No batch re-encode of `public/images/products/` ships without that check.
