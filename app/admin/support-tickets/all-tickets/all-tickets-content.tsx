"use client"

import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, Eye, Edit, Trash2, Plus } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useCreateSupportTicket, useDeleteSupportTicket, useGetSupportTickets, useUpdateSupportTicket } from "@/services/hooks/supportTickets"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import type { GetSupportTicketsResponse, SupportTicket } from "@/types/supportTickets"
import type { Employee } from "@/types/employees/employee-management"

const statusBadgeClass = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-emerald-100 text-emerald-700"
    case "in progress":
    case "in-progress":
      return "bg-blue-100 text-blue-700"
    case "on hold":
      return "bg-amber-100 text-amber-700"
    case "closed":
    case "resolved":
      return "bg-gray-100 text-gray-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const priorityBadgeClass = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "critical":
    case "high":
      return "bg-rose-100 text-rose-700"
    case "medium":
      return "bg-yellow-100 text-yellow-700"
    case "low":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const columns = (
  handleView: (ticket: SupportTicket) => void,
  handleEdit: (ticket: SupportTicket) => void,
  handleDelete: (ticket: SupportTicket) => void,
  getAssigneeDisplayName: (value?: string) => string,
) => [
  {
    key: "ticket_id",
    label: "Ticket ID",
    sortable: true,
    render: (value: string) => <div className="font-medium text-gray-900">{value}</div>,
  },
  {
    key: "subject",
    label: "Ticket",
    sortable: true,
    render: (value: string, row: SupportTicket) => (
      <div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{row.department ?? `Department: ${row.department || 'Unassigned'}`}</div>
      </div>
    ),
  },
  {
    key: "assigned_to",
    label: "Assigned To",
    sortable: true,
    render: (value: string) => (
      <div className="font-medium text-gray-900">{getAssigneeDisplayName(value)}</div>
    ),
  },
  {
    key: "due_date",
    label: "Due Date",
    sortable: true,
    render: (value: string) => value ? format(new Date(value), "PPP") : "N/A",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => <Badge className={statusBadgeClass(value)}>{value}</Badge>,
  },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    render: (value: string) => <Badge className={priorityBadgeClass(value)}>{value}</Badge>,
  },
  {
    key: "progress",
    label: "Progress",
    sortable: true,
    render: (value: number) => `${value ?? 0}%`,
  },
  {
    key: "actions",
    label: "Actions",
    render: (_: any, row: SupportTicket) => {
      const normalizedStatus = row.status?.toLowerCase()
      const canModify =
        normalizedStatus?.includes("progress") ||
        normalizedStatus === "in progress" ||
        normalizedStatus === "open"
      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleView(row)}
            title="View Ticket"
            className="text-gray-600 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row)}
            disabled={!canModify}
            className="text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit Ticket"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDelete(row)}
            disabled={!canModify}
            className="text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Ticket"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

const searchFields = [
  { name: "ticket_id", label: "Ticket ID", type: "text" as const },
  { name: "subject", label: "Subject", type: "text" as const },
  { name: "assigned_to", label: "Assignee", type: "text" as const },
]

const normalizeStatus = (value?: string) => {
  if (!value) return "open"
  const normalized = value.trim().toLowerCase()
  if (normalized.includes("open")) return "open"
  if (normalized.includes("progress")) return "in-progress"
  if (normalized.includes("hold")) return "on hold"
  if (normalized.includes("closed") || normalized.includes("resolve")) return "closed"
  return normalized
}

const normalizePriority = (value?: string) => {
  if (!value) return "medium"
  const normalized = value.trim().toLowerCase()
  if (["low", "medium", "high", "critical"].includes(normalized)) {
    return normalized
  }
  return "medium"
}

