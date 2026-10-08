'use client'

import { useState } from 'react'
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react'
import { askCopilotAction } from '@/app/actions'

export function CopilotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<{role: 'user'|'agent', text: string}[]>([
    { role: 'agent', text: 'Hi! I am your TalentOS Copilot. Ask me to explain a candidate ranking, summarize trust flags, or draft outreach.' }
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!query.trim() || isLoading) return
    const q = query.trim()
    setQuery('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setIsLoading(true)

    try {
      const { response } = await askCopilotAction(q)
      setMessages(prev => [...prev, { role: 'agent', text: response }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'agent', text: 'Sorry, I encountered an error connecting to the intelligence layer.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#0B1B3A] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#16305F] transition-all hover:scale-105 z-50 group border border-[#C9A227]/30"
        >
          <Bot size={24} className="text-[#C9A227] group-hover:animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="h-14 bg-[#0B1B3A] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-white">
              <Bot size={18} className="text-[#C9A227]" />
              <span className="font-bold text-sm tracking-tight">Recruiter Copilot</span>
              <span className="text-[9px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded font-mono ml-2">GEMINI-2.5</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 sidebar-scroll">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#0B1B3A] text-white rounded-br-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.role === 'agent' && i > 0 && <Sparkles size={12} className="text-[#C9A227] mb-1" />}
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-lg rounded-bl-sm px-4 py-3 shadow-sm">
                  <Loader2 size={16} className="text-[#C9A227] animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask why a candidate was ranked..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#0B1B3A] focus:ring-1 focus:ring-[#0B1B3A] transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!query.trim() || isLoading}
                className="absolute right-2 text-slate-400 hover:text-[#0B1B3A] disabled:opacity-50 p-1"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
