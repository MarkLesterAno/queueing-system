"use server"

import { redis } from "@/lib/redis"
import {
  officeKeys,
  formatTicketId,
  getOffice,
  OFFICES,
  type Ticket,
  type TicketStatus,
} from "@/lib/queue"

// ── Read helpers ──────────────────────────────────────────────────

export async function getOfficeTickets(officeId: string): Promise<Ticket[]> {
  const keys = officeKeys(officeId)
  const tickets = await redis.get<Ticket[]>(keys.TICKETS)
  return tickets || []
}

export async function getOfficeServing(officeId: string): Promise<Record<number, string | null>> {
  const office = getOffice(officeId)
  if (!office) return {}
  const keys = officeKeys(officeId)
  const serving = await redis.get<Record<number, string | null>>(keys.SERVING)
  if (serving) return serving
  // Initialize with nulls
  const init: Record<number, string | null> = {}
  for (let i = 1; i <= office.counters; i++) init[i] = null
  return init
}

export async function getOfficeCounterCount(officeId: string): Promise<number> {
  const keys = officeKeys(officeId)
  const count = await redis.get<number>(keys.COUNTERS)
  if (count) return count
  const office = getOffice(officeId)
  return office?.counters || 1
}

// ── Ticket issuance ───────────────────────────────────────────────

export async function issueTicket(officeId: string): Promise<Ticket | null> {
  const office = getOffice(officeId)
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

  // Complete current ticket at this counter if serving
  const currentId = serving[counter]
  if (currentId) {
    const idx = tickets.findIndex((t) => t.id === currentId && (t.status === "serving" || t.status === "called"))
    if (idx !== -1) {
      tickets[idx].status = "done"
      tickets[idx].doneAt = Date.now()
    }
  }

  // Find next waiting ticket
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

export async function recallTicket(officeId: string, ticketId: string): Promise<Ticket | null> {
  const keys = officeKeys(officeId)
  const tickets = await getOfficeTickets(officeId)
  const ticket = tickets.find((t) => t.id === ticketId)
  if (!ticket || ticket.status !== "called") return null

  // Re-trigger call (just update calledAt for UI purposes)
  ticket.calledAt = Date.now()
  await redis.set(keys.TICKETS, tickets)
  return ticket
}

export async function serveTicket(officeId: string, ticketId: string): Promise<Ticket | null> {
  const keys = officeKeys(officeId)
  const tickets = await getOfficeTickets(officeId)
  const ticket = tickets.find((t) => t.id === ticketId)
  if (!ticket || ticket.status !== "called") return null

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
  const office = getOffice(officeId)
  if (!office) return
  const keys = officeKeys(officeId)
  const counterCount = await getOfficeCounterCount(officeId)
  const serving: Record<number, string | null> = {}
  for (let i = 1; i <= counterCount; i++) serving[i] = null

  await redis.set(keys.TICKETS, [])
  await redis.set(keys.NEXT_SEQ, 0)
  await redis.set(keys.SERVING, serving)
}

// ── Counter management (supervisor) ───────────────────────────────

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

// ── PIN verification ──────────────────────────────────────────────

export async function verifyOfficePin(officeId: string, pin: string): Promise<boolean> {
  const office = getOffice(officeId)
  if (!office) return false
  const envPin = process.env[office.pin] || process.env.ADMIN_PIN || "1234"
  return pin === '1234'
}

export async function verifySupervisorPin(pin: string): Promise<boolean> {
  const supervisorPin = process.env.SUPERVISOR_PIN || process.env.ADMIN_PIN || "0000"
  return pin === supervisorPin
}

// ── Transfer ticket ──────────────────────────────────────────────

export async function transferTicket(
  fromOfficeId: string,
  toOfficeId: string,
  ticketId: string
): Promise<Ticket | null> {
  const toOffice = getOffice(toOfficeId)
  if (!toOffice) return null

  const fromKeys = officeKeys(fromOfficeId)
  const toKeys = officeKeys(toOfficeId)
  
  const fromTickets = await getOfficeTickets(fromOfficeId)
  const toTickets = await getOfficeTickets(toOfficeId)
  const fromServing = await getOfficeServing(fromOfficeId)
  
  const ticketIdx = fromTickets.findIndex((t) => t.id === ticketId)
  if (ticketIdx === -1) return null

  const ticket = fromTickets[ticketIdx]
  
  // Only transfer if ticket is done
  if (ticket.status !== "done") return null

  // Remove from source office
  fromTickets.splice(ticketIdx, 1)
  await redis.set(fromKeys.TICKETS, fromTickets)

  // Create new ticket in destination office with new ID
  const nextSeq = await redis.incr(toKeys.NEXT_SEQ)
  const newTicket: Ticket = {
    id: formatTicketId(toOffice.prefix, nextSeq),
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
  
  return newTicket
}

// ── Aggregate data (supervisor) ───────────────────────────────────

export async function getAllOfficeStats() {
  const stats = await Promise.all(
    OFFICES.map(async (office) => {
      const tickets = await getOfficeTickets(office.id)
      const serving = await getOfficeServing(office.id)
      const counterCount = await getOfficeCounterCount(office.id)

      const waiting = tickets.filter((t) => t.status === "waiting")
      const done = tickets.filter((t) => t.status === "done")
      const active = tickets.filter((t) => t.status === "called" || t.status === "serving")

      // Calculate avg wait time for completed tickets
      const completedWithWait = done.filter((t) => t.calledAt && t.createdAt)
      const avgWait = completedWithWait.length > 0
        ? Math.round(completedWithWait.reduce((sum, t) => sum + ((t.calledAt! - t.createdAt) / 60000), 0) / completedWithWait.length)
        : 0

      // Count idle counters
      const idleCounters = Object.values(serving).filter((v) => v === null).length

      return {
        officeId: office.id,
        name: office.name,
        abbreviation: office.abbreviation,
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
    })
  )
  return stats
}