export default function AllTicketsContent() {
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null)
  const [editTicket, setEditTicket] = useState<SupportTicket | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState<SupportTicket | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editSubject, setEditSubject] = useState("")
  const [editDepartment, setEditDepartment] = useState("")
  const [editPriority, setEditPriority] = useState("medium")
  const [editStatus, setEditStatus] = useState("open")
  const [editAssignedTo, setEditAssignedTo] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [editProgress, setEditProgress] = useState("0")

  const [newTicket, setNewTicket] = useState({
    subject: "",
    department: "",
    description: "",
    priority: "medium",
    assigned_to: "",
    due_date: new Date().toISOString().split("T")[0],
    status: "open",
    progress: 0,
  })

  const supportTicketsResult = useGetSupportTickets() as UseQueryResult<GetSupportTicketsResponse, Error>
  const { refetch, isFetching } = supportTicketsResult
  const createTicket = useCreateSupportTicket()
  const updateTicket = useUpdateSupportTicket()
  const deleteTicket = useDeleteSupportTicket()

  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
  } = useEmployeesList(1)
  const employeeOptions = employeesData?.employees ?? []
  const getEmployeeIdentifier = (employee: Employee) => String(employee.employee_id ?? employee.id)
  const findEmployeeByValue = (value?: string | null) =>
    employeeOptions.find(
      (employee) =>
        employee.employee_id === value ||
        employee.id === value ||
        employee.name === value,
    )
  const resolveEmployeeIdentifier = (value?: string | null) => {
    if (!value) return ""
    const normalized = String(value)
    const employee = findEmployeeByValue(normalized)
    return employee ? getEmployeeIdentifier(employee) : normalized
  }
  const getAssigneeDisplayName = (value?: string | null) => findEmployeeByValue(value)?.name ?? value ?? ""

  const tickets: SupportTicket[] = supportTicketsResult.data?.data?.tickets ?? []
  const total = tickets.length
  const open = tickets.filter((ticket) => ticket.status?.toLowerCase().includes("open")).length
  const inProgress = tickets.filter((ticket) => ticket.status?.toLowerCase().includes("progress")).length

  const stats = [
    {
      label: "Total Tickets",
      value: total,
      subtitle: "All requests logged",
    },
    {
      label: "Open",
      value: open,
      subtitle: "Waiting for triage",
    },
    {
      label: "In Progress",
      value: inProgress,
      subtitle: "Being handled",
    },
  ]

  const handleView = (ticket: SupportTicket) => {
    setViewTicket(ticket)
    setIsViewOpen(true)
  }

  const handleEdit = (ticket: SupportTicket) => {
    setEditTicket(ticket)
    setEditSubject(ticket.subject ?? "")
    setEditDepartment(ticket.department ?? "")
    setEditPriority(normalizePriority(ticket.priority))
    setEditStatus(normalizeStatus(ticket.status))
    setEditAssignedTo(resolveEmployeeIdentifier(ticket.assigned_to))
    setEditDueDate(ticket.due_date ? new Date(ticket.due_date).toISOString().split("T")[0] : "")
    setEditProgress(String(ticket.progress ?? 0))
    setIsEditOpen(true)
  }

  useEffect(() => {
    if (!editTicket) return
    const resolved = resolveEmployeeIdentifier(editTicket.assigned_to)
    if (resolved && resolved !== editAssignedTo) {
      setEditAssignedTo(resolved)
    }
  }, [employeeOptions, editTicket, editAssignedTo])

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

  const resetNewTicket = () => {
    setNewTicket({
      subject: "",
      department: "",
      description: "",
      priority: "medium",
      assigned_to: "",
      due_date: new Date().toISOString().split("T")[0],
      status: "open",
      progress: 0,
    })
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

  const handleUpdateSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editTicket) return
    try {
      await updateTicket.mutateAsync({
        ticketId: String(editTicket.ticket_id),
        data: {
          subject: editSubject,
          department: editDepartment,
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

  const handleOpenAdd = () => setIsAddOpen(true)

  const formattedTickets = tickets.map((ticket) => ({
    ...ticket,
    id: ticket.ticket_id,
  }))

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">All Tickets</h2>
            <p className="text-sm text-gray-500">Track all support requests</p>
          </div>
            <div className="flex items-center gap-2">
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700"
                size="sm"
                onClick={handleOpenAdd}
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2 bg-white border border-gray-200 text-gray-600"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{item.label}</p>
              <p className="text-3xl font-semibold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Ticket Records</CardTitle>
            <CardDescription className="text-gray-600">Monitor each ticket progress and status.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            title="Tickets"
            columns={columns(handleView, handleEdit, handleDelete, getAssigneeDisplayName)}
            data={formattedTickets}
            searchFields={searchFields}
            onAdd={handleOpenAdd}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add Ticket</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Ticket Subject</Label>
              <Input
                value={newTicket.subject}
                onChange={(event) => setNewTicket({ ...newTicket, subject: event.target.value })}
                required
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                value={newTicket.department}
                onChange={(event) => setNewTicket({ ...newTicket, department: event.target.value })}
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newTicket.description}
                onChange={(event) => setNewTicket({ ...newTicket, description: event.target.value })}
                rows={4}
                className="min-h-[96px]"
                placeholder="Describe the ticket details"
              />
            </div>
            <div>
              <Label>Assigned To</Label>
              <Select
                value={newTicket.assigned_to}
                onValueChange={(value) => setNewTicket({ ...newTicket, assigned_to: value })}
                disabled={isEmployeesLoading || employeeOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeOptions.map((employee) => {
                    const identifier = getEmployeeIdentifier(employee)
                    return (
                      <SelectItem key={identifier} value={identifier}>
                        {employee.name}
                        {employee.employee_id ? ` (${employee.employee_id})` : ""}
                      </SelectItem>
                    )
                  })}
                  {!isEmployeesLoading && employeeOptions.length === 0 && (
                    <SelectItem value="" disabled>
                      No employees available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newTicket.due_date}
                onChange={(event) => setNewTicket({ ...newTicket, due_date: event.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select
                  value={newTicket.status}
                  onValueChange={(value) => setNewTicket({ ...newTicket, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on hold">On Hold</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Progress (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newTicket.progress}
                onChange={(event) => setNewTicket({ ...newTicket, progress: Number(event.target.value) })}
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
                { label: "Assigned To", value: getAssigneeDisplayName(viewTicket.assigned_to) },
                { label: "Due Date", value: viewTicket.due_date ? format(new Date(viewTicket.due_date), "PPP") : "N/A" },
                { label: "Status", value: viewTicket.status },
                { label: "Progress", value: `${viewTicket.progress ?? 0}%` },
                { label: "Priority", value: viewTicket.priority },
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
              <Label>Ticket Subject</Label>
              <Input value={editSubject} onChange={(event) => setEditSubject(event.target.value)} required />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={editDepartment} onChange={(event) => setEditDepartment(event.target.value)} required />
            </div>
            <div>
              <Label>Assignee</Label>
              <Select
                value={editAssignedTo}
                onValueChange={(value) => setEditAssignedTo(value)}
                disabled={isEmployeesLoading || employeeOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                {employeeOptions.map((employee) => {
                  const identifier = getEmployeeIdentifier(employee)
                  return (
                    <SelectItem key={identifier} value={identifier}>
                      {employee.name}
                      {employee.employee_id ? ` (${employee.employee_id})` : ""}
                    </SelectItem>
                  )
                })}
                {!isEmployeesLoading && employeeOptions.length === 0 && (
                  <SelectItem value="" disabled>
                    No employees available
                  </SelectItem>
                )}
                {editAssignedTo &&
                  !employeeOptions.some((employee) => getEmployeeIdentifier(employee) === editAssignedTo) && (
                    <SelectItem key={editAssignedTo} value={editAssignedTo}>
                      {getAssigneeDisplayName(editAssignedTo)}
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={editDueDate}
                onChange={(event) => setEditDueDate(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(value) => setEditStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on hold">On Hold</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={editPriority} onValueChange={(value) => setEditPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Progress (%)</Label>
              <Input
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
    </div>
  )
}
