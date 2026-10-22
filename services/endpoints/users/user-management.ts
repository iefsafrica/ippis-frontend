import api from "@/services/axios"
import type {
  ApprovalRole,
  AuditEvent,
  BulkRoleActionRequest,
  BulkRoleOutcomeReport,
  BulkRolePreview,
  ChangeUserStatusRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserAccount,
  UserFilterParams,
  UserImportResult,
  UserImportRow,
  UserStatus,
} from "@/types/user-management"
import type { Role } from "@/types/roles"
import type { Permission } from "@/types/permissions"

// Cache keys for resilient offline fallback
const STORAGE_USERS_KEY = "ippis_admin_users_cache_v1"
const STORAGE_AUDIT_KEY = "ippis_admin_audit_logs_v1"

// Fallback seed roles if API is unreachable
const INITIAL_ROLES: Role[] = [
  { id: 1, name: "Super Administrator", description: "Full root access across all modules, MDAs, and configurations" },
  { id: 2, name: "MDA Administrator", description: "Administrative access restricted to assigned MDA operations" },
  { id: 3, name: "Payroll Officer", description: "Can compute, review, and initiate salary disbursements" },
  { id: 4, name: "Payroll Approver", description: "Authorised to sign off and approve final payroll batches" },
  { id: 5, name: "HR Manager", description: "Manages employee records, promotions, leaves, and attendance" },
  { id: 6, name: "Auditor", description: "Read-only compliance and audit log review access" },
]

// Fallback seed MDAs if API is unreachable
const INITIAL_MDAS = [
  { id: 1, name: "Federal Ministry of Finance", code: "FMF" },
  { id: 2, name: "Office of the Head of the Civil Service (OHCSF)", code: "OHCSF" },
  { id: 3, name: "Office of the Accountant General of the Federation", code: "OAGF" },
  { id: 4, name: "Federal Ministry of Health", code: "FMOH" },
  { id: 5, name: "Federal Ministry of Education", code: "FMOE" },
  { id: 6, name: "Federal Ministry of Information", code: "FMI" },
]

// Fallback seed departments
const INITIAL_DEPARTMENTS: Record<number, { id: number; name: string }[]> = {
  1: [
    { id: 101, name: "Revenue & Tax Policy" },
    { id: 102, name: "Fiscal Accounts" },
    { id: 103, name: "Budget Planning" },
  ],
  2: [
    { id: 201, name: "Establishments & Industrial Relations" },
    { id: 202, name: "Public Service Reforms" },
    { id: 203, name: "Employee Welfare" },
  ],
  3: [
    { id: 301, name: "IPPIS Central Operations" },
    { id: 302, name: "Consolidated Accounts" },
    { id: 303, name: "Treasury Operations" },
  ],
  4: [
    { id: 401, name: "Hospital Services" },
    { id: 402, name: "Public Health" },
  ],
  5: [
    { id: 501, name: "Tertiary Education" },
    { id: 502, name: "Basic & Secondary Education" },
  ],
  6: [
    { id: 601, name: "Information Management" },
    { id: 602, name: "Public Communication" },
  ],
}

// Helper to extract an informative error message from Axios / backend
const extractErrorMessage = (err: any, defaultMessage: string): string => {
  if (err?.response?.data?.message) return err.response.data.message
  if (err?.response?.data?.error) return err.response.data.error
  if (typeof err?.response?.data === "string") return err.response.data
  if (err?.message) return err.message
  return defaultMessage
}

