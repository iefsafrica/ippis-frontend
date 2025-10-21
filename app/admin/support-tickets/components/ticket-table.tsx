"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Printer,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// Define ticket status types and colors
const statusColors = {
  Open: "bg-green-100 text-green-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "On Hold": "bg-yellow-100 text-yellow-800",
  Closed: "bg-gray-100 text-gray-800",
  Resolved: "bg-purple-100 text-purple-800",
}

// Define priority levels and colors
const priorityColors = {
  Low: "bg-gray-100 text-gray-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
  Critical: "bg-red-200 text-red-900",
}

// Define ticket type
interface Ticket {
  id: string
  subject: string
  status: keyof typeof statusColors
  priority: keyof typeof priorityColors
  department: string
  createdBy: string
  assignedTo: string
  createdAt: string
  updatedAt: string
}

// Sample data for demonstration
const sampleTickets: Ticket[] = [
  {
    id: "TKT-001",
    subject: "Unable to access employee portal",
    status: "Open",
    priority: "High",
    department: "IT Support",
    createdBy: "John Doe",
    assignedTo: "Jane Smith",
    createdAt: "2023-05-10T09:30:00",
    updatedAt: "2023-05-10T09:30:00",
  },
  {
    id: "TKT-002",
    subject: "Payroll discrepancy in April statement",
    status: "In Progress",
    priority: "Medium",
    department: "Finance",
    createdBy: "Sarah Johnson",
    assignedTo: "Mike Wilson",
    createdAt: "2023-05-09T14:15:00",
    updatedAt: "2023-05-10T11:20:00",
  },
  {
    id: "TKT-003",
    subject: "Request for new equipment",
    status: "On Hold",
    priority: "Low",
    department: "IT Support",
    createdBy: "Robert Brown",
    assignedTo: "Jane Smith",
    createdAt: "2023-05-08T10:45:00",
    updatedAt: "2023-05-09T16:30:00",
  },
  {
    id: "TKT-004",
    subject: "Benefits enrollment issue",
    status: "Closed",
    priority: "Medium",
    department: "HR",
    createdBy: "Emily Davis",
    assignedTo: "Lisa Taylor",
    createdAt: "2023-05-05T08:20:00",
    updatedAt: "2023-05-08T14:10:00",
  },
  {
    id: "TKT-005",
    subject: "System outage affecting multiple departments",
    status: "Open",
    priority: "Critical",
    department: "IT Support",
    createdBy: "Michael Chen",
    assignedTo: "David Miller",
    createdAt: "2023-05-10T08:00:00",
    updatedAt: "2023-05-10T08:15:00",
  },
]

// Props for the TicketTable component
interface TicketTableProps {
  tickets?: Ticket[]
  showAssignedTo?: boolean
  showCreatedBy?: boolean
  onViewTicket?: (ticket: Ticket) => void
  onEditTicket?: (ticket: Ticket) => void
  onDeleteTicket?: (ticket: Ticket) => void
}

