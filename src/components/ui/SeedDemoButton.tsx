'use client'

import { useState, useTransition } from 'react'
import { seedDemoDataAction } from '@/app/actions'
import { Database, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'

export function SeedDemoButton() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSeed = () => {
    startTransition(async () => {
      const res = await seedDemoDataAction()
      setResult(res)
    })
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleSeed}
        disabled={isPending || result?.success === true}
        className="flex items-center gap-2.5 bg-[#0B1B3A] hover:bg-[#16305F] disabled:opacity-60 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-md transition-all"
      >
        {isPending ? (
          <Loader2 size={18} className="animate-spin text-[#C9A227]" />
        ) : (
          <Database size={18} className="text-[#C9A227]" />
        )}
        {isPending ? 'Seeding database…' : result?.success ? 'Data Seeded ✓' : 'Seed Demo Data'}
      </button>

      {result && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border max-w-md text-center ${
          result.success
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {result.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{result.message}</span>
        </div>
      )}

      {result?.success && (
        <p className="text-xs text-slate-500 text-center max-w-xs">
          Reload any page to see the data. All candidate data is <strong>synthetic</strong> — no real personal information.
        </p>
      )}
    </div>
  )
}