// Normalizer to guarantee consistent UserAccount structure across backend schema variations
export const normalizeUserAccount = (raw: any): UserAccount => {
  const rolesList: Role[] = Array.isArray(raw.roles)
    ? raw.roles.map((r: any) => ({
        id: Number(r.id || r.role_id || 1),
        name: r.name || r.role_name || "User",
        description: r.description || "",
      }))
    : raw.role
    ? [{ id: 1, name: String(raw.role) }]
    : []

  const roleIds: (string | number)[] = Array.isArray(raw.role_ids) && raw.role_ids.length > 0
    ? raw.role_ids
    : rolesList.map((r) => r.id)

  const rawStatus = (raw.status || (raw.is_active === false ? "deactivated" : "active")) as string
  const validStatus: UserStatus = ["active", "suspended", "deactivated", "pending"].includes(rawStatus)
    ? (rawStatus as UserStatus)
    : "active"

  const rawApprovalRole = raw.approval_role || raw.reviewer_role
  let approvalRole: ApprovalRole = "none"
  if (rawApprovalRole === "approval_and_reviewer" || rawApprovalRole === "final_reviewer" || rawApprovalRole === "none") {
    approvalRole = rawApprovalRole
  } else if (rolesList.some((r) => r.name.toLowerCase().includes("final reviewer") || r.name.toLowerCase().includes("superadmin") || r.name.toLowerCase().includes("super administrator"))) {
    approvalRole = "final_reviewer"
  } else if (rolesList.some((r) => r.name.toLowerCase().includes("approver") || r.name.toLowerCase().includes("reviewer"))) {
    approvalRole = "approval_and_reviewer"
  }

  return {
    id: raw.id,
    username: raw.username || "",
    email: raw.email || "",
    full_name: raw.full_name || raw.name || raw.username || "System User",
    staff_id: raw.staff_id || `IPPIS-STAFF-${raw.id}`,
    phone: raw.phone || "",
    status: validStatus,
    roles: rolesList,
    role_ids: roleIds,
    mda_id: raw.mda_id ?? raw.company_id ?? undefined,
    mda_name: raw.mda_name || raw.company_name || "",
    department_id: raw.department_id ?? undefined,
    department_name: raw.department_name || "",
    scope_level: raw.scope_level || "assigned_mda",
    approval_role: approvalRole,
    reviewer_role: approvalRole,
    accessible_modules: Array.isArray(raw.accessible_modules) ? raw.accessible_modules : [],
    effective_permissions: Array.isArray(raw.effective_permissions) ? raw.effective_permissions : undefined,
    last_login: raw.last_login || undefined,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  }
}

// ----------------- LIVE EXPORTED API METHODS -----------------

/**
 * Fetch available roles from live Render backend
 */
export const getAvailableRoles = async (): Promise<Role[]> => {
  try {
    const res = await api.get<any>("/roles")
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.roles)
      ? res.data.roles
      : []

    if (list.length > 0) {
      return list.map((r: any) => ({
        id: Number(r.id),
        name: r.name || r.role_name,
        description: r.description || "",
      }))
    }
  } catch (err) {
    console.warn("Could not load roles from /roles, trying fallback", err)
  }
  return INITIAL_ROLES
}

/**
 * Fetch seeded Federal MDAs & Companies from live Render backend
 */
export const getAvailableMdas = async (): Promise<{ id: number; name: string; code: string }[]> => {
  try {
    const res = await api.get<any>("/admin/organization/company")
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.companies)
      ? res.data.companies
      : []

    if (list.length > 0) {
      return list.map((c: any) => ({
        id: Number(c.id),
        name: c.name || c.company_name || "Unknown MDA",
        code: c.code || c.company_code || c.name || `MDA-${c.id}`,
      }))
    }
  } catch (err) {
    console.warn("Could not load MDAs from /admin/organization/company", err)
  }
  return INITIAL_MDAS
}

/**
 * Fetch departments for a given MDA/Company from live Render backend
 */
export const getDepartmentsForMda = async (
  mdaId: number | string
): Promise<{ id: number; name: string }[]> => {
  const id = Number(mdaId)
  if (!id) return []

  try {
    const res = await api.get<any>("/admin/organization/department", {
      params: { company_id: id },
    })
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.departments)
      ? res.data.departments
      : []

    if (list.length > 0) {
      return list.map((d: any) => ({
        id: Number(d.id),
        name: d.name || d.department_name || "Department",
      }))
    }
  } catch (err) {
    console.warn(`Could not load departments for MDA ${id}`, err)
  }

  return INITIAL_DEPARTMENTS[id] || []
}

/**
 * USR07: Search, filter, and fetch users from live Render backend endpoint (/api/users/admin)
 */
export const fetchUsers = async (
  params?: UserFilterParams
): Promise<{ users: UserAccount[]; total: number }> => {
  try {
    const queryParams: Record<string, any> = {}

    if (params?.search?.trim()) queryParams.search = params.search.trim()
    if (params?.role && params.role !== "all") queryParams.role = params.role
    if (params?.status && params.status !== "all") queryParams.status = params.status
    if (params?.mda_id && params.mda_id !== "all") queryParams.mda_id = params.mda_id
    if (params?.department_id && params.department_id !== "all") queryParams.department_id = params.department_id
    if (params?.page) queryParams.page = params.page
    if (params?.limit) queryParams.limit = params.limit

    const res = await api.get<any>("/users/admin", { params: queryParams })
    const payload = res.data

    let rawUsers: any[] = []
    let totalCount = 0

    if (Array.isArray(payload)) {
      rawUsers = payload
      totalCount = payload.length
    } else if (Array.isArray(payload?.data)) {
      rawUsers = payload.data
      totalCount = payload.total ?? payload.data.length
    } else if (Array.isArray(payload?.data?.users)) {
      rawUsers = payload.data.users
      totalCount = payload.data.total ?? payload.data.users.length
    } else if (Array.isArray(payload?.users)) {
      rawUsers = payload.users
      totalCount = payload.total ?? payload.users.length
    }

    const normalized = rawUsers.map(normalizeUserAccount)

    // Save to local cache for resilient offline reference
    if (typeof window !== "undefined" && normalized.length > 0) {
      try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(normalized))
      } catch {}
    }

    return {
      users: normalized,
      total: totalCount || normalized.length,
    }
  } catch (err: any) {
    console.error("Live fetchUsers failed from Render backend:", err)

    // Fall back to cached users if network is unreachable
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_USERS_KEY)
        if (raw) {
          const cached = JSON.parse(raw) as UserAccount[]
          return { users: cached, total: cached.length }
        }
      } catch {}
    }

    throw new Error(extractErrorMessage(err, "Failed to fetch users from server"))
  }
}

