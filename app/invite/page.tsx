"use client"

import { useState } from "react"
import { sendInvitation } from "@/lib/invite-actions"
import Link from "next/link"

export default function InvitePage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await sendInvitation(email)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="font-sans text-2xl font-semibold text-foreground mb-4">Invitation Sent</h1>
          <p className="text-muted-foreground mb-8">
            Check your email at <strong>{email}</strong> for the invitation link to set up your organization.
          </p>
          <Link href="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="font-sans text-2xl font-semibold text-foreground mb-2">New Organization</h1>
          <p className="text-sm text-muted-foreground">Enter your email to receive an invitation link.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          {error && <p className="text-sm text-destructive font-mono">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "Sending..." : "Send Invitation"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
