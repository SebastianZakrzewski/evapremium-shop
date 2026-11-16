import { readFileSync } from "node:fs"
import path from "node:path"

const readAvif = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath)).toString("base64")

const mobileAvif = readAvif("public/zimowa_mobile_hero.avif")
const desktopAvif = readAvif("public/images/hero/responsive/jesien-hero-1234.avif")

export const HeroPromoImage = () => (
  <section
    className="relative overflow-visible bg-[#FFFFFF] pb-6 max-sm:pb-4 md:overflow-hidden md:pb-4"
    role="region"
    aria-label="Sekcja promocyjna - dywaniki samochodowe"
  >
    <div className="container relative mx-auto px-2 py-3 sm:px-4 sm:py-4 md:py-4">
      <div
        className="relative mx-auto w-full max-w-[1234px] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 aspect-[576/1024] md:aspect-[1234/413] sm:rounded-2xl md:rounded-3xl"
        data-testid="hero-promo"
      >
        <picture>
          <source
            media="(max-width: 767px)"
            type="image/avif"
            srcSet={`data:image/avif;base64,${mobileAvif}`}
          />
          <source
            media="(min-width: 768px)"
            type="image/avif"
            srcSet={`data:image/avif;base64,${desktopAvif}`}
          />
          <img
            src="/zimowa_mobile_hero.png?v=577"
            alt="Jesienna promocja dywaników samochodowych EVA Premium do -30%"
            className="h-full w-full object-contain object-center"
            decoding="async"
            fetchPriority="high"
            width={576}
            height={1024}
          />
        </picture>
        <a
          href="/dywaniki"
          data-testid="hero-mobile-promo-cta-button"
          className="pointer-events-auto absolute bottom-[1.5%] left-1/2 z-40 flex min-h-11 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-bold text-white md:hidden"
        >
          Skonfiguruj dywaniki do swojego auta
        </a>
      </div>
    </div>
  </section>
)
