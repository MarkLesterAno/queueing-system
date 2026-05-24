import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center px-6 py-4 border-b border-border">
        <span className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
          QueueFlow
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-14">
        <div className="flex flex-col items-center gap-4 max-w-lg text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Multi-Office Queue Management
          </span>
          <h1 className="font-sans text-3xl md:text-4xl font-semibold text-foreground text-balance leading-tight">
            QueueFlow
          </h1>
          <p className="font-sans text-base text-muted-foreground leading-relaxed text-balance max-w-sm">
            Centralized ticket issuance. Per-office queue management.
            Real-time display boards. Administrator oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
          <Link
            href="/tenant"
            className="group flex flex-col gap-4 p-6 border border-border rounded-sm hover:border-foreground/20 transition-colors"
          >
            <span className="font-mono text-sm uppercase tracking-widest text-foreground">
              Enter QueueFlow
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              Sign in to your organization or start a new one.
            </span>
          </Link>

          <Link
            href="/invite"
            className="group flex flex-col gap-4 p-6 border border-border rounded-sm hover:border-foreground/20 transition-colors"
          >
            <span className="font-mono text-sm uppercase tracking-widest text-foreground">
              New Organization
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              Have an invitation? Set up your organization here.
            </span>
          </Link>
        </div>
      </main>

      <footer className="flex items-center justify-center px-6 py-4 border-t border-border">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
          QueueFlow
        </span>
      </footer>
    </div>
  )
}
