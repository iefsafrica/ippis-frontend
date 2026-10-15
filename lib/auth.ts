import Cookies from "js-cookie"
import {
  adminLogin,
  adminVerifyOtp,
  adminRequestOtp,
  AdminLoginResponse,
  AdminVerifyOtpResponse,
} from "@/services/endpoints/auth/admin-auth"

export interface AuthResult {
  success: boolean
  requiresOTP?: boolean
  token?: string
  message?: string
  user?: any
}

export function saveAuthToken(token: string): void {
  // Store both token and ippis_token for backward and forward compatibility
  Cookies.set("token", token, { expires: 1, path: "/" })
  Cookies.set("ippis_token", token, { expires: 1, path: "/" })

  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
    localStorage.setItem("ippis_token", token)
  }
}

export function clearAuth(): void {
  Cookies.remove("token", { path: "/" })
  Cookies.remove("ippis_token", { path: "/" })

  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
    localStorage.removeItem("ippis_token")
    localStorage.removeItem("ippis_user")
  }
}

export function getAuthToken(): string | null {
  const cookieToken = Cookies.get("token") || Cookies.get("ippis_token")
  if (cookieToken) return cookieToken

  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || localStorage.getItem("ippis_token")
  }
  return null
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

export async function login(username: string, password: string): Promise<AuthResult> {
  try {
    const isEmail = username.includes("@")
    const payload = isEmail ? { email: username, password } : { username, password }

    const response: AdminLoginResponse = await adminLogin(payload)

    if (response.token) {
      saveAuthToken(response.token)
      if (response.user && typeof window !== "undefined") {
        localStorage.setItem("ippis_user", JSON.stringify(response.user))
      }
    }

    return {
      success: response.success,
      requiresOTP: response.requiresOTP,
      token: response.token,
      message: response.message,
      user: response.user,
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Invalid username or password"
    return {
      success: false,
      message,
    }
  }
}

export async function verifyOtp(username: string, otp: string): Promise<AuthResult> {
  try {
    const isEmail = username.includes("@")
    const payload = isEmail ? { email: username, otp } : { username, otp }

    const response: AdminVerifyOtpResponse = await adminVerifyOtp(payload)

    if (response.token) {
      saveAuthToken(response.token)
      if (response.user && typeof window !== "undefined") {
        localStorage.setItem("ippis_user", JSON.stringify(response.user))
      }
    }

    return {
      success: response.success,
      token: response.token,
      message: response.message,
      user: response.user,
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to verify OTP"
    return {
      success: false,
      message,
    }
  }
}

export async function requestOtp(username: string): Promise<{ success: boolean; message: string }> {
  try {
    const isEmail = username.includes("@")
    const payload = isEmail ? { email: username } : { username }

    const response = await adminRequestOtp(payload)
    return {
      success: response.success,
      message: response.message || "OTP resent successfully",
    }
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to resend OTP"
    return {
      success: false,
      message,
    }
  }
}
