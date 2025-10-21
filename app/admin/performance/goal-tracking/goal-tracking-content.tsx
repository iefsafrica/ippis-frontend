"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"

// Mock data for goal tracking
const mockGoalTracking = [
  {
    id: "1",
    title: "Improve Customer Satisfaction Score",
    employee: "John Doe",
    employeeId: "EMP001",
    goalType: "Performance Improvement",
    startDate: "2023-01-15T00:00:00Z",
    endDate: "2023-06-30T00:00:00Z",
    progress: 75,
    status: "in_progress",
    description: "Increase customer satisfaction score from 85% to 95% by implementing feedback mechanisms.",
    department: "Customer Service",
  },
  {
    id: "2",
    title: "Complete Advanced Excel Training",
    employee: "Jane Smith",
    employeeId: "EMP002",
    goalType: "Professional Development",
    startDate: "2023-02-10T00:00:00Z",
    endDate: "2023-04-10T00:00:00Z",
    progress: 100,
    status: "completed",
    description: "Complete advanced Excel training course and obtain certification.",
    department: "Finance",
  },
  {
    id: "3",
    title: "Reduce Processing Time",
    employee: "Michael Johnson",
    employeeId: "EMP003",
    goalType: "Performance Improvement",
    startDate: "2023-03-01T00:00:00Z",
    endDate: "2023-08-31T00:00:00Z",
    progress: 40,
    status: "in_progress",
    description: "Reduce document processing time by 30% through process optimization.",
    department: "Operations",
  },
  {
    id: "4",
    title: "Implement New Reporting System",
    employee: "Sarah Williams",
    employeeId: "EMP004",
    goalType: "Project Completion",
    startDate: "2023-04-15T00:00:00Z",
    endDate: "2023-07-15T00:00:00Z",
    progress: 60,
    status: "in_progress",
    description: "Successfully implement the new reporting system and train team members.",
    department: "IT",
  },
  {
    id: "5",
    title: "Develop Team Management Skills",
    employee: "Robert Brown",
    employeeId: "EMP005",
    goalType: "Leadership Development",
    startDate: "2023-01-01T00:00:00Z",
    endDate: "2023-12-31T00:00:00Z",
    progress: 50,
    status: "in_progress",
    description: "Develop team management skills through training and mentorship programs.",
    department: "Human Resources",
  },
]

// Mock data for employees and goal types
const mockEmployees = [
  { value: "EMP001", label: "John Doe" },
  { value: "EMP002", label: "Jane Smith" },
  { value: "EMP003", label: "Michael Johnson" },
  { value: "EMP004", label: "Sarah Williams" },
  { value: "EMP005", label: "Robert Brown" },
]

const mockGoalTypes = [
  { value: "Performance Improvement", label: "Performance Improvement" },
  { value: "Professional Development", label: "Professional Development" },
  { value: "Project Completion", label: "Project Completion" },
  { value: "Leadership Development", label: "Leadership Development" },
  { value: "Innovation", label: "Innovation" },
]

const mockDepartments = [
  { value: "Customer Service", label: "Customer Service" },
  { value: "Finance", label: "Finance" },
  { value: "Operations", label: "Operations" },
  { value: "IT", label: "IT" },
  { value: "Human Resources", label: "Human Resources" },
]

