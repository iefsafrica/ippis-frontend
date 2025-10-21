"use client"

import { useState } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { FormDialog } from "../components/form-dialog"
import { DetailsDialog } from "../components/details-dialog"
import { Badge } from "@/components/ui/badge"
import { Award, Calendar, User } from "lucide-react"

// Mock data for awards
const mockAwards = [
  {
    id: "1",
    employeeId: "EMP001",
    employeeName: "John Doe",
    department: "Finance",
    awardType: "Employee of the Month",
    giftItem: "Certificate & ₦50,000",
    cashPrice: 50000,
    awardDate: "2023-05-15",
    description: "Outstanding performance in financial analysis and reporting.",
    status: "Approved",
  },
  {
    id: "2",
    employeeId: "EMP045",
    employeeName: "Sarah Johnson",
    department: "Human Resources",
    awardType: "Long Service Award",
    giftItem: "Plaque & ₦100,000",
    cashPrice: 100000,
    awardDate: "2023-06-22",
    description: "Completed 10 years of dedicated service to the organization.",
    status: "Approved",
  },
  {
    id: "3",
    employeeId: "EMP078",
    employeeName: "Michael Chen",
    department: "Information Technology",
    awardType: "Innovation Award",
    giftItem: "Trophy & ₦75,000",
    cashPrice: 75000,
    awardDate: "2023-07-10",
    description: "Developed a new system that improved departmental efficiency by 30%.",
    status: "Pending",
  },
  {
    id: "4",
    employeeId: "EMP112",
    employeeName: "Amina Ibrahim",
    department: "Customer Service",
    awardType: "Customer Excellence Award",
    giftItem: "Certificate & ₦40,000",
    cashPrice: 40000,
    awardDate: "2023-08-05",
    description: "Consistently received positive feedback from customers for exceptional service.",
    status: "Approved",
  },
  {
    id: "5",
    employeeId: "EMP067",
    employeeName: "David Okonkwo",
    department: "Sales",
    awardType: "Sales Champion",
    giftItem: "Trophy & ₦120,000",
    cashPrice: 120000,
    awardDate: "2023-09-18",
    description: "Exceeded sales targets by 150% for three consecutive quarters.",
    status: "Pending",
  },
]

// Award form fields
const awardFormFields = [
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
    name: "awardType",
    label: "Award Type",
    type: "select" as const,
    required: true,
    options: [
      { value: "Employee of the Month", label: "Employee of the Month" },
      { value: "Long Service Award", label: "Long Service Award" },
      { value: "Innovation Award", label: "Innovation Award" },
      { value: "Customer Excellence Award", label: "Customer Excellence Award" },
      { value: "Sales Champion", label: "Sales Champion" },
      { value: "Leadership Award", label: "Leadership Award" },
    ],
  },
  {
    name: "giftItem",
    label: "Gift Item",
    type: "text" as const,
    required: true,
  },
  {
    name: "cashPrice",
    label: "Cash Price (₦)",
    type: "number" as const,
    required: true,
  },
  {
    name: "awardDate",
    label: "Award Date",
    type: "date" as const,
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    required: true,
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
    ],
  },
]

// Award details fields
const awardDetailsFields = [
  { label: "Employee ID", key: "employeeId" },
  { label: "Employee Name", key: "employeeName" },
  { label: "Department", key: "department" },
  { label: "Award Type", key: "awardType" },
  { label: "Gift Item", key: "giftItem" },
  { label: "Cash Price", key: "cashPrice", type: "text" },
  { label: "Award Date", key: "awardDate", type: "date" },
  { label: "Description", key: "description", type: "longText" },
  { label: "Status", key: "status", type: "status" },
]

// Award search fields
const awardSearchFields = [
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
    name: "awardType",
    label: "Award Type",
    type: "select" as const,
    options: [
      { value: "Employee of the Month", label: "Employee of the Month" },
      { value: "Long Service Award", label: "Long Service Award" },
      { value: "Innovation Award", label: "Innovation Award" },
      { value: "Customer Excellence Award", label: "Customer Excellence Award" },
      { value: "Sales Champion", label: "Sales Champion" },
      { value: "Leadership Award", label: "Leadership Award" },
    ],
  },
  {
    name: "awardDate",
    label: "Award Date",
    type: "date" as const,
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "Pending", label: "Pending" },
      { value: "Approved", label: "Approved" },
      { value: "Rejected", label: "Rejected" },
    ],
  },
]

export function AwardContent() {
  const [awards, setAwards] = useState(mockAwards)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [currentAward, setCurrentAward] = useState<any>(null)
  const [isEdit, setIsEdit] = useState(false)

  const handleAddAward = () => {
    setCurrentAward(null)
    setIsEdit(false)
    setFormDialogOpen(true)
  }

  const handleEditAward = (id: string) => {
    const award = awards.find((a) => a.id === id)
    if (award) {
      setCurrentAward(award)
      setIsEdit(true)
      setFormDialogOpen(true)
    }
  }

  const handleViewAward = (id: string) => {
    const award = awards.find((a) => a.id === id)
    if (award) {
      setCurrentAward(award)
      setDetailsDialogOpen(true)
    }
  }

  const handleDeleteAward = (id: string) => {
    setAwards(awards.filter((award) => award.id !== id))
  }

  const handleSubmitAward = (data: Record<string, any>) => {
    if (isEdit && currentAward) {
      // Update existing award
      setAwards(awards.map((award) => (award.id === currentAward.id ? { ...award, ...data } : award)))
    } else {
      // Add new award
      const newAward = {
        id: `${awards.length + 1}`,
        ...data,
      }
      setAwards([...awards, newAward])
    }
  }

  const columns = [
    {
      key: "employeeId",
      label: "Employee ID",
      sortable: true,
    },
    {
      key: "employeeName",
      label: "Employee Name",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-gray-500" />
          {value}
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
    },
    {
      key: "awardType",
      label: "Award Type",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <Award className="mr-2 h-4 w-4 text-yellow-500" />
          {value}
        </div>
      ),
    },
    {
      key: "awardDate",
      label: "Award Date",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
          {new Date(value).toLocaleDateString()}
        </div>
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
                : "bg-red-100 text-red-800"
          }
        >
          {value}
        </Badge>
      ),
    },
  ]

  return (
    <CoreHRClientWrapper title="Employee Awards" endpoint="/api/admin/core-hr/awards">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Employee Awards</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <DataTable
            title="Award"
            columns={columns}
            data={awards}
            searchFields={awardSearchFields}
            onAdd={handleAddAward}
            onEdit={handleEditAward}
            onDelete={handleDeleteAward}
            onView={handleViewAward}
          />
        </div>

        <FormDialog
          title="Award"
          fields={awardFormFields}
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          onSubmit={handleSubmitAward}
          initialData={currentAward || {}}
          isEdit={isEdit}
        />

        {currentAward && (
          <DetailsDialog
            title="Award"
            fields={awardDetailsFields}
            data={currentAward}
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
