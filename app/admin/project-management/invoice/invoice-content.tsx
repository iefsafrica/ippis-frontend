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
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import {
  useCreateInvoice,
  useDeleteInvoice,
  useGetInvoices,
  useUpdateInvoice,
} from "@/services/hooks/invoices"
import { useGetClients } from "@/services/hooks/clients"
import { useGetProjects } from "@/services/hooks/projects"
import type { Client } from "@/types/clients"
import type { Project } from "@/types/projects"
import type { Invoice } from "@/types/invoices"
import { format } from "date-fns"
import { toast } from "sonner"
import { Eye, Edit, Trash2, RefreshCw } from "lucide-react"

const statusBadgeClass = (status?: string) => {
  const normalized = status?.toLowerCase() ?? ""
  if (normalized === "paid") return "bg-emerald-100 text-emerald-700"
  if (normalized === "unpaid") return "bg-amber-100 text-amber-700"
  if (normalized === "draft") return "bg-blue-100 text-blue-700"
  return "bg-gray-100 text-gray-700"
}

const columns = (
  handleView: (invoice: Invoice) => void,
  handleEdit: (invoice: Invoice) => void,
  handleDelete: (invoice: Invoice) => void,
  resolveClientName: (clientId?: number) => string,
  resolveProjectName: (projectId?: number) => string,
) => [
  {
    key: "invoice_number",
    label: "Invoice #",
    sortable: true,
    render: (value: string) => (
      <div className="font-medium text-gray-900">{value}</div>
    ),
  },
  {
    key: "client_id",
    label: "Client",
    sortable: true,
    render: (_: number, row: Invoice) => (
      <div>{resolveClientName(row.client_id)}</div>
    ),
  },
  {
    key: "project_id",
    label: "Project",
    sortable: true,
    render: (_: number, row: Invoice) => (
      <div>{resolveProjectName(row.project_id)}</div>
    ),
  },
  {
    key: "issue_date",
    label: "Issue Date",
    sortable: true,
    render: (value: string) => (value ? format(new Date(value), "PPP") : "—"),
  },
  {
    key: "due_date",
    label: "Due Date",
    sortable: true,
    render: (value: string) => (value ? format(new Date(value), "PPP") : "—"),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => (
      <Badge className={statusBadgeClass(value)}>{value ?? "Unknown"}</Badge>
    ),
  },
  {
    key: "total",
    label: "Amount",
    sortable: true,
    render: (value: number | string) => (
      <div className="font-semibold text-gray-900">{formatCurrency(value)}</div>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (_: unknown, row: Invoice) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleView(row)} title="View Invoice">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleEdit(row)} title="Edit Invoice">
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDelete(row)}
          className="text-red-600 hover:text-red-800"
          title="Delete Invoice"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]

const searchFields = [
  { name: "invoice_number", label: "Invoice #", type: "text" as const },
  { name: "client_id", label: "Client ID", type: "text" as const },
  { name: "project_id", label: "Project ID", type: "text" as const },
  { name: "status", label: "Status", type: "text" as const },
]

const formatCurrency = (value: number | string) => {
  const numeric = typeof value === "number" ? value : Number(value ?? 0)
  if (Number.isNaN(numeric)) return "—"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(numeric)
}

const todayString = () => new Date().toISOString().split("T")[0]

