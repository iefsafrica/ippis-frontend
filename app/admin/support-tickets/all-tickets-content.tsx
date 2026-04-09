"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { AdvancedSearch } from "@/app/admin/components/advanced-search"
import { SupportTicketsShell } from "./components/support-tickets-shell"
import { SupportTicketList } from "./components/support-ticket-list"
import { useCreateSupportTicket, useDeleteSupportTicket, useGetSupportTickets, useUpdateSupportTicket } from "@/services/hooks/supportTickets"
import ExportService from "@/app/admin/services/export-service"
import { toast } from "sonner"
import { Download, Plus } from "lucide-react"
import type { SupportTicket } from "@/types/supportTickets"

export default function AllTicketsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [advancedSearchParams, setAdvancedSearchParams] = useState<Record<string, string>>({})

  const { data, isLoading, isError } = useGetSupportTickets()
  const tickets = data?.data?.tickets ?? []

  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter((ticket) => (ticket.status ?? "").toLowerCase().includes("open")).length
    const highPriority = tickets.filter((ticket) => (ticket.priority ?? "").toLowerCase() === "high").length
    return [
      { label: "Total Tickets", value: total, subtitle: "Requests in the system" },
      { label: "Open & Active", value: open, subtitle: "Waiting on a response" },
      { label: "High Priority", value: highPriority, subtitle: "Escalations" },
    ]
  }, [tickets])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredTickets = useMemo(() => {
    const normalizeValue = (value: unknown) => String(value ?? "").toLowerCase()

    return tickets.filter((ticket) => {
      const matchesSearch =
        !normalizedSearch ||
        [ticket.subject, ticket.ticket_id, ticket.created_by, ticket.department]
          .filter(Boolean)
          .some((value) => normalizeValue(value).includes(normalizedSearch))

      const matchesAdvancedSearch = Object.entries(advancedSearchParams).every(([key, value]) => {
        if (!value?.trim()) return true
        return normalizeValue((ticket as Record<string, unknown>)[key]).includes(value.trim().toLowerCase())
      })

      return matchesSearch && matchesAdvancedSearch
    })
  }, [advancedSearchParams, normalizedSearch, tickets])

  const handleAdvancedSearch = (params: Record<string, string>) => {
    setAdvancedSearchParams(params)
  }

  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null)
  const [editTicket, setEditTicket] = useState<SupportTicket | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState<SupportTicket | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editSubject, setEditSubject] = useState("")
  const [editDepartment, setEditDepartment] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPriority, setEditPriority] = useState("medium")
  const [editStatus, setEditStatus] = useState("open")
  const [editAssignedTo, setEditAssignedTo] = useState("")
  const [editDueDate, setEditDueDate] = useState(new Date().toISOString().split("T")[0])
  const [editProgress, setEditProgress] = useState("0")

  const createTicket = useCreateSupportTicket()
  const updateTicket = useUpdateSupportTicket()
  const deleteTicket = useDeleteSupportTicket()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: "",
    department: "",
    description: "",
    priority: "medium",
    assigned_to: "",
    due_date: new Date().toISOString().split("T")[0],
    progress: 0,
  })

  const resetNewTicket = () => {
    setNewTicket({
      subject: "",
      department: "",
      description: "",
      priority: "medium",
      assigned_to: "",
      due_date: new Date().toISOString().split("T")[0],
      progress: 0,
    })
  }

  const handleView = (ticket: SupportTicket) => {
    setViewTicket(ticket)
    setIsViewOpen(true)
  }

  const handleEdit = (ticket: SupportTicket) => {
    setEditTicket(ticket)
    setEditSubject(ticket.subject ?? "")
    setEditDepartment(ticket.department ?? "")
    setEditDescription(ticket.description ?? "")
    setEditPriority(ticket.priority ?? "medium")
    setEditStatus(ticket.status ?? "open")
    setEditAssignedTo(ticket.assigned_to ?? "")
    setEditDueDate(ticket.due_date ?? new Date().toISOString().split("T")[0])
    setEditProgress(String(ticket.progress ?? 0))
    setIsEditOpen(true)
  }

  const handleDelete = (ticket: SupportTicket) => {
    setDeleteCandidate(ticket)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return

    try {
      await deleteTicket.mutateAsync(String(deleteCandidate.ticket_id))
      toast.success("Support ticket deleted")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete ticket")
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteCandidate(null)
    }
  }

  const handleOpenAdd = () => setIsAddOpen(true)

  const handleUpdateSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editTicket) return

    try {
      await updateTicket.mutateAsync({
        ticketId: String(editTicket.ticket_id),
        data: {
          subject: editSubject,
          department: editDepartment,
          description: editDescription,
          priority: editPriority,
          status: editStatus,
          assigned_to: editAssignedTo || undefined,
          due_date: editDueDate,
          progress: Number(editProgress),
        },
      })
      toast.success("Support ticket updated")
      setIsEditOpen(false)
      setEditTicket(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update ticket")
    }
  }

  const handleAddSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await createTicket.mutateAsync({
        subject: newTicket.subject,
        department: newTicket.department,
        description: newTicket.description,
        priority: newTicket.priority,
        assigned_to: newTicket.assigned_to || undefined,
        due_date: newTicket.due_date,
        progress: newTicket.progress,
      })
      toast.success("Support ticket created")
      resetNewTicket()
      setIsAddOpen(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to create ticket")
    }
  }

  const handleExport = () => {
    const columns = [
      { header: "Ticket ID", accessor: "ticket_id" },
      { header: "Subject", accessor: "subject" },
      { header: "Status", accessor: "status" },
      { header: "Priority", accessor: "priority" },
      { header: "Department", accessor: "department" },
      { header: "Created By", accessor: "created_by" },
    ]

    ExportService.exportToCSV(filteredTickets, {
      title: "All Support Tickets",
      filename: "all_support_tickets",
      columns,
    })
    toast.success("Export queued successfully")
  }

  return (
    <SupportTicketsShell
      title="All Support Tickets"
      description="Track every ticket in the queue and keep on top of delays."
      stats={stats}
    >
      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Ticket Records</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
             <div className="relative flex-1">
               <Input
                 placeholder="Search by ID, requester, or subject"
                 value={searchQuery}
                 onChange={(event) => setSearchQuery(event.target.value)}
                 className="pl-3"
               />
             </div>
             <div className="flex flex-wrap items-center gap-2">
               <AdvancedSearch
                 onSearch={handleAdvancedSearch}
                 fields={[
                   { name: "ticket_id", label: "Ticket ID", type: "text" },
                   { name: "subject", label: "Subject", type: "text" },
                   { name: "created_by", label: "Created By", type: "text" },
                   { name: "department", label: "Department", type: "text" },
                   { name: "status", label: "Status", type: "text" },
                   { name: "priority", label: "Priority", type: "text" },
                 ]}
                 title="Support Tickets"
               />
               <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                 <Download className="h-4 w-4" />
                 Export
               </Button>
               <Button className="gap-2 bg-[#008751] hover:bg-[#007545]" size="sm" onClick={handleOpenAdd}>
                 <Plus className="h-4 w-4" />
                 Add New
               </Button>
             </div>
           </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            {isLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">Loading tickets...</div>
            ) : isError ? (
              <div className="py-12 text-center text-sm text-red-600">Failed to load tickets. Please refresh the page.</div>
            ) : (
              <SupportTicketList
                tickets={filteredTickets}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyLabel="No tickets found."
              />
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Ticket</DialogTitle>
            </DialogHeader>
            <div>
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                value={newTicket.subject}
                onChange={(event) => setNewTicket({ ...newTicket, subject: event.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="ticket-department">Department</Label>
              <Input
                id="ticket-department"
                value={newTicket.department}
                onChange={(event) => setNewTicket({ ...newTicket, department: event.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="ticket-assigned-to">Assigned To</Label>
              <Input
                id="ticket-assigned-to"
                value={newTicket.assigned_to}
                onChange={(event) => setNewTicket({ ...newTicket, assigned_to: event.target.value })}
                placeholder="Enter assignee name or ID"
              />
            </div>
            <div>
              <Label htmlFor="ticket-description">Description</Label>
              <Textarea
                id="ticket-description"
                value={newTicket.description}
                onChange={(event) => setNewTicket({ ...newTicket, description: event.target.value })}
                rows={4}
                placeholder="Describe the support request"
              />
            </div>
            <div>
              <Label htmlFor="ticket-priority">Priority</Label>
              <Input
                id="ticket-priority"
                value={newTicket.priority}
                onChange={(event) => setNewTicket({ ...newTicket, priority: event.target.value })}
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTicket.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {viewTicket && (
            <div className="space-y-3">
              {[
                { label: "Ticket ID", value: viewTicket.ticket_id },
                { label: "Subject", value: viewTicket.subject },
                { label: "Department", value: viewTicket.department },
                { label: "Description", value: viewTicket.description },
                { label: "Assigned To", value: viewTicket.assigned_to ?? "Unassigned" },
                { label: "Due Date", value: viewTicket.due_date ?? "N/A" },
                { label: "Status", value: viewTicket.status },
                { label: "Priority", value: viewTicket.priority },
                { label: "Progress", value: `${viewTicket.progress ?? 0}%` },
              ].map((field) => (
                <div key={field.label} className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">{field.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{field.value}</p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setIsEditOpen(false)}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleUpdateSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Ticket</DialogTitle>
            </DialogHeader>
            <div>
              <Label htmlFor="edit-ticket-subject">Subject</Label>
              <Input
                id="edit-ticket-subject"
                value={editSubject}
                onChange={(event) => setEditSubject(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-ticket-department">Department</Label>
              <Input
                id="edit-ticket-department"
                value={editDepartment}
                onChange={(event) => setEditDepartment(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-ticket-description">Description</Label>
              <Textarea
                id="edit-ticket-description"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-ticket-assigned-to">Assigned To</Label>
              <Input
                id="edit-ticket-assigned-to"
                value={editAssignedTo}
                onChange={(event) => setEditAssignedTo(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-ticket-due-date">Due Date</Label>
              <Input
                id="edit-ticket-due-date"
                type="date"
                value={editDueDate}
                onChange={(event) => setEditDueDate(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-ticket-status">Status</Label>
                <Input
                  id="edit-ticket-status"
                  value={editStatus}
                  onChange={(event) => setEditStatus(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-ticket-priority">Priority</Label>
                <Input
                  id="edit-ticket-priority"
                  value={editPriority}
                  onChange={(event) => setEditPriority(event.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-ticket-progress">Progress (%)</Label>
              <Input
                id="edit-ticket-progress"
                type="number"
                min={0}
                max={100}
                value={editProgress}
                onChange={(event) => setEditProgress(event.target.value)}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateTicket.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeleteCandidate(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Support Ticket"
        description={`Delete ticket "${deleteCandidate?.subject ?? "this request"}"?`}
        itemName={deleteCandidate ? `Ticket ${deleteCandidate.ticket_id}` : "Ticket"}
        isLoading={deleteTicket.isPending}
      />
    </SupportTicketsShell>
  )
}
