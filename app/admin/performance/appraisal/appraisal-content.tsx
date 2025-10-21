"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { FileText, Printer } from "lucide-react"

// Mock data for performance appraisals
const mockAppraisals = [
  {
    id: "1",
    employee: "John Doe",
    employeeId: "EMP001",
    department: "Customer Service",
    designation: "Customer Service Representative",
    appraisalDate: "2023-06-15T00:00:00Z",
    status: "completed",
    remarks: "Excellent performance in customer service. Consistently exceeds targets.",
    overallRating: 4.5,
    reviewedBy: "Jane Smith",
    reviewerDesignation: "Customer Service Manager",
    indicators: [
      { name: "Customer Service Quality", rating: 4.7 },
      { name: "Attendance & Punctuality", rating: 4.2 },
      { name: "Team Collaboration", rating: 4.5 },
    ],
  },
  {
    id: "2",
    employee: "Jane Smith",
    employeeId: "EMP002",
    department: "Finance",
    designation: "Accountant",
    appraisalDate: "2023-05-20T00:00:00Z",
    status: "completed",
    remarks: "Strong financial analysis skills. Needs improvement in meeting deadlines.",
    overallRating: 3.8,
    reviewedBy: "Michael Brown",
    reviewerDesignation: "Finance Director",
    indicators: [
      { name: "Financial Accuracy", rating: 4.5 },
      { name: "Timeliness", rating: 3.0 },
      { name: "Problem Solving", rating: 4.0 },
    ],
  },
  {
    id: "3",
    employee: "Michael Johnson",
    employeeId: "EMP003",
    department: "IT",
    designation: "Software Developer",
    appraisalDate: "2023-07-10T00:00:00Z",
    status: "in_progress",
    remarks: "Pending final review by department head.",
    overallRating: 0,
    reviewedBy: "Sarah Williams",
    reviewerDesignation: "IT Manager",
    indicators: [
      { name: "Code Quality", rating: 0 },
      { name: "Technical Knowledge", rating: 0 },
      { name: "Problem Solving", rating: 0 },
    ],
  },
  {
    id: "4",
    employee: "Sarah Williams",
    employeeId: "EMP004",
    department: "IT",
    designation: "IT Manager",
    appraisalDate: "2023-06-25T00:00:00Z",
    status: "completed",
    remarks: "Excellent leadership skills. Successfully led the system upgrade project.",
    overallRating: 4.7,
    reviewedBy: "Robert Brown",
    reviewerDesignation: "CTO",
    indicators: [
      { name: "Leadership", rating: 4.8 },
      { name: "Project Management", rating: 4.6 },
      { name: "Technical Knowledge", rating: 4.7 },
    ],
  },
  {
    id: "5",
    employee: "Robert Brown",
    employeeId: "EMP005",
    department: "Human Resources",
    designation: "HR Manager",
    appraisalDate: "2023-08-05T00:00:00Z",
    status: "scheduled",
    remarks: "Scheduled for next month.",
    overallRating: 0,
    reviewedBy: "Admin User",
    reviewerDesignation: "HR Director",
    indicators: [
      { name: "Employee Relations", rating: 0 },
      { name: "Recruitment Efficiency", rating: 0 },
      { name: "Policy Implementation", rating: 0 },
    ],
  },
]

// Mock data for employees, departments, and designations
const mockEmployees = [
  { value: "EMP001", label: "John Doe" },
  { value: "EMP002", label: "Jane Smith" },
  { value: "EMP003", label: "Michael Johnson" },
  { value: "EMP004", label: "Sarah Williams" },
  { value: "EMP005", label: "Robert Brown" },
]

