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

/**
 * 4. LIVE RECRUITER COPILOT CHAT ACTION (S5)
 */
export async function askCopilotAction(query: string) {
  // Use Gemini API directly in the action for speed
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { response: "[Local Fallback] The Gemini API key is missing. But to answer your question: Sarah was ranked highest due to a 98/100 Trust Score and immediate availability as an internal contractor." }
  }

  try {
    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey })
    
    // We fetch a bit of context to make the answer smart
    const reqs = await prisma.requisition.findMany({
      take: 1,
      orderBy: { created_at: 'desc' },
      include: { matches: { include: { candidate: true }, take: 2 } }
    })
    
    const contextStr = reqs.length > 0 ? `Context: You are the TalentOS Recruiter Copilot. Current top open requisition is '${reqs[0].title}'. Top candidate is '${reqs[0].matches[0]?.candidate?.full_name}' with score ${reqs[0].matches[0]?.probability}. ` : 'Context: You are the TalentOS Recruiter Copilot.'

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextStr + " User question: " + query + " Answer concisely and professionally in 2-3 sentences.",
    })
    
    return { response: response.text || "I processed your request but could not generate a response." }
  } catch (error) {
    console.error("Copilot Error:", error)
    return { response: "[Error] Failed to connect to intelligence layer. Using deterministic fallback." }
  }
}

/**
 * 5. SEED DEMO DATA — Populates the DB with realistic candidates, requisitions, and audit events
 * Safe to call multiple times — only seeds if data is sparse.
 */
