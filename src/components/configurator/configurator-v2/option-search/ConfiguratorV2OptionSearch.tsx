"use client"

import { Search } from "lucide-react"

type ConfiguratorV2OptionSearchProps = {
  query: string
  matchCount: number
  onQueryChange: (query: string) => void
}

export const ConfiguratorV2OptionSearch = ({
  query,
  matchCount,
  onQueryChange,
}: ConfiguratorV2OptionSearchProps) => {
  const hasQuery = query.trim().length > 0

  return (
    <div className="mb-4">
      <label className="relative block">
        <span className="sr-only">Szukaj opcji</span>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Szukaj opcji"
          className="h-12 w-full rounded-xl border border-white/15 bg-transparent pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
        />
      </label>
      {hasQuery && (
        <p className="mt-2 text-xs text-white/50" aria-live="polite">
          Liczba trafień: {matchCount}
        </p>
      )}
    </div>
  )
}
