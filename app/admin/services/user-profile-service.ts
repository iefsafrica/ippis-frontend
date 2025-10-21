import type { AdminUser } from "@/types/admin-database"

export class UserProfileService {
  static async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const response = await fetch("/api/admin/auth/me")

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`)
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error("Error fetching current user:", error)
      return null
    }
  }

  static async updateProfile(userData: {
    id: number
    email?: string
    fullName?: string
  }): Promise<AdminUser | null> {
    try {
      const response = await fetch(`/api/admin/users/${userData.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`)
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error("Error updating profile:", error)
      return null
    }
  }

  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        return false
      }

      return true
    } catch (error) {
      console.error("Error changing password:", error)
      return false
    }
  }
}
