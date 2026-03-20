"use client"

import { useState, useEffect } from "react"
import PinEntry from "@/components/pin-entry"
import OfficeAdminDashboard from "@/components/admin-dashboard"
import type { Office } from "@/lib/queue"

export default function OfficeAdminPage({
  params,
}: {
  params: Promise<{ office: string }>
}) {
  const [officeId, setOfficeId] = useState("")
  const [office, setOffice] = useState<Office | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    params.then(async (p) => {
      setOfficeId(p.office)
      try {
        const res = await fetch(`/api/queue/${p.office}`)
        if (!res.ok) {
          setError("Office not found")
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
        console.error("[v0] Failed to fetch office:", err)
        setError("Failed to load office")
        setLoading(false)
      }
    })
  }, [params])

  if (loading || !officeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Loading...
        </span>
      </div>
    )
  }

  if (error || !office) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="font-mono text-xs text-destructive uppercase tracking-widest block mb-2">
            Error
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {error || "Office not found"}
          </span>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <PinEntry
        officeId={officeId}
        officeName={office.name}
        color={office.color}
        onSuccess={() => setAuthenticated(true)}
      />
    )
  }

  return (
    <OfficeAdminDashboard
      officeId={officeId}
      officeName={office.name}
      color={office.color}
    />
  )
}
