"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"

import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView } from "@/app/admin/components/details-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Eye, Edit, Trash2 } from "lucide-react"
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
  RecruitmentCandidateFilters,
  RecruitmentCandidatePayload,
} from "@/types/recruitment/candidates"

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
  },
  {
    name: "education",
    label: "Education",
    type: "text",
    placeholder: "Highest education",
  },
  {
    name: "skills",
    label: "Skills",
    type: "textarea",
    placeholder: "List skills or technologies",
  },
]

const buildCandidateFields = (jobOptions: Array<{ value: string; label: string }>): FormField[] => {
  return baseCandidateFields.map((field) =>
    field.name === "job_id" ? { ...field, options: jobOptions } : field,
  )
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

export function JobCandidatesContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null)
  const [viewCandidate, setViewCandidate] = useState<RecruitmentCandidate | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [candidateToDelete, setCandidateToDelete] = useState<RecruitmentCandidate | null>(null)
  const [addFormValues, setAddFormValues] = useState<Partial<RecruitmentCandidatePayload>>({})
  const [editFormValues, setEditFormValues] = useState<Partial<RecruitmentCandidatePayload>>({})
  const [statusFilter, setStatusFilter] = useState("")

  const candidatesQuery = useRecruitmentCandidates()
  const createCandidateMutation = useCreateRecruitmentCandidate()
  const updateCandidateMutation = useUpdateRecruitmentCandidate()
  const deleteCandidateMutation = useDeleteRecruitmentCandidate()
  const jobsQuery = useRecruitmentJobs()

  const candidateList = candidatesQuery.data?.data ?? []
  const jobOptions = useMemo(() => {
    const jobs = jobsQuery.data?.data ?? []
    return jobs.map((job) => ({
      value: job.id,
      label: job.job_title ? `${job.job_title} (${job.location || job.status})` : job.id,
    }))
  }, [jobsQuery.data?.data])
  const candidateFields = useMemo(() => buildCandidateFields(jobOptions), [jobOptions])

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

  const searchFields: RecruitmentCandidateFilters[] = useMemo(
    () => [
      { status: "" }, // placeholder
    ],
    [],
  )

  const handleAdd = (data: Record<string, any>) => {
    const payload = sanitizeCandidatePayload({ ...addFormValues, ...data })
    createCandidateMutation.mutate(payload, {
      onSuccess: () => {
        setIsAddDialogOpen(false)
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
    const payload = sanitizeCandidatePayload({ ...editFormValues, ...idOrValues })
    updateCandidateMutation.mutate(
      { id: selectedCandidate.id, payload },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false)
        },
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
    await deleteCandidateMutation.mutateAsync(candidateToDelete.id)
    setIsDeleteDialogOpen(false)
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
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit, handleView],
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
            searchFields={[]}
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
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  Add Candidate
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
          <EnhancedForm fields={candidateFields} onSubmit={handleAdd} cancelLabel="Cancel" submitLabel="Save Candidate" />
        </DialogContent>
      </Dialog>

      {selectedCandidate && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Candidate</DialogTitle>
            </DialogHeader>
            <EnhancedForm
              fields={candidateFields}
              onSubmit={handleEdit}
              initialValues={selectedCandidate}
              cancelLabel="Cancel"
              submitLabel="Update Candidate"
              isSubmitting={updateCandidateMutation.isLoading}
            />
          </DialogContent>
        </Dialog>
      )}

      {viewCandidate && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DetailsView
              title={viewCandidate.candidate_name}
              subtitle={`${viewCandidate.email} • ${viewCandidate.phone_number}`}
              data={viewCandidate}
              tabs={[
                {
                  id: "overview",
                  label: "Overview",
                  sections: [
                    {
                      title: "Candidate Info",
                      fields: [
                        { label: "Candidate Name", value: viewCandidate.candidate_name },
                        { label: "Email", value: viewCandidate.email },
                        { label: "Phone", value: viewCandidate.phone_number },
                        { label: "Job ID", value: viewCandidate.job_id },
                        { label: "Application Date", value: viewCandidate.application_date, type: "date" },
                        { label: "Status", value: viewCandidate.status, type: "badge" },
                        { label: "Experience", value: viewCandidate.experience },
                        { label: "Education", value: viewCandidate.education },
                        { label: "Skills", value: viewCandidate.skills },
                      ],
                    },
                  ],
                },
              ]}
              onBack={() => setIsViewDialogOpen(false)}
              onEdit={() => {
                setIsViewDialogOpen(false)
                handleEdit(viewCandidate.id)
              }}
            />
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
