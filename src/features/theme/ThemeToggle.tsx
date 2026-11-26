"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { pushGtag } from "@/lib/tracking/ga4/gtag"

const LIGHT_LABEL = "Przełącz na ciemny motyw"
const DARK_LABEL = "Przełącz na jasny motyw"

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? DARK_LABEL : LIGHT_LABEL

  const handleClick = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(next)
    pushGtag("event", "theme_toggle", { theme: next })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-950 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
    >
      <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
      <Moon className="h-5 w-5 dark:hidden" aria-hidden="true" />
    </button>
  )
}
