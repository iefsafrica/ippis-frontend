"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  fetchUsers,
  getAvailableMdas,
  getAvailableRoles,
  getDepartmentsForMda,
} from "@/services/endpoints/users/user-management"
import type { UserAccount, UserFilterParams, UserStatus } from "@/types/user-management"
import type { Role } from "@/types/roles"
import { CreateUserDialog } from "./components/create-user-dialog"
import { EditUserDialog } from "./components/edit-user-dialog"
import { StatusChangeDialog } from "./components/status-change-dialog"
import { BulkImportDialog } from "./components/bulk-import-dialog"
import { BulkRoleDialog } from "./components/bulk-role-dialog"
import { EffectiveAccessDrawer } from "./components/effective-access-drawer"
import { AuditTrailDialog } from "./components/audit-trail-dialog"
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  History,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserMinus,
  UserPlus,
  Users,
  UserX,
} from "lucide-react"

export function UsersContent() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [mdas, setMdas] = useState<{ id: number; name: string; code: string }[]>([])
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])

  // Search & Filters (USR07)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all")
  const [mdaFilter, setMdaFilter] = useState("all")
  const [deptFilter, setDeptFilter] = useState("all")

  // Modals state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false)
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false)
  const [showEffectiveAccessDrawer, setShowEffectiveAccessDrawer] = useState(false)
  const [showAuditTrailDialog, setShowAuditTrailDialog] = useState(false)

  // Selection state
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [targetStatus, setTargetStatus] = useState<UserStatus | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersRes, rolesRes, mdasRes] = await Promise.all([
        fetchUsers({
          search,
          role: roleFilter,
          status: statusFilter,
          mda_id: mdaFilter,
          department_id: deptFilter,
        }),
        getAvailableRoles(),
        getAvailableMdas(),
      ])

      setUsers(usersRes.users)
      setRoles(rolesRes)
      setMdas(mdasRes)
    } catch (err: any) {
      toast.error("Failed to load user management data", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [search, roleFilter, statusFilter, mdaFilter, deptFilter])

  useEffect(() => {
    if (mdaFilter !== "all") {
      getDepartmentsForMda(mdaFilter).then(setDepartments)
    } else {
      setDepartments([])
      setDeptFilter("all")
    }
  }, [mdaFilter])

  // Metric stats
  const metrics = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.status === "active").length
    const suspended = users.filter((u) => u.status === "suspended").length
    const deactivated = users.filter((u) => u.status === "deactivated").length
    const superAdmins = users.filter((u) =>
      u.roles.some((r) => r.name.toLowerCase().includes("super"))
    ).length

    return { total, active, suspended, deactivated, superAdmins }
  }, [users])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map((u) => u.id))
    } else {
      setSelectedUserIds([])
    }
  }

  const handleToggleSelectUser = (id: string | number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleOpenStatusModal = (user: UserAccount, status: UserStatus) => {
    setSelectedUser(user)
    setTargetStatus(status)
    setShowStatusDialog(true)
  }

  const handleOpenEditModal = (user: UserAccount) => {
    setSelectedUser(user)
    setShowEditDialog(true)
  }

  const handleOpenAccessDrawer = (user: UserAccount) => {
    setSelectedUser(user)
    setShowEffectiveAccessDrawer(true)
  }

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-none font-semibold text-[11px] px-2.5 py-0.5">
            <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Active
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-none font-semibold text-[11px] px-2.5 py-0.5">
            <AlertCircle className="h-3 w-3 mr-1 inline" /> Suspended
          </Badge>
        )
      case "deactivated":
        return (
          <Badge className="bg-red-100 text-red-800 border-none font-semibold text-[11px] px-2.5 py-0.5">
            <UserX className="h-3 w-3 mr-1 inline" /> Deactivated
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-none font-semibold text-[11px] px-2.5 py-0.5">
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleExportCsv = () => {
    const headers = ["ID", "Username", "Email", "FullName", "StaffID", "Status", "Roles", "MDA", "Scope"]
    const rows = users.map((u) => [
      u.id,
      u.username,
      u.email,
      `"${u.full_name}"`,
      u.staff_id,
      u.status,
      `"${u.roles.map((r) => r.name).join(", ")}"`,
      `"${u.mda_name || ""}"`,
      u.scope_level,
    ])
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `ippis_users_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Export Complete", { description: "Users list exported to CSV." })
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management & Security</h1>
            <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 text-xs">
              Granular RBAC + Scopes (USR01–USR10)
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Authorised user provisioning, multi-role assignments, MDA scoping, lifecycle controls, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAuditTrailDialog(true)}
            className="flex items-center gap-1.5 border-gray-300 hover:bg-gray-100 text-xs"
          >
            <History className="h-4 w-4 text-gray-600" />
            Audit Trail (USR09)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkRoleDialog(true)}
            className="flex items-center gap-1.5 border-gray-300 hover:bg-gray-100 text-xs"
          >
            <Users className="h-4 w-4 text-emerald-600" />
            Bulk Roles (USR10)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkImportDialog(true)}
            className="flex items-center gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Bulk Import (USR02)
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1.5 bg-[#008751] hover:bg-[#008751]/90 text-white text-xs"
          >
            <Plus className="h-4 w-4" />
            Create User (USR01)
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-xs border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Total User Accounts</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.total}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Across all federal MDAs</p>
            </div>
            <div className="p-3 bg-emerald-50 text-[#008751] rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Active Authorized</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">{metrics.active}</h3>
              <p className="text-[11px] text-emerald-600 mt-0.5">With login authorization</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Suspended / Inactive</p>
              <h3 className="text-2xl font-bold text-amber-700 mt-1">
                {metrics.suspended + metrics.deactivated}
              </h3>
              <p className="text-[11px] text-amber-600 mt-0.5">{metrics.suspended} suspended, {metrics.deactivated} deactivated</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Super Administrators</p>
              <h3 className="text-2xl font-bold text-purple-700 mt-1">{metrics.superAdmins}</h3>
              <p className="text-[11px] text-purple-600 mt-0.5">Unrestricted root scope</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar (USR07) */}
      <div className="p-4 rounded-xl border bg-white shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, staff ID, username, email... (USR07)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[150px] text-xs">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
              <SelectTrigger className="w-full sm:w-[130px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* MDA Filter */}
            <Select value={mdaFilter} onValueChange={setMdaFilter}>
              <SelectTrigger className="w-full sm:w-[160px] text-xs">
                <SelectValue placeholder="MDA Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All MDAs</SelectItem>
                {mdas.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.code} - {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select
              value={deptFilter}
              onValueChange={setDeptFilter}
              disabled={mdaFilter === "all" || departments.length === 0}
            >
              <SelectTrigger className="w-full sm:w-[150px] text-xs">
                <SelectValue placeholder={mdaFilter === "all" ? "Select MDA first" : "All Depts"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              title="Refresh users"
              className="h-9 w-9"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 text-xs whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>

        {selectedUserIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <span className="text-emerald-900 font-medium">
              {selectedUserIds.length} user account(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBulkRoleDialog(true)}
                className="bg-white border-emerald-300 text-emerald-800 text-xs h-7"
              >
                Apply Bulk Role Action (USR10)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedUserIds([])}
                className="text-gray-500 hover:text-gray-700 text-xs h-7"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users Data Table */}
      <div className="border rounded-xl bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 text-left w-10">
                  <Checkbox
                    checked={selectedUserIds.length === users.length && users.length > 0}
                    onCheckedChange={(c) => handleSelectAll(!!c)}
                  />
                </th>
                <th className="p-3.5 text-left">User / Staff ID</th>
                <th className="p-3.5 text-left">Official Contact</th>
                <th className="p-3.5 text-left">Assigned Roles (USR04)</th>
                <th className="p-3.5 text-left">MDA & Department Scope (USR05)</th>
                <th className="p-3.5 text-left">Status (USR06)</th>
                <th className="p-3.5 text-left">Last Active</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isSelected = selectedUserIds.includes(user.id)
                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50/80 transition-colors ${isSelected ? "bg-emerald-50/30" : ""}`}
                  >
                    <td className="p-3.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelectUser(user.id)}
                      />
                    </td>

                    {/* User / Staff ID */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#008751] font-bold flex items-center justify-center text-xs">
                          {user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                            {user.full_name}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono flex items-center gap-2">
                            <span>ID: {user.staff_id}</span>
                            <span>&bull;</span>
                            <span>@{user.username}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-3.5">
                      <div className="text-gray-900">{user.email}</div>
                      <div className="text-[11px] text-gray-500">{user.phone || "—"}</div>
                    </td>

                    {/* Roles (USR04) */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 flex-wrap max-w-[220px]">
                        {user.roles.map((role) => (
                          <Badge
                            key={role.id}
                            variant="outline"
                            className="text-[10px] bg-emerald-50 text-[#008751] border-emerald-200"
                          >
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    {/* Scope (USR05) */}
                    <td className="p-3.5">
                      <div className="font-medium text-gray-900 truncate max-w-[220px]" title={user.mda_name}>
                        {user.mda_name || "Federal Central"}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Building2 className="h-3 w-3" />
                        <span>{user.department_name || "All Departments"}</span>
                        <Badge variant="outline" className="text-[9px] capitalize px-1 py-0">
                          {user.scope_level.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </td>

                    {/* Status (USR06) */}
                    <td className="p-3.5">{getStatusBadge(user.status)}</td>

                    {/* Last Active */}
                    <td className="p-3.5 text-gray-500 text-[11px]">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : "Never"}
                    </td>

                    {/* Actions Menu */}
                    <td className="p-3.5 text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 text-xs">
                          <DropdownMenuLabel className="text-[11px] text-gray-500">
                            Account: {user.username}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleOpenAccessDrawer(user)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="h-4 w-4 text-emerald-600" />
                            View Effective Access (USR08)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenEditModal(user)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                            Edit Profile & Scopes (USR04, 05)
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuLabel className="text-[11px] text-gray-500">
                            Lifecycle Controls (USR06, 09)
                          </DropdownMenuLabel>

                          {user.status !== "active" && (
                            <DropdownMenuItem
                              onClick={() => handleOpenStatusModal(user, "active")}
                              className="flex items-center gap-2 cursor-pointer text-emerald-700"
                            >
                              <UserCheck className="h-4 w-4" />
                              Reactivate Account
                            </DropdownMenuItem>
                          )}

                          {user.status !== "suspended" && (
                            <DropdownMenuItem
                              onClick={() => handleOpenStatusModal(user, "suspended")}
                              className="flex items-center gap-2 cursor-pointer text-amber-700"
                            >
                              <ShieldAlert className="h-4 w-4" />
                              Suspend Account
                            </DropdownMenuItem>
                          )}

                          {user.status !== "deactivated" && (
                            <DropdownMenuItem
                              onClick={() => handleOpenStatusModal(user, "deactivated")}
                              className="flex items-center gap-2 cursor-pointer text-red-600"
                            >
                              <UserX className="h-4 w-4" />
                              Deactivate Account
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setShowAuditTrailDialog(true)
                            }}
                            className="flex items-center gap-2 cursor-pointer text-gray-700"
                          >
                            <History className="h-4 w-4" />
                            View Account Audit History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}

              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No user accounts found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Modals */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => loadData()}
      />

      <EditUserDialog
        user={selectedUser}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => loadData()}
      />

      <StatusChangeDialog
        user={selectedUser}
        targetStatus={targetStatus}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onSuccess={() => loadData()}
      />

      <BulkImportDialog
        open={showBulkImportDialog}
        onOpenChange={setShowBulkImportDialog}
        onSuccess={() => loadData()}
      />

      <BulkRoleDialog
        users={users}
        open={showBulkRoleDialog}
        onOpenChange={setShowBulkRoleDialog}
        onSuccess={() => loadData()}
      />

      <EffectiveAccessDrawer
        user={selectedUser}
        open={showEffectiveAccessDrawer}
        onOpenChange={setShowEffectiveAccessDrawer}
      />

      <AuditTrailDialog
        open={showAuditTrailDialog}
        onOpenChange={setShowAuditTrailDialog}
        targetUserId={selectedUser?.id}
      />
    </div>
  )
}
