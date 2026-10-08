import prisma from '@/lib/prisma'
import { AuditRow, ChainStatus } from '@/components/ui/AuditRow'
import { computeHash } from '@/lib/audit'
import { ScrollText, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AuditPage() {
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
      row.ts instanceof Date ? row.ts.toISOString() : row.ts,
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

  // Sort descending for display
  const displayLogs = [...auditLogs].reverse()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Governance &amp; Audit Ledger</h1>
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
          <div className="py-10 text-center text-slate-500">
            <ShieldCheck size={28} className="mx-auto mb-2 text-emerald-500" />
            <p className="font-semibold text-[#0F172A]">Chain Active &amp; Secured</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Events from Requisitions, Trust engine detection, and AI agents will be cryptographically chained here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayLogs.map((log) => (
              <AuditRow
                key={log.id.toString()}
                id={Number(log.id)}
                ts={log.ts instanceof Date ? log.ts.toISOString() : log.ts}
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
}
