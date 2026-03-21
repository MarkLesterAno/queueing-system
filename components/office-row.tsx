"use client"

import { useState } from "react"
import { setOfficeCounters, resetOfficeQueue } from "@/lib/actions"
import { StatCard } from "./stat-card"
import Link from "next/link"

interface OfficeStat {
  officeId: string
  name: string
  abbreviation: string
  color: string
  queueDepth: number
  avgWaitMinutes: number
  ticketsServed: number
  activeTickets: number
  totalCounters: number
  idleCounters: number
}

export function OfficeRow({
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
    await setOfficeCounters(stat.officeId, newCount)
    onMutate()
    setAdjusting(false)
  }

  const handleReset = async () => {
    if (!confirm(`Reset ${stat.name} queue? All tickets will be cleared.`))
      return
    await resetOfficeQueue(stat.officeId)
    onMutate()
  }

  return (
    <div className="flex flex-col border border-border rounded-sm overflow-hidden">
      {/* Header */}
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
            href={`/operator/${stat.officeId}`}
            className="px-2 py-1 rounded-sm border border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Operator
          </Link>
          <Link
            href={`/display/${stat.officeId}`}
            className="px-2 py-1 rounded-sm border border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Display
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 px-4 py-4 flex-wrap">
        <StatCard label="Queue Depth" value={stat.queueDepth} color={stat.color} />
        <StatCard label="Avg Wait" value={`${stat.avgWaitMinutes}m`} />
        <StatCard label="Served Today" value={stat.ticketsServed} />
        <StatCard
          label="Active"
          value={stat.activeTickets}
          color={stat.activeTickets > 0 ? stat.color : undefined}
        />

        {/* Counter Management */}
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
