# Performance test plan

Use this plan for every optimization phase in `03-OPTIMIZATION_ROADMAP.md`. Compare against `02-PERFORMANCE_BASELINE.md` on the same commit’s production build before the change, then again after.

## Safety

- Run against `next start` locally, or against a preview deployment that is not production.
- Do not submit checkout. Do not call Przelewy24, Paynow, Bitrix, or the abandoned-cart export.
- Seed the cart by writing `cart-v2` in `localStorage` in the test browser only. Block `POST /api/orders`, `POST /api/abandoned-carts`, and payment register routes in the test proxy.
- An empty cart redirects `/checkout` to `/` after 1 s (`CheckoutSection.tsx`). A checkout lab run without a fixture measures the homepage. Treat those runs as invalid.
- Do not turn on production analytics debug, and do not accept marketing cookies in the automated profile unless the case is specifically “tags after consent”.

## 1. Lab performance

Tool: Lighthouse 13 or newer, Chrome stable, three runs, median.

Profiles:

| Profile | Settings |
|---|---|
| Mobile cold | Simulated. 412×823, DPR 1.75, RTT 150 ms, 1,638 kbps, CPU 4×. Storage reset |
| Desktop cold | Lighthouse desktop preset. Storage reset |
| Mid-range | Simulated. Same screen, RTT 60 ms, 9,000 kbps, CPU 4×. One run on `/`, `/modele`, `/konfigurator` |
| Mobile warm | Same as mobile cold with `--disable-storage-reset`, record the second run |

URLs:

- `/`
- `/modele`
- `/modele?brand=audi`
- `/dywaniki`
- `/konfigurator?brand=audi&model=a4`
- `/galeria`
- `/akcesoria`
- `/checkout` only with a fixture cart and blocked payment routes

Quote URLs in the shell. An unquoted `&` drops the query and the run fails. The helper is `docs/performance-audit/evidence/run-lighthouse.mjs`.

Record LCP, FCP, CLS, TBT, TTI, TTFB, transferred bytes, request count, LCP element selector, and the top five requests. Store JSON under `docs/performance-audit/evidence/lighthouse/`. TBT is not INP.

Pass when the page meets `06-PERFORMANCE_ACCEPTANCE_CRITERIA.md` or the phase’s own delta (for example “brand-grid CLS ≤ 0.1” even if LCP is still above 2.5 s during an earlier phase).

## 2. Interaction trace

Once per phase, on mobile emulation (4× CPU):

1. Open the menu and close it.
2. On the homepage, scroll to the gallery and back to the hero.
3. On `/konfigurator?brand=audi&model=a4`, change material color and edge color.
4. Add the configuration to the cart, open the cart, close it.

Capture a Chrome performance trace. Pass when the longest main-thread task during those gestures is ≤ 200 ms and the preview updates without a blank frame. Report that number as an interaction latency, and call it INP only if the trace tool reports INP.

## 3. Functional

Existing Vitest suite stays green (`npm test`). Add or extend cases when a phase changes behavior:

- Hero picture: mobile source is the winter PNG, desktop source is the AVIF srcset, fallback PNG is not the only candidate.
- Brand grid: first response reserves space, so a late brand list does not change the document height by more than the consent banner.
- Configurator: entry query still selects the vehicle, color change still changes the preview URL, zoom still receives the original URL.
- Cart: fixture line still prices and still edits quantity.
- Consent: default denied, accept unlocks marketing, reject keeps ads redacted.

Manual, on the local production server:

- Browse `/dywaniki`, open a brand, open the configurator, change two options, add to cart, open the cart, land on checkout, stop.
- Repeat at 390 px width and at 1440 px width.
- Keyboard: tab to the hero call to action, the brand card, the configurator controls, and the consent buttons.

## 4. Visual and image fidelity

For each derivative that replaces a card or a preview:

- Screenshot the current file and the derivative at the CSS size, on a 2× display.
- Check cell texture, stitching, and color against the original.
- Open the zoom control and confirm it still loads the original bytes (network log shows the master URL, not the thumbnail).

Pages for screenshots: `/`, `/modele`, `/dywaniki`, `/konfigurator`, `/galeria` lightbox, `/akcesoria`. Desktop and 390 px. Fail the change if the listing looks softer than the current production image at that size.

Playwright is not installed. Until it is added with approval, use the browser at the two widths and store the screenshots beside the phase notes. Do not add the dependency inside an unrelated performance patch.

## 5. Memory

On `/` and `/konfigurator`, take a heap snapshot after load, scroll for 30 s, and snapshot again. Pass when the second snapshot is within 20 MB of the first after a forced GC, and detached DOM nodes do not grow with the marquee. This is a manual Chrome task. The marquee currently duplicates every tile for the infinite loop, so this check matters most for Phase C.

## 6. Bundle

After `next build`, record compressed size of the JS referenced by `/` and `/konfigurator` (script tags in the HTML, gzip). Fail the phase if first-party JS on `/` grows by more than 10 KB unless the phase’s written note explains the feature.

Do not add a bundle-analyzer dependency unless the HTML script list stops being enough.

## 7. Cross-browser

Chrome is the lab gate. Before the last phase, repeat the mobile cold Lighthouse once in Edge, and click through the configurator once in Safari if a Mac is available. This audit used Chrome 157 only. Safari compositing of `backdrop-filter` was not measured.

## 8. Production read-only check

After a preview looks right, one mobile Lighthouse against `https://www.evapremium.pl/` and `/modele` and `/konfigurator`. No form posts. Compare TTFB with the 800 ms goal. Field p75 comes from CrUX or PageSpeed when the API quota allows it. A 429 is recorded as “field data unavailable”, not as a pass.

## 9. What blocked a full checkout measurement this time

`/checkout` with an empty cart navigates to `/` after one second. The Lighthouse runs of `/checkout` in the baseline captured the homepage and are marked invalid. The next checkout measurement needs the fixture cart and the blocked payment routes above. No order was created during this audit.
