# EVA Premium performance audit

Commit `528cfba` on `master`. Audit only. Application code was not changed.

## Executive summary

The shop is a Next.js 16 App Router storefront. The desktop homepage already meets a 2.1 s lab LCP and a Lighthouse score of 90. The phone does not. On the Slow 4G lab profile the homepage LCP is 12.8 s, the brand index shifts by 0.564, and the mats index downloads about 14 MB of brand photos. The configurator’s first image is absent from the HTML and paints at 8.3 s in that same lab, even though the file itself is a 23 KB AVIF.

The category score hides this. Homepage mobile scores 71 while its LCP subscore is 0, because the other weighted metrics are fine. Desktop `/dywaniki` scores 95 while transferring 14 MB.

The work that moves the experience is, in order: stop the brand grid from jumping and stop it from shipping original files, put the hero and the configurator preview at the front of the request queue, shrink the chat icon and defer the below-fold photos, and only then simplify blur and marquees. Product masters stay. Decorative motion does not have to.

A full optimization roadmap is in `03-OPTIMIZATION_ROADMAP.md`. Measurements are in `02-PERFORMANCE_BASELINE.md`.

## Architecture

Verified from the repository and from the production build route table.

- Next.js 16.4.5, React 18, Tailwind 4, App Router under `src/app`. React 18 is deprecated inside Next 16 and is scheduled to be removed in Next 17. That is a maintenance risk, not the current LCP cause.
- The root layout (`src/app/layout.tsx`) is a client island: `QueryProvider`, `SessionProvider`, `TrackingProvider`, `ShopChrome` (navbar, footer, consent), and `EvaChatWidget` on every route. Montserrat and Inter load at weights 400, 500, 600, and 700. GTM `GTM-TD2WDGKV` is `afterInteractive`. A direct gtag loader also runs. A `beforeInteractive` script watches the whole body to hide Cookiebot, which GTM then loads anyway.
- Homepage (`src/app/page.tsx`) server-renders the hero, the gallery, the video carousel, the comparison, and the lower sections. `next/dynamic` without `ssr: false` still emits those sections in the HTML (54 images, 20 scripts, 260 KB document) and the browser downloads the chunks immediately.
- `/modele` and `/dywaniki` are client pages. The brand query is not in the HTML: `/modele` and `/modele?brand=audi` returned the same 76 KB document. Brands and models arrive from `/api/car-brands` (13 KB, about 0.13 s on the live host) and `/api/models` (Audi sample 114 KB and 4.2 s). Many catalog routes are `force-dynamic`.
- `/konfigurator` dynamically imports `ConfiguratorV2`. `/konfigurator-v2` only redirects. `/konfigurator-simple` still ships `ConfiguratorSimple.tsx` (about 1,800 lines) plus an older `Configurator.tsx` (about 1,500 lines). The live preview path is V2.
- Cart state is `localStorage` key `cart-v2` via `useCart`. There is no cart URL. Checkout is `CheckoutSection` (about 1,700 lines, Framer Motion). An empty cart redirects to `/` after 1 s, so checkout was not profiled.
- Payments and Bitrix exist as server routes. P24 was disabled in the local env. They were not called.
- `@types/three` is installed. `three` is not imported. `sqlite3` is a dependency and is not imported from `src`. Prisma and Supabase are server-side.
- Deploy target is Vercel (`vercel.json`). There is no `.github` workflow in the repo. The live HTML is prerendered and cached.

## Top 10 bottlenecks

