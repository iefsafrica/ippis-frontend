"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView } from "@/app/admin/components/details-view"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

// Mock data
const jobPosts = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Engineering",
    positions: 3,
    postedDate: "2023-05-15T00:00:00.000Z",
    closingDate: "2023-06-15T00:00:00.000Z",
    status: "active",
    location: "Lagos, Nigeria",
    jobType: "Full-time",
    experience: "5+ years",
    salary: "₦500,000 - ₦800,000",
    description: "We are looking for a Senior Software Engineer to join our team...",
    requirements: "Bachelor's degree in Computer Science or related field...",
    responsibilities: "Design and develop high-quality software solutions...",
    createdAt: "2023-05-10T00:00:00.000Z",
    updatedAt: "2023-05-12T00:00:00.000Z",
    applications: 12,
    author: "John Doe",
  },
  {
    id: "2",
    title: "HR Manager",
    department: "Human Resources",
    positions: 1,
    postedDate: "2023-05-10T00:00:00.000Z",
    closingDate: "2023-06-10T00:00:00.000Z",
    status: "active",
    location: "Abuja, Nigeria",
    jobType: "Full-time",
    experience: "3+ years",
    salary: "₦400,000 - ₦600,000",
    description: "We are seeking an experienced HR Manager to oversee all HR functions...",
    requirements: "Bachelor's degree in Human Resources or related field...",
    responsibilities: "Develop and implement HR strategies and initiatives...",
    createdAt: "2023-05-08T00:00:00.000Z",
    updatedAt: "2023-05-09T00:00:00.000Z",
    applications: 8,
    author: "Jane Smith",
  },
  {
    id: "3",
    title: "Financial Analyst",
    department: "Finance",
    positions: 2,
    postedDate: "2023-05-05T00:00:00.000Z",
    closingDate: "2023-05-25T00:00:00.000Z",
    status: "closed",
    location: "Lagos, Nigeria",
    jobType: "Full-time",
    experience: "2+ years",
    salary: "₦350,000 - ₦500,000",
    description: "We are looking for a Financial Analyst to join our Finance team...",
    requirements: "Bachelor's degree in Finance, Accounting, or related field...",
    responsibilities: "Perform financial forecasting, reporting, and analysis...",
    createdAt: "2023-05-01T00:00:00.000Z",
    updatedAt: "2023-05-26T00:00:00.000Z",
    applications: 15,
    author: "Michael Johnson",
  },
  {
    id: "4",
    title: "Marketing Specialist",
    department: "Marketing",
    positions: 1,
    postedDate: "2023-05-20T00:00:00.000Z",
    closingDate: "2023-06-20T00:00:00.000Z",
    status: "active",
    location: "Remote",
    jobType: "Contract",
    experience: "2+ years",
    salary: "₦300,000 - ₦450,000",
    description: "We are seeking a Marketing Specialist to help grow our brand...",
    requirements: "Bachelor's degree in Marketing or related field...",
    responsibilities: "Develop and implement marketing strategies...",
    createdAt: "2023-05-18T00:00:00.000Z",
    updatedAt: "2023-05-19T00:00:00.000Z",
    applications: 5,
    author: "Sarah Williams",
  },
  {
    id: "5",
    title: "Customer Support Representative",
    department: "Customer Service",
    positions: 5,
    postedDate: "2023-05-18T00:00:00.000Z",
    closingDate: "2023-06-18T00:00:00.000Z",
    status: "active",
    location: "Port Harcourt, Nigeria",
    jobType: "Full-time",
    experience: "1+ years",
    salary: "₦200,000 - ₦300,000",
    description: "We are looking for Customer Support Representatives to join our team...",
    requirements: "High school diploma or equivalent...",
    responsibilities: "Respond to customer inquiries via phone, email, and chat...",
    createdAt: "2023-05-15T00:00:00.000Z",
    updatedAt: "2023-05-16T00:00:00.000Z",
    applications: 20,
    author: "David Brown",
  },
  {
    id: "6",
    title: "Project Manager",
    department: "Operations",
    positions: 1,
    postedDate: "2023-05-22T00:00:00.000Z",
    closingDate: "2023-06-22T00:00:00.000Z",
    status: "draft",
    location: "Lagos, Nigeria",
    jobType: "Full-time",
    experience: "4+ years",
    salary: "₦600,000 - ₦900,000",
    description: "We are looking for a Project Manager to lead our project teams...",
    requirements: "Bachelor's degree in Business Administration or related field...",
    responsibilities: "Plan, execute, and close projects on time and within budget...",
    createdAt: "2023-05-20T00:00:00.000Z",
    updatedAt: "2023-05-21T00:00:00.000Z",
    applications: 0,
    author: "Emily Davis",
  },
]

