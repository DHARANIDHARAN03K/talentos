import prisma from '@/lib/prisma'
import {
  BarChart3,
  Users,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  FileSearch,
} from 'lucide-react'
import Link from 'next/link'
import { TrustBadge } from '@/components/ui/TrustBadge'

export default async function DashboardPage() {
  const [
    reqCount,
    candidateCount,
    fraudSignalsCount,
    pendingApprovalsCount,
    recentFraudSignals,
    recentAuditLogs,
    requisitions,
  ] = await Promise.all([
    prisma.requisition.count({ where: { status: 'open' } }),
    prisma.candidate.count(),
    prisma.fraudSignal.count(),
    prisma.approval.count({ where: { state: 'pending' } }),
    prisma.fraudSignal.findMany({
      take: 3,
      orderBy: { detected_at: 'desc' },
      include: { candidate: true },
    }),
    prisma.auditLog.findMany({
      take: 4,
      orderBy: { ts: 'desc' },
    }),
    prisma.requisition.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      include: { matches: true },
    }),
  ])

  const stats = [
    {
      label: 'Open Requisitions',
      value: reqCount.toString(),
      subtext: '3 Demands across 3 cities',
      icon: BarChart3,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'Talent Pool Verified',
      value: candidateCount.toString(),
      subtext: 'Internal, Contractor & External',
      icon: Users,
      iconBg: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    {
      label: 'Trust & Fraud Alerts',
      value: fraudSignalsCount.toString(),
      subtext: 'Live contradictions & duplicates',
      icon: AlertTriangle,
      iconBg: 'bg-red-50 text-red-600 border-red-100',
    },
    {
      label: 'Pending Human Approvals',
      value: pendingApprovalsCount.toString(),
      subtext: 'Recruiter Copilot actions queued',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Overview - F-Pattern Anchor: Headline + 1-Line Value Proposition */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded bg-[#0B1B3A] text-[#C9A227]">
              TalentOS Core Architecture
            </span>
            <span className="text-xs text-slate-500">· Trust → Intelligence → Execution</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Workforce Operating Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Verify candidate signals before ranking, evaluate talent options via Build/Buy/Borrow intelligence, and execute recruiting workflows with human governance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/requisitions"
            className="text-xs font-semibold bg-[#0B1B3A] hover:bg-[#16305F] text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Launch Intake Flow</span>
            <ArrowRight size={14} className="text-[#C9A227]" />
          </Link>
        </div>
      </div>

      {/* KPI Cards: Scannable 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="talentos-card relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-[#0F172A] mt-1 tracking-tight">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-1">{s.subtext}</p>
              </div>
              <div className={`p-2.5 rounded-lg border ${s.iconBg}`}>
                <s.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3-Layer Visual Pipeline: Trust, Intel, Execution */}
      <div className="talentos-card bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers size={14} className="text-[#0B1B3A]" />
            Operating System Flow State
          </h3>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            All Layers Active & Audited
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Layer 1: Trust */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B1B3A]">1. TRUST LAYER</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Continuous identity verification, duplicate detection & fraud traps.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Planted Traps Caught:</span>
              <span className="font-bold text-red-600">3 flagged</span>
            </div>
          </div>

          {/* Layer 2: Intelligence */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B1B3A]">2. INTELLIGENCE LAYER</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Scored
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Multi-signal hiring probability & Build | Buy | Borrow recommendation engine.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Borrow Recommendation:</span>
              <span className="font-bold text-blue-600">92% Match</span>
            </div>
          </div>

          {/* Layer 3: Execution */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B1B3A]">3. EXECUTION LAYER</span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                Governed
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              AI screening & outreach copilots requiring human approval & exception handling.
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Autonomous Actions:</span>
              <span className="font-bold text-emerald-600">0 (100% Governed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panels: Active Fraud Detection & Requisition Match Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Trust Flags */}
        <div className="talentos-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <AlertTriangle size={13} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Active Fraud & Trust Contradictions</h3>
            </div>
            <Link href="/pool" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>View All 145</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentFraudSignals.map((fs) => {
              const ev = fs.evidence as { reason?: string } | null
              return (
                <div
                  key={fs.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg transition-colors flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#0F172A]">{fs.candidate.full_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono ml-2">
                        {fs.candidate.source_channel || 'Agency'}
                      </span>
                    </div>
                    <TrustBadge status="flagged" />
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    Trap Type: <span className="font-semibold text-slate-800 uppercase">{fs.type}</span>
                  </div>
                  {ev?.reason && (
                    <p className="text-xs text-red-700 bg-red-50/80 border border-red-200 p-2 rounded leading-relaxed">
                      {ev.reason}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Live Requisitions & Demand Intel */}
        <div className="talentos-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <FileSearch size={13} />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Active Requisitions & Pool Matching</h3>
            </div>
            <Link href="/requisitions" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>Manage Demands</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {requisitions.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">{req.title}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    {req.employment_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span>📍 {req.location}</span>
                  <span>💰 ₹{((req.comp_min || 0) / 100000).toFixed(1)}L - ₹{((req.comp_max || 0) / 100000).toFixed(1)}L</span>
                  <span>⚡ {req.matches.length} Candidates Pre-Scored</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {req.skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
