'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { handleApprovalAction } from '@/app/actions'

interface ApprovalActionButtonProps {
  approvalId: string
}

export function ApprovalActionButton({ approvalId }: ApprovalActionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [decided, setDecided] = useState<'approved' | 'rejected' | null>(null)

  async function onDecide(state: 'approved' | 'rejected') {
    setLoading(true)
    await handleApprovalAction(approvalId, state)
    setLoading(false)
    setDecided(state)
  }

  if (decided) {
    return (
      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
        ✓ {decided.toUpperCase()} & SHA-256 CHAINED
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={loading}
        onClick={() => onDecide('approved')}
        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 shadow-xs"
      >
        <CheckCircle2 size={13} />
        <span>{loading ? 'Logging...' : 'Approve Action'}</span>
      </button>

      <button
        disabled={loading}
        onClick={() => onDecide('rejected')}
        className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 shadow-xs"
      >
        <XCircle size={13} />
        <span>Reject</span>
      </button>
    </div>
  )
}
