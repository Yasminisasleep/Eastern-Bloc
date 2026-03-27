const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  CINEMA:     { bg: 'bg-[rgba(212,175,55,0.15)]', text: 'text-[#d4af37]', label: 'Cinema' },
  CONCERT:    { bg: 'bg-[rgba(107,20,35,0.4)]', text: 'text-[#e8c547]', label: 'Concert' },
  EXHIBITION: { bg: 'bg-[rgba(56,161,105,0.15)]', text: 'text-[#68d391]', label: 'Exhibition' },
  THEATRE:    { bg: 'bg-[rgba(99,102,241,0.15)]', text: 'text-[#a5b4fc]', label: 'Theatre' },
  FESTIVAL:   { bg: 'bg-[rgba(236,72,153,0.15)]', text: 'text-[#f472b6]', label: 'Festival' },
}

export default function CategoryChip({ category }: { category: string }) {
  const s = CATEGORY_STYLES[category] ?? { bg: 'bg-[rgba(212,175,55,0.15)]', text: 'text-[#d4af37]', label: category }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-[11px] font-medium uppercase tracking-wide ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

export { CATEGORY_STYLES }