export default function InvoiceContent() {
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteInvoiceCandidate, setDeleteInvoiceCandidate] = useState<Invoice | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [newInvoice, setNewInvoice] = useState({
    client_id: "",
    project_id: "",
    issue_date: todayString(),
    due_date: todayString(),
    status: "Unpaid",
    total: "",
  })

  const [editClientId, setEditClientId] = useState("")
  const [editProjectId, setEditProjectId] = useState("")
  const [editStatus, setEditStatus] = useState("Unpaid")
  const [editIssueDate, setEditIssueDate] = useState(todayString())
  const [editDueDate, setEditDueDate] = useState(todayString())
  const [editTotal, setEditTotal] = useState("")

  const { data: invoicesResponse, refetch } = useGetInvoices()
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()
  const deleteInvoice = useDeleteInvoice()

  const { data: clientsResponse } = useGetClients()
  const { data: projectsResponse } = useGetProjects()

  const invoices = invoicesResponse?.data?.invoices ?? []
  const clients = clientsResponse?.data?.clients ?? []
  const projects = projectsResponse?.data?.projects ?? []

  const invoiceStats = useMemo(() => {
    const total = invoices.length
    const paid = invoices.filter((invoice) => invoice.status?.toLowerCase() === "paid").length
    const unpaid = total - paid
    const overdue = invoices.filter(
      (invoice) =>
        invoice.status?.toLowerCase() !== "paid" &&
        new Date(invoice.due_date) < new Date(),
    ).length
    return { total, paid, unpaid, overdue }
  }, [invoices])

  const clientLookup = useMemo(() => {
    const map = new Map<number, Client>()
    clients.forEach((client) => map.set(client.id, client))
    return map
  }, [clients])

  const projectLookup = useMemo(() => {
    const map = new Map<number, Project>()
    projects.forEach((project) => map.set(project.id, project))
    return map
  }, [projects])

  const resolveClientName = (clientId?: number) => clientLookup.get(clientId ?? -1)?.name ?? "Unknown"
  const resolveProjectName = (projectId?: number) =>
    projectLookup.get(projectId ?? -1)?.name ?? "Unknown"

  const handleView = (invoice: Invoice) => {
    setViewInvoice(invoice)
    setIsViewOpen(true)
  }

  const handleEdit = (invoice: Invoice) => {
    setEditInvoice(invoice)
    setEditClientId(String(invoice.client_id))
    setEditProjectId(String(invoice.project_id))
    setEditStatus(invoice.status ?? "Unpaid")
    setEditIssueDate(invoice.issue_date?.split("T")[0] ?? todayString())
    setEditDueDate(invoice.due_date?.split("T")[0] ?? todayString())
    setEditTotal(String(invoice.total ?? "0"))
    setIsEditOpen(true)
  }

  const handleDelete = (invoice: Invoice) => {
    setDeleteInvoiceCandidate(invoice)
    setIsDeleteDialogOpen(true)
  }

  const resetNewInvoiceForm = () => {
    setNewInvoice({
      client_id: "",
      project_id: "",
      issue_date: todayString(),
      due_date: todayString(),
      status: "Unpaid",
      total: "",
    })
  }

  const handleAddSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newInvoice.client_id || !newInvoice.project_id || !newInvoice.total) {
      toast.error("Client, project, and amount are required")
      return
    }
    try {
      await createInvoice.mutateAsync({
        client_id: Number(newInvoice.client_id),
        project_id: Number(newInvoice.project_id),
        issue_date: newInvoice.issue_date,
        due_date: newInvoice.due_date,
        status: newInvoice.status,
        total: Number(newInvoice.total),
      })
      toast.success("Invoice created")
      setIsAddOpen(false)
      resetNewInvoiceForm()
    } catch (error: any) {
      toast.error(error?.message || "Failed to create invoice")
    }
  }

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editInvoice) return
    try {
      await updateInvoice.mutateAsync({
        id: editInvoice.id,
        data: {
          id: editInvoice.id,
          client_id: editClientId ? Number(editClientId) : undefined,
          project_id: editProjectId ? Number(editProjectId) : undefined,
          issue_date: editIssueDate,
          due_date: editDueDate,
          status: editStatus,
          total: editTotal ? Number(editTotal) : undefined,
        },
      })
      toast.success("Invoice updated")
      setIsEditOpen(false)
      setEditInvoice(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update invoice")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteInvoiceCandidate) return
    try {
      await deleteInvoice.mutateAsync(deleteInvoiceCandidate.id)
      toast.success("Invoice deleted")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete invoice")
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteInvoiceCandidate(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Invoices</h2>
            <p className="text-sm text-gray-500">Track every invoice issued across projects</p>
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
            { label: "Total Invoices", value: invoiceStats.total, subtitle: "All issued invoices" },
            { label: "Paid", value: invoiceStats.paid, subtitle: "Settled invoices" },
            { label: "Outstanding", value: invoiceStats.unpaid, subtitle: "Awaiting payment" },
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
            <CardTitle className="text-lg font-semibold text-gray-900">Invoice Records</CardTitle>
            <CardDescription className="text-gray-600">Review, update, or cancel any invoice.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            title="Invoices"
            columns={columns(handleView, handleEdit, handleDelete, resolveClientName, resolveProjectName)}
            data={invoices}
            searchFields={searchFields}
            onAdd={() => setIsAddOpen(true)}
            addButtonLoading={createInvoice.isPending}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Client</Label>
              <Select
                value={newInvoice.client_id}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, client_id: value })}
                required
                disabled={clients.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                  {clients.length === 0 && (
                    <SelectItem value="" disabled>
                      No clients yet
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project</Label>
              <Select
                value={newInvoice.project_id}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, project_id: value })}
                required
                disabled={projects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                  {projects.length === 0 && (
                    <SelectItem value="" disabled>
                      No projects yet
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={newInvoice.issue_date}
                  onChange={(event) => setNewInvoice({ ...newInvoice, issue_date: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newInvoice.due_date}
                  onChange={(event) => setNewInvoice({ ...newInvoice, due_date: event.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newInvoice.status}
                onValueChange={(value) => setNewInvoice({ ...newInvoice, status: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Total Amount</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={newInvoice.total}
                onChange={(event) => setNewInvoice({ ...newInvoice, total: event.target.value })}
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createInvoice.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-3">
              {[
                { label: "Invoice #", value: viewInvoice.invoice_number },
                { label: "Client", value: resolveClientName(viewInvoice.client_id) },
                { label: "Project", value: resolveProjectName(viewInvoice.project_id) },
                { label: "Issue Date", value: format(new Date(viewInvoice.issue_date), "PPP") },
                { label: "Due Date", value: format(new Date(viewInvoice.due_date), "PPP") },
                { label: "Status", value: viewInvoice.status },
                { label: "Total", value: formatCurrency(viewInvoice.total) },
                { label: "Created", value: format(new Date(viewInvoice.created_at), "PPP p") },
                { label: "Updated", value: format(new Date(viewInvoice.updated_at), "PPP p") },
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
              <DialogTitle>Edit Invoice</DialogTitle>
            </DialogHeader>
            <div>
              <Label>Client</Label>
              <Select value={editClientId} onValueChange={(value) => setEditClientId(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project</Label>
              <Select value={editProjectId} onValueChange={(value) => setEditProjectId(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={editIssueDate}
                  onChange={(event) => setEditIssueDate(event.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editDueDate}
                  onChange={(event) => setEditDueDate(event.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(value) => setEditStatus(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Total Amount</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={editTotal}
                onChange={(event) => setEditTotal(event.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateInvoice.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeleteInvoiceCandidate(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice"
        description={`Delete invoice "${deleteInvoiceCandidate?.invoice_number ?? "this invoice"}"?`}
        itemName={deleteInvoiceCandidate ? `Invoice ${deleteInvoiceCandidate.invoice_number}` : "Invoice"}
        isLoading={deleteInvoice.isPending}
      />
    </div>
  )
}
