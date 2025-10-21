"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView, type DetailTab } from "@/app/admin/components/details-view"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, Users, DollarSign } from "lucide-react"

// Mock data for training programs
const trainings = [
  {
    id: "1",
    title: "Leadership Development Program",
    type: "Professional Development",
    trainer: "Dr. Adebayo Johnson",
    startDate: "2023-06-01T00:00:00.000Z",
    endDate: "2023-06-05T00:00:00.000Z",
    cost: 250000,
    status: "completed",
    location: "Lagos Training Center",
    participants: 15,
    description:
      "A comprehensive leadership development program designed for middle managers to enhance their leadership capabilities and strategic thinking.",
    objectives:
      "Develop leadership skills, improve decision-making abilities, enhance team management capabilities, foster strategic thinking.",
    materials: "Leadership handbook, case studies, presentation slides",
    feedback: 4.8,
    createdAt: "2023-05-01T00:00:00.000Z",
    updatedAt: "2023-06-10T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Advanced Excel for Data Analysis",
    type: "Technical Skills",
    trainer: "Mrs. Funmi Adeyemi",
    startDate: "2023-06-15T00:00:00.000Z",
    endDate: "2023-06-16T00:00:00.000Z",
    cost: 120000,
    status: "upcoming",
    location: "Virtual",
    participants: 25,
    description:
      "Master advanced Excel functions and data analysis techniques for improved productivity and data-driven decision making.",
    objectives:
      "Learn advanced Excel functions, develop data analysis skills, create dynamic dashboards, master pivot tables and data visualization.",
    materials: "Excel workbooks, practice datasets, reference guide",
    feedback: null,
    createdAt: "2023-05-15T00:00:00.000Z",
    updatedAt: "2023-05-15T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Customer Service Excellence",
    type: "Soft Skills",
    trainer: "Mr. Emmanuel Okafor",
    startDate: "2023-05-20T00:00:00.000Z",
    endDate: "2023-05-21T00:00:00.000Z",
    cost: 100000,
    status: "completed",
    location: "Abuja Office",
    participants: 30,
    description:
      "Enhance customer service skills to deliver exceptional experiences and improve customer satisfaction and loyalty.",
    objectives:
      "Improve communication skills, develop problem-solving abilities, enhance customer satisfaction, manage difficult customer situations.",
    materials: "Customer service handbook, role-play scenarios, assessment tools",
    feedback: 4.5,
    createdAt: "2023-04-10T00:00:00.000Z",
    updatedAt: "2023-05-25T00:00:00.000Z",
  },
  {
    id: "4",
    title: "Cybersecurity Fundamentals",
    type: "Technical Skills",
    trainer: "Mr. Taiwo Adesina",
    startDate: "2023-07-10T00:00:00.000Z",
    endDate: "2023-07-12T00:00:00.000Z",
    cost: 180000,
    status: "upcoming",
    location: "Lagos Training Center",
    participants: 20,
    description: "Learn essential cybersecurity concepts and best practices to protect organizational assets and data.",
    objectives:
      "Understand cybersecurity threats, implement security measures, develop incident response plans, comply with security regulations.",
    materials: "Security handbook, practice labs, assessment tools",
    feedback: null,
    createdAt: "2023-06-01T00:00:00.000Z",
    updatedAt: "2023-06-01T00:00:00.000Z",
  },
  {
    id: "5",
    title: "Project Management Essentials",
    type: "Professional Development",
    trainer: "Mrs. Ngozi Eze",
    startDate: "2023-05-10T00:00:00.000Z",
    endDate: "2023-05-12T00:00:00.000Z",
    cost: 150000,
    status: "completed",
    location: "Port Harcourt Office",
    participants: 18,
    description:
      "Master the fundamentals of project management to successfully plan, execute, and close projects on time and within budget.",
    objectives:
      "Learn project planning techniques, develop risk management skills, enhance team coordination, master project documentation.",
    materials: "Project management handbook, case studies, templates",
    feedback: 4.2,
    createdAt: "2023-04-01T00:00:00.000Z",
    updatedAt: "2023-05-15T00:00:00.000Z",
  },
]

