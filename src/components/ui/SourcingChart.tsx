'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const data = [
  { name: 'Internal', candidates: 30, conversion: 85, color: '#16A34A' },
  { name: 'Contractor', candidates: 40, conversion: 60, color: '#C9A227' },
  { name: 'Referral', candidates: 25, conversion: 45, color: '#2563EB' },
  { name: 'External', candidates: 50, conversion: 15, color: '#64748B' },
]

export function SourcingChart() {
  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-slate-200 p-2 rounded shadow-sm text-xs">
                    <p className="font-bold text-[#0F172A]">{payload[0].payload.name}</p>
                    <p className="text-slate-600">Candidates: {payload[0].payload.candidates}</p>
                    <p className="text-slate-600">Hire Prob: {payload[0].payload.conversion}%</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="conversion" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
