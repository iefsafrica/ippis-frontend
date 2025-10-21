import { pgTable, serial, text, timestamp, integer, boolean, jsonb, unique } from "drizzle-orm/pg-core"

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"), // superadmin, admin, viewer
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Admin sessions table
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
})

// Dashboard notifications table
export const dashboardNotifications = pgTable("dashboard_notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, error, success
  isRead: boolean("is_read").notNull().default(false),
  recipientId: integer("recipient_id").references(() => adminUsers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  actionUrl: text("action_url"),
})

// Dashboard widgets configuration
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  widgetType: text("widget_type").notNull(), // stats, chart, activity, etc.
  widgetPosition: integer("widget_position").notNull(),
  widgetSize: text("widget_size").notNull().default("medium"), // small, medium, large
  widgetConfig: jsonb("widget_config").notNull().default({}),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Admin action permissions
export const adminPermissions = pgTable(
  "admin_permissions",
  {
    id: serial("id").primaryKey(),
    role: text("role").notNull(),
    resource: text("resource").notNull(), // employees, documents, settings, etc.
    action: text("action").notNull(), // create, read, update, delete, approve, reject
    isAllowed: boolean("is_allowed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      roleResourceActionUnique: unique().on(table.role, table.resource, table.action),
    }
  },
)

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, success, error
  isRead: boolean("is_read").notNull().default(false),
  recipientId: integer("recipient_id").references(() => adminUsers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  actionUrl: text("action_url"),
})
