# Animation and visual effects audit

Evidence labels: **VERIFIED** means the behavior was read in source and, where stated, seen in a Lighthouse trace. **LIKELY** means the source shows the cost and the trace is consistent with it, without a frame-by-frame GPU profile. **UNVERIFIED** means it was not executed.

No physical phone was available. GPU cost is inferred from the effect type (blur, `will-change`, infinite animation, extra layers) and from Lighthouse main-thread and layout-shift data. A scroll-frame recording was not captured, so dropped-frame counts are not reported.

Classification used below:

- **KEEP** — low overhead and useful.
- **OPTIMIZE** — useful, implementation is wasteful.
- **SIMPLIFY** — some visual benefit, current complexity is higher than the benefit.
- **MOBILE DISABLE** — acceptable on a desktop GPU, expensive on a phone.
- **REMOVE** — little commercial value for the cost.

## Inventory

| Effect | Where | Class | Evidence |
|---|---|---|---|
| Hero promo image | `src/features/marketing/components/HeroSection.tsx` | KEEP the photograph. OPTIMIZE delivery | VERIFIED. Intro video is off (`HERO_INTRO_VIDEO_ENABLED = false`). Mobile lab LCP element is the winter hero. Desktop lab LCP element is `jesien-hero-1234.avif` (98 KB), not the 2.4 MB PNG |
| Dead hero video branch | same file, `/images/hero/0811.mp4` (2.2 MB) and `/images/hero/video.mp4` (7.6 MB) | REMOVE from the rendered path | VERIFIED the flag is false. The files remain in `public/`. They were not in the homepage Lighthouse request list |
| `fetchpriority` set in a ref | `HeroSection.tsx` image ref | OPTIMIZE | VERIFIED. Server HTML has no `fetchpriority`. Lighthouse `lcp-discovery-insight` reports the hint was not applied. The attribute appears only after hydration |
| Quick-search red glow | `src/components/quick-search-bar.tsx`, `.quick-search-glow` in `src/app/globals.css` | REMOVE on mobile, SIMPLIFY on desktop | VERIFIED. Infinite animation plus `filter: blur(16px)` on a wide ellipse, directly above the hero |
| Navbar blur and scroll state | `src/components/layout/navbar.tsx` | MOBILE DISABLE the blur. OPTIMIZE the scroll listener | VERIFIED. `backdrop-blur` is always on. `scroll` is registered without `{ passive: true }` and calls `setState` after 20 px |
| Homepage product marquee | `src/components/ui/image-auto-slider.tsx`, `.animate-scroll-right-seamless` | MOBILE DISABLE. SIMPLIFY on desktop | VERIFIED. The track is duplicated (`images` twice), `will-change: transform`, 30 s infinite animation, and `data-allow-motion="true"` which is excluded from the reduced-motion reset in `globals.css` |
| Comparison slider | `src/components/ui/image-comparison-slider-horizontal.tsx`, used by `src/components/mat-comparison-section.tsx` | KEEP the comparison. OPTIMIZE loading. SIMPLIFY blur | VERIFIED. Both photos are plain `<img>` without `loading="lazy"`. Homepage HTML preloads them. Labels use `backdrop-blur`. They sit thousands of pixels below the hero and still download during first load (200 KB + 119 KB) |
| Brand-grid fade stagger | `src/components/car-models-section.tsx` | REMOVE | VERIFIED. Each of up to 108 cards gets `animate-fade-in` with `index * 0.05s`. That is about 5.4 s of staggered entrance. The same render replaces a spinner with the full grid and produces CLS 0.564 |
| Brand-card hover lift, shine, `preserve-3d` | `src/components/ui/BrandGridCard.tsx` | SIMPLIFY. MOBILE DISABLE hover motion | VERIFIED in source. Hover shine uses a shimmer gradient. Cards also use `backdrop-blur-md` on the empty plate |
| Glass panels, sticky bars, configurator chrome | `globals.css` `.glass-panel`, navbar, `ConfiguratorV2StickyBar.tsx`, `ConfiguratorSimple.tsx` | MOBILE DISABLE blur. KEEP the solid bars | VERIFIED classes: `backdrop-blur-md`, `backdrop-blur-xl`, `backdrop-blur-2xl`. These force extra compositing on scroll. The sticky price bar itself is commercially useful |
| Configurator preview crossfade | `ConfiguratorV2CrossfadeImage.tsx` | OPTIMIZE | VERIFIED. Two stacked images, 520 ms opacity transition, permanent `willChange: "opacity"`. The mobile lab LCP node is the hidden base layer (`aria-hidden`) showing `/modele/audi.avif`, discovered only after hydration (resource load delay 275 ms on localhost) |
| Preview preload of every color | `useMatPreviewPreload.ts` | OPTIMIZE | VERIFIED. On each configuration change it constructs an `Image()` for every material and edge color, plus product and realization photos |
| Framer Motion lightbox and checkout | `gallery-lightbox.tsx`, `ProductVideoLightbox.tsx`, `ConfiguratorV2MatPreviewLightbox.tsx`, `CheckoutSection.tsx`, `product-reveal-card.tsx` | SIMPLIFY to CSS opacity | VERIFIED imports. Reveal cards set `data-allow-motion="true"`, so the reduced-motion CSS does not stop them. Checkout motion never got a clean lab run because an empty cart redirects home |
| Product-reveal hover on accessories | `src/components/ui/product-reveal-card.tsx` | SIMPLIFY. MOBILE DISABLE the hover choreography | VERIFIED it is the accessories card. Mobile accessories LCP was the organizer photo at 13.5 s simulated, so the motion is not the only cost, but it adds a Framer runtime to that page |
| Cookie-consent panel | `src/features/cookie-consent` | KEEP the choice. SIMPLIFY the size | VERIFIED. On `/modele`, `/dywaniki`, and `/modele?brand=audi` the lab LCP element is the consent paragraph, not a product. One layout shift on `/modele` is the brand grid, score 0.564 |
| Cookiebot DOM sweeper | `src/app/layout.tsx` `beforeInteractive` script | OPTIMIZE | VERIFIED. A `MutationObserver` on `document.body` (`subtree: true`) hides Cookiebot while GTM still downloads it |
| Chat launcher motion | `src/features/eva-chat-widget/components/EvaChatWidget.tsx` | KEEP a static button. The PNG is an image problem, not an animation problem | VERIFIED the file is 358 KB at 1024×1024 and is painted around 80–140 px |
| Global animation library | `src/app/globals.css` fade, float, shimmer, glow, marquee | REMOVE unused infinite effects from the first screen | VERIFIED keyframes exist. Several (`animate-float-hover`, `animate-pulse-glow`) are referenced by older sections such as `src/components/products/product-gallery-section.tsx`. The live homepage gallery uses the marquee, not that older file |

