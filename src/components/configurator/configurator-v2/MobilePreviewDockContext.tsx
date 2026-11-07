"use client"

import { createContext, useContext, type ReactNode } from "react"

const MobilePreviewDockContext = createContext(false)

type MobilePreviewDockProviderProps = {
  docked: boolean
  children: ReactNode
}

export const MobilePreviewDockProvider = ({
  docked,
  children,
}: MobilePreviewDockProviderProps) => (
  <MobilePreviewDockContext.Provider value={docked}>
    {children}
  </MobilePreviewDockContext.Provider>
)

export const useMobilePreviewDocked = () => useContext(MobilePreviewDockContext)
