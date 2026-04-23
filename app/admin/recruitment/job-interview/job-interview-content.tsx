"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"

import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { StatusChangeDialog } from "@/app/admin/core-hr/components/status-change-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Eye, Edit, Trash2, Calendar, Clock, Users, MapPin, Link2, FileText, ClipboardList, X, Loader2, User, Video, Building2, RefreshCw } from "lucide-react"

import { useRecruitmentCandidates } from "@/services/hooks/recruitment/candidates"
import { useRecruitmentJobs } from "@/services/hooks/recruitment/jobs"
import {
  useCreateRecruitmentInterview,
  useDeleteRecruitmentInterview,
  useRecruitmentInterviews,
  useUpdateRecruitmentInterview,
} from "@/services/hooks/recruitment/interviews"
import {
  RECRUITMENT_INTERVIEW_STATUS_OPTIONS,
  RECRUITMENT_INTERVIEW_TYPE_OPTIONS,
} from "@/services/constants/recruitment/interviews"
import type { RecruitmentInterview, RecruitmentInterviewPayload } from "@/types/recruitment/interviews"
import { toast } from "sonner"

const getErrorMessage = (error?: unknown) => {
  if (!error) return "Something went wrong. Please try again."
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  if (responseMessage) return responseMessage
  const fallback = (error as { message?: string })?.message
  if (fallback) return fallback
  return "Something went wrong. Please try again."
}

const buildInterviewDateTime = (dateValue?: string | Date, timeValue?: string) => {
  let datePart = ""

  if (dateValue instanceof Date) {
    datePart = format(dateValue, "yyyy-MM-dd")
  } else if (typeof dateValue === "string") {
    datePart = dateValue
  }

  if (!datePart) return undefined

  const timePart = timeValue || "00:00"
  const combined = `${datePart}T${timePart}`
  const parsed = new Date(combined)

  if (Number.isNaN(parsed.getTime())) return undefined

  return parsed.toISOString()
}

const sanitizeInterviewPayload = (values: Record<string, any>): RecruitmentInterviewPayload => {
  const interviewDateValue = values.interview_date ?? values.interview_datetime
  const interviewTimeValue =
    values.interview_time ??
    (values.interview_datetime ? format(new Date(values.interview_datetime), "HH:mm") : undefined)
  const interviewDateTime = buildInterviewDateTime(interviewDateValue, interviewTimeValue) ?? values.interview_datetime

  const payload: Record<string, any> = {
    candidate_id: values.candidate_id,
    job_id: values.job_id,
    interview_datetime: interviewDateTime,
    interview_type: values.interview_type,
    interviewers: values.interviewers,
    status: values.status,
    round:
      values.round !== undefined && values.round !== ""
        ? String(values.round)
        : undefined,
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key]
    }
  })

  return payload as RecruitmentInterviewPayload
}

const interviewFields = (candidateOptions: Array<{ value: string; label: string }>, jobOptions: Array<{ value: string; label: string }>): FormField[] => [
  {
    name: "candidate_id",
    label: "Candidate",
    type: "select",
    options: candidateOptions,
    required: true,
  },
  {
    name: "job_id",
    label: "Job",
    type: "select",
    options: jobOptions,
    required: true,
  },
  {
    name: "interview_date",
    label: "Interview Date",
    type: "date",
    datePickerVariant: "input",
    required: true,
  },
  {
    name: "interview_time",
    label: "Interview Time",
    type: "text",
    placeholder: "HH:MM",
    required: true,
    validation: {
      pattern: /^\d{2}:\d{2}$/,
      message: "Time must be in HH:MM format",
    },
  },
  {
    name: "interview_type",
    label: "Interview Type",
    type: "select",
    options: RECRUITMENT_INTERVIEW_TYPE_OPTIONS,
    required: true,
  },
  {
    name: "interviewers",
    label: "Interviewers",
    type: "text",
    placeholder: "Name, Name",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: RECRUITMENT_INTERVIEW_STATUS_OPTIONS,
    required: true,
  },
  {
    name: "round",
    label: "Round",
    type: "number",
    min: 1,
    max: 10,
  },
]

