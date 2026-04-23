"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { StatusChangeDialog } from "@/app/admin/core-hr/components/status-change-dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import {
  useCreateTaxType,
  useDeleteTaxType,
  useGetTaxTypes,
  useUpdateTaxType,
} from "@/services/hooks/tax-types"
import type { TaxType } from "@/types/tax-types"
import { Eye, Edit, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

type TaxNameOption = {
  name: string
  rate: number
}

const TAX_NAME_OPTIONS: TaxNameOption[] = [
  { name: "Value Added Tax (VAT)", rate: 7.5 },
  { name: "Withholding Tax (WHT)", rate: 5 },
  { name: "Pay-As-You-Earn (PAYE)", rate: 10 },
  { name: "Education Tax (ET)", rate: 2 },
  { name: "Company Income Tax (CIT)", rate: 30 },
  { name: "Capital Gains Tax (CGT)", rate: 10 },
]

const getRateForTaxName = (name?: string) => {
  return TAX_NAME_OPTIONS.find((option) => option.name === name)?.rate
}

const statusBadgeClass = (value?: string) => {
  const normalized = value?.toLowerCase() ?? ""
  if (normalized === "active") return "bg-emerald-100 text-emerald-700"
  if (normalized === "inactive") return "bg-rose-100 text-rose-700"
  return "bg-gray-100 text-gray-700"
}

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
]

const columns = (
  handleView: (taxType: TaxType) => void,
  handleEdit: (taxType: TaxType) => void,
  handleDelete: (taxType: TaxType) => void,
  handleChangeStatus: (taxType: TaxType) => void,
) => [
  {
    key: "tax_code",
    label: "Code",
    sortable: true,
    render: (value: string) => <div className="font-medium text-gray-900">{value}</div>,
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
  },
  {
    key: "rate",
    label: "Rate (%)",
    sortable: true,
    render: (value: number | string) => (
      <div className="font-semibold text-gray-900">{formatRate(value)}</div>
    ),
  },
  {
    key: "description",
    label: "Description",
    sortable: true,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => <Badge className={statusBadgeClass(value)}>{value ?? "Unknown"}</Badge>,
  },
  {
    key: "actions",
    label: "Actions",
    render: (_: unknown, row: TaxType) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleView(row)} title="View tax type">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleEdit(row)} title="Edit tax type">
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleChangeStatus(row)}
          className="text-green-600 hover:text-green-800"
          title="Change Status"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDelete(row)}
          className="text-red-600 hover:text-red-800"
          title="Delete tax type"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]

const searchFields = [
  { name: "tax_code", label: "Code", type: "text" as const },
  { name: "name", label: "Name", type: "text" as const },
  { name: "status", label: "Status", type: "text" as const },
]

const formatRate = (value?: number | string) => {
  const numeric = typeof value === "number" ? value : Number(value ?? 0)
  if (Number.isNaN(numeric)) return "0.00"
  return numeric.toFixed(2)
}

const today = () => new Date().toISOString().split("T")[0]

