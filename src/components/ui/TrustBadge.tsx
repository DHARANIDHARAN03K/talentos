import type { TrustStatus } from '@/lib/constants'
import { ShieldCheck, AlertTriangle, Clock } from 'lucide-react'

interface TrustBadgeProps {
  status: TrustStatus
  score?: number
}

const CONFIG = {
  verified: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Icon: ShieldCheck,
  },
  review: {
    label: 'Needs Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: Clock,
  },
  flagged: {
    label: 'Flagged',
    className: 'bg-red-50 text-red-700 border-red-200',
    Icon: AlertTriangle,
  },
}

export function TrustBadge({ status, score }: TrustBadgeProps) {
  const { label, className, Icon } = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold border px-2.5 py-1 rounded-md ${className}`}
    >
      <Icon size={12} />
      {label}
      {score !== undefined && (
        <span className="ml-1 font-bold">{score}</span>
      )}
    </span>
  )
}
