"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import type { FormField } from "@/app/admin/components/enhanced-form"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data
const candidates = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+234 812 345 6789",
    jobAppliedFor: "Software Engineer",
    jobId: "SE-001",
    applicationDate: "2023-05-15T00:00:00.000Z",
    status: "shortlisted",
    experience: "5 years",
    education: "BSc Computer Science",
    skills: ["JavaScript", "React", "Node.js", "TypeScript"],
    resumeUrl: "/documents/john-smith-resume.pdf",
    coverLetterUrl: "/documents/john-smith-cover-letter.pdf",
    photo: "/thoughtful-man.png",
    source: "LinkedIn",
    rating: 4.5,
    interviewDate: "2023-05-25T10:00:00.000Z",
    notes: "Strong technical skills, good cultural fit",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+234 813 456 7890",
    jobAppliedFor: "UI/UX Designer",
    jobId: "UID-002",
    applicationDate: "2023-05-14T00:00:00.000Z",
    status: "interviewing",
    experience: "3 years",
    education: "BA Graphic Design",
    skills: ["Figma", "Adobe XD", "UI Design", "User Research"],
    resumeUrl: "/documents/sarah-johnson-resume.pdf",
    coverLetterUrl: "/documents/sarah-johnson-cover-letter.pdf",
    photo: "/diverse-woman-portrait.png",
    source: "Indeed",
    rating: 4.0,
    interviewDate: "2023-05-20T14:00:00.000Z",
    notes: "Excellent portfolio, good communication skills",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+234 814 567 8901",
    jobAppliedFor: "Project Manager",
    jobId: "PM-003",
    applicationDate: "2023-05-12T00:00:00.000Z",
    status: "rejected",
    experience: "7 years",
    education: "MBA",
    skills: ["Project Management", "Agile", "Scrum", "Team Leadership"],
    resumeUrl: "/documents/michael-brown-resume.pdf",
    coverLetterUrl: "/documents/michael-brown-cover-letter.pdf",
    photo: "/thoughtful-man.png",
    source: "Company Website",
    rating: 3.0,
    interviewDate: null,
    notes: "Not enough experience in our industry",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+234 815 678 9012",
    jobAppliedFor: "Data Analyst",
    jobId: "DA-004",
    applicationDate: "2023-05-10T00:00:00.000Z",
    status: "hired",
    experience: "4 years",
    education: "MSc Data Science",
    skills: ["Python", "SQL", "Data Visualization", "Statistical Analysis"],
    resumeUrl: "/documents/emily-davis-resume.pdf",
    coverLetterUrl: "/documents/emily-davis-cover-letter.pdf",
    photo: "/diverse-woman-portrait.png",
    source: "Referral",
    rating: 4.8,
    interviewDate: "2023-05-15T11:00:00.000Z",
    notes: "Excellent technical skills, great cultural fit",
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "+234 816 789 0123",
    jobAppliedFor: "DevOps Engineer",
    jobId: "DOE-005",
    applicationDate: "2023-05-08T00:00:00.000Z",
    status: "new",
    experience: "6 years",
    education: "BSc Computer Engineering",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"],
    resumeUrl: "/documents/david-wilson-resume.pdf",
    coverLetterUrl: "/documents/david-wilson-cover-letter.pdf",
    photo: "/thoughtful-man.png",
    source: "LinkedIn",
    rating: null,
    interviewDate: null,
    notes: "",
  },
]