// TicketTable component
export function TicketTable({
  tickets = sampleTickets,
  showAssignedTo = true,
  showCreatedBy = true,
  onViewTicket,
  onEditTicket,
  onDeleteTicket,
}: TicketTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [priorityFilter, setPriorityFilter] = useState<string>("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("")
  const [sortField, setSortField] = useState<keyof Ticket>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null)

  // Handle sort
  const handleSort = (field: keyof Ticket) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = !statusFilter || ticket.status === statusFilter
      const matchesPriority = !priorityFilter || ticket.priority === priorityFilter
      const matchesDepartment = !departmentFilter || ticket.department === departmentFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment
    })
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  // Handle checkbox selection
  const handleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(filteredTickets.map((ticket) => ticket.id))
    }
  }

  const handleSelectTicket = (id: string) => {
    if (selectedTickets.includes(id)) {
      setSelectedTickets(selectedTickets.filter((ticketId) => ticketId !== id))
    } else {
      setSelectedTickets([...selectedTickets, id])
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tickets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.keys(statusColors).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mt-3">
                  <p className="text-sm font-medium">Priority</p>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {Object.keys(priorityColors).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mt-3">
                  <p className="text-sm font-medium">Department</p>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="IT Support">IT Support</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    setStatusFilter("")
                    setPriorityFilter("")
                    setDepartmentFilter("")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Create Ticket</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="subject" className="text-right text-sm">
                    Subject
                  </label>
                  <Input id="subject" placeholder="Enter ticket subject" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="department" className="text-right text-sm">
                    Department
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT Support</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="priority" className="text-right text-sm">
                    Priority
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="description" className="text-right text-sm">
                    Description
                  </label>
                  <textarea
                    id="description"
                    placeholder="Describe your issue in detail"
                    className="col-span-3 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="attachment" className="text-right text-sm">
                    Attachment
                  </label>
                  <Input id="attachment" type="file" className="col-span-3" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <DialogTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogTrigger>
                <Button type="submit">Submit Ticket</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Ticket table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all tickets"
                />
              </TableHead>
              <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort("id")}>
                <div className="flex items-center">
                  ID
                  {sortField === "id" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("subject")}>
                <div className="flex items-center">
                  Subject
                  {sortField === "subject" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Department</TableHead>
              {showCreatedBy && <TableHead>Created By</TableHead>}
              {showAssignedTo && <TableHead>Assigned To</TableHead>}
              <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center">
                  Created
                  {sortField === "createdAt" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("updatedAt")}>
                <div className="flex items-center">
                  Updated
                  {sortField === "updatedAt" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9 + (showCreatedBy ? 1 : 0) + (showAssignedTo ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTickets.includes(ticket.id)}
                      onCheckedChange={() => handleSelectTicket(ticket.id)}
                      aria-label={`Select ticket ${ticket.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
                  </TableCell>
                  <TableCell>{ticket.department}</TableCell>
                  {showCreatedBy && <TableCell>{ticket.createdBy}</TableCell>}
                  {showAssignedTo && <TableCell>{ticket.assignedTo}</TableCell>}
                  <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell>{formatDate(ticket.updatedAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setViewTicket(ticket)
                            if (onViewTicket) onViewTicket(ticket)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onEditTicket) onEditTicket(ticket)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onDeleteTicket) onDeleteTicket(ticket)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Ticket Dialog */}
      {viewTicket && (
        <Dialog open={!!viewTicket} onOpenChange={(open) => !open && setViewTicket(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                Ticket {viewTicket.id}: {viewTicket.subject}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={statusColors[viewTicket.status]}>{viewTicket.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Priority</p>
                  <Badge className={priorityColors[viewTicket.priority]}>{viewTicket.priority}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p>{viewTicket.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created By</p>
                  <p>{viewTicket.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned To</p>
                  <p>{viewTicket.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p>{formatDate(viewTicket.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1">
                  This is a placeholder description for ticket {viewTicket.id}. In a real application, this would
                  contain the detailed description of the issue reported by the user.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Activity</p>
                <div className="space-y-3">
                  <div className="border-l-2 border-gray-200 pl-3 ml-3">
                    <p className="text-sm">
                      <span className="font-medium">{viewTicket.createdBy}</span> created this ticket
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(viewTicket.createdAt)}</p>
                  </div>
                  <div className="border-l-2 border-gray-200 pl-3 ml-3">
                    <p className="text-sm">
                      <span className="font-medium">System</span> assigned to{" "}
                      <span className="font-medium">{viewTicket.assignedTo}</span>
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(viewTicket.createdAt)}</p>
                  </div>
                  {viewTicket.status !== "Open" && (
                    <div className="border-l-2 border-gray-200 pl-3 ml-3">
                      <p className="text-sm">
                        <span className="font-medium">{viewTicket.assignedTo}</span> changed status to{" "}
                        <Badge className={statusColors[viewTicket.status]}>{viewTicket.status}</Badge>
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(viewTicket.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Add Response</p>
                <textarea
                  placeholder="Type your response here..."
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <div className="flex justify-between mt-2">
                  <Select defaultValue="open">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(statusColors).map((status) => (
                        <SelectItem key={status} value={status.toLowerCase().replace(" ", "-")}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button>Submit Response</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Export the component
export default TicketTable
