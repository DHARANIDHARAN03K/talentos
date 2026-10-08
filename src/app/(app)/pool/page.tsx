import prisma from '@/lib/prisma'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { SimulatedBadge } from '@/components/ui/SimulatedBadge'
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

export default async function TalentPoolPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      fraud_signals: true,
      employment: true,
      passports: true,
      matches: true,
    },
  })

  const flaggedCount = candidates.filter((c) => c.fraud_signals.length > 0).length
  const verifiedCount = candidates.length - flaggedCount

  return (
    <div className="space-y-6">
      {/* Header with clear task context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Trust Layer Verified
            </span>
            <span className="text-xs text-slate-400">· Fraud, Duplicates & Contradiction Detection</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Talent Pool Verification Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Every candidate is screened for identity continuity, resume tampering, and employment overlap prior to ranking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedBadge label="Identity & Credential Checkers" />
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Sourced Pool</p>
            <p className="text-xl font-bold text-[#0F172A] mt-0.5">{candidates.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
            100%
          </div>
        </div>

        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-700 font-medium">Verified & Clean</p>
            <p className="text-xl font-bold text-emerald-800 mt-0.5">{verifiedCount}</p>
          </div>
          <ShieldCheck size={20} className="text-emerald-600" />
        </div>

        <div className="p-4 bg-red-50/50 border border-red-200 rounded-lg shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-red-700 font-medium">Flagged & Contradictions</p>
            <p className="text-xl font-bold text-red-800 mt-0.5">{flaggedCount}</p>
          </div>
          <AlertTriangle size={20} className="text-red-600" />
        </div>
      </div>

      {/* Main Candidate Table with Evidence Presentation */}
      <div className="talentos-card !p-0 overflow-hidden shadow-sm">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Search size={14} className="text-slate-400" />
            <span className="font-medium">Filter by Pool: Internal (30), Contractor (40), External (75)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Planted demo traps highlighted in red</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate Profile</th>
                <th className="py-3 px-4">Pool / Channel</th>
                <th className="py-3 px-4">Trust Status</th>
                <th className="py-3 px-4">Verification Evidence & Signal Detail</th>
                <th className="py-3 px-4 text-right">Trust Passport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {candidates.map((cand) => {
                const isFlagged = cand.fraud_signals.length > 0
                const status = isFlagged ? 'flagged' : 'verified'
                const primarySignal = cand.fraud_signals[0]
                const reason = (primarySignal?.evidence as { reason?: string })?.reason

                return (
                  <tr
                    key={cand.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isFlagged ? 'bg-red-50/20' : ''
                    }`}
                  >
                    {/* Candidate Name & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0F172A] text-sm flex items-center gap-1.5">
                        {cand.full_name}
                        {isFlagged && (
                          <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.2 rounded">
                            TRAP
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                        {cand.email} · {cand.phone || 'No phone'}
                      </div>
                    </td>

                    {/* Pool Type & Source */}
                    <td className="py-3.5 px-4">
                      <div className="inline-block px-2 py-0.5 rounded text-[11px] font-medium uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {cand.pool_type}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{cand.source_channel || 'Direct'}</div>
                    </td>

                    {/* Trust Status Badge */}
                    <td className="py-3.5 px-4">
                      <TrustBadge status={status} />
                    </td>

                    {/* Evidence Column */}
                    <td className="py-3.5 px-4 max-w-md">
                      {isFlagged ? (
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
                          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-red-700 mb-0.5">
                            <AlertTriangle size={12} />
                            <span>Contradiction Flag: {primarySignal.type}</span>
                          </div>
                          <p className="text-[11px] leading-snug">{reason}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          <span>Identity & credentials verified · No overlaps</span>
                        </div>
                      )}
                    </td>

                    {/* Trust/Skill Passport link */}
                    <td className="py-3.5 px-4 text-right">
                      {isFlagged ? (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          Withheld
                        </span>
                      ) : (
                        <Link
                          href={`/passport/${cand.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1B3A] hover:text-[#16305F] bg-[#C9A227]/15 hover:bg-[#C9A227]/25 border border-[#C9A227]/40 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <Shield size={12} className="text-[#C9A227]" />
                          <span>View Passport</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