export function TrainingListContent() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form fields for adding/editing training programs
  const formFields: FormField[] = [
    {
      name: "title",
      label: "Training Title",
      type: "text",
      placeholder: "Enter training title",
      required: true,
    },
    {
      name: "type",
      label: "Training Type",
      type: "select",
      options: [
        { value: "Professional Development", label: "Professional Development" },
        { value: "Technical Skills", label: "Technical Skills" },
        { value: "Soft Skills", label: "Soft Skills" },
        { value: "Compliance", label: "Compliance" },
        { value: "Onboarding", label: "Onboarding" },
      ],
      required: true,
    },
    {
      name: "trainer",
      label: "Trainer",
      type: "text",
      placeholder: "Enter trainer name",
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
      name: "cost",
      label: "Cost (₦)",
      type: "number",
      placeholder: "Enter cost in Naira",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "upcoming", label: "Upcoming" },
        { value: "in-progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
      required: true,
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "Enter training location",
      required: true,
    },
    {
      name: "participants",
      label: "Number of Participants",
      type: "number",
      placeholder: "Enter number of participants",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter training description",
      required: true,
    },
    {
      name: "objectives",
      label: "Objectives",
      type: "textarea",
      placeholder: "Enter training objectives",
      required: true,
    },
    {
      name: "materials",
      label: "Training Materials",
      type: "textarea",
      placeholder: "Enter training materials",
      required: true,
    },
  ]

  const handleAdd = () => {
    setIsEditing(false)
    setSelectedTraining(null)
    setAddEditDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const training = trainings.find((t) => t.id === id)
    setSelectedTraining(training)
    setIsEditing(true)
    setAddEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const training = trainings.find((t) => t.id === id)
    setSelectedTraining(training)
    setViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log("Deleting training with ID:", id)
    // Here you would typically make an API call to delete the training
  }

  const handleSubmit = (data: Record<string, any>) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Submitting data:", data)
      setIsLoading(false)
      setAddEditDialogOpen(false)
      // Here you would typically make an API call to add/update the training
    }, 1000)
  }

  // Detail sections for viewing training details
  const detailTabs: DetailTab[] = [
    {
      id: "details",
      label: "Details",
      sections: [
        {
          title: "Training Information",
          fields: [
            {
              label: "Training Title",
              value: selectedTraining?.title || "",
              type: "text",
            },
            {
              label: "Training Type",
              value: selectedTraining?.type || "",
              type: "badge",
            },
            {
              label: "Trainer",
              value: selectedTraining?.trainer || "",
              type: "text",
            },
            {
              label: "Start Date",
              value: selectedTraining?.startDate || "",
              type: "date",
            },
            {
              label: "End Date",
              value: selectedTraining?.endDate || "",
              type: "date",
            },
            {
              label: "Status",
              value: selectedTraining?.status || "",
              type: "status",
              options: {
                statusMap: {
                  upcoming: { label: "Upcoming", color: "bg-blue-100 text-blue-800" },
                  "in-progress": { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
                  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
                  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
                },
              },
            },
          ],
        },
        {
          title: "Location & Participants",
          fields: [
            {
              label: "Location",
              value: selectedTraining?.location || "",
              type: "text",
            },
            {
              label: "Number of Participants",
              value: selectedTraining?.participants || "",
              type: "text",
            },
            {
              label: "Cost",
              value: selectedTraining?.cost || "",
              type: "currency",
              options: {
                currency: "NGN",
              },
            },
            {
              label: "Feedback Rating",
              value: selectedTraining?.feedback || "Not yet rated",
              type: "text",
            },
          ],
        },
        {
          title: "Content",
          fields: [
            {
              label: "Description",
              value: selectedTraining?.description || "",
              type: "text",
            },
            {
              label: "Objectives",
              value: selectedTraining?.objectives || "",
              type: "text",
            },
            {
              label: "Training Materials",
              value: selectedTraining?.materials || "",
              type: "text",
            },
          ],
        },
      ],
    },
    {
      id: "participants",
      label: "Participants",
      sections: [
        {
          title: "Participant List",
          fields: [
            {
              label: "Note",
              value:
                "Participant details would be displayed here. This is a placeholder for the actual participant data.",
              type: "text",
            },
          ],
        },
      ],
    },
    {
      id: "resources",
      label: "Resources",
      sections: [
        {
          title: "Training Resources",
          fields: [
            {
              label: "Note",
              value:
                "Training resources and materials would be displayed here. This is a placeholder for the actual resource data.",
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
        title="Training Programs"
        description="Manage employee training programs and track their progress"
        columns={[
          {
            key: "title",
            label: "Training Title",
            sortable: true,
          },
          {
            key: "type",
            label: "Type",
            sortable: true,
          },
          {
            key: "trainer",
            label: "Trainer",
            sortable: true,
          },
          {
            key: "startDate",
            label: "Start Date",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                {format(new Date(value), "MMM d, yyyy")}
              </div>
            ),
          },
          {
            key: "participants",
            label: "Participants",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-gray-500" />
                {value}
              </div>
            ),
          },
          {
            key: "cost",
            label: "Cost",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-gray-500" />₦{value.toLocaleString()}
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            sortable: true,
            render: (value, row) => {
              let badgeClass = ""
              let statusText = ""

              switch (value) {
                case "upcoming":
                  badgeClass = "bg-blue-100 text-blue-800"
                  statusText = "Upcoming"
                  break
                case "in-progress":
                  badgeClass = "bg-yellow-100 text-yellow-800"
                  statusText = "In Progress"
                  break
                case "completed":
                  badgeClass = "bg-green-100 text-green-800"
                  statusText = "Completed"
                  break
                case "cancelled":
                  badgeClass = "bg-red-100 text-red-800"
                  statusText = "Cancelled"
                  break
                default:
                  badgeClass = "bg-gray-100 text-gray-800"
                  statusText = value
              }

              return <Badge className={badgeClass}>{statusText}</Badge>
            },
          },
        ]}
        data={trainings}
        filterOptions={[
          {
            id: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "upcoming", label: "Upcoming" },
              { value: "in-progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            id: "type",
            label: "Type",
            type: "select",
            options: [
              { value: "Professional Development", label: "Professional Development" },
              { value: "Technical Skills", label: "Technical Skills" },
              { value: "Soft Skills", label: "Soft Skills" },
              { value: "Compliance", label: "Compliance" },
              { value: "Onboarding", label: "Onboarding" },
            ],
          },
          {
            id: "startDate",
            label: "Start Date",
            type: "date",
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
            <DialogTitle>{isEditing ? "Edit Training Program" : "Add Training Program"}</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={() => setAddEditDialogOpen(false)}
            isSubmitting={isLoading}
            submitLabel={isEditing ? "Update" : "Create"}
            initialValues={selectedTraining}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {selectedTraining && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DetailsView
              title={selectedTraining.title}
              subtitle={`${selectedTraining.type} • ${format(new Date(selectedTraining.startDate), "MMMM d, yyyy")}`}
              data={selectedTraining}
              tabs={detailTabs}
              onEdit={() => {
                setViewDialogOpen(false)
                handleEdit(selectedTraining.id)
              }}
              onPrint={() => window.print()}
              onExport={() => console.log("Exporting training details")}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
