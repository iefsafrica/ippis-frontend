import type { User } from "@/lib/auth-context"

/**
 * Checks whether the current user has permission to approve or reject leave requests.
 * Rule:
 * Approving or rejecting leave now needs the leave-approval permission:
 * department heads and central HR can approve, HR officers can't
 * (they can still create and edit leave requests).
 */
export function canApproveLeave(user: User | null): boolean {
  if (!user) return false

  // Super admin / full admin can always approve
  if (
    user.role_key === "super_admin" ||
    user.role === "Super Admin" ||
    user.role === "admin"
  ) {
    return true
  }

  // Explicit leave approval permission
  if (
    user.permissions?.includes("leave-approval") ||
    user.permissions?.includes("leave.approve") ||
    user.permissions?.includes("leaves.approve")
  ) {
    return true
  }

  const roleLower = (user.role || "").toLowerCase()
  const roleKeyLower = (user.role_key || "").toLowerCase()

  // Department heads and Central HR can approve
  if (
    roleLower.includes("department head") ||
    roleKeyLower.includes("department_head") ||
    roleLower.includes("head of department") ||
    roleLower.includes("central hr") ||
    roleKeyLower.includes("central_hr") ||
    roleLower.includes("central_admin") ||
    roleKeyLower.includes("central_admin")
  ) {
    return true
  }

  // HR officers and other users cannot approve or reject
  return false
}

/**
 * Checks whether a leave request belongs to the currently signed-in user.
 * Rule:
 * Nobody can approve their own leave or resignation.
 */
export function isSelfLeave(
  user: User | null,
  leave: {
    employeeCode?: string | number
    employee_code?: string | number
    employee_id?: string | number
    name?: string | null
    employee_name?: string | null
    email?: string | null
  } | null,
): boolean {
  if (!user || !leave) return false

  const code = leave.employeeCode ?? leave.employee_code ?? leave.employee_id
  const name = leave.name ?? leave.employee_name

  if (code !== undefined && code !== null && user.employee_id !== undefined && user.employee_id !== null) {
    if (String(code).trim().toLowerCase() === String(user.employee_id).trim().toLowerCase()) {
      return true
    }
  }

  if (code !== undefined && code !== null && user.id !== undefined && user.id !== null) {
    if (String(code).trim().toLowerCase() === String(user.id).trim().toLowerCase()) {
      return true
    }
  }

  if (name && user.name && name.trim().toLowerCase() === user.name.trim().toLowerCase()) {
    return true
  }

  if (leave.email && user.email && leave.email.trim().toLowerCase() === user.email.trim().toLowerCase()) {
    return true
  }

  return false
}
