import crypto from 'crypto'
import type { ActorType } from '@/lib/constants'

interface AuditEntry {
  actorType: ActorType
  actorId: string
  action: string
  entityType: string
  entityId: string
  payload?: Record<string, unknown>
}

/**
 * Compute SHA-256 hash for audit chain.
 * hash = sha256(prevHash || ts || actorType || actorId || action || entityType || entityId || canonicalPayload)
 */
export function computeHash(
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
 * Server-side audit log writer.
 * Uses service-role client to bypass RLS on insert.
 * Call this from route handlers — never from client components.
 */
export async function writeAuditLog(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createServiceClient> extends Promise<infer T> ? T : never,
  entry: AuditEntry
): Promise<void> {
  const ts = new Date().toISOString()
  const payload = entry.payload ?? {}

  // Get the last hash in the chain
  const { data: lastRow } = await supabase
    .from('audit_log')
    .select('hash')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  const prevHash = lastRow?.hash ?? ''

  const hash = computeHash(
    prevHash,
    ts,
    entry.actorType,
    entry.actorId,
    entry.action,
    entry.entityType,
    entry.entityId,
    payload
  )

  await supabase.from('audit_log').insert({
    ts,
    actor_type: entry.actorType,
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    payload,
    prev_hash: prevHash,
    hash,
  })
}

/**
 * Verify the entire audit chain integrity.
 * Returns { valid: true } or { valid: false, firstBadId: number }
 */
export async function verifyChain(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createServiceClient> extends Promise<infer T> ? T : never
): Promise<{ valid: boolean; firstBadId?: number; totalRows: number }> {
  const { data: rows, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('id', { ascending: true })

  if (error || !rows) return { valid: false, totalRows: 0 }

  let prevHash = ''
  for (const row of rows) {
    const expectedHash = computeHash(
      prevHash,
      row.ts,
      row.actor_type,
      row.actor_id,
      row.action,
      row.entity_type,
      row.entity_id,
      row.payload ?? {}
    )
    if (expectedHash !== row.hash) {
      return { valid: false, firstBadId: row.id, totalRows: rows.length }
    }
    prevHash = row.hash
  }

  return { valid: true, totalRows: rows.length }
}
