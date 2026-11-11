type IconProps = { className?: string }

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

/** Edge with a running stitch. */
export const PremiumStitchIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <path d="M10 40c8-14 14-14 22 0s14 14 22 0" {...stroke} />
    <path d="M14 40v6M22 34v6M30 40v6M38 34v6M46 40v6" {...stroke} />
  </svg>
)

/** Shield with a drop leaving the surface. */
export const AntiDirtIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <path d="M32 10l16 6v14c0 10-6 16-16 20-10-4-16-10-16-20V16l16-6z" {...stroke} />
    <path d="M40 18c4 2 6 6 6 6" {...stroke} />
    <path d="M44 16c1.5 3 .5 5-1 6" {...stroke} />
  </svg>
)
