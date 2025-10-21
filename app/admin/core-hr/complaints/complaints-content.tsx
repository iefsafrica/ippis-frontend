"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView, type DetailTab } from "@/app/admin/components/details-view"
import { format } from "date-fns"

// Mock data for complaints
const mockComplaints = [
  {
    id: "COMP-1001",
    employeeId: "EMP-1234",
    employeeName: "John Doe",
    employeeAvatar: "/thoughtful-man.png",
    department: "IT",
    title: "Workplace Harassment",
    description: "I've been experiencing harassment from a colleague over the past month.",
    status: "pending",
    priority: "high",
    dateSubmitted: "2023-05-10T09:30:00",
    assignedTo: "Sarah Johnson",
    assignedToId: "EMP-5678",
    lastUpdated: "2023-05-12T14:20:00",
    documents: [{ id: "DOC-1", name: "Incident Report.pdf", url: "#" }],
    comments: [
      {
        id: "CMT-1",
        userId: "EMP-5678",
        userName: "Sarah Johnson",
        userAvatar: "/diverse-woman-portrait.png",
        content: "I've scheduled a meeting with both parties to discuss this issue.",
        timestamp: "2023-05-11T10:15:00",
      },
      {
        id: "CMT-2",
        userId: "EMP-1234",
        userName: "John Doe",
        userAvatar: "/thoughtful-man.png",
        content: "Thank you for addressing this promptly.",
        timestamp: "2023-05-11T11:30:00",
      },
    ],
  },
  {
    id: "COMP-1002",
    employeeId: "EMP-2345",
    employeeName: "Emily Wilson",
    employeeAvatar: "/diverse-woman-portrait.png",
    department: "Finance",
    title: "Inadequate Work Equipment",
    description: "My computer is outdated and slows down my work significantly.",
    status: "in-progress",
    priority: "medium",
    dateSubmitted: "2023-05-08T11:45:00",
    assignedTo: "Michael Brown",
    assignedToId: "EMP-6789",
    lastUpdated: "2023-05-09T16:30:00",
    documents: [],
    comments: [
      {
        id: "CMT-3",
        userId: "EMP-6789",
        userName: "Michael Brown",
        userAvatar: "/abstract-geometric-shapes.png",
        content: "I've forwarded this to the IT department for assessment.",
        timestamp: "2023-05-09T09:20:00",
      },
    ],
  },
  {
    id: "COMP-1003",
    employeeId: "EMP-3456",
    employeeName: "Robert Smith",
    employeeAvatar: "/thoughtful-man.png",
    department: "HR",
    title: "Unfair Performance Evaluation",
    description: "I believe my recent performance evaluation was unfair and biased.",
    status: "resolved",
    priority: "high",
    dateSubmitted: "2023-05-05T14:20:00",
    assignedTo: "Jennifer Davis",
    assignedToId: "EMP-7890",
    lastUpdated: "2023-05-07T10:15:00",
    documents: [
      { id: "DOC-2", name: "Performance Review.pdf", url: "#" },
      { id: "DOC-3", name: "Supporting Evidence.docx", url: "#" },
    ],
    comments: [
      {
        id: "CMT-4",
        userId: "EMP-7890",
        userName: "Jennifer Davis",
        userAvatar: "/diverse-woman-portrait.png",
        content:
          "After reviewing the documentation, I've scheduled a meeting with your manager to discuss this further.",
        timestamp: "2023-05-06T11:30:00",
      },
      {
        id: "CMT-5",
        userId: "EMP-7890",
        userName: "Jennifer Davis",
        userAvatar: "/diverse-woman-portrait.png",
        content: "The issue has been resolved. Your performance evaluation has been adjusted accordingly.",
        timestamp: "2023-05-07T10:15:00",
      },
    ],
  },
  {
    id: "COMP-1004",
    employeeId: "EMP-4567",
    employeeName: "David Wilson",
    employeeAvatar: "/abstract-geometric-shapes.png",
    department: "Marketing",
    title: "Excessive Workload",
    description: "I've been assigned too many projects simultaneously, making it impossible to meet deadlines.",
    status: "pending",
    priority: "medium",
    dateSubmitted: "2023-05-11T09:15:00",
    assignedTo: "Unassigned",
    assignedToId: null,
    lastUpdated: "2023-05-11T09:15:00",
    documents: [],
    comments: [],
  },
  {
    id: "COMP-1005",
    employeeId: "EMP-5678",
    employeeName: "Sarah Johnson",
    employeeAvatar: "/diverse-woman-portrait.png",
    department: "IT",
    title: "Workplace Safety Concern",
    description: "There are exposed wires in the server room that pose a safety hazard.",
    status: "in-progress",
    priority: "high",
    dateSubmitted: "2023-05-09T13:40:00",
    assignedTo: "Michael Brown",
    assignedToId: "EMP-6789",
    lastUpdated: "2023-05-10T11:25:00",
    documents: [{ id: "DOC-4", name: "Safety Hazard Photos.zip", url: "#" }],
    comments: [
      {
        id: "CMT-6",
        userId: "EMP-6789",
        userName: "Michael Brown",
        userAvatar: "/abstract-geometric-shapes.png",
        content: "I've alerted the facilities team. They will address this immediately.",
        timestamp: "2023-05-10T11:25:00",
      },
    ],
  },
]

