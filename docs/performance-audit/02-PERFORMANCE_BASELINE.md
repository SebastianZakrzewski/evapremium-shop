# Performance baseline

Numbers below were measured. Ranges in the roadmap are not measurements.

## Setup

| Item | Value |
|---|---|
| Repository | `master` at `528cfba1eec6da3705dd6ea0b2490c75c28bc040` |
| Build | `npm run build` then `npx next start -H 127.0.0.1 -p 3010` |
| Next.js | 16.4.5 (Turbopack), React 18. The lockfile requires these versions. The machine initially had Next 16.0.10 and Zod 3.25.76, and `next build` failed typechecking `z.enum(..., { error })`. `npm install` aligned `node_modules` to the lockfile. `package.json` and `package-lock.json` were not edited |
| Browser | Chrome 157.0.8103.39, headless |
| Lighthouse | 13.6.0, performance category only |
| Mobile cold | Simulated throttling. Screen 412×823, DPR 1.75, RTT 150 ms, down 1,638 kbps, up 675 kbps, CPU 4×. This is the Moto G Power profile. Three runs, storage reset. Median is the middle value |
| Desktop cold | Lighthouse desktop preset, no extra CPU or network throttle. Three runs |
| Mid-range | One run. Same phone screen, simulated, RTT 60 ms, 9,000 kbps, CPU 4×. Pages: `/`, `/modele`, `/konfigurator` |
| Warm | Mobile profile with `--disable-storage-reset`, two runs. The second run is the warm attempt |
| Production | One mobile run each of `https://www.evapremium.pl/`, `/modele`, and `/konfigurator?brand=audi&model=a4`. Read-only. No checkout, no form post |
| Date | 10 November 2026 |

Raw JSON and `summary.jsonl` are in `docs/performance-audit/evidence/lighthouse/`. Medians were computed by `evidence/median-table.mjs`.

Local TTFB is 2–7 ms because the server is on the same computer. It is not the production TTFB. The one production run reported document TTFB of 30 ms with `X-Vercel-Cache: HIT` observed on a separate header check (`Age` about 15,172 s, `X-Nextjs-Prerender: 1`). That 30 ms is one lab sample from this network, not the CrUX p75.

INP was not in the Lighthouse reports. It is unmeasured. TBT is listed separately and is not INP.

No physical phone, laptop matrix, or second browser was used. Frame drops while scrolling were not recorded. Memory snapshots were not taken.

PageSpeed Insights returned HTTP 429 (daily quota). Field p75 for mobile and desktop is unavailable.

`/checkout` is invalid in this baseline. With an empty cart the page calls `router.push('/')` after 1 s. The lab DOM for those runs is the homepage. Those rows are omitted from the gates.

The configurator URL contains `&`. The first unquoted shell attempt failed all six runs. The figures below are the rerun with the URL quoted.

## How to read LCP

Lighthouse simulated LCP and the element breakdown are different clocks.

On localhost the homepage hero breakdown was about 5 ms TTFB, 12 ms resource delay, 10 ms download, 390 ms render delay. The simulated metric used for the score was 12.8 s. The simulator replays the byte queue onto Slow 4G. The hero is 123 KB, and the page also downloads about 1.6 MB of other images plus about 0.9 MB of script during the same load, without a priority hint on the first hero request.

A single production run of the same homepage, same approximate weight (2.9 MB), scored LCP 5.4 s. Treat 5.4 s and 12.8 s as two lab observations of one page, not as a before-and-after.

The mid-range profile (9 Mbps, 4× CPU) measured homepage LCP at 2.7 s. Slow 4G is the harsh gate. The faster profile shows how much of the 12.8 s is the throttled queue.

## Mobile cold, local, median of 3

| Page | Score | LCP | FCP | TBT | CLS | TTI | Weight | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 71 | 12.8 s | 1.2 s | 214 ms | 0.000 | 14.4 s | 2,987 KB | 66 |
| `/modele` | 47 | 8.6 s | 1.1 s | 293 ms | 0.564 | 16.2 s | 5,426 KB | 91 |
| `/modele?brand=audi` | 68 | 9.2 s | 1.1 s | 271 ms | 0.057 | 10.9 s | 1,821 KB | 59 |
| `/dywaniki` | 72 | 7.9 s | 1.1 s | 196 ms | 0.025 | 18.6 s | 14,470 KB | 161 |
| `/konfigurator?brand=audi&model=a4` | 70 | 8.3 s | 1.1 s | 277 ms | 0.000 | 10.2 s | 1,431 KB | 62 |
| `/galeria` | 71 | 12.7 s | 1.1 s | 238 ms | 0.000 | 12.8 s | 2,088 KB | 55 |
| `/akcesoria` | 70 | 13.5 s | 1.1 s | 247 ms | 0.024 | 13.7 s | 2,202 KB | 66 |

LCP score inside Lighthouse is 0 for the homepage (12.8 s). The category score is still 71 because FCP, Speed Index, TBT, and CLS carry the other 75% of the weight. A score of 71 with an LCP score of 0 is a failed page.

Representative homepage mobile run, main-thread breakdown: script evaluation about 1,040 ms, style and layout about 332 ms, parse about 254 ms, other about 292 ms. About 12 long tasks. Desktop runs showed 0 long tasks.

## Desktop cold, local, median of 3

