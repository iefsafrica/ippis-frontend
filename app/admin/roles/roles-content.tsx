"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  KeyRound,
  Loader2,
  Search,
  Shield,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { useCreateRole, useGetRole, useGetRoles, useRoleAction, useUpdateRole } from "@/services/hooks/roles"
import { useGetPermissions } from "@/services/hooks/permissions"
import type { Role } from "@/types/roles"
import type { Permission } from "@/types/permissions"

type RoleFormState = {
  name: string
  description: string
  permissionIds: (string | number)[]
}

type RoleAccessTab = "assign" | "unassign"

type RoleAccessState = {
  userId: string
}

const defaultFormState: RoleFormState = {
  name: "",
  description: "",
  permissionIds: [],
}

const defaultAccessState: RoleAccessState = {
  userId: "",
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

interface PermissionSelectorProps {
  selectedIds: (string | number)[]
  onChange: (ids: (string | number)[]) => void
  permissions: Permission[]
  isLoading?: boolean
}

function PermissionSelector({
  selectedIds,
  onChange,
  permissions,
  isLoading,
}: PermissionSelectorProps) {
  const [search, setSearch] = useState("")
  const [selectedResource, setSelectedResource] = useState<string>("all")

  const selectedSet = useMemo(() => new Set(selectedIds.map(String)), [selectedIds])

  const resources = useMemo(() => {
    const set = new Set<string>()
    permissions.forEach((p) => {
      const res = p.resource || p.module
      if (res) set.add(res)
    })
    return Array.from(set).sort()
  }, [permissions])

  const filteredPermissions = useMemo(() => {
    const q = search.toLowerCase().trim()
    return permissions.filter((p) => {
      const res = (p.resource || p.module || "").toLowerCase()
      if (selectedResource !== "all" && res !== selectedResource.toLowerCase()) {
        return false
      }
      if (!q) return true
      return (
        p.name?.toLowerCase().includes(q) ||
        p.action?.toLowerCase().includes(q) ||
        p.resource?.toLowerCase().includes(q) ||
        p.module?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    })
  }, [permissions, search, selectedResource])

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {}
    filteredPermissions.forEach((p) => {
      const key = p.resource || p.module || "General"
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return groups
  }, [filteredPermissions])

  const toggleOne = (id: string | number) => {
    const strId = String(id)
    if (selectedSet.has(strId)) {
      onChange(selectedIds.filter((item) => String(item) !== strId))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const selectAllFiltered = () => {
    const toAdd = filteredPermissions
      .filter((p) => !selectedSet.has(String(p.id)))
      .map((p) => p.id)
    onChange([...selectedIds, ...toAdd])
  }

  const deselectAllFiltered = () => {
    const filteredIdSet = new Set(filteredPermissions.map((p) => String(p.id)))
    onChange(selectedIds.filter((id) => !filteredIdSet.has(String(id))))
  }

  const toggleGroup = (groupPermissions: Permission[]) => {
    const allSelected = groupPermissions.every((p) => selectedSet.has(String(p.id)))
    if (allSelected) {
      const groupSet = new Set(groupPermissions.map((p) => String(p.id)))
      onChange(selectedIds.filter((id) => !groupSet.has(String(id))))
    } else {
      const toAdd = groupPermissions
        .filter((p) => !selectedSet.has(String(p.id)))
        .map((p) => p.id)
      onChange([...selectedIds, ...toAdd])
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-xl bg-gray-50/50">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-600 mb-2" />
        <span className="text-xs text-gray-500">Loading available permissions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header with counter and quick action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold text-gray-900">Permissions</Label>
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium"
          >
            {selectedIds.length} of {permissions.length} selected
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={selectAllFiltered}
            className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
            disabled={filteredPermissions.length === 0}
          >
            Select All
          </Button>
          <span className="text-gray-300">|</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={deselectAllFiltered}
            className="h-7 px-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            disabled={filteredPermissions.length === 0}
          >
            Deselect All
          </Button>
          {selectedIds.length > 0 && (
            <>
              <span className="text-gray-300">|</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange([])}
                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter permissions by name, resource, action..."
          className="pl-9 pr-8 text-xs h-9 bg-gray-50/60 focus:bg-white"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Resource filter tabs / chips */}
      {resources.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedResource("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedResource === "all"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({permissions.length})
          </button>
          {resources.map((res) => {
            const count = permissions.filter(
              (p) => (p.resource || p.module || "").toLowerCase() === res.toLowerCase()
            ).length
            return (
              <button
                key={res}
                type="button"
                onClick={() => setSelectedResource(res)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${
                  selectedResource.toLowerCase() === res.toLowerCase()
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {res.replace(/_/g, " ")} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Permissions List container */}
      <div className="max-h-60 sm:max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 shadow-inner">
        {Object.keys(groupedPermissions).length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500">
            {search ? `No permissions matching "${search}"` : "No permissions available"}
          </div>
        ) : (
          Object.entries(groupedPermissions).map(([groupName, groupPerms]) => {
            const groupAllSelected = groupPerms.every((p) => selectedSet.has(String(p.id)))

            return (
              <div key={groupName} className="p-2 space-y-1">
                {/* Group Header */}
                <div className="flex items-center justify-between px-2 py-1 bg-gray-50/80 rounded-lg">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupPerms)}
                      className="text-xs font-semibold uppercase tracking-wider text-gray-700 hover:text-emerald-700 flex items-center gap-1.5"
                    >
                      <span>{groupName.replace(/_/g, " ")}</span>
                    </button>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-gray-200 text-gray-700">
                      {groupPerms.length}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroup(groupPerms)}
                    className="h-6 px-2 text-[11px] text-emerald-700 hover:text-emerald-800"
                  >
                    {groupAllSelected ? "Deselect group" : "Select group"}
                  </Button>
                </div>

                {/* Group items */}
                <div className="space-y-1 pt-1">
                  {groupPerms.map((perm) => {
                    const isChecked = selectedSet.has(String(perm.id))
                    return (
                      <div
                        key={perm.id}
                        onClick={() => toggleOne(perm.id)}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-emerald-50/60 border border-emerald-100"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleOne(perm.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-medium text-gray-900">{perm.name}</span>
                            {perm.action && (
                              <Badge className={`text-[10px] py-0 px-1.5 ${permissionBadgeClass(perm.action)}`}>
                                {perm.action}
                              </Badge>
                            )}
                            {perm.is_privileged && (
                              <Badge className="text-[10px] py-0 px-1.5 border-amber-200 bg-amber-50 text-amber-700">
                                Privileged
                              </Badge>
                            )}
                          </div>
                          {perm.description && (
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{perm.description}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function RolesContent() {
  const { data, isLoading, error, refetch } = useGetRoles()
  const { data: permissionsResponse, isLoading: isLoadingPermissions } = useGetPermissions()
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
  const allPermissions = useMemo(() => permissionsResponse?.data ?? [], [permissionsResponse])
  const selectedRoleDetail = roleDetailResponse?.data ?? selectedRole

  useEffect(() => {
    if (showEditDialog && selectedRoleDetail && selectedRoleDetail.id === selectedRole?.id) {
      setForm((prev) => ({
        ...prev,
        name: selectedRoleDetail.name ?? prev.name,
        description: selectedRoleDetail.description ?? prev.description,
        permissionIds:
          selectedRoleDetail.permissions && selectedRoleDetail.permissions.length > 0
            ? selectedRoleDetail.permissions.map((p) => p.id)
            : prev.permissionIds,
      }))
    }
  }, [selectedRoleDetail?.id, showEditDialog])

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
      permissionIds: (role.permissions || []).map((p) => p.id),
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
        permission_ids: form.permissionIds,
      })
      toast.success("Role created successfully")
      setShowAddDialog(false)
      setForm(defaultFormState)
      await refetch()
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
        permission_ids: form.permissionIds,
      })
      toast.success("Role updated successfully")
      setShowEditDialog(false)
      setSelectedRole(null)
      await refetch()
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
      key: "permissions",
      label: "Permissions",
      sortable: false,
      render: (_: unknown, row: Role) => {
        const count = row.permissions?.length ?? 0
        return (
          <Badge
            variant="outline"
            className={
              count > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-normal"
                : "border-gray-200 bg-gray-50 text-gray-400 font-normal"
            }
          >
            <KeyRound className="mr-1 h-3 w-3" />
            {count} {count === 1 ? "perm" : "perms"}
          </Badge>
        )
      },
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
                <p className="text-sm text-gray-500">Create roles, assign permissions, update details, and manage user assignments.</p>
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

      {/* Create Role Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>Add a new system role and assign permissions.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="flex flex-col flex-1 min-h-0 overflow-hidden gap-4 py-2">
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              <div className="space-y-2">
                <Label htmlFor="role-name">Name</Label>
                <Input
                  id="role-name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="e.g. Payroll Reviewer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Describe what this role can do"
                  rows={2}
                />
              </div>
              <PermissionSelector
                selectedIds={form.permissionIds}
                onChange={(ids) => setForm((prev) => ({ ...prev, permissionIds: ids }))}
                permissions={allPermissions}
                isLoading={isLoadingPermissions}
              />
            </div>
            <DialogFooter className="pt-3 border-t">
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

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the selected role details and permissions.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="flex flex-col flex-1 min-h-0 overflow-hidden gap-4 py-2">
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
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
                  rows={2}
                />
              </div>
              <PermissionSelector
                selectedIds={form.permissionIds}
                onChange={(ids) => setForm((prev) => ({ ...prev, permissionIds: ids }))}
                permissions={allPermissions}
                isLoading={isLoadingPermissions}
              />
            </div>
            <DialogFooter className="pt-3 border-t">
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

      {/* View Role Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle>Role Details</DialogTitle>
            <DialogDescription>Full details and permissions for the selected role.</DialogDescription>
          </DialogHeader>
          {selectedRoleDetail ? (
            <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
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
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Assigned Permissions</p>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-normal">
                    {selectedRoleDetail.permissions?.length ?? 0} total
                  </Badge>
                </div>
                {selectedRoleDetail.permissions && selectedRoleDetail.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 border rounded-xl bg-gray-50/60">
                    {selectedRoleDetail.permissions.map((perm) => (
                      <Badge
                        key={perm.id}
                        variant="secondary"
                        className="bg-white border border-gray-200 text-gray-800 text-xs py-1 px-2 flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="font-medium">{perm.name}</span>
                        {perm.resource && (
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded">
                            {perm.resource}
                          </span>
                        )}
                        {perm.action && (
                          <Badge className={`text-[9px] py-0 px-1 ${permissionBadgeClass(perm.action)}`}>
                            {perm.action}
                          </Badge>
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No permissions assigned to this role.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Assignment Dialog */}
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
