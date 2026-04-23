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
import { Eye, Edit, Trash2, User, Mail, Phone, Hash, Calendar, Briefcase, GraduationCap, FileText, ClipboardList, X, Loader2, RefreshCw } from "lucide-react"
import {
  useCreateRecruitmentCandidate,
  useDeleteRecruitmentCandidate,
  useRecruitmentCandidates,
  useUpdateRecruitmentCandidate,
} from "@/services/hooks/recruitment/candidates"
import { useRecruitmentJobs } from "@/services/hooks/recruitment/jobs"
import { RECRUITMENT_CANDIDATE_STATUS_OPTIONS } from "@/services/constants/recruitment/candidates"
import {
  RecruitmentCandidate,
  RecruitmentCandidatePayload,
} from "@/types/recruitment/candidates"
import { toast } from "sonner"

const baseCandidateFields: FormField[] = [
  {
    name: "candidate_name",
    label: "Candidate Name",
    type: "text",
    placeholder: "Full name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "name@example.com",
    required: true,
  },
  {
    name: "phone_number",
    label: "Phone Number",
    type: "text",
    placeholder: "+234 800 000 0000",
    required: true,
  },
  {
    name: "job_id",
    label: "Job ID",
    type: "select",
    placeholder: "Select a job",
    required: true,
  },
  {
    name: "application_date",
    label: "Application Date",
    type: "date",
    datePickerVariant: "input",
    placeholder: "Select date",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: RECRUITMENT_CANDIDATE_STATUS_OPTIONS,
    required: true,
  },
  {
    name: "experience",
    label: "Experience",
    type: "text",
    placeholder: "e.g. 3 years",
    required: true,
  },
  {
    name: "education",
    label: "Education",
    type: "text",
    placeholder: "Highest education",
    required: true,
  },
  {
    name: "skills",
    label: "Skills",
    type: "textarea",
    placeholder: "List skills or technologies",
    required: true,
  },
]

const buildCandidateFields = (jobOptions: Array<{ value: string; label: string }>): FormField[] => {
  return baseCandidateFields.map((field) =>
    field.name === "job_id" ? { ...field, options: jobOptions } : field,
  )
}

const getErrorMessage = (error?: unknown) => {
  if (!error) {
    return "Something went wrong. Please try again."
  }

  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    const axiosMessage = (error as unknown as { response?: { data?: { message?: string } } }).response
      ?.data?.message
    return axiosMessage ?? error.message
  }

  const responseMessage = (error as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message
  if (responseMessage) {
    return responseMessage
  }

  const fallbackMessage = (error as unknown as { message?: string })?.message
  if (fallbackMessage && typeof fallbackMessage === "string") {
    return fallbackMessage
  }

  return "Something went wrong. Please try again."
}

const sanitizeCandidatePayload = (values: Record<string, any>): RecruitmentCandidatePayload => ({
  candidate_name: values.candidate_name,
  email: values.email,
  phone_number: values.phone_number,
  job_id: values.job_id,
  application_date: values.application_date,
  status: values.status,
  experience: values.experience,
  education: values.education,
  skills: values.skills,
})

const getFormattedDate = (value?: string) => {
  if (!value) return "N/A"
  try {
    return format(new Date(value), "PPP")
  } catch {
    return value
  }
}

const getFormattedDateTime = (value?: string) => {
  if (!value) return "N/A"
  try {
    return format(new Date(value), "PPpp")
  } catch {
    return value
  }
}

