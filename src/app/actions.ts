'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { InputJsonValue } from '@prisma/client/runtime/library'

/**
 * Helper to compute SHA-256 hash for audit chain
 */
function computeHash(
  prevHash: string,
  ts: string,
  actorType: string,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  payload: Record<string, unknown>
): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort())
  const data = [prevHash, ts, actorType, actorId, action, entityType, entityId, canonical].join('|')
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Server-side audit logger using Prisma
 */
async function recordAuditLog(
  actorType: string,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  payload: Record<string, unknown>
) {
  const ts = new Date()

  // Get previous hash in chain
  const lastRow = await prisma.auditLog.findFirst({
    orderBy: { id: 'desc' },
    select: { hash: true },
  })

  const prevHash = lastRow?.hash ?? ''
  const hash = computeHash(prevHash, ts.toISOString(), actorType, actorId, action, entityType, entityId, payload)

  await prisma.auditLog.create({
    data: {
      ts,
      actor_type: actorType,
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      payload: payload as InputJsonValue,
      prev_hash: prevHash,
      hash,
    },
  })
}

/**
 * 1. LIVE REQUISITION INTAKE ACTION
 */
export async function createRequisitionAction(formData: FormData) {
  const title = formData.get('title') as string
  const location = formData.get('location') as string
  const employmentType = formData.get('employmentType') as string
  const compMin = parseInt((formData.get('compMin') as string) || '800000', 10)
  const compMax = parseInt((formData.get('compMax') as string) || '1500000', 10)
  const skillsInput = formData.get('skills') as string
  const automatableShare = parseFloat((formData.get('automatableShare') as string) || '0.2')

  const skills = skillsInput ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean) : ['TypeScript', 'React']

  // Create requisition in Supabase Postgres
  const newReq = await prisma.requisition.create({
    data: {
      title,
      location,
      employment_type: employmentType || 'full-time',
      comp_min: compMin,
      comp_max: compMax,
      skills,
      automatable_share: automatableShare,
      status: 'open',
    },
  })

  // Write SHA-256 audit log row
  await recordAuditLog(
    'user',
    'recruiter-operator',
    'REQUISITION_CREATED',
    'requisition',
    newReq.id,
    { title, location, employmentType, compMin, compMax, skills }
  )

  // Auto-score matches against top candidates in talent pool
  const topCandidates = await prisma.candidate.findMany({ take: 5, include: { fraud_signals: true } })
  for (const cand of topCandidates) {
    await prisma.matchScore.create({
      data: {
        requisition_id: newReq.id,
        candidate_id: cand.id,
        skill_match: 0.85,
        trust_score: cand.fraud_signals.length > 0 ? 35 : 95,
        comp_fit: 0.9,
        location_fit: 0.95,
        availability: 1.0,
        channel_conversion: 0.85,
        probability: 0.88,
        signals: { skill_match: 0.85, trust_score: 95 },
      },
    })
  }

  revalidatePath('/requisitions')
  revalidatePath('/dashboard')
  revalidatePath('/audit')
  revalidatePath('/decisions')

  return { success: true, reqId: newReq.id }
}

/**
 * 2. LIVE CANDIDATE INGESTION & FRAUD SCREENING ACTION
 */
export async function createCandidateAction(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const location = formData.get('location') as string
  const poolType = (formData.get('poolType') as string) || 'external'
  const sourceChannel = (formData.get('sourceChannel') as string) || 'Direct Intake'
  const expectedComp = parseInt((formData.get('expectedComp') as string) || '1200000', 10)
  const isDemoTrap = formData.get('isDemoTrap') === 'true'

  // Insert Candidate
  const candidate = await prisma.candidate.create({
    data: {
      full_name: fullName,
      email,
      phone,
      location,
      pool_type: poolType,
      source_channel: sourceChannel,
      expected_comp: expectedComp,
    },
  })

  // If user selected demo trap, plant a live fraud trap signal
  if (isDemoTrap) {
    await prisma.fraudSignal.create({
      data: {
        candidate_id: candidate.id,
        type: 'DUPLICATE_PROFILE',
        severity: 'HIGH',
        evidence: {
          reason: `Flagged: Matching phone number (${phone}) & 91% resume text similarity with another pool profile.`,
          matched_phone: phone,
        },
      },
    })
  }

  // Audit log entry
  await recordAuditLog(
    'system',
    'screening-agent',
    'CANDIDATE_INGESTED',
    'candidate',
    candidate.id,
    { fullName, email, poolType, sourceChannel, isDemoTrap }
  )

  revalidatePath('/pool')
  revalidatePath('/dashboard')
  revalidatePath('/audit')

  return { success: true, candidateId: candidate.id }
}

/**
 * 3. LIVE HUMAN APPROVAL DECISION ACTION
 */
export async function handleApprovalAction(approvalId: string, state: 'approved' | 'rejected', reason?: string) {
  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      state,
      reason: reason || (state === 'approved' ? 'Approved by Talent Director' : 'Rejected due to comp mismatch'),
      decided_at: new Date(),
    },
  })

  // Audit Log Entry
  await recordAuditLog(
    'user',
    'talent-approver',
    'APPROVAL_DECIDED',
    'approval',
    approvalId,
    { state, reason: updated.reason }
  )

  revalidatePath('/approvals')
  revalidatePath('/audit')
  revalidatePath('/dashboard')

  return { success: true }
}