1. **Homepage request queue on Slow 4G.** Simulated LCP 12.8 s locally and 5.4 s on one live run, at about 2.9 MB either way. The LCP file is the 123 KB winter hero. It waits behind a 359 KB chat icon, two comparison photos, gallery files, four fonts, and about 0.5 MB of Google tags. `fetchpriority` is set too late. Evidence: VERIFIED, Lighthouse network and `lcp-discovery-insight`.
2. **`/modele` layout shift.** CLS 0.564 on every local mobile and mid-range run, 0.345 on desktop. One shift, the brand grid, after a spinner. Evidence: VERIFIED locally. One live run scored 0 while still downloading 3.7 MB of brand images. That single live sample is not a fix.
3. **Brand photos skip the optimizer and are large.** `/dywaniki` transferred about 13.5 MB of images (115 requests). `/modele` transferred 4.1 MB of images on mobile. `shouldServeBrandImageUnoptimized` treats `public/modele/` as already small. `mclaren.avif` is 790 KB. Evidence: VERIFIED, disk size equals transfer size.
4. **Configurator preview is client-only.** The document has no images. Lab LCP is a hidden crossfade of `/modele/audi.avif` at 8.3 s simulated, with a 275 ms discovery delay even on localhost. Evidence: VERIFIED.
5. **Cookie banner is the LCP on the catalog.** On `/modele`, `/dywaniki`, and the Audi listing the largest early text is the consent paragraph. The products arrive later. The banner has to stay. It should not be the only thing in the first viewport while the grid is a spinner. Evidence: VERIFIED.
6. **Below-fold photos are eager.** Comparison images are preloaded from the homepage HTML. The marquee duplicates the gallery DOM. Desktop also fetches both the display WebP and a `/_next/image` of the same tile. Evidence: VERIFIED.
7. **Third-party tags on every page.** GTM, two gtag scripts, and Cookiebot add about 0.55 MB and a modest amount of main-thread time (about 110 ms in the homepage insight). They are not the 12 s by themselves. They share the Slow 4G queue with the hero. Evidence: VERIFIED.
8. **Global client chrome.** Navbar, cart, consent, chat, and both font families hydrate on every route. Homepage `dynamic()` does not delay that work. Evidence: VERIFIED from HTML script lists and source.
9. **Blur, glow, and infinite marquee.** `backdrop-filter` on the navbar and sticky bars, a blurred glow above the hero, and a `will-change` marquee. Desktop TBT was 0 ms, so this is a scroll cost, not the lab LCP number. Evidence: VERIFIED in CSS. Frame time UNVERIFIED.
10. **Product PNG masters are wired to ship at full size.** `public/images/products/` is 739 MB of PNG. Listings set `unoptimized` and `quality={100}` when `modelImage` is set. The live Audi payload currently has no `modelImage`, so this cost is latent. Evidence: VERIFIED in source and on disk. The live download of those PNGs is UNVERIFIED because the API returned none.

## Findings

### PERF-01 — Hero is not the first image on the phone

- **Priority:** P0
- **Evidence:** VERIFIED
- **Where:** `src/features/marketing/components/HeroSection.tsx`, `src/features/eva-chat-widget/lib/evaWidgetPlugin.ts`, `src/components/mat-comparison-section.tsx`, `src/app/layout.tsx`
- **Cause:** The picture element chooses the right file (123 KB PNG on mobile, 98 KB AVIF on desktop). The request is not prioritized, and eager images plus tags fill the Slow 4G pipe. The hero also starts about 466 px down, under the navbar and quick search.
- **Mobile:** LCP 12.8 s local median, 5.4 s one live run, 2.7 s on the 9 Mbps profile.
- **Desktop:** LCP 2.1 s, score 90. Already at the target.
- **Shopping:** The banner is the promotion and the path into the catalog.
- **Change:** Server-render `fetchPriority="high"` on the hero only. Lazy-load the comparison and the chat icon’s display file. Replace the 1024 px chat PNG with a small derivative. Keep the PNG master.
- **Expected benefit:** Estimate, not a result. If the 123 KB hero is alone at the front of a 1.6 Mbps pipe, its transfer is under a second plus RTT. Competing bytes are what stretch the lab into 5–13 s. Re-measure before quoting a new LCP.
- **Complexity:** Low. **Risk:** Low if the comparison and chat still appear. **Depends on:** nothing.

### PERF-02 — Brand index jumps

- **Priority:** P0
- **Evidence:** VERIFIED locally. Production CLS UNVERIFIED beyond one run that scored 0.
- **Where:** `src/components/car-models-section.tsx` around the `loadingBrands` spinner, and the `animate-fade-in` delay of `index * 0.05` seconds.
- **Cause:** The section renders a spinner, then mounts the whole grid. Up to 108 cards then fade in over several seconds.
- **Mobile:** CLS 0.564. **Desktop:** CLS 0.345.
- **Shopping:** This is the page where a visitor picks a make.
- **Change:** Server-render the first row, or reserve a min-height and drop the stagger. Do not animate the grid in.
- **Expected benefit:** CLS should fall under 0.1 if the spinner no longer swaps for a taller grid. Confirm with the same three-run median.
- **Complexity:** Low. **Risk:** Low. **Depends on:** brand list can stay client-fetched if the skeleton matches the grid.

### PERF-03 — Brand and mat indexes download original art

