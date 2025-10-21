"use client"

import { useState } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { FormDialog } from "../components/form-dialog"
import { DetailsDialog } from "../components/details-dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User, CreditCard } from "lucide-react"

// Mock data for travel requests
const mockTravelRequests = [
  {
    id: "1",
    employeeId: "EMP001",
    employeeName: "John Doe",
    department: "Finance",
    purpose: "Annual Budget Meeting",
    startDate: "2023-10-15",
    endDate: "2023-10-18",
    destination: "Lagos",
    travelMode: "Flight",
    accommodationType: "Hotel",
    estimatedCost: 250000,
    advanceAmount: 150000,
    status: "Approved",
    notes: "Attending the annual budget planning meeting with the executive team.",
  },
  {
    id: "2",
    employeeId: "EMP045",
    employeeName: "Sarah Johnson",
    department: "Human Resources",
    purpose: "HR Conference",
    startDate: "2023-11-05",
    endDate: "2023-11-08",
    destination: "Abuja",
    travelMode: "Train",
    accommodationType: "Hotel",
    estimatedCost: 180000,
    advanceAmount: 100000,
    status: "Pending",
    notes: "Attending the national HR conference to learn about new employment regulations.",
  },
  {
    id: "3",
    employeeId: "EMP078",
    employeeName: "Michael Chen",
    department: "Information Technology",
    purpose: "Tech Summit",
    startDate: "2023-12-01",
    endDate: "2023-12-05",
    destination: "Port Harcourt",
    travelMode: "Flight",
    accommodationType: "Airbnb",
    estimatedCost: 300000,
    advanceAmount: 200000,
    status: "Approved",
    notes: "Representing the company at the annual tech summit to explore new technologies.",
  },
  {
    id: "4",
    employeeId: "EMP112",
    employeeName: "Amina Ibrahim",
    department: "Customer Service",
    purpose: "Client Meeting",
    startDate: "2023-10-25",
    endDate: "2023-10-27",
    destination: "Kano",
    travelMode: "Car",
    accommodationType: "Hotel",
    estimatedCost: 120000,
    advanceAmount: 80000,
    status: "Completed",
    notes: "Meeting with key clients to discuss service improvements and contract renewal.",
  },
  {
    id: "5",
    employeeId: "EMP067",
    employeeName: "David Okonkwo",
    department: "Sales",
    purpose: "Sales Presentation",
    startDate: "2023-11-15",
    endDate: "2023-11-17",
    destination: "Enugu",
    travelMode: "Bus",
    accommodationType: "Hotel",
    estimatedCost: 100000,
    advanceAmount: 70000,
    status: "Rejected",
    notes: "Presenting our new product line to potential clients in the eastern region.",
  },
  {
    id: "6",
    employeeId: "EMP069",
    employeeName: "Sunday Etom Eni",
    department: "Software Engineering",
    purpose: "Tech Summit",
    startDate: "2025-06-01",
    endDate: "2025-12-30",
    destination: "Calabar",
    travelMode: "Flight",
    accommodationType: "Hotel",
    estimatedCost: 100000,
    advanceAmount: 70000,
    status: "Approved",
    notes: "Attending the annual tech summit to explore new technologies and network with industry leaders.",
  },
]

