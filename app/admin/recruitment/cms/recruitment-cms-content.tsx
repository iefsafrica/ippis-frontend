
"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"

import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Eye, Edit, Trash2, Calendar, Clock, Users, FileText, ClipboardList, X, Loader2, User, Hash } from "lucide-react"

import {
  useCreateRecruitmentCms,
  useDeleteRecruitmentCms,
  useRecruitmentCms,
  useUpdateRecruitmentCms,
} from "@/services/hooks/recruitment/cms"
import {
  RECRUITMENT_CMS_STATUS_OPTIONS,
  RECRUITMENT_CMS_TYPE_OPTIONS,
} from "@/services/constants/recruitment/cms"
import type { RecruitmentCmsContent, RecruitmentCmsPayload } from "@/types/recruitment/cms"
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

const renderCmsStatusBadge = (status?: string) => {
  const normalized = status?.toLowerCase()
  const statusConfig: Record<string, { label: string; className: string }> = {
    published: { label: "Published", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" },
    draft: { label: "Draft", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
    archived: { label: "Archived", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
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

const renderCmsTypeBadge = (type?: string) => {
  const typeConfig: Record<string, { label: string; className: string }> = {
    career_path: { label: "Career Path", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    guide: { label: "Guide", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    benefits: { label: "Benefits", className: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
    process: { label: "Process", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
    policy: { label: "Policy", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    faq: { label: "FAQ", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    job_description: { label: "Job Description", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
  }
  const config = typeConfig[type ?? ""] ?? { 
    label: type || "Content", 
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

// Status options that match what the API expects
const CMS_STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "Archived", label: "Archived" },
]

const cmsFormFields: FormField[] = [
  {
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "Enter content title",
    required: true,
  },
  {
    name: "type",
    label: "Content Type",
    type: "select",
    options: RECRUITMENT_CMS_TYPE_OPTIONS,
    required: true,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: CMS_STATUS_OPTIONS,
    required: true,
  },
  {
    name: "content",
    label: "Content Body",
    type: "textarea",
    placeholder: "Enter the content",
    required: true,
  },
  {
    name: "author",
    label: "Author",
    type: "text",
    placeholder: "Author name",
    required: true,
  },
]

const buildCmsPayload = (values: Record<string, any>): RecruitmentCmsPayload => {
  const payload: Record<string, any> = {
    title: values.title,
    type: values.type,
    content: values.content,
    status: values.status, // This will now be "Draft", "Published", or "Archived"
    author: values.author,
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key]
    }
  })

  return payload as RecruitmentCmsPayload
}

export function RecruitmentCMSContent() {
  const cmsQuery = useRecruitmentCms()
  const createCmsMutation = useCreateRecruitmentCms()
  const updateCmsMutation = useUpdateRecruitmentCms()
  const deleteCmsMutation = useDeleteRecruitmentCms()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<RecruitmentCmsContent | null>(null)
  const [contentToEdit, setContentToEdit] = useState<RecruitmentCmsContent | null>(null)
  const [contentToDelete, setContentToDelete] = useState<RecruitmentCmsContent | null>(null)
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const tableData = useMemo(() => {
    const data = cmsQuery.data?.data ?? []
    
    // Sort content by updated date in descending order (newest first)
    const sortedData = [...data].sort((a, b) => {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return dateB - dateA // Descending order
    })

    return sortedData.map((content) => ({
      ...content,
      typeLabel: content.type,
      statusLabel: content.status,
      viewsDisplay: content.views ?? 0,
      updatedAt: content.updated_at ?? content.created_at,
      formattedDate: content.updated_at 
        ? format(new Date(content.updated_at), "MMM dd, yyyy")
        : "N/A",
    }))
  }, [cmsQuery.data?.data])

  const mutationsLoading = 
    createCmsMutation.isLoading || 
    updateCmsMutation.isLoading || 
    deleteCmsMutation.isLoading

  useEffect(() => {
    if (!isViewDialogOpen) {
      setSelectedContent(null)
    }
  }, [isViewDialogOpen])

  useEffect(() => {
    if (!isEditDialogOpen) {
      setContentToEdit(null)
    }
  }, [isEditDialogOpen])

  useEffect(() => {
    if (!isDeleteDialogOpen) {
      setContentToDelete(null)
    }
  }, [isDeleteDialogOpen])

  const statsCards = useMemo(() => {
    const data = cmsQuery.data?.data ?? []
    const typeCounts = data.reduce<Record<string, number>>((acc, content) => {
      const type = content.type?.toLowerCase() ?? "unknown"
      acc[type] = (acc[type] ?? 0) + 1
      return acc
    }, {})
    
    const statusCounts = data.reduce<Record<string, number>>((acc, content) => {
      const status = content.status?.toLowerCase() ?? "unknown"
      acc[status] = (acc[status] ?? 0) + 1
      return acc
    }, {})

    return [
      { title: "Total Content", value: data.length, description: "All CMS items" },
      { title: "Published", value: statusCounts.published ?? 0, description: "Live content" },
      { title: "Drafts", value: statusCounts.draft ?? 0, description: "In progress" },
      { title: "Career Paths", value: typeCounts.career_path ?? 0, description: "Career guides" },
    ]
  }, [cmsQuery.data?.data])

  const filteredData = useMemo(() => {
    let filtered = tableData
    if (typeFilter) {
      filtered = filtered.filter((item) => item.type === typeFilter)
    }
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status?.toLowerCase() === statusFilter.toLowerCase())
    }
    return filtered
  }, [tableData, typeFilter, statusFilter])

  const cmsSearchFields = useMemo(
    () => [
      { name: "title", label: "Title", type: "text" },
      {
        name: "type",
        label: "Content Type",
        type: "select",
        options: RECRUITMENT_CMS_TYPE_OPTIONS,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: CMS_STATUS_OPTIONS,
      },
      { name: "author", label: "Author", type: "text" },
    ],
    [],
  )

  const handleAdd = (values: Record<string, any>) => {
    const payload = buildCmsPayload(values)
    createCmsMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("CMS content created successfully.")
        setIsAddDialogOpen(false)
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  const handleEdit = (valuesOrId: string | Record<string, any>) => {
    if (typeof valuesOrId === "string") {
      const content = cmsQuery.data?.data?.find((item) => item.id === valuesOrId)
      if (!content) return
      setContentToEdit(content)
      setIsEditDialogOpen(true)
      return
    }

    if (!contentToEdit) return
    const payload = buildCmsPayload({ ...contentToEdit, ...valuesOrId })
    updateCmsMutation.mutate({ id: contentToEdit.id, payload }, {
      onSuccess: () => {
        toast.success("CMS content updated successfully.")
        setIsEditDialogOpen(false)
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  const handleDelete = (id: string) => {
    const content = cmsQuery.data?.data?.find((item) => item.id === id)
    if (content) {
      setContentToDelete(content)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!contentToDelete) return
    deleteCmsMutation.mutate(contentToDelete.id, {
      onSuccess: () => {
        toast.success(`"${contentToDelete.title}" deleted successfully.`)
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    })
  }

  const handleView = (id: string) => {
    const content = cmsQuery.data?.data?.find((item) => item.id === id)
    if (content) {
      setSelectedContent(content)
      setIsViewDialogOpen(true)
    }
  }

  const handleEditFromView = () => {
    if (!selectedContent) return
    setIsViewDialogOpen(false)
    setContentToEdit(selectedContent)
    setIsEditDialogOpen(true)
  }

  const editInitialValues = useMemo(() => {
    if (!contentToEdit) return undefined
    return {
      title: contentToEdit.title,
      type: contentToEdit.type,
      status: contentToEdit.status, // This will now be "Draft", "Published", or "Archived"
      content: contentToEdit.content,
      author: contentToEdit.author,
    }
  }, [contentToEdit])

  const cmsColumns = useMemo(
    () => [
      {
        key: "title",
        label: "Title",
        render: (value: string) => (
          <div>
            <div className="font-medium">{value}</div>
          </div>
        ),
      },
      { 
        key: "type", 
        label: "Type",
        render: (value: string) => renderCmsTypeBadge(value),
      },
      { 
        key: "status", 
        label: "Status",
        render: (value: string) => renderCmsStatusBadge(value),
      },
      { 
        key: "author", 
        label: "Author",
        render: (value: string) => value,
      },
      { 
        key: "viewsDisplay", 
        label: "Views",
        render: (value: number) => value.toLocaleString(),
      },
      { 
        key: "formattedDate", 
        label: "Updated",
        render: (value: string) => value,
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: unknown, row: RecruitmentCmsContent) => (
          <div className="flex justify-start space-x-2">
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
              disabled={deleteCmsMutation.isLoading}
              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleView, handleEdit, handleDelete],
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
              <CardTitle className="text-lg font-semibold text-gray-900">Recruitment CMS</CardTitle>
              <CardDescription className="text-gray-600">Manage blogs, guides and other content</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="CMS Content"
            columns={cmsColumns}
            data={filteredData}
            searchFields={cmsSearchFields}
            onAdd={() => setIsAddDialogOpen(true)}
            onEdit={(id) => handleEdit(id)}
            onDelete={(id) => handleDelete(id)}
            onView={handleView}
            showActions
            defaultSortColumn="updatedAt"
            defaultSortDirection="desc"
            addButtonProps={{ disabled: mutationsLoading }}
            addButtonLoading={createCmsMutation.isLoading}
            extraSearchControls={
              <div className="flex gap-2">
                <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {RECRUITMENT_CMS_TYPE_OPTIONS.map((option) => (
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
                    {CMS_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toLowerCase()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
            emptyMessage={
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No CMS content yet</h3>
                <p className="text-sm text-gray-600 mb-4">Start by creating your first content piece</p>
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
                    "Create Content"
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
            <DialogTitle>Create CMS Content</DialogTitle>
            <DialogDescription>Add a new piece of recruitment content.</DialogDescription>
          </DialogHeader>
          <EnhancedForm
            key="add-cms"
            fields={cmsFormFields}
            onSubmit={handleAdd}
            cancelLabel="Cancel"
            submitLabel="Create Content"
            isSubmitting={createCmsMutation.isLoading}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {contentToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit CMS Content</DialogTitle>
              <DialogDescription>Update your content before publishing.</DialogDescription>
            </DialogHeader>
            <EnhancedForm
              key={`edit-cms-${contentToEdit.id}`}
              fields={cmsFormFields}
              initialValues={editInitialValues}
              onSubmit={handleEdit}
              cancelLabel="Cancel"
              submitLabel="Update Content"
              isSubmitting={updateCmsMutation.isLoading}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      {selectedContent && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="p-0 max-w-5xl overflow-hidden border border-gray-200 shadow-xl">
            <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {selectedContent.title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                      {renderCmsTypeBadge(selectedContent.type)} · By {selectedContent.author}
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
                {/* Content Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Content Information</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Title</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{selectedContent.title}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Author</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{selectedContent.author}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Views</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {(selectedContent.views ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Published</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {getFormattedDateTime(selectedContent.created_at)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {getFormattedDateTime(selectedContent.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {renderCmsStatusBadge(selectedContent.status)}
                      {renderCmsTypeBadge(selectedContent.type)}
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                {selectedContent.content && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Content</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedContent.content}</p>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {(selectedContent.created_at || selectedContent.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedContent.created_at && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            {getFormattedDateTime(selectedContent.created_at)}
                          </p>
                        </div>
                      )}
                      {selectedContent.updated_at && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ClipboardList className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            {getFormattedDateTime(selectedContent.updated_at)}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete CMS Content"
        description="Removing this content cannot be undone."
        itemName={contentToDelete?.title ?? "this content"}
        isLoading={deleteCmsMutation.isLoading}
      />
    </div>
  )
}
