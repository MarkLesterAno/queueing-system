 interface IOfficeStat {
    id: string;
    name: string;
    abbreviation: string;
    prefix: string;
    color: string;
    queueDepth: number;
    avgWaitMinutes: number;
    ticketsServed: number;
    activeTickets: number;
    totalCounters: number;
    idleCounters: number;
    tickets: Array<{
      id: string;
      seq: number;
      officeId: string;
      status: string;
      counter: number | null;
      createdAt: number;
      calledAt: number | null;
      servedAt: number | null;
      doneAt: number | null;
    }>;
  }