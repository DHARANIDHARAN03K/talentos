import prisma from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase/server'
import { AuditRow, ChainStatus } from '@/components/ui/AuditRow'
import { verifyChain } from '@/lib/audit'
import { ScrollText, ShieldCheck } from 'lucide-react'


export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { ts: 'desc' },
  })

  const supabase = await createServiceClient()
  const { valid, firstBadId } = await verifyChain(supabase)
  const isChainValid = valid
  // Chain verification status will be shown via ChainStatus component

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Governance & Audit Ledger</h1>
          <p className="text-sm text-muted mt-1">
            SHA-256 Hash-chained tamper-evident record of all AI actions, verifications & human decisions
          </p>
        </div>
        <ChainStatus valid={isChainValid} totalRows={auditLogs.length} firstBadId={firstBadId} />
      </div>

      {/* Audit Log Card */}
      <div className="talentos-card">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ScrollText size={16} className="text-navy-900" />
            <h3 className="text-sm font-semibold text-ink">Immutable Audit Trail</h3>
          </div>
          <span className="text-xs text-muted">
            {auditLogs.length} verified events logged
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="py-10 text-center text-muted">
            <ShieldCheck size={28} className="mx-auto mb-2 text-trust-green" />
            <p className="font-semibold text-ink">Chain Active & Secured</p>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              Events from Requisitions, Trust engine detection, and AI agents will be cryptographically chained here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {auditLogs.map((log) => (
              <AuditRow
                key={log.id.toString()}
                id={Number(log.id)}
                ts={log.ts.toISOString()}
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
