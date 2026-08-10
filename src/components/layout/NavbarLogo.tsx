"use client"

import Link from "next/link"
import { NavbarLogoSvg } from "./navbar-logo-svg"
import { useNavbarLogoAnimation } from "./useNavbarLogoAnimation"

export const NavbarLogo = () => {
  const playAnimation = useNavbarLogoAnimation()

  return (
    <Link
      href="/"
      className="z-10 flex items-center justify-center gap-2 text-lg font-bold text-white transition-opacity hover:opacity-80"
      aria-label="EvaPremium – strona główna"
    >
      <NavbarLogoSvg
        className="h-12 w-auto max-w-[min(100%,11rem)] object-contain sm:h-14 md:h-16 lg:h-20 lg:max-w-none"
        playAnimation={playAnimation}
        aria-hidden="true"
        focusable="false"
      />
    </Link>
  )
}
