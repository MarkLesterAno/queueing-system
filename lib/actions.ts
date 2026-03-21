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
  const office = await getStoredOfficeById(officeId)
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
  const office = await getStoredOfficeById(officeId)
  return office?.counters || 1
}

// ── Ticket issuance ───────────────────────────────────────────────

export async function issueTicket(officeId: string): Promise<Ticket | null> {
  const office = await getStoredOfficeById(officeId)
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
  const office = await getStoredOfficeById(officeId)
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
  const office = await getStoredOfficeById(officeId)
  if (!office) return false
  const envPin = office.pin || process.env.ADMIN_PIN || "1234"
  return pin === envPin
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

  const toKeys = officeKeys(toOfficeId)

  const fromTickets = await getOfficeTickets(fromOfficeId)
  const toTickets = await getOfficeTickets(toOfficeId)
  const fromServing = await getOfficeServing(fromOfficeId)

  const ticketIdx = fromTickets.findIndex((t) => t.id === ticketId)
  if (ticketIdx === -1) return null

  const ticket = fromTickets[ticketIdx]

  // Allow transfer for serving or done tickets
  if (ticket.status !== "serving" && ticket.status !== "done") return null

  // Mark as done if still serving (needed before transfer)
  if (ticket.status === "serving") {
    ticket.status = "done"
    ticket.doneAt = Date.now()

    // Clear from serving state
    if (ticket.counter) {
      fromServing[ticket.counter] = null
    }
  }

  // Create new ticket in destination office with new ID
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

// ── Office management (supervisor) ────────────────────────────────

const OFFICES_KEY = "system:offices"

export async function getStoredOffices(): Promise<typeof OFFICES> {
  const stored = await redis.get<typeof OFFICES>(OFFICES_KEY)
  return stored || OFFICES
}

export async function getStoredOfficeById(id: string) {
  const offices = await getStoredOffices()
  return offices.find((o) => o.id === id) || null
}

export async function addOffice(
  id: string,
  name: string,
  abbreviation: string,
  prefix: string,
  color: string,
  counters: number,
  pin: string
): Promise<boolean> {
  const offices = await getStoredOffices()
  if (offices.find((o) => o.id === id)) return false

  offices.push({
    id,
    name,
    abbreviation,
    prefix,
    color,
    counters,
    pin,
  })

  await redis.set(OFFICES_KEY, offices)
  return true
}

export async function updateOffice(
  id: string,
  updates: { name?: string; abbreviation?: string; prefix?: string; color?: string; counters?: number; pin?: string }
): Promise<boolean> {
  const offices = await getStoredOffices()
  const office = offices.find((o) => o.id === id)
  if (!office) return false

  if (updates.name) office.name = updates.name
  if (updates.abbreviation) office.abbreviation = updates.abbreviation
  if (updates.prefix) office.prefix = updates.prefix
  if (updates.color) office.color = updates.color
  if (updates.pin) office.pin = updates.pin
  if (updates.counters !== undefined) {
    const keys = officeKeys(id)
    await setOfficeCounters(id, updates.counters)
  }

  await redis.set(OFFICES_KEY, offices)
  return true
}

export async function deleteOffice(id: string): Promise<boolean> {
  const offices = await getStoredOffices()
  const idx = offices.findIndex((o) => o.id === id)
  if (idx === -1) return false

  offices.splice(idx, 1)
  await redis.set(OFFICES_KEY, offices)

  // Clear all queue data for deleted office
  const keys = officeKeys(id)
  await redis.del(keys.TICKETS)
  await redis.del(keys.NEXT_SEQ)
  await redis.del(keys.SERVING)
  await redis.del(keys.COUNTERS)

  return true
}

// ── Aggregate data (supervisor) ───────────────────────────────────

export async function getAllOfficeStats() {
  const offices = await getStoredOffices()
  const stats = await Promise.all(
    offices.map(async (office) => {
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
    })
  )
  return stats
}
