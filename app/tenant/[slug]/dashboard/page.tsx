"use client"

import { use, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAllOffices } from "@/hooks/use-queue"
import { getOrgIdFromSlug } from "@/lib/actions"
import { motion } from "framer-motion"
import AdminSidebar from "@/components/admin-sidebar"
import { OfficeRow } from "@/components/office-row"
import { StatCard } from "@/components/stat-card"

interface OfficeStat {
  id: string
  name: string
  abbreviation: string
  color: string
  queueDepth: number
  avgWaitMinutes: number
  ticketsServed: number
  activeTickets: number
  totalCounters: number
  idleCounters: number
  tickets: Array<{
    id: string
    seq: number
    officeId: string
    status: string
    counter: number | null
    createdAt: number
    calledAt: number | null
    servedAt: number | null
    doneAt: number | null
  }>
}

function exportToCSV(offices: OfficeStat[]) {
  const headers = ["Office", "Ticket ID", "Status", "Counter", "Created", "Called", "Served", "Done"]
  const rows = [headers.join(",")]

  for (const stat of offices) {
    for (const ticket of stat.tickets) {
      rows.push([
        stat.name,
        ticket.id,
        ticket.status,
        ticket.counter ?? "",
        formatTimestamp(ticket.createdAt),
        formatTimestamp(ticket.calledAt),
        formatTimestamp(ticket.servedAt),
        formatTimestamp(ticket.doneAt),
      ].join(","))
    }
  }

  const blob = new Blob([rows.join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `queue-report-${new Date().toISOString().split("T")[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function formatTimestamp(ts: number | null): string {
  return ts ? new Date(ts).toISOString() : ""
}

export default function AdminDashboard() {
  const params = useParams()
  const slug = params.slug as string
  const [orgId, setOrgId] = useState<string | undefined>(undefined)

  useEffect(() => {
    getOrgIdFromSlug(slug).then(setOrgId)
  }, [slug])

  const { data, isLoading } = useAllOffices(3000, orgId)

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex bg-background">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-1 w-16 bg-foreground animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Loading Dashboard
            </span>
          </div>
        </div>
      </div>
    )
  }

  const offices: OfficeStat[] = data.offices || []
  const totalWaiting = offices.reduce((s, o) => s + o.queueDepth, 0)
  const totalServed = offices.reduce((s, o) => s + o.ticketsServed, 0)
  const totalActive = offices.reduce((s, o) => s + o.activeTickets, 0)

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-foreground" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Administrator Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {offices.length} offices
            </span>
            <button
              onClick={() => exportToCSV(offices)}
              className="px-3 py-1.5 rounded-sm border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </header>

        {/* Global stats strip */}
        <div className="flex items-center gap-8 px-6 py-4 border-b border-border bg-secondary/30">
          <StatCard label="Total Waiting" value={totalWaiting} />
          <StatCard label="Currently Active" value={totalActive} />
          <StatCard label="Total Served" value={totalServed} />
          <div className="ml-auto">
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Office rows */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-4">
            {offices.map((office) => (
              <div key={office.id} className="flex flex-col border border-border rounded-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: office.color }} />
                    <span className="font-mono text-xs uppercase tracking-widest text-foreground">{office.abbreviation}</span>
                    <span className="font-sans text-xs text-muted-foreground">{office.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8 px-4 py-4 flex-wrap">
                  <StatCard label="Queue Depth" value={office.queueDepth} color={office.color} />
                  <StatCard label="Avg Wait" value={`${office.avgWaitMinutes}m`} />
                  <StatCard label="Served Today" value={office.ticketsServed} />
                  <StatCard label="Active" value={office.activeTickets} color={office.activeTickets > 0 ? office.color : undefined} />
                  <StatCard label="Counters" value={`${office.totalCounters - office.idleCounters}/${office.totalCounters}`} />
                  <StatCard label="Idle" value={office.idleCounters} color={office.idleCounters > 0 ? undefined : undefined} />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
