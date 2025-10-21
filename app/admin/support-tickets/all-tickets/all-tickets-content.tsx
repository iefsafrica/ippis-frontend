"use client"

import { TicketTable } from "../components/ticket-table"

export default function AllTicketsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">All Support Tickets</h2>
        <p className="text-muted-foreground">Manage and track all support tickets in the system.</p>
      </div>

      <TicketTable />
    </div>
  )
}