export default function TaxTypeContent() {
  const [viewTaxType, setViewTaxType] = useState<TaxType | null>(null)
  const [editTaxType, setEditTaxType] = useState<TaxType | null>(null)
  const [statusTaxType, setStatusTaxType] = useState<TaxType | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteTaxTypeCandidate, setDeleteTaxTypeCandidate] = useState<TaxType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [newTaxType, setNewTaxType] = useState({
    tax_code: "",
    name: "",
    rate: "",
    description: "",
    status: "Active",
  })

  const [editRate, setEditRate] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const { data: taxTypesResponse, refetch } = useGetTaxTypes()
  const createTaxType = useCreateTaxType()
  const updateTaxType = useUpdateTaxType()
  const deleteTaxType = useDeleteTaxType()

  const taxTypes = taxTypesResponse?.data ?? []

  const stats = useMemo(() => {
    const total = taxTypes.length
    const active = taxTypes.filter((item) => item.status?.toLowerCase() === "active").length
    const inactive = total - active
    return { total, active, inactive }
  }, [taxTypes])

  const handleView = (taxType: TaxType) => {
    setViewTaxType(taxType)
    setIsViewOpen(true)
  }

  const handleEdit = (taxType: TaxType) => {
    setEditTaxType(taxType)
    setEditRate(String(taxType.rate ?? ""))
    setEditDescription(taxType.description ?? "")
    setIsEditOpen(true)
  }

  const handleChangeStatus = (taxType: TaxType) => {
    setStatusTaxType(taxType)
    setIsStatusOpen(true)
  }

  const handleDelete = (taxType: TaxType) => {
    setDeleteTaxTypeCandidate(taxType)
    setIsDeleteDialogOpen(true)
  }

  const resetNewForm = () => {
    setNewTaxType({
      tax_code: "",
      name: "",
      rate: "",
      description: "",
      status: "Active",
    })
  }

  const handleTaxNameSelect = (value: string) => {
    const rate = getRateForTaxName(value)
    setNewTaxType((prev) => ({
      ...prev,
      name: value,
      rate: rate !== undefined ? rate.toFixed(2) : prev.rate,
    }))
  }

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await createTaxType.mutateAsync({
        tax_code: newTaxType.tax_code,
        name: newTaxType.name,
        rate: Number(newTaxType.rate),
        description: newTaxType.description,
        status: newTaxType.status,
      })
      toast.success("Tax type created")
      setIsAddOpen(false)
      resetNewForm()
    } catch (error: any) {
      toast.error(error?.message || "Failed to create tax type")
    }
  }

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editTaxType) return
    try {
      await updateTaxType.mutateAsync({
        id: editTaxType.id,
        data: {
          id: editTaxType.id,
          tax_code: editTaxType.tax_code,
          name: editTaxType.name,
          rate: editRate ? Number(editRate) : Number(editTaxType.rate),
          description: editDescription,
        },
      })
      toast.success("Tax type updated")
      setIsEditOpen(false)
      setEditTaxType(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update tax type")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTaxTypeCandidate) return
    try {
      await deleteTaxType.mutateAsync(deleteTaxTypeCandidate.id)
      toast.success("Tax type deleted")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete tax type")
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteTaxTypeCandidate(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Tax Types</h2>
            <p className="text-sm text-gray-500">Manage the tax rules applied to invoices.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2 bg-white border border-gray-200 text-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Total Tax Types", value: stats.total, subtitle: "Defined rules" },
            { label: "Active", value: stats.active, subtitle: "In use" },
            { label: "Inactive", value: stats.inactive, subtitle: "Retired" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{item.label}</p>
              <p className="text-3xl font-semibold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Tax Type Records</CardTitle>
            <CardDescription className="text-gray-600">Create, update, or disable tax codes.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
        <DataTable
          title="Tax Types"
          columns={columns(handleView, handleEdit, handleDelete, handleChangeStatus)}
          data={taxTypes}
          searchFields={searchFields}
          onAdd={() => setIsAddOpen(true)}
            addButtonLoading={createTaxType.isPending}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Add Tax Type</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Tax Code</Label>
              <Input
                value={newTaxType.tax_code}
                onChange={(event) => setNewTaxType({ ...newTaxType, tax_code: event.target.value })}
                required
              />
            </div>
            <div>
              <Label>Tax Name</Label>
              <Select
                value={newTaxType.name}
                onValueChange={(value) => handleTaxNameSelect(value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax name" />
                </SelectTrigger>
                <SelectContent>
                  {TAX_NAME_OPTIONS.map((option) => (
                    <SelectItem key={option.name} value={option.name}>
                      <div className="flex w-full items-center justify-between">
                        <span>{option.name}</span>
                        <span className="text-xs text-gray-500">{formatRate(option.rate)}%</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rate (%)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={newTaxType.rate}
                onChange={(event) => setNewTaxType({ ...newTaxType, rate: event.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Defaults to the rate for the selected tax name but you can override it if needed.
              </p>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newTaxType.description}
                onChange={(event) => setNewTaxType({ ...newTaxType, description: event.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newTaxType.status}
                onValueChange={(value) => setNewTaxType({ ...newTaxType, status: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTaxType.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tax Type Details</DialogTitle>
          </DialogHeader>
          {viewTaxType && (
            <div className="space-y-3">
              {[
                { label: "Tax Code", value: viewTaxType.tax_code },
                { label: "Name", value: viewTaxType.name },
                { label: "Rate", value: `${formatRate(viewTaxType.rate)}%` },
                { label: "Description", value: viewTaxType.description },
                { label: "Status", value: viewTaxType.status },
                { label: "Created", value: viewTaxType.created_at },
                { label: "Updated", value: viewTaxType.updated_at },
              ].map((field) => (
                <div key={field.label} className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="text-xs text-gray-500">{field.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{field.value ?? "—"}</p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => !open && setIsEditOpen(false)}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleUpdateSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Tax Type</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Rate (%)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={editRate}
                onChange={(event) => setEditRate(event.target.value)}
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={editDescription} onChange={(event) => setEditDescription(event.target.value)} />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateTaxType.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <StatusChangeDialog
        isOpen={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false)
          setStatusTaxType(null)
        }}
        title="Change Tax Type Status"
        description={`Update the status for ${statusTaxType?.name ?? "this tax type"}.`}
        currentStatus={statusTaxType?.status ?? "Active"}
        options={STATUS_OPTIONS}
        isLoading={updateTaxType.isPending}
        onConfirm={async (status) => {
          if (!statusTaxType) return
          try {
            await updateTaxType.mutateAsync({
              id: statusTaxType.id,
              data: {
                id: statusTaxType.id,
                tax_code: statusTaxType.tax_code,
                name: statusTaxType.name,
                rate: statusTaxType.rate,
                description: statusTaxType.description,
                status,
              },
            })
            toast.success("Tax type status updated")
            setIsStatusOpen(false)
            setStatusTaxType(null)
          } catch (error: any) {
            toast.error(error?.message || "Failed to update tax type status")
          }
        }}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeleteTaxTypeCandidate(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Tax Type"
        description={`Delete tax type "${deleteTaxTypeCandidate?.name ?? "this record"}"?`}
        itemName={deleteTaxTypeCandidate ? `Tax type ${deleteTaxTypeCandidate.name}` : "Tax type"}
        isLoading={deleteTaxType.isPending}
      />
    </div>
  )
}
