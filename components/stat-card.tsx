"use client"

export function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className="font-mono text-lg tabular-nums"
        style={{ color: color || "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  )
}
