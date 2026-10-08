/**
 * Design tokens matching 04_DESIGN.md
 * Use these as Tailwind config values — do NOT add new colours.
 */
export const colors = {
  navy900: '#0B1B3A',
  navy700: '#16305F',
  ink: '#0F172A',
  muted: '#64748B',
  surface: '#F7F8FA',
  card: '#FFFFFF',
  border: '#E2E8F0',
  gold500: '#C9A227',
  trustGreen: '#16A34A',
  reviewAmber: '#D97706',
  riskRed: '#DC2626',
  infoBlue: '#2563EB',
} as const

export type TrustStatus = 'verified' | 'review' | 'flagged'
export type PoolType = 'internal' | 'contractor' | 'external'
export type EmploymentType = 'full-time' | 'contract' | 'part-time'
export type AgentType = 'screening' | 'outreach' | 'scheduling' | 'copilot'
export type ApprovalState = 'pending' | 'approved' | 'rejected' | 'exception'
export type BBBARRecommendation = 'build' | 'buy' | 'borrow' | 'automate' | 'relocate'
export type ActorType = 'user' | 'agent' | 'system'

export const TRUST_STATUS_LABEL: Record<TrustStatus, string> = {
  verified: 'Verified',
  review: 'Needs Review',
  flagged: 'Flagged',
}

export const POOL_TYPE_LABEL: Record<PoolType, string> = {
  internal: 'Internal',
  contractor: 'Contractor',
  external: 'External',
}

export const BBBR_LABEL: Record<BBBARRecommendation, string> = {
  build: 'Build',
  buy: 'Buy',
  borrow: 'Borrow',
  automate: 'Automate',
  relocate: 'Relocate',
}
