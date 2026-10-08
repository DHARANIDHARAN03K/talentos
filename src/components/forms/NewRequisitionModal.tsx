'use client'

import { useState } from 'react'
import { Plus, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { createRequisitionAction } from '@/app/actions'

export function NewRequisitionModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await createRequisitionAction(formData)
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
        className="text-xs font-bold bg-[#0B1B3A] hover:bg-[#16305F] text-white px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
      >
        <Plus size={14} className="text-[#C9A227]" />
        <span>+ Post New Requisition</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#0B1B3A] px-5 py-4 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#C9A227]" />
                <h3 className="font-bold text-sm">Post New Workforce Requisition</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-[#0F172A]">Requisition Created & Logged!</h4>
                <p className="text-xs text-slate-500">
                  Added to database, matched against candidates, and SHA-256 hash written to audit ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Demand Title</label>
                  <input
                    required
                    name="title"
                    defaultValue="React Developer"
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0B1B3A]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location</label>
                    <input
                      required
                      name="location"
                      defaultValue="Chennai"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Employment Type</label>
                    <select
                      name="employmentType"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                    >
                      <option value="contract">6-Month Contract</option>
                      <option value="full-time">Full-Time Permanent</option>
                      <option value="part-time">Part-Time</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Min Budget (₹ / yr)</label>
                    <input
                      type="number"
                      name="compMin"
                      defaultValue="800000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Budget (₹ / yr)</label>
                    <input
                      type="number"
                      name="compMax"
                      defaultValue="1400000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Skills (comma separated)</label>
                  <input
                    name="skills"
                    defaultValue="React, TypeScript, Next.js, Tailwind"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  />
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
                    {loading ? 'Creating...' : 'Submit & Match'}
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
