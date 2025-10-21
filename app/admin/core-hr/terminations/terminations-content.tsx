"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView, type DetailTab } from "@/app/admin/components/details-view"
import { format } from "date-fns"

// Mock data for terminations
const mockTerminations = [
  {
    id: "TERM-1001",
    employeeId: "EMP-1234",
    employeeName: "John Doe",
    employeeAvatar: "/thoughtful-man.png",
    department: "IT",
    position: "Software Developer",
    terminationType: "voluntary",
    reason: "Better opportunity elsewhere",
    noticeDate: "2023-05-01T09:30:00",
    terminationDate: "2023-05-31T17:00:00",
    status: "pending",
    initiatedBy: "John Doe",
    initiatedById: "EMP-1234",
    approvedBy: "Sarah Johnson",
    approvedById: "EMP-5678",
    approvalDate: "2023-05-03T14:20:00",
    exitInterviewDate: "2023-05-25T10:00:00",
    exitInterviewConductedBy: "Jennifer Davis",
    exitInterviewConductedById: "EMP-7890",
    documents: [
      { id: "DOC-1", name: "Resignation Letter.pdf", url: "#" },
      { id: "DOC-2", name: "Exit Checklist.pdf", url: "#" },
    ],
    notes: "Employee has agreed to help with knowledge transfer before departure.",
  },
  {
    id: "TERM-1002",
    employeeId: "EMP-2345",
    employeeName: "Emily Wilson",
    employeeAvatar: "/diverse-woman-portrait.png",
    department: "Finance",
    position: "Financial Analyst",
    terminationType: "involuntary",
    reason: "Performance issues",
    noticeDate: "2023-04-15T11:45:00",
    terminationDate: "2023-04-30T17:00:00",
    status: "completed",
    initiatedBy: "Michael Brown",
    initiatedById: "EMP-6789",
    approvedBy: "Sarah Johnson",
    approvedById: "EMP-5678",
    approvalDate: "2023-04-16T09:30:00",
    exitInterviewDate: "2023-04-28T14:00:00",
    exitInterviewConductedBy: "Jennifer Davis",
    exitInterviewConductedById: "EMP-7890",
    documents: [
      { id: "DOC-3", name: "Performance Review.pdf", url: "#" },
      { id: "DOC-4", name: "Termination Notice.pdf", url: "#" },
      { id: "DOC-5", name: "Exit Checklist.pdf", url: "#" },
    ],
    notes: "Employee has been provided with severance package as per company policy.",
  },
  {
    id: "TERM-1003",
    employeeId: "EMP-3456",
    employeeName: "Robert Smith",
    employeeAvatar: "/thoughtful-man.png",
    department: "HR",
    position: "HR Coordinator",
    terminationType: "voluntary",
    reason: "Retirement",
    noticeDate: "2023-03-01T14:20:00",
    terminationDate: "2023-05-31T17:00:00",
    status: "pending",
    initiatedBy: "Robert Smith",
    initiatedById: "EMP-3456",
    approvedBy: "Sarah Johnson",
    approvedById: "EMP-5678",
    approvalDate: "2023-03-02T10:15:00",
    exitInterviewDate: "2023-05-25T11:30:00",
    exitInterviewConductedBy: null,
    exitInterviewConductedById: null,
    documents: [{ id: "DOC-6", name: "Retirement Notice.pdf", url: "#" }],
    notes: "Employee is retiring after 25 years of service. Planning a farewell event.",
  },
  {
    id: "TERM-1004",
    employeeId: "EMP-4567",
    employeeName: "David Wilson",
    employeeAvatar: "/abstract-geometric-shapes.png",
    department: "Marketing",
    position: "Marketing Specialist",
    terminationType: "involuntary",
    reason: "Position eliminated",
    noticeDate: "2023-04-01T10:15:00",
    terminationDate: "2023-04-30T17:00:00",
    status: "completed",
    initiatedBy: "Michael Brown",
    initiatedById: "EMP-6789",
    approvedBy: "Sarah Johnson",
    approvedById: "EMP-5678",
    approvalDate: "2023-04-02T09:30:00",
    exitInterviewDate: "2023-04-28T15:30:00",
    exitInterviewConductedBy: "Jennifer Davis",
    exitInterviewConductedById: "EMP-7890",
    documents: [
      { id: "DOC-7", name: "Termination Notice.pdf", url: "#" },
      { id: "DOC-8", name: "Severance Agreement.pdf", url: "#" },
      { id: "DOC-9", name: "Exit Checklist.pdf", url: "#" },
    ],
    notes: "Position eliminated due to departmental restructuring. Employee provided with outplacement services.",
  },
  {
    id: "TERM-1005",
    employeeId: "EMP-5678",
    employeeName: "Lisa Anderson",
    employeeAvatar: "/diverse-woman-portrait.png",
    department: "Sales",
    position: "Sales Representative",
    terminationType: "voluntary",
    reason: "Relocation",
    noticeDate: "2023-05-05T13:40:00",
    terminationDate: "2023-06-02T17:00:00",
    status: "pending",
    initiatedBy: "Lisa Anderson",
    initiatedById: "EMP-5678",
    approvedBy: "Michael Brown",
    approvedById: "EMP-6789",
    approvalDate: "2023-05-06T10:15:00",
    exitInterviewDate: "2023-05-30T14:00:00",
    exitInterviewConductedBy: null,
    exitInterviewConductedById: null,
    documents: [{ id: "DOC-10", name: "Resignation Letter.pdf", url: "#" }],
    notes: "Employee is relocating to another state. Has offered to train replacement remotely.",
  },
]