/**
 * USR01, USR04, USR05: Create individual user account on live Render backend (POST /api/users/admin)
 */
export const createUserAccount = async (payload: CreateUserRequest): Promise<UserAccount> => {
  try {
    const res = await api.post<any>("/users/admin", {
      username: payload.username,
      email: payload.email,
      full_name: payload.full_name,
      password: payload.password,
      staff_id: payload.staff_id,
      phone: payload.phone,
      role_ids: payload.role_ids,
      mda_id: payload.mda_id ? Number(payload.mda_id) : undefined,
      department_id: payload.department_id ? Number(payload.department_id) : undefined,
      scope_level: payload.scope_level,
      status: payload.status,
      notes: payload.notes,
      approval_role: payload.approval_role,
    })

    const data = res.data?.data || res.data?.user || res.data
    const createdUser = normalizeUserAccount({
      ...data,
      approval_role: data?.approval_role || payload.approval_role,
    })

    // Update local cache
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_USERS_KEY)
        const current: UserAccount[] = raw ? JSON.parse(raw) : []
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify([createdUser, ...current]))
      } catch {}
    }

    return createdUser
  } catch (err: any) {
    console.error("createUserAccount failed on Render backend:", err)
    throw new Error(extractErrorMessage(err, "Failed to create user account on server"))
  }
}

/**
 * USR01, USR04, USR05, USR09: Update user account with mandatory reason (PATCH /api/users/admin)
 */
export const updateUserAccount = async (payload: UpdateUserRequest): Promise<UserAccount> => {
  if (!payload.reason || !payload.reason.trim()) {
    throw new Error("A justification reason is required for sensitive account modifications (USR09)")
  }

  try {
    const res = await api.patch<any>("/users/admin", {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      full_name: payload.full_name,
      staff_id: payload.staff_id,
      phone: payload.phone,
      role_ids: payload.role_ids,
      mda_id: payload.mda_id ? Number(payload.mda_id) : undefined,
      department_id: payload.department_id ? Number(payload.department_id) : undefined,
      scope_level: payload.scope_level,
      status: payload.status,
      password: payload.password,
      reason: payload.reason,
      approval_role: payload.approval_role,
    })

    const data = res.data?.data || res.data?.user || res.data
    const updatedUser = normalizeUserAccount({
      ...data,
      approval_role: data?.approval_role || payload.approval_role,
    })

    // Sync cache
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_USERS_KEY)
        if (raw) {
          const current: UserAccount[] = JSON.parse(raw)
          const idx = current.findIndex((u) => String(u.id) === String(updatedUser.id))
          if (idx !== -1) {
            current[idx] = updatedUser
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(current))
          }
        }
      } catch {}
    }

    return updatedUser
  } catch (err: any) {
    console.error("updateUserAccount failed on Render backend:", err)
    throw new Error(extractErrorMessage(err, "Failed to update user account"))
  }
}

/**
 * USR06, USR09: Account activation, suspension, and deactivation (PATCH /api/users/admin)
 */
export const changeUserStatus = async (payload: ChangeUserStatusRequest): Promise<UserAccount> => {
  if (!payload.reason || !payload.reason.trim()) {
    throw new Error("A justification reason is required to alter user account status (USR09)")
  }

  try {
    const res = await api.patch<any>("/users/admin", {
      id: payload.user_id,
      status: payload.status,
      reason: payload.reason,
      suspension_days: payload.suspension_days,
    })

    const data = res.data?.data || res.data?.user || res.data
    const updatedUser = normalizeUserAccount(data)

    // Sync cache
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_USERS_KEY)
        if (raw) {
          const current: UserAccount[] = JSON.parse(raw)
          const idx = current.findIndex((u) => String(u.id) === String(updatedUser.id))
          if (idx !== -1) {
            current[idx] = updatedUser
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(current))
          }
        }
      } catch {}
    }

    return updatedUser
  } catch (err: any) {
    console.error("changeUserStatus failed on Render backend:", err)
    throw new Error(extractErrorMessage(err, "Failed to update account lifecycle status"))
  }
}

