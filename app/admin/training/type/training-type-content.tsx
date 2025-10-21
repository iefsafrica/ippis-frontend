"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView, type DetailTab } from "@/app/admin/components/details-view"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, CheckCircle, Clock } from "lucide-react"

// Mock data for training types
const trainingTypes = [
  {
    id: "1",
    name: "Professional Development",
    description: "Training focused on enhancing professional skills and career advancement",
    category: "Career Growth",
    duration: "3-5 days",
    isRequired: true,
    targetAudience: "All employees",
    certificationRequired: true,
    assessmentMethod: "Written exam, Practical assessment",
    createdAt: "2023-01-15T00:00:00.000Z",
    updatedAt: "2023-03-10T00:00:00.000Z",
    status: "active",
    trainingCount: 12,
  },
  {
    id: "2",
    name: "Technical Skills",
    description: "Training focused on specific technical skills and tools",
    category: "Skills Development",
    duration: "2-3 days",
    isRequired: false,
    targetAudience: "Technical staff",
    certificationRequired: true,
    assessmentMethod: "Practical assessment, Project submission",
    createdAt: "2023-01-20T00:00:00.000Z",
    updatedAt: "2023-02-15T00:00:00.000Z",
    status: "active",
    trainingCount: 18,
  },
  {
    id: "3",
    name: "Soft Skills",
    description: "Training focused on interpersonal and communication skills",
    category: "Personal Development",
    duration: "1-2 days",
    isRequired: true,
    targetAudience: "All employees",
    certificationRequired: false,
    assessmentMethod: "Role play, Group discussion",
    createdAt: "2023-02-05T00:00:00.000Z",
    updatedAt: "2023-02-05T00:00:00.000Z",
    status: "active",
    trainingCount: 8,
  },
  {
    id: "4",
    name: "Compliance",
    description: "Training focused on regulatory compliance and organizational policies",
    category: "Regulatory",
    duration: "1 day",
    isRequired: true,
    targetAudience: "All employees",
    certificationRequired: true,
    assessmentMethod: "Multiple choice test",
    createdAt: "2023-02-10T00:00:00.000Z",
    updatedAt: "2023-04-15T00:00:00.000Z",
    status: "active",
    trainingCount: 6,
  },
  {
    id: "5",
    name: "Onboarding",
    description: "Training for new employees to familiarize them with the organization",
    category: "Orientation",
    duration: "3-5 days",
    isRequired: true,
    targetAudience: "New employees",
    certificationRequired: false,
    assessmentMethod: "Feedback form",
    createdAt: "2023-01-05T00:00:00.000Z",
    updatedAt: "2023-03-20T00:00:00.000Z",
    status: "active",
    trainingCount: 4,
  },
  {
    id: "6",
    name: "Leadership",
    description: "Training focused on leadership skills and management techniques",
    category: "Career Growth",
    duration: "3-5 days",
    isRequired: false,
    targetAudience: "Managers and supervisors",
    certificationRequired: true,
    assessmentMethod: "Case study analysis, Presentation",
    createdAt: "2023-03-01T00:00:00.000Z",
    updatedAt: "2023-03-01T00:00:00.000Z",
    status: "active",
    trainingCount: 7,
  },
  {
    id: "7",
    name: "Health and Safety",
    description: "Training on workplace health and safety procedures",
    category: "Regulatory",
    duration: "1 day",
    isRequired: true,
    targetAudience: "All employees",
    certificationRequired: true,
    assessmentMethod: "Multiple choice test, Practical demonstration",
    createdAt: "2023-02-20T00:00:00.000Z",
    updatedAt: "2023-04-10T00:00:00.000Z",
    status: "active",
    trainingCount: 3,
  },
]

