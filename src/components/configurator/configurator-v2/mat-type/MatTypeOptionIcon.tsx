import Image from "next/image"
import {
  MAT_TYPE_OPTION_ICON_SIZE,
  MAT_TYPE_OPTION_ICON_SRC_SIZE,
  matTypeOptionIconBoxClassName,
  matTypeOptionIconImageClassName,
} from "../mat-type/matTypePresentation"

type MatTypeOptionIconProps = {
  src: string
  alt: string
  selected?: boolean
}

export const MatTypeOptionIcon = ({
  src,
  alt,
  selected = false,
}: MatTypeOptionIconProps) => (
  <div
    className={`${matTypeOptionIconBoxClassName} transition-colors ${
      selected ? "ring-1 ring-white/10" : ""
    }`}
    style={{
      width: MAT_TYPE_OPTION_ICON_SIZE,
      height: MAT_TYPE_OPTION_ICON_SIZE,
      minWidth: MAT_TYPE_OPTION_ICON_SIZE,
      minHeight: MAT_TYPE_OPTION_ICON_SIZE,
    }}
  >
    <Image
      src={src}
      alt={alt}
      width={MAT_TYPE_OPTION_ICON_SRC_SIZE}
      height={MAT_TYPE_OPTION_ICON_SRC_SIZE}
      quality={100}
      unoptimized
      sizes={`${MAT_TYPE_OPTION_ICON_SIZE}px`}
      className={matTypeOptionIconImageClassName}
      draggable={false}
    />
  </div>
)
