"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getOrgBySlug } from "@/lib/org-actions"

export default function TenantPage() {
  const router = useRouter()
  const [slug, setSlug] = useState("")
  const [step, setStep] = useState<"slug" | "role">("slug")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSlugSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "")
    const org = await getOrgBySlug(cleanSlug)

    if (!org) {
      setError("Organization not found. Check the slug or start a new one.")
      setLoading(false)
      return
    }

    sessionStorage.setItem("orgSlug", cleanSlug)
    setSlug(cleanSlug)
    setStep("role")
    setLoading(false)
  }

  const handleRoleSelect = (role: "operator" | "admin") => {
    const storedSlug = sessionStorage.getItem("orgSlug") || slug
    if (role === "operator") {
      router.push(`/tenant/${storedSlug}/operator`)
    } else {
      router.push(`/tenant/${storedSlug}/login`)
    }
  }

  if (step === "role") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="flex items-center px-6 py-4 border-b border-border">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            QueueFlow — {slug}
          </span>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full flex flex-col gap-4">
            <h1 className="font-sans text-xl font-semibold text-foreground text-center mb-4">
              Select Your Role
            </h1>

            <button
              onClick={() => handleRoleSelect("operator")}
              className="flex flex-col gap-3 p-6 border border-border rounded-sm hover:border-foreground/20 transition-colors text-left"
            >
              <span className="font-mono text-sm uppercase tracking-widest text-foreground">
                Operator
              </span>
              <span className="text-xs text-muted-foreground">
                Manage queues at your assigned office. Select an office and authenticate with your PIN.
              </span>
            </button>

            <button
              onClick={() => handleRoleSelect("admin")}
              className="flex flex-col gap-3 p-6 border border-border rounded-sm hover:border-foreground/20 transition-colors text-left"
            >
              <span className="font-mono text-sm uppercase tracking-widest text-foreground">
                Administrator
              </span>
              <span className="text-xs text-muted-foreground">
                Full oversight — manage offices, operators, view reports, and configure settings.
              </span>
            </button>

            <button
              onClick={() => { setStep("slug"); setError("") }}
              className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              Different Organization
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="font-sans text-2xl font-semibold text-foreground mb-2">Enter Your Organization</h1>
          <p className="text-sm text-muted-foreground">Enter your organization slug to get started.</p>
        </div>

        <form onSubmit={handleSlugSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Organization Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">queueflow.app/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-org"
                required
                className="flex-1 px-4 py-3 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive font-mono">{error}</p>}

          <button
            type="submit"
            disabled={loading || !slug}
            className="w-full py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "Looking up..." : "Continue"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
