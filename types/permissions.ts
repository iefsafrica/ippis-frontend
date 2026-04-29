export interface Permission {
  id: string | number
  name: string
  resource: string
  action: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface GetPermissionsResponse {
  success: boolean
  data: Permission[]
  message?: string
}

export interface GetPermissionResponse {
  success: boolean
  data: Permission
  message?: string
}

export interface CreatePermissionRequest {
  name: string
  resource: string
  action: string
  description?: string
}

export interface CreatePermissionResponse {
  success: boolean
  message?: string
  data: Permission
}

export interface UpdatePermissionRequest {
  id: string | number
  name?: string
  resource?: string
  action?: string
  description?: string
}

export interface UpdatePermissionResponse {
  success: boolean
  message?: string
  data: Permission
}

export interface DeletePermissionResponse {
  success: boolean
  message?: string
  error?: string
}

export type PermissionAssignmentAction = "assign_user" | "unassign_user" | "unassign_role"

export interface PermissionActionRequest {
  action: PermissionAssignmentAction
  permission_id: string | number
  user_id?: string
  role_id?: string | number
}

export interface PermissionActionResponse {
  success: boolean
  message?: string
  error?: string
  data?: unknown
}

export interface GetUserPermissionsResponse {
  success: boolean
  data: Permission[]
  message?: string
}