## What should stay

Keep the hero photograph, the comparison of EVA versus rubber (after it is lazy-loaded), the configurator preview change when a color or structure changes, focus rings, and the consent choice. Those help a shopper understand the product.

Keep CSS color and border changes on buttons. They are cheap and they show that a control responded.

## What should go or be turned off on phones

Turn off, on viewports under 768 px:

- `backdrop-filter` on the navbar, search plate, brand plates, and configurator sticky bars. Use a solid `rgb(0 0 0 / 0.92)` instead.
- The homepage marquee. Replace it with a horizontal scroller that does not duplicate the DOM and does not animate.
- The quick-search glow.
- Hover scale, shine, and `preserve-3d` on brand cards. Touch devices still download the CSS and the blur.
- Staggered `animate-fade-in` on the brand grid.

Remove the reduced-motion exception (`data-allow-motion`) or stop setting that attribute. A visitor who asks for less motion currently still gets the marquee and the accessory reveal.

The hero video files can leave the first-load path. They are already disabled. Deleting them from `public/` is a deploy-size decision and is listed in the image strategy. Do not delete product photography.

## Scroll and main thread

Homepage mobile, Lighthouse 13.6.0, simulated Moto G Power, median of 3 runs: about 2.1 s of main-thread work in the breakdown for the representative run (script evaluation about 1.0 s, style and layout about 0.3 s) and 12 long tasks. Total blocking time median 214 ms. That is under the lab threshold Lighthouse treats as acceptable, and it is not the reason the simulated LCP is 12.8 s. The LCP failure is request priority and bytes. The blur and marquee still matter once the page is scrolling, which this lab load test does not score.

Desktop runs showed 0 long tasks and 0 ms total blocking time. The desktop GPU and the lack of CPU throttling hide the blur cost. That is why blur is classified as mobile-disable rather than delete everywhere.

## Configurator motion

The crossfade is the right idea: the shopper needs to see the new color without a hard cut that looks like a broken image. Implementation cost today:

- `will-change: opacity` stays on after the fade.
- A second image stays mounted.
- `useMatPreviewPreload` fetches a fan of color variants as soon as the configuration exists.

Keep a single opacity transition under 200 ms. Preload only the next likely photo (current color, current edge), not every combination, and do it after the first preview has painted.
