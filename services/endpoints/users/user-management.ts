import type {
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

const STORAGE_USERS_KEY = "ippis_admin_users_cache_v1"
const STORAGE_AUDIT_KEY = "ippis_admin_audit_logs_v1"

// Seed initial users for immediate rich demo and functional testing
const INITIAL_ROLES: Role[] = [
  { id: 1, name: "Super Administrator", description: "Full root access across all modules, MDAs, and configurations" },
  { id: 2, name: "MDA Administrator", description: "Administrative access restricted to assigned MDA operations" },
  { id: 3, name: "Payroll Officer", description: "Can compute, review, and initiate salary disbursements" },
  { id: 4, name: "Payroll Approver", description: "Authorised to sign off and approve final payroll batches" },
  { id: 5, name: "HR Manager", description: "Manages employee records, promotions, leaves, and attendance" },
  { id: 6, name: "Auditor", description: "Read-only compliance and audit log review access" },
]

const INITIAL_MDAS = [
  { id: 1, name: "Federal Ministry of Finance", code: "FMF" },
  { id: 2, name: "Office of the Head of the Civil Service (OHCSF)", code: "OHCSF" },
  { id: 3, name: "Office of the Accountant General of the Federation", code: "OAGF" },
  { id: 4, name: "Federal Ministry of Health", code: "FMOH" },
  { id: 5, name: "Federal Ministry of Education", code: "FMOE" },
  { id: 6, name: "Federal Ministry of Interior", code: "FMI" },
]

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
    { id: 601, name: "Immigration & Border Service" },
    { id: 602, name: "Civil Defence Affairs" },
  ],
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: "USR-001",
    username: "superadmin",
    email: "admin@ippis.gov.ng",
    full_name: "Babajide Adeleke",
    staff_id: "IPPIS-HQ-001",
    phone: "+234 803 123 4567",
    status: "active",
    roles: [INITIAL_ROLES[0]],
    role_ids: [1],
    mda_id: 3,
    mda_name: "Office of the Accountant General of the Federation",
    department_id: 301,
    department_name: "IPPIS Central Operations",
    scope_level: "all_mdas",
    accessible_modules: [
      "Dashboard",
      "Employees",
      "Core HR",
      "Payroll",
      "Finance",
      "Reports",
      "User Management",
      "Permissions",
      "Roles",
      "Settings",
    ],
    last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: "2025-01-15T08:00:00Z",
    updated_at: "2026-10-10T11:20:00Z",
  },
  {
    id: "USR-002",
    username: "fatima.sanusi",
    email: "f.sanusi@oagf.gov.ng",
    full_name: "Fatima Sanusi",
    staff_id: "OAGF-PAY-042",
    phone: "+234 802 987 6543",
    status: "active",
    roles: [INITIAL_ROLES[2], INITIAL_ROLES[3]],
    role_ids: [3, 4],
    mda_id: 3,
    mda_name: "Office of the Accountant General of the Federation",
    department_id: 301,
    department_name: "IPPIS Central Operations",
    scope_level: "all_mdas",
    accessible_modules: ["Dashboard", "Payroll", "Finance", "HR Reports"],
    last_login: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    created_at: "2025-03-01T10:00:00Z",
    updated_at: "2026-09-18T14:40:00Z",
  },
  {
    id: "USR-003",
    username: "emeka.okoye",
    email: "e.okoye@fmf.gov.ng",
    full_name: "Emeka Okoye",
    staff_id: "FMF-ADM-108",
    phone: "+234 814 555 0192",
    status: "active",
    roles: [INITIAL_ROLES[1], INITIAL_ROLES[4]],
    role_ids: [2, 5],
    mda_id: 1,
    mda_name: "Federal Ministry of Finance",
    department_id: 101,
    department_name: "Revenue & Tax Policy",
    scope_level: "assigned_mda",
    accessible_modules: ["Dashboard", "Employees", "Core HR", "HR Reports"],
    last_login: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: "2025-05-12T09:15:00Z",
    updated_at: "2026-08-11T16:00:00Z",
  },
  {
    id: "USR-004",
    username: "zainab.bello",
    email: "z.bello@ohcsf.gov.ng",
    full_name: "Zainab Bello",
    staff_id: "OHCSF-AUD-009",
    phone: "+234 805 444 8821",
    status: "active",
    roles: [INITIAL_ROLES[5]],
    role_ids: [6],
    mda_id: 2,
    mda_name: "Office of the Head of the Civil Service (OHCSF)",
    department_id: 202,
    department_name: "Public Service Reforms",
    scope_level: "all_mdas",
    accessible_modules: ["Dashboard", "HR Reports", "File Manager"],
    last_login: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    created_at: "2025-06-20T11:30:00Z",
    updated_at: "2026-07-02T13:10:00Z",
  },
  {
    id: "USR-005",
    username: "tunde.bakare",
    email: "t.bakare@fmoh.gov.ng",
    full_name: "Tunde Bakare",
    staff_id: "FMOH-HR-077",
    phone: "+234 807 333 1122",
    status: "suspended",
    roles: [INITIAL_ROLES[4]],
    role_ids: [5],
    mda_id: 4,
    mda_name: "Federal Ministry of Health",
    department_id: 401,
    department_name: "Hospital Services",
    scope_level: "department",
    accessible_modules: ["Dashboard", "Employees"],
    last_login: "2026-08-30T10:14:00Z",
    created_at: "2025-07-10T14:00:00Z",
    updated_at: "2026-09-01T09:00:00Z",
  },
  {
    id: "USR-006",
    username: "chinyere.ugwu",
    email: "c.ugwu@fmoe.gov.ng",
    full_name: "Chinyere Ugwu",
    staff_id: "FMOE-ADM-015",
    phone: "+234 809 111 2233",
    status: "deactivated",
    roles: [INITIAL_ROLES[1]],
    role_ids: [2],
    mda_id: 5,
    mda_name: "Federal Ministry of Education",
    department_id: 501,
    department_name: "Tertiary Education",
    scope_level: "assigned_mda",
    accessible_modules: [],
    last_login: "2026-05-14T12:00:00Z",
    created_at: "2025-02-18T09:00:00Z",
    updated_at: "2026-05-20T11:00:00Z",
  },
]

