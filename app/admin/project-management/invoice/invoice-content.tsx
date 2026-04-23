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
import { saveAs } from "file-saver"
import { Eye, Edit, Trash2, RefreshCw } from "lucide-react"

const statusBadgeClass = (status?: string) => {
  const normalized = status?.toLowerCase() ?? ""
  if (normalized === "paid") return "bg-emerald-100 text-emerald-700"
  if (normalized === "unpaid") return "bg-amber-100 text-amber-700"
  if (normalized === "draft") return "bg-blue-100 text-blue-700"
  if (normalized === "pending") return "bg-yellow-100 text-yellow-700"
  return "bg-gray-100 text-gray-700"
}

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Unpaid", label: "Unpaid" },
  { value: "Paid", label: "Paid" },
  { value: "Draft", label: "Draft" },
]

const columns = (
  handleView: (invoice: Invoice) => void,
  handleEdit: (invoice: Invoice) => void,
  handleDelete: (invoice: Invoice) => void,
  resolveClientName: (clientId?: number) => string,
  resolveProjectName: (projectId?: number) => string,
  handleChangeStatus: (invoice: Invoice) => void,
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

const TAX_RATE = 0.1

const parseBudgetValue = (value?: string | number | null): number | null => {
  if (typeof value === "number") return value
  if (!value) return null
  const cleaned = value.toString().replace(/[^0-9.]/g, "")
  const numeric = Number(cleaned)
  return Number.isFinite(numeric) ? numeric : null
}

const parseInputNumber = (value?: string | number): number => {
  if (typeof value === "number") return value
  if (!value) return 0
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

const getInvoiceAmount = (value?: number | string): number => {
  const numeric = typeof value === "number" ? value : Number(value ?? 0)
  return Number.isFinite(numeric) ? numeric : 0
}

const todayString = () => new Date().toISOString().split("T")[0]

export default function InvoiceContent() {
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null)
  const [statusInvoice, setStatusInvoice] = useState<Invoice | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteInvoiceCandidate, setDeleteInvoiceCandidate] = useState<Invoice | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [newInvoice, setNewInvoice] = useState({
    client_id: "",
    project_id: "",
    issue_date: todayString(),
    due_date: todayString(),
    status: "Pending",
    total: "",
  })

  const [editClientId, setEditClientId] = useState("")
  const [editProjectId, setEditProjectId] = useState("")
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

  const getProjectById = (projectId?: string | number | null) => {
    const candidate = typeof projectId === "string" ? Number(projectId) : projectId
    if (!Number.isFinite(candidate ?? NaN)) {
      return null
    }
    return projectLookup.get(candidate ?? -1) ?? null
  }

  const selectedNewProject = getProjectById(newInvoice.project_id)
  const selectedEditProject = getProjectById(editProjectId)

  const newInvoiceAmountValue = parseInputNumber(newInvoice.total)
  const newProjectBudgetValue = parseBudgetValue(selectedNewProject?.budget)
  const newBudgetRemaining =
    newProjectBudgetValue !== null ? Math.max(0, newProjectBudgetValue - newInvoiceAmountValue) : null
  const isNewInvoiceOverBudget =
    newProjectBudgetValue !== null && newInvoiceAmountValue > newProjectBudgetValue

  const editInvoiceAmountValue = parseInputNumber(editTotal)
  const editProjectBudgetValue = parseBudgetValue(selectedEditProject?.budget)
  const editBudgetRemaining =
    editProjectBudgetValue !== null ? Math.max(0, editProjectBudgetValue - editInvoiceAmountValue) : null
  const isEditInvoiceOverBudget =
    editProjectBudgetValue !== null && editInvoiceAmountValue > editProjectBudgetValue

  const resolveClientName = (clientId?: number) => clientLookup.get(clientId ?? -1)?.name ?? "Unknown"
  const resolveProjectName = (projectId?: number) =>
    projectLookup.get(projectId ?? -1)?.name ?? "Unknown"

  const handleDownload = (invoice: Invoice) => {
    const client = clientLookup.get(invoice.client_id)
    const project = projectLookup.get(invoice.project_id)
    const amount = getInvoiceAmount(invoice.total)
    const subtotal = Number((amount / (1 + TAX_RATE)).toFixed(2))
    const taxAmount = Number((amount - subtotal).toFixed(2))
    const invoiceNumber = invoice.invoice_number ?? `${invoice.id}`
    const formattedIssueDate = invoice.issue_date
      ? format(new Date(invoice.issue_date), "dd MMMM yyyy")
      : "—"
    const formattedDueDate = invoice.due_date
      ? format(new Date(invoice.due_date), "dd MMMM yyyy")
      : "—"
    const projectBudgetValue = project ? parseBudgetValue(project.budget) : null
    const projectBudgetLabel =
      projectBudgetValue !== null ? formatCurrency(projectBudgetValue) : "Not set"
    const projectPeriod = project
      ? `${project.start_date ? format(new Date(project.start_date), "dd MMMM yyyy") : "—"} - ${
          project.end_date ? format(new Date(project.end_date), "dd MMMM yyyy") : "—"
        }`
      : "—"

    const statusLabel = invoice.status ?? "Unknown"
    const html = `
      <!DOCTYPE html>
      <html>

      <head>
        <meta charset="utf-8" />
        <title>Invoice ${invoiceNumber}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0;
            font-family: "Inter", system-ui, sans-serif;
            background: #0f172a;
          }
          .page {
            max-width: 780px;
            margin: 0 auto;
            padding: 2.75rem;
            background: #ffffff;
            border-radius: 20px;
            border: 1px solid #d1d5db;
            box-shadow: 0 40px 70px rgba(15, 23, 42, 0.08);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 2.5rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 1.25rem;
          }
          .logo-block {
            display: flex;
            gap: 1.25rem;
            align-items: center;
          }
          .logo {
            width: 56px;
            height: 56px;
            border-radius: 18px;
            background: radial-gradient(circle, #111827, #0f172a);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.4em;
            color: #f8fafc;
          }
          .title-block {
            text-align: right;
          }
          .invoice-label {
            font-size: 36px;
            font-family: "Playfair Display", serif;
            margin: 0;
            color: #111827;
          }
          .invoice-number {
            margin: 0.25rem 0;
            font-size: 12px;
            letter-spacing: 0.45em;
            text-transform: uppercase;
            color: #6b7280;
          }
          .meta-line {
            margin: 0;
            font-size: 12px;
            color: #6b7280;
          }
          .status-pill {
            display: inline-flex;
            margin-top: 0.8rem;
            padding: 0.4rem 1.3rem;
            border-radius: 999px;
            border: 1px solid #bbf7d0;
            color: #0f5132;
            font-size: 11px;
            letter-spacing: 0.45em;
            text-transform: uppercase;
            background: linear-gradient(90deg, #ecfdf5, #bbf7d0);
          }
          .section {
            margin-top: 2.5rem;
          }
          .section-label {
            margin-bottom: 0.35rem;
            font-size: 11px;
            letter-spacing: 0.35em;
            text-transform: uppercase;
            color: #94a3b8;
          }
          .details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
          }
          .details strong {
            font-size: 18px;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1.75rem;
            font-size: 14px;
            color: #374151;
          }
          thead th {
            background: #111827;
            color: #f8fafc;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.4em;
            padding: 0.9rem 1rem;
          }
          tbody td {
            padding: 0.9rem 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals {
            margin-top: 1.5rem;
            display: flex;
            justify-content: flex-end;
            gap: 2.5rem;
            font-size: 13px;
            color: #4b5563;
          }
          .totals strong {
            display: block;
            font-size: 20px;
            color: #0f5132;
          }
          .totals span {
            font-size: 11px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
          }
          .payment {
            margin-top: 2rem;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1.25rem;
            border-top: 1px solid #e5e7eb;
            padding-top: 1.25rem;
          }
          .thanks {
            font-family: "Playfair Display", serif;
            font-size: 30px;
            color: #0f172a;
            margin: 0;
          }
          .footer {
            margin-top: 1.5rem;
            font-size: 12px;
            color: #94a3b8;
          }
        </style>
      </head>

      <body>
        <div class="page">
          <div class="header">
            <div class="logo-block">
              <div class="logo">JS</div>
              <div>
                <p class="section-label">Billed to</p>
                <strong>${client?.name ?? "—"}</strong>
                <p>${client?.contact_person ?? "—"}</p>
                <p>${client?.email ?? "—"}</p>
              </div>
            </div>
            <div class="title-block">
              <p class="invoice-label">Invoice</p>
              <p class="invoice-number">#${invoiceNumber}</p>
              <p class="meta-line">Issue Date: ${formattedIssueDate}</p>
              <p class="meta-line">Due Date: ${formattedDueDate}</p>
              <div class="status-pill">${statusLabel}</div>
            </div>
          </div>
          <div class="section">
            <div class="details">
              <div>
                <p class="section-label">Project</p>
                <strong>${project?.name ?? "—"}</strong>
                <p>Budget: ${projectBudgetLabel}</p>
                <p>Manager: ${project?.manager_id ?? "TBD"}</p>
                <p>Period: ${projectPeriod}</p>
              </div>
              <div>
                <p class="section-label">Project code</p>
                <strong>${project?.project_code ?? "—"}</strong>
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${project?.name ?? "Project Services"}</td>
                <td>1</td>
                <td>${formatCurrency(amount)}</td>
                <td>${formatCurrency(amount)}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals">
            <div>
              <span>Subtotal</span>
              <strong>${formatCurrency(subtotal)}</strong>
            </div>
            <div>
              <span>Tax (10%)</span>
              <strong>${formatCurrency(taxAmount)}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>${formatCurrency(amount)}</strong>
            </div>
          </div>
          <div class="payment">
            <div>
              <p class="section-label">Payment info</p>
              <p>Fausat Bank</p>
              <p>Account Name: Juliana Silva</p>
              <p>Account No: 123 456 7890</p>
              <p>Pay by: 10 July 2025</p>
            </div>
            <div class="text-right">
              <p class="thanks">Thank You!</p>
              <p class="text-sm text-slate-600">Juliana Silva</p>
              <p class="text-sm text-slate-500">Lead Consultant</p>
            </div>
          </div>
          <div class="footer">
            <p>Tax (10%) included.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    saveAs(blob, `invoice-${invoiceNumber}.html`)
  }

  const handleView = (invoice: Invoice) => {
    setViewInvoice(invoice)
    setIsViewOpen(true)
  }

  const handleChangeStatus = (invoice: Invoice) => {
    setStatusInvoice(invoice)
    setIsStatusOpen(true)
  }

  const handleEdit = (invoice: Invoice) => {
    setEditInvoice(invoice)
    setEditClientId(String(invoice.client_id))
    setEditProjectId(String(invoice.project_id))
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
      status: "Pending",
      total: "",
    })
  }

  const handleAddSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newInvoice.client_id || !newInvoice.project_id || !newInvoice.total) {
      toast.error("Client, project, and amount are required")
      return
    }
    if (isNewInvoiceOverBudget && newProjectBudgetValue !== null) {
      toast.error(
        `Invoice total ${formatCurrency(newInvoiceAmountValue)} exceeds project budget ${formatCurrency(
          newProjectBudgetValue,
        )}`,
      )
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
    if (isEditInvoiceOverBudget && editProjectBudgetValue !== null) {
      toast.error(
        `Updated amount ${formatCurrency(editInvoiceAmountValue)} exceeds project budget ${formatCurrency(
          editProjectBudgetValue,
        )}`,
      )
      return
    }
    try {
      await updateInvoice.mutateAsync({
        id: editInvoice.id,
        data: {
          id: editInvoice.id,
          client_id: editClientId ? Number(editClientId) : undefined,
          project_id: editProjectId ? Number(editProjectId) : undefined,
          issue_date: editIssueDate,
          due_date: editDueDate,
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

  const handleUpdateInvoiceStatus = async (status: string) => {
    if (!statusInvoice) return
    try {
      await updateInvoice.mutateAsync({
        id: statusInvoice.id,
        data: {
          id: statusInvoice.id,
          client_id: statusInvoice.client_id,
          project_id: statusInvoice.project_id,
          issue_date: statusInvoice.issue_date,
          due_date: statusInvoice.due_date,
          status,
          total: statusInvoice.total,
        },
      })
      toast.success("Invoice status updated")
      setIsStatusOpen(false)
      setStatusInvoice(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update invoice status")
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

  const viewClient = viewInvoice ? clientLookup.get(viewInvoice.client_id) : null
  const viewProject = viewInvoice ? projectLookup.get(viewInvoice.project_id) : null
  const viewInvoiceAmount = viewInvoice ? getInvoiceAmount(viewInvoice.total) : 0
  const viewSubtotal = viewInvoice ? Number((viewInvoiceAmount / (1 + TAX_RATE)).toFixed(2)) : 0
  const viewTax = viewInvoice ? Number((viewInvoiceAmount - viewSubtotal).toFixed(2)) : 0
  const viewProjectBudgetValue = viewProject ? parseBudgetValue(viewProject.budget) : null
  const viewProjectBudgetLabel =
    viewProjectBudgetValue !== null ? formatCurrency(viewProjectBudgetValue) : "Not set"
  const viewProjectPeriod = viewProject
    ? `${viewProject.start_date ? format(new Date(viewProject.start_date), "PPP") : "—"} - ${
        viewProject.end_date ? format(new Date(viewProject.end_date), "PPP") : "—"
      }`
    : "—"
  const issueDateLabel = viewInvoice?.issue_date ? format(new Date(viewInvoice.issue_date), "PPP") : "—"
  const dueDateLabel = viewInvoice?.due_date ? format(new Date(viewInvoice.due_date), "PPP") : "—"

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
            columns={columns(handleView, handleEdit, handleDelete, resolveClientName, resolveProjectName, handleChangeStatus)}
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
                  <SelectItem value="Pending">Pending</SelectItem>
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
                  {selectedNewProject && (
                    <p className="mt-1 text-xs text-gray-500">
                      {newProjectBudgetValue !== null
                        ? `Project budget ${formatCurrency(newProjectBudgetValue)} \u00B7 Remaining ${formatCurrency(
                            newBudgetRemaining ?? 0,
                          )}`
                        : "Project budget not configured yet"}
                    </p>
                  )}
              {isNewInvoiceOverBudget && newProjectBudgetValue !== null && (
                <p className="mt-2 text-xs text-rose-600">
                  This invoice exceeds the budget by{" "}
                  {formatCurrency(newInvoiceAmountValue - newProjectBudgetValue)}
                </p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createInvoice.isPending || isNewInvoiceOverBudget}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
      <DialogContent className="max-w-2xl" data-hide-close>
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <p className="text-sm text-gray-500">Professional summary of the selected invoice</p>
        </DialogHeader>
        {viewInvoice && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Invoice #{viewInvoice.invoice_number ?? viewInvoice.id}</p>
                  <p className="text-xs text-gray-500">Issued {issueDateLabel}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Due {dueDateLabel}</p>
                  <p className="mt-1 inline-flex items-center rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-white px-3 py-1 text-xs font-semibold text-emerald-700">
                    {viewInvoice.status ?? "Unknown"}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">Billed to</p>
                  <p className="text-lg font-semibold text-gray-900">{viewClient?.name ?? "—"}</p>
                  <p className="text-sm text-gray-600">{viewClient?.contact_person ?? "—"}</p>
                  <p className="text-sm text-gray-500">{viewClient?.phone ?? "—"}</p>
                  <p className="text-sm text-gray-500">{viewClient?.email ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">Project</p>
                  <p className="text-lg font-semibold text-gray-900">{viewProject?.name ?? "—"}</p>
                  <p className="text-sm text-gray-500">Budget {viewProjectBudgetLabel}</p>
                  <p className="text-sm text-gray-500">Manager {viewProject?.manager_id ?? "TBD"}</p>
                  <p className="text-sm text-gray-500">Period {viewProjectPeriod}</p>
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
                <div className="grid grid-cols-4 gap-2 bg-gray-50 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-gray-500">
                  <span>Description</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="grid grid-cols-4 gap-2 border-t border-gray-200 px-4 py-4 text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{viewProject?.name ?? "Project Services"}</span>
                  <span className="text-right">1</span>
                  <span className="text-right">{formatCurrency(viewInvoiceAmount)}</span>
                  <span className="text-right">{formatCurrency(viewInvoiceAmount)}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 md:flex-row md:justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Subtotal</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(viewSubtotal)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Tax (10%)</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(viewTax)}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Total due</p>
                  <p className="text-3xl font-semibold text-emerald-900">{formatCurrency(viewInvoiceAmount)}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 border-t border-gray-200 pt-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">Payment info</p>
                  <p className="text-sm text-gray-600">Fausat Bank</p>
                  <p className="text-sm text-gray-600">Account Name: Juliana Silva</p>
                  <p className="text-sm text-gray-600">Account No: 123 456 7890</p>
                  <p className="text-sm text-gray-600">Due by 10 July 2025</p>
                </div>
                <div className="space-y-1 text-right text-sm text-gray-500">
                  <p className="text-lg font-semibold text-gray-900 italics">Thank you for working with us</p>
                  <p>Juliana Silva</p>
                  <p>Lead Consultant</p>
                </div>
              </div>
            </div>
          </div>
        )}
          <DialogFooter className="pt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button
              variant="secondary"
              className="bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 border-emerald-600"
              onClick={() => {
                if (viewInvoice) {
                  handleDownload(viewInvoice)
                }
              }}
              disabled={!viewInvoice}
            >
              Download PDF
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
              <Label>Total Amount</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={editTotal}
                onChange={(event) => setEditTotal(event.target.value)}
                required
              />
              {selectedEditProject && (
                <p className="mt-1 text-xs text-gray-500">
                  {editProjectBudgetValue !== null
                    ? `Project budget ${formatCurrency(editProjectBudgetValue)} \u00B7 Remaining ${formatCurrency(
                        editBudgetRemaining ?? 0,
                      )}`
                    : "Project budget not configured yet"}
                </p>
              )}
              {isEditInvoiceOverBudget && editProjectBudgetValue !== null && (
                <p className="mt-2 text-xs text-rose-600">
                  This invoice exceeds the budget by{" "}
                  {formatCurrency(editInvoiceAmountValue - editProjectBudgetValue)}
                </p>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateInvoice.isPending || isEditInvoiceOverBudget}>
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
          setStatusInvoice(null)
        }}
        title="Change Invoice Status"
        description={`Update the status for ${statusInvoice?.invoice_number ?? "this invoice"}.`}
        currentStatus={statusInvoice?.status ?? "Pending"}
        options={STATUS_OPTIONS}
        isLoading={updateInvoice.isPending}
        onConfirm={handleUpdateInvoiceStatus}
      />

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
