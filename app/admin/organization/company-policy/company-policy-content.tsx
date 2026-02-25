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
import { BookOpenText, CheckCircle2, Clock3, Edit, Eye, Loader2, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateCompanyPolicy,
  useDeleteCompanyPolicy,
  useGetCompanyPolicies,
  useGetCompanyPolicyById,
  useUpdateCompanyPolicy,
} from "@/services/hooks/organizations/company-policy/useCompanyPolicy"
import type {
  CompanyPolicy,
  CreateCompanyPolicyPayload,
  UpdateCompanyPolicyPayload,
} from "@/types/organizations/company-policy/company-policy-management"

type CompanyPolicyFormState = {
  company_code: string
  title: string
  content: string
  status: string
  publish_date: string
  expiry_date: string
}

const defaultFormState: CompanyPolicyFormState = {
  company_code: "",
  title: "",
  content: "",
  status: "draft",
  publish_date: "",
  expiry_date: "",
}

const formatDate = (value?: string | null) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString()
}

const isoToInputDateTime = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 16)
}

const inputDateTimeToIso = (value: string) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export default function CompanyPolicyContent() {
  const { data, isLoading, error, refetch } = useGetCompanyPolicies()
  const createCompanyPolicyMutation = useCreateCompanyPolicy()
  const updateCompanyPolicyMutation = useUpdateCompanyPolicy()
  const deleteCompanyPolicyMutation = useDeleteCompanyPolicy()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<CompanyPolicy | null>(null)
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | number | undefined>(undefined)
  const [form, setForm] = useState<CompanyPolicyFormState>(defaultFormState)

  const { data: selectedPolicyResponse, isFetching: isFetchingPolicy } = useGetCompanyPolicyById(selectedPolicyId)

  const policies = data?.data || []
  const selectedPolicyDetails = selectedPolicyResponse?.data || selectedPolicy

  const draftCount = useMemo(
    () => policies.filter((row) => row.status?.toLowerCase() === "draft").length,
    [policies]
  )
  const publishedCount = useMemo(
    () => policies.filter((row) => row.status?.toLowerCase() === "published").length,
    [policies]
  )
  const activeCount = useMemo(() => {
    const now = new Date()
    return policies.filter((row) => {
      if (!row.expiry_date) return true
      const expiry = new Date(row.expiry_date)
      if (Number.isNaN(expiry.getTime())) return false
      return expiry >= now
    }).length
  }, [policies])

  const searchFields = [
    { name: "title", label: "Title", type: "text" as const },
    { name: "company_code", label: "Company Code", type: "text" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ],
    },
    { name: "publish_date", label: "Publish Date", type: "date" as const },
    { name: "expiry_date", label: "Expiry Date", type: "date" as const },
  ]

  const resetForm = () => setForm(defaultFormState)

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (policy: CompanyPolicy) => {
    setSelectedPolicy(policy)
    setSelectedPolicyId(policy.id)
    setForm({
      company_code: policy.company_code || "",
      title: policy.title || "",
      content: policy.content || "",
      status: policy.status || "draft",
      publish_date: isoToInputDateTime(policy.publish_date),
      expiry_date: isoToInputDateTime(policy.expiry_date),
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (policy: CompanyPolicy) => {
    setSelectedPolicy(policy)
    setSelectedPolicyId(policy.id)
    setShowViewDialog(true)
  }

  const openDeleteDialog = (policy: CompanyPolicy) => {
    setSelectedPolicy(policy)
    setSelectedPolicyId(policy.id)
    setShowDeleteDialog(true)
  }

  const handleCreateCompanyPolicy = async () => {
    if (!form.company_code.trim() || !form.title.trim() || !form.content.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: CreateCompanyPolicyPayload = {
      company_code: form.company_code.trim(),
      title: form.title.trim(),
      content: form.content.trim(),
      status: form.status,
      publish_date: inputDateTimeToIso(form.publish_date),
      expiry_date: inputDateTimeToIso(form.expiry_date),
    }

    try {
      await createCompanyPolicyMutation.mutateAsync(payload)
      toast.success("Company policy created successfully")
      setShowAddDialog(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create company policy"
      toast.error(message)
    }
  }

  const handleUpdateCompanyPolicy = async () => {
    if (!selectedPolicy) return
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: UpdateCompanyPolicyPayload = {
      id: selectedPolicy.id,
      title: form.title.trim(),
      content: form.content.trim(),
      status: form.status,
      publish_date: inputDateTimeToIso(form.publish_date),
      expiry_date: inputDateTimeToIso(form.expiry_date),
    }

    try {
      await updateCompanyPolicyMutation.mutateAsync(payload)
      toast.success("Company policy updated successfully")
      setShowEditDialog(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update company policy"
      toast.error(message)
    }
  }

  const handleDeleteCompanyPolicy = async () => {
    if (!selectedPolicy) return
    try {
      await deleteCompanyPolicyMutation.mutateAsync(selectedPolicy.id)
      toast.success("Company policy deleted successfully")
      setShowDeleteDialog(false)
      setSelectedPolicy(null)
      setSelectedPolicyId(undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete company policy"
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
      label: "Policy",
      sortable: true,
      render: (value: string, row: CompanyPolicy) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
            <BookOpenText className="h-4 w-4 text-blue-600" />
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
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "publish_date",
      label: "Publish Date",
      sortable: true,
      render: (value: string) => <div className="text-sm text-gray-700">{formatDate(value)}</div>,
    },
    {
      key: "expiry_date",
      label: "Expiry Date",
      sortable: true,
      render: (value: string) => <div className="text-sm text-gray-700">{formatDate(value)}</div>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: CompanyPolicy) => (
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
            className="text-red-600 hover:text-red-800"
            onClick={() => openDeleteDialog(row)}
            disabled={deleteCompanyPolicyMutation.isPending}
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
        <p className="text-red-600 text-sm">{error.message || "Failed to load company policies"}</p>
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
            <BookOpenText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Company Policy
            </h1>
            <p className="text-gray-600 mt-1">
              Manage organization company policies
              <span className="ml-2 text-sm text-gray-500">({policies.length} records)</span>
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
            Add Policy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Draft Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{draftCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Published Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{policies.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <DataTable
            title="Company Policy"
            columns={columns}
            data={policies}
            searchFields={searchFields}
            onAdd={openAddDialog}
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Company Policy</DialogTitle>
            <DialogDescription>Create a new company policy record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="policy-company-code">Company Code</Label>
              <Input
                id="policy-company-code"
                value={form.company_code}
                onChange={(e) => setForm((prev) => ({ ...prev, company_code: e.target.value }))}
                placeholder="Enter company code (e.g. IPPIS-C 00001)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-title">Title</Label>
              <Input
                id="policy-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter policy title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-content">Content</Label>
              <Textarea
                id="policy-content"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Enter policy content"
                rows={4}
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
            <div className="space-y-2">
              <Label htmlFor="policy-publish-date">Publish Date</Label>
              <Input
                id="policy-publish-date"
                type="datetime-local"
                value={form.publish_date}
                onChange={(e) => setForm((prev) => ({ ...prev, publish_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-expiry-date">Expiry Date</Label>
              <Input
                id="policy-expiry-date"
                type="datetime-local"
                value={form.expiry_date}
                onChange={(e) => setForm((prev) => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCompanyPolicy} disabled={createCompanyPolicyMutation.isPending}>
              {createCompanyPolicyMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Company Policy</DialogTitle>
            <DialogDescription>Update company policy details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-policy-title">Title</Label>
              <Input
                id="edit-policy-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-policy-content">Content</Label>
              <Textarea
                id="edit-policy-content"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={4}
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
            <div className="space-y-2">
              <Label htmlFor="edit-policy-publish-date">Publish Date</Label>
              <Input
                id="edit-policy-publish-date"
                type="datetime-local"
                value={form.publish_date}
                onChange={(e) => setForm((prev) => ({ ...prev, publish_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-policy-expiry-date">Expiry Date</Label>
              <Input
                id="edit-policy-expiry-date"
                type="datetime-local"
                value={form.expiry_date}
                onChange={(e) => setForm((prev) => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={updateCompanyPolicyMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCompanyPolicy} disabled={updateCompanyPolicyMutation.isPending}>
              {updateCompanyPolicyMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Company Policy Details</DialogTitle>
            <DialogDescription>View full company policy record.</DialogDescription>
          </DialogHeader>
          {isFetchingPolicy ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          ) : selectedPolicyDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Title</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPolicyDetails.title || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Company Code</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPolicyDetails.company_code || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Company Name</Label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPolicyDetails.company_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPolicyDetails.status || "draft")}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Publish Date</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedPolicyDetails.publish_date)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Expiry Date</Label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedPolicyDetails.expiry_date)}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Content</Label>
                <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedPolicyDetails.content || "N/A"}
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
          setSelectedPolicy(null)
          setSelectedPolicyId(undefined)
        }}
        onConfirm={handleDeleteCompanyPolicy}
        title="Delete Company Policy"
        description={`Are you sure you want to delete ${selectedPolicy?.title || "this policy"}?`}
        itemName={selectedPolicy?.title || "this policy"}
        isLoading={deleteCompanyPolicyMutation.isPending}
      />
    </div>
  )
}
