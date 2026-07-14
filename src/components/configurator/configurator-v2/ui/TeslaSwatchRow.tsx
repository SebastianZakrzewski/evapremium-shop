"use client"

type TeslaSwatchItem = {
  id: string
  label: string
  color?: string
  imageSrc?: string
}

type TeslaSwatchRowProps = {
  items: TeslaSwatchItem[]
  selectedId: string
  onSelect: (id: string) => void
}

export const TeslaSwatchRow = ({
  items,
  selectedId,
  onSelect,
}: TeslaSwatchRowProps) => (
  <div className="flex flex-wrap gap-3">
    {items.map((item) => {
      const isSelected = selectedId === item.id
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          aria-label={item.label}
          aria-pressed={isSelected}
          title={item.label}
          className={`h-11 w-11 rounded-full border-2 transition-all ${
            isSelected
              ? "border-red-500 ring-2 ring-red-500/40 scale-105"
              : "border-white/25 hover:border-white/50"
          }`}
          style={item.color ? { backgroundColor: item.color } : undefined}
        >
          {item.imageSrc && (
            <span
              className="block h-full w-full rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url(${item.imageSrc})` }}
            />
          )}
        </button>
      )
    })}
  </div>
)
