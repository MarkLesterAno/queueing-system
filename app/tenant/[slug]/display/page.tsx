"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { getOrgIdFromSlug, getStoredOffices } from "@/lib/actions"
import TextToSpeech from "@/components/tts-narrator"
import { getEstimatedWait } from "@/lib/queue"

interface DisplayData {
  office: { id: string; name: string; abbreviation: string; color: string }
  counters: Record<number, { ticketId: string | null; status: string }>
  counterCount: number
  nextUp: { id: string; position: number; estimatedWait: string }[]
  waitingCount: number
  currentlyServing: any[]
  totalServed: number
  timestamp: number
}

function useSSE(officeId: string, orgId?: string) {
  const [data, setData] = useState<DisplayData | null>(null)
  const retryRef = useRef(0)

  useEffect(() => {
    let es: EventSource | null = null
    let closed = false

    const url = orgId
      ? `/api/queue/${officeId}/stream?orgId=${encodeURIComponent(orgId)}`
      : `/api/queue/${officeId}/stream`

    const connect = () => {
      if (closed) return
      es = new EventSource(url)
      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          setData(parsed)
          retryRef.current = 0
        } catch {}
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
    return () => { closed = true; es?.close() }
  }, [officeId, orgId])

  return data
}

function CounterDisplay({ counterNum, ticketId, status, color }: {
  counterNum: number; ticketId: string | null; status: string; color: string
}) {
  const prefix = ticketId ? ticketId.split("-")[0] : null
  const num = ticketId ? ticketId.split("-")[1] : "null"

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
              <span className="font-mono text-lg uppercase tracking-widest" style={{ color }}>{prefix}</span>
              <span className="font-mono font-medium tabular-nums" style={{ fontSize: "clamp(4rem, 12vw, 9rem)", lineHeight: 1, color }}>
                {num}
              </span>
            </>
          ) : (
            <span className="font-mono text-3xl text-muted-foreground/30">---</span>
          )}
        </motion.div>
      </AnimatePresence>
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: status === "active" ? color : "var(--muted-foreground)" }}>
        {status === "active" ? "Now Serving" : "Idle"}
      </span>
    </div>
  )
}

export default function OfficeDisplayPage() {
  const params = useParams()
  const slug = params.slug as string
  const [selectedOffice, setSelectedOffice] = useState<string>("")
  const [offices, setOffices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const load = async () => {
      const oid = await getOrgIdFromSlug(slug)
      setOrgId(oid)
      const offs = await getStoredOffices(oid)
      setOffices(offs)
      if (offs.length > 0) setSelectedOffice(offs[0].id)
      setLoading(false)
    }
    load()
  }, [slug])

  const data = useSSE(selectedOffice, orgId)
  const currentOffice = offices.find((o) => o.id === selectedOffice)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with office selector */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          {currentOffice && (
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: currentOffice.color }} />
          )}
          <div className="flex gap-2">
            {offices.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOffice(o.id)}
                className={`px-3 py-1.5 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors ${
                  selectedOffice === o.id
                    ? "text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
                style={selectedOffice === o.id ? { backgroundColor: o.color } : undefined}
              >
                {o.abbreviation}
              </button>
            ))}
          </div>
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
        {data && currentOffice ? (
          <div className="grid grid-cols-4 gap-4 w-full ">
            {Array.from({ length: data.counterCount }, (_, i) => i + 1).map((num) => (
              <div key={num} className="p-4 flex flex-col items-center justify-center">
                <CounterDisplay
                  counterNum={num}
                  ticketId={data.counters[num]?.ticketId ?? null}
                  status={data.counters[num]?.status ?? "idle"}
                  color={currentOffice.color}
                />
                <TextToSpeech
                  text={data.counters[num]?.ticketId || ""}
                  recall={data.currentlyServing.find((t: any) => t.counter === num)?.calledAt || 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              {!selectedOffice ? "Select an office" : "Connecting..."}
            </span>
          </div>
        )}
      </main>

      {/* Next up strip */}
      {data && (
        <section className="border-t border-border">
          <div className="flex items-center gap-3 px-6 py-2 border-b border-border/50">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Next Up</span>
          </div>
          <div className="flex items-center gap-0 divide-x divide-border">
            {data.nextUp.length === 0 ? (
              <div className="text-center py-5 w-full text-muted-foreground font-mono text-sm">No tickets in queue</div>
            ) : (
              data.nextUp.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 px-6 py-4 flex-1"
                >
                  <span className="font-mono text-xl tabular-nums text-foreground">{ticket.id}</span>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{ticket.estimatedWait}</span>
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-3 border-t border-border bg-secondary/30">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
          QueueFlow — {currentOffice?.abbreviation || slug} Display
        </span>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </footer>
    </div>
  )
}
