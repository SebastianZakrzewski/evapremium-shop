import { describe, expect, it } from "vitest";
import { getBrandsCarouselBehavior } from "@/components/brands/carouselBehavior";

describe("getBrandsCarouselBehavior", () => {
  it("uses slide effect on mobile", () => {
    const behavior = getBrandsCarouselBehavior({
      isMobile: true,
      prefersReducedMotion: false,
      totalItems: 5,
    });

    expect(behavior.effect).toBe("slide");
    expect(behavior.slidesPerView).toBe(1.2);
    expect(behavior.centeredSlides).toBe(false);
    expect(behavior.loop).toBe(true);
    expect(behavior.coverflowDepth).toBe(0);
  });

  it("uses slide effect with reduced motion on desktop", () => {
    const behavior = getBrandsCarouselBehavior({
      isMobile: false,
      prefersReducedMotion: true,
      totalItems: 6,
    });

    expect(behavior.effect).toBe("slide");
    expect(behavior.slidesPerView).toBe("auto");
    expect(behavior.centeredSlides).toBe(true);
    expect(behavior.speed).toBe(700);
  });

  it("disables loop when there are too few slides", () => {
    const desktopBehavior = getBrandsCarouselBehavior({
      isMobile: false,
      prefersReducedMotion: false,
      totalItems: 3,
    });
    const mobileBehavior = getBrandsCarouselBehavior({
      isMobile: true,
      prefersReducedMotion: false,
      totalItems: 2,
    });

    expect(desktopBehavior.loop).toBe(false);
    expect(mobileBehavior.loop).toBe(false);
  });
});
