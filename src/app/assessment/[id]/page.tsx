import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Brain, ShieldCheck, CheckCircle2, Bot } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const candidate = await prisma.candidate.findUnique({
    where: { id }
  })

  if (!candidate) return notFound()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0B1B3A] p-6 text-white text-center">
          <div className="w-12 h-12 mx-auto bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20">
            <Brain size={24} className="text-[#C9A227]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Proof-of-Skill Assessment</h1>
          <p className="text-sm text-slate-400 mt-2">Prepared for: {candidate.full_name}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-sm text-blue-800">
            <Bot size={20} className="shrink-0 mt-0.5 text-blue-600" />
            <p>
              <strong>AI Proctored Session:</strong> This 5-question assessment is evaluated by our LLM intelligence engine. 
              Your verified score will be cryptographically attached to your TalentOS Trust Passport.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="font-bold text-[#0F172A] mb-3">1. Explain how you would optimize a React component that re-renders too frequently.</p>
              <textarea 
                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-md p-3 text-sm focus:outline-none focus:border-[#0B1B3A]"
                placeholder="Enter your technical explanation..."
                disabled
                defaultValue="I would use React.memo to wrap the component so it only re-renders when props change. I would also wrap function props in useCallback and object props in useMemo to ensure referential equality across renders."
              />
            </div>
          </div>

          {/* Action */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck size={16} className="text-emerald-600" />
              Answers are securely hashed
            </div>
            <button disabled className="bg-slate-200 text-slate-500 px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 cursor-not-allowed">
              <CheckCircle2 size={16} className="text-slate-400" />
              Simulated Assessment Locked
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