// Travel form fields
const travelFormFields = [
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
    name: "purpose",
    label: "Purpose",
    type: "text" as const,
    required: true,
  },
  {
    name: "startDate",
    label: "Start Date",
    type: "date" as const,
    required: true,
  },
  {
    name: "endDate",
    label: "End Date",
    type: "date" as const,
    required: true,
  },
  {
    name: "destination",
    label: "Destination",
    type: "text" as const,
    required: true,
  },
  {
    name: "travelMode",
    label: "Travel Mode",
    type: "select" as const,
    required: true,
    options: [
      { value: "Flight", label: "Flight" },
      { value: "Train", label: "Train" },
      { value: "Bus", label: "Bus" },
      { value: "Car", label: "Car" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    name: "accommodationType",
    label: "Accommodation",
    type: "select" as const,
    required: true,
    options: [
      { value: "Hotel", label: "Hotel" },
      { value: "Airbnb", label: "Airbnb" },
      { value: "Guest House", label: "Guest House" },
      { value: "None", label: "None" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    name: "estimatedCost",
    label: "Estimated Cost (₦)",
    type: "number" as const,
    required: true,
  },
  {
    name: "advanceAmount",
    label: "Advance Amount (₦)",
    type: "number" as const,
    required: true,
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
      { value: "Cancelled", label: "Cancelled" },
    ],
  },
]

// Travel details fields
const travelDetailsFields = [
  { label: "Employee ID", key: "employeeId" },
  { label: "Employee Name", key: "employeeName" },
  { label: "Department", key: "department" },
  { label: "Purpose", key: "purpose" },
  { label: "Start Date", key: "startDate", type: "date" },
  { label: "End Date", key: "endDate", type: "date" },
  { label: "Destination", key: "destination" },
  { label: "Travel Mode", key: "travelMode" },
  { label: "Accommodation", key: "accommodationType" },
  { label: "Estimated Cost", key: "estimatedCost", type: "text" },
  { label: "Advance Amount", key: "advanceAmount", type: "text" },
  { label: "Notes", key: "notes", type: "longText" },
  { label: "Status", key: "status", type: "status" },
]

// Travel search fields
const travelSearchFields = [
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
    name: "destination",
    label: "Destination",
    type: "text" as const,
  },
  {
    name: "startDate",
    label: "Start Date",
    type: "date" as const,
  },
  {
    name: "endDate",
    label: "End Date",
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
      { value: "Completed", label: "Completed" },
      { value: "Cancelled", label: "Cancelled" },
    ],
  },
]

export function TravelContent() {
  const [travelRequests, setTravelRequests] = useState(mockTravelRequests)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [currentTravel, setCurrentTravel] = useState<any>(null)
  const [isEdit, setIsEdit] = useState(false)

  const handleAddTravel = () => {
    setCurrentTravel(null)
    setIsEdit(false)
    setFormDialogOpen(true)
  }

  const handleEditTravel = (id: string) => {
    const travel = travelRequests.find((t) => t.id === id)
    if (travel) {
      setCurrentTravel(travel)
      setIsEdit(true)
      setFormDialogOpen(true)
    }
  }

  const handleViewTravel = (id: string) => {
    const travel = travelRequests.find((t) => t.id === id)
    if (travel) {
      setCurrentTravel(travel)
      setDetailsDialogOpen(true)
    }
  }

  const handleDeleteTravel = (id: string) => {
    setTravelRequests(travelRequests.filter((travel) => travel.id !== id))
  }

  const handleSubmitTravel = (data: Record<string, any>) => {
    if (isEdit && currentTravel) {
      // Update existing travel request
      setTravelRequests(
        travelRequests.map((travel) => (travel.id === currentTravel.id ? { ...travel, ...data } : travel)),
      )
    } else {
      // Add new travel request
      const newTravel = {
        id: `${travelRequests.length + 1}`,
        ...data,
      }
      setTravelRequests([...travelRequests, newTravel])
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
      key: "purpose",
      label: "Purpose",
      sortable: true,
    },
    {
      key: "destination",
      label: "Destination",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-red-500" />
          {value}
        </div>
      ),
    },
    {
      key: "startDate",
      label: "Travel Period",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
          <div>
            <div>{new Date(value).toLocaleDateString()}</div>
            <div className="text-xs text-gray-500">to {new Date(row.endDate).toLocaleDateString()}</div>
          </div>
        </div>
      ),
    },
    {
      key: "estimatedCost",
      label: "Cost",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center">
          <CreditCard className="mr-2 h-4 w-4 text-gray-500" />₦{value.toLocaleString()}
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
                : value === "Completed"
                  ? "bg-blue-100 text-blue-800"
                  : value === "Rejected" || value === "Cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
          }
        >
          {value}
        </Badge>
      ),
    },
  ]

  return (
    <CoreHRClientWrapper title="Employee Travel" endpoint="/api/admin/core-hr/travel">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Employee Travel</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <DataTable
            title="Travel Request"
            columns={columns}
            data={travelRequests}
            searchFields={travelSearchFields}
            onAdd={handleAddTravel}
            onEdit={handleEditTravel}
            onDelete={handleDeleteTravel}
            onView={handleViewTravel}
          />
        </div>

        <FormDialog
          title="Travel Request"
          fields={travelFormFields}
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          onSubmit={handleSubmitTravel}
          initialData={currentTravel || {}}
          isEdit={isEdit}
        />

        {currentTravel && (
          <DetailsDialog
            title="Travel Request"
            fields={travelDetailsFields}
            data={currentTravel}
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
