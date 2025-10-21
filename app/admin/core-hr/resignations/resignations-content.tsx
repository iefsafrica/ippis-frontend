"use client"

import { useState } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { FormDialog } from "../components/form-dialog"
import { DetailsDialog } from "../components/details-dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, FileText } from "lucide-react"

// Mock data for resignations
const mockResignations = [
  {
    id: "1",
    employeeId: "EMP001",
    employeeName: "John Doe",
    department: "Finance",
    position: "Senior Accountant",
    noticeDate: "2023-10-15",
    resignationDate: "2023-11-15",
    reason: "Career advancement opportunity at another organization",
    exitInterview: "Scheduled",
    status: "Approved",
    notes: "Employee has agreed to help train replacement during notice period.",
  },
  {
    id: "2",
    employeeId: "EMP045",
    employeeName: "Sarah Johnson",
    department: "Human Resources",
    position: "HR Specialist",
    noticeDate: "2023-09-20",
    resignationDate: "2023-10-20",
    reason: "Relocating to another city for family reasons",
    exitInterview: "Completed",
    status: "Completed",
    notes: "Exit interview revealed positive experience but need for better work-life balance.",
  },
  {
    id: "3",
    employeeId: "EMP078",
    employeeName: "Michael Chen",
    department: "Information Technology",
    position: "Software Developer",
    noticeDate: "2023-11-05",
    resignationDate: "2023-12-05",
    reason: "Higher compensation package from competitor",
    exitInterview: "Scheduled",
    status: "Pending",
    notes: "Management considering counter-offer to retain employee.",
  },
  {
    id: "4",
    employeeId: "EMP112",
    employeeName: "Amina Ibrahim",
    department: "Customer Service",
    position: "Team Lead",
    noticeDate: "2023-10-10",
    resignationDate: "2023-11-10",
    reason: "Pursuing further education full-time",
    exitInterview: "Not Required",
    status: "Approved",
    notes: "Employee has offered to work part-time during studies if needed.",
  },
  {
    id: "5",
    employeeId: "EMP067",
    employeeName: "David Okonkwo",
    department: "Sales",
    position: "Sales Executive",
    noticeDate: "2023-11-01",
    resignationDate: "2023-12-01",
    reason: "Starting own business venture",
    exitInterview: "Pending",
    status: "Rejected",
    notes: "Resignation rejected initially. Management discussing retention options.",
  },
]

// Resignation form fields
const resignationFormFields = [
  {
    name: "employeeId",
    label: "Employee ID",
    type: "text" as const,
    required: true,
  },
  {
    name: "employeeName",
    label: "Employee Name",
    type: "text" as const,
    required: true,
  },
  {
    name: "department",
    label: "Department",
    type: "select" as const,
    required: true,
    options: [
      { value: "Finance", label: "Finance" },
      { value: "Human Resources", label: "Human Resources" },
      { value: "Information Technology", label: "Information Technology" },
      { value: "Customer Service", label: "Customer Service" },
      { value: "Sales", label: "Sales" },
      { value: "Operations", label: "Operations" },
      { value: "Legal", label: "Legal" },
    ],
  },
  {
    name: "position",
    label: "Position",
    type: "text" as const,
    required: true,
  },
  {
    name: "noticeDate",
    label: "Notice Date",
    type: "date" as const,
    required: true,
  },
  {
    name: "resignationDate",
    label: "Resignation Date",
    type: "date" as const,
    required: true,
  },
  {
    name: "reason",
    label: "Reason",
    type: "textarea" as const,
    required: true,
  },
  {
    name: "exitInterview",
    label: "Exit Interview",
    type: "select" as const,
    required: true,
    options: [
      { value: "Scheduled", label: "Scheduled" },
      { value: "Pending", label: "Pending" },
      { value: "Completed", label: "Completed" },
      { value: "Not Required", label: "Not Required" },
    ],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea" as const,
    required: false,
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    required: true,
    options: [
      { value: "Pending", label: "Pending" },
      { value: "Approved", label: "Approved" },
      { value: "Rejected", label: "Rejected" },
      { value: "Completed", label: "Completed" },
      { value: "Withdrawn", label: "Withdrawn" },
    ],
  },
]

// Resignation details fields
const resignationDetailsFields = [
  { label: "Employee ID", key: "employeeId" },
  { label: "Employee Name", key: "employeeName" },
  { label: "Department", key: "department" },
  { label: "Position", key: "position" },
  { label: "Notice Date", key: "noticeDate", type: "date" },
  { label: "Resignation Date", key: "resignationDate", type: "date" },
  { label: "Reason", key: "reason", type: "longText" },
  { label: "Exit Interview", key: "exitInterview", type: "badge" },
  { label: "Notes", key: "notes", type: "longText" },
  { label: "Status", key: "status", type: "status" },
]

