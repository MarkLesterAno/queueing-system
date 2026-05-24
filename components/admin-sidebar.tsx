"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { signOut } from "@/lib/auth-actions"
import {
  LayoutDashboard, Building2, Users, Settings, LogOut,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "offices", label: "Offices", icon: Building2 },
  { href: "operators", label: "Operators", icon: Users },
  { href: "settings", label: "Settings", icon: Settings },
]

export default function AdminSidebar() {
  const params = useParams()
  const slug = params.slug as string

  return (
    <aside className="w-56 border-r border-border bg-secondary/30 flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <Link href={`/tenant/${slug}/dashboard`} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {slug}
          </span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={`/tenant/${slug}/${item.href}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => signOut(slug)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-sm font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}
