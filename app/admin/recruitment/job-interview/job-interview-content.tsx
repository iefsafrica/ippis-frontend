"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import type { FormField } from "@/app/admin/components/enhanced-form"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data
const interviews = [
  {
    id: "1",
    candidateName: "John Smith",
    candidateId: "C001",
    candidatePhoto: "/thoughtful-man.png",
    candidateEmail: "john.smith@example.com",
    jobPosition: "Software Engineer",
    jobId: "SE-001",
    interviewDate: "2023-05-25T10:00:00.000Z",
    interviewType: "technical",
    interviewers: ["David Johnson", "Sarah Williams"],
    location: "Virtual - Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    status: "scheduled",
    feedback: null,
    rating: null,
    notes: "Candidate has strong backend experience",
    resumeUrl: "/documents/john-smith-resume.pdf",
    round: 1,
  },
  {
    id: "2",
    candidateName: "Sarah Johnson",
    candidateId: "C002",
    candidatePhoto: "/diverse-woman-portrait.png",
    candidateEmail: "sarah.johnson@example.com",
    jobPosition: "UI/UX Designer",
    jobId: "UID-002",
    interviewDate: "2023-05-20T14:00:00.000Z",
    interviewType: "portfolio",
    interviewers: ["Michael Brown", "Emily Davis"],
    location: "Office - Meeting Room 2",
    meetingLink: null,
    status: "completed",
    feedback: "Excellent portfolio, good communication skills, strong design principles",
    rating: 4.5,
    notes: "Candidate showed impressive UI/UX work",
    resumeUrl: "/documents/sarah-johnson-resume.pdf",
    round: 2,
  },
  {
    id: "3",
    candidateName: "Michael Brown",
    candidateId: "C003",
    candidatePhoto: "/thoughtful-man.png",
    candidateEmail: "michael.brown@example.com",
    jobPosition: "Project Manager",
    jobId: "PM-003",
    interviewDate: "2023-05-18T11:00:00.000Z",
    interviewType: "behavioral",
    interviewers: ["David Johnson", "Jane Wilson"],
    location: "Virtual - Microsoft Teams",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/123456789",
    status: "rejected",
    feedback: "Not enough experience in our industry, communication skills need improvement",
    rating: 2.5,
    notes: "Candidate lacks experience in our specific domain",
    resumeUrl: "/documents/michael-brown-resume.pdf",
    round: 1,
  },
  {
    id: "4",
    candidateName: "Emily Davis",
    candidateId: "C004",
    candidatePhoto: "/diverse-woman-portrait.png",
    candidateEmail: "emily.davis@example.com",
    jobPosition: "Data Analyst",
    jobId: "DA-004",
    interviewDate: "2023-05-15T11:00:00.000Z",
    interviewType: "technical",
    interviewers: ["Robert Wilson", "Sarah Williams"],
    location: "Office - Meeting Room 1",
    meetingLink: null,
    status: "hired",
    feedback: "Excellent technical skills, great cultural fit, strong analytical abilities",
    rating: 4.8,
    notes: "Candidate demonstrated strong data analysis skills",
    resumeUrl: "/documents/emily-davis-resume.pdf",
    round: 3,
  },
  {
    id: "5",
    candidateName: "David Wilson",
    candidateId: "C005",
    candidatePhoto: "/thoughtful-man.png",
    candidateEmail: "david.wilson@example.com",
    jobPosition: "DevOps Engineer",
    jobId: "DOE-005",
    interviewDate: "2023-05-28T13:00:00.000Z",
    interviewType: "technical",
    interviewers: ["Robert Wilson", "Michael Brown"],
    location: "Virtual - Google Meet",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    status: "scheduled",
    feedback: null,
    rating: null,
    notes: "Candidate has experience with AWS and Kubernetes",
    resumeUrl: "/documents/david-wilson-resume.pdf",
    round: 1,
  },
]

