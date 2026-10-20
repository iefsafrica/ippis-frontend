import { neon } from "@neondatabase/serverless"

function getSql() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return null
  return neon(dbUrl)
}

export async function createSystemNotification({
  title,
  message,
  type = "info",
  recipientId = null, // null means all admins
  expiresAt = null,
  actionUrl = null,
}: {
  title: string
  message: string
  type?: "info" | "warning" | "success" | "error" | "registration" | "document" | "system" | "alert"
  recipientId?: number | null
  expiresAt?: Date | null
  actionUrl?: string | null
}) {
  try {
    const sql = getSql()
    if (!sql) {
      console.warn("DATABASE_URL is not configured; skipping notification creation.")
      return false
    }

    if (recipientId) {
      // Create notification for a specific user
      await sql`
        INSERT INTO dashboard_notifications 
        (title, message, type, recipient_id, expires_at, action_url)
        VALUES (${title}, ${message}, ${type}, ${recipientId}, ${expiresAt ? expiresAt.toISOString() : null}, ${actionUrl})
      `
    } else {
      // Create broadcast notification (recipient_id = NULL)
      await sql`
        INSERT INTO dashboard_notifications 
        (title, message, type, recipient_id, expires_at, action_url)
        VALUES (${title}, ${message}, ${type}, NULL, ${expiresAt ? expiresAt.toISOString() : null}, ${actionUrl})
      `
    }

    return true
  } catch (error) {
    console.error("Error creating system notification:", error)
    return false
  }
}

// Helper function to create a notification when a new employee registers
export async function notifyNewEmployeeRegistration(employeeName: string, employeeId: number) {
  return createSystemNotification({
    title: "New Employee Registration",
    message: `${employeeName} has registered and requires approval.`,
    type: "registration",
    actionUrl: `/admin/pending?highlight=${employeeId}`,
  })
}

// Helper function to create a notification when documents are uploaded
export async function notifyDocumentsUploaded(employeeName: string, employeeId: number, documentCount: number) {
  return createSystemNotification({
    title: "Documents Uploaded",
    message: `${employeeName} has uploaded ${documentCount} document(s) that require verification.`,
    type: "document",
    actionUrl: `/admin/documents?employee=${employeeId}`,
  })
}

// Helper function to create a notification for system events
export async function notifySystemEvent(
  title: string,
  message: string,
  type: "info" | "warning" | "success" | "error" | "system" = "system",
) {
  return createSystemNotification({
    title,
    message,
    type,
  })
}
