"use client"

import { useOfficeQueue } from "@/hooks/use-queue"
import {
  callNext,
  recallTicket,
  serveTicket,
  completeTicket,
  skipTicket,
  holdTicket,
  resetOfficeQueue,
  transferTicket,
} from "@/lib/actions"
import type { Ticket, TicketStatus } from "@/lib/queue"
import { OFFICES } from "@/lib/queue"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const STATUS_STYLES: Record<TicketStatus, string> = {
  waiting: "bg-secondary text-muted-foreground",
  called: "bg-primary/20 text-primary",
  serving: "bg-primary text-primary-foreground",
  done: "bg-secondary/50 text-muted-foreground/50",
  skipped: "bg-destructive/20 text-destructive",
  hold: "bg-amber/15 text-amber",
}

function TransferModal({
  ticket,
  currentOfficeId,
  isOpen,
  onClose,
  onTransfer,
}: {
  ticket: Ticket
  currentOfficeId: string
  isOpen: boolean
  onClose: () => void
  onTransfer: (toOfficeId: string) => Promise<void>
}) {
  const [transferring, setTransferring] = useState(false)
  
  const otherOffices = OFFICES.filter((o) => o.id !== currentOfficeId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-sm max-w-md w-full">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-mono text-sm uppercase tracking-widest text-foreground">
            Transfer Ticket {ticket.id}
          </h2>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {otherOffices.map((office) => (
            <button
              key={office.id}
              onClick={async () => {
                setTransferring(true)
                await onTransfer(office.id)
                setTransferring(false)
                onClose()
              }}
              disabled={transferring}
              className="w-full flex items-center justify-between px-6 py-4 border-b border-border/50 hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <span className="font-mono text-sm text-foreground">
                {office.abbreviation}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {office.name}
              </span>
            </button>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-secondary text-muted-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:bg-border transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function CounterPanel({
  officeId,
  counterNum,
  currentTicketId,
  tickets,
  color,
  onMutate,
}: {
  officeId: string
  counterNum: number
  currentTicketId: string | null
  tickets: Ticket[]
  color: string
  onMutate: () => void
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const currentTicket = currentTicketId
    ? tickets.find((t) => t.id === currentTicketId)
    : null

  const wrap = async (key: string, fn: () => Promise<unknown>) => {
    setLoading(key)
    await fn()
    onMutate()
    setLoading(null)
  }

  const handleTransfer = async (toOfficeId: string) => {
    await transferTicket(officeId, toOfficeId, currentTicket!.id)
    setShowTransferModal(false)
    onMutate()
  }

  return (
    <div className="flex flex-col border border-border rounded-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-secondary border-b border-border">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Counter {counterNum}
        </span>
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: currentTicketId ? color : "var(--muted-foreground)", opacity: currentTicketId ? 1 : 0.3 }}
        />
      </div>

      <div className="flex flex-col items-center py-8 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTicketId ?? "none"}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            {currentTicket ? (
              <>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {currentTicket.status === "called" ? "Called" : "Serving"}
                </span>
                <span
                  className="font-mono text-4xl font-medium tabular-nums"
                  style={{ color }}
                >
                  {currentTicket.id}
                </span>
              </>
            ) : (
              <span className="font-mono text-lg text-muted-foreground/30">
                No ticket
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-1 p-3 border-t border-border">
        {!currentTicket ? (
          <button
            onClick={() => wrap("call", () => callNext(officeId, counterNum))}
            disabled={loading === "call"}
            className="flex items-center justify-center gap-2 py-3 rounded-sm font-mono text-xs uppercase tracking-widest transition-opacity disabled:opacity-50 text-primary-foreground"
            style={{ backgroundColor: color }}
          >
            {loading === "call" ? "Calling..." : "Call Next"}
          </button>
        ) : currentTicket.status === "called" ? (
          <div className="flex gap-1">
            <button
              onClick={() => wrap("serve", () => serveTicket(officeId, currentTicket.id))}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center py-3 rounded-sm font-mono text-xs uppercase tracking-widest disabled:opacity-50 text-primary-foreground"
              style={{ backgroundColor: color }}
            >
              {loading === "serve" ? "..." : "Serve"}
            </button>
            <button
              onClick={() => wrap("recall", () => recallTicket(officeId, currentTicket.id))}
              disabled={!!loading}
              className="flex items-center justify-center px-4 py-3 bg-secondary text-muted-foreground rounded-sm font-mono text-xs uppercase tracking-widest hover:bg-border transition-colors disabled:opacity-50"
            >
              Re-call
            </button>
            <button
              onClick={() => wrap("skip", () => skipTicket(officeId, currentTicket.id))}
              disabled={!!loading}
              className="flex items-center justify-center px-4 py-3 bg-secondary text-muted-foreground rounded-sm font-mono text-xs uppercase tracking-widest hover:bg-border transition-colors disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <button
                onClick={() => wrap("complete", () => completeTicket(officeId, currentTicket.id))}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center py-3 rounded-sm font-mono text-xs uppercase tracking-widest disabled:opacity-50 text-primary-foreground"
                style={{ backgroundColor: color }}
              >
                {loading === "complete" ? "..." : "Complete"}
              </button>
              <button
                onClick={() => setShowTransferModal(true)}
                disabled={!!loading}
                className="flex items-center justify-center px-4 py-3 bg-secondary text-muted-foreground rounded-sm font-mono text-xs uppercase tracking-widest hover:bg-border transition-colors disabled:opacity-50"
                title="Transfer to another office"
              >
                Transfer
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => wrap("hold", () => holdTicket(officeId, currentTicket.id))}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-secondary text-muted-foreground rounded-sm font-mono text-xs uppercase tracking-widest hover:bg-border transition-colors disabled:opacity-50"
              >
                Hold
              </button>
              <button
                onClick={() => wrap("callnext", () => callNext(officeId, counterNum))}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-secondary text-muted-foreground rounded-sm font-mono text-xs uppercase tracking-widest hover:bg-border transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <TransferModal
          ticket={currentTicket!}
          currentOfficeId={officeId}
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransfer}
        />
      </div>
    </div>
  )
}

function TicketList({
  tickets,
  officeId,
  color,
}: {
  tickets: Ticket[]
  officeId: string
  color: string
}) {
  const active = tickets.filter(
    (t) => t.status !== "done" && t.status !== "skipped"
  )
  const recent = tickets
    .filter((t) => t.status === "done" || t.status === "skipped")
    .slice(-10)
    .reverse()

  return (
    <div className="flex flex-col border border-border rounded-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-secondary border-b border-border">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Queue
        </span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {tickets.length} total
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {active.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between px-4 py-3 border-b border-border/50"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm tabular-nums text-foreground">
                {ticket.id}
              </span>
              {ticket.counter && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Counter {ticket.counter}
                </span>
              )}
            </div>
            <span
              className={`px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLES[ticket.status]}`}
            >
              {ticket.status}
            </span>
          </div>
        ))}

        {recent.length > 0 && (
          <>
            <div className="px-4 py-2 bg-secondary/30">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                Recent
              </span>
            </div>
            {recent.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between px-4 py-2 border-b border-border/30 opacity-50"
              >
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {ticket.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-wider ${STATUS_STYLES[ticket.status]}`}
                >
                  {ticket.status}
                </span>
              </div>
            ))}
          </>
        )}

        {tickets.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <span className="font-mono text-xs text-muted-foreground">
              No tickets yet
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OfficeAdminDashboard({
  officeId,
  officeName,
  color,
}: {
  officeId: string
  officeName: string
  color: string
}) {
  const { data, isLoading, mutate } = useOfficeQueue(officeId, 1500)
  const [resetting, setResetting] = useState(false)
  const [selectedCounter, setSelectedCounter] = useState<number | null>(null)

  const handleReset = async () => {
    if (!confirm(`Reset the entire ${officeName} queue? This cannot be undone.`))
      return
    setResetting(true)
    await resetOfficeQueue(officeId)
    mutate()
    setResetting(false)
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-16 animate-pulse" style={{ backgroundColor: color }} />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Loading
          </span>
        </div>
      </div>
    )
  }

  const counterCount = data.counterCount || 1
  const activeCounter = selectedCounter || 1

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex flex-col gap-4 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {officeName} -- Operator
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {data.waitingCount} waiting
            </span>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {counterCount > 1 && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Counter:
            </span>
            <div className="flex gap-2">
              {Array.from({ length: counterCount }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedCounter(num)}
                  className={`px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors ${
                    activeCounter === num
                      ? "text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-border"
                  }`}
                  style={
                    activeCounter === num
                      ? { backgroundColor: color }
                      : undefined
                  }
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <CounterPanel
            officeId={officeId}
            counterNum={activeCounter}
            currentTicketId={data.counters[activeCounter]?.ticketId ?? null}
            tickets={data.tickets || []}
            color={color}
            onMutate={() => mutate()}
          />
          <TicketList
            tickets={data.tickets || []}
            officeId={officeId}
            color={color}
          />
        </div>
      </main>
    </div>
  )
}
