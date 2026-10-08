'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Brain,
  Bot,
  CheckSquare,
  ScrollText,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, badge: null },
  { href: '/requisitions', label: 'Requisitions', icon: ClipboardList, badge: '3' },
  { href: '/pool', label: 'Talent Pool & Trust', icon: Users, badge: '145' },
  { href: '/decisions', label: 'Decision Intel (B/B/B)', icon: Brain, badge: 'New' },
  { href: '/agents', label: 'Agent Executions', icon: Bot, badge: null },
  { href: '/approvals', label: 'Human Approvals', icon: CheckSquare, badge: 'Queue' },
  { href: '/audit', label: 'Audit Ledger', icon: ScrollText, badge: 'SHA-256' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[#071126] text-white flex flex-col z-30 border-r border-slate-800">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-gradient-to-br from-[#0B1B3A] to-[#16305F] border border-slate-700/50 flex items-center justify-center text-white shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
          <ShieldCheck size={20} className="text-white drop-shadow-sm" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-[17px] tracking-tight text-white leading-none">Talent</span>
            <span className="font-semibold text-[17px] tracking-tight text-[#C9A227] leading-none">OS</span>
          </div>
          <p className="text-[9px] text-slate-400 font-medium tracking-widest uppercase mt-1 leading-none">Operating System</p>
        </div>
      </div>

      {/* Layer Navigation */}
      <div className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        Operating System
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                active
                  ? 'bg-[#16305F] text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-[#0B1B3A] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={active ? 'text-[#C9A227]' : 'text-slate-400'} />
                <span>{label}</span>
              </div>
              {badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    active
                      ? 'bg-[#0B1B3A] text-[#C9A227] border border-[#C9A227]/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 mx-3 mb-3 bg-[#0B1B3A] border border-slate-800 rounded-lg">
        <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Ledger Active
          </span>
          <span className="font-mono text-[10px] text-slate-400">v0.9-demo</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">Kernel Prime'26 · SW-09 Track</p>
      </div>
    </aside>
  )
}