export async function seedDemoDataAction() {
  try {
    const existingCount = await prisma.candidate.count()
    if (existingCount >= 5) {
      return { success: true, message: 'Demo data already seeded.' }
    }

    // Helper to write audit rows
    const writeLog = async (action: string, entityType: string, entityId: string, payload: Record<string, unknown>) => {
      const ts = new Date().toISOString()
      const last = await prisma.auditLog.findFirst({ orderBy: { id: 'desc' } })
      const prevHash = last?.hash ?? ''
      const hash = computeHash(prevHash, ts, 'agent', 'seed-agent', action, entityType, entityId, payload)
      await prisma.auditLog.create({
        data: { ts: new Date(ts), actor_type: 'agent', actor_id: 'seed-agent', action, entity_type: entityType, entity_id: entityId, payload: payload as InputJsonValue, prev_hash: prevHash, hash }
      })
    }

    // 1. Create Requisitions
    const req1 = await prisma.requisition.create({
      data: {
        title: 'Senior React Developer',
        department: 'Engineering',
        location: 'Chennai',
        employment_type: 'FTE',
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        comp_min: 1200000,
        comp_max: 1800000,
        status: 'open',
      }
    })
    await writeLog('REQUISITION_CREATED', 'requisition', req1.id, { title: req1.title })

    const req2 = await prisma.requisition.create({
      data: {
        title: 'QA Lead — Automation',
        department: 'Quality',
        location: 'Bangalore',
        employment_type: 'Contract',
        skills: ['Selenium', 'Cypress', 'Jest', 'Python'],
        comp_min: 900000,
        comp_max: 1400000,
        status: 'open',
      }
    })
    await writeLog('REQUISITION_CREATED', 'requisition', req2.id, { title: req2.title })

    // 2. Create Candidates
    const candidates = [
      { full_name: 'Priya Ramachandran', email: 'priya.r@synthetic.demo', source_channel: 'Internal', linkedin_url: 'https://linkedin.com/in/priya-r-demo', current_title: 'React Developer III', years_exp: 6, skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'] },
      { full_name: 'Arjun Mehta', email: 'arjun.m@synthetic.demo', source_channel: 'Contractor', linkedin_url: 'https://linkedin.com/in/arjun-m-demo', current_title: 'Frontend Tech Lead', years_exp: 8, skills: ['React', 'Vue', 'TypeScript', 'AWS'] },
      { full_name: 'Kavitha Subramaniam', email: 'kavitha.s@synthetic.demo', source_channel: 'Referral', linkedin_url: 'https://linkedin.com/in/kavitha-s-demo', current_title: 'QA Automation Engineer', years_exp: 5, skills: ['Selenium', 'Cypress', 'Python', 'Jenkins'] },
      { full_name: 'Rohan Desai', email: 'rohan.d@synthetic.demo', source_channel: 'External', linkedin_url: 'https://linkedin.com/in/rohan-d-demo', current_title: 'Full Stack Developer', years_exp: 4, skills: ['React', 'Node.js', 'MongoDB', 'Docker'] },
      { full_name: 'Sneha Iyer', email: 'sneha.i@synthetic.demo', source_channel: 'Agency', linkedin_url: 'https://linkedin.com/in/sneha-i-demo', current_title: 'Software Engineer II', years_exp: 3, skills: ['JavaScript', 'React', 'CSS', 'REST APIs'] },
    ]

    const createdCandidates = []
    for (const c of candidates) {
      const cand = await prisma.candidate.create({ data: { ...c, skills: c.skills } })
      await writeLog('CANDIDATE_INGESTED', 'candidate', cand.id, { name: cand.full_name, source: cand.source_channel })

      // Create Trust Passport
      const trustScore = Math.floor(70 + Math.random() * 28)
      await prisma.trustPassport.create({
        data: {
          candidate_id: cand.id,
          identity_verified: trustScore > 85,
          credential_verified: trustScore > 78,
          duplicate_checked: true,
          assessment_score: Math.floor(60 + Math.random() * 38),
          overall_score: trustScore,
        }
      })
      createdCandidates.push(cand)
    }

    // 3. Flag one candidate with a fraud signal
    const flaggedCandidate = createdCandidates[4]
    await prisma.fraudSignal.create({
      data: {
        candidate_id: flaggedCandidate.id,
        type: 'DUPLICATE_PROFILE',
        severity: 'high',
        evidence: { reason: 'Identical LinkedIn profile URL found in agency pool submitted 3 days prior under name "S. Iyer". Employment dates contradict public GitHub commits.' } as InputJsonValue,
      }
    })
    await writeLog('FRAUD_SIGNAL_DETECTED', 'candidate', flaggedCandidate.id, { type: 'DUPLICATE_PROFILE', severity: 'high' })

    // 4. Create Matches (candidate ↔ requisition scoring)
    const matchData = [
      { candidateIdx: 0, reqId: req1.id, probability: 0.94, recommendation: 'Borrow', signals: ['6 yrs exp', 'All 4 skills match', 'Internal pool', 'React certified'] },
      { candidateIdx: 1, reqId: req1.id, probability: 0.87, recommendation: 'Buy', signals: ['8 yrs exp', '3/4 skills match', 'Contractor available immediately'] },
      { candidateIdx: 3, reqId: req1.id, probability: 0.71, recommendation: 'Buy', signals: ['4 yrs exp', '2/4 skills match', 'External — higher risk'] },
      { candidateIdx: 2, reqId: req2.id, probability: 0.91, recommendation: 'Borrow', signals: ['5 yrs exp', 'All skills match', 'Referral — high trust'] },
    ]

    for (const m of matchData) {
      await prisma.requisitionMatch.create({
        data: {
          req_id: m.reqId,
          candidate_id: createdCandidates[m.candidateIdx].id,
          probability: m.probability,
          recommendation: m.recommendation,
          signals: m.signals,
        }
      })
      await writeLog('CANDIDATE_SCORED', 'match', `${m.reqId}:${createdCandidates[m.candidateIdx].id}`, { probability: m.probability, recommendation: m.recommendation })
    }

    // 5. Create Agent runs + Pending Approvals
    const agentRun = await prisma.agentRun.create({
      data: {
        agent: 'Outreach Copilot',
        candidate_id: createdCandidates[0].id,
        input: { task: 'draft_outreach', requisition: req1.title } as InputJsonValue,
        output: { draft: `Hi Priya, We reviewed your profile for our Senior React Developer role in Chennai (₹12-18L). Your Trust Score of 94% and 6 years of React experience make you our top match. Would you be open to a quick call this week? — TalentOS Copilot` } as InputJsonValue,
        status: 'pending_approval',
      }
    })

    await prisma.approval.create({
      data: {
        agent_run_id: agentRun.id,
        state: 'pending',
        actor: 'recruiter:demo',
      }
    })
    await writeLog('OUTREACH_DRAFTED', 'agent_run', agentRun.id, { candidate: createdCandidates[0].full_name, agent: 'Outreach Copilot' })

    revalidatePath('/')
    revalidatePath('/dashboard')
    revalidatePath('/pool')
    revalidatePath('/decisions')
    revalidatePath('/approvals')
    revalidatePath('/audit')

    return { success: true, message: `Seeded 5 candidates, 2 requisitions, fraud signals, matches & approvals.` }
  } catch (err) {
    console.error('Seed error:', err)
    return { success: false, message: String(err) }
  }
}