// Form fields for adding/editing candidates
const candidateFields: FormField[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter candidate's full name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter candidate's email",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "Enter candidate's phone number",
    required: true,
  },
  {
    name: "jobAppliedFor",
    label: "Job Applied For",
    type: "select",
    options: [
      { value: "Software Engineer", label: "Software Engineer" },
      { value: "UI/UX Designer", label: "UI/UX Designer" },
      { value: "Project Manager", label: "Project Manager" },
      { value: "Data Analyst", label: "Data Analyst" },
      { value: "DevOps Engineer", label: "DevOps Engineer" },
    ],
    required: true,
  },
  {
    name: "applicationDate",
    label: "Application Date",
    type: "date",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "new", label: "New" },
      { value: "screening", label: "Screening" },
      { value: "shortlisted", label: "Shortlisted" },
      { value: "interviewing", label: "Interviewing" },
      { value: "offered", label: "Offered" },
      { value: "hired", label: "Hired" },
      { value: "rejected", label: "Rejected" },
      { value: "withdrawn", label: "Withdrawn" },
    ],
    required: true,
  },
  {
    name: "experience",
    label: "Experience",
    type: "text",
    placeholder: "Enter years of experience",
    required: true,
  },
  {
    name: "education",
    label: "Education",
    type: "text",
    placeholder: "Enter highest education qualification",
    required: true,
  },
  {
    name: "skills",
    label: "Skills",
    type: "text",
    placeholder: "Enter skills separated by commas",
    required: true,
  },
  {
    name: "resumeUrl",
    label: "Resume/CV",
    type: "file",
    accept: ".pdf,.doc,.docx",
    description: "Upload candidate's resume/CV",
    required: true,
  },
  {
    name: "coverLetterUrl",
    label: "Cover Letter",
    type: "file",
    accept: ".pdf,.doc,.docx",
    description: "Upload candidate's cover letter",
  },
  {
    name: "source",
    label: "Source",
    type: "select",
    options: [
      { value: "LinkedIn", label: "LinkedIn" },
      { value: "Indeed", label: "Indeed" },
      { value: "Company Website", label: "Company Website" },
      { value: "Referral", label: "Referral" },
      { value: "Job Fair", label: "Job Fair" },
      { value: "Other", label: "Other" },
    ],
    required: true,
  },
  {
    name: "rating",
    label: "Rating",
    type: "number",
    min: 1,
    max: 5,
    step: 0.5,
    placeholder: "Rate candidate from 1 to 5",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Enter notes about the candidate",
  },
]

