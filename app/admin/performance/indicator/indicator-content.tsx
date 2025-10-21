"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Check, X } from "lucide-react"

// Mock data for performance indicators
const mockIndicators = [
  {
    id: "1",
    name: "Customer Service Quality",
    department: "Customer Service",
    designation: "Customer Service Representative",
    addedBy: "Admin User",
    createdAt: "2023-03-15T08:00:00Z",
    status: "active",
    description: "Measures the quality of customer service provided by representatives.",
    criteria: [
      { name: "Response Time", weight: 25 },
      { name: "Issue Resolution", weight: 40 },
      { name: "Customer Feedback", weight: 35 },
    ],
  },
  {
    id: "2",
    name: "Sales Performance",
    department: "Sales",
    designation: "Sales Executive",
    addedBy: "Admin User",
    createdAt: "2023-04-10T10:30:00Z",
    status: "active",
    description: "Evaluates the sales performance of executives based on targets and conversions.",
    criteria: [
      { name: "Sales Target Achievement", weight: 50 },
      { name: "New Client Acquisition", weight: 30 },
      { name: "Client Retention", weight: 20 },
    ],
  },
  {
    id: "3",
    name: "Code Quality",
    department: "IT",
    designation: "Software Developer",
    addedBy: "Admin User",
    createdAt: "2023-05-05T14:45:00Z",
    status: "active",
    description: "Assesses the quality of code produced by developers.",
    criteria: [
      { name: "Code Readability", weight: 20 },
      { name: "Bug-free Code", weight: 40 },
      { name: "Documentation", weight: 15 },
      { name: "Performance Optimization", weight: 25 },
    ],
  },
  {
    id: "4",
    name: "Project Management Efficiency",
    department: "Project Management",
    designation: "Project Manager",
    addedBy: "Admin User",
    createdAt: "2023-06-20T09:15:00Z",
    status: "inactive",
    description: "Evaluates the efficiency of project managers in handling projects.",
    criteria: [
      { name: "On-time Delivery", weight: 35 },
      { name: "Budget Management", weight: 30 },
      { name: "Resource Utilization", weight: 20 },
      { name: "Stakeholder Satisfaction", weight: 15 },
    ],
  },
  {
    id: "5",
    name: "Financial Accuracy",
    department: "Finance",
    designation: "Accountant",
    addedBy: "Admin User",
    createdAt: "2023-07-12T11:20:00Z",
    status: "active",
    description: "Measures the accuracy of financial records and reports.",
    criteria: [
      { name: "Error-free Entries", weight: 40 },
      { name: "Timely Reporting", weight: 30 },
      { name: "Compliance", weight: 30 },
    ],
  },
]

// Mock data for departments and designations
const mockDepartments = [
  { value: "Customer Service", label: "Customer Service" },
  { value: "Sales", label: "Sales" },
  { value: "IT", label: "IT" },
  { value: "Project Management", label: "Project Management" },
  { value: "Finance", label: "Finance" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Operations", label: "Operations" },
  { value: "Marketing", label: "Marketing" },
]

const mockDesignations = [
  { value: "Customer Service Representative", label: "Customer Service Representative" },
  { value: "Sales Executive", label: "Sales Executive" },
  { value: "Software Developer", label: "Software Developer" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "Accountant", label: "Accountant" },
  { value: "HR Manager", label: "HR Manager" },
  { value: "Operations Manager", label: "Operations Manager" },
  { value: "Marketing Specialist", label: "Marketing Specialist" },
]

// Form fields for adding/editing performance indicators
const indicatorFields: FormField[] = [
  {
    name: "name",
    label: "Indicator Name",
    type: "text",
    placeholder: "Enter indicator name",
    required: true,
  },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: mockDepartments,
    required: true,
  },
  {
    name: "designation",
    label: "Designation",
    type: "select",
    options: mockDesignations,
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    required: true,
  },
]

// Table columns
const columns = [
  {
    key: "id",
    label: "ID",
    sortable: true,
  },
  {
    key: "name",
    label: "Indicator Name",
    sortable: true,
  },
  {
    key: "department",
    label: "Department",
    sortable: true,
  },
  {
    key: "designation",
    label: "Designation",
    sortable: true,
  },
  {
    key: "addedBy",
    label: "Added By",
    sortable: true,
  },
  {
    key: "createdAt",
    label: "Created Date",
    sortable: true,
    render: (value: string) => format(new Date(value), "PP"),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => (
      <Badge variant={value === "active" ? "success" : "secondary"} className="capitalize">
        {value === "active" ? <Check className="mr-1 h-3 w-3" /> : <X className="mr-1 h-3 w-3" />}
        {value}
      </Badge>
    ),
  },
]

