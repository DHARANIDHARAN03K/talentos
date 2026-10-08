import prisma from '@/lib/prisma'
import { CheckSquare, UserCheck, ShieldAlert, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { SimulatedBadge } from '@/components/ui/SimulatedBadge'

export const dynamic = 'force-dynamic'

export default async function ApprovalsPage() {
  const approvals = await prisma.approval.findMany({
    orderBy: { created_at: 'desc' },
    include: { candidate: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-amber-100 text-amber-800 border border-amber-200">
              Governance Layer (M9)
            </span>
            <span className="text-xs text-slate-400">· Human-in-the-Loop Signoff Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Human Approvals & Exception Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Per AGENTS.md rules, every AI action that touches a candidate requires human signoff before execution.
          </p>
        </div>
        <SimulatedBadge label="Human Signoff Gate" />
      </div>

      <div className="talentos-card !p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <CheckSquare size={16} className="text-[#0B1B3A]" />
            <span>Pending & Historical Decision Queue ({approvals.length} Actions)</span>
          </h3>
          <span className="text-xs text-slate-500">All signoffs write to SHA-256 audit ledger</span>
        </div>

        <div className="divide-y divide-slate-200">
          {approvals.map((appr) => {
            const isPending = appr.state === 'pending'
            return (
              <div key={appr.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A] text-sm">{appr.action}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      isPending ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {appr.state}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Candidate: <strong className="text-slate-800">{appr.candidate?.full_name || 'System Queue'}</strong></p>
                  <p className="text-[11px] text-slate-400 font-mono">Payload: {JSON.stringify(appr.payload)}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPending ? (
                    <>
                      <button className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
                        <CheckCircle2 size={13} /> Approve Action
                      </button>
                      <button className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1">
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">Logged & Chained ✓</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
