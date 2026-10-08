import { Zap } from 'lucide-react'

interface SimulatedBadgeProps {
  label?: string
}

/**
 * Required on every simulated integration (identity, ATS, calendar, etc.)
 * per AGENTS.md hard rule: "must show a visible 'Simulated' badge in the UI"
 */
export function SimulatedBadge({ label = 'Simulated' }: SimulatedBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
      <Zap size={10} className="text-review-amber" />
      {label}
    </span>
  )
}
