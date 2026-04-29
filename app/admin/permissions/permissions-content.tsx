"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { toast } from "sonner"
import {
  CheckCircle2,
  Clock3,
  Edit,
  Eye,
  KeyRound,
  Loader2,
  Search,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react"
import {
  useCreatePermission,
  useDeletePermission,
  useGetPermission,
  useGetPermissions,
  useUpdatePermission,
} from "@/services/hooks/permissions"
import type { Permission } from "@/types/permissions"
import { getUserPermissions, performPermissionAction } from "@/services/endpoints/permissions/permissions"

type PermissionFormState = {
  name: string
  resource: string
  action: string
  description: string
}

type PermissionAccessTab = "assign_user" | "unassign_user" | "unassign_role" | "lookup_user"

type PermissionAccessState = {
  userId: string
  roleId: string
  lookupUserId: string
}

type PermissionLookupResult = {
  success: boolean
  message?: string
  data: Permission[]
}

const defaultFormState: PermissionFormState = {
  name: "",
  resource: "",
  action: "",
  description: "",
}

const defaultAccessState: PermissionAccessState = {
  userId: "",
  roleId: "",
  lookupUserId: "",
}

const permissionBadgeClass = (value?: string) => {
  const normalized = value?.toLowerCase().trim() ?? ""
  if (normalized === "create") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (normalized === "update" || normalized === "edit") return "border-blue-200 bg-blue-50 text-blue-700"
  if (normalized === "delete") return "border-red-200 bg-red-50 text-red-700"
  if (normalized === "view" || normalized === "read") return "border-sky-200 bg-sky-50 text-sky-700"
  return "border-gray-200 bg-gray-50 text-gray-700"
}

const formatDateTime = (value?: string) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function PermissionsContent() {
  const { data, isLoading, error, refetch } = useGetPermissions()
  const createPermissionMutation = useCreatePermission()
  const updatePermissionMutation = useUpdatePermission()
  const deletePermissionMutation = useDeletePermission()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [form, setForm] = useState<PermissionFormState>(defaultFormState)
  const [pendingDelete, setPendingDelete] = useState<Permission | null>(null)
  const [accessTab, setAccessTab] = useState<PermissionAccessTab>("assign_user")
  const [accessForm, setAccessForm] = useState<PermissionAccessState>(defaultAccessState)
  const [accessMessage, setAccessMessage] = useState<string | null>(null)
  const [accessLookupResult, setAccessLookupResult] = useState<PermissionLookupResult | null>(null)
  const [isAccessSubmitting, setIsAccessSubmitting] = useState(false)

  const { data: permissionDetailResponse } = useGetPermission(
    showViewDialog || showEditDialog ? selectedPermission?.id : undefined,
  )

  const permissions = data?.data ?? []
  const selectedPermissionDetail = permissionDetailResponse?.data ?? selectedPermission

  useEffect(() => {
    if (showEditDialog && selectedPermissionDetail) {
      setForm({
        name: selectedPermissionDetail.name ?? "",
        resource: selectedPermissionDetail.resource ?? "",
        action: selectedPermissionDetail.action ?? "",
        description: selectedPermissionDetail.description ?? "",
      })
    }
  }, [selectedPermissionDetail, showEditDialog])

  const stats = useMemo(() => {
    const total = permissions.length
    const resources = new Set(permissions.map((item) => item.resource?.toLowerCase().trim()).filter(Boolean))
    const actions = new Set(permissions.map((item) => item.action?.toLowerCase().trim()).filter(Boolean))
    const recent = permissions.filter((item) => {
      if (!item.created_at) return false
      const createdAt = new Date(item.created_at)
      if (Number.isNaN(createdAt.getTime())) return false
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 30)
      return createdAt >= cutoff
    }).length
    return {
      total,
      resources: resources.size,
      actions: actions.size,
      recent,
    }
  }, [permissions])

  const searchFields = [
    { name: "name", label: "Name", type: "text" as const },
    { name: "resource", label: "Resource", type: "text" as const },
    { name: "action", label: "Action", type: "text" as const },
    { name: "description", label: "Description", type: "text" as const },
  ]

  const openAddDialog = () => {
    setForm(defaultFormState)
    setSelectedPermission(null)
    setShowAddDialog(true)
  }

  const openViewDialog = (permission: Permission) => {
    setSelectedPermission(permission)
    setShowViewDialog(true)
  }

  const openEditDialog = (permission: Permission) => {
    setSelectedPermission(permission)
    setForm({
      name: permission.name ?? "",
      resource: permission.resource ?? "",
      action: permission.action ?? "",
      description: permission.description ?? "",
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (permission: Permission) => {
    setPendingDelete(permission)
    setShowDeleteDialog(true)
  }

  const openAccessDialog = (permission: Permission) => {
    setSelectedPermission(permission)
    setAccessTab("assign_user")
    setAccessForm(defaultAccessState)
    setAccessMessage(null)
    setAccessLookupResult(null)
    setShowAccessDialog(true)
  }

  const closeAccessDialog = () => {
    setShowAccessDialog(false)
    setAccessMessage(null)
    setAccessLookupResult(null)
    setAccessForm(defaultAccessState)
  }

  const submitPermissionAction = async (
    action: "assign_user" | "unassign_user" | "unassign_role",
    payload: { userId?: string; roleId?: string },
  ) => {
    if (!selectedPermission) return

    const userId = payload.userId?.trim()
    const roleId = payload.roleId?.trim()

    if (action !== "unassign_role" && !userId) {
      toast.error("User ID is required")
      return
    }

    if (action === "unassign_role" && !roleId) {
      toast.error("Role ID is required")
      return
    }

    setIsAccessSubmitting(true)
    setAccessMessage(null)

    try {
      const response = await performPermissionAction({
        action,
        permission_id: selectedPermission.id,
        user_id: userId,
        role_id: roleId,
      })

      const message = response.message || "Permission updated successfully"
      setAccessMessage(message)
      toast.success(message)
      await refetch()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update permission access"
      setAccessMessage(message)
      toast.error(message)
    } finally {
      setIsAccessSubmitting(false)
    }
  }

  const handleLookupUserPermissions = async () => {
    const userId = accessForm.lookupUserId.trim()
    if (!userId) {
      toast.error("User ID is required")
      return
    }

    setIsAccessSubmitting(true)
    setAccessMessage(null)
    setAccessLookupResult(null)

    try {
      const response = await getUserPermissions(userId)
      const data = response.data ?? []
      setAccessLookupResult({
        success: response.success,
        message: response.message,
        data,
      })
      setAccessMessage(response.message || `Loaded ${data.length} permission${data.length === 1 ? "" : "s"} for ${userId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load user permissions"
      setAccessMessage(message)
      toast.error(message)
    } finally {
      setIsAccessSubmitting(false)
    }
  }

  const handleCreatePermission = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name.trim() || !form.resource.trim() || !form.action.trim()) {
      toast.error("Name, resource, and action are required")
      return
    }

    try {
      await createPermissionMutation.mutateAsync({
        name: form.name.trim(),
        resource: form.resource.trim(),
        action: form.action.trim(),
        description: form.description.trim() || undefined,
      })
      toast.success("Permission created successfully")
      setShowAddDialog(false)
      setForm(defaultFormState)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create permission")
    }
  }

  const handleUpdatePermission = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedPermission) return
    if (!form.name.trim() || !form.resource.trim() || !form.action.trim()) {
      toast.error("Name, resource, and action are required")
      return
    }

    try {
      await updatePermissionMutation.mutateAsync({
        id: selectedPermission.id,
        name: form.name.trim(),
        resource: form.resource.trim(),
        action: form.action.trim(),
        description: form.description.trim() || undefined,
      })
      toast.success("Permission updated successfully")
      setShowEditDialog(false)
      setSelectedPermission(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update permission")
    }
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return

    try {
      await deletePermissionMutation.mutateAsync(pendingDelete.id)
      toast.success("Permission deleted successfully")
      setShowDeleteDialog(false)
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete permission")
    }
  }

  const columns = [
    {
      key: "name",
      label: "Permission",
      sortable: true,
      render: (value: string, row: Permission) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-100">
            <KeyRound className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-gray-900">{value}</div>
            <div className="truncate text-xs text-gray-500">{row.description || "No description"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "resource",
      label: "Resource",
      sortable: true,
      render: (value: string) => <Badge className={permissionBadgeClass("view")}>{value || "N/A"}</Badge>,
    },
    {
      key: "action",
      label: "Action",
      sortable: true,
      render: (value: string) => <Badge className={permissionBadgeClass(value)}>{value || "N/A"}</Badge>,
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock3 className="h-4 w-4 text-gray-400" />
          <span>{formatDateTime(value)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Permission) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => openViewDialog(row)} title="View permission">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => openEditDialog(row)} title="Edit permission">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => openAccessDialog(row)} title="Manage permission access">
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-800"
            onClick={() => openDeleteDialog(row)}
            title="Delete permission"
            disabled={deletePermissionMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">{error.message || "Failed to load permissions"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-100">
                <Shield className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Permissions</h1>
                <p className="text-sm text-gray-500">Create, inspect, update, and remove system permissions.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Permissions", value: stats.total, icon: Shield },
            { label: "Resources", value: stats.resources, icon: KeyRound },
            { label: "Actions", value: stats.actions, icon: CheckCircle2 },
            { label: "Recent", value: stats.recent, icon: Clock3 },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">{item.label}</p>
                <item.icon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-semibold text-gray-900">Permission Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Permission"
            columns={columns}
            data={permissions}
            searchFields={searchFields}
            onAdd={openAddDialog}
            addButtonLabel="Create Permission"
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Create Permission</DialogTitle>
            <DialogDescription>Add a new permission definition for a system resource.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePermission} className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="permission-name">Name</Label>
              <Input
                id="permission-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Approve Employee"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="permission-resource">Resource</Label>
                <Input
                  id="permission-resource"
                  value={form.resource}
                  onChange={(e) => setForm((prev) => ({ ...prev, resource: e.target.value }))}
                  placeholder="e.g. Employee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission-action">Action</Label>
                <Input
                  id="permission-action"
                  value={form.action}
                  onChange={(e) => setForm((prev) => ({ ...prev, action: e.target.value }))}
                  placeholder="e.g. Approve"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission-description">Description</Label>
              <Textarea
                id="permission-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this permission allows"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPermissionMutation.isPending} className="bg-[#008751] hover:bg-[#007245]">
                {createPermissionMutation.isPending ? "Creating..." : "Create Permission"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update the selected permission details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePermission} className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-permission-name">Name</Label>
              <Input
                id="edit-permission-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-permission-resource">Resource</Label>
                <Input
                  id="edit-permission-resource"
                  value={form.resource}
                  onChange={(e) => setForm((prev) => ({ ...prev, resource: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-permission-action">Action</Label>
                <Input
                  id="edit-permission-action"
                  value={form.action}
                  onChange={(e) => setForm((prev) => ({ ...prev, action: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-permission-description">Description</Label>
              <Textarea
                id="edit-permission-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePermissionMutation.isPending} className="bg-[#008751] hover:bg-[#007245]">
                {updatePermissionMutation.isPending ? "Updating..." : "Update Permission"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Permission Details</DialogTitle>
            <DialogDescription>Full details for the selected permission.</DialogDescription>
          </DialogHeader>
          {selectedPermissionDetail ? (
            <div className="grid gap-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Name</p>
                  <p className="font-medium text-gray-900">{selectedPermissionDetail.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Resource</p>
                  <p className="font-medium text-gray-900">{selectedPermissionDetail.resource || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Action</p>
                  <p className="font-medium text-gray-900">{selectedPermissionDetail.action || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Created At</p>
                  <p className="font-medium text-gray-900">{formatDateTime(selectedPermissionDetail.created_at)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Description</p>
                <p className="text-sm leading-relaxed text-gray-700">
                  {selectedPermissionDetail.description || "No description provided"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setPendingDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        itemName={pendingDelete?.name || "this permission"}
        title="Delete Permission"
        description="This will permanently delete the selected permission."
        isLoading={deletePermissionMutation.isPending}
      />

      <Dialog open={showAccessDialog} onOpenChange={(open) => (open ? setShowAccessDialog(true) : closeAccessDialog())}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Manage Permission Access</DialogTitle>
            <DialogDescription>
              Assign or remove the selected permission for a user or role, then inspect the user permission set.
            </DialogDescription>
          </DialogHeader>

          {selectedPermission ? (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  Permission #{selectedPermission.id}
                </Badge>
                <span className="font-medium text-gray-900">{selectedPermission.name}</span>
                <span className="text-sm text-gray-500">
                  {selectedPermission.resource || "Resource not set"} / {selectedPermission.action || "Action not set"}
                </span>
              </div>

              <Tabs value={accessTab} onValueChange={(value) => setAccessTab(value as PermissionAccessTab)}>
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-gray-100 p-1 sm:grid-cols-4">
                  <TabsTrigger value="assign_user" className="data-[state=active]:bg-white">
                    Assign to User
                  </TabsTrigger>
                  <TabsTrigger value="unassign_user" className="data-[state=active]:bg-white">
                    Unassign User
                  </TabsTrigger>
                  <TabsTrigger value="unassign_role" className="data-[state=active]:bg-white">
                    Unassign Role
                  </TabsTrigger>
                  <TabsTrigger value="lookup_user" className="data-[state=active]:bg-white">
                    Get User Access
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assign_user" className="mt-4">
                  <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="grid gap-2">
                      <Label htmlFor="assign-user-id">User ID</Label>
                      <Input
                        id="assign-user-id"
                        value={accessForm.userId}
                        onChange={(event) => setAccessForm((prev) => ({ ...prev, userId: event.target.value }))}
                        placeholder="e.g. IPPIS 011"
                      />
                    </div>
                    <div className="grid gap-2 text-sm text-gray-500">
                      <p>Action: <span className="font-medium text-gray-700">assign_user</span></p>
                      <p>Permission ID: <span className="font-medium text-gray-700">{selectedPermission.id}</span></p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">Assign this permission to the user above.</p>
                      <Button
                        onClick={() => submitPermissionAction("assign_user", { userId: accessForm.userId })}
                        disabled={isAccessSubmitting}
                        className="gap-2 bg-[#008751] hover:bg-[#007245]"
                      >
                        <UserPlus className="h-4 w-4" />
                        {isAccessSubmitting ? "Saving..." : "Assign Permission"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="unassign_user" className="mt-4">
                  <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="grid gap-2">
                      <Label htmlFor="unassign-user-id">User ID</Label>
                      <Input
                        id="unassign-user-id"
                        value={accessForm.userId}
                        onChange={(event) => setAccessForm((prev) => ({ ...prev, userId: event.target.value }))}
                        placeholder="e.g. IPPIS 011"
                      />
                    </div>
                    <div className="grid gap-2 text-sm text-gray-500">
                      <p>Action: <span className="font-medium text-gray-700">unassign_user</span></p>
                      <p>Permission ID: <span className="font-medium text-gray-700">{selectedPermission.id}</span></p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">Remove this permission from the user above.</p>
                      <Button
                        onClick={() => submitPermissionAction("unassign_user", { userId: accessForm.userId })}
                        disabled={isAccessSubmitting}
                        variant="outline"
                        className="gap-2"
                      >
                        <UserMinus className="h-4 w-4" />
                        {isAccessSubmitting ? "Saving..." : "Unassign Permission"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="unassign_role" className="mt-4">
                  <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="grid gap-2">
                      <Label htmlFor="unassign-role-id">Role ID</Label>
                      <Input
                        id="unassign-role-id"
                        value={accessForm.roleId}
                        onChange={(event) => setAccessForm((prev) => ({ ...prev, roleId: event.target.value }))}
                        placeholder="e.g. 1"
                      />
                    </div>
                    <div className="grid gap-2 text-sm text-gray-500">
                      <p>Action: <span className="font-medium text-gray-700">unassign_role</span></p>
                      <p>Permission ID: <span className="font-medium text-gray-700">{selectedPermission.id}</span></p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">Remove this permission from the selected role.</p>
                      <Button
                        onClick={() => submitPermissionAction("unassign_role", { roleId: accessForm.roleId })}
                        disabled={isAccessSubmitting}
                        variant="outline"
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isAccessSubmitting ? "Saving..." : "Unassign From Role"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lookup_user" className="mt-4">
                  <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="grid gap-2">
                      <Label htmlFor="lookup-user-id">User ID</Label>
                      <Input
                        id="lookup-user-id"
                        value={accessForm.lookupUserId}
                        onChange={(event) => setAccessForm((prev) => ({ ...prev, lookupUserId: event.target.value }))}
                        placeholder="e.g. EMP902884"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">Load the permissions and role-related access for that user.</p>
                      <Button
                        onClick={handleLookupUserPermissions}
                        disabled={isAccessSubmitting}
                        className="gap-2 bg-[#008751] hover:bg-[#007245]"
                      >
                        <Search className="h-4 w-4" />
                        {isAccessSubmitting ? "Loading..." : "Get Access"}
                      </Button>
                    </div>

                    {accessMessage ? (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        {accessMessage}
                      </div>
                    ) : null}

                    <ScrollArea className="h-56 rounded-xl border border-gray-100">
                      <div className="space-y-2 p-3">
                        {accessLookupResult?.data?.length ? (
                          accessLookupResult.data.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-medium text-gray-900">{permission.name}</p>
                                <p className="truncate text-xs text-gray-500">
                                  {permission.resource || "N/A"} / {permission.action || "N/A"}
                                </p>
                              </div>
                              <Badge className={permissionBadgeClass(permission.action)}>{permission.id}</Badge>
                            </div>
                          ))
                        ) : (
                          <div className="flex h-full items-center justify-center py-10 text-sm text-gray-500">
                            {accessLookupResult ? "No permissions returned for this user." : "Search a user to see their permissions."}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
