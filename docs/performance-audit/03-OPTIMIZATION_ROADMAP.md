# Optimization roadmap

Implementation is not started. Each phase is approved separately. Do not start Phase B until this document is accepted.

Estimates are engineering time for one person who already knows the repo. They are not promises of the resulting LCP. “Expected impact” is a hypothesis to validate with the baseline profiles in `02-PERFORMANCE_BASELINE.md`.

Order is fixed: measure, then the failures that dominate the phone, then motion, then image derivatives, then structure, then a full retest. Desktop homepage LCP is already 2.1 s. Do not restyle it in pursuit of a higher score.

## Phase A — Baseline and instrumentation

**Status:** done for this commit, with the gaps below.

**Deliverables**

- This `docs/performance-audit/` set.
- Lighthouse JSON under `evidence/lighthouse/`.
- `evidence/run-lighthouse.mjs` and `evidence/median-table.mjs` for a repeat run.

**Acceptance**

- A later run can name the commit, Chrome version, Lighthouse version, and the mobile and desktop profiles.
- `/checkout` is only compared when the cart fixture from `07-PERFORMANCE_TEST_PLAN.md` is in place.

**Still open**

- INP trace, scroll frames, heap snapshots, CrUX p75, Safari.
- Warm-cache runs did not reduce transfer. Repeat warm cache only after cache headers for HTML and `_next/static` are confirmed in the trace.

**Risk:** low. **Depends on:** nothing.

## Phase B — Critical bottlenecks

Implemented locally. Further cuts after this phase are recorded below. Not deployed.

Same lab as the baseline (Lighthouse 13.6.0, three-run median). Reports: `evidence/lighthouse/phase-b-mobile` and `phase-b-desktop`.

| Page | Before | After |
|---|---|---|
| Mobile `/` LCP | 12.8 s | 10.2 s |
| Mobile `/` weight | 2,987 KB | 2,633 KB |
| Mobile `/modele` CLS | 0.564 | 0.024 |
| Desktop `/modele` CLS | 0.345 | 0 |
| Mobile `/konfigurator` LCP | 8.3 s | 5.7 s |
| Desktop `/` LCP / CLS / score | 2.1 s / 0 / 90 | 2.0 s / 0 / 91 |

The hero is still the LCP element. The 359 KB chat PNG is no longer in the request list. Comparison photos are `loading="lazy"` and are not preloaded, but the lab still downloads them later (200 KB + 119 KB). Configurator HTML now contains `/modele/audi.avif` and a preload. CLS on `/modele` is under 0.1. Desktop homepage stayed inside the gate.

PERF-01, PERF-02, PERF-04, and the eager half of PERF-06. About 3–5 days.

**Work**

1. Set hero `fetchPriority="high"` in the server markup. Remove it from the ref-only path.
2. Add `loading="lazy"` to the comparison images. Stop preloading them.
3. Serve a small chat-icon derivative. Leave `public/eva-chat-icon.png` in place.
4. Replace the `/modele` spinner-plus-stagger with a reserved grid. No fade delay per card.
5. Emit the configurator entry image in the initial HTML when `brand` is present, and preload that URL. Stop preloading every color on first paint.

**Acceptance**

- Mobile cold median, three runs: homepage LCP lower than 12.8 s by a margin outside run noise (the three cold runs sat within 3 ms, so a drop of more than 1 s is real). CLS on `/modele` ≤ 0.1 on mobile and desktop.
- Configurator document contains the entry image. Zoom still opens the original.
- Desktop homepage LCP stays ≤ 2.5 s and CLS stays 0.
- No payment call, no consent regression.

**Expected impact:** hypothesis. Homepage and configurator LCP should move toward the mid-range results already measured (homepage 2.7 s, configurator 2.2 s at 9 Mbps) once the Slow 4G queue is not full of unrelated images. That is not a guarantee of ≤ 2.5 s on Slow 4G.

**Risk:** medium on the configurator if the entry image is the brand logo when a product photo was intended. **Depends on:** Phase A profiles.

## Phase C — Visual effect simplification

PERF-09 and the marquee half of PERF-06. About 2–3 days.

**Work**

- Under 768 px, replace `backdrop-filter` on the navbar, search plate, and configurator sticky bars with a solid background.
- Remove `.quick-search-glow`.
- Homepage gallery becomes a non-duplicated scroller on small screens. Desktop may keep a slow marquee only if a trace shows it does not add long tasks during scroll.
- Delete `data-allow-motion` bypasses so reduced motion wins.
- Navbar scroll listener becomes passive, or the blur state goes away and the listener goes with it.
- Keep the configurator color crossfade. Cap it near 200 ms and drop permanent `will-change`.

**Acceptance**

- Mobile scroll trace: no long task over 200 ms while flinging the homepage and the brand grid.
- Reduced-motion preference shows no marquee and no reveal animation.
- Consent, cart, and color change still work.
- Desktop LCP does not regress past 2.5 s.