/**
 * Soft-delete / deactivate user account (DELETE /api/users/admin)
 */
export const deleteUserAccount = async (id: string | number, reason?: string): Promise<{ success: boolean }> => {
  try {
    const res = await api.delete<any>("/users/admin", {
      params: { id, reason: reason || "Administrative soft-deactivation" },
    })

    // Remove from local cache
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_USERS_KEY)
        if (raw) {
          const current: UserAccount[] = JSON.parse(raw)
          localStorage.setItem(
            STORAGE_USERS_KEY,
            JSON.stringify(current.filter((u) => String(u.id) !== String(id)))
          )
        }
      } catch {}
    }

    return { success: true }
  } catch (err: any) {
    console.error("deleteUserAccount failed on Render backend:", err)
    throw new Error(extractErrorMessage(err, "Failed to delete user account"))
  }
}

/**
 * USR10: Preview bulk role assignment or revocation (POST /api/users/admin/bulk-role with action: "preview")
 */
export const previewBulkRoleAction = async (payload: {
  user_ids: (string | number)[]
  role_id: string | number
  action: "assign" | "revoke"
}): Promise<BulkRolePreview> => {
  try {
    const res = await api.post<any>("/users/admin/bulk-role", {
      user_ids: payload.user_ids,
      role_id: payload.role_id,
      role_action: payload.action,
      action: "preview",
    })

    const data = res.data?.data || res.data
    return data as BulkRolePreview
  } catch (err: any) {
    console.error("previewBulkRoleAction failed on Render backend:", err)
    throw new Error(extractErrorMessage(err, "Failed to preview bulk role modification"))
  }
}

/**
 * USR10: Execute bulk role assignment/revocation (POST /api/users/admin/bulk-role with action: "execute")
 */
export const executeBulkRoleAction = async (payload: BulkRoleActionRequest): Promise<BulkRoleOutcomeReport> => {
  if (!payload.reason || !payload.reason.trim()) {
    throw new Error("A justification reason is required for bulk role operations (USR09, USR10)")
  }

  try {
    const res = await api.post<any>("/users/admin/bulk-role", {
      user_ids: payload.user_ids,
      role_id: payload.role_id,
      role_action: payload.action,
      action: "execute",
      reason: payload.reason,
    })

    const data = res.data?.data || res.data
    return data as BulkRoleOutcomeReport
  } catch (err: any) {
    console.error("executeBulkRoleAction failed on Render backend:", err)
    throw new Error(extractErrorMessage(err, "Failed to execute bulk role action on server"))
  }
}

/**
 * USR02, USR03: Ingest, validate and import users via CSV on Render backend (POST /api/users/admin/import)
 */
export const validateAndImportUsersCsv = async (
  csvContent: string,
  options: { dryRun?: boolean; reason?: string } = {}
): Promise<UserImportResult> => {
  if (!csvContent || !csvContent.trim()) {
    throw new Error("CSV file content is empty")
  }

  try {
    const res = await api.post<any>("/users/admin/import", {
      csvContent,
      dryRun: options.dryRun ?? false,
      reason: options.reason || "Bulk user import cohort",
    })

    const data = res.data?.data || res.data

    return {
      total: Number(data.total ?? data.records?.length ?? 0),
      valid: Number(data.valid ?? 0),
      invalid: Number(data.invalid ?? data.failed ?? 0),
      imported: Number(data.imported ?? 0),
      failed: Number(data.failed ?? data.invalid ?? 0),
      records: Array.isArray(data.records) ? data.records : [],
    }
  } catch (err: any) {
    console.error("validateAndImportUsersCsv failed on Render backend:", err)
    throw new Error(extractErrorMessage(err, "Failed to process bulk user import on server"))
  }
}

/**
 * USR08: Lookup effective permissions and accessible modules for a user (GET /api/users/admin/effective-access)
 */
