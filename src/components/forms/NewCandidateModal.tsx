'use client'

import { useState } from 'react'
import { Plus, X, ShieldAlert, CheckCircle2, UserPlus } from 'lucide-react'
import { createCandidateAction } from '@/app/actions'

export function NewCandidateModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await createCandidateAction(formData)
    setLoading(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setOpen(false)
    }, 1200)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold bg-[#0B1B3A] hover:bg-[#16305F] text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
      >
        <UserPlus size={14} className="text-[#C9A227]" />
        <span>+ Add Candidate Profile</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0B1B3A] px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-[#C9A227]" />
                <h3 className="font-bold text-sm">Ingest Candidate into Talent Pool</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-[#0F172A]">Candidate Profile Ingested!</h4>
                <p className="text-xs text-slate-500">
                  Screened by Trust Engine and SHA-256 logged to audit trail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Candidate Full Name</label>
                  <input
                    required
                    name="fullName"
                    defaultValue="Rajesh Kumar"
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0B1B3A]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      name="email"
                      defaultValue="rajesh.k@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      required
                      name="phone"
                      defaultValue="+91 98765 43210"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pool Category</label>
                    <select
                      name="poolType"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                    >
                      <option value="internal">Internal Talent</option>
                      <option value="contractor">Contractor Bench</option>
                      <option value="external">External Applicant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expected Comp (₹ / yr)</label>
                    <input
                      type="number"
                      name="expectedComp"
                      defaultValue="1200000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Demo trap trigger option */}
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="isDemoTrap"
                    id="isDemoTrap"
                    value="true"
                    className="mt-0.5"
                  />
                  <label htmlFor="isDemoTrap" className="text-red-900 leading-tight">
                    <strong className="block text-red-800">Plant Demo Fraud Trap (For Jury Test)</strong>
                    Simulate duplicate phone & resume text collision to trigger active red warning.
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#0B1B3A] hover:bg-[#16305F] text-white font-bold rounded-md"
                  >
                    {loading ? 'Screening...' : 'Ingest & Verify'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
