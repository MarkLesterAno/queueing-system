"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getOrgIdFromSlug, getStoredOffices, issueTicket } from "@/lib/actions"
import { getEstimatedWait } from "@/lib/queue"
import type { Ticket } from "@/lib/queue"
import { motion } from "framer-motion"

export default function TenantKioskPage() {
  const params = useParams()
  const slug = params.slug as string
  const [offices, setOffices] = useState<any[]>([])
  const [orgId, setOrgId] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedOffice, setSelectedOffice] = useState<any>(null)
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null)
  const [isIssuing, setIsIssuing] = useState(false)

  useEffect(() => {
    const load = async () => {
      const oid = await getOrgIdFromSlug(slug)
      setOrgId(oid)
      const offs = await getStoredOffices(oid)
      setOffices(offs)
      setLoading(false)
    }
    load()
  }, [slug])

  useEffect(() => {
    if (!issuedTicket) return
    const timer = setTimeout(() => {
      setIssuedTicket(null)
      setSelectedOffice(null)
    }, 30000)
    return () => clearTimeout(timer)
  }, [issuedTicket])

  const handleSelectOffice = async (office: any) => {
    setSelectedOffice(office)
    setIsIssuing(true)
    try {
      const ticket = await issueTicket(office.id)
      if (ticket) setIssuedTicket(ticket)
    } finally { setIsIssuing(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</span>
      </div>
    )
  }

  if (issuedTicket && selectedOffice) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-background">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-10 max-w-md w-full">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedOffice.color }} />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{selectedOffice.name}</span>
          </div>

          <div className="w-full border border-border rounded-sm overflow-hidden">
            <div className="bg-secondary px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Your Ticket</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: selectedOffice.color }}>Issued</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 py-14 px-6">
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-2">
                <span className="font-mono text-lg uppercase tracking-widest" style={{ color: selectedOffice.color }}>{selectedOffice.prefix}</span>
                <span className="font-mono font-medium tabular-nums" style={{ fontSize: "clamp(4rem, 15vw, 8rem)", lineHeight: 1, color: selectedOffice.color }}>
                  {String(issuedTicket.seq).padStart(3, "0")}
                </span>
              </motion.div>
            </div>
            <div className="border-t border-dashed border-border mx-4" />
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Ticket</span>
                <span className="font-mono text-sm text-foreground">{issuedTicket.id}</span>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Time</span>
                <span className="font-mono text-sm text-foreground tabular-nums">
                  {new Date(issuedTicket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center font-mono leading-relaxed max-w-xs">
            Please proceed to the {selectedOffice.name} waiting area. Your number will be displayed when called.
          </p>

          <button onClick={() => { setIssuedTicket(null); setSelectedOffice(null) }}
            className="font-mono text-xs text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors py-2">
            Issue Another Ticket
          </button>
        </motion.div>
      </motion.div>
    )
  }

  if (isIssuing && selectedOffice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="h-1 w-16 animate-pulse" style={{ backgroundColor: selectedOffice.color }} />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Issuing Ticket</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{slug} — Kiosk</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </header>

      <div className="flex flex-col items-center gap-3 px-6 pt-10 pb-8 md:pt-16 md:pb-12">
        <h1 className="font-sans text-2xl md:text-3xl font-semibold text-foreground text-center text-balance">Select Your Destination</h1>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Tap an office to receive your queue ticket</p>
      </div>

      <main className="flex-1 px-6 pb-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {offices.map((office) => (
            <motion.button
              key={office.id}
              onClick={() => handleSelectOffice(office)}
              whileTap={{ scale: 0.97 }}
              className="group flex flex-col justify-between p-6 md:p-8 border border-border rounded-sm hover:border-foreground/20 transition-colors text-left"
              style={{ minHeight: "160px" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-medium uppercase tracking-widest" style={{ color: office.color }}>
                    {office.abbreviation}
                  </span>
                  <span className="font-sans text-base text-foreground font-medium leading-tight">{office.name}</span>
                </div>
              </div>
              <div className="flex items-end justify-between mt-6">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">In queue</span>
                  <span className="font-mono text-sm text-foreground tabular-nums">0</span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Est. wait</span>
                  <span className="font-mono text-sm text-foreground tabular-nums">{getEstimatedWait(0)}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      <footer className="flex items-center justify-center px-6 py-4 border-t border-border">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">QueueFlow — Kiosk</span>
      </footer>
    </div>
  )
}
