import prisma from '@/lib/prisma'
import { Bot, CheckCircle2, Play, Sparkles, UserCheck, Zap } from 'lucide-react'
import { SimulatedBadge } from '@/components/ui/SimulatedBadge'

export const dynamic = 'force-dynamic'

export default async function AgentsPage() {
  const [candidateCount, reqCount, pendingApprovals] = await Promise.all([
    prisma.candidate.count(),
    prisma.requisition.count(),
    prisma.approval.count({ where: { state: 'pending' } }),
  ])

  const agents = [
    {
      id: 'screening-agent',
      name: 'Resume & Credential Screening Agent',
      role: 'Automated Trust & Duplicate Verification',
      status: 'Active',
      processed: candidateCount,
      accuracy: '99.4%',
      action: 'Screened 145 candidates against fraud traps',
    },
    {
      id: 'bbbr-agent',
      name: 'Build/Buy/Borrow Sourcing Copilot',
      role: 'Multi-Signal Sourcing Recommendation',
      status: 'Active',
      processed: reqCount,
      accuracy: '92.0%',
      action: 'Generated optimal sourcing pathways for 3 open demands',
    },
    {
      id: 'outreach-agent',
      name: 'Autonomous Candidate Outreach Copilot',
      role: 'Personalized Email & Assessment Scheduling',
      status: 'Governed',
      processed: pendingApprovals,
      accuracy: '100% Governed',
      action: 'All emails queued in Human Approvals queue',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-purple-100 text-purple-800 border border-purple-200">
              Execution Layer (M8)
            </span>
            <span className="text-xs text-slate-400">· Autonomous Copilots with Human Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            AI Agent Execution Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Monitor background AI agents operating across screening, strategic matching, and candidate engagement.
          </p>
        </div>
        <SimulatedBadge label="Autonomous Copilot Engine" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="talentos-card bg-white flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                  <Bot size={18} />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {agent.status}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">{agent.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{agent.role}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Processed Items:</span>
                  <span className="font-bold text-[#0F172A]">{agent.processed}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Precision Rate:</span>
                  <span className="font-bold text-emerald-700">{agent.accuracy}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic leading-snug">"{agent.action}"</p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono text-[10px]">ID: {agent.id}</span>
              <span className="text-purple-700 font-bold flex items-center gap-1">
                <Zap size={12} /> Governed
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
