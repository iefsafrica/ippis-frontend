"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DialogDescription,
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
  useCreateClient,
  useDeleteClient,
  useGetClients,
  useUpdateClient,
} from "@/services/hooks/clients"
import type { Client, CreateClientRequest } from "@/types/clients"
import { Eye, Edit, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

const statusBadgeClass = (status?: string) => {
  const normalized = status?.toLowerCase() ?? ""
  if (normalized === "active") {
    return "bg-emerald-100 text-emerald-700"
  }
  if (normalized === "inactive") {
    return "bg-rose-100 text-rose-700"
  }
  return "bg-gray-100 text-gray-700"
}

const columns = (
  handleView: (client: Client) => void,
  handleEdit: (client: Client) => void,
  handleDelete: (client: Client) => void,
) => [
  {
    key: "client_code",
    label: "Client Code",
    sortable: true,
    render: (value: string) => (
      <div className="font-medium text-gray-900">{value}</div>
    ),
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
  },
  {
    key: "contact_person",
    label: "Contact Person",
    sortable: true,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
  },
  {
    key: "phone",
    label: "Phone",
    sortable: true,
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
    key: "actions",
    label: "Actions",
    render: (_: unknown, row: Client) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" onClick={() => handleView(row)} title="View Client">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleEdit(row)} title="Edit Client">
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDelete(row)}
          className="text-red-600 hover:text-red-800"
          title="Delete Client"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]

const searchFields = [
  { name: "client_code", label: "Client Code", type: "text" as const },
  { name: "name", label: "Client Name", type: "text" as const },
  { name: "contact_person", label: "Contact Person", type: "text" as const },
  { name: "email", label: "Email", type: "text" as const },
]

const formatTimestamp = (value?: string) => {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return format(parsed, "PPP p")
}

export default function ClientsContent() {
  const [viewClient, setViewClient] = useState<Client | null>(null)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editContact, setEditContact] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editStatus, setEditStatus] = useState("Active")
  const [newClient, setNewClient] = useState<CreateClientRequest>({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    status: "Active",
  })
  const [deleteClientCandidate, setDeleteClientCandidate] = useState<Client | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: clientsResponse, refetch } = useGetClients()
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  const clients = clientsResponse?.data?.clients ?? []
  const total = clients.length
  const active = clients.filter((item) => item.status?.toLowerCase() === "active").length
  const inactive = clients.filter((item) => item.status?.toLowerCase() === "inactive").length

  const stats = [
    { label: "Total Clients", value: total, subtitle: "All clients" },
    { label: "Active", value: active, subtitle: "Currently active" },
    { label: "Inactive", value: inactive, subtitle: "Not in use" },
  ]

  const handleView = (client: Client) => {
    setViewClient(client)
    setIsViewOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditClient(client)
    setEditName(client.name)
    setEditContact(client.contact_person)
    setEditEmail(client.email)
    setEditPhone(client.phone)
    setEditStatus(client.status ?? "Active")
    setIsEditOpen(true)
  }

  const handleDelete = (client: Client) => {
    setDeleteClientCandidate(client)
    setIsDeleteDialogOpen(true)
  }

  const resetNewClientForm = () => {
    setNewClient({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      status: "Active",
    })
  }

  const handleAddSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      await createClient.mutateAsync(newClient)
      toast.success("Client created")
      setIsAddOpen(false)
      resetNewClientForm()
    } catch (error: any) {
      toast.error(error?.message || "Failed to create client")
    }
  }

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editClient) return
    try {
      await updateClient.mutateAsync({
        id: editClient.id,
        data: {
          id: editClient.id,
          name: editName || editClient.name,
          contact_person: editContact || editClient.contact_person,
          email: editEmail || editClient.email,
          phone: editPhone || editClient.phone,
          status: editStatus,
        },
      })
      toast.success("Client updated")
      setIsEditOpen(false)
      setEditClient(null)
    } catch (error: any) {
      toast.error(error?.message || "Failed to update client")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteClientCandidate) return
    try {
      await deleteClient.mutateAsync(deleteClientCandidate.id)
      toast.success("Client deleted")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete client")
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteClientCandidate(null)
    }
  }

  const handleOpenAdd = () => setIsAddOpen(true)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Clients</h2>
            <p className="text-sm text-gray-500">Manage all registered clients</p>
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
          {stats.map((item) => (
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
            <CardTitle className="text-lg font-semibold text-gray-900">Client Records</CardTitle>
            <CardDescription className="text-gray-600">Track each client account.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            title="Clients"
            columns={columns(handleView, handleEdit, handleDelete)}
            data={clients}
            searchFields={searchFields}
            onAdd={handleOpenAdd}
            addButtonLoading={createClient.isPending}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
        <DialogContent className="max-w-md">
          <form className="space-y-4" onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle>Add Client</DialogTitle>
              <DialogDescription>Register a new client organization.</DialogDescription>
            </DialogHeader>
            <div>
              <Label>Client Name</Label>
              <Input
                value={newClient.name}
                onChange={(event) => setNewClient({ ...newClient, name: event.target.value })}
                required
              />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input
                value={newClient.contact_person}
                onChange={(event) => setNewClient({ ...newClient, contact_person: event.target.value })}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newClient.email}
                onChange={(event) => setNewClient({ ...newClient, email: event.target.value })}
                required
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newClient.phone}
                onChange={(event) => setNewClient({ ...newClient, phone: event.target.value })}
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newClient.status}
                onValueChange={(value) => setNewClient({ ...newClient, status: value })}
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
              <Button type="submit" disabled={createClient.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {viewClient && (
            <div className="space-y-3">
              {[
                { label: "Client Code", value: viewClient.client_code },
                { label: "Name", value: viewClient.name },
                { label: "Contact Person", value: viewClient.contact_person },
                { label: "Email", value: viewClient.email },
                { label: "Phone", value: viewClient.phone },
                { label: "Status", value: viewClient.status },
                { label: "Created At", value: formatTimestamp(viewClient.created_at) },
                { label: "Updated At", value: formatTimestamp(viewClient.updated_at) },
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
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>Update the selected client record.</DialogDescription>
            </DialogHeader>
            <div>
              <Label>Client Name</Label>
              <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input value={editContact} onChange={(event) => setEditContact(event.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editPhone} onChange={(event) => setEditPhone(event.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(value) => setEditStatus(value)}>
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
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateClient.isPending}>
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
          setDeleteClientCandidate(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        description={`Delete client "${deleteClientCandidate?.name ?? "this client"}"?`}
        itemName={deleteClientCandidate ? `Client ${deleteClientCandidate.name}` : "Client"}
        isLoading={deleteClient.isPending}
      />
    </div>
  )
}