**Expected impact:** hypothesis. Little change to lab LCP. The gain is scroll smoothness and less GPU work on the phone. **Risk:** low. **Depends on:** Phase B, so the trace is not dominated by the old image queue.

## Phase D — Images and asset delivery

PERF-03, PERF-10, PERF-12, PERF-13. About 4–6 days, mostly review of derivatives.

**Work**

- Brand-card AVIF/WebP at the sizes in `BRAND_GRID_SIZES_*`. Turn off `unoptimized` for those derivatives only.
- One request per homepage tile. Lightbox keeps `fullSrc`.
- Product-listing derivatives for `/images/products/`, originals kept for zoom. Do not switch URLs until the side-by-side check passes.
- Configurator preview uses the derivative. Lightbox uses the master.
- Drop font weights that the UI does not need, after a visual check of headings.
- Leave unreferenced multi-megabyte masters out of the upload path without deleting the source files from version control or storage.

**Acceptance**

- `/dywaniki` and `/modele` mobile weight ≤ 1.5 MB on the cold run, or a written exception for a full-scroll case that still beats 14 MB by a wide margin.
- No listing image that looks softer than today’s file at the same CSS size.
- Zoom network log shows the original URL.
- Hero PNG and AVIF masters still exist.

**Expected impact:** hypothesis. The 4–14 MB image transfers are the part of the lab that scales almost linearly with Slow 4G. Cutting them is the largest byte win. LCP moves only if those bytes were in the queue before the LCP image (they are, on `/dywaniki` and `/modele`).

**Risk:** medium, image quality. **Depends on:** Phase B layout stability, so new files are not blamed for the old CLS.

## Phase E — Frontend architecture and tags

PERF-05, PERF-07, PERF-08, PERF-11. About 4–6 days.

**Work**

- Server-render the first brand row on `/modele` and `/dywaniki`, with the existing API as the source of truth on the server.
- Viewport-load the homepage sections that sit below the gallery.
- After the hero request is started, load GTM. Prove `page_view`, ads, and purchase in a preview. Keep one consent UI.
- Shorten the consent panel without removing the choice or the default-denied script.
- Instrument checkout with the fixture cart. Remove render-path `console.log`.
- Leave `ConfiguratorSimple` and the unused `sqlite3` / `@types/three` dependencies for a separate cleanup. Do not mix that cleanup into the LCP patch.

**Acceptance**

- Catalog LCP element is a brand or product image, not the consent paragraph.
- Tag Assistant shows the purchase event still fires on the success page in the preview.
- First-party JS on `/` does not grow by more than 10 KB compressed.
- Checkout lab run is valid (URL stays `/checkout`, no payment POST).

**Expected impact:** hypothesis. Less JS on the first screen and a real checkout number. Tag deferral helps the Slow 4G queue and can hurt attribution if it is late. That tradeoff is explicit: tags after first paint, not tags removed.

**Risk:** high on analytics. **Depends on:** Phases B and D.

## Phase F — Cross-device validation

About 2 days, plus whatever Phase E broke.

**Work**

- Repeat Phase 1–4 of `07-PERFORMANCE_TEST_PLAN.md`.
- 390 px and 1440 px on the browse → configure → cart → checkout-stop path.
- Image comparisons from Phase D stored next to the phase note.
- One Edge lab run. Safari only if a Mac is available. Say so if it is not.

**Acceptance**

- No critical path broken: brand, vehicle, color, price, cart, checkout form visible.
- CLS ≤ 0.1 on `/`, `/modele`, `/dywaniki`, `/konfigurator`.
- Derivatives accepted or reverted one by one.

**Risk:** medium, regressions from B–E landing together. **Depends on:** Phase E.

## Phase G — Final benchmark

About 1 day.

**Work**

- Same profiles as `02-PERFORMANCE_BASELINE.md`, new commit, three-run medians.
- One read-only production Lighthouse after release, plus CrUX when the API quota allows.
- Write a short delta table: metric, baseline, new median, pass or fail against `06-PERFORMANCE_ACCEPTANCE_CRITERIA.md`.

**Acceptance**

- Mobile and desktop gates in the acceptance doc, or a listed miss with the next bottleneck.
- Image fidelity notes attached.
- No claim that a lab score is field INP.

**Risk:** low. **Depends on:** Phase F.

## Suggested sequence

```text
A baseline (done)
  -> B hero priority, lazy comparison, chat derivative, stable brand grid, configurator image in HTML
    -> C blur, glow, marquee, reduced motion
      -> D derivatives, one request per tile, fonts
        -> E server brand row, defer lower sections, defer GTM, real checkout trace
          -> F journeys and image review
            -> G remasure
```

Phases B and C can overlap only if they touch different files. B owns `HeroSection.tsx`, the comparison slider, the chat icon, and `car-models-section.tsx`. C owns `globals.css`, `navbar.tsx`, and `image-auto-slider.tsx`.

## Out of scope until the numbers move

- Rewriting the configurator.
- Replacing Next.js or React.
- Recompressing the product PNG archive in one batch.
- Turning off analytics to buy a score.
- Deploying from this audit.
