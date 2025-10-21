/**
 * TypeScript types for the admin database schema
 */

// Admin User
export interface AdminUser {
  id: number
  username: string
  email: string
  passwordHash: string
  fullName: string
  role: "superadmin" | "admin" | "viewer"
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// Admin Session
export interface AdminSession {
  id: number
  adminId: number
  sessionToken: string
  expiresAt: Date
  createdAt: Date
  ipAddress?: string
  userAgent?: string
}

// Dashboard Notification
export interface DashboardNotification {
  id: number
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  isRead: boolean
  recipientId?: number
  createdAt: Date
  expiresAt?: Date
  actionUrl?: string
}

// Dashboard Widget
export interface DashboardWidget {
  id: number
  adminId: number
  widgetType: string
  widgetPosition: number
  widgetSize: "small" | "medium" | "large"
  widgetConfig: Record<string, any>
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
}

// Admin Permission
export interface AdminPermission {
  id: number
  role: string
  resource: string
  action: string
  isAllowed: boolean
  createdAt: Date
  updatedAt: Date
}

// Notification
export interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  isRead: boolean
  recipientId?: number
  createdAt: Date
  expiresAt?: Date
  actionUrl?: string
}
