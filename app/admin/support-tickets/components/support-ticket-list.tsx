"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, RefreshCw, Trash2 } from "lucide-react"
import type { SupportTicket } from "@/types/supportTickets"

const statusConfig: Record<string, { color: string }> = {
  open: { color: "bg-blue-100 text-blue-800" },
  "in-progress": { color: "bg-amber-100 text-amber-800" },
  "on-hold": { color: "bg-purple-100 text-purple-800" },
  closed: { color: "bg-emerald-100 text-emerald-800" },
  cancelled: { color: "bg-rose-100 text-rose-800" },
}

const priorityConfig: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
}

const formatDate = (value?: string) => {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

interface SupportTicketListProps {
  tickets: SupportTicket[]
  onEdit?: (ticket: SupportTicket) => void
  onView?: (ticket: SupportTicket) => void
  onDelete?: (ticket: SupportTicket) => void
  onChangeStatus?: (ticket: SupportTicket) => void
  emptyLabel?: React.ReactNode
}

export function SupportTicketList({
  tickets,
  onEdit,
  onView,
  onDelete,
  onChangeStatus,
  emptyLabel,
}: SupportTicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        {emptyLabel ?? "No tickets match the current filters."}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticket ID</TableHead>
          <TableHead>Ticket</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => {
          const normalizedStatus = ticket.status?.toLowerCase().replace(" ", "-") ?? "open"
          const statusMeta = statusConfig[normalizedStatus] ?? statusConfig.open
          const normalizedPriority = (ticket.priority ?? "medium").toLowerCase()
          const priorityMeta = priorityConfig[normalizedPriority] ?? priorityConfig.medium
          const progress = ticket.progress ?? 0

          return (
            <TableRow key={ticket.ticket_id ?? ticket.id} className="align-middle">
              <TableCell className="font-semibold text-gray-700">{ticket.ticket_id}</TableCell>
              <TableCell>
                <p className="text-sm font-semibold text-gray-900">{ticket.subject}</p>
                <p className="text-xs text-gray-500">{ticket.department}</p>
              </TableCell>
              <TableCell>{ticket.assigned_to ?? "Unassigned"}</TableCell>
              <TableCell>{formatDate(ticket.due_date ?? ticket.updated_at ?? ticket.created_at)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`${statusMeta.color} px-3 py-1 text-xs`}> 
                  {ticket.status ?? "Open"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${priorityMeta} px-3 py-1 text-xs`}> 
                  {ticket.priority ?? "Medium"}
                </Badge>
              </TableCell>
              <TableCell>{`${progress}%`}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onView?.(ticket)}
                    title="View Ticket"
                    className="text-gray-600 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit?.(ticket)}
                    disabled={!onEdit}
                    title="Edit Ticket"
                    className="text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {onChangeStatus && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onChangeStatus(ticket)}
                      title="Change Status"
                      className="text-green-600 hover:bg-green-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete?.(ticket)}
                    disabled={!onDelete}
                    title="Delete Ticket"
                    className="text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
