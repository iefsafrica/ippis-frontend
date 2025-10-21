"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView, type DetailTab } from "@/app/admin/components/details-view"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Star, Award, Calendar, DollarSign } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for trainers
const trainers = [
  {
    id: "1",
    name: "Dr. Adebayo Johnson",
    email: "adebayo.johnson@example.com",
    phone: "+234 801 234 5678",
    specialization: "Leadership Development",
    type: "internal",
    department: "Human Resources",
    qualification: "PhD in Organizational Psychology",
    experience: 12,
    rating: 4.8,
    status: "active",
    address: "Lagos, Nigeria",
    bio: "Dr. Adebayo Johnson is a seasoned leadership development expert with over 12 years of experience in training and development. He specializes in executive coaching and team building.",
    trainingCount: 15,
    hourlyRate: null,
    availability: "Full-time",
    createdAt: "2022-05-10T00:00:00.000Z",
    updatedAt: "2023-03-15T00:00:00.000Z",
    profileImage: "/diverse-group.png",
  },
  {
    id: "2",
    name: "Mrs. Funmi Adeyemi",
    email: "funmi.adeyemi@example.com",
    phone: "+234 802 345 6789",
    specialization: "Technical Skills",
    type: "internal",
    department: "Information Technology",
    qualification: "MSc in Computer Science",
    experience: 8,
    rating: 4.6,
    status: "active",
    address: "Abuja, Nigeria",
    bio: "Mrs. Funmi Adeyemi is an IT professional with expertise in data analysis and software development. She has conducted numerous training sessions on technical skills development.",
    trainingCount: 22,
    hourlyRate: null,
    availability: "Full-time",
    createdAt: "2022-06-15T00:00:00.000Z",
    updatedAt: "2023-02-20T00:00:00.000Z",
    profileImage: "/diverse-woman-portrait.png",
  },
  {
    id: "3",
    name: "Mr. Emmanuel Okafor",
    email: "emmanuel.okafor@example.com",
    phone: "+234 803 456 7890",
    specialization: "Soft Skills",
    type: "external",
    department: null,
    qualification: "MBA, Certified Trainer",
    experience: 10,
    rating: 4.9,
    status: "active",
    address: "Port Harcourt, Nigeria",
    bio: "Mr. Emmanuel Okafor is a professional trainer specializing in communication skills, customer service, and team building. He has worked with various organizations across different industries.",
    trainingCount: 30,
    hourlyRate: 25000,
    availability: "Contract basis",
    createdAt: "2022-07-20T00:00:00.000Z",
    updatedAt: "2023-04-05T00:00:00.000Z",
    profileImage: "/thoughtful-man.png",
  },
  {
    id: "4",
    name: "Mr. Taiwo Adesina",
    email: "taiwo.adesina@example.com",
    phone: "+234 804 567 8901",
    specialization: "Cybersecurity",
    type: "external",
    department: null,
    qualification: "MSc in Cybersecurity, CISSP",
    experience: 15,
    rating: 4.7,
    status: "active",
    address: "Lagos, Nigeria",
    bio: "Mr. Taiwo Adesina is a cybersecurity expert with extensive experience in information security training. He has conducted workshops for various organizations on cybersecurity awareness and best practices.",
    trainingCount: 18,
    hourlyRate: 30000,
    availability: "Contract basis",
    createdAt: "2022-08-05T00:00:00.000Z",
    updatedAt: "2023-03-10T00:00:00.000Z",
    profileImage: "/professional-teamwork.png",
  },
  {
    id: "5",
    name: "Mrs. Ngozi Eze",
    email: "ngozi.eze@example.com",
    phone: "+234 805 678 9012",
    specialization: "Project Management",
    type: "internal",
    department: "Operations",
    qualification: "PMP, MBA",
    experience: 9,
    rating: 4.5,
    status: "active",
    address: "Enugu, Nigeria",
    bio: "Mrs. Ngozi Eze is a certified project management professional with expertise in project planning, execution, and control. She has trained numerous teams on project management methodologies and tools.",
    trainingCount: 12,
    hourlyRate: null,
    availability: "Full-time",
    createdAt: "2022-09-15T00:00:00.000Z",
    updatedAt: "2023-01-20T00:00:00.000Z",
    profileImage: "/confident-businesswoman.png",
  },
  {
    id: "6",
    name: "Dr. Chukwudi Nnamdi",
    email: "chukwudi.nnamdi@example.com",
    phone: "+234 806 789 0123",
    specialization: "Health and Safety",
    type: "external",
    department: null,
    qualification: "MD, Certified Health and Safety Trainer",
    experience: 20,
    rating: 4.9,
    status: "inactive",
    address: "Abuja, Nigeria",
    bio: "Dr. Chukwudi Nnamdi is a medical doctor and certified health and safety trainer. He specializes in workplace health and safety training, first aid, and emergency response procedures.",
    trainingCount: 25,
    hourlyRate: 35000,
    availability: "Contract basis",
    createdAt: "2022-10-10T00:00:00.000Z",
    updatedAt: "2023-02-15T00:00:00.000Z",
    profileImage: "/caring-doctor.png",
  },
]

