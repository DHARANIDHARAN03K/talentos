import prisma from '@/lib/prisma'
import Link from 'next/link'
import { MapPin, Briefcase, Users, ArrowRight, ShieldAlert, Plus, Sparkles, Building2 } from 'lucide-react'
import { SimulatedBadge } from '@/components/ui/SimulatedBadge'

export const dynamic = 'force-dynamic'

export default async function RequisitionsPage() {
  const requisitions = await prisma.requisition.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      matches: {
        include: { candidate: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header with clear task context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-blue-100 text-blue-800 border border-blue-200">
              Demand & Intake Layer
            </span>
            <span className="text-xs text-slate-400">· Requisitions, Compensation & Skill Targets</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Workforce Requisitions
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Open organizational demands analyzed for internal redeployment, contractor pools, and external hiring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SimulatedBadge label="ATS Sync (Workday / Greenhouse)" />
        </div>
      </div>

      {/* Requisitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {requisitions.map((req) => (
          <div
            key={req.id}
            className="talentos-card flex flex-col justify-between hover:border-slate-300 transition-all bg-white"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                  {req.employment_type}
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {req.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">{req.title}</h3>
                <div className="flex flex-col gap-1 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <strong className="text-slate-700">Location:</strong> {req.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={13} className="text-slate-400" />
                    <strong className="text-slate-700">Budget:</strong> ₹{((req.comp_min || 0) / 100000).toFixed(1)}L - ₹{((req.comp_max || 0) / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                  Required Target Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {req.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Automation share flag */}
              {Number(req.automatable_share) > 0.4 && (
                <div className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                  <ShieldAlert size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Automate Strategy Candidate:</span>
                    <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                      {(Number(req.automatable_share) * 100).toFixed(0)}% of tasks are automatable via standard workflows.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-[#0F172A]">{req.matches.length}</span> scored candidates
              </div>
              <Link
                href={`/decisions?reqId=${req.id}`}
                className="text-xs font-bold bg-[#0B1B3A] hover:bg-[#16305F] text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
              >
                <span>Decision Intel</span>
                <ArrowRight size={12} className="text-[#C9A227]" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
