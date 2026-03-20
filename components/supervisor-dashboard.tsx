"use client"

import { useAllOffices } from "@/hooks/use-queue"
import { setOfficeCounters, resetOfficeQueue } from "@/lib/actions"
import { OFFICES } from "@/lib/queue"
import { motion } from "framer-motion"
import { useState, useCallback } from "react"
import Link from "next/link"
import OfficeManager from "./office-manager"

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

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className="font-mono text-lg tabular-nums"
        style={{ color: color || "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  )
}

function OfficeRow({
  stat,
  onMutate,
}: {
  stat: OfficeStat
  onMutate: () => void
}) {
  const [adjusting, setAdjusting] = useState(false)

  const handleAdjustCounters = async (delta: number) => {
    const newCount = Math.max(1, Math.min(6, stat.totalCounters + delta))
    if (newCount === stat.totalCounters) return
    setAdjusting(true)
    await setOfficeCounters(stat.id, newCount)
    onMutate()
    setAdjusting(false)
  }

  const handleReset = async () => {
    if (
      !confirm(
        `Reset ${stat.name} queue? All tickets will be cleared.`
      )
    )
      return
    await resetOfficeQueue(stat.id)
    onMutate()
  }

  return (
    <div className="flex flex-col border border-border rounded-sm overflow-hidden">
      {/* Office header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary">
        <div className="flex items-center gap-3">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: stat.color }}
          />
          <span className="font-mono text-xs uppercase tracking-widest text-foreground">
            {stat.abbreviation}
          </span>
          <span className="font-sans text-xs text-muted-foreground">
            {stat.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/operator/${stat.id}`}
            className="px-2 py-1 rounded-sm border border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Operator
          </Link>
          <Link
            href={`/display/${stat.id}`}
            className="px-2 py-1 rounded-sm border border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Display
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-8 px-4 py-4 flex-wrap">
        <StatCard label="Queue Depth" value={stat.queueDepth} color={stat.color} />
        <StatCard label="Avg Wait" value={`${stat.avgWaitMinutes}m`} />
        <StatCard label="Served Today" value={stat.ticketsServed} />
        <StatCard label="Active" value={stat.activeTickets} color={stat.activeTickets > 0 ? stat.color : undefined} />

        {/* Counter management */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Counters
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAdjustCounters(-1)}
              disabled={adjusting || stat.totalCounters <= 1}
              className="flex items-center justify-center h-7 w-7 rounded-sm bg-secondary text-muted-foreground font-mono text-sm hover:bg-border transition-colors disabled:opacity-30"
            >
              -
            </button>
            <span className="font-mono text-lg tabular-nums text-foreground w-6 text-center">
              {stat.totalCounters}
            </span>
            <button
              onClick={() => handleAdjustCounters(1)}
              disabled={adjusting || stat.totalCounters >= 6}
              className="flex items-center justify-center h-7 w-7 rounded-sm bg-secondary text-muted-foreground font-mono text-sm hover:bg-border transition-colors disabled:opacity-30"
            >
              +
            </button>
            <span className="font-mono text-[10px] text-muted-foreground ml-1">
              ({stat.idleCounters} idle)
            </span>
          </div>
        </div>

        <div className="ml-auto">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-sm border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest hover:border-destructive hover:text-destructive transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

function exportCSV(offices: OfficeStat[]) {
  const rows = [
    ["Office", "Ticket ID", "Status", "Counter", "Created", "Called", "Served", "Done"].join(","),
  ]

  for (const stat of offices) {
    for (const ticket of stat.tickets) {
      rows.push(
        [
          stat.name,
          ticket.id,
          ticket.status,
          ticket.counter ?? "",
          ticket.createdAt ? new Date(ticket.createdAt).toISOString() : "",
          ticket.calledAt ? new Date(ticket.calledAt).toISOString() : "",
          ticket.servedAt ? new Date(ticket.servedAt).toISOString() : "",
          ticket.doneAt ? new Date(ticket.doneAt).toISOString() : "",
        ].join(",")
      )
    }
  }

  const blob = new Blob([rows.join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `queue-report-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SupervisorDashboard() {
  const { data, isLoading, mutate } = useAllOffices(3000)


  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-16 bg-foreground animate-pulse" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Loading Supervisor Dashboard
          </span>
        </div>
      </div>
    )
  }

  const offices: OfficeStat[] = data.offices || []
  const totalWaiting = offices.reduce((s, o) => s + o.queueDepth, 0)
  const totalServed = offices.reduce((s, o) => s + o.ticketsServed, 0)
  const totalActive = offices.reduce((s, o) => s + o.activeTickets, 0)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-foreground" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Supervisor Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {offices.length} offices
          </span>
          <button
            onClick={() => exportCSV(offices)}
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
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          {/* Office Manager Section */}
          <OfficeManager offices={offices} onMutate={() => mutate()} />

          {/* Office Rows */}
          {offices.map((stat) => (
            <OfficeRow key={stat.id} stat={stat} onMutate={() => mutate()} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center px-6 py-4 border-t border-border">
        <Link
          href="/"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          QueueFlow -- Back to Hub
        </Link>
      </footer>
    </div>
  )
}
