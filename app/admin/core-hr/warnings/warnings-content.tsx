"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView, type DetailTab } from "@/app/admin/components/details-view"
import { format } from "date-fns"

// Mock data for warnings
const mockWarnings = [
  {
    id: "WARN-1001",
    employeeId: "EMP-1234",
    employeeName: "John Doe",
    employeeAvatar: "/thoughtful-man.png",
    department: "IT",
    subject: "Attendance Policy Violation",
    description: "Employee has been late to work more than 5 times in the past month.",
    warningType: "verbal",
    warningDate: "2023-05-10T09:30:00",
    issuedBy: "Sarah Johnson",
    issuedById: "EMP-5678",
    status: "active",
    expiryDate: "2023-08-10T09:30:00",
    documents: [{ id: "DOC-1", name: "Attendance Record.pdf", url: "#" }],
    acknowledgement: {
      acknowledged: true,
      date: "2023-05-11T14:20:00",
      comments: "I acknowledge this warning and will improve my punctuality.",
    },
  },
  {
    id: "WARN-1002",
    employeeId: "EMP-2345",
    employeeName: "Emily Wilson",
    employeeAvatar: "/diverse-woman-portrait.png",
    department: "Finance",
    subject: "Performance Concerns",
    description: "Employee has missed several project deadlines in the past quarter.",
    warningType: "written",
    warningDate: "2023-05-08T11:45:00",
    issuedBy: "Michael Brown",
    issuedById: "EMP-6789",
    status: "active",
    expiryDate: "2023-11-08T11:45:00",
    documents: [{ id: "DOC-2", name: "Performance Report.pdf", url: "#" }],
    acknowledgement: {
      acknowledged: false,
      date: null,
      comments: null,
    },
  },
  {
    id: "WARN-1003",
    employeeId: "EMP-3456",
    employeeName: "Robert Smith",
    employeeAvatar: "/thoughtful-man.png",
    department: "HR",
    subject: "Policy Violation",
    description: "Employee violated company confidentiality policy by sharing sensitive information.",
    warningType: "final",
    warningDate: "2023-04-15T14:20:00",
    issuedBy: "Jennifer Davis",
    issuedById: "EMP-7890",
    status: "active",
    expiryDate: "2023-10-15T14:20:00",
    documents: [
      { id: "DOC-3", name: "Incident Report.pdf", url: "#" },
      { id: "DOC-4", name: "Policy Document.pdf", url: "#" },
    ],
    acknowledgement: {
      acknowledged: true,
      date: "2023-04-16T09:30:00",
      comments: "I understand the severity of this violation and will adhere to all company policies going forward.",
    },
  },
  {
    id: "WARN-1004",
    employeeId: "EMP-4567",
    employeeName: "David Wilson",
    employeeAvatar: "/abstract-geometric-shapes.png",
    department: "Marketing",
    subject: "Insubordination",
    description: "Employee refused to follow direct instructions from supervisor.",
    warningType: "written",
    warningDate: "2023-03-20T10:15:00",
    issuedBy: "Sarah Johnson",
    issuedById: "EMP-5678",
    status: "expired",
    expiryDate: "2023-06-20T10:15:00",
    documents: [],
    acknowledgement: {
      acknowledged: true,
      date: "2023-03-21T11:30:00",
      comments: "I acknowledge this warning.",
    },
  },
  {
    id: "WARN-1005",
    employeeId: "EMP-5678",
    employeeName: "Sarah Johnson",
    employeeAvatar: "/diverse-woman-portrait.png",
    department: "IT",
    subject: "Unauthorized Absence",
    description: "Employee was absent without approval for 2 consecutive days.",
    warningType: "verbal",
    warningDate: "2023-05-01T13:40:00",
    issuedBy: "Michael Brown",
    issuedById: "EMP-6789",
    status: "active",
    expiryDate: "2023-08-01T13:40:00",
    documents: [],
    acknowledgement: {
      acknowledged: false,
      date: null,
      comments: null,
    },
  },
]