// Form fields for adding/editing a complaint
const complaintFormFields: FormField[] = [
  {
    name: "employeeId",
    label: "Employee",
    type: "select",
    required: true,
    options: [
      { value: "EMP-1234", label: "John Doe (IT)" },
      { value: "EMP-2345", label: "Emily Wilson (Finance)" },
      { value: "EMP-3456", label: "Robert Smith (HR)" },
      { value: "EMP-4567", label: "David Wilson (Marketing)" },
      { value: "EMP-5678", label: "Sarah Johnson (IT)" },
    ],
  },
  {
    name: "title",
    label: "Complaint Title",
    type: "text",
    required: true,
    placeholder: "Brief title of the complaint",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: true,
    placeholder: "Detailed description of the complaint",
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    required: true,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
  {
    name: "assignedToId",
    label: "Assign To",
    type: "select",
    options: [
      { value: "", label: "Unassigned" },
      { value: "EMP-5678", label: "Sarah Johnson (HR Manager)" },
      { value: "EMP-6789", label: "Michael Brown (Department Head)" },
      { value: "EMP-7890", label: "Jennifer Davis (HR Specialist)" },
    ],
  },
  {
    name: "documents",
    label: "Supporting Documents",
    type: "file",
    multiple: true,
    accept: ".pdf,.doc,.docx,.jpg,.png,.zip",
    description: "Upload any relevant documents or evidence (max 5MB per file)",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "pending", label: "Pending" },
      { value: "in-progress", label: "In Progress" },
      { value: "resolved", label: "Resolved" },
      { value: "rejected", label: "Rejected" },
    ],
    defaultValue: "pending",
  },
]

