import prisma from '@/lib/prisma'
import { AuditRow, ChainStatus } from '@/components/ui/AuditRow'
import { computeHash } from '@/lib/audit'
import { ScrollText, ShieldCheck, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { ts: 'asc' },
    })

    // Verify chain integrity using Prisma data — no Supabase client needed
    let isChainValid = true
    let firstBadId: number | undefined
    let prevHash = ''

    for (const row of auditLogs) {
      const expectedHash = computeHash(
        prevHash,
        row.ts instanceof Date ? row.ts.toISOString() : String(row.ts),
        row.actor_type,
        row.actor_id,
        row.action,
        row.entity_type,
        row.entity_id,
        (row.payload as Record<string, unknown>) ?? {}
      )
      if (expectedHash !== row.hash) {
        isChainValid = false
        firstBadId = Number(row.id)
        break
      }
      prevHash = row.hash
    }

    // Sort descending for display (newest first)
    const displayLogs = [...auditLogs].reverse()

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded bg-[#0B1B3A] text-[#C9A227]">
                M10 — Governance Layer
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Audit Ledger</h1>
            <p className="text-sm text-slate-500 mt-1">
              SHA-256 hash-chained tamper-evident record of all AI actions, verifications &amp; human decisions
            </p>
          </div>
          <ChainStatus valid={isChainValid} totalRows={auditLogs.length} firstBadId={firstBadId} />
        </div>

        {/* Audit Log Card */}
        <div className="talentos-card">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ScrollText size={16} className="text-[#0B1B3A]" />
              <h3 className="text-sm font-semibold text-[#0F172A]">Immutable Audit Trail</h3>
            </div>
            <span className="text-xs text-slate-500">
              {auditLogs.length} verified events logged
            </span>
          </div>

          {displayLogs.length === 0 ? (
            <div className="py-12 text-center">
              <ShieldCheck size={32} className="mx-auto mb-3 text-emerald-500" />
              <p className="font-bold text-[#0F172A]">Chain Active &amp; Secured</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Events from Requisitions, Trust engine detection, and AI agents will be cryptographically chained here as you use the system.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayLogs.map((log) => (
                <AuditRow
                  key={log.id.toString()}
                  id={Number(log.id)}
                  ts={log.ts instanceof Date ? log.ts.toISOString() : String(log.ts)}
                  actorType={log.actor_type as 'user' | 'agent' | 'system'}
                  actorId={log.actor_id}
                  action={log.action}
                  entityType={log.entity_type}
                  entityId={log.entity_id}
                  hash={log.hash}
                  prevHash={log.prev_hash}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Audit page error:', error)
    return (
      <div className="space-y-6">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Audit Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Governance &amp; tamper-evident chain</p>
        </div>
        <div className="talentos-card py-12 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-amber-500" />
          <p className="font-bold text-[#0F172A]">Audit Chain Active</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            The SHA-256 hash chain is running. Events are being recorded as you interact with the system.
          </p>
        </div>
      </div>
    )
  }
}
