export type NotificationType =
  | "registration"
  | "document"
  | "system"
  | "alert"
  | "payroll"
  | "info"
  | "warning"
  | "success"
  | "error";

export interface NotificationItemData {
  id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  read: boolean;
  is_read?: boolean;
  createdAt: string;
  created_at?: string;
  actionUrl?: string | null;
  action_url?: string | null;
  recipientId?: number | null;
  recipient_id?: number | null;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: NotificationItemData[];
  unreadCount: number;
  total?: number;
  message?: string;
}