// Form fields for adding/editing a termination
const terminationFormFields: FormField[] = [
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
      { value: "EMP-5678", label: "Lisa Anderson (Sales)" },
    ],
  },
  {
    name: "terminationType",
    label: "Termination Type",
    type: "select",
    required: true,
    options: [
      { value: "voluntary", label: "Voluntary (Resignation/Retirement)" },
      { value: "involuntary", label: "Involuntary (Termination)" },
    ],
  },
  {
    name: "reason",
    label: "Reason",
    type: "text",
    required: true,
    placeholder: "Reason for termination",
  },
  {
    name: "noticeDate",
    label: "Notice Date",
    type: "date",
    required: true,
  },
  {
    name: "terminationDate",
    label: "Termination Date",
    type: "date",
    required: true,
  },
  {
    name: "initiatedById",
    label: "Initiated By",
    type: "select",
    required: true,
    options: [
      { value: "EMP-1234", label: "John Doe (Employee)" },
      { value: "EMP-5678", label: "Sarah Johnson (HR Manager)" },
      { value: "EMP-6789", label: "Michael Brown (Department Head)" },
    ],
  },
  {
    name: "approvedById",
    label: "Approved By",
    type: "select",
    required: true,
    options: [
      { value: "EMP-5678", label: "Sarah Johnson (HR Manager)" },
      { value: "EMP-6789", label: "Michael Brown (Department Head)" },
    ],
  },
  {
    name: "approvalDate",
    label: "Approval Date",
    type: "date",
    required: true,
  },
  {
    name: "exitInterviewDate",
    label: "Exit Interview Date",
    type: "date",
  },
  {
    name: "exitInterviewConductedById",
    label: "Exit Interview Conducted By",
    type: "select",
    options: [
      { value: "", label: "Not Scheduled" },
      { value: "EMP-5678", label: "Sarah Johnson (HR Manager)" },
      { value: "EMP-7890", label: "Jennifer Davis (HR Specialist)" },
    ],
  },
  {
    name: "documents",
    label: "Supporting Documents",
    type: "file",
    multiple: true,
    accept: ".pdf,.doc,.docx,.jpg,.png,.zip",
    description: "Upload relevant documents (resignation letter, termination notice, etc.)",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional notes or comments",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "pending", label: "Pending" },
      { value: "in-progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
    defaultValue: "pending",
  },
]

