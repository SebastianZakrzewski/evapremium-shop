import Image from "next/image"
import {
  VARIANT_TUNNEL_BONUS_ALT,
  VARIANT_TUNNEL_BONUS_ICON_SRC,
  VARIANT_TUNNEL_BONUS_LABEL,
} from "./variantTunnelBonus"

export const VariantTunnelBonusNotice = () => (
  <div className="mt-3 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/[0.06] px-3 py-2.5">
    <Image
      src={VARIANT_TUNNEL_BONUS_ICON_SRC}
      alt={VARIANT_TUNNEL_BONUS_ALT}
      width={56}
      height={56}
      className="h-14 w-14 shrink-0 rounded-md object-cover"
    />
    <div className="min-w-0">
      <p className="text-sm font-semibold text-green-400">
        {VARIANT_TUNNEL_BONUS_LABEL}
      </p>
      <p className="mt-0.5 text-xs leading-snug text-gray-400">
        Pokrycie tunelu środkowego jest zawsze w komplecie — bez dodatkowej opłaty.
      </p>
    </div>
  </div>
)