- **Priority:** P0
- **Evidence:** VERIFIED
- **Where:** `src/shared/brands/brandImage.ts`, `BrandGridCard.tsx`, `BrandPopularGridCard.tsx`, `public/modele/`
- **Cause:** `unoptimized` plus `quality={100}` sends the file as stored. `/dywaniki` moved about 14 MB. Masters such as `daf.jpg` (11.4 MB) are in the deploy even when the API points at a smaller sibling.
- **Mobile and desktop:** `/dywaniki` weight is about 14 MB on both. `/modele` is 5.3 MB mobile and 9.5 MB desktop.
- **Shopping:** The photos are how people recognize a make. They can stay sharp at card size without the original byte count.
- **Change:** Card derivatives (about 360 px and 720 px), AVIF and WebP, originals kept. Lazy-load past the first row. Compare on a phone before switching the URL.
- **Expected benefit:** Estimate. A first screen of small derivatives is well under the 1.5 MB page gate. A full scroll of 108 cards at a few tens of kilobytes each is on the order of 1–3 MB, versus 12–14 MB now.
- **Complexity:** Medium. **Risk:** Medium if a derivative is softer than the current file. **Depends on:** PERF-02 so the new images do not arrive in a jump.

### PERF-04 — Configurator waits on hydration for a small image

- **Priority:** P0
- **Evidence:** VERIFIED
- **Where:** `src/app/konfigurator/page.tsx`, `ConfiguratorV2.tsx`, `ConfiguratorV2CrossfadeImage.tsx`, `useMatPreviewPreload.ts`
- **Cause:** No `<img>` in the server HTML. The crossfade mounts `/modele/audi.avif` after JS. Preload then fans out to every color.
- **Mobile:** LCP 8.3 s, 1.4 MB, CLS 0. **Desktop:** LCP 2.2 s, score 90. **Mid-range:** LCP 2.2 s, score 94.
- **Shopping:** This is the configuration and the price.
- **Change:** Preload the entry image in the document. Keep one short opacity fade. Preload the next photo, not every combination. Zoom keeps the original.
- **Expected benefit:** Estimate. Removing a JS-gated discovery is the difference between “image in HTML” and “image after the bundle”. The file is 23 KB, so the remaining time is scripts and tags, not the photo.
- **Complexity:** Medium. **Risk:** Medium around the wrong preview if the query is partial. **Depends on:** PERF-01’s priority rules so this preload does not fight the homepage hero on other routes.

### PERF-05 — Catalog LCP is the consent copy

- **Priority:** P1
- **Evidence:** VERIFIED
- **Where:** cookie banner component, `src/app/modele/page.tsx`, `src/app/dywaniki/page.tsx`
- **Cause:** The banner is a large early text block. The product grid is a client fetch behind a spinner.
- **Impact:** Lab LCP on those routes is not a product image. Visitors still need the choice.
- **Change:** Keep consent. Shorten the first paint of the banner (same controls, less empty height) and show real brand cards from the server so the product can become LCP.
- **Complexity:** Medium. **Risk:** Medium if consent logging changes. Do not delay the default-denied Consent Mode script.

### PERF-06 — Eager below-fold images and a duplicated marquee

- **Priority:** P1
- **Evidence:** VERIFIED
- **Where:** `image-comparison-slider-horizontal.tsx`, `image-auto-slider.tsx`, `ProductGallerySection.tsx`
- **Cause:** Comparison `<img>` has no lazy attribute, so the homepage preloads 200 KB + 119 KB. The marquee renders every tile twice and animates for 30 s. Desktop requests both the display WebP and the optimizer URL.
- **Change:** `loading="lazy"` on the comparison. One request per tile. On small screens, a manual scroller instead of the infinite track.
- **Complexity:** Low. **Risk:** Low. Lightbox `fullSrc` stays the original, including the multi-megabyte JPGs, and loads only when opened.

### PERF-07 — Tags share the first pipe

- **Priority:** P1
- **Evidence:** VERIFIED
- **Where:** `src/app/layout.tsx`, `GoogleAnalyticsScript.tsx`, GTM container `GTM-TD2WDGKV`
- **Cause:** `afterInteractive` still runs during the LCP window. The container loads a second gtag for Google Ads and Cookiebot.
- **Change:** Keep Consent Mode default-denied before any tag. Load GTM after the hero request has started, or on the first interaction on the homepage, and confirm in Tag Assistant that `page_view`, ads, and purchase still fire. Do not remove the purchase event on `/payment/success`.
- **Complexity:** Medium. **Risk:** High if consent order or purchase attribution breaks. Measure tags in a preview before production.

### PERF-08 — The whole homepage hydrates

- **Priority:** P1
- **Evidence:** VERIFIED
- **Where:** `src/app/page.tsx`, `src/app/layout.tsx`
- **Cause:** Client sections are in the first document. `dynamic()` splits chunks and then the HTML asks for them immediately.
- **Change:** Leave the hero as server markup. Load the video carousel, comparison, reviews, and FAQ when they approach the viewport. This is a rendering-boundary change, not a rewrite.
- **Complexity:** Medium. **Risk:** Medium if a section disappears for no-JS users. The hero and the primary call to action must stay in the document.
- **Depends on:** PERF-01 and PERF-06, which are smaller and should land first.

