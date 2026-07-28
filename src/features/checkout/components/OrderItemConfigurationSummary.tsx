import type { MatConfiguration } from "@/features/vehicle-catalog/model/matConfiguration"
import {
  type CartItemConfiguration,
  isMatCartConfiguration,
} from "@/lib/types/cart-new"
import {
  formatMatCarBodyTypeLabel,
  formatMatCarDetailsTitle,
  getMatConfigurationDisplayRows,
} from "@/shared/mat-configuration-display"

type OrderItemConfigurationSummaryProps = {
  configuration: unknown
  compact?: boolean
}

export const OrderItemConfigurationSummary = ({
  configuration,
  compact = false,
}: OrderItemConfigurationSummaryProps) => {
  const cartConfiguration = configuration as CartItemConfiguration | undefined
  if (!isMatCartConfiguration(cartConfiguration)) {
    return null
  }

  const matConfig = cartConfiguration as MatConfiguration
  const carDetails = matConfig.carDetails
  const rows = getMatConfigurationDisplayRows(matConfig)

  if (!carDetails && rows.length === 0) {
    return null
  }

  const rowClassName = compact
    ? "flex items-center justify-between gap-3 py-1.5 px-2.5 bg-white/5 rounded-lg"
    : "flex items-center justify-between gap-3 py-2 px-3 bg-white/5 rounded-lg"
  const labelClassName = compact
    ? "text-xs text-white/60 shrink-0"
    : "text-sm text-white/70 shrink-0"
  const valueClassName = compact
    ? "text-xs font-medium text-white text-right"
    : "text-sm font-medium text-white text-right"

  return (
    <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
      {carDetails && (
        <div className="text-xs text-white/70">
          <p className="font-medium text-white/90">
            {formatMatCarDetailsTitle(carDetails)}
          </p>
          {carDetails.bodyType && (
            <p className="mt-0.5 text-white/60">
              {formatMatCarBodyTypeLabel(carDetails)}
            </p>
          )}
        </div>
      )}

      {rows.length > 0 && (
        <div className="grid grid-cols-1 gap-1.5">
          {rows.map((row) => (
            <div key={row.label} className={rowClassName}>
              <span className={labelClassName}>{row.label}:</span>
              <span className={valueClassName}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
