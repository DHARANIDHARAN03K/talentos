import { CheckCircle2, Database, ExternalLink, RefreshCw, Server, ShieldCheck, ArrowRight } from 'lucide-react'
import { SimulatedBadge } from '@/components/ui/SimulatedBadge'

export const dynamic = 'force-dynamic'

export default function IntegrationsPage() {
  const integrations = [
    {
      id: 'greenhouse',
      name: 'Greenhouse ATS',
      type: 'System of Record',
      status: 'Connected',
      lastSync: '2 mins ago',
      records: '14,205',
      logo: 'G',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'workday',
      name: 'Workday HCM',
      type: 'Core HR & Comp',
      status: 'Connected',
      lastSync: '1 hour ago',
      records: '8,430',
      logo: 'W',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'checkr',
      name: 'Checkr',
      type: 'Background Screening',
      status: 'Configured',
      lastSync: 'On Demand',
      records: '-',
      logo: 'C',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-slate-100 text-slate-800 border border-slate-200">
              Infrastructure Layer
            </span>
            <span className="text-xs text-slate-400">· Adapters & Data Sync</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Enterprise Integrations
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            TalentOS sits on top of your existing infrastructure. Your ATS remains the system of record.
          </p>
        </div>
        <SimulatedBadge label="Adapter Architecture Demo" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((app) => (
          <div key={app.id} className="talentos-card bg-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-black text-lg ${app.color}`}>
                  {app.logo}
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {app.status}
                </span>
              </div>
              
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">{app.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{app.type}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><RefreshCw size={13}/> Last Sync</span>
                  <span className="font-semibold text-slate-700">{app.lastSync}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5"><Database size={13}/> Records Synced</span>
                  <span className="font-semibold text-slate-700 font-mono">{app.records}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 flex items-center gap-2">
              <button className="flex-1 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded-md transition-colors flex items-center justify-center gap-1.5">
                <Server size={14} /> Configure Mapping
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sync Architecture Diagram */}
      <div className="mt-8 talentos-card bg-slate-50 border-dashed border-slate-300">
        <h3 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#0B1B3A]" /> Bi-Directional Sync Architecture
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-medium text-slate-600">
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm text-center w-48">
            <Database size={24} className="mx-auto mb-2 text-emerald-600" />
            <p className="font-bold text-[#0F172A]">Greenhouse ATS</p>
            <p className="text-[10px]">System of Record</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Webhooks / API</span>
            <div className="flex items-center gap-2 text-blue-500">
              <ArrowRight size={16} className="rotate-180" />
              <ArrowRight size={16} />
            </div>
          </div>
          <div className="bg-[#0B1B3A] border border-[#16305F] p-4 rounded-lg shadow-sm text-center w-48 text-white">
            <Server size={24} className="mx-auto mb-2 text-[#C9A227]" />
            <p className="font-bold text-white">TalentOS Engine</p>
            <p className="text-[10px] text-slate-400">Trust & Intel Overlays</p>
          </div>
        </div>
      </div>
    </div>
  )
}