export function TrainingTypeContent() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTrainingType, setSelectedTrainingType] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form fields for adding/editing training types
  const formFields: FormField[] = [
    {
      name: "name",
      label: "Training Type Name",
      type: "text",
      placeholder: "Enter training type name",
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
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "Career Growth", label: "Career Growth" },
        { value: "Skills Development", label: "Skills Development" },
        { value: "Personal Development", label: "Personal Development" },
        { value: "Regulatory", label: "Regulatory" },
        { value: "Orientation", label: "Orientation" },
      ],
      required: true,
    },
    {
      name: "duration",
      label: "Typical Duration",
      type: "text",
      placeholder: "e.g., 1-2 days, 3 hours, etc.",
      required: true,
    },
    {
      name: "isRequired",
      label: "Required for All Employees",
      type: "switch",
      description: "Toggle if this training type is mandatory for all employees",
    },
    {
      name: "targetAudience",
      label: "Target Audience",
      type: "text",
      placeholder: "e.g., All employees, Managers, Technical staff",
      required: true,
    },
    {
      name: "certificationRequired",
      label: "Certification Required",
      type: "switch",
      description: "Toggle if this training type requires certification",
    },
    {
      name: "assessmentMethod",
      label: "Assessment Method",
      type: "textarea",
      placeholder: "e.g., Written exam, Practical assessment, Project submission",
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

  const handleAdd = () => {
    setIsEditing(false)
    setSelectedTrainingType(null)
    setAddEditDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const trainingType = trainingTypes.find((t) => t.id === id)
    setSelectedTrainingType(trainingType)
    setIsEditing(true)
    setAddEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const trainingType = trainingTypes.find((t) => t.id === id)
    setSelectedTrainingType(trainingType)
    setViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log("Deleting training type with ID:", id)
    // Here you would typically make an API call to delete the training type
  }

  const handleSubmit = (data: Record<string, any>) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Submitting data:", data)
      setIsLoading(false)
      setAddEditDialogOpen(false)
      // Here you would typically make an API call to add/update the training type
    }, 1000)
  }

  // Detail sections for viewing training type details
  const detailTabs: DetailTab[] = [
    {
      id: "details",
      label: "Details",
      sections: [
        {
          title: "Basic Information",
          fields: [
            {
              label: "Training Type Name",
              value: selectedTrainingType?.name || "",
              type: "text",
            },
            {
              label: "Description",
              value: selectedTrainingType?.description || "",
              type: "text",
            },
            {
              label: "Category",
              value: selectedTrainingType?.category || "",
              type: "badge",
            },
            {
              label: "Status",
              value: selectedTrainingType?.status || "",
              type: "status",
              options: {
                statusMap: {
                  active: { label: "Active", color: "bg-green-100 text-green-800" },
                  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-800" },
                },
              },
            },
          ],
        },
        {
          title: "Training Requirements",
          fields: [
            {
              label: "Typical Duration",
              value: selectedTrainingType?.duration || "",
              type: "text",
            },
            {
              label: "Required for All Employees",
              value: selectedTrainingType?.isRequired ? "Yes" : "No",
              type: "text",
            },
            {
              label: "Target Audience",
              value: selectedTrainingType?.targetAudience || "",
              type: "text",
            },
            {
              label: "Certification Required",
              value: selectedTrainingType?.certificationRequired ? "Yes" : "No",
              type: "text",
            },
            {
              label: "Assessment Method",
              value: selectedTrainingType?.assessmentMethod || "",
              type: "text",
            },
          ],
        },
        {
          title: "Statistics",
          fields: [
            {
              label: "Number of Trainings",
              value: selectedTrainingType?.trainingCount || "0",
              type: "text",
            },
            {
              label: "Created On",
              value: selectedTrainingType?.createdAt || "",
              type: "date",
            },
            {
              label: "Last Updated",
              value: selectedTrainingType?.updatedAt || "",
              type: "date",
            },
          ],
        },
      ],
    },
    {
      id: "trainings",
      label: "Associated Trainings",
      sections: [
        {
          title: "Training Programs",
          fields: [
            {
              label: "Note",
              value:
                "Associated training programs would be displayed here. This is a placeholder for the actual training data.",
              type: "text",
            },
          ],
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        title="Training Types"
        description="Manage different types of training programs offered within the organization"
        columns={[
          {
            key: "name",
            label: "Training Type",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4 text-gray-500" />
                {value}
              </div>
            ),
          },
          {
            key: "category",
            label: "Category",
            sortable: true,
          },
          {
            key: "duration",
            label: "Duration",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                {value}
              </div>
            ),
          },
          {
            key: "isRequired",
            label: "Required",
            sortable: true,
            render: (value, row) => (
              <Badge className={value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {value ? "Required" : "Optional"}
              </Badge>
            ),
          },
          {
            key: "certificationRequired",
            label: "Certification",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                {value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <span className="text-gray-500">—</span>}
              </div>
            ),
          },
          {
            key: "trainingCount",
            label: "Trainings",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-gray-500" />
                {value}
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            sortable: true,
            render: (value, row) => (
              <Badge className={value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {value === "active" ? "Active" : "Inactive"}
              </Badge>
            ),
          },
        ]}
        data={trainingTypes}
        filterOptions={[
          {
            id: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
          {
            id: "category",
            label: "Category",
            type: "select",
            options: [
              { value: "Career Growth", label: "Career Growth" },
              { value: "Skills Development", label: "Skills Development" },
              { value: "Personal Development", label: "Personal Development" },
              { value: "Regulatory", label: "Regulatory" },
              { value: "Orientation", label: "Orientation" },
            ],
          },
          {
            id: "isRequired",
            label: "Required",
            type: "checkbox",
            options: [
              { value: true, label: "Required" },
              { value: false, label: "Optional" },
            ],
          },
        ]}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={addEditDialogOpen} onOpenChange={setAddEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Training Type" : "Add Training Type"}</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={() => setAddEditDialogOpen(false)}
            isSubmitting={isLoading}
            submitLabel={isEditing ? "Update" : "Create"}
            initialValues={selectedTrainingType}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {selectedTrainingType && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DetailsView
              title={selectedTrainingType.name}
              subtitle={`${selectedTrainingType.category} • ${selectedTrainingType.trainingCount} training programs`}
              data={selectedTrainingType}
              tabs={detailTabs}
              onEdit={() => {
                setViewDialogOpen(false)
                handleEdit(selectedTrainingType.id)
              }}
              onPrint={() => window.print()}
              onExport={() => console.log("Exporting training type details")}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
