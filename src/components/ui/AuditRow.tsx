'use client'

import { Copy, CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
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
  const [showHash, setShowHash] = useState(false)
  const handleCopy = () => navigator.clipboard.writeText(hash)

  const actionEnglish: Record<string, string> = {
    REQUISITION_CREATED: 'Workforce Need Created',
    CANDIDATE_INGESTED: 'Candidate Imported / Processed',
    FRAUD_SIGNAL_DETECTED: 'Trust Engine Triggered Flag',
    CANDIDATE_SCORED: 'Candidate Probability Scored',
    OUTREACH_DRAFTED: 'Outreach Copilot Drafted Message',
    APPROVAL_DECIDED: 'Human Approval Decision Logged'
  }
  const displayAction = actionEnglish[action] || action

  return (
    <div className="border-b border-border last:border-0 py-4 grid grid-cols-[auto_1fr_auto] gap-4 items-start hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
      <span className="text-xs text-muted font-mono pt-1">#{id}</span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">
          {displayAction} <span className="font-normal text-muted">— {entityType.replace('_', ' ')}: {entityId.slice(0, 8)}</span>
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted">{new Date(ts).toLocaleString()}</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-muted">Actor:</span>
          <span
            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
              actorType === 'agent'
                ? 'bg-blue-50 text-info-blue border-blue-200'
                : actorType === 'user'
                ? 'bg-green-50 text-trust-green border-green-200'
                : 'bg-slate-50 text-muted border-slate-200'
            }`}
          >
            {actorType === 'agent' ? 'AI Agent' : actorType === 'user' ? 'Recruiter' : actorType}
          </span>
          {actorId && actorId !== 'seed-agent' && actorId !== 'recruiter-operator' && (
             <span className="text-[10px] font-mono text-muted">{actorId.slice(0,8)}</span>
          )}
        </div>

        <div className="pt-2">
          <button 
            onClick={() => setShowHash(!showHash)}
            className="text-[10px] uppercase font-bold text-slate-500 hover:text-ink transition-colors flex items-center gap-1"
          >
            {showHash ? 'Hide cryptographic proof' : 'Show cryptographic proof'}
          </button>
          
          {showHash && (
            <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span className="truncate mr-4">{hash}</span>
              <button onClick={handleCopy} title="Copy hash" className="hover:text-ink shrink-0">
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
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
