export type TicketStatus = "waiting" | "called" | "serving" | "done" | "skipped" | "hold"

export interface Office {
  id: string
  name: string
  abbreviation: string
  prefix: string
  color: string
  counters: number
  pin: string // env key for PIN
}

export interface Ticket {
  id: string // e.g. "HR-001"
  seq: number
  officeId: string
  status: TicketStatus
  counter: number | null
  createdAt: number
  calledAt: number | null
  servedAt: number | null
  doneAt: number | null
}

export interface OfficeQueueState {
  tickets: Ticket[]
  nextSeq: number
  serving: Record<number, string | null> // counter number -> ticket id or null
}

// ── Office Configuration ──────────────────────────────────────────
export const OFFICES: Office[] = [
  { id: "hr", name: "Human Resources", abbreviation: "HR", prefix: "HR", color: "#5B8C6A", counters: 2, pin: "ADMIN_PIN_HR" },
  { id: "finance", name: "Finance", abbreviation: "FIN", prefix: "FIN", color: "#C4845C", counters: 3, pin: "ADMIN_PIN_FIN" },
  { id: "registrar", name: "Registrar", abbreviation: "REG", prefix: "REG", color: "#7A8CBE", counters: 2, pin: "ADMIN_PIN_REG" },
  { id: "cashier", name: "Cashier", abbreviation: "CSH", prefix: "CSH", color: "#B57B9E", counters: 2, pin: "ADMIN_PIN_CSH" },
  { id: "records", name: "Records", abbreviation: "REC", prefix: "REC", color: "#8B9E6B", counters: 2, pin: "ADMIN_PIN_REC" },
  { id: "legal", name: "Legal Affairs", abbreviation: "LGL", prefix: "LGL", color: "#9E8B6B", counters: 1, pin: "ADMIN_PIN_LGL" },
  { id: "permits", name: "Permits & Licensing", abbreviation: "PRM", prefix: "PRM", color: "#6B8B9E", counters: 2, pin: "ADMIN_PIN_PRM" },
  { id: "admin", name: "Administration", abbreviation: "ADM", prefix: "ADM", color: "#8B6B6B", counters: 1, pin: "ADMIN_PIN_ADM" },
]

export function getOffice(id: string): Office | undefined {
  return OFFICES.find((o) => o.id === id)
}

// Redis key helpers, all namespaced per office
export function officeKeys(officeId: string) {
  return {
    TICKETS: `queue:${officeId}:tickets`,
    NEXT_SEQ: `queue:${officeId}:next_seq`,
    SERVING: `queue:${officeId}:serving`,
    COUNTERS: `queue:${officeId}:counters`,
  }
}

export function formatTicketId(prefix: string, seq: number): string {
  return `${prefix}-${String(seq).padStart(3, "0")}`
}

export function getEstimatedWait(position: number, avgServiceTime = 3): string {
  const minutes = position * avgServiceTime
  if (minutes < 1) return "< 1 min"
  if (minutes === 1) return "1 min"
  return `~${minutes} min`
}
