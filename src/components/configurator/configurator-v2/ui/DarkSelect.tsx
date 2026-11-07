"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"

export type DarkSelectOption = {
  value: string
  label: string
}

type DarkSelectProps = {
  id: string
  value: string
  placeholder: string
  ariaLabel: string
  options: DarkSelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
  surface?: "dark" | "light"
}

type MenuBox = {
  top: number
  left: number
  width: number
}

export const DarkSelect = ({
  id,
  value,
  placeholder,
  ariaLabel,
  options,
  onChange,
  disabled = false,
  surface = "dark",
}: DarkSelectProps) => {
  const [open, setOpen] = useState(false)
  const [menuBox, setMenuBox] = useState<MenuBox | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return

    const placeMenu = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      setMenuBox({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      })
    }

    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      if (target instanceof Element && target.closest("[data-dark-select-menu]")) return
      setOpen(false)
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    placeMenu()
    document.addEventListener("pointerdown", closeOnOutside)
    document.addEventListener("keydown", closeOnEscape)
    window.addEventListener("resize", placeMenu)
    window.addEventListener("scroll", placeMenu, true)

    return () => {
      document.removeEventListener("pointerdown", closeOnOutside)
      document.removeEventListener("keydown", closeOnEscape)
      window.removeEventListener("resize", placeMenu)
      window.removeEventListener("scroll", placeMenu, true)
    }
  }, [open])

  const menu =
    open && menuBox
      ? createPortal(
          <ul
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            data-dark-select-menu
            style={{ top: menuBox.top, left: menuBox.left, width: menuBox.width }}
            className={`fixed z-[90] max-h-60 overflow-y-auto rounded-xl border py-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)] ${
              surface === "light"
                ? "border-neutral-300 bg-[#FDFDFD]"
                : "border-white/10 bg-black"
            }`}
          >
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={`flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      surface === "light"
                        ? isSelected
                          ? "bg-neutral-100 text-neutral-950"
                          : "text-neutral-800 hover:bg-neutral-100"
                        : isSelected
                          ? "bg-white/[0.06] text-white"
                          : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span className="min-w-0 flex-1">{option.label}</span>
                    {isSelected && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>,
          document.body,
        )
      : null

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full min-h-11 items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm outline-none transition-shadow disabled:cursor-not-allowed disabled:opacity-50 ${
          surface === "light"
            ? `border bg-[#FDFDFD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 ${
                selected ? "border-neutral-950" : "border-neutral-300"
              }`
            : "bg-black/40 ring-1 ring-transparent focus-visible:ring-red-500/70"
        }`}
      >
        <span
          className={
            surface === "light"
              ? selected
                ? "text-neutral-950"
                : "text-neutral-500"
              : selected
                ? "text-white"
                : "text-white/45"
          }
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${
            surface === "light" ? "text-neutral-500" : "text-white/35"
          } ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {menu}
    </div>
  )
}