| Page | Score | LCP | FCP | TBT | CLS | TTI | Weight | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 90 | 2.1 s | 0.3 s | 0 ms | 0.000 | 2.1 s | 3,119 KB | 88 |
| `/modele` | 76 | 1.7 s | 0.3 s | 0 ms | 0.345 | 1.8 s | 9,694 KB | 144 |
| `/modele?brand=audi` | 94 | 1.6 s | 0.3 s | 0 ms | 0.035 | 1.7 s | 1,930 KB | 85 |
| `/dywaniki` | 95 | 1.5 s | 0.3 s | 0 ms | 0.000 | 1.5 s | 14,460 KB | 176 |
| `/konfigurator?brand=audi&model=a4` | 90 | 2.2 s | 0.3 s | 0 ms | 0.000 | 2.2 s | 1,845 KB | 82 |
| `/galeria` | 94 | 1.7 s | 0.3 s | 0 ms | 0.000 | 1.7 s | 2,163 KB | 100 |
| `/akcesoria` | 85 | 2.7 s | 0.3 s | 0 ms | 0.000 | 2.7 s | 2,246 KB | 82 |

Desktop homepage meets the LCP and score targets. Desktop `/modele` does not meet CLS or weight. Desktop `/dywaniki` meets LCP and score while moving 14 MB.

## Mid-range, one local run

| Page | Score | LCP | TBT | CLS | Weight |
|---|---:|---:|---:|---:|---:|
| `/` | 86 | 2.7 s | 400 ms | 0.000 | 3,064 KB |
| `/modele` | 67 | 2.0 s | 423 ms | 0.564 | 5,426 KB |
| `/konfigurator?brand=audi&model=a4` | 94 | 2.2 s | 255 ms | 0.000 | 1,431 KB |

CLS on `/modele` is the same 0.564 as Slow 4G. The shift is not a slow-network artifact.

## Warm cache attempt

Second mobile run with storage reset disabled:

| Page | Run 2 LCP | Run 2 weight | Cold median LCP |
|---|---:|---:|---:|
| `/` | 12.8 s | 2,988 KB | 12.8 s |
| `/modele` | 7.9 s | 5,426 KB | 8.6 s |
| `/konfigurator` | 8.3 s | 1,430 KB | 8.3 s |

Transferred bytes did not drop. This procedure did not show a warm-cache benefit. Do not claim the pages are served from cache in the lab.

## Production, one mobile run

Live host, not proven to be commit `528cfba`. Asset names match this commit (winter hero, chat icon, comparison WebPs, `/modele/audi.avif` in the configurator). Image URLs carried Vercel `?dpl=dpl_6aHUkDNdb3K7X8mgKhitK2vgtv49`.

| Page | Score | LCP | FCP | TBT | CLS | TTFB | Weight |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 74 | 5.4 s | 1.1 s | 249 ms | 0.000 | 30 ms | 2,978 KB |
| `/modele` | 69 | 8.4 s | 1.1 s | 288 ms | 0.000 | 30 ms | 5,415 KB |
| `/konfigurator?brand=audi&model=a4` | 66 | 8.3 s | 1.1 s | 389 ms | 0.000 | 30 ms | 1,412 KB |

Production `/modele` still downloaded 35 brand images, about 3.7 MB. CLS on that single run was 0, while every local run of this commit scored 0.564 on the brand grid. One live sample does not retire the local bug. n = 1, so these production cells have no spread.

## LCP elements

| Page | Lab | Element |
|---|---|---|
| `/` mobile local | Winter hero `<img>` inside `<picture>`, 396×704, top at about 466 px | VERIFIED |
| `/` desktop local | `jesien-hero-1234.avif`, 98 KB | VERIFIED. The 2.4 MB PNG was not requested |
| `/modele` local | Cookie description, then one shift of the brand grid | VERIFIED |
| `/dywaniki`, `/modele?brand=audi` | Cookie description | VERIFIED |
| `/konfigurator` local and production | Hidden crossfade `<img src="/modele/audi.avif">`. Not in the initial HTML (0 images in the document) | VERIFIED |
| `/galeria` | A gallery photo | VERIFIED |
| `/akcesoria` | “Organizer do bagażnika Klasyczny XL” | VERIFIED |
| `/` production | Insight did not name a node. The request list still contains the 123 KB winter hero, the 359 KB chat icon, and both comparison images | VERIFIED requests |

## Historical leads

| Old note | This baseline |
|---|---|
| Homepage mobile LCP about 30.2 s | Not reproduced. Local simulated 12.8 s. One live run 5.4 s. Both fail 2.5 s |
| Homepage about 9.6 MiB | Homepage is about 2.9 MiB. `/modele` desktop is 9.5 MB. `/dywaniki` is 14.1 MB |
| `/modele` LCP about 9.6 s | Local 8.6 s, live 8.4 s. Same class of result |
| `/modele` CLS about 0.564 | Local mobile and mid-range 0.564 on every run. Desktop 0.345. One live run scored 0 |
| Configurator LCP about 13.6 s | Local 8.3 s, live 8.3 s, desktop 2.2 s |

## Third-party bytes on the local homepage

From the mobile run, transfer and main thread reported by Lighthouse:

| Party | Transfer | Main thread |
|---|---:|---:|
| Google Tag Manager, including `gtag.js` for `G-SGHPWGL4P4` and `AW-18303682173`, plus `gtm.js` | about 508 KB | about 91 ms |
| Cookiebot `uc.js` | about 38 KB | about 18 ms |

First-party script transfer on that run was the rest of the roughly 946 KB of script. Fonts were four WOFF2 files, 233 KB, preloaded from `next/font` (Montserrat and Inter, weights 400–700, latin and latin-ext).
