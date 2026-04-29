export interface Role {
  id: string | number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface GetRolesResponse {
  success: boolean
  message?: string
  data: Role[]
}

export interface GetRoleResponse {
  success: boolean
  message?: string
  data: Role
}

export interface CreateRoleRequest {
  name: string
  description?: string
}

export interface CreateRoleResponse {
  success: boolean
  message?: string
  data: Role
}

export interface UpdateRoleRequest {
  id: string | number
  name: string
  description?: string
}

export interface UpdateRoleResponse {
  success: boolean
  message?: string
  data: Role
}

export interface RoleActionRequest {
  action: "assign" | "unassign"
  user_id: string
  role_id: string | number
}

export interface RoleActionResponse {
  success: boolean
  message?: string
  error?: string
  data?: unknown
}
