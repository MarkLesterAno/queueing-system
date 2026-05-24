"use server"

import { redis } from "@/lib/redis"
import {
  officeKeys,
  formatTicketId,
  SEED_OFFICES,
  type Ticket,
} from "@/lib/queue"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import type { Office } from "@/lib/queue"

// ── Public office helpers (uses service client — works in API routes) ──

async function getStoredOfficesPublic(orgId?: string): Promise<Office[]> {
  const supabase = await createServiceClient()
  let query = supabase.from("offices").select("*")
  if (orgId) query = query.eq("org_id", orgId)
  const { data } = await query
  return data || []
}

async function getStoredOfficeByIdPublic(officeId: string): Promise<Office | null> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("offices")
    .select("*")
    .eq("id", officeId)
    .maybeSingle()
  return data || null
}

// ── Auth-aware helpers (use from server actions in page context) ──

export async function getOrgIdFromSlug(slug: string): Promise<string | null> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()
  if (error) console.error("[v0] getOrgIdFromSlug error:", error)
  return data?.id || null
}

export async function getStoredOffices(orgId: string): Promise<Office[]> {
  return getStoredOfficesPublic(orgId)
}

export async function getStoredOfficeById(officeId: string, orgId: string): Promise<Office | null> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("offices")
    .select("*")
    .eq("id", officeId)
    .eq("org_id", orgId)
    .maybeSingle()
  return data || null
}

export async function addOffice(
  orgId: string,
  id: string,
  name: string,
  abbreviation: string,
  prefix: string,
  color: string,
  counters: number,
): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("offices")
    .insert({ org_id: orgId, id, name, abbreviation, prefix, color, counters })
  if (error) console.error("[v0] Add office error:", error)
  return !error
}

export async function updateOffice(
  orgId: string,
  id: string,
  updates: Partial<Omit<Office, "id">>,
): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("offices")
    .update(updates)
    .eq("org_id", orgId)
    .eq("id", id)
  if (!error && updates.counters !== undefined) {
    const keys = officeKeys(id)
    const serving = await getOfficeServing(id, orgId)
    const newServing: Record<number, string | null> = {}
    for (let i = 1; i <= updates.counters; i++) {
      newServing[i] = serving[i] ?? null
    }
    await redis.set(keys.COUNTERS, updates.counters)
    await redis.set(keys.SERVING, newServing)
  }
  return !error
}

export async function deleteOffice(orgId: string, id: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("offices")
    .delete()
    .eq("org_id", orgId)
    .eq("id", id)
  if (!error) {
    const keys = officeKeys(id)
    await redis.del(keys.TICKETS)
    await redis.del(keys.NEXT_SEQ)
    await redis.del(keys.SERVING)
    await redis.del(keys.COUNTERS)
  }
  return !error
}

export async function verifyOfficePin(officeId: string, pin: string, orgId: string): Promise<boolean> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("operators")
    .select("id")
    .eq("office_id", officeId)
    .eq("pin", pin)
    .eq("org_id", orgId)
    .maybeSingle()
  return !!data
}

// ── Seed offices for a new org ─────────────────────────────────────

export async function seedDefaultOffices(orgId: string) {
  const supabase = await createClient()
  for (const off of SEED_OFFICES) {
    const { error } = await supabase
      .from("offices")
      .insert({ ...off, org_id: orgId })
    if (error) console.error(`[v0] Failed to seed office ${off.id}:`, error)
  }
}

// ── Read helpers ──────────────────────────────────────────────────

export async function getOfficeTickets(officeId: string): Promise<Ticket[]> {
  const keys = officeKeys(officeId)
  const tickets = await redis.get<Ticket[]>(keys.TICKETS)
  return tickets || []
}

export async function getOfficeServing(officeId: string, orgId?: string): Promise<Record<number, string | null>> {
  const office = orgId ? await getStoredOfficeById(officeId, orgId) : await getStoredOfficeByIdPublic(officeId)
  if (!office) return {}
  const keys = officeKeys(officeId)
  const serving = await redis.get<Record<number, string | null>>(keys.SERVING)
  if (serving) return serving
  const init: Record<number, string | null> = {}
  for (let i = 1; i <= office.counters; i++) init[i] = null
  return init
}

export async function getOfficeCounterCount(officeId: string): Promise<number> {
  const keys = officeKeys(officeId)
  const count = await redis.get<number>(keys.COUNTERS)
  if (count) return count
  const office = await getStoredOfficeByIdPublic(officeId)
  return office?.counters || 1
}

