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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { toast } from "sonner"
import {
  Clock3,
  Edit,
  Eye,
  Loader2,
  Shield,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react"
import { useCreateRole, useGetRole, useGetRoles, useRoleAction, useUpdateRole } from "@/services/hooks/roles"
import type { Role } from "@/types/roles"

type RoleFormState = {
  name: string
  description: string
}

type RoleAccessTab = "assign" | "unassign"

type RoleAccessState = {
  userId: string
}

const defaultFormState: RoleFormState = {
  name: "",
  description: "",
}

const defaultAccessState: RoleAccessState = {
  userId: "",
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

export default function RolesContent() {
  const { data, isLoading, error, refetch } = useGetRoles()
  const createRoleMutation = useCreateRole()
  const updateRoleMutation = useUpdateRole()
  const roleActionMutation = useRoleAction()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showAccessDialog, setShowAccessDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [form, setForm] = useState<RoleFormState>(defaultFormState)
  const [accessTab, setAccessTab] = useState<RoleAccessTab>("assign")
  const [accessForm, setAccessForm] = useState<RoleAccessState>(defaultAccessState)

  const { data: roleDetailResponse } = useGetRole(
    showViewDialog || showEditDialog ? selectedRole?.id : undefined,
  )

  const roles = data?.data ?? []
  const selectedRoleDetail = roleDetailResponse?.data ?? selectedRole

  useEffect(() => {
    if (showEditDialog && selectedRoleDetail) {
      setForm({
        name: selectedRoleDetail.name ?? "",
        description: selectedRoleDetail.description ?? "",
      })
    }
  }, [selectedRoleDetail, showEditDialog])

  const stats = useMemo(() => {
    const recent = roles.filter((item) => {
      if (!item.created_at) return false
      const createdAt = new Date(item.created_at)
      if (Number.isNaN(createdAt.getTime())) return false
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 30)
      return createdAt >= cutoff
    }).length

    const updated = roles.filter((item) => {
      if (!item.updated_at) return false
      const updatedAt = new Date(item.updated_at)
      return !Number.isNaN(updatedAt.getTime())
    }).length

    const descriptions = roles.filter((item) => Boolean(item.description?.trim())).length

    return {
      total: roles.length,
      recent,
      updated,
      descriptions,
    }
  }, [roles])

  const searchFields = [
    { name: "name", label: "Role Name", type: "text" as const },
    { name: "description", label: "Description", type: "text" as const },
    { name: "created_at", label: "Created Date", type: "date" as const },
  ]

  const openAddDialog = () => {
    setForm(defaultFormState)
    setSelectedRole(null)
    setShowAddDialog(true)
  }

  const openViewDialog = (role: Role) => {
    setSelectedRole(role)
    setShowViewDialog(true)
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setForm({
      name: role.name ?? "",
      description: role.description ?? "",
    })
    setShowEditDialog(true)
  }

  const openAccessDialog = (role: Role) => {
    setSelectedRole(role)
    setAccessTab("assign")
    setAccessForm(defaultAccessState)
    setShowAccessDialog(true)
  }

  const handleCreateRole = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name.trim()) {
      toast.error("Role name is required")
      return
    }

    try {
      await createRoleMutation.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      })
      toast.success("Role created successfully")
      setShowAddDialog(false)
      setForm(defaultFormState)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create role")
    }
  }

  const handleUpdateRole = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedRole) return
    if (!form.name.trim()) {
      toast.error("Role name is required")
      return
    }

    try {
      await updateRoleMutation.mutateAsync({
        id: selectedRole.id,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      })
      toast.success("Role updated successfully")
      setShowEditDialog(false)
      setSelectedRole(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role")
    }
  }

  const handleRoleAction = async (action: "assign" | "unassign") => {
    if (!selectedRole) return

    const userId = accessForm.userId.trim()
    if (!userId) {
      toast.error("User ID is required")
      return
    }

    try {
      const response = await roleActionMutation.mutateAsync({
        action,
        user_id: userId,
        role_id: selectedRole.id,
      })
      toast.success(response.message || "Role assignment updated successfully")
      setAccessForm(defaultAccessState)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role assignment")
    }
  }

  const columns = [
    {
      key: "name",
      label: "Role",
      sortable: true,
      render: (value: string, row: Role) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-100">
            <Shield className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-gray-900">{value}</div>
            <div className="truncate text-xs text-gray-500">Role ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      render: (value: string) => <div className="max-w-[360px] truncate text-sm text-gray-600">{value || "N/A"}</div>,
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
      key: "updated_at",
      label: "Updated",
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-700">{formatDateTime(value)}</div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Role) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => openViewDialog(row)} title="View role">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => openEditDialog(row)} title="Edit role">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => openAccessDialog(row)} title="Assign or unassign role">
            <Users className="h-4 w-4" />
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
        <p className="text-sm text-red-600">{error.message || "Failed to load roles"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 lg:px-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-100">
                <Shield className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
                <p className="text-sm text-gray-500">Create roles, update details, and assign or remove users from roles.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Roles", value: stats.total },
            { label: "Recent", value: stats.recent },
            { label: "Updated", value: stats.updated },
            { label: "With Description", value: stats.descriptions },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">{item.label}</p>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-semibold text-gray-900">Role Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Role"
            columns={columns}
            data={roles}
            searchFields={searchFields}
            defaultSortColumn="id"
            defaultSortDirection="desc"
            onAdd={openAddDialog}
            addButtonLabel="Create Role"
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>Add a new system role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. SuperAdmin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Describe what this role can do"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRoleMutation.isPending} className="bg-[#008751] hover:bg-[#007245]">
                {createRoleMutation.isPending ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the selected role details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Name</Label>
              <Input
                id="edit-role-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateRoleMutation.isPending} className="bg-[#008751] hover:bg-[#007245]">
                {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Role Details</DialogTitle>
            <DialogDescription>Full details for the selected role.</DialogDescription>
          </DialogHeader>
          {selectedRoleDetail ? (
            <div className="grid gap-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Name</p>
                  <p className="font-medium text-gray-900">{selectedRoleDetail.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Role ID</p>
                  <p className="font-medium text-gray-900">{selectedRoleDetail.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Created At</p>
                  <p className="font-medium text-gray-900">{formatDateTime(selectedRoleDetail.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Updated At</p>
                  <p className="font-medium text-gray-900">{formatDateTime(selectedRoleDetail.updated_at)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Description</p>
                <p className="text-sm leading-relaxed text-gray-700">
                  {selectedRoleDetail.description || "No description provided"}
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

      <Dialog open={showAccessDialog} onOpenChange={setShowAccessDialog}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Manage Role Assignment</DialogTitle>
            <DialogDescription>Assign or remove the selected role for a user.</DialogDescription>
          </DialogHeader>

          {selectedRole ? (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  Role #{selectedRole.id}
                </Badge>
                <span className="font-medium text-gray-900">{selectedRole.name}</span>
                <span className="text-sm text-gray-500">{selectedRole.description || "No description provided"}</span>
              </div>

              <Tabs value={accessTab} onValueChange={(value) => setAccessTab(value as RoleAccessTab)}>
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-gray-100 p-1">
                  <TabsTrigger value="assign" className="data-[state=active]:bg-white">
                    Assign to User
                  </TabsTrigger>
                  <TabsTrigger value="unassign" className="data-[state=active]:bg-white">
                    Unassign User
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assign" className="mt-4">
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
                      <p>
                        Action: <span className="font-medium text-gray-700">assign</span>
                      </p>
                      <p>
                        Role ID: <span className="font-medium text-gray-700">{selectedRole.id}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">Assign this role to the user above.</p>
                      <Button
                        onClick={() => handleRoleAction("assign")}
                        disabled={roleActionMutation.isPending}
                        className="gap-2 bg-[#008751] hover:bg-[#007245]"
                      >
                        <UserPlus className="h-4 w-4" />
                        {roleActionMutation.isPending ? "Saving..." : "Assign Role"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="unassign" className="mt-4">
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
                      <p>
                        Action: <span className="font-medium text-gray-700">unassign</span>
                      </p>
                      <p>
                        Role ID: <span className="font-medium text-gray-700">{selectedRole.id}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-500">Remove this role from the user above.</p>
                      <Button
                        onClick={() => handleRoleAction("unassign")}
                        disabled={roleActionMutation.isPending}
                        variant="outline"
                        className="gap-2"
                      >
                        <UserMinus className="h-4 w-4" />
                        {roleActionMutation.isPending ? "Saving..." : "Unassign Role"}
                      </Button>
                    </div>
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
