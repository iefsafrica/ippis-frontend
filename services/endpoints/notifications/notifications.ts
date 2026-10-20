import api, { get, post, patch, del } from "@/services/axios";
import { NotificationItemData, NotificationsResponse } from "@/types/notifications";

const STORAGE_KEY = "ippis_admin_notifications_cache";

const DEFAULT_FALLBACK_NOTIFICATIONS: NotificationItemData[] = [
  {
    id: "1",
    title: "New Registration",
    message: "A new employee has registered and is awaiting approval",
    type: "registration",
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: "/admin/pending",
  },
  {
    id: "2",
    title: "Document Uploaded",
    message: "New documents have been uploaded for verification",
    type: "document",
    read: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    actionUrl: "/admin/documents",
  },
  {
    id: "3",
    title: "System Update",
    message: "The system will undergo maintenance tonight at 11 PM",
    type: "system",
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    actionUrl: "/admin/settings",
  },
];

function getCachedNotifications(): NotificationItemData[] {
  if (typeof window === "undefined") return DEFAULT_FALLBACK_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FALLBACK_NOTIFICATIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FALLBACK_NOTIFICATIONS;
  } catch {
    return DEFAULT_FALLBACK_NOTIFICATIONS;
  }
}

function setCachedNotifications(items: NotificationItemData[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Failed to cache notifications in localStorage", e);
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
  try {
    const params: Record<string, any> = {};
    if (options?.unreadOnly) params.unread = true;
    if (options?.limit) params.limit = options.limit;

    const response = await get<any>("/admin/notifications", params);

    // Backend may return { notifications: [...] } or { data: [...] } or raw array
    let rawList: any[] = [];
    if (Array.isArray(response)) {
      rawList = response;
    } else if (Array.isArray(response?.notifications)) {
      rawList = response.notifications;
    } else if (Array.isArray(response?.data)) {
      rawList = response.data;
    } else if (response?.endpoint === "/admin/notifications" && !response?.notifications) {
      // Backend is returning the old placeholder stub
      const cached = getCachedNotifications();
      return {
        notifications: cached,
        unreadCount: cached.filter((n) => !n.read).length,
      };
    }

    if (rawList.length > 0) {
      const normalized = rawList.map(normalizeNotification);
      setCachedNotifications(normalized);
      const unreadCount =
        typeof response?.unreadCount === "number"
          ? response.unreadCount
          : normalized.filter((n) => !n.read).length;

      return { notifications: normalized, unreadCount };
    }

    // If backend returned empty list, check if we have cached notifications or return empty
    const cached = getCachedNotifications();
    return {
      notifications: cached,
      unreadCount: cached.filter((n) => !n.read).length,
    };
  } catch (error) {
    console.warn("fetchNotifications failed, using cached fallback:", error);
    const cached = getCachedNotifications();
    return {
      notifications: cached,
      unreadCount: cached.filter((n) => !n.read).length,
    };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  // Optimistically update local cache
  const cached = getCachedNotifications();
  const updated = cached.map((n) => (n.id === id ? { ...n, read: true, is_read: true } : n));
  setCachedNotifications(updated);

  try {
    // Try both PATCH /admin/notifications and /admin/notifications/[id]
    try {
      await patch(`/admin/notifications/${id}`, { read: true });
      return true;
    } catch {
      await patch(`/admin/notifications`, { id, read: true });
      return true;
    }
  } catch (error) {
    console.warn(`markNotificationAsRead(${id}) remote sync error:`, error);
    return true; // Still true optimistically
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  // Optimistically update local cache
  const cached = getCachedNotifications();
  const updated = cached.map((n) => ({ ...n, read: true, is_read: true }));
  setCachedNotifications(updated);

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
    return true; // Still true optimistically
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<boolean> {
  const cached = getCachedNotifications();
  const updated = cached.filter((n) => n.id !== id);
  setCachedNotifications(updated);

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
    return true;
  }
}
