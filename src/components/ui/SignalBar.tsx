interface SignalBarProps {
  label: string
  value: number  // 0 to 1
  weight?: number
}

const SIGNAL_COLORS = [
  'bg-info-blue',
  'bg-trust-green',
  'bg-gold-500',
  'bg-navy-900',
  'bg-review-amber',
  'bg-risk-red',
]

/**
 * Single horizontal signal bar for the hiring-probability breakdown.
 * Shows label, weighted fill and numeric value.
 */
export function SignalBar({ label, value, weight }: SignalBarProps) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted w-28 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-info-blue rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-ink w-8 text-right">{pct}%</span>
      {weight !== undefined && (
        <span className="text-xs text-muted w-12 text-right">w={weight.toFixed(2)}</span>
      )}
    </div>
  )
}

interface SignalBreakdownProps {
  signals: {
    skill_match: number
    trust_score: number
    comp_fit: number
    location_fit: number
    availability: number
    channel_conversion: number
  }
  probability: number
}

/** Full six-signal breakdown panel for the Intelligence layer */
export function SignalBreakdown({ signals, probability }: SignalBreakdownProps) {
  const entries = [
    { label: 'Skill Match', value: signals.skill_match, weight: 0.35 },
    { label: 'Trust Score', value: signals.trust_score / 100, weight: 0.25 },
    { label: 'Comp Fit', value: signals.comp_fit, weight: 0.15 },
    { label: 'Location Fit', value: signals.location_fit, weight: 0.10 },
    { label: 'Availability', value: signals.availability, weight: 0.10 },
    { label: 'Channel Conv.', value: signals.channel_conversion, weight: 0.05 },
  ]

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-ink">Hiring Probability</span>
        <span className="text-2xl font-bold text-navy-900">
          {Math.round(probability * 100)}%
          <span className="text-xs font-normal text-muted ml-1">indicative</span>
        </span>
      </div>
      {entries.map((e) => (
        <SignalBar key={e.label} label={e.label} value={e.value} weight={e.weight} />
      ))}
    </div>
  )
}
