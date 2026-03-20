# QueueFlow -- Multi-Office Queue Management System

A modern, real-time queue management system for managing multiple service desks or office branches. QueueFlow provides centralized ticket issuance, per-office queue displays, operator controls, and supervisor oversight—all built on Next.js, Upstash Redis, and real-time Server-Sent Events.

## Features

- **Central Kiosk** (`/kiosk`) — Unified ticket issuance with a grid of office cards showing live queue depth and estimated wait times
- **Per-Office Display Boards** (`/display/[office]`) — Real-time public displays with current serving tickets and "Next Up" indicators, powered by SSE
- **Operator Panels** (`/operator/[office]`) — PIN-protected counter-specific control panel with actions: Call Next, Re-call, Serve, Complete, Hold, Skip
- **Counter Selection** — Organize multiple counters per office with a clean selector UI
- **Ticket Transfer** — Move completed tickets to other offices while maintaining unique ticket IDs (e.g., FI-001 stays FI-001)
- **Supervisor Dashboard** (`/supervisor`) — Bird's-eye view of all offices with queue metrics, idle counter tracking, and CSV export
- **Real-time Updates** — SWR polling and Server-Sent Events for instant queue synchronization

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Data Storage:** Upstash Redis (serverless)
- **Real-time:** Server-Sent Events (SSE) + SWR polling
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **Animations:** Framer Motion
- **Typography:** Figtree (headings), DM Mono (monospace)
- **Design:** Dark mode, Swiss graphic design aesthetic

## Project Structure