export function ComplaintsContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = () => {
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const complaint = mockComplaints.find((c) => c.id === id)
    setSelectedComplaint(complaint)
    setIsEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const complaint = mockComplaints.find((c) => c.id === id)
    setSelectedComplaint(complaint)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log("Deleting complaint:", id)
    // Implement delete logic
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    setIsSubmitting(true)
    console.log("Adding new complaint:", data)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsAddDialogOpen(false)
      // Add success notification
    }, 1000)
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    setIsSubmitting(true)
    console.log("Updating complaint:", selectedComplaint?.id, data)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsEditDialogOpen(false)
      // Add success notification
    }, 1000)
  }

  // Status badge renderer
  const renderStatus = (value: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      "in-progress": { color: "bg-blue-100 text-blue-800", label: "In Progress" },
      resolved: { color: "bg-green-100 text-green-800", label: "Resolved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    }

    const config = statusConfig[value] || { color: "bg-gray-100 text-gray-800", label: value }

    return <Badge className={config.color}>{config.label}</Badge>
  }

  // Priority badge renderer
  const renderPriority = (value: string) => {
    const priorityConfig: Record<string, { color: string }> = {
      low: { color: "bg-green-100 text-green-800" },
      medium: { color: "bg-yellow-100 text-yellow-800" },
      high: { color: "bg-red-100 text-red-800" },
    }

    const config = priorityConfig[value] || { color: "bg-gray-100 text-gray-800" }

    return <Badge className={config.color}>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge>
  }

  // Employee renderer
  const renderEmployee = (value: string, row: any) => {
    return (
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.employeeAvatar || "/placeholder.svg"} alt={value} />
          <AvatarFallback>{value.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.employeeId}</div>
        </div>
      </div>
    )
  }

  // Date renderer
  const renderDate = (value: string) => {
    return format(new Date(value), "MMM d, yyyy")
  }

  // Assigned to renderer
  const renderAssignedTo = (value: string) => {
    if (value === "Unassigned") {
      return <span className="text-gray-500">Unassigned</span>
    }
    return value
  }

  // Table columns
  const columns = [
    {
      key: "employeeName",
      label: "Employee",
      render: renderEmployee,
      sortable: true,
    },
    {
      key: "title",
      label: "Complaint",
      sortable: true,
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: renderStatus,
      sortable: true,
    },
    {
      key: "priority",
      label: "Priority",
      render: renderPriority,
      sortable: true,
    },
    {
      key: "dateSubmitted",
      label: "Submitted On",
      render: renderDate,
      sortable: true,
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: renderAssignedTo,
      sortable: true,
    },
  ]

  // Filter options
  const filterOptions = [
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "pending", label: "Pending" },
        { value: "in-progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      id: "priority",
      label: "Priority",
      type: "select" as const,
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
    },
    {
      id: "department",
      label: "Department",
      type: "select" as const,
      options: [
        { value: "IT", label: "IT" },
        { value: "Finance", label: "Finance" },
        { value: "HR", label: "HR" },
        { value: "Marketing", label: "Marketing" },
      ],
    },
    {
      id: "dateSubmitted",
      label: "Submitted Date",
      type: "date" as const,
      options: [],
    },
  ]

  // Detail tabs for viewing a complaint
  const detailTabs: DetailTab[] = selectedComplaint
    ? [
        {
          id: "details",
          label: "Complaint Details",
          sections: [
            {
              title: "Basic Information",
              fields: [
                { label: "Complaint ID", value: selectedComplaint.id },
                { label: "Title", value: selectedComplaint.title },
                {
                  label: "Status",
                  value: selectedComplaint.status,
                  type: "status",
                  options: {
                    statusMap: {
                      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
                      "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-800" },
                      resolved: { label: "Resolved", color: "bg-green-100 text-green-800" },
                      rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
                    },
                  },
                },
                {
                  label: "Priority",
                  value: selectedComplaint.priority,
                  type: "status",
                  options: {
                    statusMap: {
                      low: { label: "Low", color: "bg-green-100 text-green-800" },
                      medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
                      high: { label: "High", color: "bg-red-100 text-red-800" },
                    },
                  },
                },
                { label: "Date Submitted", value: selectedComplaint.dateSubmitted, type: "date" },
                { label: "Last Updated", value: selectedComplaint.lastUpdated, type: "date" },
              ],
            },
            {
              title: "Employee Information",
              fields: [
                { label: "Employee Name", value: selectedComplaint.employeeName },
                { label: "Employee ID", value: selectedComplaint.employeeId },
                { label: "Department", value: selectedComplaint.department },
                { label: "Assigned To", value: selectedComplaint.assignedTo || "Unassigned" },
              ],
            },
            {
              title: "Complaint Description",
              fields: [{ label: "Description", value: selectedComplaint.description }],
            },
          ],
        },
        {
          id: "documents",
          label: "Documents",
          sections: [
            {
              title: "Supporting Documents",
              fields:
                selectedComplaint.documents.length > 0
                  ? selectedComplaint.documents.map((doc: any) => ({
                      label: doc.name,
                      value: doc.url,
                      type: "file",
                    }))
                  : [{ label: "Documents", value: "No documents attached" }],
            },
          ],
        },
        {
          id: "comments",
          label: "Comments & Activity",
          sections: [
            {
              title: "Comments",
              fields:
                selectedComplaint.comments.length > 0
                  ? selectedComplaint.comments.map((comment: any) => ({
                      label: `${comment.userName} - ${format(new Date(comment.timestamp), "MMM d, yyyy h:mm a")}`,
                      value: comment.content,
                    }))
                  : [{ label: "Comments", value: "No comments yet" }],
            },
          ],
        },
      ]
    : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Complaints</h1>
          <p className="text-muted-foreground">Manage and resolve employee complaints and grievances</p>
        </div>
      </div>

      <EnhancedDataTable
        title="Complaints"
        columns={columns}
        data={mockComplaints}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Add Complaint Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Complaint</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={complaintFormFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Create Complaint"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Complaint Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Complaint</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <EnhancedForm
              fields={complaintFormFields}
              onSubmit={handleSubmitEdit}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
              submitLabel="Update Complaint"
              initialValues={{
                employeeId: selectedComplaint.employeeId,
                title: selectedComplaint.title,
                description: selectedComplaint.description,
                priority: selectedComplaint.priority,
                assignedToId: selectedComplaint.assignedToId || "",
                status: selectedComplaint.status,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Complaint Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} className="max-w-4xl">
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {selectedComplaint && (
            <DetailsView
              title={selectedComplaint.title}
              subtitle={`Complaint ID: ${selectedComplaint.id}`}
              data={selectedComplaint}
              tabs={detailTabs}
              onEdit={() => {
                setIsViewDialogOpen(false)
                setTimeout(() => handleEdit(selectedComplaint.id), 100)
              }}
              onBack={() => setIsViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