export function JobCandidatesContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      console.log("Adding candidate:", data)
      // Here you would typically make an API call to add the candidate
      // For this mockup, we're just logging the data
      setTimeout(() => {
        setIsSubmitting(false)
        setIsAddDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error adding candidate:", error)
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      console.log("Editing candidate:", data)
      // Here you would typically make an API call to update the candidate
      // For this mockup, we're just logging the data
      setTimeout(() => {
        setIsSubmitting(false)
        setIsEditDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error editing candidate:", error)
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    console.log("Deleting candidate:", id)
    // Here you would typically make an API call to delete the candidate
    // For this mockup, we're just logging the data
  }

  const handleView = (id: string) => {
    const candidate = candidates.find((candidate) => candidate.id === id)
    if (candidate) {
      setSelectedCandidate(candidate)
      setIsViewDialogOpen(true)
    }
  }

  const handleEdit2 = (id: string) => {
    const candidate = candidates.find((candidate) => candidate.id === id)
    if (candidate) {
      setSelectedCandidate(candidate)
      setIsEditDialogOpen(true)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline">New</Badge>
      case "screening":
        return <Badge className="bg-blue-500">Screening</Badge>
      case "shortlisted":
        return <Badge className="bg-purple-500">Shortlisted</Badge>
      case "interviewing":
        return <Badge className="bg-yellow-500">Interviewing</Badge>
      case "offered":
        return <Badge className="bg-orange-500">Offered</Badge>
      case "hired":
        return <Badge className="bg-green-500">Hired</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "withdrawn":
        return <Badge variant="secondary">Withdrawn</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        title="Job Candidates"
        description="Manage and track job applicants"
        columns={[
          {
            key: "name",
            label: "Candidate Name",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={row.photo || "/placeholder.svg"} alt={value} />
                  <AvatarFallback>
                    {value
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{value}</div>
                  <div className="text-xs text-gray-500">{row.email}</div>
                </div>
              </div>
            ),
          },
          {
            key: "jobAppliedFor",
            label: "Job Applied For",
            sortable: true,
          },
          {
            key: "applicationDate",
            label: "Application Date",
            sortable: true,
            render: (value) => format(new Date(value), "MMM dd, yyyy"),
          },
          {
            key: "status",
            label: "Status",
            sortable: true,
            render: (value) => renderStatusBadge(value),
          },
          {
            key: "experience",
            label: "Experience",
            sortable: true,
          },
          {
            key: "education",
            label: "Education",
            sortable: true,
          },
          {
            key: "skills",
            label: "Skills",
            render: (value) => (
              <div className="flex flex-wrap gap-1">
                {value.slice(0, 2).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="bg-gray-100">
                    {skill}
                  </Badge>
                ))}
                {value.length > 2 && (
                  <Badge variant="outline" className="bg-gray-100">
                    +{value.length - 2}
                  </Badge>
                )}
              </div>
            ),
          },
        ]}
        data={candidates}
        filterOptions={[
          {
            id: "jobAppliedFor",
            label: "Job Position",
            type: "select",
            options: [
              { value: "Software Engineer", label: "Software Engineer" },
              { value: "UI/UX Designer", label: "UI/UX Designer" },
              { value: "Project Manager", label: "Project Manager" },
              { value: "Data Analyst", label: "Data Analyst" },
              { value: "DevOps Engineer", label: "DevOps Engineer" },
            ],
          },
          {
            id: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "new", label: "New" },
              { value: "screening", label: "Screening" },
              { value: "shortlisted", label: "Shortlisted" },
              { value: "interviewing", label: "Interviewing" },
              { value: "offered", label: "Offered" },
              { value: "hired", label: "Hired" },
              { value: "rejected", label: "Rejected" },
              { value: "withdrawn", label: "Withdrawn" },
            ],
          },
          {
            id: "applicationDate",
            label: "Application Date",
            type: "date",
          },
          {
            id: "source",
            label: "Source",
            type: "select",
            options: [
              { value: "LinkedIn", label: "LinkedIn" },
              { value: "Indeed", label: "Indeed" },
              { value: "Company Website", label: "Company Website" },
              { value: "Referral", label: "Referral" },
              { value: "Job Fair", label: "Job Fair" },
              { value: "Other", label: "Other" },
            ],
          },
        ]}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={handleEdit2}
        onDelete={handleDelete}
        onView={handleView}
        formFields={candidateFields}
        formTitle="Candidate Information"
        formDescription="Add or edit candidate details"
        onSubmit={handleAdd}
        onUpdate={handleEdit}
        isSubmitting={isSubmitting}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        selectedItem={selectedCandidate}
        exportOptions={{
          csv: true,
          pdf: true,
          print: true,
        }}
        additionalActions={[
          {
            label: "Schedule Interview",
            onClick: (id) => {
              console.log("Scheduling interview for candidate:", id)
              // Here you would typically navigate to the interview scheduling page
              // or open a dialog to schedule an interview
            },
            icon: "Calendar",
            showIf: (row) => row.status === "shortlisted" || row.status === "screening",
          },
          {
            label: "Send Email",
            onClick: (id) => {
              console.log("Sending email to candidate:", id)
              // Here you would typically open an email composition dialog
            },
            icon: "Mail",
          },
          {
            label: "Change Status",
            onClick: (id) => {
              console.log("Changing status for candidate:", id)
              // Here you would typically open a status change dialog
            },
            icon: "RefreshCw",
          },
        ]}
        viewRenderer={(item) => (
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={item.photo || "/placeholder.svg"} alt={item.name} />
                <AvatarFallback>
                  {item.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{item.name}</h2>
                <p className="text-gray-500">
                  {item.email} • {item.phone}
                </p>
              </div>
              <div className="ml-auto">{renderStatusBadge(item.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border p-3">
                <h3 className="font-semibold">Application Details</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Job Applied For:</span> {item.jobAppliedFor}
                  </p>
                  <p>
                    <span className="font-medium">Application Date:</span>{" "}
                    {format(new Date(item.applicationDate), "MMMM dd, yyyy")}
                  </p>
                  <p>
                    <span className="font-medium">Source:</span> {item.source}
                  </p>
                  {item.rating && (
                    <p>
                      <span className="font-medium">Rating:</span> {item.rating}/5
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-md border p-3">
                <h3 className="font-semibold">Qualifications</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Experience:</span> {item.experience}
                  </p>
                  <p>
                    <span className="font-medium">Education:</span> {item.education}
                  </p>
                  <div>
                    <span className="font-medium">Skills:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.skills.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="bg-gray-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <h3 className="font-semibold">Documents</h3>
              <div className="mt-2 flex gap-4">
                <a
                  href={item.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
                >
                  <span>View Resume/CV</span>
                </a>
                {item.coverLetterUrl && (
                  <a
                    href={item.coverLetterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    <span>View Cover Letter</span>
                  </a>
                )}
              </div>
            </div>

            {item.interviewDate && (
              <div className="rounded-md border p-3">
                <h3 className="font-semibold">Interview Details</h3>
                <div className="mt-2 text-sm">
                  <p>
                    <span className="font-medium">Scheduled for:</span>{" "}
                    {format(new Date(item.interviewDate), "MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            )}

            {item.notes && (
              <div className="rounded-md border p-3">
                <h3 className="font-semibold">Notes</h3>
                <div className="mt-2 text-sm">
                  <p>{item.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}
