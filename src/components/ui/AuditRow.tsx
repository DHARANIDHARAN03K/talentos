'use client'

import { Copy, CheckCircle2, XCircle } from 'lucide-react'
interface AuditRowProps {
  id: number
  ts: string
  actorType: 'user' | 'agent' | 'system'
  actorId: string
  action: string
  entityType: string
  entityId: string
  hash: string
  prevHash: string
}

export function AuditRow({
  id,
  ts,
  actorType,
  actorId,
  action,
  entityType,
  entityId,
  hash,
  prevHash,
}: AuditRowProps) {
  const handleCopy = () => navigator.clipboard.writeText(hash)

  return (
    <div className="border-b border-border last:border-0 py-3 grid grid-cols-[auto_1fr_auto] gap-4 items-start">
      <span className="text-xs text-muted font-mono pt-0.5">#{id}</span>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-ink uppercase tracking-wide">
            {action}
          </span>
          <span className="text-xs text-muted">{entityType}/{entityId.slice(0, 8)}</span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded border ${
              actorType === 'agent'
                ? 'bg-blue-50 text-info-blue border-blue-200'
                : actorType === 'user'
                ? 'bg-green-50 text-trust-green border-green-200'
                : 'bg-slate-50 text-muted border-slate-200'
            }`}
          >
            {actorType}:{actorId.slice(0, 8)}
          </span>
        </div>
        <p className="text-xs text-muted">{new Date(ts).toLocaleString()}</p>
        <p className="audit-hash">{hash}</p>
      </div>
      <button
        onClick={handleCopy}
        title="Copy hash"
        className="text-muted hover:text-ink transition-colors mt-0.5"
      >
        <Copy size={13} />
      </button>
    </div>
  )
}

interface ChainStatusProps {
  valid: boolean
  totalRows: number
  firstBadId?: number
}

export function ChainStatus({ valid, totalRows, firstBadId }: ChainStatusProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border ${
        valid
          ? 'bg-green-50 text-trust-green border-green-200'
          : 'bg-red-50 text-risk-red border-red-200'
      }`}
    >
      {valid ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {valid
        ? `Chain intact · ${totalRows} entries verified`
        : `Chain broken at entry #${firstBadId}`}
    </div>
  )
}