const DEFAULT_AUDIT_LOGS: AuditEvent[] = [
  {
    id: "AUD-1001",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actor_name: "Babajide Adeleke (Super Admin)",
    actor_id: "USR-001",
    action: "ROLE_ASSIGNMENT",
    target_user_id: "USR-002",
    target_user_name: "Fatima Sanusi",
    reason: "Promoted to Senior Payroll Approver per Civil Service Commission directive CSC/2026/04",
    details: { assigned_role: "Payroll Approver", previous_roles: ["Payroll Officer"] },
  },
  {
    id: "AUD-1002",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    actor_name: "Babajide Adeleke (Super Admin)",
    actor_id: "USR-001",
    action: "STATUS_CHANGE",
    target_user_id: "USR-005",
    target_user_name: "Tunde Bakare",
    reason: "Disciplinary query regarding unauthorized payroll data inquiry",
    details: { previous_status: "active", new_status: "suspended", suspension_duration_days: 14 },
  },
  {
    id: "AUD-1003",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    actor_name: "Babajide Adeleke (Super Admin)",
    actor_id: "USR-001",
    action: "SCOPE_CHANGE",
    target_user_id: "USR-003",
    target_user_name: "Emeka Okoye",
    reason: "Reassigned from Budget Office to Revenue & Tax Policy Department scope",
    details: { previous_scope: "Department Only", new_scope: "Assigned MDA (Full)" },
  },
]

// Helpers for localStorage sync
const getStoredUsers = (): UserAccount[] => {
  if (typeof window === "undefined") return DEFAULT_USERS
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS))
      return DEFAULT_USERS
    }
    return JSON.parse(raw) as UserAccount[]
  } catch {
    return DEFAULT_USERS
  }
}

const saveStoredUsers = (users: UserAccount[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))
  } catch (err) {
    console.error("Failed to save users to cache", err)
  }
}

