"use client"

import { useAllOffices } from "@/hooks/use-queue"

import Link from "next/link"

export default function WelcomeDashboard() {
  const { data, isLoading, mutate } = useAllOffices(3000)
 
   if (isLoading || !data) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
           <div className="h-1 w-16 bg-foreground animate-pulse" />
           <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
             Loading...
           </span>
         </div>
       </div>
     )
   }
   const offices: IOfficeStat[] = data.offices || []
  

  return (
   <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center px-6 py-4 border-b border-border">
        <span className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
          QueueFlow
        </span>
      </header>

      {/* Hero */}
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
            Real-time display boards. Supervisor oversight.
          </p>
        </div>

        {/* Navigation grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
          <Link
            href="/kiosk"
            className="group flex flex-col gap-4 p-6 border border-border rounded-sm hover:border-foreground/20 transition-colors"
          >
            <span className="font-mono text-sm uppercase tracking-widest text-foreground">
              Central Kiosk
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              Issue queue tickets for any office. Touch-friendly, fullscreen kiosk interface.
            </span>
          </Link>

          <Link
            href="/supervisor"
            className="group flex flex-col gap-4 p-6 border border-border rounded-sm hover:border-foreground/20 transition-colors"
          >
            <span className="font-mono text-sm uppercase tracking-widest text-foreground">
              Supervisor
            </span>
            <span className="text-xs text-muted-foreground leading-relaxed">
              Bird's-eye view of all offices. Manage counters and export reports.
            </span>
          </Link>
        </div>

        {/* Office quick links */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xl">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Office Quick Access
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
            {offices.map((office) => (
              <div
                key={office.id}
                className="flex flex-col gap-2 p-3 border border-border rounded-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: office.color }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {office.abbreviation}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/display/${office.id}`}
                    className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Display
                  </Link>
                  <span className="text-muted-foreground/30">|</span>
                  <Link
                    href={`/operator/${office.id}`}
                    className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Operate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center px-6 py-4 border-t border-border">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
          QueueFlow -- Powered by Vercel
        </span>
      </footer>
    </div>
  )
}