const mockDepartments = [
  { value: "Customer Service", label: "Customer Service" },
  { value: "Finance", label: "Finance" },
  { value: "IT", label: "IT" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Operations", label: "Operations" },
  { value: "Marketing", label: "Marketing" },
]

const mockDesignations = [
  { value: "Customer Service Representative", label: "Customer Service Representative" },
  { value: "Accountant", label: "Accountant" },
  { value: "Software Developer", label: "Software Developer" },
  { value: "IT Manager", label: "IT Manager" },
  { value: "HR Manager", label: "HR Manager" },
  { value: "Operations Manager", label: "Operations Manager" },
  { value: "Marketing Specialist", label: "Marketing Specialist" },
]

// Form fields for adding/editing performance appraisals
const appraisalFields: FormField[] = [
  {
    name: "employeeId",
    label: "Employee",
    type: "select",
    options: mockEmployees,
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
    name: "appraisalDate",
    label: "Appraisal Date",
    type: "date",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "scheduled", label: "Scheduled" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
    required: true,
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Enter remarks",
    required: false,
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
    key: "employee",
    label: "Employee",
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
    key: "appraisalDate",
    label: "Appraisal Date",
    sortable: true,
    render: (value: string) => format(new Date(value), "PP"),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => {
      let badgeVariant = "default"
      let badgeText = "Unknown"

      switch (value) {
        case "scheduled":
          badgeVariant = "outline"
          badgeText = "Scheduled"
          break
        case "in_progress":
          badgeVariant = "secondary"
          badgeText = "In Progress"
          break
        case "completed":
          badgeVariant = "success"
          badgeText = "Completed"
          break
        case "cancelled":
          badgeVariant = "destructive"
          badgeText = "Cancelled"
          break
      }

      return (
        <Badge variant={badgeVariant as any} className="capitalize">
          {badgeText}
        </Badge>
      )
    },
  },
  {
    key: "overallRating",
    label: "Rating",
    sortable: true,
    render: (value: number) => (value > 0 ? value.toFixed(1) : "-"),
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
    id: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "scheduled", label: "Scheduled" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
]

export default function AppraisalContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = () => {
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const appraisal = mockAppraisals.find((item) => item.id === id)
    if (appraisal) {
      // Convert dates to Date objects for the form
      const formattedAppraisal = {
        ...appraisal,
        appraisalDate: new Date(appraisal.appraisalDate),
      }
      setSelectedAppraisal(formattedAppraisal)
      setIsEditDialogOpen(true)
    }
  }

  const handleView = (id: string) => {
    const appraisal = mockAppraisals.find((item) => item.id === id)
    setSelectedAppraisal(appraisal)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    // In a real app, this would call an API to delete the appraisal
    console.log("Delete appraisal with ID:", id)
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Add appraisal:", data)
      setIsSubmitting(false)
      setIsAddDialogOpen(false)
    }, 1000)
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Edit appraisal:", { id: selectedAppraisal.id, ...data })
      setIsSubmitting(false)
      setIsEditDialogOpen(false)
    }, 1000)
  }

  const handlePrintAppraisal = () => {
    console.log("Print appraisal:", selectedAppraisal.id)
    // In a real app, this would open a print dialog with the appraisal details
  }

  const handleExportAppraisal = () => {
    console.log("Export appraisal to PDF:", selectedAppraisal.id)
    // In a real app, this would generate and download a PDF of the appraisal
  }

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        title="Performance Appraisals"
        description="Manage employee performance appraisals"
        columns={columns}
        data={mockAppraisals}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Add Appraisal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Performance Appraisal</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={appraisalFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Add Appraisal"
            initialValues={{
              status: "scheduled",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Appraisal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Performance Appraisal</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={appraisalFields}
            onSubmit={handleSubmitEdit}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Update Appraisal"
            initialValues={selectedAppraisal}
          />
        </DialogContent>
      </Dialog>

      {/* View Appraisal Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Performance Appraisal Details</DialogTitle>
          </DialogHeader>
          {selectedAppraisal && (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handlePrintAppraisal} className="gap-1">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportAppraisal} className="gap-1">
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="ratings">Ratings</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-gray-500">Employee</h3>
                      <p className="text-base">{selectedAppraisal.employee}</p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
                      <p className="text-base">{selectedAppraisal.employeeId}</p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-gray-500">Department</h3>
                      <p className="text-base">{selectedAppraisal.department}</p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-gray-500">Designation</h3>
                      <p className="text-base">{selectedAppraisal.designation}</p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-gray-500">Appraisal Date</h3>
                      <p className="text-base">{format(new Date(selectedAppraisal.appraisalDate), "PPP")}</p>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge
                        variant={
                          selectedAppraisal.status === "completed"
                            ? "success"
                            : selectedAppraisal.status === "in_progress"
                              ? "secondary"
                              : selectedAppraisal.status === "cancelled"
                                ? "destructive"
                                : "outline"
                        }
                        className="capitalize"
                      >
                        {selectedAppraisal.status === "scheduled"
                          ? "Scheduled"
                          : selectedAppraisal.status === "in_progress"
                            ? "In Progress"
                            : selectedAppraisal.status === "completed"
                              ? "Completed"
                              : "Cancelled"}
                      </Badge>
                    </div>
                    {selectedAppraisal.status === "completed" && (
                      <>
                        <div className="space-y-1.5">
                          <h3 className="text-sm font-medium text-gray-500">Overall Rating</h3>
                          <p className="text-base">{selectedAppraisal.overallRating.toFixed(1)} / 5.0</p>
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-sm font-medium text-gray-500">Reviewed By</h3>
                          <p className="text-base">
                            {selectedAppraisal.reviewedBy} ({selectedAppraisal.reviewerDesignation})
                          </p>
                        </div>
                      </>
                    )}
                    <div className="space-y-1.5 col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Remarks</h3>
                      <p className="text-base">{selectedAppraisal.remarks || "No remarks provided."}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="ratings" className="space-y-4 pt-4">
                  {selectedAppraisal.status === "completed" ? (
                    <div className="rounded-md border">
                      <div className="bg-gray-50 px-4 py-3 border-b">
                        <h3 className="text-sm font-medium">Performance Ratings</h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-12 text-sm font-medium text-gray-500 pb-2 border-b">
                            <div className="col-span-6">Performance Indicator</div>
                            <div className="col-span-3 text-center">Rating</div>
                            <div className="col-span-3 text-center">Comments</div>
                          </div>
                          {selectedAppraisal.indicators.map((indicator: any, index: number) => (
                            <div key={index} className="grid grid-cols-12 text-sm">
                              <div className="col-span-6">{indicator.name}</div>
                              <div className="col-span-3 text-center">{indicator.rating.toFixed(1)} / 5.0</div>
                              <div className="col-span-3 text-center">
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="grid grid-cols-12 text-sm font-medium pt-2 border-t">
                            <div className="col-span-6">Overall Rating</div>
                            <div className="col-span-3 text-center">
                              {selectedAppraisal.overallRating.toFixed(1)} / 5.0
                            </div>
                            <div className="col-span-3"></div>
                          </div>
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium mb-2">Rating Scale</h4>
                          <div className="grid grid-cols-5 gap-2 text-xs">
                            <div>1.0 - Poor</div>
                            <div>2.0 - Below Average</div>
                            <div>3.0 - Average</div>
                            <div>4.0 - Good</div>
                            <div>5.0 - Excellent</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 text-center">
                      <div>
                        <p className="text-gray-500">
                          Ratings are not available for appraisals with status "{selectedAppraisal.status}".
                        </p>
                        <p className="text-gray-500 mt-1">Ratings will be visible once the appraisal is completed.</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="history" className="space-y-4 pt-4">
                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-4">Appraisal History</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Appraisal Created</span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(selectedAppraisal.appraisalDate), "PP")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Performance appraisal was scheduled for {selectedAppraisal.employee}.
                          </p>
                        </div>
                      </div>
                      {selectedAppraisal.status === "in_progress" && (
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Appraisal Started</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(new Date(selectedAppraisal.appraisalDate).getTime() + 86400000), "PP")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Performance evaluation process has been initiated.
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedAppraisal.status === "completed" && (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Appraisal Started</span>
                                <span className="text-xs text-gray-500">
                                  {format(
                                    new Date(new Date(selectedAppraisal.appraisalDate).getTime() + 86400000),
                                    "PP",
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Performance evaluation process has been initiated.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-purple-500 mt-2"></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Self Assessment Completed</span>
                                <span className="text-xs text-gray-500">
                                  {format(
                                    new Date(new Date(selectedAppraisal.appraisalDate).getTime() + 172800000),
                                    "PP",
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Employee completed self-assessment portion of the appraisal.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Manager Review Completed</span>
                                <span className="text-xs text-gray-500">
                                  {format(
                                    new Date(new Date(selectedAppraisal.appraisalDate).getTime() + 259200000),
                                    "PP",
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Manager completed their review and provided ratings.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Appraisal Completed</span>
                                <span className="text-xs text-gray-500">
                                  {format(
                                    new Date(new Date(selectedAppraisal.appraisalDate).getTime() + 345600000),
                                    "PP",
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                Performance appraisal process completed with an overall rating of{" "}
                                {selectedAppraisal.overallRating.toFixed(1)}.
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
