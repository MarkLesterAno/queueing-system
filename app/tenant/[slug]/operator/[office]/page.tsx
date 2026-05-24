"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getOrgIdFromSlug, getStoredOffices, getStoredOfficeById } from "@/lib/actions"
import { verifyOperatorPinByOffice } from "@/lib/operator-actions"
import PinEntry from "@/components/pin-entry"
import OfficeAdminDashboard from "@/components/operator-dashboard"

export default function OperatorOfficePage() {
  const params = useParams()
  const slug = params.slug as string
  const officeId = params.office as string
  const [office, setOffice] = useState<any>(null)
  const [orgId, setOrgId] = useState("")
  const [allOffices, setAllOffices] = useState<{ id: string; name: string; abbreviation: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const load = async () => {
      const oid = await getOrgIdFromSlug(slug)
      setOrgId(oid)
      const [off, offs] = await Promise.all([
        getStoredOfficeById(officeId, oid),
        getStoredOffices(oid),
      ])
      if (!off) {
        setError("Office not found")
        setLoading(false)
        return
      }
      setOffice(off)
      setAllOffices(offs.map((o) => ({ id: o.id, name: o.name, abbreviation: o.abbreviation })))
      setLoading(false)
    }
    load()
  }, [slug, officeId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Loading...</span>
      </div>
    )
  }

  if (error || !office) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="font-mono text-xs text-destructive uppercase tracking-widest block mb-2">Error</span>
          <span className="font-mono text-xs text-muted-foreground">{error || "Office not found"}</span>
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
        verifyFn={async (pin: string) => verifyOperatorPinByOffice(officeId, pin, orgId)}
      />
    )
  }

  return (
    <OfficeAdminDashboard
      officeId={officeId}
      officeName={office.name}
      color={office.color}
      allOffices={allOffices}
    />
  )
}
