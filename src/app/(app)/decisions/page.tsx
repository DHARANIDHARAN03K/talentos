import prisma from '@/lib/prisma'
import {
  Brain,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  DollarSign,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react'
import { SimulatedBadge } from '@/components/ui/SimulatedBadge'
import { TrustBadge } from '@/components/ui/TrustBadge'
import Link from 'next/link'
import { explainDecision } from '@/lib/ai'

interface DecisionsPageProps {
  searchParams: Promise<{ reqId?: string }>
}

export default async function DecisionsPage({ searchParams }: DecisionsPageProps) {
  const { reqId } = await searchParams

  const requisitions = await prisma.requisition.findMany({
    orderBy: { created_at: 'desc' },
  })

  const selectedReqId = reqId || requisitions[0]?.id

  const activeReq = await prisma.requisition.findUnique({
    where: { id: selectedReqId },
    include: {
      matches: {
        include: { candidate: true },
        orderBy: { probability: 'desc' },
      },
    },
  })

  const matchesWithExplanation = activeReq ? await Promise.all(
    activeReq.matches.map(async (match) => {
      const explanation = await explainDecision(match.candidate.full_name, activeReq.title, match.signals)
      return { ...match, explanation }
    })
  ) : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-blue-100 text-blue-800 border border-blue-200">
              Intelligence Layer (M6)
            </span>
            <span className="text-xs text-slate-400">· Build · Buy · Borrow · Automate · Relocate</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Workforce Decision Intelligence & Matching
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Multi-signal hiring probability model combining skill matching, trust scores, comp alignment, and availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedBadge label="Market Compensation Benchmarks" />
        </div>
      </div>

      {/* Requisition Tab Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {requisitions.map((req) => (
          <Link
            key={req.id}
            href={`/decisions?reqId=${req.id}`}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 ${
              req.id === selectedReqId
                ? 'bg-[#0B1B3A] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {req.title} ({req.location})
          </Link>
        ))}
      </div>

      {activeReq && (
        <div className="space-y-6">
          {/* BBBAR Recommendation Card */}
          <div className="talentos-card bg-white border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Strategy Recommendation
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    BORROW (Convert Contractor)
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#0F172A] mt-1">
                  Optimal Sourcing Pathway for {activeReq.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-black text-[#0B1B3A]">92%</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Overall Fill Probability</p>
                </div>
              </div>
            </div>

            {/* Decision Rationale Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <Sparkles size={14} className="text-[#C9A227]" />
                  <span>Why Borrow?</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Sarah Chen is wrapping up an internal 6-month contract with 98 Trust Score. Zero onboarding friction.
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <DollarSign size={14} className="text-emerald-600" />
                  <span>Cost Efficiency</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Borrowing avoids external agency fees (₹2.4L saved) and matches within budget target (₹10L/yr).
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <Clock size={14} className="text-blue-600" />
                  <span>Time to Productivity</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Immediate availability (2 days vs. 38 days average for external market hire).
                </p>
              </div>
            </div>
          </div>

          {/* Scored Candidate Matches Breakdown */}
          <div className="talentos-card !p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Brain size={16} className="text-[#0B1B3A]" />
                <span>Explainable Candidate Rankings ({activeReq.matches.length} Scored)</span>
              </h3>
              <span className="text-xs text-slate-500">
                Formula: P(Hire) = 0.30·Skill + 0.25·Trust + 0.15·Comp + 0.15·Loc + 0.10·Avail + 0.05·Chan
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {matchesWithExplanation.map((match) => {
                const signals = match.signals as {
                  skill_match?: number
                  trust_score?: number
                  comp_fit?: number
                  location_fit?: number
                  availability?: number
                  channel_conversion?: number
                }

                const isTopPick = Number(match.probability) > 0.8

                return (
                  <div key={match.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#0F172A]">{match.candidate.full_name}</span>
                          <span className="text-xs px-2 py-0.5 rounded uppercase font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {match.candidate.pool_type}
                          </span>
                          {isTopPick && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#0B1B3A] text-[#C9A227]">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{match.candidate.email}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-[#0B1B3A]">
                          {(Number(match.probability) * 100).toFixed(0)}%
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Hiring Probability</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-600 mt-2">
                       <span className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1"><Sparkles size={13} className="text-[#C9A227]"/> AI Rationale</span>
                       {match.explanation}
                    </div>

                    {/* Signal Breakdown Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2 text-xs">
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[10px] text-slate-400 font-medium">Skill Match (30%)</p>
                        <p className="font-bold text-[#0F172A]">{(Number(match.skill_match) * 100).toFixed(0)}%</p>
                      </div>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[10px] text-slate-400 font-medium">Trust Score (25%)</p>
                        <p className={`font-bold ${Number(match.trust_score) < 50 ? 'text-red-600' : 'text-emerald-700'}`}>
                          {Number(match.trust_score).toFixed(0)}/100
                        </p>
                      </div>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[10px] text-slate-400 font-medium">Comp Fit (15%)</p>
                        <p className="font-bold text-[#0F172A]">{(Number(match.comp_fit) * 100).toFixed(0)}%</p>
                      </div>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[10px] text-slate-400 font-medium">Location Fit (15%)</p>
                        <p className="font-bold text-[#0F172A]">{(Number(match.location_fit) * 100).toFixed(0)}%</p>
                      </div>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[10px] text-slate-400 font-medium">Availability (10%)</p>
                        <p className="font-bold text-[#0F172A]">{(Number(match.availability) * 100).toFixed(0)}%</p>
                      </div>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[10px] text-slate-400 font-medium">Channel (5%)</p>
                        <p className="font-bold text-[#0F172A]">{(Number(match.channel_conversion) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