```
queueing-system/
├── app/
│   ├── api/
│   │   └── queue/
│   │       ├── [office]/
│   │       │   ├── route.ts          # GET/POST office queue state
│   │       │   └── stream/
│   │       │       └── route.ts      # SSE stream for real-time updates
│   │       └── all/
│   │           └── route.ts          # Aggregate all offices
│   ├── display/
│   │   └── [office]/
│   │       └── page.tsx              # Public display board
│   ├── kiosk/
│   │   └── page.tsx                  # Central ticket issuance
│   ├── operator/
│   │   └── [office]/
│   │       └── page.tsx              # Operator panel
│   ├── supervisor/
│   │   └── page.tsx                  # Supervisor dashboard
│   ├── page.tsx                      # Homepage / hub
│   ├── layout.tsx                    # Root layout with fonts & metadata
│   └── globals.css                   # Design tokens & Tailwind setup
├── components/
│   ├── admin-dashboard.tsx           # Counter panel & ticket controls
│   ├── pin-entry.tsx                 # PIN authentication modal
│   ├── supervisor-dashboard.tsx      # Office metrics & management
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── redis.ts                      # Redis client initialization
│   ├── queue.ts                      # Types, office config, helpers
│   ├── actions.ts                    # Server actions (ticket operations)
│   └── utils.ts                      # Utility functions
├── hooks/
│   └── use-queue.ts                  # SWR hook for queue polling
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Office Configuration

Eight offices are pre-configured in `lib/queue.ts`:

| Office | Prefix | Abbreviation | Color | Counters | PIN Env |
|--------|--------|--------------|-------|----------|---------|
| Human Resources | HR | HR | Green (#5B8C6A) | 2 | `ADMIN_PIN_HR` |
| Finance | FIN | FIN | Orange (#C4845C) | 3 | `ADMIN_PIN_FIN` |
| Registrar | REG | REG | Blue (#7A8CBE) | 2 | `ADMIN_PIN_REG` |
| Cashier | CSH | CSH | Pink (#B57B9E) | 2 | `ADMIN_PIN_CSH` |
| Records | REC | REC | Olive (#8B9E6B) | 2 | `ADMIN_PIN_REC` |
| Legal Affairs | LGL | LGL | Tan (#9E8B6B) | 1 | `ADMIN_PIN_LGL` |
| Permits & Licensing | PRM | PRM | Slate (#6B8B9E) | 2 | `ADMIN_PIN_PRM` |
| Administration | ADM | ADM | Brown (#8B6B6B) | 1 | `ADMIN_PIN_ADM` |

To modify office counts, names, or colors, edit the `OFFICES` array in `lib/queue.ts`.

## Setup & Installation

### Prerequisites

- Node.js 18+ (recommend 20 LTS)
- Upstash Redis instance (free tier available)
- Environment variables configured

### Install Dependencies

```bash
pnpm install
# or npm install / yarn install / bun install
```

### Environment Variables

Create a `.env.local` file with:

```env
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=xxxxx
ADMIN_PIN=1234
ADMIN_PIN_HR=1234
ADMIN_PIN_FIN=1234
ADMIN_PIN_REG=1234
ADMIN_PIN_CSH=1234
ADMIN_PIN_REC=1234
ADMIN_PIN_LGL=1234
ADMIN_PIN_PRM=1234
ADMIN_PIN_ADM=1234
```

**Note:** `ADMIN_PIN` is the universal operator PIN for development. Per-office PINs override this if set. The supervisor dashboard also uses `ADMIN_PIN`.

### Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Usage Guide

### For Visitors (Central Kiosk)

1. Navigate to `/kiosk`
2. Tap the office card for your service area
3. Tap "Get Ticket" to receive a queue number (e.g., FI-042)
4. Watch the display board to monitor your position and counter assignment

**Kiosk Auto-reset:** After 30 seconds of inactivity, the kiosk returns to the office grid.

### For Operators (Counter Staff)

1. Navigate to `/operator/[office]` (e.g., `/operator/finance`)
2. Enter the 4-digit PIN and confirm
3. Select your counter from the header selector (if multiple)
4. Manage your counter:
   - **Call Next** — Move waiting → called
   - **Serve** — Mark as being served at your counter
   - **Complete** — Mark ticket as done
   - **Hold** — Pause service (e.g., pending documents)
   - **Transfer** — Move done ticket to another office (creates new ticket with same ID)
   - **Skip** — Skip a ticket without serving

The queue list on the right shows all tickets with their current status.

### For Display (Public Boards)

1. Navigate to `/display/[office]` (e.g., `/display/hr`)
2. Display board shows:
   - **Now Serving** — Counter assignments (e.g., "Counter 1: HR-001")
   - **Next Up** — First waiting ticket
   - Live updates via SSE every 1–2 seconds

Mount this view on office TVs or kiosks for customers to monitor their position.

### For Supervisors (Management)

1. Navigate to `/supervisor`
2. Enter the supervisor PIN and confirm
3. View the dashboard:
   - **Office cards** — Real-time queue depth, avg wait, served count
   - **Counter management** — Add/remove counters per office
   - **Idle counters** — Identify staffing gaps
   - **Reset office** — Clear queue for an office
   - **Export CSV** — Download full queue history

## API Endpoints

### `GET /api/queue/[office]`
Fetch current queue state for an office.

**Response:**
```json
{
  "tickets": [
    {
      "id": "FIN-042",
      "seq": 42,
      "officeId": "finance",
      "status": "serving",
      "counter": 2,
      "createdAt": 1234567890,
      "calledAt": 1234567900,
      "servedAt": 1234567910,
      "doneAt": null
    }
  ],
  "counters": {
    "1": null,
    "2": "FIN-042"
  },
  "counterCount": 3,
  "waitingCount": 5,
  "servedCount": 37
}
```

### `POST /api/queue/[office]`
Perform an action on the office queue.

**Body:**
```json
{
  "action": "callNext|serve|complete|skip|hold|transfer",
  "counterNum": 2,
  "ticketId": "FIN-042",
  "toOfficeId": "hr"  // required for transfer
}
```

### `GET /api/queue/[office]/stream`
Server-Sent Events stream for real-time updates.

```javascript
const eventSource = new EventSource('/api/queue/finance/stream')
eventSource.onmessage = (e) => {
  const data = JSON.parse(e.data)
  console.log('Queue updated:', data)
}
```

### `GET /api/queue/all`
Fetch all offices' aggregate state (used by supervisor).

## Ticket Lifecycle

1. **Waiting** — Newly issued, waiting to be called
2. **Called** — Operator called the ticket (announced to customer)
3. **Serving** — Ticket at a counter, being served
4. **Done** — Service complete, eligible for transfer or dismissal
5. **Hold** — Temporarily paused (e.g., waiting for documents)
6. **Skipped** — Ticket skipped by operator, returned to waiting

**Transfer Flow:**
- Operator marks ticket as **Done**
- Taps "Transfer to Office" button
- Selects destination office from modal
- Ticket is removed from source office, added to destination as a fresh **Waiting** ticket
- **Same ticket ID is maintained** (e.g., FI-001 → FI-001 in new office)

## Design System

### Colors

- **Primary (Accent):** #F5A623 (Amber)
- **Background:** #0A0A0A (Black)
- **Foreground:** #F0EDE8 (Off-white)
- **Card:** #111111 (Dark gray)
- **Border:** #222222
- **Muted:** #6B6B6B
- **Office Colors:** Unique per office (see config table)

### Typography

- **Headings:** Figtree (sans-serif, 400–600 weight)
- **Body:** Figtree (sans-serif)
- **Monospace:** DM Mono (numbers, codes, labels)

### Tailwind v4
Uses semantic design tokens (`--color-*`, `--radius`) in `globals.css`. Prefer gap over margin/padding spacing.

## Redis Data Model

All state is stored in Upstash Redis, scoped per office:

```
queue:{office}:tickets       → JSON array of Ticket objects
queue:{office}:next_seq      → Integer (next ticket sequence)
queue:{office}:serving       → JSON object (counter → ticket ID map)
queue:{office}:counters      → Integer (active counter count)
```

## Troubleshooting

### "ADMIN_PIN not found" error
Ensure `ADMIN_PIN` is set in `.env.local`. Also check that the environment variable is properly loaded by restarting the dev server.

### Queue updates not syncing
- Check Redis connection: verify `KV_REST_API_URL` and `KV_REST_API_TOKEN`
- For display boards: ensure SSE stream is active in browser DevTools (Network tab)
- For operators: SWR polling runs every 1.5 seconds; manual refresh works too

### Supervisor PIN not working
Supervisors use `ADMIN_PIN` only (not per-office PINs). Ensure it's set and matches your entry.

### Ticket not appearing in destination office after transfer
- Verify the destination office ID is correct
- Check Redis keys in Upstash console for data presence
- Manually refresh the operator panel

## Development Tips

- **Testing offices:** Use the kiosk to issue tickets, then switch between operator/display views
- **Console logging:** Add `console.log("[v0] ...")` for debugging; search `[v0]` in DevTools
- **Mocking delays:** API routes are instant; add `await new Promise(r => setTimeout(r, 500))` for testing UI states
- **Redis inspection:** Visit Upstash console to inspect/clear data during development

## Performance Considerations

- **SWR polling:** 1.5-2 second interval balances responsiveness vs. API load
- **SSE streams:** Used for public displays to reduce polling; scales linearly with display count
- **Redis:** Upstash free tier supports ~1000s RPS; sufficient for 8 offices with modest load
- **Next.js:** Deployed on Vercel for zero-config edge caching and auto-scaling

## Contributing

When modifying the system:

1. Update `lib/queue.ts` for new offices or ticket states
2. Update `lib/actions.ts` for new queue operations
3. Update API routes in `app/api/queue/` if needed
4. Test all three roles: operator, supervisor, customer (kiosk)
5. Verify SSE streams still work after changes

## License

Private project. Owned by MarkLesterAno.

---

**Need help?** Check the [GitHub issues](https://github.com/MarkLesterAno/queueing-system) or open a PR.
