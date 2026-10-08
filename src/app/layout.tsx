import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TalentOS — AI-Native Talent Acquisition OS',
  description:
    'Verify first. Decide with evidence. Act with a human in the loop. Audit everything.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
