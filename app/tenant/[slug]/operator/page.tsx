"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getOrgIdFromSlug, getStoredOffices } from "@/lib/actions"
import { motion } from "framer-motion"

export default function OperatorSelectionPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [offices, setOffices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const oid = await getOrgIdFromSlug(slug)
      const offs = await getStoredOffices(oid)
      setOffices(offs)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center px-6 py-4 border-b border-border">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {slug} — Select Office
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="font-sans text-2xl font-semibold text-foreground mb-2">Select an Office</h1>
          <p className="text-sm text-muted-foreground">Choose the office you want to manage queues for.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
          {offices.map((office) => (
            <motion.button
              key={office.id}
              onClick={() => router.push(`/tenant/${slug}/operator/${office.id}`)}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col p-6 border border-border rounded-sm hover:border-foreground/20 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: office.color }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: office.color }}>
                  {office.abbreviation}
                </span>
              </div>
              <span className="font-sans text-sm text-foreground font-medium">{office.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground mt-2">{office.counters} counter{office.counters > 1 ? 's' : ''}</span>
            </motion.button>
          ))}
        </div>
      </main>

      <footer className="flex items-center justify-center px-6 py-4 border-t border-border">
        <a href="/tenant" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          Back
        </a>
      </footer>
    </div>
  )
}
