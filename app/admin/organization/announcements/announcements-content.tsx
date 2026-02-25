"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Bell, CheckCircle2, Clock3, Edit, Eye, Loader2, Megaphone, RefreshCw, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useGetAnnouncementById,
  useGetAnnouncements,
  usePublishAnnouncement,
  useUpdateAnnouncement,
} from "@/services/hooks/organizations/announcement/useAnnouncement"
import type {
  Announcement,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from "@/types/organizations/announcement/announcement-management"

type AnnouncementFormState = {
  company_code: string
  title: string
  content: string
  audience: string
  status: string
}

const defaultFormState: AnnouncementFormState = {
  company_code: "",
  title: "",
  content: "",
  audience: "all",
  status: "draft",
}

const formatDate = (value?: string | null) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

export default function AnnouncementsContent() {
  const { data, isLoading, error, refetch } = useGetAnnouncements()
  const createAnnouncementMutation = useCreateAnnouncement()
  const updateAnnouncementMutation = useUpdateAnnouncement()
  const publishAnnouncementMutation = usePublishAnnouncement()
  const deleteAnnouncementMutation = useDeleteAnnouncement()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | number | undefined>(undefined)
  const [form, setForm] = useState<AnnouncementFormState>(defaultFormState)

  const { data: selectedAnnouncementResponse, isFetching: isFetchingAnnouncement } = useGetAnnouncementById(selectedAnnouncementId)

  const announcements = data?.data || []
  const selectedAnnouncementDetails = selectedAnnouncementResponse?.data || selectedAnnouncement

  const draftCount = useMemo(
    () => announcements.filter((row) => row.status?.toLowerCase() === "draft").length,
    [announcements]
  )
  const publishedCount = useMemo(
    () => announcements.filter((row) => row.status?.toLowerCase() === "published").length,
    [announcements]
  )
  const recentCount = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return announcements.filter((row) => {
      const value = row.created_at || row.updated_at
      if (!value) return false
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return false
      return date >= sevenDaysAgo
    }).length
  }, [announcements])

  const searchFields = [
    { name: "title", label: "Title", type: "text" as const },
    { name: "company_code", label: "Company Code", type: "text" as const },
    { name: "audience", label: "Audience", type: "text" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ],
    },
    { name: "created_at", label: "Created Date", type: "date" as const },
  ]

  const resetForm = () => setForm(defaultFormState)

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setSelectedAnnouncementId(announcement.id)
    setForm({
      company_code: announcement.company_code || "",
      title: announcement.title || "",
      content: announcement.content || "",
      audience: announcement.audience || "all",
      status: announcement.status || "draft",
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setSelectedAnnouncementId(announcement.id)
    setShowViewDialog(true)
  }

  const openDeleteDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setSelectedAnnouncementId(announcement.id)
    setShowDeleteDialog(true)
  }

  const handleCreateAnnouncement = async () => {
    if (!form.company_code.trim() || !form.title.trim() || !form.content.trim() || !form.audience.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: CreateAnnouncementPayload = {
      company_code: form.company_code.trim(),
      title: form.title.trim(),
      content: form.content.trim(),
      audience: form.audience.trim(),
      status: form.status,
    }

    try {
      await createAnnouncementMutation.mutateAsync(payload)
      toast.success("Announcement created successfully")
      setShowAddDialog(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create announcement"
      toast.error(message)
    }
  }

  const handleUpdateAnnouncement = async () => {
    if (!selectedAnnouncement) return
    if (!form.title.trim() || !form.content.trim() || !form.audience.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: UpdateAnnouncementPayload = {
      id: selectedAnnouncement.id,
      title: form.title.trim(),
      content: form.content.trim(),
      audience: form.audience.trim(),
      status: form.status,
    }

    try {
      await updateAnnouncementMutation.mutateAsync(payload)
      toast.success("Announcement updated successfully")
      setShowEditDialog(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update announcement"
      toast.error(message)
    }
  }

  const handlePublishAnnouncement = async (announcement: Announcement) => {
    if (announcement.status?.toLowerCase() === "published") return
    try {
      await publishAnnouncementMutation.mutateAsync({
        id: announcement.id,
        status: "published",
        publish_date: new Date().toISOString(),
      })
      toast.success("Announcement published successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish announcement"
      toast.error(message)
    }
  }

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return
    try {
      await deleteAnnouncementMutation.mutateAsync(selectedAnnouncement.id)
      toast.success("Announcement deleted successfully")
      setShowDeleteDialog(false)
      setSelectedAnnouncement(null)
      setSelectedAnnouncementId(undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete announcement"
      toast.error(message)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusKey = status?.toLowerCase()
    if (statusKey === "published") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 py-1 px-2" variant="outline">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Published
        </Badge>
      )
    }

    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 py-1 px-2" variant="outline">
        <Clock3 className="h-3 w-3 mr-1" />
        {status || "Draft"}
      </Badge>
    )
  }

  const columns = [
    {
      key: "title",
      label: "Announcement",
      sortable: true,
      render: (value: string, row: Announcement) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
            <Megaphone className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{value}</div>
            <div className="text-xs text-gray-500">Code: {row.company_code || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "content",
      label: "Content",
      sortable: false,
      render: (value: string) => (
        <div className="text-sm text-gray-700 max-w-[280px] truncate">{value || "N/A"}</div>
      ),
    },
    {
      key: "audience",
      label: "Audience",
      sortable: true,
      render: (value: string) => <div className="text-sm text-gray-700 capitalize">{value || "N/A"}</div>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-700">{formatDate(value)}</div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Announcement) => (
        <div className="flex justify-start space-x-2">
          <Button variant="outline" size="icon" onClick={() => openViewDialog(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-blue-600 hover:text-blue-800" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-emerald-600 hover:text-emerald-800"
            onClick={() => handlePublishAnnouncement(row)}
            disabled={publishAnnouncementMutation.isPending || row.status?.toLowerCase() === "published"}
            title={row.status?.toLowerCase() === "published" ? "Already published" : "Publish announcement"}
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-800"
            onClick={() => openDeleteDialog(row)}
            disabled={deleteAnnouncementMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
        <p className="text-red-600 text-sm">{error.message || "Failed to load announcements"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="hidden h-12 w-12 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm sm:flex sm:items-center sm:justify-center">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Announcements
            </h1>
            <p className="text-gray-600 mt-1">
              Manage organization announcements
              <span className="ml-2 text-sm text-gray-500">({announcements.length} records)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
            onClick={openAddDialog}
          >
            Add Announcement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Draft Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{draftCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Published Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{recentCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{announcements.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <DataTable
            title="Announcements"
            columns={columns}
            data={announcements}
            searchFields={searchFields}
            onAdd={openAddDialog}
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Announcement</DialogTitle>
            <DialogDescription>Create a new organization announcement.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-company-code">Company Code</Label>
              <Input
                id="announcement-company-code"
                value={form.company_code}
                onChange={(e) => setForm((prev) => ({ ...prev, company_code: e.target.value }))}
                placeholder="Enter company code (e.g. IPPIS-C 00001)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-content">Content</Label>
              <Textarea
                id="announcement-content"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Write announcement details"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-audience">Audience</Label>
              <Input
                id="announcement-audience"
                value={form.audience}
                onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                placeholder="all / staff / specific group"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement} disabled={createAnnouncementMutation.isPending}>
              {createAnnouncementMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>Update announcement details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-announcement-title">Title</Label>
              <Input
                id="edit-announcement-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-announcement-content">Content</Label>
              <Textarea
                id="edit-announcement-content"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-announcement-audience">Audience</Label>
              <Input
                id="edit-announcement-audience"
                value={form.audience}
                onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={updateAnnouncementMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAnnouncement} disabled={updateAnnouncementMutation.isPending}>
              {updateAnnouncementMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
            <DialogDescription>View full announcement record.</DialogDescription>
          </DialogHeader>
          {isFetchingAnnouncement ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          ) : selectedAnnouncementDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Title</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedAnnouncementDetails.title || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Company Code</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedAnnouncementDetails.company_code || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Audience</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedAnnouncementDetails.audience || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAnnouncementDetails.status || "draft")}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Publish Date</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedAnnouncementDetails.publish_date)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Created At</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedAnnouncementDetails.created_at)}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Content</Label>
                <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedAnnouncementDetails.content || "N/A"}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No record selected.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedAnnouncement(null)
          setSelectedAnnouncementId(undefined)
        }}
        onConfirm={handleDeleteAnnouncement}
        title="Delete Announcement"
        description={`Are you sure you want to delete ${selectedAnnouncement?.title || "this announcement"}?`}
        itemName={selectedAnnouncement?.title || "this announcement"}
        isLoading={deleteAnnouncementMutation.isPending}
      />
    </div>
  )
}
