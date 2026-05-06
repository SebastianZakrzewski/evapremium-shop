export type CarouselBehaviorInput = {
  isMobile: boolean
  prefersReducedMotion: boolean
  totalItems: number
}

export type CarouselBehaviorOutput = {
  effect: "slide" | "coverflow"
  slidesPerView: number | "auto"
  centeredSlides: boolean
  loop: boolean
  coverflowDepth: number
  speed: number
  autoplayDelay: number
}

export const getBrandsCarouselBehavior = ({
  isMobile,
  prefersReducedMotion,
  totalItems,
}: CarouselBehaviorInput): CarouselBehaviorOutput => {
  const useSlideEffect = isMobile || prefersReducedMotion
  const minLoopSlides = isMobile ? 3 : 4

  return {
    effect: useSlideEffect ? "slide" : "coverflow",
    slidesPerView: isMobile ? 1.2 : "auto",
    centeredSlides: !isMobile,
    loop: totalItems >= minLoopSlides,
    coverflowDepth: isMobile ? 0 : 120,
    speed: isMobile ? 460 : 700,
    autoplayDelay: isMobile ? 2800 : 2200,
  }
}