const getStatusBadge = (status?: string) => {
  const normalized = status?.toLowerCase() ?? "unknown"
  const statusConfig: Record<string, { label: string; className: string }> = {
    applied: { label: "Applied", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    shortlisted: { label: "Shortlisted", className: "bg-sky-100 text-sky-800 hover:bg-sky-100" },
    interview: { label: "Interview", className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100" },
    offered: { label: "Offered", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
    hired: { label: "Hired", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    unknown: { label: "Unknown", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
  }
  const config = statusConfig[normalized] ?? { label: status || "Unknown", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" }
  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  )
}

export function JobCandidatesContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null)
  const [viewCandidate, setViewCandidate] = useState<RecruitmentCandidate | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [candidateToUpdateStatus, setCandidateToUpdateStatus] = useState<RecruitmentCandidate | null>(null)
  const [candidateToDelete, setCandidateToDelete] = useState<RecruitmentCandidate | null>(null)
  const [addFormValues, setAddFormValues] = useState<Partial<RecruitmentCandidatePayload>>({})
  const [editFormValues, setEditFormValues] = useState<Partial<RecruitmentCandidatePayload>>({})
  const [statusFilter, setStatusFilter] = useState("")

  const candidatesQuery = useRecruitmentCandidates()
  const createCandidateMutation = useCreateRecruitmentCandidate()
  const updateCandidateMutation = useUpdateRecruitmentCandidate()
  const deleteCandidateMutation = useDeleteRecruitmentCandidate()
  const jobsQuery = useRecruitmentJobs()
  const candidateMutationsLoading =
    createCandidateMutation.isLoading || updateCandidateMutation.isLoading || deleteCandidateMutation.isLoading

  const candidateList = candidatesQuery.data?.data ?? []
  const jobOptions = useMemo(() => {
    const jobs = jobsQuery.data?.data ?? []
    return jobs.map((job) => ({
      value: job.id,
      label: job.job_title ? `${job.job_title} (${job.location || job.status})` : job.id,
    }))
  }, [jobsQuery.data?.data])
  const candidateFields = useMemo(() => buildCandidateFields(jobOptions), [jobOptions])
  const candidateEditFields = useMemo(
    () => candidateFields.filter((field) => field.name !== "status"),
    [candidateFields],
  )
  const candidateSearchFields = useMemo(
    () => [
      { name: "candidate_name", label: "Candidate Name", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "job_id", label: "Job", type: "select", options: jobOptions },
      { name: "status", label: "Status", type: "select", options: RECRUITMENT_CANDIDATE_STATUS_OPTIONS },
      { name: "application_date", label: "Application Date", type: "date" },
    ],
    [jobOptions],
  )

  useEffect(() => {
    if (!isAddDialogOpen) {
      setAddFormValues({})
    }
  }, [isAddDialogOpen])

  useEffect(() => {
    if (!isEditDialogOpen) {
      setEditFormValues({})
      setSelectedCandidate(null)
    }
  }, [isEditDialogOpen])

  useEffect(() => {
    if (!isViewDialogOpen) {
      setViewCandidate(null)
    }
  }, [isViewDialogOpen])

  useEffect(() => {
    if (!isDeleteDialogOpen) {
      setCandidateToDelete(null)
    }
  }, [isDeleteDialogOpen])

  useEffect(() => {
    if (!isStatusDialogOpen) {
      setCandidateToUpdateStatus(null)
    }
  }, [isStatusDialogOpen])

  const statsCards = useMemo(() => {
    const counts = candidateList.reduce<Record<string, number>>((acc, candidate) => {
      const key = candidate.status?.toLowerCase() ?? "unknown"
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    return [
      { title: "Applied", value: counts.applied ?? 0, description: "Recent applications" },
      { title: "Interview", value: counts.interview ?? 0, description: "Candidates under evaluation" },
      { title: "Offered", value: counts.offered ?? 0, description: "Offers pending" },
      { title: "Hired", value: counts.hired ?? 0, description: "Accepted offers" },
    ]
  }, [candidateList])

  const filteredCandidates = useMemo(() => {
    if (!statusFilter) return candidateList
    return candidateList.filter((candidate) => candidate.status?.toLowerCase() === statusFilter.toLowerCase())
  }, [candidateList, statusFilter])

  const handleAdd = (data: Record<string, any>) => {
    const payload = sanitizeCandidatePayload({ ...addFormValues, ...data })
    createCandidateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(`${payload.candidate_name ?? "Candidate"} added successfully.`)
        setIsAddDialogOpen(false)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  const handleEdit = (idOrValues: string | Record<string, any>) => {
    if (typeof idOrValues === "string") {
      const candidate = candidateList.find((item) => item.id === idOrValues)
      if (candidate) {
        setSelectedCandidate(candidate)
        setEditFormValues(candidate)
        setIsEditDialogOpen(true)
      }
      return
    }
    if (!selectedCandidate) return
    const payload = sanitizeCandidatePayload({ ...selectedCandidate, ...editFormValues, ...idOrValues })
    updateCandidateMutation.mutate(
      { id: selectedCandidate.id, payload },
      {
        onSuccess: () => {
          toast.success(`${payload.candidate_name ?? selectedCandidate.candidate_name} updated successfully.`)
          setIsEditDialogOpen(false)
        },
        onError: (error) => {
          toast.error(getErrorMessage(error))
        },
      },
    )
  }

  const openStatusDialog = (candidate: RecruitmentCandidate) => {
    setCandidateToUpdateStatus(candidate)
    setIsStatusDialogOpen(true)
  }

  const handleStatusUpdate = async (nextStatus: string) => {
    if (!candidateToUpdateStatus) return
    const payload = sanitizeCandidatePayload({
      ...candidateToUpdateStatus,
      status: nextStatus,
    })

    updateCandidateMutation.mutate(
      { id: candidateToUpdateStatus.id, payload },
      {
        onSuccess: () => {
          toast.success(`${candidateToUpdateStatus.candidate_name} status updated successfully.`)
          setIsStatusDialogOpen(false)
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    )
  }

  const handleView = (id: string) => {
    const candidate = candidateList.find((item) => item.id === id)
    if (candidate) {
      setViewCandidate(candidate)
      setIsViewDialogOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return
    try {
      await deleteCandidateMutation.mutateAsync(candidateToDelete.id)
      toast.success(`${candidateToDelete.candidate_name} has been removed.`)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const candidateColumns = useMemo(
    () => [
      { key: "candidate_name", label: "Candidate" },
      { key: "email", label: "Email" },
      { key: "phone_number", label: "Phone" },
      {
        key: "job_id",
        label: "Job ID",
        render: (value: string) => value || "N/A",
      },
      {
        key: "application_date",
        label: "Application Date",
        render: (value: string) => (value ? format(new Date(value), "MMM dd, yyyy") : "N/A"),
      },
      {
        key: "status",
        label: "Status",
        render: (value: string) => {
          const normalized = value?.toLowerCase()
          if (!normalized) {
            return <Badge variant="outline">Unknown</Badge>
          }
          return <Badge className="uppercase">{normalized}</Badge>
        },
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: unknown, row: RecruitmentCandidate) => (
          <div className="flex justify-end space-x-2">
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
              onClick={() => {
                setCandidateToDelete(row)
                setIsDeleteDialogOpen(true)
              }}
              title="Delete"
              disabled={deleteCandidateMutation.isLoading}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit, handleView, openStatusDialog],
  )

  return (
    <div className="space-y-6">
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

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Candidates</CardTitle>
              <CardDescription className="text-gray-600">Manage all candidate submissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Candidates"
            columns={candidateColumns}
            data={filteredCandidates}
            searchFields={candidateSearchFields}
            onAdd={() => setIsAddDialogOpen(true)}
            onEdit={(id) => handleEdit(id)}
            onDelete={(id) => {
              const candidate = candidateList.find((item) => item.id === id)
              if (candidate) {
                setCandidateToDelete(candidate)
                setIsDeleteDialogOpen(true)
              }
            }}
            onView={handleView}
            showActions
            defaultSortColumn="application_date"
            defaultSortDirection="desc"
            addButtonProps={{ disabled: candidateMutationsLoading }}
            addButtonLoading={createCandidateMutation.isLoading}
            extraSearchControls={
              <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {RECRUITMENT_CANDIDATE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
            emptyMessage={
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
                <p className="text-sm text-gray-600 mb-4">Start by adding a candidate to a job</p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  disabled={candidateMutationsLoading}
                >
                  {candidateMutationsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Add Candidate"
                  )}
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={candidateFields}
            onSubmit={handleAdd}
            cancelLabel="Cancel"
            submitLabel="Save Candidate"
            isSubmitting={createCandidateMutation.isLoading}
          />
        </DialogContent>
      </Dialog>

      {selectedCandidate && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Candidate</DialogTitle>
            </DialogHeader>
            <EnhancedForm
              fields={candidateEditFields}
              onSubmit={handleEdit}
              initialValues={selectedCandidate}
              cancelLabel="Cancel"
              submitLabel="Update Candidate"
              isSubmitting={updateCandidateMutation.isLoading}
            />
          </DialogContent>
        </Dialog>
      )}

      {candidateToUpdateStatus && (
        <StatusChangeDialog
          isOpen={isStatusDialogOpen}
          onClose={() => setIsStatusDialogOpen(false)}
          title="Change Candidate Status"
          description={`Update the application status for ${candidateToUpdateStatus.candidate_name}.`}
          currentStatus={candidateToUpdateStatus.status}
          options={RECRUITMENT_CANDIDATE_STATUS_OPTIONS}
          onConfirm={handleStatusUpdate}
          isLoading={updateCandidateMutation.isLoading}
        />
      )}

      {viewCandidate && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
            <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <User className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      Candidate Profile
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                      View application for {viewCandidate.candidate_name}
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
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Candidate Information</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Full name</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{viewCandidate.candidate_name}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Email</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{viewCandidate.email}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Phone</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{viewCandidate.phone_number}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Job ID</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 font-mono">{viewCandidate.job_id}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Application Date</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{getFormattedDate(viewCandidate.application_date)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Status</span>
                          </div>
                          {getStatusBadge(viewCandidate.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Application Details</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500 font-medium">Experience</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{viewCandidate.experience || "Not specified"}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500 font-medium">Education</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{viewCandidate.education || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">Skills</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {viewCandidate.skills || "No skills listed"}
                      </p>
                    </div>
                  </div>
                </div>

                {(viewCandidate.created_at || viewCandidate.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewCandidate.created_at && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">{getFormattedDateTime(viewCandidate.created_at)}</p>
                        </div>
                      )}
                      {viewCandidate.updated_at && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">{getFormattedDateTime(viewCandidate.updated_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="px-8 py-5 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCandidateToDelete(viewCandidate)
                    setIsDeleteDialogOpen(true)
                  }}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Candidate
                </Button>

                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                    className="border-gray-300 hover:bg-gray-100 text-gray-700"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      handleEdit(viewCandidate.id)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Candidate
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Candidate"
        description="Removing this candidate cannot be undone."
        itemName={candidateToDelete?.candidate_name ?? "this candidate"}
        isLoading={deleteCandidateMutation.isLoading}
      />
    </div>
  )
}
