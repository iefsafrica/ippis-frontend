import type { Role } from "@/types/roles"
import type { Permission } from "@/types/permissions"

export type UserStatus = "active" | "suspended" | "deactivated" | "pending"

export type DataScopeLevel = "all_mdas" | "assigned_mda" | "department" | "sub_unit"

export interface UserAccount {
  id: string | number
  username: string
  email: string
  full_name: string
  staff_id: string
  phone?: string
  status: UserStatus
  roles: Role[]
  role_ids: (string | number)[]
  mda_id?: string | number
  mda_name?: string
  department_id?: string | number
  department_name?: string
  scope_level: DataScopeLevel
  direct_permissions?: Permission[]
  effective_permissions?: Permission[]
  accessible_modules?: string[]
  last_login?: string
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  username: string
  email: string
  full_name: string
  password?: string
  staff_id: string
  phone?: string
  role_ids: (string | number)[]
  mda_id?: string | number
  mda_name?: string
  department_id?: string | number
  department_name?: string
  scope_level: DataScopeLevel
  status: UserStatus
  notes?: string
}

export interface UpdateUserRequest {
  id: string | number
  username?: string
  email?: string
  full_name?: string
  staff_id?: string
  phone?: string
  role_ids?: (string | number)[]
  mda_id?: string | number
  mda_name?: string
  department_id?: string | number
  department_name?: string
  scope_level?: DataScopeLevel
  status?: UserStatus
  password?: string
  reason: string // USR09: Sensitive account changes require a reason
}

export interface ChangeUserStatusRequest {
  user_id: string | number
  status: UserStatus
  reason: string // USR09
  suspension_days?: number
}

export interface BulkRoleActionRequest {
  user_ids: (string | number)[]
  role_id: string | number
  action: "assign" | "revoke"
  reason: string // USR09
}

export interface BulkRolePreviewItem {
  user: UserAccount
  current_roles: Role[]
  will_change: boolean
  action_summary: string
}

export interface BulkRolePreview {
  target_role: Role
  action: "assign" | "revoke"
  affected_users: BulkRolePreviewItem[]
  total_selected: number
  applicable_count: number
  already_in_state_count: number
}

export interface BulkRoleOutcomeItem {
  user_id: string | number
  user_name: string
  status: "success" | "skipped" | "error"
  message: string
}

export interface BulkRoleOutcomeReport {
  timestamp: string
  action: "assign" | "revoke"
  role_name: string
  total_processed: number
  succeeded_count: number
  failed_count: number
  reason: string
  items: BulkRoleOutcomeItem[]
}

export interface UserImportRow {
  row_number: number
  username: string
  email: string
  full_name: string
  staff_id: string
  phone?: string
  role_names: string
  mda_name: string
  department_name?: string
  scope_level: DataScopeLevel
  status: UserStatus
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface UserImportResult {
  total: number
  valid: number
  invalid: number
  imported: number
  failed: number
  records: UserImportRow[]
}

export interface AuditEvent {
  id: string
  timestamp: string
  actor_name: string
  actor_id?: string | number
  action:
    | "CREATE_USER"
    | "UPDATE_USER"
    | "STATUS_CHANGE"
    | "ROLE_ASSIGNMENT"
    | "ROLE_REVOCATION"
    | "SCOPE_CHANGE"
    | "BULK_ROLE_CHANGE"
    | "BULK_IMPORT"
    | "PASSWORD_RESET"
  target_user_id: string | number
  target_user_name: string
  reason: string
  details?: Record<string, any>
}

export interface UserFilterParams {
  search?: string
  role?: string
  status?: UserStatus | "all"
  mda_id?: string | number | "all"
  department_id?: string | number | "all"
  page?: number
  limit?: number
}