// ── Ticket issuance ───────────────────────────────────────────────

export async function issueTicket(officeId: string): Promise<Ticket | null> {
  const office = await getStoredOfficeByIdPublic(officeId)
  if (!office) return null

  const keys = officeKeys(officeId)
  const nextSeq = await redis.incr(keys.NEXT_SEQ)
  const tickets = await getOfficeTickets(officeId)

  const newTicket: Ticket = {
    id: formatTicketId(office.prefix, nextSeq),
    seq: nextSeq,
    officeId,
    status: "waiting",
    counter: null,
    createdAt: Date.now(),
    calledAt: null,
    servedAt: null,
    doneAt: null,
  }

  tickets.push(newTicket)
  await redis.set(keys.TICKETS, tickets)
  return newTicket
}

// ── Counter operations ────────────────────────────────────────────

export async function callNext(officeId: string, counter: number): Promise<Ticket | null> {
  const keys = officeKeys(officeId)
  const tickets = await getOfficeTickets(officeId)
  const serving = await getOfficeServing(officeId)

  const currentId = serving[counter]
  if (currentId) {
    const idx = tickets.findIndex((t) => t.id === currentId && (t.status === "serving" || t.status === "called"))
    if (idx !== -1) {
      tickets[idx].status = "done"
      tickets[idx].doneAt = Date.now()
    }
  }

  const next = tickets.find((t) => t.status === "waiting")
  if (!next) {
    serving[counter] = null
    await redis.set(keys.TICKETS, tickets)
    await redis.set(keys.SERVING, serving)
    return null
  }

  next.status = "called"
  next.counter = counter
  next.calledAt = Date.now()
  serving[counter] = next.id

  await redis.set(keys.TICKETS, tickets)
  await redis.set(keys.SERVING, serving)
  return next
}

export async function recallTicket(officeId: string, ticketId: string, counterNum: number): Promise<Ticket | null> {
  const keys = officeKeys(officeId)
  const tickets = await getOfficeTickets(officeId)
  const ticket = tickets.find(t => (t.id === ticketId && t.counter === counterNum))
  if (!ticket || (ticket.status !== "called" && ticket.status !== "recall")) return null

  ticket.status = "recall"
  ticket.calledAt = Date.now()
  await redis.set(keys.TICKETS, tickets)
  return ticket
}

export async function serveTicket(officeId: string, ticketId: string): Promise<Ticket | null> {
  const keys = officeKeys(officeId)
  const tickets = await getOfficeTickets(officeId)
  const ticket = tickets.find((t) => t.id === ticketId)
  if (!ticket || (ticket.status !== "called" && ticket.status !== "recall")) return null

  ticket.status = "serving"
  ticket.servedAt = Date.now()
  await redis.set(keys.TICKETS, tickets)
  return ticket
}

export async function completeTicket(officeId: string, ticketId: string): Promise<Ticket | null> {
  const keys = officeKeys(officeId)
  const tickets = await getOfficeTickets(officeId)
  const serving = await getOfficeServing(officeId)
  const ticket = tickets.find((t) => t.id === ticketId)
  if (!ticket) return null

  ticket.status = "done"
  ticket.doneAt = Date.now()

  for (const c of Object.keys(serving)) {
    if (serving[Number(c)] === ticketId) serving[Number(c)] = null
  }

  await redis.set(keys.TICKETS, tickets)
  await redis.set(keys.SERVING, serving)
  return ticket
}

export async function skipTicket(officeId: string, ticketId: string): Promise<Ticket | null> {
  const keys = officeKeys(officeId)
  const tickets = await getOfficeTickets(officeId)
  const serving = await getOfficeServing(officeId)
  const ticket = tickets.find((t) => t.id === ticketId)
  if (!ticket) return null

  ticket.status = "skipped"

  for (const c of Object.keys(serving)) {
    if (serving[Number(c)] === ticketId) serving[Number(c)] = null
  }

  await redis.set(keys.TICKETS, tickets)
  await redis.set(keys.SERVING, serving)
  return ticket
}