const getStoredAuditLogs = (): AuditEvent[] => {
  if (typeof window === "undefined") return DEFAULT_AUDIT_LOGS
  try {
    const raw = localStorage.getItem(STORAGE_AUDIT_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(DEFAULT_AUDIT_LOGS))
      return DEFAULT_AUDIT_LOGS
    }
    return JSON.parse(raw) as AuditEvent[]
  } catch {
    return DEFAULT_AUDIT_LOGS
  }
}

const recordAuditEvent = (event: Omit<AuditEvent, "id" | "timestamp">) => {
  const currentLogs = getStoredAuditLogs()
  const newLog: AuditEvent = {
    ...event,
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
  }
  const updated = [newLog, ...currentLogs]
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error("Failed to save audit log", err)
    }
  }
  return newLog
}

// ----------------- EXPORTED SERVICE METHODS -----------------

export const getAvailableRoles = async (): Promise<Role[]> => {
  try {
    // Attempt backend fetch if accessible
    const res = await fetch("/api/roles", { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data?.data) && data.data.length > 0) {
        return data.data
      }
    }
  } catch (err) {
    // Fall back to seed
  }
  return INITIAL_ROLES
}

export const getAvailableMdas = async () => {
  return INITIAL_MDAS
}

export const getDepartmentsForMda = async (mdaId: number | string) => {
  const id = Number(mdaId)
  return INITIAL_DEPARTMENTS[id] || []
}

/**
 * USR07: Search and filter users by name, staff ID, role, status, MDA and department
 */
export const fetchUsers = async (params?: UserFilterParams): Promise<{ users: UserAccount[]; total: number }> => {
  // Check backend users/admin first if reachable
  try {
    const res = await fetch("/api/users/admin", { cache: "no-store" })
    if (res.ok) {
      const json = await res.json()
      if (json.success && json.data?.users?.length) {
        // Backend returned live users; merge with local rich attributes
        const liveUsers = json.data.users.map((u: any, idx: number) => ({
          id: String(u.id),
          username: u.username,
          email: u.email,
          full_name: u.full_name || u.username,
          staff_id: `IPPIS-STAFF-${1000 + u.id}`,
          phone: "+234 800 000 0000",
          status: (u.is_active ? "active" : "deactivated") as UserStatus,
          roles: [{ id: 1, name: u.role || "Admin" }],
          role_ids: [1],
          mda_name: "Office of the Accountant General of the Federation",
          department_name: "IPPIS Central Operations",
          scope_level: "all_mdas" as const,
          created_at: u.created_at || new Date().toISOString(),
          updated_at: u.updated_at || new Date().toISOString(),
          accessible_modules: ["Dashboard", "Employees", "Payroll"],
        }))

        // Cache live items if not already cached
        const current = getStoredUsers()
        if (current.length <= DEFAULT_USERS.length) {
          saveStoredUsers([...liveUsers, ...DEFAULT_USERS.slice(liveUsers.length)])
        }
      }
    }
  } catch {
    // Continue with client storage
  }

  let users = getStoredUsers()

  if (params?.search?.trim()) {
    const q = params.search.toLowerCase().trim()
    users = users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.staff_id.toLowerCase().includes(q)
    )
  }

  if (params?.status && params.status !== "all") {
    users = users.filter((u) => u.status === params.status)
  }

  if (params?.role && params.role !== "all") {
    users = users.filter((u) =>
      u.roles.some((r) => String(r.id) === String(params.role) || r.name.toLowerCase() === params.role?.toLowerCase())
    )
  }

  if (params?.mda_id && params.mda_id !== "all") {
    users = users.filter((u) => String(u.mda_id) === String(params.mda_id))
  }

  if (params?.department_id && params.department_id !== "all") {
    users = users.filter((u) => String(u.department_id) === String(params.department_id))
  }

  return {
    users,
    total: users.length,
  }
}

/**
 * USR01, USR04, USR05: Create individual user account through authorized workflow
 */