// Filter options
const filterOptions = [
  {
    id: "department",
    label: "Department",
    type: "select" as const,
    options: mockDepartments,
  },
  {
    id: "designation",
    label: "Designation",
    type: "select" as const,
    options: mockDesignations,
  },
  {
    id: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
]

export default function IndicatorContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = () => {
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const indicator = mockIndicators.find((item) => item.id === id)
    setSelectedIndicator(indicator)
    setIsEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const indicator = mockIndicators.find((item) => item.id === id)
    setSelectedIndicator(indicator)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    // In a real app, this would call an API to delete the indicator
    console.log("Delete indicator with ID:", id)
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Add indicator:", data)
      setIsSubmitting(false)
      setIsAddDialogOpen(false)
    }, 1000)
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Edit indicator:", { id: selectedIndicator.id, ...data })
      setIsSubmitting(false)
      setIsEditDialogOpen(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        title="Performance Indicators"
        description="Manage key performance indicators"
        columns={columns}
        data={mockIndicators}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Add Indicator Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Performance Indicator</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={indicatorFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Add Indicator"
            initialValues={{
              status: "active",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Indicator Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Performance Indicator</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={indicatorFields}
            onSubmit={handleSubmitEdit}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Update Indicator"
            initialValues={selectedIndicator}
          />
        </DialogContent>
      </Dialog>

      {/* View Indicator Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Performance Indicator Details</DialogTitle>
          </DialogHeader>
          {selectedIndicator && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="criteria">Evaluation Criteria</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Indicator Name</h3>
                    <p className="text-base">{selectedIndicator.name}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="text-base">{selectedIndicator.department}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Designation</h3>
                    <p className="text-base">{selectedIndicator.designation}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Added By</h3>
                    <p className="text-base">{selectedIndicator.addedBy}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                    <p className="text-base">{format(new Date(selectedIndicator.createdAt), "PPP")}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge
                      variant={selectedIndicator.status === "active" ? "success" : "secondary"}
                      className="capitalize"
                    >
                      {selectedIndicator.status === "active" ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : (
                        <X className="mr-1 h-3 w-3" />
                      )}
                      {selectedIndicator.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="text-base">{selectedIndicator.description}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="criteria" className="space-y-4 pt-4">
                <div className="rounded-md border">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="text-sm font-medium">Evaluation Criteria</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 text-sm font-medium text-gray-500 pb-2 border-b">
                        <div className="col-span-6">Criteria</div>
                        <div className="col-span-3 text-center">Weight (%)</div>
                        <div className="col-span-3 text-center">Rating Scale</div>
                      </div>
                      {selectedIndicator.criteria.map((criterion: any, index: number) => (
                        <div key={index} className="grid grid-cols-12 text-sm">
                          <div className="col-span-6">{criterion.name}</div>
                          <div className="col-span-3 text-center">{criterion.weight}%</div>
                          <div className="col-span-3 text-center">1-5</div>
                        </div>
                      ))}
                      <div className="grid grid-cols-12 text-sm font-medium pt-2 border-t">
                        <div className="col-span-6">Total</div>
                        <div className="col-span-3 text-center">
                          {selectedIndicator.criteria.reduce((sum: number, item: any) => sum + item.weight, 0)}%
                        </div>
                        <div className="col-span-3"></div>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <h4 className="text-sm font-medium">Rating Scale Description</h4>
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="p-2 bg-gray-50 rounded-md">
                          <div className="font-medium">1 - Poor</div>
                          <div className="text-gray-500 mt-1">Performance is significantly below expectations</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <div className="font-medium">2 - Below Average</div>
                          <div className="text-gray-500 mt-1">Performance is somewhat below expectations</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <div className="font-medium">3 - Average</div>
                          <div className="text-gray-500 mt-1">Performance meets basic expectations</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <div className="font-medium">4 - Good</div>
                          <div className="text-gray-500 mt-1">Performance exceeds expectations</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-md">
                          <div className="font-medium">5 - Excellent</div>
                          <div className="text-gray-500 mt-1">Performance far exceeds expectations</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