export function TrainersContent() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form fields for adding/editing trainers
  const formFields: FormField[] = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter trainer's full name",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text",
      placeholder: "Enter phone number",
      required: true,
    },
    {
      name: "type",
      label: "Trainer Type",
      type: "select",
      options: [
        { value: "internal", label: "Internal" },
        { value: "external", label: "External" },
      ],
      required: true,
    },
    {
      name: "department",
      label: "Department",
      type: "text",
      placeholder: "Enter department (for internal trainers)",
      required: false,
    },
    {
      name: "specialization",
      label: "Specialization",
      type: "text",
      placeholder: "Enter area of specialization",
      required: true,
    },
    {
      name: "qualification",
      label: "Qualifications",
      type: "text",
      placeholder: "Enter qualifications",
      required: true,
    },
    {
      name: "experience",
      label: "Years of Experience",
      type: "number",
      placeholder: "Enter years of experience",
      required: true,
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter address",
      required: true,
    },
    {
      name: "hourlyRate",
      label: "Hourly Rate (₦)",
      type: "number",
      placeholder: "Enter hourly rate (for external trainers)",
      required: false,
    },
    {
      name: "availability",
      label: "Availability",
      type: "select",
      options: [
        { value: "Full-time", label: "Full-time" },
        { value: "Part-time", label: "Part-time" },
        { value: "Contract basis", label: "Contract basis" },
        { value: "Weekends only", label: "Weekends only" },
      ],
      required: true,
    },
    {
      name: "bio",
      label: "Biography",
      type: "textarea",
      placeholder: "Enter trainer's biography",
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
    setSelectedTrainer(null)
    setAddEditDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const trainer = trainers.find((t) => t.id === id)
    setSelectedTrainer(trainer)
    setIsEditing(true)
    setAddEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const trainer = trainers.find((t) => t.id === id)
    setSelectedTrainer(trainer)
    setViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log("Deleting trainer with ID:", id)
    // Here you would typically make an API call to delete the trainer
  }

  const handleSubmit = (data: Record<string, any>) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Submitting data:", data)
      setIsLoading(false)
      setAddEditDialogOpen(false)
      // Here you would typically make an API call to add/update the trainer
    }, 1000)
  }

  // Detail sections for viewing trainer details
  const detailTabs: DetailTab[] = [
    {
      id: "details",
      label: "Details",
      sections: [
        {
          title: "Personal Information",
          fields: [
            {
              label: "Full Name",
              value: selectedTrainer?.name || "",
              type: "text",
            },
            {
              label: "Email Address",
              value: selectedTrainer?.email || "",
              type: "email",
            },
            {
              label: "Phone Number",
              value: selectedTrainer?.phone || "",
              type: "phone",
            },
            {
              label: "Address",
              value: selectedTrainer?.address || "",
              type: "text",
            },
            {
              label: "Trainer Type",
              value: selectedTrainer?.type || "",
              type: "badge",
            },
            {
              label: "Status",
              value: selectedTrainer?.status || "",
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
          title: "Professional Information",
          fields: [
            {
              label: "Specialization",
              value: selectedTrainer?.specialization || "",
              type: "text",
            },
            {
              label: "Department",
              value: selectedTrainer?.department || "N/A",
              type: "text",
            },
            {
              label: "Qualifications",
              value: selectedTrainer?.qualification || "",
              type: "text",
            },
            {
              label: "Years of Experience",
              value: selectedTrainer?.experience || "",
              type: "text",
            },
            {
              label: "Hourly Rate",
              value: selectedTrainer?.hourlyRate ? `₦${selectedTrainer.hourlyRate.toLocaleString()}` : "N/A",
              type: "text",
            },
            {
              label: "Availability",
              value: selectedTrainer?.availability || "",
              type: "text",
            },
          ],
        },
        {
          title: "Biography",
          fields: [
            {
              label: "Bio",
              value: selectedTrainer?.bio || "",
              type: "text",
            },
          ],
        },
        {
          title: "Statistics",
          fields: [
            {
              label: "Training Programs Conducted",
              value: selectedTrainer?.trainingCount || "0",
              type: "text",
            },
            {
              label: "Average Rating",
              value: selectedTrainer?.rating ? `${selectedTrainer.rating}/5` : "Not rated",
              type: "text",
            },
            {
              label: "Created On",
              value: selectedTrainer?.createdAt || "",
              type: "date",
            },
            {
              label: "Last Updated",
              value: selectedTrainer?.updatedAt || "",
              type: "date",
            },
          ],
        },
      ],
    },
    {
      id: "trainings",
      label: "Training History",
      sections: [
        {
          title: "Training Programs",
          fields: [
            {
              label: "Note",
              value: "Training history would be displayed here. This is a placeholder for the actual training data.",
              type: "text",
            },
          ],
        },
      ],
    },
    {
      id: "feedback",
      label: "Feedback & Ratings",
      sections: [
        {
          title: "Participant Feedback",
          fields: [
            {
              label: "Note",
              value:
                "Participant feedback and ratings would be displayed here. This is a placeholder for the actual feedback data.",
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
        title="Trainers"
        description="Manage internal and external training facilitators, their expertise areas, and availability"
        columns={[
          {
            key: "name",
            label: "Trainer Name",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={row.profileImage || "/placeholder.svg"} alt={value} />
                  <AvatarFallback>
                    {value
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{value}</div>
                  <div className="text-sm text-gray-500">{row.specialization}</div>
                </div>
              </div>
            ),
          },
          {
            key: "type",
            label: "Type",
            sortable: true,
            render: (value, row) => (
              <Badge className={value === "internal" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                {value === "internal" ? "Internal" : "External"}
              </Badge>
            ),
          },
          {
            key: "email",
            label: "Contact",
            sortable: true,
            render: (value, row) => (
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-3 w-3 text-gray-500" />
                  {value}
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-3 w-3 text-gray-500" />
                  {row.phone}
                </div>
              </div>
            ),
          },
          {
            key: "experience",
            label: "Experience",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <Award className="mr-2 h-4 w-4 text-gray-500" />
                {value} years
              </div>
            ),
          },
          {
            key: "rating",
            label: "Rating",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-500" />
                <span>{value || "—"}</span>
              </div>
            ),
          },
          {
            key: "trainingCount",
            label: "Trainings",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
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
        data={trainers}
        filterOptions={[
          {
            id: "type",
            label: "Trainer Type",
            type: "select",
            options: [
              { value: "internal", label: "Internal" },
              { value: "external", label: "External" },
            ],
          },
          {
            id: "specialization",
            label: "Specialization",
            type: "select",
            options: [
              { value: "Leadership Development", label: "Leadership Development" },
              { value: "Technical Skills", label: "Technical Skills" },
              { value: "Soft Skills", label: "Soft Skills" },
              { value: "Cybersecurity", label: "Cybersecurity" },
              { value: "Project Management", label: "Project Management" },
              { value: "Health and Safety", label: "Health and Safety" },
            ],
          },
          {
            id: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
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
            <DialogTitle>{isEditing ? "Edit Trainer" : "Add Trainer"}</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={() => setAddEditDialogOpen(false)}
            isSubmitting={isLoading}
            submitLabel={isEditing ? "Update" : "Create"}
            initialValues={selectedTrainer}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {selectedTrainer && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DetailsView
              title={selectedTrainer.name}
              subtitle={`${selectedTrainer.specialization} • ${selectedTrainer.type === "internal" ? "Internal Trainer" : "External Trainer"}`}
              data={selectedTrainer}
              tabs={detailTabs}
              headerContent={
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedTrainer.profileImage || "/placeholder.svg"} alt={selectedTrainer.name} />
                    <AvatarFallback className="text-2xl">
                      {selectedTrainer.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">{selectedTrainer.rating || "Not rated"}</span>
                      <span className="text-gray-500">•</span>
                      <span>{selectedTrainer.trainingCount} trainings conducted</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-500">
                        <Mail className="mr-1 h-4 w-4" />
                        <a href={`mailto:${selectedTrainer.email}`} className="hover:text-blue-600">
                          {selectedTrainer.email}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Phone className="mr-1 h-4 w-4" />
                        <a href={`tel:${selectedTrainer.phone}`} className="hover:text-blue-600">
                          {selectedTrainer.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      {selectedTrainer.address}
                    </div>
                    {selectedTrainer.type === "external" && selectedTrainer.hourlyRate && (
                      <div className="flex items-center text-gray-500">
                        <DollarSign className="mr-1 h-4 w-4" />₦{selectedTrainer.hourlyRate.toLocaleString()} per hour
                      </div>
                    )}
                  </div>
                </div>
              }
              onEdit={() => {
                setViewDialogOpen(false)
                handleEdit(selectedTrainer.id)
              }}
              onPrint={() => window.print()}
              onExport={() => console.log("Exporting trainer details")}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
