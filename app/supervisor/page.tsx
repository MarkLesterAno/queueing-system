"use client"

import { useState, useEffect } from "react"
import { verifySupervisorPin } from "@/lib/actions"
import PinEntry from "@/components/pin-entry"
import SupervisorDashboard from "@/components/supervisor-dashboard"

export default function SupervisorPage() {
  const [authenticated, setAuthenticated] = useState(false)

  if (!authenticated) {
    return (
      <PinEntry
        officeId="supervisor"
        officeName="Supervisor"
        color="#F0EDE8"
        onSuccess={() => setAuthenticated(true)}
        verifyFn={verifySupervisorPin}
      />
    )
  }

  return <SupervisorDashboard />
}
