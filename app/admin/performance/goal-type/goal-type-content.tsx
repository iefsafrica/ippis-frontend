"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Check, X } from "lucide-react"

// Mock data for goal types
const mockGoalTypes = [
  {
    id: "1",
    name: "Performance Improvement",
    description: "Goals focused on improving employee performance in specific areas",
    status: "active",
    createdAt: "2023-05-10T08:00:00Z",
  },
  {
    id: "2",
    name: "Professional Development",
    description: "Goals related to acquiring new skills and professional growth",
    status: "active",
    createdAt: "2023-06-15T10:30:00Z",
  },
  {
    id: "3",
    name: "Project Completion",
    description: "Goals tied to successful completion of assigned projects",
    status: "active",
    createdAt: "2023-07-20T14:45:00Z",
  },
  {
    id: "4",
    name: "Leadership Development",
    description: "Goals focused on developing leadership capabilities",
    status: "inactive",
    createdAt: "2023-08-05T09:15:00Z",
  },
  {
    id: "5",
    name: "Innovation",
    description: "Goals related to developing new ideas and approaches",
    status: "active",
    createdAt: "2023-09-12T11:20:00Z",
  },
]

// Form fields for adding/editing goal types
const goalTypeFields: FormField[] = [
  {
    name: "name",
    label: "Goal Type Name",
    type: "text",
    placeholder: "Enter goal type name",
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
    label: "Goal Type",
    sortable: true,
  },
  {
    key: "description",
    label: "Description",
    sortable: false,
    render: (value: string) => (
      <div className="max-w-xs truncate" title={value}>
        {value}
      </div>
    ),
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
  {
    key: "createdAt",
    label: "Created Date",
    sortable: true,
    render: (value: string) => format(new Date(value), "PPP"),
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
      { value: "inactive", label: "Inactive" },
    ],
  },
]

export default function GoalTypeContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedGoalType, setSelectedGoalType] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = () => {
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const goalType = mockGoalTypes.find((item) => item.id === id)
    setSelectedGoalType(goalType)
    setIsEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const goalType = mockGoalTypes.find((item) => item.id === id)
    setSelectedGoalType(goalType)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    // In a real app, this would call an API to delete the goal type
    console.log("Delete goal type with ID:", id)
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Add goal type:", data)
      setIsSubmitting(false)
      setIsAddDialogOpen(false)
    }, 1000)
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log("Edit goal type:", { id: selectedGoalType.id, ...data })
      setIsSubmitting(false)
      setIsEditDialogOpen(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        title="Goal Types"
        description="Manage performance goal types"
        columns={columns}
        data={mockGoalTypes}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Add Goal Type Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Goal Type</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={goalTypeFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Add Goal Type"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Goal Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Goal Type</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={goalTypeFields}
            onSubmit={handleSubmitEdit}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Update Goal Type"
            initialValues={selectedGoalType}
          />
        </DialogContent>
      </Dialog>

      {/* View Goal Type Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Goal Type Details</DialogTitle>
          </DialogHeader>
          {selectedGoalType && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Goal Type Name</h3>
                    <p className="text-base">{selectedGoalType.name}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="text-base">{selectedGoalType.description}</p>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge
                      variant={selectedGoalType.status === "active" ? "success" : "secondary"}
                      className="capitalize"
                    >
                      {selectedGoalType.status === "active" ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : (
                        <X className="mr-1 h-3 w-3" />
                      )}
                      {selectedGoalType.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                    <p className="text-base">{format(new Date(selectedGoalType.createdAt), "PPP")}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="usage" className="space-y-4 pt-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-2">Usage Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Goals</span>
                      <span className="text-sm font-medium">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Active Goals</span>
                      <span className="text-sm font-medium">18</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Completed Goals</span>
                      <span className="text-sm font-medium">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Employees Using</span>
                      <span className="text-sm font-medium">15</span>
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
