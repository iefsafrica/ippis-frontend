// Real notification service that interacts with the API

export interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
  actionUrl?: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  limit: number
  offset: number
}

// Convert string dates to Date objects
function parseNotification(notification: any): Notification {
  return {
    ...notification,
    createdAt: new Date(notification.createdAt),
    expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
  }
}

// Notification service
export const notificationService = {
  // Get notifications
  getNotifications: async (limit = 10, offset = 0, unreadOnly = false): Promise<NotificationsResponse> => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        unread: unreadOnly.toString(),
      })

      const response = await fetch(`/api/admin/notifications?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`)
      }

      const data = await response.json()

      // Parse dates
      const notifications = data.notifications.map(parseNotification)

      return {
        notifications,
        total: data.total,
        limit: data.limit,
        offset: data.offset,
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      throw error
    }
  },

  // Mark a notification as read
  markAsRead: async (id: number): Promise<void> => {
    try {
      const response = await fetch("/api/admin/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error)
      throw error
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    try {
      const response = await fetch("/api/admin/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ all: true }),
      })

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  },

  // Delete a notification
  deleteNotification: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error)
      throw error
    }
  },

  // Clear all notifications
  clearAllNotifications: async (): Promise<void> => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to clear all notifications: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error)
      throw error
    }
  },

  // Create a new notification (admin only)
  createNotification: async (notification: {
    title: string
    message: string
    type: "info" | "warning" | "success" | "error"
    recipientId?: number
    expiresAt?: Date
    actionUrl?: string
  }): Promise<Notification> => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      })

      if (!response.ok) {
        throw new Error(`Failed to create notification: ${response.statusText}`)
      }

      const data = await response.json()
      return parseNotification(data)
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  },
}
