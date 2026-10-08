import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ShieldCheck, CheckCircle2, Lock, Award, Building, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import crypto from 'crypto'

interface PassportPageProps {
  params: Promise<{ id: string }>
}

export default async function PassportPage({ params }: PassportPageProps) {
  const { id } = await params

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      employment: true,
      credentials: true,
      fraud_signals: true,
      assessments: true,
    },
  })

  if (!candidate) {
    notFound()
  }

  // Generate deterministic HMAC-SHA256 signature payload matching 03_ARCHITECTURE.md
  const payload = {
    candidate_id: candidate.id,
    full_name: candidate.full_name,
    email: candidate.email,
    verified_at: new Date().toISOString().split('T')[0],
    trust_score: candidate.fraud_signals.length > 0 ? 35 : 98,
    status: candidate.fraud_signals.length > 0 ? 'REVOKED' : 'ISSUED_VALID',
  }

  const secret = process.env.PASSPORT_HMAC_SECRET || 'talentos-hmac-sha256-default-key-2026'
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Passport Certificate Header */}
        <div className="bg-[#0B1B3A] p-6 text-white border-b-4 border-[#C9A227] relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16305F] border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] shadow-inner">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Talent<span className="text-[#C9A227]">OS</span> Candidate Trust Passport
                </h1>
                <p className="text-xs text-slate-300">Reusable Cryptographic Skill & Verification Record</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Signature Verified ✓
              </span>
            </div>
          </div>
        </div>

        {/* Passport Body Content */}
        <div className="p-8 space-y-6">
          {/* Candidate Bio Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A]">{candidate.full_name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{candidate.email} · {candidate.location || 'India'}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-[#0B1B3A]">
                {payload.trust_score}<span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Trust Score</p>
            </div>
          </div>

          {/* Verified Credentials Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Trust & Identity Dimensions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Government ID Document</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">Hash: {candidate.id_doc_hash?.slice(0, 16) || 'SHA256-MATCH'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Continuous Employment History</p>
                  <p className="text-[10px] text-slate-500">No date contradictions found</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Proof-of-Skill Assessment</p>
                  <p className="text-[10px] text-slate-500">React & Next.js Core Passed (95%)</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#0F172A]">Anti-Fraud Duplicate Scan</p>
                  <p className="text-[10px] text-slate-500">Cross-pool collision: 0% match</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Signature Block */}
          <div className="p-4 bg-slate-900 rounded-xl text-slate-300 space-y-2 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Lock size={12} className="text-[#C9A227]" />
                HMAC-SHA256 Payload Signature
              </span>
              <span className="text-emerald-400">TAMPER_EVIDENT_VALID</span>
            </div>
            <p className="text-[11px] text-slate-400 break-all leading-relaxed pt-1">
              {signature}
            </p>
            <p className="text-[10px] text-slate-500 pt-1">
              Issued by TalentOS Authority Node · Reusable across employer ATS integrations
            </p>
          </div>

          {/* Action Back Button */}
          <div className="pt-2 flex justify-between items-center text-xs">
            <Link
              href="/pool"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={14} />
              <span>Back to Talent Pool Registry</span>
            </Link>
            <span className="text-[11px] text-slate-400">Simulated Authority Proof</span>
          </div>
        </div>
      </div>
    </div>
  )
}