export const getUserEffectiveAccess = async (user: UserAccount) => {
  try {
    const res = await api.get<any>("/users/admin/effective-access", {
      params: { id: user.id },
    })

    const data = res.data?.data || res.data

    return {
      user: data.user ? normalizeUserAccount(data.user) : user,
      modules: Array.isArray(data.modules) ? data.modules : [],
      granular_permissions: Array.isArray(data.granular_permissions) ? data.granular_permissions : [],
    }
  } catch (err: any) {
    console.warn("getUserEffectiveAccess failed on backend, computing client-side access:", err)

    // Compute deterministic role access mapping as fallback
    const roleNames = user.roles.map((r) => r.name.toLowerCase())
    const isSuper = roleNames.some((r) => r.includes("super"))
    const isPayroll = isSuper || roleNames.some((r) => r.includes("payroll"))
    const isHr = isSuper || roleNames.some((r) => r.includes("hr"))
    const isAuditor = isSuper || roleNames.some((r) => r.includes("audit"))
    const isMdaAdmin = isSuper || roleNames.some((r) => r.includes("mda admin"))

    const modules = [
      { name: "Dashboard & Analytics", accessible: true, access_level: "Full Access", resource: "dashboard" },
      {
        name: "Employee Management",
        accessible: isSuper || isHr || isMdaAdmin,
        access_level: isSuper || isHr ? "Full Management" : isMdaAdmin ? "MDA Scope Only" : "Read Only",
        resource: "employees",
      },
      {
        name: "Payroll Operations",
        accessible: isPayroll,
        access_level: roleNames.some((r) => r.includes("approver")) ? "Approval & Initiation" : "Calculation Only",
        resource: "payroll",
      },
      {
        name: "Core HR & Approvals",
        accessible: isSuper || isHr || isMdaAdmin,
        access_level: isSuper ? "Universal Approval" : "Department Scope",
        resource: "core-hr",
      },
      {
        name: "Finance & Accounts",
        accessible: isSuper || isPayroll,
        access_level: isSuper ? "Full Access" : "Disbursement Ledger",
        resource: "finance",
      },
      {
        name: "HR Reports & Compliance",
        accessible: true,
        access_level: isAuditor ? "Full Audit Read-Out" : "Operational Reports",
        resource: "hr-reports",
      },
      {
        name: "User Management & Security",
        accessible: isSuper,
        access_level: isSuper ? "Full Administration" : "No Access",
        resource: "users",
      },
      {
        name: "Role & Permission Configuration",
        accessible: isSuper,
        access_level: isSuper ? "Full Administration" : "No Access",
        resource: "permissions",
      },
    ]

    const granularPermissions: Permission[] = []

    user.roles.forEach((role) => {
      const rName = role.name.toLowerCase()
      if (rName.includes("super")) {
        granularPermissions.push({
          id: 1,
          name: "All Operations",
          resource: "*",
          action: "manage",
          description: "Superadministrator unrestricted privilege",
        })
      }
      if (rName.includes("payroll")) {
        granularPermissions.push(
          { id: 2, name: "Compute Salary", resource: "payroll", action: "create", description: "Batch payroll calculations" },
          { id: 3, name: "Approve Payroll Batch", resource: "payroll", action: "approve", description: "Final disbursement signoff" }
        )
      }
      if (rName.includes("hr")) {
        granularPermissions.push(
          { id: 4, name: "Create Employee Record", resource: "employees", action: "create", description: "Register new personnel" },
          { id: 5, name: "Promote Personnel", resource: "promotions", action: "update", description: "Execute staff promotions" }
        )
      }
    })

    return {
      user,
      modules,
      granular_permissions: granularPermissions,
    }
  }
}

/**
 * USR09: Fetch administrative audit trails from live Render backend (GET /api/users/admin/audit)
 */
export const fetchAuditEvents = async (search?: string): Promise<AuditEvent[]> => {
  try {
    const res = await api.get<any>("/users/admin/audit", {
      params: { search: search?.trim() || undefined, limit: 100 },
    })

    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.events)
      ? res.data.events
      : []

    if (list.length > 0) {
      return list.map((l: any) => ({
        id: String(l.id || `AUD-${Date.now()}`),
        timestamp: l.timestamp || l.created_at || new Date().toISOString(),
        actor_name: l.actor_name || l.actor_user_name || "Administrator",
        actor_id: l.actor_id || l.actor_user_id || undefined,
        action: l.action || "UPDATE_USER",
        target_user_id: l.target_user_id || "",
        target_user_name: l.target_user_name || "",
        reason: l.reason || "",
        details: typeof l.details === "object" ? l.details : {},
      }))
    }
  } catch (err: any) {
    console.warn("fetchAuditEvents failed from Render backend:", err)
  }

  // Fallback to local storage audit logs if API was unreachable
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_AUDIT_KEY)
      if (raw) {
        return JSON.parse(raw) as AuditEvent[]
      }
    } catch {}
  }

  return []
}
