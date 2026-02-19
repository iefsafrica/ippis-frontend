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
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Building2, Calendar, CheckCircle, CheckCircle2, Clock, Edit, Eye, Hash, Loader2, Mail, Phone, RefreshCw, Trash2, X, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateCompany,
  useDeleteCompany,
  useGetCompanies,
  useUpdateCompany,
} from "@/services/hooks/organizations/company/useCompany"
import type { Company, CreateCompanyPayload, UpdateCompanyPayload } from "@/types/organizations/company/company-management"

type CompanyFormState = {
  name: string
  email: string
  phone: string
  status: string
}

const defaultFormState: CompanyFormState = {
  name: "",
  email: "",
  phone: "",
  status: "active",
}

export default function CompanyContent() {
  const { data, isLoading, error, refetch } = useGetCompanies()
  const createCompanyMutation = useCreateCompany()
  const updateCompanyMutation = useUpdateCompany()
  const deleteCompanyMutation = useDeleteCompany()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [form, setForm] = useState<CompanyFormState>(defaultFormState)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const companies = data?.data || []

  const activeCount = useMemo(
    () => companies.filter((row) => row.status?.toLowerCase() === "active").length,
    [companies]
  )
  const inactiveCount = useMemo(
    () => companies.filter((row) => row.status?.toLowerCase() === "inactive").length,
    [companies]
  )
  const recentCount = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return companies.filter((row) => new Date(row.created_at) >= thirtyDaysAgo).length
  }, [companies])

  const searchFields = [
    { name: "name", label: "Company Name", type: "text" as const },
    { name: "email", label: "Email", type: "text" as const },
    { name: "phone", label: "Phone", type: "text" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ],
    },
    { name: "created_at", label: "Created Date", type: "date" as const },
  ]

  const resetForm = () => setForm(defaultFormState)

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company)
    setForm({
      name: company.name || "",
      email: company.email || "",
      phone: company.phone || "",
      status: company.status || "active",
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (company: Company) => {
    setSelectedCompany(company)
    setShowViewDialog(true)
  }

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company)
    setShowDeleteDialog(true)
  }

  const handleCreateCompany = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: CreateCompanyPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
    }

    try {
      await createCompanyMutation.mutateAsync(payload)
      toast.success("Company created successfully")
      setShowAddDialog(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create company"
      toast.error(message)
    }
  }

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill all required fields")
      return
    }

    const payload: UpdateCompanyPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
    }

    try {
      await updateCompanyMutation.mutateAsync({ id: selectedCompany.id, payload })
      toast.success("Company updated successfully")
      setShowEditDialog(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update company"
      toast.error(message)
    }
  }

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return
    try {
      await deleteCompanyMutation.mutateAsync(selectedCompany.id)
      toast.success("Company deleted successfully")
      setShowDeleteDialog(false)
      setSelectedCompany(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete company"
      toast.error(message)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusKey = status?.toLowerCase()
    if (statusKey === "active") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 py-1 px-2" variant="outline">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    }

    if (statusKey === "inactive") {
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 py-1 px-2" variant="outline">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      )
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 py-1 px-2" variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        {status || "Pending"}
      </Badge>
    )
  }

  const columns = [
    {
      key: "name",
      label: "Company Name",
      sortable: true,
      render: (value: string, row: Company) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mr-2 flex-shrink-0">
            <Building2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{value}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      render: (value: string) => <div className="text-sm text-gray-700">{value || "N/A"}</div>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge
          variant="outline"
          className={
            value?.toLowerCase() === "active"
              ? "border-green-200 bg-green-50 text-green-700"
              : value?.toLowerCase() === "inactive"
                ? "border-gray-200 bg-gray-50 text-gray-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
          }
        >
          {value?.toLowerCase() === "active" ? (
            <CheckCircle2 className="mr-1 h-3 w-3" />
          ) : value?.toLowerCase() === "inactive" ? (
            <XCircle className="mr-1 h-3 w-3" />
          ) : (
            <RefreshCw className="mr-1 h-3 w-3" />
          )}
          {value}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created Date",
      sortable: true,
      render: (value: string) => {
        const created = new Date(value)
        return (
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center mr-2 flex-shrink-0">
              <Calendar className="h-3 w-3 text-orange-600 mb-0.5" />
              <span className="text-xs font-medium text-orange-700">{created.getDate()}</span>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900">
                {created.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="text-xs text-gray-500">{created.toLocaleDateString("en-US", { year: "numeric" })}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Company) => (
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
            disabled={deleteCompanyMutation.isPending}
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
        <p className="text-red-600 text-sm">{error.message || "Failed to load companies"}</p>
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
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Company
            </h1>
            <p className="text-gray-600 mt-1">
              Manage organization company records
              <span className="ml-2 text-sm text-gray-500">({companies.length} records)</span>
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
            Add Company
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inactive Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{inactiveCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recent Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{recentCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{companies.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <DataTable title="Company" columns={columns} data={companies} searchFields={searchFields} onAdd={openAddDialog} />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
            <DialogDescription>Create a new company record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Name</Label>
              <Input
                id="company-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter company email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone</Label>
              <Input
                id="company-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCompany} disabled={createCompanyMutation.isPending}>
              {createCompanyMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="p-0 max-w-2xl overflow-hidden border border-gray-200 shadow-xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Building2 className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Company
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update company details for {selectedCompany?.name || "selected company"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Company Details</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-company-name" className="text-sm font-medium text-gray-700 mb-2 block">
                      Company Name *
                    </Label>
                    <Input
                      id="edit-company-name"
                      className="h-11 border-gray-300 text-gray-900"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-company-email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email *
                    </Label>
                    <Input
                      id="edit-company-email"
                      type="email"
                      className="h-11 border-gray-300 text-gray-900"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-company-phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone *
                    </Label>
                    <Input
                      id="edit-company-phone"
                      className="h-11 border-gray-300 text-gray-900"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Status *</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                      disabled={updateCompanyMutation.isPending}
                    >
                      <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">Required fields are marked with *</div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={updateCompanyMutation.isPending}
                  className="h-10 px-6 border-gray-300 hover:bg-gray-100 text-gray-700 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdateCompany}
                  disabled={updateCompanyMutation.isPending}
                  className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                >
                  {updateCompanyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Company
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Building2 className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Company Details
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    View company information for {selectedCompany?.name}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowViewDialog(false)}
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedCompany && (
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Company Information</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Company Name</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{selectedCompany.name}</p>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <Hash className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Company ID</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 font-mono">{selectedCompany.id}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">Status</span>
                          </div>
                          {getStatusBadge(selectedCompany.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Contact Details</h3>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Email</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{selectedCompany.email || "No email provided"}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Phone</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{selectedCompany.phone || "No phone provided"}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Created At</span>
                      </div>
                      <p className="text-sm text-gray-600">{new Date(selectedCompany.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="px-8 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                  className="border-gray-300 hover:bg-gray-100 text-gray-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedCompany(null)
        }}
        onConfirm={handleDeleteCompany}
        title="Delete Company"
        description={`Are you sure you want to delete ${selectedCompany?.name || "this company"}?`}
        itemName={selectedCompany?.name || "this company"}
        isLoading={deleteCompanyMutation.isPending}
      />
    </div>
  )
}