// Form fields for adding/editing job posts
const jobPostFields: FormField[] = [
  {
    name: "title",
    label: "Job Title",
    type: "text",
    placeholder: "Enter job title",
    required: true,
  },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: [
      { value: "Engineering", label: "Engineering" },
      { value: "Human Resources", label: "Human Resources" },
      { value: "Finance", label: "Finance" },
      { value: "Marketing", label: "Marketing" },
      { value: "Customer Service", label: "Customer Service" },
      { value: "Operations", label: "Operations" },
      { value: "Sales", label: "Sales" },
    ],
    required: true,
  },
  {
    name: "positions",
    label: "Number of Positions",
    type: "number",
    required: true,
    min: 1,
  },
  {
    name: "postedDate",
    label: "Posted Date",
    type: "date",
    required: true,
  },
  {
    name: "closingDate",
    label: "Closing Date",
    type: "date",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "closed", label: "Closed" },
      { value: "draft", label: "Draft" },
    ],
    required: true,
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "Enter job location",
    required: true,
  },
  {
    name: "jobType",
    label: "Job Type",
    type: "select",
    options: [
      { value: "Full-time", label: "Full-time" },
      { value: "Part-time", label: "Part-time" },
      { value: "Contract", label: "Contract" },
      { value: "Internship", label: "Internship" },
    ],
    required: true,
  },
  {
    name: "experience",
    label: "Experience",
    type: "text",
    placeholder: "e.g. 2+ years",
    required: true,
  },
  {
    name: "salary",
    label: "Salary Range",
    type: "text",
    placeholder: "e.g. ₦300,000 - ₦500,000",
    required: true,
  },
  {
    name: "description",
    label: "Job Description",
    type: "textarea",
    placeholder: "Enter job description",
    required: true,
  },
  {
    name: "requirements",
    label: "Requirements",
    type: "textarea",
    placeholder: "Enter job requirements",
    required: true,
  },
  {
    name: "responsibilities",
    label: "Responsibilities",
    type: "textarea",
    placeholder: "Enter job responsibilities",
    required: true,
  },
]