### PERF-09 — Scroll-time effects

- **Priority:** P2 for blur and glow, P1 where PERF-02’s stagger is concerned
- **Evidence:** VERIFIED in source. Dropped frames UNVERIFIED
- **Where:** `globals.css`, `navbar.tsx`, `quick-search-bar.tsx`, configurator sticky bars
- **Change:** Solid navbar and sticky bars under 768 px. Remove the quick-search blur glow. Passive scroll listener or a small Intersection Observer. Honor `prefers-reduced-motion` by deleting the `data-allow-motion` bypass.
- **Complexity:** Low. **Risk:** Low visually if the bars stay opaque and readable.

### PERF-10 — Latent full-size product PNGs

- **Priority:** P1 before image backfill, P2 while the API returns no `modelImage`
- **Evidence:** VERIFIED source and disk. Live download UNVERIFIED
- **Where:** `src/shared/images/modelProductPhoto.ts`, `car-models-section.tsx` (`quality={100}`, `unoptimized`)
- **Cause:** The comment is right that a too-small cover crop looks soft. The fix is a sharp derivative at the card’s pixel size, not the 2 MB PNG.
- **Change:** Listing derivative, original for zoom. Side-by-side check. See `05-IMAGE_DELIVERY_STRATEGY.md`.

### PERF-11 — Checkout and cart were not timed

- **Priority:** P2
- **Evidence:** VERIFIED redirect. Performance of the form UNVERIFIED
- **Where:** `CheckoutSection.tsx` empty-cart effect, `useCart.ts` `console.log` on save, render-path `console.log` in checkout (also printed during `next build`)
- **Change:** Measure with a localStorage fixture and payment routes blocked. Remove the logs from the render path. Do not collect a lab number by submitting an order.

### PERF-12 — Repository and deploy weight

- **Priority:** P2
- **Evidence:** VERIFIED disk totals
- **Where:** `public/` 1,433 MB, including unused large brand masters and hero MP4s that the flag no longer plays
- **Change:** Keep masters. Move files that are not referenced out of the upload, or serve them from storage. This does not by itself change LCP.

### PERF-13 — Fonts

- **Priority:** P2
- **Evidence:** VERIFIED, 233 KB preloaded, four files
- **Where:** `src/app/layout.tsx`
- **Change:** Two weights per family, or one family for the UI. `display: "swap"` is already set.

### PERF-14 — Build drift and unused dependencies

- **Priority:** P3
- **Evidence:** VERIFIED
- **Cause:** A stale `node_modules` (Next 16.0.10, Zod 3) cannot typecheck this tree. Lockfile Next 16.4.5 and Zod 4.6.7 can. `sqlite3` and `@types/three` are unused by `src`.
- **Change:** CI should use `npm ci`. Removing unused packages is a separate, small cleanup.

### PERF-15 — Zoom locked

- **Priority:** P3, accessibility, not a speed item
- **Evidence:** VERIFIED, `viewport.userScalable: false` and `maximumScale: 1` in `layout.tsx`
- **Change:** Allow pinch zoom. Do not bundle this into a performance patch that is judged only by Lighthouse.

## Third parties and consent

Default consent is denied (`GoogleConsentDefaultScript`). Marketing pixels and Microsoft Clarity load only after the matching consent category. That part should stay.

GTM and the direct GA4 loader both run without waiting for an accept, with ads data redaction. Cookiebot is injected by GTM and then hidden by the mutation observer, while the shop also renders its own banner. Two consent UIs are a cost and a behavior risk. Pick one banner. Keep the Consent Mode signals.

Do not “optimize” by dropping the purchase tag.

## What this audit did not prove

- INP, scroll frame rate, and heap growth.
- Checkout and cart interaction time.
- That every product PNG is soft or sharp. No pixels were re-encoded.
- Field CrUX p75. The PSI API quota was exhausted.
- That the live deployment is commit `528cfba`. The asset behavior matches. The CLS behavior on one live `/modele` run does not.
- Safari.

## Recommendation

Fix PERF-01 through PERF-04 first, on this codebase, without a rewrite. Re-run the baseline profiles after each one. Desktop homepage is already inside the LCP target, so phone and catalog weight are the gap. Image fidelity and consent stay as hard constraints. The phased plan is `03-OPTIMIZATION_ROADMAP.md`.