// Form fields for adding/editing a warning
const warningFormFields: FormField[] = [
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
    name: "subject",
    label: "Warning Subject",
    type: "text",
    required: true,
    placeholder: "Brief subject of the warning",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: true,
    placeholder: "Detailed description of the warning",
  },
  {
    name: "warningType",
    label: "Warning Type",
    type: "select",
    required: true,
    options: [
      { value: "verbal", label: "Verbal Warning" },
      { value: "written", label: "Written Warning" },
      { value: "final", label: "Final Warning" },
    ],
  },
  {
    name: "warningDate",
    label: "Warning Date",
    type: "date",
    required: true,
  },
  {
    name: "expiryDate",
    label: "Expiry Date",
    type: "date",
    required: true,
  },
  {
    name: "issuedById",
    label: "Issued By",
    type: "select",
    required: true,
    options: [
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
      { value: "active", label: "Active" },
      { value: "expired", label: "Expired" },
      { value: "withdrawn", label: "Withdrawn" },
    ],
    defaultValue: "active",
  },
]

export function WarningsContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedWarning, setSelectedWarning] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = () => {
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const warning = mockWarnings.find((w) => w.id === id)
    setSelectedWarning(warning)
    setIsEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const warning = mockWarnings.find((w) => w.id === id)
    setSelectedWarning(warning)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log("Deleting warning:", id)
    // Implement delete logic
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    setIsSubmitting(true)
    console.log("Adding new warning:", data)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsAddDialogOpen(false)
      // Add success notification
    }, 1000)
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    setIsSubmitting(true)
    console.log("Updating warning:", selectedWarning?.id, data)

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
      active: { color: "bg-red-100 text-red-800", label: "Active" },
      expired: { color: "bg-gray-100 text-gray-800", label: "Expired" },
      withdrawn: { color: "bg-blue-100 text-blue-800", label: "Withdrawn" },
    }

    const config = statusConfig[value] || { color: "bg-gray-100 text-gray-800", label: value }

    return <Badge className={config.color}>{config.label}</Badge>
  }

  // Warning type badge renderer
  const renderWarningType = (value: string) => {
    const typeConfig: Record<string, { color: string; label: string }> = {
      verbal: { color: "bg-yellow-100 text-yellow-800", label: "Verbal Warning" },
      written: { color: "bg-orange-100 text-orange-800", label: "Written Warning" },
      final: { color: "bg-red-100 text-red-800", label: "Final Warning" },
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

  // Acknowledgement renderer
  const renderAcknowledgement = (value: any) => {
    if (!value || !value.acknowledged) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
          Pending
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-800">
        Acknowledged
      </Badge>
    )
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
      key: "subject",
      label: "Subject",
      sortable: true,
    },
    {
      key: "warningType",
      label: "Warning Type",
      render: renderWarningType,
      sortable: true,
    },
    {
      key: "warningDate",
      label: "Issued On",
      render: renderDate,
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: renderStatus,
      sortable: true,
    },
    {
      key: "issuedBy",
      label: "Issued By",
      sortable: true,
    },
    {
      key: "acknowledgement",
      label: "Acknowledgement",
      render: renderAcknowledgement,
      sortable: false,
    },
  ]

  // Filter options
  const filterOptions = [
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "expired", label: "Expired" },
        { value: "withdrawn", label: "Withdrawn" },
      ],
    },
    {
      id: "warningType",
      label: "Warning Type",
      type: "select" as const,
      options: [
        { value: "verbal", label: "Verbal Warning" },
        { value: "written", label: "Written Warning" },
        { value: "final", label: "Final Warning" },
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
      id: "warningDate",
      label: "Issued Date",
      type: "date" as const,
      options: [],
    },
  ]

  // Detail tabs for viewing a warning
  const detailTabs: DetailTab[] = selectedWarning
    ? [
        {
          id: "details",
          label: "Warning Details",
          sections: [
            {
              title: "Basic Information",
              fields: [
                { label: "Warning ID", value: selectedWarning.id },
                { label: "Subject", value: selectedWarning.subject },
                {
                  label: "Warning Type",
                  value: selectedWarning.warningType,
                  type: "status",
                  options: {
                    statusMap: {
                      verbal: { label: "Verbal Warning", color: "bg-yellow-100 text-yellow-800" },
                      written: { label: "Written Warning", color: "bg-orange-100 text-orange-800" },
                      final: { label: "Final Warning", color: "bg-red-100 text-red-800" },
                    },
                  },
                },
                {
                  label: "Status",
                  value: selectedWarning.status,
                  type: "status",
                  options: {
                    statusMap: {
                      active: { label: "Active", color: "bg-red-100 text-red-800" },
                      expired: { label: "Expired", color: "bg-gray-100 text-gray-800" },
                      withdrawn: { label: "Withdrawn", color: "bg-blue-100 text-blue-800" },
                    },
                  },
                },
                { label: "Warning Date", value: selectedWarning.warningDate, type: "date" },
                { label: "Expiry Date", value: selectedWarning.expiryDate, type: "date" },
              ],
            },
            {
              title: "Employee Information",
              fields: [
                { label: "Employee Name", value: selectedWarning.employeeName },
                { label: "Employee ID", value: selectedWarning.employeeId },
                { label: "Department", value: selectedWarning.department },
                { label: "Issued By", value: selectedWarning.issuedBy },
              ],
            },
            {
              title: "Warning Description",
              fields: [{ label: "Description", value: selectedWarning.description }],
            },
            {
              title: "Acknowledgement",
              fields: [
                {
                  label: "Status",
                  value: selectedWarning.acknowledgement.acknowledged ? "Acknowledged" : "Pending",
                  type: "status",
                  options: {
                    statusMap: {
                      Acknowledged: { label: "Acknowledged", color: "bg-green-100 text-green-800" },
                      Pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
                    },
                  },
                },
                {
                  label: "Acknowledgement Date",
                  value: selectedWarning.acknowledgement.date,
                  type: "date",
                },
                {
                  label: "Employee Comments",
                  value: selectedWarning.acknowledgement.comments || "No comments provided",
                },
              ],
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
                selectedWarning.documents.length > 0
                  ? selectedWarning.documents.map((doc: any) => ({
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
          <h1 className="text-2xl font-bold tracking-tight">Employee Warnings</h1>
          <p className="text-muted-foreground">Manage employee disciplinary warnings and notices</p>
        </div>
      </div>

      <EnhancedDataTable
        title="Warnings"
        columns={columns}
        data={mockWarnings}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Add Warning Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Warning</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={warningFormFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Create Warning"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Warning Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Warning</DialogTitle>
          </DialogHeader>
          {selectedWarning && (
            <EnhancedForm
              fields={warningFormFields}
              onSubmit={handleSubmitEdit}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
              submitLabel="Update Warning"
              initialValues={{
                employeeId: selectedWarning.employeeId,
                subject: selectedWarning.subject,
                description: selectedWarning.description,
                warningType: selectedWarning.warningType,
                warningDate: selectedWarning.warningDate,
                expiryDate: selectedWarning.expiryDate,
                issuedById: selectedWarning.issuedById,
                status: selectedWarning.status,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Warning Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} className="max-w-4xl">
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {selectedWarning && (
            <DetailsView
              title={selectedWarning.subject}
              subtitle={`Warning ID: ${selectedWarning.id}`}
              data={selectedWarning}
              tabs={detailTabs}
              onEdit={() => {
                setIsViewDialogOpen(false)
                setTimeout(() => handleEdit(selectedWarning.id), 100)
              }}
              onBack={() => setIsViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
