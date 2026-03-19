"use client"

import { useState, useEffect } from "react"
import { getOffice } from "@/lib/queue"
import PinEntry from "@/components/pin-entry"
import OfficeAdminDashboard from "@/components/admin-dashboard"

export default function OfficeAdminPage({
  params,
}: {
  params: Promise<{ office: string }>
}) {
  const [officeId, setOfficeId] = useState("")
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    params.then((p) => setOfficeId(p.office))
  }, [params])

  const office = getOffice(officeId)

  if (!officeId || !office) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Loading...
        </span>
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
