import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <TopBar />
      {/* Main content viewport */}
      <main className="ml-60 pt-14 min-h-screen">
        <div className="max-w-[1240px] mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