export const createUserAccount = async (payload: CreateUserRequest): Promise<UserAccount> => {
  // Forward to backend if available
  try {
    await fetch("/api/users/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: payload.username,
        email: payload.email,
        password: payload.password || "TempPassword123!",
        full_name: payload.full_name,
        role: "admin",
        is_active: payload.status === "active",
      }),
    })
  } catch (err) {
    console.warn("Backend user create endpoint unavailable, continuing with client state", err)
  }

  const allRoles = await getAvailableRoles()
  const assignedRoles = allRoles.filter((r) => payload.role_ids.map(String).includes(String(r.id)))

  const newUser: UserAccount = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    username: payload.username,
    email: payload.email,
    full_name: payload.full_name,
    staff_id: payload.staff_id,
    phone: payload.phone,
    status: payload.status,
    roles: assignedRoles.length > 0 ? assignedRoles : [INITIAL_ROLES[1]],
    role_ids: payload.role_ids,
    mda_id: payload.mda_id,
    mda_name: payload.mda_name,
    department_id: payload.department_id,
    department_name: payload.department_name,
    scope_level: payload.scope_level,
    accessible_modules: ["Dashboard", "Employees", "HR Reports"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const existing = getStoredUsers()
  const updated = [newUser, ...existing]
  saveStoredUsers(updated)

  // Record audit log (USR09)
  recordAuditEvent({
    actor_name: "Current Administrator",
    action: "CREATE_USER",
    target_user_id: newUser.id,
    target_user_name: newUser.full_name,
    reason: payload.notes || "Authorized initial account creation workflow",
    details: {
      staff_id: newUser.staff_id,
      roles: newUser.roles.map((r) => r.name),
      mda: newUser.mda_name,
      department: newUser.department_name,
      scope: newUser.scope_level,
    },
  })

  return newUser
}

/**
 * USR01, USR04, USR05, USR09: Update user account with mandatory reason
 */
export const updateUserAccount = async (payload: UpdateUserRequest): Promise<UserAccount> => {
  if (!payload.reason || !payload.reason.trim()) {
    throw new Error("A justification reason is required for sensitive account modifications (USR09)")
  }

  const allUsers = getStoredUsers()
  const index = allUsers.findIndex((u) => String(u.id) === String(payload.id))
  if (index === -1) {
    throw new Error("User account not found")
  }

  const currentUser = allUsers[index]
  const allRoles = await getAvailableRoles()

  let updatedRoles = currentUser.roles
  if (payload.role_ids) {
    updatedRoles = allRoles.filter((r) => payload.role_ids?.map(String).includes(String(r.id)))
  }

  const updatedUser: UserAccount = {
    ...currentUser,
    username: payload.username ?? currentUser.username,
    email: payload.email ?? currentUser.email,
    full_name: payload.full_name ?? currentUser.full_name,
    staff_id: payload.staff_id ?? currentUser.staff_id,
    phone: payload.phone ?? currentUser.phone,
    role_ids: payload.role_ids ?? currentUser.role_ids,
    roles: updatedRoles,
    mda_id: payload.mda_id ?? currentUser.mda_id,
    mda_name: payload.mda_name ?? currentUser.mda_name,
    department_id: payload.department_id ?? currentUser.department_id,
    department_name: payload.department_name ?? currentUser.department_name,
    scope_level: payload.scope_level ?? currentUser.scope_level,
    status: payload.status ?? currentUser.status,
    updated_at: new Date().toISOString(),
  }

  allUsers[index] = updatedUser
  saveStoredUsers(allUsers)

  // Try updating backend
  try {
    await fetch("/api/users/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        is_active: updatedUser.status === "active",
      }),
    })
  } catch (err) {
    console.warn("Backend update error:", err)
  }

  // Audit event (USR09)
  recordAuditEvent({
    actor_name: "Current Administrator",
    action: "UPDATE_USER",
    target_user_id: updatedUser.id,
    target_user_name: updatedUser.full_name,
    reason: payload.reason,
    details: {
      previous: {
        roles: currentUser.roles.map((r) => r.name),
        mda: currentUser.mda_name,
        scope: currentUser.scope_level,
      },
      updated: {
        roles: updatedUser.roles.map((r) => r.name),
        mda: updatedUser.mda_name,
        scope: updatedUser.scope_level,
      },
    },
  })

  return updatedUser
}

/**
 * USR06, USR09: Account activation, suspension, deactivation and reactivation
 */