// Form fields for adding/editing interviews
const interviewFields: FormField[] = [
  {
    name: "candidateId",
    label: "Candidate",
    type: "select",
    options: [
      { value: "C001", label: "John Smith - Software Engineer" },
      { value: "C002", label: "Sarah Johnson - UI/UX Designer" },
      { value: "C003", label: "Michael Brown - Project Manager" },
      { value: "C004", label: "Emily Davis - Data Analyst" },
      { value: "C005", label: "David Wilson - DevOps Engineer" },
    ],
    required: true,
  },
  {
    name: "jobPosition",
    label: "Job Position",
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
    name: "interviewDate",
    label: "Interview Date",
    type: "date",
    required: true,
  },
  {
    name: "interviewTime",
    label: "Interview Time",
    type: "time",
    required: true,
  },
  {
    name: "interviewType",
    label: "Interview Type",
    type: "select",
    options: [
      { value: "screening", label: "Screening" },
      { value: "technical", label: "Technical" },
      { value: "behavioral", label: "Behavioral" },
      { value: "portfolio", label: "Portfolio Review" },
      { value: "case_study", label: "Case Study" },
      { value: "final", label: "Final Interview" },
    ],
    required: true,
  },
  {
    name: "round",
    label: "Interview Round",
    type: "number",
    min: 1,
    max: 5,
    required: true,
  },
  {
    name: "locationType",
    label: "Location Type",
    type: "select",
    options: [
      { value: "virtual", label: "Virtual" },
      { value: "office", label: "Office" },
    ],
    required: true,
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "Enter interview location",
    required: true,
    showIf: (values) => values.locationType === "office",
  },
  {
    name: "virtualPlatform",
    label: "Virtual Platform",
    type: "select",
    options: [
      { value: "zoom", label: "Zoom" },
      { value: "teams", label: "Microsoft Teams" },
      { value: "meet", label: "Google Meet" },
      { value: "other", label: "Other" },
    ],
    required: true,
    showIf: (values) => values.locationType === "virtual",
  },
  {
    name: "meetingLink",
    label: "Meeting Link",
    type: "text",
    placeholder: "Enter meeting link",
    required: true,
    showIf: (values) => values.locationType === "virtual",
  },
  {
    name: "interviewers",
    label: "Interviewers",
    type: "text",
    placeholder: "Enter interviewers separated by commas",
    required: true,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Enter notes about the interview",
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
      { value: "rescheduled", label: "Rescheduled" },
      { value: "no_show", label: "No Show" },
      { value: "hired", label: "Hired" },
      { value: "rejected", label: "Rejected" },
    ],
    required: true,
  },
]

// Form fields for adding feedback
const feedbackFields: FormField[] = [
  {
    name: "feedback",
    label: "Feedback",
    type: "textarea",
    placeholder: "Enter detailed feedback about the candidate",
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
    required: true,
  },
  {
    name: "recommendation",
    label: "Recommendation",
    type: "select",
    options: [
      { value: "hire", label: "Hire" },
      { value: "reject", label: "Reject" },
      { value: "next_round", label: "Proceed to Next Round" },
      { value: "hold", label: "Hold for Now" },
    ],
    required: true,
  },
  {
    name: "strengths",
    label: "Strengths",
    type: "textarea",
    placeholder: "Enter candidate's strengths",
    required: true,
  },
  {
    name: "weaknesses",
    label: "Areas for Improvement",
    type: "textarea",
    placeholder: "Enter areas where the candidate can improve",
    required: true,
  },
  {
    name: "culturalFit",
    label: "Cultural Fit",
    type: "select",
    options: [
      { value: "excellent", label: "Excellent" },
      { value: "good", label: "Good" },
      { value: "average", label: "Average" },
      { value: "poor", label: "Poor" },
    ],
    required: true,
  },
]

