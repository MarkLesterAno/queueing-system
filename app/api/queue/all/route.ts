import { NextRequest, NextResponse } from "next/server"
import { getAllOfficeStats } from "@/lib/actions"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orgId = searchParams.get("orgId") || undefined

  const stats = await getAllOfficeStats(orgId)
  return NextResponse.json({ offices: stats, timestamp: Date.now() })
}
