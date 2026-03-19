"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"

import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DetailsView } from "@/app/admin/components/details-view"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Eye, Edit, Trash2 } from "lucide-react"
import { buttonHoverEnhancements } from "@/app/admin/employees/button-hover"
import { toast } from "sonner"
import {
  useCreateRecruitmentJob,
  useDeleteRecruitmentJob,
  useRecruitmentJobs,
  useUpdateRecruitmentJob,
} from "@/services/hooks/recruitment/jobs"
import { RecruitmentJob, RecruitmentJobPayload } from "@/services/endpoints/recruitment/jobs"

const DEPARTMENT_OPTIONS = [
  { value: "Engineering", label: "Engineering" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Finance", label: "Finance" },
  { value: "Marketing", label: "Marketing" },
  { value: "Customer Service", label: "Customer Service" },
  { value: "Operations", label: "Operations" },
  { value: "Sales", label: "Sales" },
]

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "draft", label: "Draft" },
]

const JOB_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
]

const JOB_TAB_SEQUENCE = ["basic", "details", "requirements"] as const
type JobPostTab = (typeof JOB_TAB_SEQUENCE)[number]

const jobPostFields: FormField[] = [
  {
    name: "job_title",
    label: "Job Title",
    type: "text",
    placeholder: "Enter job title",
    required: true,
  },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: DEPARTMENT_OPTIONS,
    required: true,
  },
  {
    name: "number_of_positions",
    label: "Number of Positions",
    type: "number",
    min: 1,
    required: true,
  },
  {
    name: "posted_date",
    label: "Posted Date",
    type: "date",
    datePickerVariant: "input",
    placeholder: "Select job launch date",
    required: true,
  },
  {
    name: "closing_date",
    label: "Closing Date",
    type: "date",
    datePickerVariant: "input",
    placeholder: "Select closing date",
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: STATUS_OPTIONS,
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
    name: "job_type",
    label: "Job Type",
    type: "select",
    options: JOB_TYPE_OPTIONS,
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
    name: "salary_range",
    label: "Salary Range",
    type: "text",
    placeholder: "e.g. N300,000 - N500,000",
    required: true,
  },
  {
    name: "job_description",
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

const getNextTab = (current: JobPostTab): JobPostTab => {
  const currentIndex = JOB_TAB_SEQUENCE.indexOf(current)
  if (currentIndex === -1 || currentIndex >= JOB_TAB_SEQUENCE.length - 1) {
    return current
  }
  return JOB_TAB_SEQUENCE[currentIndex + 1]
}

const getPreviousTab = (current: JobPostTab): JobPostTab => {
  const currentIndex = JOB_TAB_SEQUENCE.indexOf(current)
  if (currentIndex <= 0) {
    return current
  }
  return JOB_TAB_SEQUENCE[currentIndex - 1]
}

const normalizeString = (value?: unknown) => (typeof value === "string" ? value.toLowerCase() : value)

const sanitizePayload = (values: Record<string, any>): RecruitmentJobPayload => {
  const { id, created_at, updated_at, applications, author, ...rest } = values
  return {
    ...rest,
    number_of_positions: Number(rest.number_of_positions) || 0,
    job_type: normalizeString(rest.job_type),
    status: normalizeString(rest.status),
  } as RecruitmentJobPayload
}

export function JobPostContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<RecruitmentJob | null>(null)
  const [activeAddTab, setActiveAddTab] = useState<JobPostTab>("basic")
  const [activeEditTab, setActiveEditTab] = useState<JobPostTab>("basic")
  const [addFormValues, setAddFormValues] = useState<Partial<RecruitmentJobPayload>>({})
  const [editFormValues, setEditFormValues] = useState<Partial<RecruitmentJobPayload>>({})
  const [viewJob, setViewJob] = useState<RecruitmentJob | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<RecruitmentJob | null>(null)
  const [statusFilter, setStatusFilter] = useState("")

  const jobsQuery = useRecruitmentJobs()
  const createJobMutation = useCreateRecruitmentJob()
  const updateJobMutation = useUpdateRecruitmentJob()
  const deleteJobMutation = useDeleteRecruitmentJob()
  const jobRecords = jobsQuery.data?.data ?? []
  const jobs = useMemo(() => {
    if (!jobRecords || jobRecords.length === 0) return []
    return [...jobRecords].sort((a, b) => {
      const first = new Date(b.created_at).getTime()
      const second = new Date(a.created_at).getTime()
      return first - second
    })
  }, [jobRecords])

  useEffect(() => {
    if (!isAddDialogOpen) {
      setActiveAddTab("basic")
      setAddFormValues({})
    }
  }, [isAddDialogOpen])

  useEffect(() => {
    if (!isEditDialogOpen) {
      setActiveEditTab("basic")
      setEditFormValues({})
    }
  }, [isEditDialogOpen])

  useEffect(() => {
    if (isEditDialogOpen && selectedJob) {
      setEditFormValues(selectedJob)
    }
  }, [isEditDialogOpen, selectedJob])

  useEffect(() => {
    if (!isViewDialogOpen) {
      setViewJob(null)
    }
  }, [isViewDialogOpen])

  useEffect(() => {
    if (!isDeleteDialogOpen) {
      setJobToDelete(null)
    }
  }, [isDeleteDialogOpen])

  const openAddDialog = () => {
    setAddFormValues({})
    setActiveAddTab("basic")
    setIsAddDialogOpen(true)
  }

  const handleAddStepSubmit = (currentTab: JobPostTab) => (data: Record<string, any>) => {
    setAddFormValues((prev) => ({ ...prev, ...data }))
    setActiveAddTab(getNextTab(currentTab))
  }

  const handleEditStepSubmit = (currentTab: JobPostTab) => (data: Record<string, any>) => {
    setEditFormValues((prev) => ({ ...prev, ...data }))
    setActiveEditTab(getNextTab(currentTab))
  }

  const handleAdd = (data: Record<string, any>) => {
    const combinedValues = { ...addFormValues, ...data }
    const payload = sanitizePayload(combinedValues)
    createJobMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Job post created")
        setIsAddDialogOpen(false)
        setAddFormValues({})
        setActiveAddTab("basic")
      },
      onError: () => toast.error("Unable to create job post"),
    })
  }

  const handleEdit = (data: Record<string, any>) => {
    if (!selectedJob) return
    const combinedValues = { ...editFormValues, ...data }
    const payload = sanitizePayload(combinedValues)
    updateJobMutation.mutate(
      { id: selectedJob.id, payload },
      {
        onSuccess: () => {
          toast.success("Job post updated")
          setIsEditDialogOpen(false)
          setEditFormValues({})
          setActiveEditTab("basic")
          setSelectedJob(null)
        },
        onError: () => toast.error("Unable to update job post"),
      },
    )
  }

  const handleOpenDeleteDialog = useCallback((job: RecruitmentJob) => {
    setJobToDelete(job)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return
    try {
      await deleteJobMutation.mutateAsync(jobToDelete.id)
      toast.success("Job post removed")
      setIsDeleteDialogOpen(false)
      setJobToDelete(null)
    } catch (error) {
      toast.error("Unable to delete job post")
    }
  }

  const handleView = useCallback(
    (id: string) => {
      const job = jobs.find((item) => item.id === id)
      if (job) {
        setViewJob(job)
        setIsViewDialogOpen(true)
      }
    },
    [jobs],
  )

  const handleEdit2 = useCallback(
    (id: string) => {
      const job = jobs.find((item) => item.id === id)
      if (job) {
        setSelectedJob(job)
        setActiveEditTab("basic")
        setEditFormValues(job)
        setIsEditDialogOpen(true)
      }
    },
    [jobs],
  )

  const closeViewDialog = () => {
    setIsViewDialogOpen(false)
    setViewJob(null)
  }

  const jobColumns = useMemo(
    () => [
      { key: "job_title", label: "Job Title", sortable: true },
      { key: "department", label: "Department", sortable: true },
      {
        key: "number_of_positions",
        label: "Positions",
        sortable: true,
        render: (value: number) => (value ?? "N/A"),
      },
      {
        key: "posted_date",
        label: "Posted Date",
        sortable: true,
        render: (value: string) => (value ? format(new Date(value), "MMM dd, yyyy") : "N/A"),
      },
      {
        key: "closing_date",
        label: "Closing Date",
        sortable: true,
        render: (value: string) => (value ? format(new Date(value), "MMM dd, yyyy") : "N/A"),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (value: string) => {
          const normalized = value?.toLowerCase() ?? "unknown"
          if (normalized === "active") return <Badge className="bg-green-500">Active</Badge>
          if (normalized === "closed") return <Badge variant="secondary">Closed</Badge>
          if (normalized === "draft") return <Badge variant="outline">Draft</Badge>
          return <Badge variant="outline">{value}</Badge>
        },
      },
      { key: "location", label: "Location", sortable: true },
      { key: "job_type", label: "Job Type", sortable: true },
      {
        key: "actions",
        label: "Actions",
        render: (_: unknown, row: RecruitmentJob) => {
          const normalizedStatus = row.status?.toLowerCase() ?? ""
          const disableActions = normalizedStatus === "closed"
          return (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleView(row.id)} title="View Details">
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit2(row.id)}
                title="Edit"
                disabled={disableActions}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleOpenDeleteDialog(row)}
                title="Delete"
                disabled={disableActions}
                className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [handleEdit2, handleOpenDeleteDialog, handleView],
  )

  const departmentOptions = useMemo(() => {
    const uniqueDepartments = Array.from(
      new Set(
        jobs
          .map((job) => job.department?.trim())
          .filter((department): department is string => Boolean(department)),
      ),
    )

    return uniqueDepartments.map((department) => ({ value: department, label: department }))
  }, [jobs])

  const statusCounts = useMemo(() => {
    return jobs.reduce<Record<string, number>>((acc, job) => {
      const key = job.status?.toLowerCase() ?? "unknown"
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  }, [jobs])

  const totalPositions = useMemo(
    () => jobs.reduce((sum, job) => sum + (Number(job.number_of_positions) || 0), 0),
    [jobs],
  )

  const statsCards = useMemo(
    () => [
      { title: "Active Jobs", value: statusCounts.active ?? 0, description: "Currently accepting applications" },
      { title: "Drafts", value: statusCounts.draft ?? 0, description: "Work in progress" },
      { title: "Closed Jobs", value: statusCounts.closed ?? 0, description: "Roles that are no longer active" },
      { title: "Total Roles", value: totalPositions, description: "Headcount across all job posts" },
    ],
    [statusCounts, totalPositions],
  )

  const jobSearchFields = useMemo(
    () => [
      { name: "job_title", label: "Job Title", type: "text" },
      {
        name: "department",
        label: "Department",
        type: "select",
        options: departmentOptions,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: STATUS_OPTIONS,
      },
      {
        name: "job_type",
        label: "Job Type",
        type: "select",
        options: JOB_TYPE_OPTIONS,
      },
    ],
    [departmentOptions],
  )

  const filteredJobs = useMemo(() => {
    if (!statusFilter) return jobs
    return jobs.filter((job) => job.status?.toLowerCase() === statusFilter.toLowerCase())
  }, [jobs, statusFilter])

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      setStatusFilter("")
    } else {
      setStatusFilter(value)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title} className="border border-gray-200 bg-white shadow-sm">
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
              <CardTitle className="text-lg font-semibold text-gray-900">Job Posts</CardTitle>
              <CardDescription className="text-gray-600">
                Manage job openings and keep the recruitment pipeline up to date.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Job Posts"
            columns={jobColumns}
            data={filteredJobs}
            searchFields={jobSearchFields}
            onAdd={openAddDialog}
            onEdit={handleEdit2}
            onDelete={(id: string) => {
              const job = jobs.find((item) => item.id === id)
              if (job) {
                handleOpenDeleteDialog(job)
              }
            }}
            onView={handleView}
            showActions={true}
            defaultSortColumn="posted_date"
            defaultSortDirection="desc"
            extraSearchControls={
              <Select
                value={statusFilter || "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className={`${buttonHoverEnhancements} w-40 justify-between`}>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
            emptyMessage={
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 border border-blue-200 mb-4">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-sky-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No job posts yet</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Publish your first role to keep talent pipelines moving.
                </p>
                <Button
                  onClick={openAddDialog}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  Add Job Post
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Add Job Post Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Job Post</DialogTitle>
          </DialogHeader>
          <Tabs value={activeAddTab} onValueChange={(value) => setActiveAddTab(value as JobPostTab)} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-4 space-y-4">
              <EnhancedForm
                fields={jobPostFields.slice(0, 8)}
                onSubmit={handleAddStepSubmit("basic")}
                onCancel={() => setIsAddDialogOpen(false)}
                submitLabel="Next"
                cancelLabel="Cancel"
              />
            </TabsContent>
            <TabsContent value="details" className="mt-4 space-y-4">
              <EnhancedForm
                fields={[jobPostFields[8], jobPostFields[9], jobPostFields[10]]}
                onSubmit={handleAddStepSubmit("details")}
                onCancel={() => setActiveAddTab(getPreviousTab("details"))}
                submitLabel="Next"
                cancelLabel="Back"
              />
            </TabsContent>
            <TabsContent value="requirements" className="mt-4 space-y-4">
              <EnhancedForm
                fields={[jobPostFields[11], jobPostFields[12]]}
                onSubmit={handleAdd}
                onCancel={() => setActiveAddTab(getPreviousTab("requirements"))}
                submitLabel="Create Job Post"
                cancelLabel="Back"
                isSubmitting={createJobMutation.isLoading}
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
            <Tabs value={activeEditTab} onValueChange={(value) => setActiveEditTab(value as JobPostTab)} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="details">Job Details</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="mt-4 space-y-4">
                <EnhancedForm
                  fields={jobPostFields.slice(0, 8)}
                  onSubmit={handleEditStepSubmit("basic")}
                  onCancel={() => setIsEditDialogOpen(false)}
                  submitLabel="Next"
                  cancelLabel="Cancel"
                  initialValues={selectedJob}
                />
              </TabsContent>
              <TabsContent value="details" className="mt-4 space-y-4">
                <EnhancedForm
                  fields={[jobPostFields[8], jobPostFields[9], jobPostFields[10]]}
                  onSubmit={handleEditStepSubmit("details")}
                  onCancel={() => setActiveEditTab(getPreviousTab("details"))}
                  submitLabel="Next"
                  cancelLabel="Back"
                  initialValues={selectedJob}
                />
              </TabsContent>
              <TabsContent value="requirements" className="mt-4 space-y-4">
                <EnhancedForm
                  fields={[jobPostFields[11], jobPostFields[12]]}
                  onSubmit={handleEdit}
                  onCancel={() => setActiveEditTab(getPreviousTab("requirements"))}
                  submitLabel="Update Job Post"
                  cancelLabel="Back"
                  isSubmitting={updateJobMutation.isLoading}
                  initialValues={selectedJob}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {viewJob && isViewDialogOpen && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DetailsView
              title={viewJob.job_title}
              subtitle={`${viewJob.department} - ${viewJob.job_type}`}
              data={viewJob}
              tabs={[
                {
                  id: "overview",
                  label: "Overview",
                  sections: [
                    {
                      title: "Job Information",
                      fields: [
                        { label: "Job Title", value: viewJob.job_title },
                        { label: "Department", value: viewJob.department },
                        { label: "Positions", value: viewJob.number_of_positions },
                        { label: "Posted Date", value: viewJob.posted_date, type: "date" },
                        { label: "Closing Date", value: viewJob.closing_date, type: "date" },
                        {
                          label: "Status",
                          value: viewJob.status,
                          type: "status",
                          options: {
                            statusMap: {
                              active: { label: "Active", color: "bg-green-500 text-white" },
                              closed: { label: "Closed", color: "bg-gray-500 text-white" },
                              draft: { label: "Draft", color: "bg-blue-100 text-blue-800" },
                            },
                          },
                        },
                        { label: "Location", value: viewJob.location },
                        { label: "Job Type", value: viewJob.job_type, type: "badge" },
                        { label: "Experience", value: viewJob.experience },
                        { label: "Salary Range", value: viewJob.salary_range },
                        { label: "Applications Received", value: viewJob.applications ?? 0 },
                      ],
                    },
                  ],
                },
                {
                  id: "description",
                  label: "Description",
                  sections: [
                    {
                      title: "Job Story",
                      fields: [{ label: "Job Description", value: viewJob.job_description }],
                    },
                  ],
                },
                {
                  id: "requirements",
                  label: "Requirements",
                  sections: [
                    {
                      title: "Requirements",
                      fields: [{ label: "Requirements", value: viewJob.requirements }],
                    },
                    {
                      title: "Responsibilities",
                      fields: [{ label: "Responsibilities", value: viewJob.responsibilities }],
                    },
                  ],
                },
              ]}
              onEdit={() => {
                closeViewDialog()
                handleEdit2(viewJob.id)
              }}
              onBack={closeViewDialog}
              onPrint={() => window.print()}
              onExport={() => console.log("Exporting job post:", viewJob.id)}
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => console.log("Publishing job post:", viewJob.id)}
                  disabled={viewJob.status === "active"}
                >
                  {viewJob.status === "active" ? "Published" : "Publish"}
                </Button>
              }
            />
          </DialogContent>
        </Dialog>
      )}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Job Post"
        description="Deleting this job post cannot be undone."
        itemName={jobToDelete?.job_title ?? "this job post"}
        isLoading={deleteJobMutation.isLoading}
      />
    </div>
  )
}
