export const MAT_TYPE_OPTION_ICON_SIZE = 56

/** Źródłowa rozdzielczość assetów (2× wyświetlania, ostre na Retina). */
export const MAT_TYPE_OPTION_ICON_SRC_SIZE = 224

export const matTypeOptionIconBoxClassName =
  "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/[0.07]"

export const matTypeOptionIconImageClassName =
  "h-full w-full rounded-lg object-contain"

export const MAT_TYPE_WITH_RIMS_ICON_SRC =
  "/konfigurator/typ-dywanika/3d-z-rantami.png"

export const MAT_TYPE_WITHOUT_RIMS_ICON_SRC =
  "/konfigurator/typ-dywanika/3d-bez-rantow.png"

export const matTypeOptions = [
  {
    id: "3d-with-rims" as const,
    name: "3D z rantami",
    description: "Wysokie ranty chroniące przed brudem",
    iconSrc: MAT_TYPE_WITH_RIMS_ICON_SRC,
    iconAlt: "Dywanik 3D z rantami",
  },
  {
    id: "classic" as const,
    name: "3D bez rantów",
    description: "Standardowe dywaniki bez wysokich rantów",
    iconSrc: MAT_TYPE_WITHOUT_RIMS_ICON_SRC,
    iconAlt: "Dywanik 3D bez rantów",
  },
] as const
