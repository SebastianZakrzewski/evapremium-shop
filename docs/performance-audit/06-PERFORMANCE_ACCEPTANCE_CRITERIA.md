# Performance acceptance criteria

A change is performance-ready when the measurements below are met on the same lab setup as `02-PERFORMANCE_BASELINE.md`, and the shopping paths still complete. Lighthouse 90 is a target. It does not excuse a slower product photo, a broken configurator, or a consent banner that no longer records a choice.

Field data at the 75th percentile was not available for this audit. The PageSpeed Insights API returned HTTP 429. Until a CrUX pull succeeds, lab numbers are the gate. Field numbers become an additional gate as soon as they can be read. They are not replaced by the lab score.

## Lab setup

- Commit under test, production build (`next build` && `next start`), not `next dev`.
- Chrome stable, headless, Lighthouse current major (this baseline used 13.6.0).
- Mobile: simulated, 412×823, 1.75× DPR, RTT 150 ms, throughput 1,638 kbps, CPU 4×. Three runs, median.
- Desktop: Lighthouse desktop preset. Three runs, median.
- One mid-range check on `/`, `/modele`, and `/konfigurator`: simulated, CPU 4×, RTT 60 ms, throughput 9,000 kbps.
- Cold cache is the gate. Warm cache is recorded and must not regress by more than 10% on LCP.

## Numeric gates

| Metric | Mobile gate | Desktop gate |
|---|---|---|
| Lighthouse performance | ≥ 90 | ≥ 90 |
| LCP | ≤ 2.5 s | ≤ 2.5 s |
| INP | ≤ 200 ms when a field or interaction trace exists | ≤ 200 ms |
| CLS | ≤ 0.1 | ≤ 0.1 |
| TTFB | ≤ 800 ms on the deployed host | ≤ 800 ms |
| FCP | ≤ 1.8 s | ≤ 1.8 s |
| Total blocking time | ≤ 200 ms | ≤ 200 ms |
| Long tasks during load | no task over 200 ms on the critical path | same |

Local TTFB in this baseline was a few milliseconds because the server is on the same machine. The 800 ms gate applies to `https://www.evapremium.pl`, not to `127.0.0.1`.

INP was not produced by these Lighthouse runs. A release that claims the INP gate must include an interaction trace: open the menu, change a configurator color, open the cart. The trace is missing until that is done. Do not copy TBT into the INP cell.

## Weight gates

Measured on the mobile cold run, transferred bytes:

| Page | Gate |
|---|---|
| `/` | ≤ 1.2 MB |
| `/modele` | ≤ 1.5 MB |
| `/dywaniki` | ≤ 1.5 MB |
| `/konfigurator?brand=audi&model=a4` | ≤ 1.2 MB |
| `/galeria` | ≤ 1.5 MB |
| `/akcesoria` | ≤ 1.5 MB |

First-party JavaScript on `/` stays ≤ 250 KB compressed. Third-party scripts may load after the hero has painted. They are not deleted.

## Experience gates

- The first screen on a phone shows the hero or the product preview without waiting on the chat icon, the comparison slider, or the brand grid.
- Scrolling the homepage and the brand grid does not run an infinite marquee or a backdrop blur on screens under 768 px.
- `/modele` and `/dywaniki` do not shift when brands arrive. CLS stays ≤ 0.1 with the consent banner visible.
- Configurator preview is requested from the initial HTML when `brand` is in the query.
- Changing color still updates the preview. The full-resolution file still opens from zoom.
- Brand and product derivatives are accepted only after a side-by-side check against the current file at the real display size. Originals remain.
- Consent still defaults to denied, still updates Google Consent Mode, and still unlocks marketing tags only after an accept.
- These paths finish with no console error and no payment request: browse brands, open Audi, open the configurator, change a color, add to cart, open the cart, reach checkout with a fixture cart. Checkout is stopped before `paymentsApi` or Przelewy24.

## Current baseline versus the gate

Mobile Slow 4G, median of three local production runs. This is the gap, not a forecast.

| Page | LCP now | CLS now | Weight now | Score now |
|---|---:|---:|---:|---:|
| `/` | 12.8 s | 0.00 | 2.9 MB | 71 |
| `/modele` | 8.6 s | 0.564 | 5.3 MB | 47 |
| `/dywaniki` | 7.9 s | 0.025 | 14.1 MB | 72 |
| `/konfigurator` | 8.3 s | 0.00 | 1.4 MB | 70 |
| `/galeria` | 12.7 s | 0.00 | 2.0 MB | 71 |
| `/akcesoria` | 13.5 s | 0.024 | 2.2 MB | 70 |

Desktop homepage already meets LCP 2.5 s and score 90 (median LCP 2.1 s, score 90, CLS 0). Desktop `/modele` still fails CLS (0.345) and weight (9.5 MB). Desktop `/dywaniki` meets LCP and score while transferring 14.1 MB, so the score gate alone would hide that page.

## Failure rule

If a change improves the score and increases LCP, CLS, or image weight past these gates, revert it. If a change hits the gates and makes a product photo look softer than the current file at the same CSS size, revert the encode and keep the byte savings only where the comparison passed.