export function JobPostContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      console.log("Adding job post:", data)
      // Here you would typically make an API call to add the job post
      // For this mockup, we're just logging the data
      setTimeout(() => {
        setIsSubmitting(false)
        setIsAddDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error adding job post:", error)
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      console.log("Editing job post:", data)
      // Here you would typically make an API call to update the job post
      // For this mockup, we're just logging the data
      setTimeout(() => {
        setIsSubmitting(false)
        setIsEditDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error editing job post:", error)
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    console.log("Deleting job post:", id)
    // Here you would typically make an API call to delete the job post
    // For this mockup, we're just logging the data
  }

  const handleView = (id: string) => {
    const job = jobPosts.find((job) => job.id === id)
    if (job) {
      setSelectedJob(job)
      setIsViewDialogOpen(true)
    }
  }

  const handleEdit2 = (id: string) => {
    const job = jobPosts.find((job) => job.id === id)
    if (job) {
      setSelectedJob(job)
      setIsEditDialogOpen(true)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "closed":
        return <Badge variant="secondary">Closed</Badge>
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        title="Job Posts"
        description="Manage job postings for recruitment"
        columns={[
          { key: "title", label: "Job Title", sortable: true },
          { key: "department", label: "Department", sortable: true },
          { key: "positions", label: "Positions", sortable: true },
          {
            key: "postedDate",
            label: "Posted Date",
            sortable: true,
            render: (value) => format(new Date(value), "MMM dd, yyyy"),
          },
          {
            key: "closingDate",
            label: "Closing Date",
            sortable: true,
            render: (value) => format(new Date(value), "MMM dd, yyyy"),
          },
          {
            key: "status",
            label: "Status",
            sortable: true,
            render: (value) => renderStatusBadge(value),
          },
          { key: "location", label: "Location", sortable: true },
          { key: "jobType", label: "Job Type", sortable: true },
        ]}
        data={jobPosts}
        filterOptions={[
          {
            id: "department",
            label: "Department",
            type: "select",
            options: [
              { value: "Engineering", label: "Engineering" },
              { value: "Human Resources", label: "Human Resources" },
              { value: "Finance", label: "Finance" },
              { value: "Marketing", label: "Marketing" },
              { value: "Customer Service", label: "Customer Service" },
              { value: "Operations", label: "Operations" },
              { value: "Sales", label: "Sales" },
            ],
          },
          {
            id: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "closed", label: "Closed" },
              { value: "draft", label: "Draft" },
            ],
          },
          {
            id: "jobType",
            label: "Job Type",
            type: "select",
            options: [
              { value: "Full-time", label: "Full-time" },
              { value: "Part-time", label: "Part-time" },
              { value: "Contract", label: "Contract" },
              { value: "Internship", label: "Internship" },
            ],
          },
          {
            id: "postedDate",
            label: "Posted Date",
            type: "date",
          },
        ]}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={handleEdit2}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Add Job Post Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Job Post</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-4 space-y-4">
              <EnhancedForm
                fields={jobPostFields.slice(0, 8)}
                onSubmit={() => {}}
                onCancel={() => setIsAddDialogOpen(false)}
                submitLabel="Next"
                cancelLabel="Cancel"
                isSubmitting={false}
              />
            </TabsContent>
            <TabsContent value="details" className="mt-4 space-y-4">
              <EnhancedForm
                fields={[jobPostFields[8], jobPostFields[9], jobPostFields[10]]}
                onSubmit={() => {}}
                onCancel={() => setIsAddDialogOpen(false)}
                submitLabel="Next"
                cancelLabel="Back"
                isSubmitting={false}
              />
            </TabsContent>
            <TabsContent value="requirements" className="mt-4 space-y-4">
              <EnhancedForm
                fields={[jobPostFields[11], jobPostFields[12]]}
                onSubmit={handleAdd}
                onCancel={() => setIsAddDialogOpen(false)}
                submitLabel="Create Job Post"
                cancelLabel="Back"
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Job Post Dialog */}
      {selectedJob && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job Post</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="details">Job Details</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="mt-4 space-y-4">
                <EnhancedForm
                  fields={jobPostFields.slice(0, 8)}
                  onSubmit={() => {}}
                  onCancel={() => setIsEditDialogOpen(false)}
                  submitLabel="Next"
                  cancelLabel="Cancel"
                  isSubmitting={false}
                  initialValues={selectedJob}
                />
              </TabsContent>
              <TabsContent value="details" className="mt-4 space-y-4">
                <EnhancedForm
                  fields={[jobPostFields[8], jobPostFields[9], jobPostFields[10]]}
                  onSubmit={() => {}}
                  onCancel={() => setIsEditDialogOpen(false)}
                  submitLabel="Next"
                  cancelLabel="Back"
                  isSubmitting={false}
                  initialValues={selectedJob}
                />
              </TabsContent>
              <TabsContent value="requirements" className="mt-4 space-y-4">
                <EnhancedForm
                  fields={[jobPostFields[11], jobPostFields[12]]}
                  onSubmit={handleEdit}
                  onCancel={() => setIsEditDialogOpen(false)}
                  submitLabel="Update Job Post"
                  cancelLabel="Back"
                  isSubmitting={isSubmitting}
                  initialValues={selectedJob}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* View Job Post Dialog */}
      {selectedJob && isViewDialogOpen && (
        <DetailsView
          title={selectedJob.title}
          subtitle={`${selectedJob.department} • ${selectedJob.jobType}`}
          data={selectedJob}
          tabs={[
            {
              id: "overview",
              label: "Overview",
              sections: [
                {
                  title: "Job Information",
                  fields: [
                    { label: "Job Title", value: selectedJob.title },
                    { label: "Department", value: selectedJob.department },
                    { label: "Number of Positions", value: selectedJob.positions },
                    { label: "Posted Date", value: selectedJob.postedDate, type: "date" },
                    { label: "Closing Date", value: selectedJob.closingDate, type: "date" },
                    {
                      label: "Status",
                      value: selectedJob.status,
                      type: "status",
                      options: {
                        statusMap: {
                          active: { label: "Active", color: "bg-green-500 text-white" },
                          closed: { label: "Closed", color: "bg-gray-500 text-white" },
                          draft: { label: "Draft", color: "bg-blue-100 text-blue-800" },
                        },
                      },
                    },
                    { label: "Location", value: selectedJob.location },
                    { label: "Job Type", value: selectedJob.jobType, type: "badge" },
                    { label: "Experience", value: selectedJob.experience },
                    { label: "Salary Range", value: selectedJob.salary },
                    { label: "Applications Received", value: selectedJob.applications },
                    { label: "Created By", value: selectedJob.author },
                  ],
                },
              ],
            },
            {
              id: "details",
              label: "Job Details",
              sections: [
                {
                  title: "Description",
                  fields: [{ label: "Job Description", value: selectedJob.description }],
                },
                {
                  title: "Requirements & Responsibilities",
                  fields: [
                    { label: "Requirements", value: selectedJob.requirements },
                    { label: "Responsibilities", value: selectedJob.responsibilities },
                  ],
                },
              ],
            },
            {
              id: "applications",
              label: "Applications",
              content: (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Applications ({selectedJob.applications})</h3>
                    <Button variant="outline" size="sm">
                      View All Applications
                    </Button>
                  </div>
                  {selectedJob.applications > 0 ? (
                    <div className="border rounded-md p-4">
                      <p className="text-gray-500">
                        This section would display a list of all applications for this job post.
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md p-8 text-center">
                      <p className="text-gray-500">No applications have been received for this job post yet.</p>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
          onEdit={() => {
            setIsViewDialogOpen(false)
            setIsEditDialogOpen(true)
          }}
          onBack={() => setIsViewDialogOpen(false)}
          onPrint={() => window.print()}
          onExport={() => console.log("Exporting job post:", selectedJob.id)}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("Publishing job post:", selectedJob.id)}
              disabled={selectedJob.status === "active"}
            >
              {selectedJob.status === "active" ? "Published" : "Publish"}
            </Button>
          }
        />
      )}
    </div>
  )
}
