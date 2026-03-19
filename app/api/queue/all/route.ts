import { NextResponse } from "next/server"
import { getAllOfficeStats } from "@/lib/actions"

export const dynamic = "force-dynamic"

export async function GET() {
  const stats = await getAllOfficeStats()
  return NextResponse.json({ offices: stats, timestamp: Date.now() })
}
