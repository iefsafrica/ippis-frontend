"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { SupportTicketsShell } from "../components/support-tickets-shell"
import { SupportTicketList } from "../components/support-ticket-list"
import { useGetSupportTickets } from "@/services/hooks/supportTickets"
import { SUPPORT_TICKET_MOCKS } from "../data/mock-tickets"
import type { SupportTicket } from "@/types/supportTickets"

const CURRENT_USER = "Sarah Johnson"

export default function MyTicketsContent() {
  const [activeTab, setActiveTab] = useState("assigned")
  const [searchTerm, setSearchTerm] = useState("")

  const { data } = useGetSupportTickets()
  const tickets = data?.data?.tickets ?? SUPPORT_TICKET_MOCKS

  const assignedToMe = useMemo(
    () => tickets.filter((ticket) => ticket.assigned_to === CURRENT_USER).length,
    [tickets],
  )
  const createdByMe = useMemo(
    () => tickets.filter((ticket) => ticket.created_by === CURRENT_USER).length,
    [tickets],
  )
  const openTickets = useMemo(
    () => tickets.filter((ticket) => (ticket.status ?? "").toLowerCase().includes("open")).length,
    [tickets],
  )

  const stats = [
    { label: "Assigned To Me", value: assignedToMe, subtitle: "Active tickets" },
    { label: "Created By Me", value: createdByMe, subtitle: "Requests you logged" },
    { label: "Open Tickets", value: openTickets, subtitle: "Awaiting response" },
  ]

  const baseTabMap = useMemo(
    () => ({
      all: tickets,
      assigned: tickets.filter((ticket) => ticket.assigned_to === CURRENT_USER),
      created: tickets.filter((ticket) => ticket.created_by === CURRENT_USER),
    }),
    [tickets],
  )

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const applySearch = (items: SupportTicket[]) => {
    if (!normalizedSearch) return items
    return items.filter((ticket) =>
      [ticket.subject, ticket.ticket_id, ticket.description]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch)),
    )
  }

  const shellActions = (
    <Button className="gap-2 bg-[#008751] hover:bg-[#007545]" size="sm">
      <Plus className="h-4 w-4" />
      Create Ticket
    </Button>
  )

  return (
    <SupportTicketsShell
      title="My Tickets"
      description="Quickly surface help requests you are handling or logged yourself."
      stats={stats}
      actions={shellActions}
    >
      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Personal queue</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            placeholder="Search within my tickets"
            className="max-w-md"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="assigned">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({tickets.length})</TabsTrigger>
              <TabsTrigger value="assigned">Assigned ({assignedToMe})</TabsTrigger>
              <TabsTrigger value="created">Created ({createdByMe})</TabsTrigger>
            </TabsList>
            {(["all", "assigned", "created"] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-4">
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <SupportTicketList tickets={applySearch(baseTabMap[tab])} emptyLabel="No tickets here yet." />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </SupportTicketsShell>
  )
}