// Resignation search fields
const resignationSearchFields = [
  {
    name: "employeeId",
    label: "Employee ID",
    type: "text" as const,
  },
  {
    name: "employeeName",
    label: "Employee Name",
    type: "text" as const,
  },
  {
    name: "department",
    label: "Department",
    type: "select" as const,
    options: [
      { value: "Finance", label: "Finance" },
      { value: "Human Resources", label: "Human Resources" },
      { value: "Information Technology", label: "Information Technology" },
      { value: "Customer Service", label: "Customer Service" },
      { value: "Sales", label: "Sales" },
      { value: "Operations", label: "Operations" },
      { value: "Legal", label: "Legal" },
    ],
  },
  {
    name: "noticeDate",
    label: "Notice Date",
    type: "date" as const,
  },
  {
    name: "resignationDate",
    label: "Resignation Date",
    type: "date" as const,
  },
  {
    name: "exitInterview",
    label: "Exit Interview",
    type: "select" as const,
    options: [
      { value: "Scheduled", label: "Scheduled" },
      { value: "Pending", label: "Pending" },
      { value: "Completed", label: "Completed" },
      { value: "Not Required", label: "Not Required" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "Pending", label: "Pending" },
      { value: "Approved", label: "Approved" },
      { value: "Rejected", label: "Rejected" },
      { value: "Completed", label: "Completed" },
      { value: "Withdrawn", label: "Withdrawn" },
    ],
  },
]

export function ResignationsContent() {
  const [resignations, setResignations] = useState(mockResignations)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [currentResignation, setCurrentResignation] = useState<any>(null)
  const [isEdit, setIsEdit] = useState(false)

  const handleAddResignation = () => {
    setCurrentResignation(null)
    setIsEdit(false)
    setFormDialogOpen(true)
  }

  const handleEditResignation = (id: string) => {
    const resignation = resignations.find((r) => r.id === id)
    if (resignation) {
      setCurrentResignation(resignation)
      setIsEdit(true)
      setFormDialogOpen(true)
    }
  }

  const handleViewResignation = (id: string) => {
    const resignation = resignations.find((r) => r.id === id)
    if (resignation) {
      setCurrentResignation(resignation)
      setDetailsDialogOpen(true)
    }
  }

  const handleDeleteResignation = (id: string) => {
    setResignations(resignations.filter((resignation) => resignation.id !== id))
  }

  const handleSubmitResignation = (data: Record<string, any>) => {
    if (isEdit && currentResignation) {
      // Update existing resignation
      setResignations(
        resignations.map((resignation) =>
          resignation.id === currentResignation.id ? { ...resignation, ...data } : resignation,
        ),
      )
    } else {
      // Add new resignation
      const newResignation = {
        id: `${resignations.length + 1}`,
        ...data,
      }
      setResignations([...resignations, newResignation])
    }
  }

  const columns = [
    {
      key: "employeeName",
      label: "Employee",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-gray-500" />
          <div>
            <div>{value}</div>
            <div className="text-xs text-gray-500">{row.employeeId}</div>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div>{value}</div>
          <div className="text-xs text-gray-500">{row.position}</div>
        </div>
      ),
    },
    {
      key: "noticeDate",
      label: "Notice Period",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
          <div>
            <div>{new Date(value).toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">to {new Date(row.resignationDate).toLocaleDateString()}</div>
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center max-w-xs truncate">
          <FileText className="mr-2 h-4 w-4 text-gray-500" />
          <span className="truncate">{value}</span>
        </div>
      ),
    },
    {
      key: "exitInterview",
      label: "Exit Interview",
      sortable: true,
      render: (value: string) => (
        <Badge
          className={
            value === "Completed"
              ? "bg-green-100 text-green-800"
              : value === "Scheduled"
                ? "bg-blue-100 text-blue-800"
                : value === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge
          className={
            value === "Approved"
              ? "bg-green-100 text-green-800"
              : value === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : value === "Completed"
                  ? "bg-blue-100 text-blue-800"
                  : value === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : value === "Withdrawn"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
          }
        >
          {value}
        </Badge>
      ),
    },
  ]

  return (
    <CoreHRClientWrapper title="Employee Resignations" endpoint="/api/admin/core-hr/resignations">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Employee Resignations</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <DataTable
            title="Resignation"
            columns={columns}
            data={resignations}
            searchFields={resignationSearchFields}
            onAdd={handleAddResignation}
            onEdit={handleEditResignation}
            onDelete={handleDeleteResignation}
            onView={handleViewResignation}
          />
        </div>

        <FormDialog
          title="Resignation"
          fields={resignationFormFields}
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          onSubmit={handleSubmitResignation}
          initialData={currentResignation || {}}
          isEdit={isEdit}
        />

        {currentResignation && (
          <DetailsDialog
            title="Resignation"
            fields={resignationDetailsFields}
            data={currentResignation}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            onEdit={() => {
              setDetailsDialogOpen(false)
              setFormDialogOpen(true)
            }}
          />
        )}
      </div>
    </CoreHRClientWrapper>
  )
}