export function TerminationsContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedTermination, setSelectedTermination] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = () => {
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const termination = mockTerminations.find((t) => t.id === id)
    setSelectedTermination(termination)
    setIsEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const termination = mockTerminations.find((t) => t.id === id)
    setSelectedTermination(termination)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log("Deleting termination:", id)
    // Implement delete logic
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    setIsSubmitting(true)
    console.log("Adding new termination:", data)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsAddDialogOpen(false)
      // Add success notification
    }, 1000)
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    setIsSubmitting(true)
    console.log("Updating termination:", selectedTermination?.id, data)

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
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    }

    const config = statusConfig[value] || { color: "bg-gray-100 text-gray-800", label: value }

    return <Badge className={config.color}>{config.label}</Badge>
  }

  // Termination type badge renderer
  const renderTerminationType = (value: string) => {
    const typeConfig: Record<string, { color: string; label: string }> = {
      voluntary: { color: "bg-blue-100 text-blue-800", label: "Voluntary" },
      involuntary: { color: "bg-red-100 text-red-800", label: "Involuntary" },
    }

    const config = typeConfig[value] || { color: "bg-gray-100 text-gray-800", label: value }

    return <Badge className={config.color}>{config.label}</Badge>
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

  // Table columns
  const columns = [
    {
      key: "employeeName",
      label: "Employee",
      render: renderEmployee,
      sortable: true,
    },
    {
      key: "position",
      label: "Position",
      sortable: true,
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
    },
    {
      key: "terminationType",
      label: "Type",
      render: renderTerminationType,
      sortable: true,
    },
    {
      key: "reason",
      label: "Reason",
      sortable: true,
    },
    {
      key: "terminationDate",
      label: "Termination Date",
      render: renderDate,
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: renderStatus,
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
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      id: "terminationType",
      label: "Termination Type",
      type: "select" as const,
      options: [
        { value: "voluntary", label: "Voluntary" },
        { value: "involuntary", label: "Involuntary" },
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
        { value: "Sales", label: "Sales" },
      ],
    },
    {
      id: "terminationDate",
      label: "Termination Date",
      type: "date" as const,
      options: [],
    },
  ]

  // Detail tabs for viewing a termination
  const detailTabs: DetailTab[] = selectedTermination
    ? [
        {
          id: "details",
          label: "Termination Details",
          sections: [
            {
              title: "Basic Information",
              fields: [
                { label: "Termination ID", value: selectedTermination.id },
                {
                  label: "Termination Type",
                  value: selectedTermination.terminationType,
                  type: "status",
                  options: {
                    statusMap: {
                      voluntary: { label: "Voluntary", color: "bg-blue-100 text-blue-800" },
                      involuntary: { label: "Involuntary", color: "bg-red-100 text-red-800" },
                    },
                  },
                },
                { label: "Reason", value: selectedTermination.reason },
                {
                  label: "Status",
                  value: selectedTermination.status,
                  type: "status",
                  options: {
                    statusMap: {
                      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
                      "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-800" },
                      completed: { label: "Completed", color: "bg-green-100 text-green-800" },
                      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
                    },
                  },
                },
                { label: "Notice Date", value: selectedTermination.noticeDate, type: "date" },
                { label: "Termination Date", value: selectedTermination.terminationDate, type: "date" },
              ],
            },
            {
              title: "Employee Information",
              fields: [
                { label: "Employee Name", value: selectedTermination.employeeName },
                { label: "Employee ID", value: selectedTermination.employeeId },
                { label: "Department", value: selectedTermination.department },
                { label: "Position", value: selectedTermination.position },
              ],
            },
            {
              title: "Process Information",
              fields: [
                { label: "Initiated By", value: selectedTermination.initiatedBy },
                { label: "Approved By", value: selectedTermination.approvedBy },
                { label: "Approval Date", value: selectedTermination.approvalDate, type: "date" },
                { label: "Exit Interview Date", value: selectedTermination.exitInterviewDate, type: "date" },
                {
                  label: "Exit Interview Conducted By",
                  value: selectedTermination.exitInterviewConductedBy || "Not conducted yet",
                },
              ],
            },
            {
              title: "Additional Notes",
              fields: [{ label: "Notes", value: selectedTermination.notes || "No additional notes" }],
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
                selectedTermination.documents.length > 0
                  ? selectedTermination.documents.map((doc: any) => ({
                      label: doc.name,
                      value: doc.url,
                      type: "file",
                    }))
                  : [{ label: "Documents", value: "No documents attached" }],
            },
          ],
        },
      ]
    : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Terminations</h1>
          <p className="text-muted-foreground">Manage employee termination processes and documentation</p>
        </div>
      </div>

      <EnhancedDataTable
        title="Terminations"
        columns={columns}
        data={mockTerminations}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Add Termination Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Termination</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={terminationFormFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Create Termination"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Termination Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Termination</DialogTitle>
          </DialogHeader>
          {selectedTermination && (
            <EnhancedForm
              fields={terminationFormFields}
              onSubmit={handleSubmitEdit}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
              submitLabel="Update Termination"
              initialValues={{
                employeeId: selectedTermination.employeeId,
                terminationType: selectedTermination.terminationType,
                reason: selectedTermination.reason,
                noticeDate: selectedTermination.noticeDate,
                terminationDate: selectedTermination.terminationDate,
                initiatedById: selectedTermination.initiatedById,
                approvedById: selectedTermination.approvedById,
                approvalDate: selectedTermination.approvalDate,
                exitInterviewDate: selectedTermination.exitInterviewDate,
                exitInterviewConductedById: selectedTermination.exitInterviewConductedById,
                documents: selectedTermination.documents,
                notes: selectedTermination.notes,
                status: selectedTermination.status,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Termination Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {selectedTermination && (
            <DetailsView
              title={`${selectedTermination.employeeName} - Termination Details`}
              subtitle={`ID: ${selectedTermination.id}`}
              data={selectedTermination}
              tabs={detailTabs}
              onEdit={() => {
                setIsViewDialogOpen(false)
                setTimeout(() => handleEdit(selectedTermination.id), 100)
              }}
              onBack={() => setIsViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