export const changeUserStatus = async (payload: ChangeUserStatusRequest): Promise<UserAccount> => {
  if (!payload.reason || !payload.reason.trim()) {
    throw new Error("A justification reason is required to alter user account status (USR09)")
  }

  const allUsers = getStoredUsers()
  const user = allUsers.find((u) => String(u.id) === String(payload.user_id))
  if (!user) {
    throw new Error("User account not found")
  }

  const previousStatus = user.status
  user.status = payload.status
  user.updated_at = new Date().toISOString()
  saveStoredUsers(allUsers)

  // Audit event (USR09)
  recordAuditEvent({
    actor_name: "Current Administrator",
    action: "STATUS_CHANGE",
    target_user_id: user.id,
    target_user_name: user.full_name,
    reason: payload.reason,
    details: {
      previous_status: previousStatus,
      new_status: payload.status,
      suspension_days: payload.suspension_days || null,
    },
  })

  return user
}

/**
 * USR10: Preview bulk role assignment or revocation
 */
export const previewBulkRoleAction = async (payload: {
  user_ids: (string | number)[]
  role_id: string | number
  action: "assign" | "revoke"
}): Promise<BulkRolePreview> => {
  const allUsers = getStoredUsers()
  const allRoles = await getAvailableRoles()
  const targetRole = allRoles.find((r) => String(r.id) === String(payload.role_id))
  if (!targetRole) {
    throw new Error("Selected role does not exist")
  }

  const selectedUsers = allUsers.filter((u) => payload.user_ids.map(String).includes(String(u.id)))

  let applicableCount = 0
  let alreadyInStateCount = 0

  const affectedUsers = selectedUsers.map((user) => {
    const hasRole = user.roles.some((r) => String(r.id) === String(payload.role_id))
    let willChange = false
    let actionSummary = ""

    if (payload.action === "assign") {
      if (hasRole) {
        alreadyInStateCount++
        actionSummary = `Already possesses '${targetRole.name}'`
      } else {
        willChange = true
        applicableCount++
        actionSummary = `Will be assigned '${targetRole.name}'`
      }
    } else {
      if (hasRole) {
        willChange = true
        applicableCount++
        actionSummary = `Will have '${targetRole.name}' revoked`
      } else {
        alreadyInStateCount++
        actionSummary = `Does not have '${targetRole.name}'`
      }
    }

    return {
      user,
      current_roles: user.roles,
      will_change: willChange,
      action_summary: actionSummary,
    }
  })

  return {
    target_role: targetRole,
    action: payload.action,
    affected_users: affectedUsers,
    total_selected: selectedUsers.length,
    applicable_count: applicableCount,
    already_in_state_count: alreadyInStateCount,
  }
}

/**
 * USR10: Execute bulk role assignment/revocation with audit and outcome report
 */
export const executeBulkRoleAction = async (payload: BulkRoleActionRequest): Promise<BulkRoleOutcomeReport> => {
  if (!payload.reason || !payload.reason.trim()) {
    throw new Error("A justification reason is required for bulk role operations (USR09, USR10)")
  }

  const preview = await previewBulkRoleAction({
    user_ids: payload.user_ids,
    role_id: payload.role_id,
    action: payload.action,
  })

  const allUsers = getStoredUsers()
  const items: BulkRoleOutcomeReport["items"] = []
  let succeeded = 0

  for (const item of preview.affected_users) {
    if (!item.will_change) {
      items.push({
        user_id: item.user.id,
        user_name: item.user.full_name,
        status: "skipped",
        message: item.action_summary,
      })
      continue
    }

    const userIndex = allUsers.findIndex((u) => String(u.id) === String(item.user.id))
    if (userIndex !== -1) {
      const user = allUsers[userIndex]
      if (payload.action === "assign") {
        user.roles = [...user.roles, preview.target_role]
        user.role_ids = Array.from(new Set([...user.role_ids, preview.target_role.id]))
      } else {
        user.roles = user.roles.filter((r) => String(r.id) !== String(preview.target_role.id))
        user.role_ids = user.role_ids.filter((id) => String(id) !== String(preview.target_role.id))
      }
      user.updated_at = new Date().toISOString()
      succeeded++
      items.push({
        user_id: user.id,
        user_name: user.full_name,
        status: "success",
        message: `Successfully ${payload.action === "assign" ? "assigned" : "revoked"} role`,
      })
    }
  }

  saveStoredUsers(allUsers)

  // Audit event (USR09, USR10)
  recordAuditEvent({
    actor_name: "Current Administrator",
    action: "BULK_ROLE_CHANGE",
    target_user_id: `MULTIPLE (${succeeded})`,
    target_user_name: `${succeeded} user accounts`,
    reason: payload.reason,
    details: {
      action: payload.action,
      role: preview.target_role.name,
      total_processed: preview.total_selected,
      succeeded_count: succeeded,
    },
  })

  return {
    timestamp: new Date().toISOString(),
    action: payload.action,
    role_name: preview.target_role.name,
    total_processed: preview.total_selected,
    succeeded_count: succeeded,
    failed_count: items.filter((i) => i.status === "error").length,
    reason: payload.reason,
    items,
  }
}

