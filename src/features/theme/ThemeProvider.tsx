"use client"

import type { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { THEME_STORAGE_KEY } from "./themeInitScript"

type ThemeProviderProps = {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    enableColorScheme
    disableTransitionOnChange
    storageKey={THEME_STORAGE_KEY}
  >
    {children}
  </NextThemesProvider>
)
