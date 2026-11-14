import { get, post, patch, del } from "@/services/axios";
import { NotificationItemData } from "@/types/notifications";

const LEGACY_STORAGE_KEY = "ippis_admin_notifications_cache";

function clearLegacyNotificationCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

function normalizeNotification(raw: any): NotificationItemData {
  return {
    id: String(raw.id || Math.random().toString(36).substring(2, 9)),
    title: raw.title || "Notification",
    message: raw.message || "",
    type: raw.type || "info",
    read: Boolean(raw.read ?? raw.is_read ?? false),
    is_read: Boolean(raw.read ?? raw.is_read ?? false),
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
    actionUrl: raw.actionUrl || raw.action_url || null,
    action_url: raw.actionUrl || raw.action_url || null,
    recipientId: raw.recipientId || raw.recipient_id || null,
  };
}

/**
 * Fetch all notifications for the active admin user
 */
export async function fetchNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<{ notifications: NotificationItemData[]; unreadCount: number }> {
  clearLegacyNotificationCache();

  try {
    const params: Record<string, any> = {};
    if (options?.unreadOnly) params.unread = true;
    if (options?.limit) params.limit = options.limit;

    const response = await get<any>("/admin/notifications", params);

    let rawList: any[] = [];
    if (Array.isArray(response)) {
      rawList = response;
    } else if (Array.isArray(response?.notifications)) {
      rawList = response.notifications;
    } else if (Array.isArray(response?.data)) {
      rawList = response.data;
    }

    const normalized = rawList.map(normalizeNotification);
    const unreadCount =
      typeof response?.unreadCount === "number"
        ? response.unreadCount
        : normalized.filter((n) => !n.read).length;

    return { notifications: normalized, unreadCount };
  } catch (error) {
    console.warn("fetchNotifications failed:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    try {
      await patch(`/admin/notifications/${id}`, { read: true });
      return true;
    } catch {
      await patch(`/admin/notifications`, { id, read: true });
      return true;
    }
  } catch (error) {
    console.warn(`markNotificationAsRead(${id}) remote sync error:`, error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    try {
      await post("/admin/notifications/read", { markAll: true });
      return true;
    } catch {
      await patch("/admin/notifications/read", { markAll: true });
      return true;
    }
  } catch (error) {
    console.warn("markAllNotificationsAsRead remote sync error:", error);
    return false;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<boolean> {
  try {
    try {
      await del(`/admin/notifications/${id}`);
      return true;
    } catch {
      await del(`/admin/notifications?id=${id}`);
      return true;
    }
  } catch (error) {
    console.warn(`deleteNotification(${id}) remote sync error:`, error);
    return false;
  }
}
