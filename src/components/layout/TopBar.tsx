'use client'

import { useState } from 'react'
import { ChevronDown, Shield, Database, CheckCircle2 } from 'lucide-react'

const ROLES = ['recruiter', 'approver', 'auditor'] as const
type Role = (typeof ROLES)[number]

const ROLE_DETAILS: Record<Role, { title: string; subtitle: string; color: string }> = {
  recruiter: {
    title: 'Recruiter Operator',
    subtitle: 'Requisitions, Talent Pool, AI Agent Propose',
    color: 'bg-blue-500',
  },
  approver: {
    title: 'Talent Director / Approver',
    subtitle: 'Human-in-the-loop signoff & exception queue',
    color: 'bg-emerald-500',
  },
  auditor: {
    title: 'Compliance Auditor',
    subtitle: 'Immutable SHA-256 ledger & decision replay',
    color: 'bg-amber-500',
  },
}

export function TopBar() {
  const [role, setRole] = useState<Role>('recruiter')
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Simulation & Integrity Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
          <Database size={13} className="text-slate-500" />
          <span>Synthetic Dataset Active</span>
          <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">145 Profiles</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>RLS & Cryptographic Hash Enabled</span>
        </div>
      </div>

      {/* Role Switcher with Persona Context */}
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 text-xs font-medium text-[#0F172A] bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors focus:ring-2 focus:ring-[#0B1B3A]/20"
        >
          <span className={`w-2 h-2 rounded-full ${ROLE_DETAILS[role].color}`} />
          <div className="text-left">
            <p className="font-semibold text-xs leading-none">{ROLE_DETAILS[role].title}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 ml-1" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E2E8F0] rounded-lg shadow-lg overflow-hidden z-50 divide-y divide-slate-100">
            <div className="px-3.5 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Switch Live Persona View
            </div>
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r)
                  setOpen(false)
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-start gap-2.5 ${
                  role === r ? 'bg-[#0B1B3A] text-white' : 'hover:bg-slate-50 text-[#0F172A]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${ROLE_DETAILS[r].color}`} />
                <div>
                  <p className="font-semibold">{ROLE_DETAILS[r].title}</p>
                  <p className={`text-[11px] mt-0.5 ${role === r ? 'text-slate-300' : 'text-slate-500'}`}>
                    {ROLE_DETAILS[r].subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
