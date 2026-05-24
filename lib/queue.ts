export type TicketStatus = "waiting" | "called"| "recall" | "serving" | "done" | "skipped" | "hold"

export interface Office {
  id: string
  name: string
  abbreviation: string
  prefix: string
  color: string
  counters: number
}

export interface Ticket {
  id: string
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
  serving: Record<number, string | null>
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

// Default seed offices (used when first provisioning a new org)
export const SEED_OFFICES: Office[] = [
  { id: "hr", name: "Human Resources", abbreviation: "HR", prefix: "HR", color: "#5B8C6A", counters: 2 },
  { id: "finance", name: "Finance", abbreviation: "FIN", prefix: "FIN", color: "#C4845C", counters: 3 },
  { id: "registrar", name: "Registrar", abbreviation: "REG", prefix: "REG", color: "#7A8CBE", counters: 2 },
  { id: "cashier", name: "Cashier", abbreviation: "CSH", prefix: "CSH", color: "#B57B9E", counters: 2 },
  { id: "records", name: "Records", abbreviation: "REC", prefix: "REC", color: "#8B9E6B", counters: 2 },
  { id: "legal", name: "Legal Affairs", abbreviation: "LGL", prefix: "LGL", color: "#9E8B6B", counters: 1 },
  { id: "permits", name: "Permits & Licensing", abbreviation: "PRM", prefix: "PRM", color: "#6B8B9E", counters: 2 },
  { id: "admin", name: "Administration", abbreviation: "ADM", prefix: "ADM", color: "#8B6B6B", counters: 1 },
]
