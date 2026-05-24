"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { signIn } from "@/lib/auth-actions"

export default function TenantLoginPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.set("email", email)
    formData.set("password", password)
    formData.set("slug", slug)

    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-foreground" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {slug} — Administrator
            </span>
          </div>
          <h1 className="font-sans text-2xl font-semibold text-foreground mb-2">Sign In</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-secondary border border-border rounded-sm font-mono text-sm text-foreground"
            />
          </div>

          {error && <p className="text-sm text-destructive font-mono">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/tenant" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Different Organization
          </a>
        </div>
      </div>
    </div>
  )
}
