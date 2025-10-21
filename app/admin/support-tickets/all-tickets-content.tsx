"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PauseCircle,
  MessageSquare,
  Download,
  Printer,
  FileText,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for tickets
const mockTickets = [
  {
    id: "TICKET-1001",
    subject: "Unable to access payroll system",
    status: "open",
    priority: "high",
    department: "IT Support",
    createdBy: "John Doe",
    createdAt: "2023-05-08T10:30:00",
    lastUpdated: "2023-05-08T14:45:00",
    assignedTo: "Sarah Johnson",
    description: "I'm unable to access the payroll system. It shows an error message saying 'Connection failed'.",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: "TICKET-1002",
    subject: "Request for leave approval",
    status: "in-progress",
    priority: "medium",
    department: "HR",
    createdBy: "Emily Wilson",
    createdAt: "2023-05-07T09:15:00",
    lastUpdated: "2023-05-08T11:20:00",
    assignedTo: "Michael Brown",
    description:
      "I've submitted a leave request for next week but haven't received approval yet. Could you please expedite?",
    avatar: "/diverse-woman-portrait.png",
  },
  {
    id: "TICKET-1003",
    subject: "Incorrect salary calculation",
    status: "on-hold",
    priority: "high",
    department: "Finance",
    createdBy: "Robert Smith",
    createdAt: "2023-05-06T14:20:00",
    lastUpdated: "2023-05-07T09:30:00",
    assignedTo: "Jennifer Davis",
    description: "My salary for this month appears to be incorrectly calculated. The overtime hours are not reflected.",
    avatar: "/thoughtful-man.png",
  },
  {
    id: "TICKET-1004",
    subject: "New employee onboarding",
    status: "closed",
    priority: "low",
    department: "HR",
    createdBy: "David Wilson",
    createdAt: "2023-05-05T11:45:00",
    lastUpdated: "2023-05-06T16:30:00",
    assignedTo: "Sarah Johnson",
    description: "Need assistance with onboarding process for a new employee joining next week.",
    avatar: "/diverse-group.png",
  },
  {
    id: "TICKET-1005",
    subject: "Password reset required",
    status: "open",
    priority: "medium",
    department: "IT Support",
    createdBy: "Lisa Anderson",
    createdAt: "2023-05-08T08:30:00",
    lastUpdated: "2023-05-08T09:15:00",
    assignedTo: "Unassigned",
    description:
      "I need my password reset for the employee portal. I've tried the forgot password option but didn't receive any email.",
    avatar: "/diverse-woman-portrait.png",
  },
  {
    id: "TICKET-1006",
    subject: "Request for office supplies",
    status: "closed",
    priority: "low",
    department: "Admin",
    createdBy: "Michael Johnson",
    createdAt: "2023-05-04T13:20:00",
    lastUpdated: "2023-05-05T10:15:00",
    assignedTo: "Jennifer Davis",
    description: "Need additional office supplies for the marketing department - notebooks, pens, and sticky notes.",
    avatar: "/professional-teamwork.png",
  },
  {
    id: "TICKET-1007",
    subject: "Network connectivity issues",
    status: "in-progress",
    priority: "high",
    department: "IT Support",
    createdBy: "Sarah Thompson",
    createdAt: "2023-05-07T11:45:00",
    lastUpdated: "2023-05-08T09:30:00",
    assignedTo: "Michael Brown",
    description:
      "Experiencing intermittent network connectivity issues in the finance department. Affecting multiple users.",
    avatar: "/confident-businesswoman.png",
  },
  {
    id: "TICKET-1008",
    subject: "Benefits enrollment question",
    status: "open",
    priority: "medium",
    department: "HR",
    createdBy: "James Wilson",
    createdAt: "2023-05-08T09:15:00",
    lastUpdated: "2023-05-08T10:20:00",
    assignedTo: "Sarah Johnson",
    description:
      "I have questions about the benefits enrollment process. Need clarification on health insurance options.",
    avatar: "/caring-doctor.png",
  },
]

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    open: { color: "bg-blue-100 text-blue-800 hover:bg-blue-100", icon: <Clock className="h-3 w-3 mr-1" /> },
    "in-progress": {
      color: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      icon: <PauseCircle className="h-3 w-3 mr-1" />,
    },
    "on-hold": {
      color: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
    closed: {
      color: "bg-green-100 text-green-800 hover:bg-green-100",
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    },
    cancelled: { color: "bg-red-100 text-red-800 hover:bg-red-100", icon: <XCircle className="h-3 w-3 mr-1" /> },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open

  return (
    <Badge variant="outline" className={`flex items-center ${config.color}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </Badge>
  )
}

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig = {
    low: { color: "bg-green-100 text-green-800 hover:bg-green-100" },
    medium: { color: "bg-amber-100 text-amber-800 hover:bg-amber-100" },
    high: { color: "bg-red-100 text-red-800 hover:bg-red-100" },
  }

  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium

  return (
    <Badge variant="outline" className={`${config.color}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  )
}

// Format date function
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default function AllTicketsContent() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<(typeof mockTickets)[0] | null>(null)
  const [isTicketDetailsOpen, setIsTicketDetailsOpen] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  // Filter tickets based on active tab, search query, department and priority
  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesTab = activeTab === "all" || ticket.status === activeTab
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || ticket.department === departmentFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

    return matchesTab && matchesSearch && matchesDepartment && matchesPriority
  })

  // Count tickets by status
  const ticketCounts = {
    all: mockTickets.length,
    open: mockTickets.filter((t) => t.status === "open").length,
    "in-progress": mockTickets.filter((t) => t.status === "in-progress").length,
    "on-hold": mockTickets.filter((t) => t.status === "on-hold").length,
    closed: mockTickets.filter((t) => t.status === "closed").length,
  }

  const handleTicketClick = (ticket: (typeof mockTickets)[0]) => {
    setSelectedTicket(ticket)
    setIsTicketDetailsOpen(true)
  }

  // Mock export functions
  const handleExportCSV = () => {
    alert("Exporting tickets to CSV...")
    // In a real implementation, this would generate and download a CSV file
  }

  const handleExportPDF = () => {
    alert("Exporting tickets to PDF...")
    // In a real implementation, this would generate and download a PDF file
  }

  const handlePrint = () => {
    alert("Preparing tickets for printing...")
    // In a real implementation, this would open the print dialog
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage and respond to employee support requests</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#008751] hover:bg-[#007545]">
                <Plus className="mr-2 h-4 w-4" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Support Ticket</DialogTitle>
                <DialogDescription>Fill in the details below to create a new support ticket.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief description of the issue" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it-support">IT Support</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="admin">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the issue"
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="attachment">Attachment (optional)</Label>
                  <Input id="attachment" type="file" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateTicketOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#008751] hover:bg-[#007545]" onClick={() => setIsCreateTicketOpen(false)}>
                  Submit Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets by ID, subject or creator..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select defaultValue="all" onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="IT Support">IT Support</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Admin">Administration</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all" onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">All ({ticketCounts.all})</TabsTrigger>
          <TabsTrigger value="open">Open ({ticketCounts.open})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({ticketCounts["in-progress"]})</TabsTrigger>
          <TabsTrigger value="on-hold">On Hold ({ticketCounts["on-hold"]})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({ticketCounts.closed})</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground">
                <div className="col-span-5">Subject</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-2">Last Updated</div>
                <div className="col-span-1">Assigned To</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredTickets.length > 0 ? (
                <div className="divide-y">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="grid grid-cols-12 items-center px-6 py-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <div className="col-span-5 flex items-center space-x-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={ticket.avatar || "/placeholder.svg"} alt={ticket.createdBy} />
                          <AvatarFallback>{ticket.createdBy.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.id} • {ticket.createdBy}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <StatusBadge status={ticket.status} />
                      </div>
                      <div className="col-span-2">
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">{formatDate(ticket.lastUpdated)}</div>
                      <div className="col-span-1">
                        {ticket.assignedTo !== "Unassigned" ? (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {ticket.assignedTo
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            Unassigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-3">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
                  <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                    No tickets match your current filters. Try adjusting your search or create a new ticket.
                  </p>
                  <Button className="mt-4 bg-[#008751] hover:bg-[#007545]" onClick={() => setIsCreateTicketOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Ticket
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Details Dialog */}
      <Dialog open={isTicketDetailsOpen} onOpenChange={setIsTicketDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DialogTitle>{selectedTicket.subject}</DialogTitle>
                    <span className="text-sm text-muted-foreground">({selectedTicket.id})</span>
                  </div>
                  <StatusBadge status={selectedTicket.status} />
                </div>
                <DialogDescription>
                  Created by {selectedTicket.createdBy} on {formatDate(selectedTicket.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-sm">{selectedTicket.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <PriorityBadge priority={selectedTicket.priority} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {selectedTicket.assignedTo !== "Unassigned"
                          ? selectedTicket.assignedTo
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "UN"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm">{selectedTicket.assignedTo}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <div className="bg-muted/50 p-4 rounded-md text-sm">{selectedTicket.description}</div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Activity</h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="/admin-interface.png" alt="Admin" />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">System Admin</p>
                          <p className="text-xs text-muted-foreground">{formatDate(selectedTicket.lastUpdated)}</p>
                        </div>
                        <p className="text-sm">Ticket assigned to {selectedTicket.assignedTo}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          {selectedTicket.assignedTo !== "Unassigned"
                            ? selectedTicket.assignedTo
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "UN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{selectedTicket.assignedTo}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(selectedTicket.lastUpdated)}</p>
                        </div>
                        <p className="text-sm">Changed status to {selectedTicket.status.replace("-", " ")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Add Response</h4>
                <Textarea placeholder="Type your response here..." className="min-h-[100px]" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Attach File
                    </Button>
                    <Select>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => setIsTicketDetailsOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-[#008751] hover:bg-[#007545]">Submit Response</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