/**
 * USR02, USR03: Bulk import users with CSV parsing and strict validations
 */
export const validateAndImportUsersCsv = async (
  csvContent: string,
  options: { dryRun?: boolean; reason?: string } = {}
): Promise<UserImportResult> => {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length <= 1) {
    throw new Error("CSV file contains no data rows")
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const requiredCols = ["username", "email", "fullname", "staffid"]
  const missing = requiredCols.filter((rc) => !headers.some((h) => h.replace(/[^a-z]/g, "").includes(rc)))
  if (missing.length > 0) {
    throw new Error(`CSV is missing mandatory header columns: ${missing.join(", ")}`)
  }

  const existingUsers = getStoredUsers()
  const existingUsernames = new Set(existingUsers.map((u) => u.username.toLowerCase()))
  const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()))
  const existingStaffIds = new Set(existingUsers.map((u) => u.staff_id.toLowerCase()))

  const fileUsernames = new Set<string>()
  const fileEmails = new Set<string>()
  const fileStaffIds = new Set<string>()

  const rows: UserImportRow[] = []
  const allRoles = await getAvailableRoles()

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(",").map((c) => c.trim())
    if (rawCols.every((c) => c === "")) continue

    // Map header indices
    const getVal = (pattern: string) => {
      const idx = headers.findIndex((h) => h.replace(/[^a-z]/g, "").includes(pattern))
      return idx >= 0 && rawCols[idx] ? rawCols[idx] : ""
    }

    const username = getVal("username")
    const email = getVal("email")
    const fullName = getVal("fullname") || getVal("name")
    const staffId = getVal("staffid") || getVal("id")
    const phone = getVal("phone")
    const roleNames = getVal("role") || "MDA Administrator"
    const mdaName = getVal("mda") || "Federal Ministry of Finance"
    const departmentName = getVal("department") || "Revenue & Tax Policy"
    const scopeLevel = (getVal("scope") || "assigned_mda") as any

    const errors: string[] = []
    const warnings: string[] = []

    // USR03: Validate required identifiers
    if (!username) errors.push("Username is required")
    if (!email) errors.push("Email is required")
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email format")
    if (!fullName) errors.push("Full Name is required")
    if (!staffId) errors.push("Staff ID is required")

    // USR03: Check duplicate accounts
    if (username) {
      const uLower = username.toLowerCase()
      if (existingUsernames.has(uLower)) errors.push(`Username '${username}' already exists in system`)
      if (fileUsernames.has(uLower)) errors.push(`Duplicate username '${username}' inside file`)
      fileUsernames.add(uLower)
    }

    if (email) {
      const eLower = email.toLowerCase()
      if (existingEmails.has(eLower)) errors.push(`Email '${email}' already exists in system`)
      if (fileEmails.has(eLower)) errors.push(`Duplicate email '${email}' inside file`)
      fileEmails.add(eLower)
    }

    if (staffId) {
      const sLower = staffId.toLowerCase()
      if (existingStaffIds.has(sLower)) errors.push(`Staff ID '${staffId}' already exists in system`)
      if (fileStaffIds.has(sLower)) errors.push(`Duplicate staff ID '${staffId}' inside file`)
      fileStaffIds.add(sLower)
    }

    // Role check warning
    const matchingRoles = allRoles.filter((r) =>
      roleNames.toLowerCase().includes(r.name.toLowerCase())
    )
    if (matchingRoles.length === 0) {
      warnings.push(`Role '${roleNames}' will default to MDA Administrator`)
    }

    rows.push({
      row_number: i,
      username,
      email,
      full_name: fullName,
      staff_id: staffId,
      phone,
      role_names: roleNames,
      mda_name: mdaName,
      department_name: departmentName,
      scope_level: scopeLevel,
      status: "active",
      valid: errors.length === 0,
      errors,
      warnings,
    })
  }

  const validRows = rows.filter((r) => r.valid)

  if (!options.dryRun && validRows.length > 0) {
    const newAccounts: UserAccount[] = validRows.map((r) => {
      const matchingRole = allRoles.find((role) =>
        r.role_names.toLowerCase().includes(role.name.toLowerCase())
      ) || INITIAL_ROLES[1]

      return {
        id: `USR-IMP-${Date.now().toString().slice(-4)}-${r.row_number}`,
        username: r.username,
        email: r.email,
        full_name: r.full_name,
        staff_id: r.staff_id,
        phone: r.phone,
        status: "active",
        roles: [matchingRole],
        role_ids: [matchingRole.id],
        mda_name: r.mda_name,
        department_name: r.department_name,
        scope_level: r.scope_level,
        accessible_modules: ["Dashboard", "Employees", "HR Reports"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    saveStoredUsers([...newAccounts, ...existingUsers])

    // Record audit event (USR09)
    recordAuditEvent({
      actor_name: "Current Administrator",
      action: "BULK_IMPORT",
      target_user_id: `BATCH-IMPORT (${newAccounts.length})`,
      target_user_name: `${newAccounts.length} user accounts`,
      reason: options.reason || "Authorised bulk CSV user import",
      details: {
        total_rows: rows.length,
        imported_count: newAccounts.length,
        rejected_count: rows.length - newAccounts.length,
      },
    })
  }

  return {
    total: rows.length,
    valid: validRows.length,
    invalid: rows.length - validRows.length,
    imported: options.dryRun ? 0 : validRows.length,
    failed: rows.length - validRows.length,
    records: rows,
  }
}

/**
 * USR08: Lookup effective permissions and accessible modules for a user
 */
export const getUserEffectiveAccess = async (user: UserAccount) => {
  // Map module accessibility based on effective roles
  const roleNames = user.roles.map((r) => r.name.toLowerCase())
  const isSuper = roleNames.some((r) => r.includes("super"))
  const isPayroll = isSuper || roleNames.some((r) => r.includes("payroll"))
  const isHr = isSuper || roleNames.some((r) => r.includes("hr"))
  const isAuditor = isSuper || roleNames.some((r) => r.includes("audit"))
  const isMdaAdmin = isSuper || roleNames.some((r) => r.includes("mda admin"))

  const modules = [
    {
      name: "Dashboard & Analytics",
      accessible: true,
      access_level: "Full Access",
      resource: "dashboard",
    },
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
    if (role.name.toLowerCase().includes("super")) {
      granularPermissions.push(
        { id: 1, name: "All Operations", resource: "*", action: "manage", description: "Superadministrator unrestricted privilege" }
      )
    }
    if (role.name.toLowerCase().includes("payroll")) {
      granularPermissions.push(
        { id: 2, name: "Compute Salary", resource: "payroll", action: "create", description: "Batch payroll calculations" },
        { id: 3, name: "Approve Payroll Batch", resource: "payroll", action: "approve", description: "Final disbursement signoff" }
      )
    }
    if (role.name.toLowerCase().includes("hr")) {
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

/**
 * USR09: Fetch Audit Events
 */
export const fetchAuditEvents = async (search?: string): Promise<AuditEvent[]> => {
  let logs = getStoredAuditLogs()
  if (search?.trim()) {
    const q = search.toLowerCase().trim()
    logs = logs.filter(
      (l) =>
        l.target_user_name.toLowerCase().includes(q) ||
        l.actor_name.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
    )
  }
  return logs
}