export async function holdTicket(officeId: string, ticketId: string): Promise<Ticket | null> {
  const keys = officeKeys(officeId)
  const tickets = await getOfficeTickets(officeId)
  const serving = await getOfficeServing(officeId)
  const ticket = tickets.find((t) => t.id === ticketId)
  if (!ticket) return null

  ticket.status = "hold"
  ticket.counter = null

  for (const c of Object.keys(serving)) {
    if (serving[Number(c)] === ticketId) serving[Number(c)] = null
  }

  await redis.set(keys.TICKETS, tickets)
  await redis.set(keys.SERVING, serving)
  return ticket
}

// ── Queue reset ───────────────────────────────────────────────────

export async function resetOfficeQueue(officeId: string): Promise<void> {
  const office = await getStoredOfficeByIdPublic(officeId)
  if (!office) return
  const keys = officeKeys(officeId)
  const counterCount = await getOfficeCounterCount(officeId)
  const serving: Record<number, string | null> = {}
  for (let i = 1; i <= counterCount; i++) serving[i] = null

  await redis.set(keys.TICKETS, [])
  await redis.set(keys.NEXT_SEQ, 0)
  await redis.set(keys.SERVING, serving)
}

// ── Counter management ────────────────────────────────────────────

export async function setOfficeCounters(officeId: string, count: number): Promise<void> {
  const keys = officeKeys(officeId)
  const serving = await getOfficeServing(officeId)
  const newServing: Record<number, string | null> = {}
  for (let i = 1; i <= count; i++) {
    newServing[i] = serving[i] ?? null
  }
  await redis.set(keys.COUNTERS, count)
  await redis.set(keys.SERVING, newServing)
}

// ── Transfer ticket ──────────────────────────────────────────────

export async function transferTicket(fromOfficeId: string, toOfficeId: string, ticketId: string): Promise<Ticket | null> {
  const toOffice = await getStoredOfficeByIdPublic(toOfficeId)
  if (!toOffice) return null

  const toKeys = officeKeys(toOfficeId)

  const fromTickets = await getOfficeTickets(fromOfficeId)
  const toTickets = await getOfficeTickets(toOfficeId)
  const fromServing = await getOfficeServing(fromOfficeId)

  const ticketIdx = fromTickets.findIndex((t) => t.id === ticketId)
  if (ticketIdx === -1) return null

  const ticket = fromTickets[ticketIdx]

  if (ticket.status !== "serving" && ticket.status !== "done") return null

  if (ticket.status === "serving") {
    ticket.status = "done"
    ticket.doneAt = Date.now()

    if (ticket.counter) {
      fromServing[ticket.counter] = null
    }
  }

  const nextSeq = await redis.incr(toKeys.NEXT_SEQ)
  const newTicket: Ticket = {
    id: ticket.id,
    seq: nextSeq,
    officeId: toOfficeId,
    status: "waiting",
    counter: null,
    createdAt: Date.now(),
    calledAt: null,
    servedAt: null,
    doneAt: null,
  }

  toTickets.push(newTicket)
  await redis.set(toKeys.TICKETS, toTickets)
  await completeTicket(fromOfficeId, ticketId)

  return newTicket
}

// ── Aggregate data ────────────────────────────────────────────────

async function getOfficeStats(office: Office) {
  const tickets = await getOfficeTickets(office.id)
  const serving = await getOfficeServing(office.id)
  const counterCount = await getOfficeCounterCount(office.id)

  const waiting = tickets.filter((t) => t.status === "waiting")
  const done = tickets.filter((t) => t.status === "done")
  const active = tickets.filter((t) => t.status === "called" || t.status === "serving")

  const completedWithWait = done.filter((t) => t.calledAt && t.createdAt)
  const avgWait = completedWithWait.length > 0
    ? Math.round(completedWithWait.reduce((sum, t) => sum + ((t.calledAt! - t.createdAt) / 60000), 0) / completedWithWait.length)
    : 0

  const idleCounters = Object.values(serving).filter((v) => v === null).length

  return {
    id: office.id,
    name: office.name,
    abbreviation: office.abbreviation,
    prefix: office.prefix,
    color: office.color,
    queueDepth: waiting.length,
    avgWaitMinutes: avgWait,
    ticketsServed: done.length,
    activeTickets: active.length,
    totalCounters: counterCount,
    idleCounters,
    serving,
    tickets,
  }
}

export async function getAllOfficeStats(orgId?: string) {
  const offices = orgId ? await getStoredOffices(orgId) : await getStoredOfficesPublic()
  const stats = await Promise.all(offices.map((office) => getOfficeStats(office)))
  return stats
}
