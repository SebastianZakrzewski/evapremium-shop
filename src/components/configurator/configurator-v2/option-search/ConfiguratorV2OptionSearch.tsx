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
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Szukaj opcji"
          className="h-11 w-full rounded-xl border border-neutral-300 bg-[#FDFDFD] pl-10 pr-4 text-sm text-neutral-950 outline-none placeholder:text-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
        />
      </label>
      {hasQuery && matchCount > 0 && (
        <p className="mt-2 text-xs text-neutral-600" aria-live="polite">
          Liczba trafień: {matchCount}
        </p>
      )}
      {hasQuery && matchCount === 0 && (
        <p className="mt-2 text-[13px] leading-snug text-neutral-800" role="status">
          Brak pasujących opcji. Dotychczasowy wybór zostaje bez zmian.
        </p>
      )}
    </div>
  )
}
