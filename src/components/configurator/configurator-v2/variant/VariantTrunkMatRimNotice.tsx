import Image from "next/image"
import {
  VARIANT_TRUNK_MAT_RIM_NOTICE_ALT,
  VARIANT_TRUNK_MAT_RIM_NOTICE_BODY,
  VARIANT_TRUNK_MAT_RIM_NOTICE_ICON_SRC,
  VARIANT_TRUNK_MAT_RIM_NOTICE_LABEL,
} from "./trunkMatRimNotice"

export const VariantTrunkMatRimNotice = () => (
  <div
    role="status"
    className="mt-3 flex items-center gap-3 rounded-2xl border border-neutral-300 bg-[#FFFFFF] px-3 py-2.5"
  >
    <Image
      src={VARIANT_TRUNK_MAT_RIM_NOTICE_ICON_SRC}
      alt={VARIANT_TRUNK_MAT_RIM_NOTICE_ALT}
      width={64}
      height={56}
      className="h-14 w-16 shrink-0 rounded-md bg-white object-contain"
    />
    <div className="min-w-0">
      <p className="text-sm font-medium tracking-tight text-neutral-950">
        {VARIANT_TRUNK_MAT_RIM_NOTICE_LABEL}
      </p>
      <p className="mt-0.5 text-xs leading-snug text-neutral-600">
        {VARIANT_TRUNK_MAT_RIM_NOTICE_BODY}
      </p>
    </div>
  </div>
)