export function JobInterviewContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      console.log("Adding interview:", data)
      // Here you would typically make an API call to add the interview
      // For this mockup, we're just logging the data
      setTimeout(() => {
        setIsSubmitting(false)
        setIsAddDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error adding interview:", error)
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      console.log("Editing interview:", data)
      // Here you would typically make an API call to update the interview
      // For this mockup, we're just logging the data
      setTimeout(() => {
        setIsSubmitting(false)
        setIsEditDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error editing interview:", error)
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    console.log("Deleting interview:", id)
    // Here you would typically make an API call to delete the interview
    // For this mockup, we're just logging the data
  }

  const handleView = (id: string) => {
    const interview = interviews.find((interview) => interview.id === id)
    if (interview) {
      setSelectedInterview(interview)
      setIsViewDialogOpen(true)
    }
  }

  const handleEdit2 = (id: string) => {
    const interview = interviews.find((interview) => interview.id === id)
    if (interview) {
      setSelectedInterview(interview)
      setIsEditDialogOpen(true)
    }
  }

  const handleFeedback = (id: string) => {
    const interview = interviews.find((interview) => interview.id === id)
    if (interview) {
      setSelectedInterview(interview)
      setIsFeedbackDialogOpen(true)
    }
  }

  const handleSubmitFeedback = async (data: Record<string, any>) => {
    setIsSubmitting(true)
    try {
      console.log("Submitting feedback:", data)
      // Here you would typically make an API call to submit the feedback
      // For this mockup, we're just logging the data
      setTimeout(() => {
        setIsSubmitting(false)
        setIsFeedbackDialogOpen(false)
      }, 1000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      setIsSubmitting(false)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>
      case "completed":
        return <Badge className="bg-purple-500">Completed</Badge>
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>
      case "rescheduled":
        return <Badge className="bg-orange-500">Rescheduled</Badge>
      case "no_show":
        return <Badge variant="destructive">No Show</Badge>
      case "hired":
        return <Badge className="bg-green-500">Hired</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderInterviewTypeBadge = (type: string) => {
    switch (type) {
      case "screening":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Screening
          </Badge>
        )
      case "technical":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Technical
          </Badge>
        )
      case "behavioral":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Behavioral
          </Badge>
        )
      case "portfolio":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Portfolio
          </Badge>
        )
      case "case_study":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Case Study
          </Badge>
        )
      case "final":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Final
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <EnhancedDataTable
        title="Job Interviews"
        description="Schedule and manage candidate interviews"
        columns={[
          {
            key: "candidateName",
            label: "Candidate",
            sortable: true,
            render: (value, row) => (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={row.candidatePhoto || "/placeholder.svg"} alt={value} />
                  <AvatarFallback>
                    {value
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{value}</div>
                  <div className="text-xs text-gray-500">{row.candidateEmail}</div>
                </div>
              </div>
            ),
          },
          {
            key: "jobPosition",
            label: "Job Position",
            sortable: true,
          },
          {
            key: "interviewDate",
            label: "Interview Date",
            sortable: true,
            render: (value) => format(new Date(value), "MMM dd, yyyy h:mm a"),
          },
          {
            key: "interviewType",
            label: "Interview Type",
            sortable: true,
            render: (value) => renderInterviewTypeBadge(value),
          },
          {
            key: "interviewers",
            label: "Interviewers",
            render: (value) => (
              <div className="flex flex-wrap gap-1">
                {value.slice(0, 2).map((interviewer: string, index: number) => (
                  <span key={index} className="text-sm">
                    {interviewer}
                    {index < Math.min(value.length, 2) - 1 ? ", " : ""}
                  </span>
                ))}
                {value.length > 2 && <span className="text-sm text-gray-500">+{value.length - 2} more</span>}
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            sortable: true,
            render: (value) => renderStatusBadge(value),
          },
          {
            key: "round",
            label: "Round",
            sortable: true,
            render: (value) => `Round ${value}`,
          },
        ]}
        data={interviews}
        filterOptions={[
          {
            id: "jobPosition",
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
              { value: "scheduled", label: "Scheduled" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
              { value: "rescheduled", label: "Rescheduled" },
              { value: "no_show", label: 'No Show" },ow', label: "No Show" },
              { value: "hired", label: "Hired" },
              { value: "rejected", label: "Rejected" },
            ],
          },
          {
            id: "interviewType",
            label: "Interview Type",
            type: "select",
            options: [
              { value: "screening", label: "Screening" },
              { value: "technical", label: "Technical" },
              { value: "behavioral", label: "Behavioral" },
              { value: "portfolio", label: "Portfolio Review" },
              { value: "case_study", label: "Case Study" },
              { value: "final", label: "Final Interview" },
            ],
          },
          {
            id: "interviewDate",
            label: "Interview Date",
            type: "date",
          },
          {
            id: "round",
            label: "Round",
            type: "select",
            options: [
              { value: "1", label: "Round 1" },
              { value: "2", label: "Round 2" },
              { value: "3", label: "Round 3" },
              { value: "4", label: "Round 4" },
              { value: "5", label: "Round 5" },
            ],
          },
        ]}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={handleEdit2}
        onDelete={handleDelete}
        onView={handleView}
        formFields={interviewFields}
        formTitle="Interview Information"
        formDescription="Schedule or edit an interview"
        onSubmit={handleAdd}
        onUpdate={handleEdit}
        isSubmitting={isSubmitting}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        selectedItem={selectedInterview}
        exportOptions={{
          csv: true,
          pdf: true,
          print: true,
        }}
        additionalActions={[
          {
            label: "Add Feedback",
            onClick: handleFeedback,
            icon: "MessageSquare",
            showIf: (row) => row.status === "completed" && !row.feedback,
          },
          {
            label: "Send Reminder",
            onClick: (id) => {
              console.log("Sending reminder for interview:", id)
              // Here you would typically make an API call to send a reminder
            },
            icon: "Bell",
            showIf: (row) => row.status === "scheduled",
          },
          {
            label: "Reschedule",
            onClick: (id) => {
              console.log("Rescheduling interview:", id)
              // Here you would typically open a dialog to reschedule the interview
            },
            icon: "Calendar",
            showIf: (row) => row.status === "scheduled" || row.status === "cancelled",
          },
        ]}
        viewRenderer={(item) => (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={item.candidatePhoto || "/placeholder.svg"} alt={item.candidateName} />
                  <AvatarFallback>
                    {item.candidateName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{item.candidateName}</h2>
                  <p className="text-gray-500">{item.candidateEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {renderStatusBadge(item.status)}
                {renderInterviewTypeBadge(item.interviewType)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border p-3">
                <h3 className="font-semibold">Interview Details</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Job Position:</span> {item.jobPosition}
                  </p>
                  <p>
                    <span className="font-medium">Date & Time:</span>{" "}
                    {format(new Date(item.interviewDate), "MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                  <p>
                    <span className="font-medium">Round:</span> {item.round}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {item.location}
                    {item.meetingLink && (
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-md border p-3">
                <h3 className="font-semibold">Interviewers</h3>
                <div className="mt-2 space-y-1 text-sm">
                  {item.interviewers.map((interviewer: string, index: number) => (
                    <p key={index}>{interviewer}</p>
                  ))}
                </div>
              </div>
            </div>

            {item.notes && (
              <div className="rounded-md border p-3">
                <h3 className="font-semibold">Notes</h3>
                <div className="mt-2 text-sm">
                  <p>{item.notes}</p>
                </div>
              </div>
            )}

            {item.feedback && (
              <div className="rounded-md border p-3">
                <h3 className="font-semibold">Feedback</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>{item.feedback}</p>
                  {item.rating && (
                    <p>
                      <span className="font-medium">Rating:</span> {item.rating}/5
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-md border p-3">
              <h3 className="font-semibold">Candidate Resume</h3>
              <div className="mt-2">
                <a
                  href={item.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 w-fit"
                >
                  <span>View Resume/CV</span>
                </a>
              </div>
            </div>
          </div>
        )}
      />

      {/* Feedback Dialog */}
      {selectedInterview && (
        <div className="hidden">
          <EnhancedDataTable
            title={`Feedback for ${selectedInterview.candidateName}`}
            description="Provide detailed feedback after the interview"
            formFields={feedbackFields}
            formTitle="Interview Feedback"
            formDescription="Submit your evaluation of the candidate"
            onSubmit={handleSubmitFeedback}
            isSubmitting={isSubmitting}
            isAddDialogOpen={isFeedbackDialogOpen}
            setIsAddDialogOpen={setIsFeedbackDialogOpen}
            data={[]}
            columns={[]}
          />
        </div>
      )}
    </div>
  )
}
