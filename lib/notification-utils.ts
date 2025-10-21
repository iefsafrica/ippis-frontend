import { neon } from "@neondatabase/serverless"

// Get database connection
const sql = neon(process.env.DATABASE_URL!)

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
  type?: "info" | "warning" | "success" | "error"
  recipientId?: number | null
  expiresAt?: Date | null
  actionUrl?: string | null
}) {
  try {
    if (recipientId) {
      // Create notification for a specific user
      await sql(
        `
        INSERT INTO notifications 
        (title, message, type, recipient_id, expires_at, action_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [title, message, type, recipientId, expiresAt, actionUrl],
      )
    } else {
      // Create notification for all admin users
      const adminUsers = await sql("SELECT id FROM admin_users WHERE is_active = true")

      for (const user of adminUsers) {
        await sql(
          `
          INSERT INTO notifications 
          (title, message, type, recipient_id, expires_at, action_url)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [title, message, type, user.id, expiresAt, actionUrl],
        )
      }
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
    type: "info",
    actionUrl: `/admin/pending?highlight=${employeeId}`,
  })
}

// Helper function to create a notification when documents are uploaded
export async function notifyDocumentsUploaded(employeeName: string, employeeId: number, documentCount: number) {
  return createSystemNotification({
    title: "Documents Uploaded",
    message: `${employeeName} has uploaded ${documentCount} document(s) that require verification.`,
    type: "info",
    actionUrl: `/admin/documents?employee=${employeeId}`,
  })
}

// Helper function to create a notification for system events
export async function notifySystemEvent(
  title: string,
  message: string,
  type: "info" | "warning" | "success" | "error" = "info",
) {
  return createSystemNotification({
    title,
    message,
    type,
  })
}
