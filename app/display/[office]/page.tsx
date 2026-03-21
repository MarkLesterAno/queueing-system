"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TextToSpeech from "@/components/tts-narrator"
import type { Office } from "@/lib/queue"

interface DisplayData {
  office: { id: string; name: string; abbreviation: string; color: string }
  counters: Record<number, { ticketId: string | null; status: string }>
  counterCount: number
  nextUp: { id: string; position: number; estimatedWait: string }[]
  waitingCount: number
  totalServed: number
  timestamp: number
}

function useSSE(officeId: string) {
  const [data, setData] = useState<DisplayData | null>(null)
  const retryRef = useRef(0)

  useEffect(() => {
    let es: EventSource | null = null
    let closed = false

    const connect = () => {
      if (closed) return
      es = new EventSource(`/api/queue/${officeId}/stream`)

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          setData(parsed)
          retryRef.current = 0
        } catch { /* ignore parse errors */ }
      }

      es.onerror = () => {
        es?.close()
        if (!closed) {
          const delay = Math.min(1000 * 2 ** retryRef.current, 10000)
          retryRef.current++
          setTimeout(connect, delay)
        }
      }
    }

    connect()

    return () => {
      closed = true
      es?.close()
    }
  }, [officeId])

  return data
}

function CounterDisplay({
  counterNum,
  ticketId,
  status,
  color,
  recall
}: {
  counterNum: number
  ticketId: string | null
  status: string
  color: string
  recall: number
}) {
  // Parse prefix and number from ticket id like "HR-001"
  const prefix = ticketId ? ticketId.split("-")[0] : null
  const num = ticketId ? ticketId.split("-")[1] : null
  const tts = num ? num : ""

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-10 flex-1">
      <span className="font-mono text-[20px] uppercase tracking-[0.2em] text-muted-foreground">
        Counter {counterNum}
      </span>
      <AnimatePresence mode="wait">
        <motion.div
          key={ticketId ?? "idle"}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-1"
        >
          {ticketId ? (
            <>
              <span
                className="font-mono text-lg uppercase tracking-widest"
                style={{ color }}
              >
                {prefix}
              </span>
              <span
                className="font-mono font-medium tabular-nums"
                style={{ fontSize: "clamp(4rem, 12vw, 9rem)", lineHeight: 1, color }}
              >
                {num}
              </span>
            </>
          ) : (
            <span className="font-mono text-3xl text-muted-foreground/30">
              ---
            </span>
          )}
        </motion.div>
      </AnimatePresence>
      <TextToSpeech text={tts} recall={recall} />

      <span
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: status === "active" ? color : "var(--muted-foreground)" }}
      >
        {status === "active" ? "Now Serving" : "Idle"}
      </span>
    </div>
  )
}

export default function OfficeDisplayPage({
  params,
}: {
  params: Promise<{ office: string }>
}) {
  const [officeId, setOfficeId] = useState<string>("")
  const [office, setOffice] = useState<Office | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(async (p) => {
      setOfficeId(p.office)
      try {
        const res = await fetch(`/api/queue/${p.office}`)
        if (!res.ok) {
          setLoading(false)
          return
        }
        const data = await res.json()
        setOffice({
          id: data.office.id,
          name: data.office.name,
          abbreviation: data.office.abbreviation,
          prefix: data.office.prefix,
          color: data.office.color,
          counters: data.counterCount,
          pin: "ADMIN_PIN",
        })
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch office:", err)
        setLoading(false)
      }
    })
  }, [params])

  const data = useSSE(officeId)

  if (!officeId || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Loading...
        </span>
      </div>
    )
  }

  if (!office) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-mono text-xs text-destructive uppercase tracking-widest">
          Office not found
        </span>
      </div>
    )
  }

  const color = office.color

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {office.name}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {data ? `${data.waitingCount} waiting` : "--"}
          </span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {data ? `${data.totalServed} served` : "--"}
          </span>
        </div>
      </header>

      {/* Counter displays */}
      <main className="flex-1 flex items-center justify-center px-4">
        {data ? (
          <div className="flex flex-col md:flex-row items-stretch justify-center divide-y md:divide-y-0 md:divide-x divide-border w-full max-w-6xl">
            {Array.from({ length: data.counterCount }, (_, i) => i + 1).map(
              (num) => (
                <CounterDisplay
                  key={num}
                  counterNum={num}
                  ticketId={data.counters[num]?.ticketId ?? null}
                  status={data.counters[num]?.status ?? "idle"}
                  color={color}
                  recall={data.timestamp}
                />
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="h-1 w-16 animate-pulse" style={{ backgroundColor: color }} />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Connecting
            </span>
          </div>
        )}
      </main>

      {/* Next up strip */}
      {data && (
        <section className="border-t border-border">
          <div className="flex items-center gap-3 px-6 py-2 border-b border-border/50">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Next Up
            </span>
          </div>
          <div className="flex items-center gap-0 divide-x divide-border">
            {data.nextUp.length === 0 ? (
              <div className="text-center py-5 w-full text-muted-foreground font-mono text-sm">
                No tickets in queue
              </div>
            ) : (
              data.nextUp.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 px-6 py-4 flex-1"
                >
                  <span className="font-mono text-xl tabular-nums text-foreground">
                    {ticket.id}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    {ticket.estimatedWait}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-3 border-t border-border bg-secondary/30">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
          QueueFlow -- {office.abbreviation} Display
        </span>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </footer>
    </div>
  )
}