const feedbackFields: FormField[] = [
  {
    name: "feedback",
    label: "Feedback",
    type: "textarea",
    placeholder: "Enter your feedback",
    required: true,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Add additional notes",
  },
]

const renderStatusBadge = (status?: string) => {
  const normalized = status?.toLowerCase()
  const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    completed: { label: "Completed", className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
    cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
    rescheduled: { label: "Rescheduled", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
    no_show: { label: "No Show", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    hired: { label: "Hired", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  }
  const config = statusConfig[normalized ?? ""] ?? { 
    label: status || "Unknown", 
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100" 
  }
  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  )
}

const renderInterviewTypeBadge = (type?: string) => {
  const typeConfig: Record<string, { label: string; className: string }> = {
    screening: { label: "Screening", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
    technical: { label: "Technical", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    behavioral: { label: "Behavioral", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    portfolio: { label: "Portfolio", className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
    case_study: { label: "Case Study", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
    final: { label: "Final", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  }
  const config = typeConfig[type ?? ""] ?? { 
    label: type || "Type", 
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100" 
  }
  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  )
}

const getFormattedDateTime = (value?: string) => {
  if (!value) return "N/A"
  try {
    return format(new Date(value), "MMMM dd, yyyy 'at' h:mm a")
  } catch {
    return value
  }
}

const getFormattedDate = (value?: string) => {
  if (!value) return "N/A"
  try {
    return format(new Date(value), "PPP")
  } catch {
    return value
  }
}

export function JobInterviewContent() {
  const interviewsQuery = useRecruitmentInterviews()
  const candidatesQuery = useRecruitmentCandidates()
  const jobsQuery = useRecruitmentJobs()
  const createInterviewMutation = useCreateRecruitmentInterview()
  const updateInterviewMutation = useUpdateRecruitmentInterview()
  const deleteInterviewMutation = useDeleteRecruitmentInterview()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<RecruitmentInterview | null>(null)
  const [interviewToEdit, setInterviewToEdit] = useState<RecruitmentInterview | null>(null)
  const [feedbackInterview, setFeedbackInterview] = useState<RecruitmentInterview | null>(null)
  const [interviewToDelete, setInterviewToDelete] = useState<RecruitmentInterview | null>(null)
  const [interviewToUpdateStatus, setInterviewToUpdateStatus] = useState<RecruitmentInterview | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const candidateMap = useMemo(() => {
    const map = new Map<string, { candidate_name: string; email: string }>()
    const candidates = candidatesQuery.data?.data ?? []
    candidates.forEach((candidate) => {
      map.set(candidate.id, { candidate_name: candidate.candidate_name, email: candidate.email })
    })
    return map
  }, [candidatesQuery.data?.data])

  const jobMap = useMemo(() => {
    const map = new Map<string, { job_title?: string; location?: string }>()
    const jobs = jobsQuery.data?.data ?? []
    jobs.forEach((job) => {
      map.set(job.id, { job_title: job.job_title, location: job.location })
    })
    return map
  }, [jobsQuery.data?.data])

  const candidateOptions = useMemo(() => {
    const candidates = candidatesQuery.data?.data ?? []
    return candidates.map((candidate) => ({ value: candidate.id, label: candidate.candidate_name }))
  }, [candidatesQuery.data?.data])

  const jobOptions = useMemo(() => {
    const jobs = jobsQuery.data?.data ?? []
    return jobs.map((job) => ({
      value: job.id,
      label: job.job_title ? `${job.job_title} (${job.location ?? ""})` : job.id,
    }))
  }, [jobsQuery.data?.data])

  const tableData = useMemo(() => {
    const interviews = interviewsQuery.data?.data ?? []
    return interviews.map((interview) => {
      const candidate = candidateMap.get(interview.candidate_id)
      const job = jobMap.get(interview.job_id)
      const formattedDate = interview.interview_datetime
        ? format(new Date(interview.interview_datetime), "MMM dd, yyyy h:mm a")
        : "TBD"
      const interviewers = interview.interviewers
        ? interview.interviewers.split(",").map((value) => value.trim())
        : []

      return {
        ...interview,
        candidateName: candidate?.candidate_name ?? interview.candidate_id,
        candidateEmail: candidate?.email,
        jobTitle: job?.job_title ?? interview.job_id,
        jobLocation: job?.location,
        formattedDate,
        interviewersList: interviewers,
      }
    })
  }, [interviewsQuery.data?.data, candidateMap, jobMap])

  const interviewFormFields = useMemo(() => interviewFields(candidateOptions, jobOptions), [candidateOptions, jobOptions])
  const interviewEditFields = useMemo(
    () => interviewFormFields.filter((field) => field.name !== "status"),
    [interviewFormFields],
  )
  const interviewSearchFields = useMemo(
    () => [
      { name: "candidate_id", label: "Candidate", type: "select", options: candidateOptions },
      { name: "job_id", label: "Job", type: "select", options: jobOptions },
      {
        name: "interview_type",
        label: "Interview Type",
        type: "select",
        options: RECRUITMENT_INTERVIEW_TYPE_OPTIONS,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: RECRUITMENT_INTERVIEW_STATUS_OPTIONS,
      },
      { name: "interview_datetime", label: "Interview Date", type: "date" },
    ],
    [candidateOptions, jobOptions],
  )

  const editInitialValues = useMemo(() => {
    if (!interviewToEdit) return undefined

    const interviewDate = interviewToEdit.interview_datetime
      ? format(new Date(interviewToEdit.interview_datetime), "yyyy-MM-dd")
      : undefined
    const interviewTime = interviewToEdit.interview_datetime
      ? format(new Date(interviewToEdit.interview_datetime), "HH:mm")
      : undefined

    const candidateLabel =
      interviewToEdit.candidate_name ??
      candidateMap.get(interviewToEdit.candidate_id ?? "")?.candidate_name
    const candidateLabelNormalized = candidateLabel?.trim().toLowerCase()
    const candidateOption = candidateOptions.find(
      (option) => option.label.trim().toLowerCase() === candidateLabelNormalized,
    )
    const jobLabel = interviewToEdit.job_title?.trim().toLowerCase()
    const jobOption = jobOptions.find((option) => {
      const label = option.label.split("(")[0].trim().toLowerCase()
      return jobLabel ? label === jobLabel : false
    })
    const candidateIdFromMap = Array.from(candidateMap.entries()).find(
      ([, value]) => value.candidate_name.trim().toLowerCase() === candidateLabelNormalized,
    )?.[0]
    const jobIdFromMap = Array.from(jobMap.entries()).find(
      ([, value]) => value.job_title?.trim().toLowerCase() === jobLabel,
    )?.[0]

    return {
      ...interviewToEdit,
      candidate_id:
        interviewToEdit.candidate_id ?? candidateOption?.value ?? candidateIdFromMap,
      job_id: interviewToEdit.job_id ?? jobOption?.value ?? jobIdFromMap,
      interview_date: interviewDate,
      interview_time: interviewTime,
    }
  }, [interviewToEdit, candidateOptions, jobOptions, candidateMap, jobMap])

  const feedbackInitialValues = useMemo(() => {
    if (!feedbackInterview) return undefined
    return {
      feedback: feedbackInterview.feedback ?? "",
      notes: feedbackInterview.notes ?? "",
    }
  }, [feedbackInterview])

  const mutationsLoading = 
    createInterviewMutation.isLoading || 
    updateInterviewMutation.isLoading || 
    deleteInterviewMutation.isLoading

  useEffect(() => {
    if (!isViewDialogOpen) {
      setSelectedInterview(null)
    }
  }, [isViewDialogOpen])

  useEffect(() => {
    if (!isEditDialogOpen) {
      setInterviewToEdit(null)
    }
  }, [isEditDialogOpen])

  useEffect(() => {
    if (!isFeedbackDialogOpen) {
      setFeedbackInterview(null)
    }
  }, [isFeedbackDialogOpen])

  useEffect(() => {
    if (!isDeleteDialogOpen) {
      setInterviewToDelete(null)
    }
  }, [isDeleteDialogOpen])

  useEffect(() => {
    if (!isStatusDialogOpen) {
      setInterviewToUpdateStatus(null)
    }
  }, [isStatusDialogOpen])

  const statsCards = useMemo(() => {
    const interviews = interviewsQuery.data?.data ?? []
    const counts = interviews.reduce<Record<string, number>>((acc, interview) => {
      const status = interview.status?.toLowerCase() ?? "unknown"
      acc[status] = (acc[status] ?? 0) + 1
      return acc
    }, {})

    return [
      { title: "Scheduled", value: counts.scheduled ?? 0, description: "Upcoming interviews" },
      { title: "In Progress", value: counts.in_progress ?? 0, description: "Currently interviewing" },
      { title: "Completed", value: counts.completed ?? 0, description: "Interviews done" },
      { title: "Total", value: interviews.length, description: "All interviews" },
    ]
  }, [interviewsQuery.data?.data])

  const filteredInterviews = useMemo(() => {
    let filtered = tableData
    if (typeFilter) {
      filtered = filtered.filter((item) => item.interview_type === typeFilter)
    }
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status?.toLowerCase() === statusFilter.toLowerCase())
    }
    return filtered
  }, [tableData, typeFilter, statusFilter])

  const handleAdd = (data: Record<string, any>) => {
    const payload = sanitizeInterviewPayload(data)
    createInterviewMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Interview scheduled successfully.")
        setIsAddDialogOpen(false)
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  const handleEdit = (valuesOrId: string | Record<string, any>) => {
    if (typeof valuesOrId === "string") {
      const interview = interviewsQuery.data?.data?.find((item) => item.id === valuesOrId)
      if (!interview) return
      setInterviewToEdit(interview)
      setIsEditDialogOpen(true)
      return
    }

    if (!interviewToEdit) return
    const payload = sanitizeInterviewPayload({ ...interviewToEdit, ...valuesOrId })
    updateInterviewMutation.mutate(
      { id: interviewToEdit.id, payload },
      {
        onSuccess: () => {
          toast.success("Interview updated successfully.")
          setIsEditDialogOpen(false)
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )
  }

  const openStatusDialog = (interview: RecruitmentInterview) => {
    setInterviewToUpdateStatus(interview)
    setIsStatusDialogOpen(true)
  }

  const handleStatusUpdate = (nextStatus: string) => {
    if (!interviewToUpdateStatus) return
    const payload = sanitizeInterviewPayload({
      ...interviewToUpdateStatus,
      status: nextStatus,
    })

    updateInterviewMutation.mutate(
      { id: interviewToUpdateStatus.id, payload },
      {
        onSuccess: () => {
          toast.success("Interview status updated successfully.")
          setIsStatusDialogOpen(false)
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )
  }

  const handleDelete = (id: string) => {
    const interview = interviewsQuery.data?.data?.find((item) => item.id === id)
    if (interview) {
      setInterviewToDelete(interview)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!interviewToDelete) return
    deleteInterviewMutation.mutate(interviewToDelete.id, {
      onSuccess: () => {
        toast.success(`${interviewToDelete.candidate_id} interview removed.`)
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  const handleView = (id: string) => {
    const interview = interviewsQuery.data?.data?.find((item) => item.id === id)
    if (interview) {
      setSelectedInterview(interview)
      setIsViewDialogOpen(true)
    }
  }

  const handleFeedback = (id: string) => {
    const interview = interviewsQuery.data?.data?.find((item) => item.id === id)
    if (interview) {
      setFeedbackInterview(interview)
      setIsFeedbackDialogOpen(true)
    }
  }

  const handleSubmitFeedback = (values: Record<string, any>) => {
    if (!feedbackInterview) return
    const payload = sanitizeInterviewPayload({ ...feedbackInterview, ...values })
    updateInterviewMutation.mutate(
      { id: feedbackInterview.id, payload },
      {
        onSuccess: () => {
          toast.success("Feedback saved.")
          setIsFeedbackDialogOpen(false)
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )
  }

  const handleEditFromView = () => {
    if (!selectedInterview) return
    setIsViewDialogOpen(false)
    setInterviewToEdit(selectedInterview)
    setIsEditDialogOpen(true)
  }

  const handleFeedbackFromView = () => {
    if (!selectedInterview) return
    setIsViewDialogOpen(false)
    setFeedbackInterview(selectedInterview)
    setIsFeedbackDialogOpen(true)
  }

  const interviewColumns = useMemo(
    () => [
      { 
        key: "candidateName", 
        label: "Candidate",
        render: (value: string, row: any) => (
          <div>
            <div className="font-medium">{value}</div>
            {row.candidate_name }
          </div>
        ),
      },
      { 
        key: "jobTitle", 
        label: "Job",
        render: (value: string, row: any) => (
          <div>
            <div>{value}</div>
            {row.job_title }
          </div>
        ),
      },
      { 
        key: "formattedDate", 
        label: "Date & Time",
        render: (value: string) => value,
      },
      { 
        key: "interview_type", 
        label: "Type",
        render: (value: string) => renderInterviewTypeBadge(value),
      },
      { 
        key: "status", 
        label: "Status",
        render: (value: string) => renderStatusBadge(value),
      },
      { 
        key: "round", 
        label: "Round",
        render: (value: number) => value ? `Round ${value}` : "-",
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: unknown, row: RecruitmentInterview & { candidateName: string }) => (
          <div className="flex justify-start space-x-2">
            <Button variant="outline" size="icon" onClick={() => openStatusDialog(row)} title="Change Status">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleView(row.id)} title="View">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleEdit(row.id)} title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(row.id)}
              title="Delete"
              disabled={deleteInterviewMutation.isLoading}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleView, handleEdit, handleDelete, openStatusDialog],
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title} className="border border-gray-200 shadow-sm">
            <CardContent className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Interviews</CardTitle>
              <CardDescription className="text-gray-600">Schedule and manage candidate interviews</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Interviews"
            columns={interviewColumns}
            data={filteredInterviews}
            searchFields={interviewSearchFields}
            onAdd={() => setIsAddDialogOpen(true)}
            onEdit={(id) => handleEdit(id)}
            onDelete={(id) => handleDelete(id)}
            onView={handleView}
            showActions
            defaultSortColumn="interview_datetime"
            defaultSortDirection="desc"
            addButtonProps={{ disabled: mutationsLoading }}
            addButtonLoading={createInterviewMutation.isLoading}
            extraSearchControls={
              <div className="flex gap-2">
                <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {RECRUITMENT_INTERVIEW_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {RECRUITMENT_INTERVIEW_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
            emptyMessage={
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
                <p className="text-sm text-gray-600 mb-4">Start by scheduling an interview for a candidate</p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  disabled={mutationsLoading}
                >
                  {mutationsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Schedule Interview"
                  )}
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>Capture the interview details and interviewer list.</DialogDescription>
          </DialogHeader>
          <EnhancedForm
            key="add-interview"
            fields={interviewFormFields}
            onSubmit={handleAdd}
            cancelLabel="Cancel"
            submitLabel="Schedule Interview"
            isSubmitting={createInterviewMutation.isLoading}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {interviewToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Interview</DialogTitle>
              <DialogDescription>Update scheduling details before saving.</DialogDescription>
            </DialogHeader>
            <EnhancedForm
              key={`edit-${interviewToEdit.id}`}
              fields={interviewEditFields}
              initialValues={editInitialValues}
              onSubmit={handleEdit}
              cancelLabel="Cancel"
              submitLabel="Update Interview"
              isSubmitting={updateInterviewMutation.isLoading}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {interviewToUpdateStatus && (
        <StatusChangeDialog
          isOpen={isStatusDialogOpen}
          onClose={() => setIsStatusDialogOpen(false)}
          title="Change Interview Status"
          description={`Update the status for the interview with ${candidateMap.get(interviewToUpdateStatus.candidate_id)?.candidate_name || interviewToUpdateStatus.candidate_id}.`}
          currentStatus={interviewToUpdateStatus.status}
          options={RECRUITMENT_INTERVIEW_STATUS_OPTIONS}
          onConfirm={handleStatusUpdate}
          isLoading={updateInterviewMutation.isLoading}
        />
      )}

      {/* View Dialog */}
      {selectedInterview && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
            <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      Interview Details
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                      View interview for {candidateMap.get(selectedInterview.candidate_id)?.candidate_name || selectedInterview.candidate_id}
                    </DialogDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-8">
                {/* Interview Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Interview Information</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Candidate</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {candidateMap.get(selectedInterview.candidate_id)?.candidate_name || selectedInterview.candidate_id}
                          </p>
                          {candidateMap.get(selectedInterview.candidate_id)?.email && (
                            <p className="text-xs text-gray-500">{candidateMap.get(selectedInterview.candidate_id)?.email}</p>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Job</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {jobMap.get(selectedInterview.job_id)?.job_title || selectedInterview.job_id}
                          </p>
                          {jobMap.get(selectedInterview.job_id)?.location && (
                            <p className="text-xs text-gray-500">{jobMap.get(selectedInterview.job_id)?.location}</p>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Video className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Interview Type</span>
                          </div>
                          {renderInterviewTypeBadge(selectedInterview.interview_type)}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Date & Time</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {getFormattedDateTime(selectedInterview.interview_datetime)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Round</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedInterview.round ? `Round ${selectedInterview.round}` : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Status</span>
                          </div>
                          {renderStatusBadge(selectedInterview.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interviewers & Location */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Interview Details</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">Interviewers</span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {selectedInterview.interviewers || "No interviewers specified"}
                      </p>
                    </div>
                    
                    {selectedInterview.location && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500 font-medium">Location</span>
                        </div>
                        <p className="text-sm text-gray-900">{selectedInterview.location}</p>
                      </div>
                    )}

                    {selectedInterview.meeting_link && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link2 className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500 font-medium">Meeting Link</span>
                        </div>
                        <a 
                          href={selectedInterview.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {selectedInterview.meeting_link}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes & Feedback */}
                {(selectedInterview.notes || selectedInterview.feedback) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Additional Information</h3>
                    <div className="space-y-4">
                      {selectedInterview.notes && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Notes</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{selectedInterview.notes}</p>
                        </div>
                      )}
                      {selectedInterview.feedback && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Feedback</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{selectedInterview.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {(selectedInterview.created_at || selectedInterview.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedInterview.created_at && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            {format(new Date(selectedInterview.created_at), "PPpp")}
                          </p>
                        </div>
                      )}
                      {selectedInterview.updated_at && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            {format(new Date(selectedInterview.updated_at), "PPpp")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

           
          </DialogContent>
        </Dialog>
      )}

      {/* Feedback Dialog */}
      {feedbackInterview && (
        <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Interview Feedback</DialogTitle>
              <DialogDescription>
                Add feedback for {candidateMap.get(feedbackInterview.candidate_id)?.candidate_name || feedbackInterview.candidate_id}
              </DialogDescription>
            </DialogHeader>
            <EnhancedForm
              key={`feedback-${feedbackInterview.id}`}
              fields={feedbackFields}
              initialValues={feedbackInitialValues}
              onSubmit={handleSubmitFeedback}
              cancelLabel="Cancel"
              submitLabel="Save Feedback"
              isSubmitting={updateInterviewMutation.isLoading}
              onCancel={() => setIsFeedbackDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Interview"
        description="Removing this interview cannot be undone."
        itemName={interviewToDelete ? 
          `${candidateMap.get(interviewToDelete.candidate_id)?.candidate_name || interviewToDelete.candidate_id}'s interview` : 
          "this interview"
        }
        isLoading={deleteInterviewMutation.isLoading}
      />
    </div>
  )
}
