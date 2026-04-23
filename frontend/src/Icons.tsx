// Minimal, modern SVG icon set (lucide-inspired). Stroke-based, 1.75 weight.
// Replaces all emoji usage across the app.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (p: IconProps) => ({
  width: p.size ?? 20,
  height: p.size ?? 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
})

// ── UI icons ─────────────────────────────────────────────
export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)
export const CompassIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>
)
export const HeartIcon = (p: IconProps & { filled?: boolean }) => (
  <svg {...base(p)} fill={p.filled ? 'currentColor' : 'none'}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
  </svg>
)
export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
)
export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
)
export const MapPinIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
)
export const EuroIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M18 7a6 6 0 1 0 0 10M4 10h10M4 14h10" /></svg>
)
export const ArrowLeftIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
)
export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
)
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12l5 5L20 7" /></svg>
)
export const XIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const ExternalLinkIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M10 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-5M15 3h6v6M10 14 21 3" /></svg>
)
export const SparklesIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2" /></svg>
)

// ── Category icons ───────────────────────────────────────
export const CinemaIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 5v14M17 5v14M3 9h4M3 14h4M17 9h4M17 14h4" /></svg>
)
export const ConcertIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M9 18V6l11-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></svg>
)
export const ExhibitionIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="14" rx="2" /><path d="m4 15 4-4 4 4 3-3 5 5" /><circle cx="9" cy="9" r="1.5" /></svg>
)
export const TheatreIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 4h16v8a8 8 0 1 1-16 0V4z" /><path d="M9 10h.01M15 10h.01" /><path d="M9 14c1 1 2 1.5 3 1.5s2-.5 3-1.5" /></svg>
)
export const FestivalIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 20h18M6 20V10l6-6 6 6v10" /><path d="M10 20v-5h4v5" /></svg>
)

export type CategoryKey = 'CINEMA' | 'CONCERT' | 'EXHIBITION' | 'THEATRE' | 'FESTIVAL'

export const CATEGORY_ICON: Record<string, (p: IconProps) => JSX.Element> = {
  CINEMA: CinemaIcon,
  CONCERT: ConcertIcon,
  EXHIBITION: ExhibitionIcon,
  THEATRE: TheatreIcon,
  FESTIVAL: FestivalIcon,
}

export function CategoryIcon({ category, size = 20, ...rest }: IconProps & { category: string }) {
  const Cmp = CATEGORY_ICON[category] ?? SparklesIcon
  return <Cmp size={size} {...rest} />
}

// ── Event image with graceful fallback ───────────────────
const CATEGORY_GRADIENT: Record<string, string> = {
  CINEMA: 'linear-gradient(135deg,#1a1a2e 0%,#4a3b6b 100%)',
  CONCERT: 'linear-gradient(135deg,#3a1c71 0%,#d76d77 60%,#ffaf7b 100%)',
  EXHIBITION: 'linear-gradient(135deg,#134e5e 0%,#71b280 100%)',
  THEATRE: 'linear-gradient(135deg,#232526 0%,#7b2ff7 100%)',
  FESTIVAL: 'linear-gradient(135deg,#ff6a00 0%,#ee0979 100%)',
  DEFAULT: 'linear-gradient(135deg,#232526 0%,#414345 100%)',
}

export function EventCover({
  imageUrl,
  category,
  className,
  iconSize = 40,
}: {
  imageUrl?: string | null
  category: string
  className?: string
  iconSize?: number
}) {
  if (imageUrl) {
    return (
      <div className={className} style={{ backgroundImage: `url(${imageUrl})` }} role="img" />
    )
  }
  const gradient = CATEGORY_GRADIENT[category] ?? CATEGORY_GRADIENT.DEFAULT
  return (
    <div
      className={className}
      style={{ background: gradient, color: 'rgba(255,255,255,0.85)' }}
    >
      <CategoryIcon category={category} size={iconSize} />
    </div>
  )
}
