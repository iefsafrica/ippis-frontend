import { get, post } from "@/services/axios"

export interface AdminLoginPayload {
  username?: string
  email?: string
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  message: string
  requiresOTP?: boolean
  token?: string
  user?: {
    id: string | number
    username: string
    email: string
    role?: string
    fullName?: string
  }
}

export interface AdminVerifyOtpPayload {
  username?: string
  email?: string
  otp: string
}

export interface AdminVerifyOtpResponse {
  success: boolean
  message: string
  token: string
  user?: {
    id: string | number
    username: string
    email: string
    role?: string
    fullName?: string
  }
}

export interface AdminRequestOtpPayload {
  username?: string
  email?: string
}

export interface AdminProfileResponse {
  success: boolean
  data: {
    user: {
      id: number
      username: string
      email: string
      fullName: string
    }
    roles: Array<{
      id: number
      key: string
      name: string
      scope_level: string
      company_name?: string
      department_name?: string
      expires_at?: string
    }>
    modules: string[]
    permissions: Array<{
      key: string
      scope: {
        global: boolean
        companyIds: number[]
        departmentIds: number[]
        self: boolean
      }
    }>
  }
}

export const adminLogin = async (payload: AdminLoginPayload): Promise<AdminLoginResponse> => {
  return post<AdminLoginResponse>("/admin/auth/login", payload)
}

export const adminVerifyOtp = async (payload: AdminVerifyOtpPayload): Promise<AdminVerifyOtpResponse> => {
  return post<AdminVerifyOtpResponse>("/admin/auth/login/verify-otp", payload)
}

export const adminRequestOtp = async (payload: AdminRequestOtpPayload): Promise<{ success: boolean; message: string }> => {
  return post<{ success: boolean; message: string }>("/admin/auth/login/request-otp", payload)
}

export const adminGetProfile = async (): Promise<AdminProfileResponse> => {
  return get<AdminProfileResponse>("/admin/auth/me")
}

export const adminLogout = async (): Promise<{ success: boolean }> => {
  return post<{ success: boolean }>("/admin/auth/logout")
}
