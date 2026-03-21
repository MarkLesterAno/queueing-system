import { getOfficeTickets, getOfficeServing, getOfficeCounterCount, getStoredOffices } from "@/lib/actions"
import { getEstimatedWait } from "@/lib/queue"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ office: string }> }
) {
  const { office: officeId } = await params
  const offices = await getStoredOffices()
  const office = offices.find((o) => o.id === officeId)
  if (!office) {
    return new Response("Office not found", { status: 404 })
  }

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          closed = true
        }
      }

      const poll = async () => {
        if (closed) return

        try {
          const [tickets, serving, counterCount] = await Promise.all([
            getOfficeTickets(officeId),
            getOfficeServing(officeId),
            getOfficeCounterCount(officeId),
          ])

          const waiting = tickets.filter((t) => t.status === "waiting")
          const called = tickets.filter((t) => t.status === "called")
          const recall = tickets.filter((t) => t.status === "recall")
          const servingTickets = tickets.filter((t) => t.status === "serving")
          const done = tickets.filter((t) => t.status === "done")

          const counters: Record<number, { ticketId: string | null; status: string }> = {}
          for (let i = 1; i <= counterCount; i++) {
            counters[i] = {
              ticketId: serving[i] ?? null,
              status: serving[i] ? "active" : "idle",
            }
          }

          const nextUp = waiting.slice(0, 3).map((t, i) => ({
            id: t.id,
            position: i + 1,
            estimatedWait: getEstimatedWait(i + 1),
          }))

          send({
            office: { id: office.id, name: office.name, abbreviation: office.abbreviation, color: office.color },
            counters,
            counterCount,
            currentlyServing: [...called, ...recall, ...servingTickets],
            nextUp,
            waitingCount: waiting.length,
            totalServed: done.length,
            timestamp: Date.now(),
          })
        } catch {
          // ignore errors during polling
        }

        if (!closed) {
          setTimeout(poll, 2000)
        }
      }

      poll()

      request.signal.addEventListener("abort", () => {
        closed = true
        try { controller.close() } catch { /* already closed */ }
      })
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