// Form fields for adding/editing goal tracking
const goalTrackingFields: FormField[] = [
  {
    name: "title",
    label: "Goal Title",
    type: "text",
    placeholder: "Enter goal title",
    required: true,
  },
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
    name: "goalType",
    label: "Goal Type",
    type: "select",
    options: mockGoalTypes,
    required: true,
  },
  {
    name: "startDate",
    label: "Start Date",
    type: "date",
    required: true,
  },
  {
    name: "endDate",
    label: "End Date",
    type: "date",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter goal description",
    required: true,
  },
  {
    name: "progress",
    label: "Progress (%)",
    type: "number",
    min: 0,
    max: 100,
    step: 5,
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "not_started", label: "Not Started" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
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
    key: "title",
    label: "Goal Title",
    sortable: true,
  },
  {
    key: "employee",
    label: "Employee",
    sortable: true,
  },
  {
    key: "goalType",
    label: "Goal Type",
    sortable: true,
  },
  {
    key: "startDate",
    label: "Start Date",
    sortable: true,
    render: (value: string) => format(new Date(value), "PP"),
  },
  {
    key: "endDate",
    label: "End Date",
    sortable: true,
    render: (value: string) => format(new Date(value), "PP"),
  },
  {
    key: "progress",
    label: "Progress",
    sortable: true,
    render: (value: number) => (
      <div className="w-full flex items-center gap-2">
        <Progress value={value} className="h-2" />
        <span className="text-xs font-medium">{value}%</span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => {
      let badgeVariant = "default"
      let badgeText = "Unknown"

      switch (value) {
        case "not_started":
          badgeVariant = "outline"
          badgeText = "Not Started"
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
]

// Filter options
const filterOptions = [
  {
    id: "goalType",
    label: "Goal Type",
    type: "select" as const,
    options: mockGoalTypes,
  },
  {
    id: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "not_started", label: "Not Started" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    id: "department",
    label: "Department",
    type: "select" as const,
    options: mockDepartments,
  },
]

export default function GoalTrackingContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = () => {
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const goal = mockGoalTracking.find((item) => item.id === id)
    if (goal) {
      // Convert dates to Date objects for the form
      const formattedGoal = {
        ...goal,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate),
      }
      setSelectedGoal(formattedGoal)
      setIsEditDialogOpen(true)
    }
  }

  const handleView = (id: string) => {
    const goal = mockGoalTracking.find((item) => item.id === id)
    setSelectedGoal(goal)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    // In a real app, this would call an API to delete the goal
    console.log("Delete goal with ID:", id)
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Add goal:", data)
      setIsSubmitting(false)
      setIsAddDialogOpen(false)
    }, 1000)
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Edit goal:", { id: selectedGoal.id, ...data })
      setIsSubmitting(false)
      setIsEditDialogOpen(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        title="Goal Tracking"
        description="Track employee performance goals"
        columns={columns}
        data={mockGoalTracking}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Add Goal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={goalTrackingFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Add Goal"
            initialValues={{
              progress: 0,
              status: "not_started",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={goalTrackingFields}
            onSubmit={handleSubmitEdit}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Update Goal"
            initialValues={selectedGoal}
          />
        </DialogContent>
      </Dialog>

      {/* View Goal Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Goal Details</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Goal Title</h3>
                    <p className="text-base">{selectedGoal.title}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Employee</h3>
                    <p className="text-base">{selectedGoal.employee}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="text-base">{selectedGoal.department}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Goal Type</h3>
                    <p className="text-base">{selectedGoal.goalType}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                    <p className="text-base">{format(new Date(selectedGoal.startDate), "PPP")}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                    <p className="text-base">{format(new Date(selectedGoal.endDate), "PPP")}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge
                      variant={
                        selectedGoal.status === "completed"
                          ? "success"
                          : selectedGoal.status === "in_progress"
                            ? "secondary"
                            : selectedGoal.status === "cancelled"
                              ? "destructive"
                              : "outline"
                      }
                      className="capitalize"
                    >
                      {selectedGoal.status === "not_started"
                        ? "Not Started"
                        : selectedGoal.status === "in_progress"
                          ? "In Progress"
                          : selectedGoal.status === "completed"
                            ? "Completed"
                            : "Cancelled"}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedGoal.progress} className="h-2 w-full max-w-[200px]" />
                      <span>{selectedGoal.progress}%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="text-base">{selectedGoal.description}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="progress" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-2">Progress Overview</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Current Progress</span>
                          <span className="text-sm font-medium">{selectedGoal.progress}%</span>
                        </div>
                        <Progress value={selectedGoal.progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-md bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">Start Date</div>
                          <div className="font-medium">{format(new Date(selectedGoal.startDate), "PP")}</div>
                        </div>
                        <div className="rounded-md bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">End Date</div>
                          <div className="font-medium">{format(new Date(selectedGoal.endDate), "PP")}</div>
                        </div>
                        <div className="rounded-md bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">Days Remaining</div>
                          <div className="font-medium">
                            {Math.max(
                              0,
                              Math.ceil(
                                (new Date(selectedGoal.endDate).getTime() - new Date().getTime()) /
                                  (1000 * 60 * 60 * 24),
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-2">Progress Updates</h3>
                    <div className="space-y-3">
                      <div className="border-b pb-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Progress updated to 75%</span>
                          <span className="text-xs text-gray-500">2023-05-15</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Implemented customer feedback system and conducted initial training.
                        </p>
                      </div>
                      <div className="border-b pb-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Progress updated to 50%</span>
                          <span className="text-xs text-gray-500">2023-04-01</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Completed design phase of feedback system. Ready for implementation.
                        </p>
                      </div>
                      <div className="pb-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Progress updated to 25%</span>
                          <span className="text-xs text-gray-500">2023-02-20</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Started research on best practices for customer feedback systems.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="history" className="space-y-4 pt-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-2">Goal History</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Goal Created</span>
                          <span className="text-xs text-gray-500">2023-01-15</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Goal was created and assigned to employee.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Goal Accepted</span>
                          <span className="text-xs text-gray-500">2023-01-20</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Employee accepted the goal and started working.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Goal Modified</span>
                          <span className="text-xs text-gray-500">2023-03-10</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          End date extended by 1 month due to additional requirements.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-purple-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Progress Review</span>
                          <span className="text-xs text-gray-500">2023-05-01</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Manager reviewed progress and provided feedback. Progress is on track.
                        </p>
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
