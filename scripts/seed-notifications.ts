import { neon } from "@neondatabase/serverless"
import { faker } from "@faker-js/faker"

async function seedNotifications() {
  try {
    console.log("Seeding notifications...")

    // Get the database URL from environment variables
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    // Create a SQL client
    const sql = neon(databaseUrl)

    // Get admin users to assign notifications to
    const adminUsers = await sql("SELECT id FROM admin_users LIMIT 10")

    if (adminUsers.length === 0) {
      console.log("No admin users found. Please create admin users first.")
      return
    }

    // Types of notifications
    const types = ["info", "warning", "success", "error"]

    // Generate random notifications
    const notifications = []

    for (let i = 0; i < 20; i++) {
      const user = adminUsers[Math.floor(Math.random() * adminUsers.length)]
      const type = types[Math.floor(Math.random() * types.length)]
      const isRead = Math.random() > 0.7 // 30% chance of being read

      // Create a random date within the last 7 days
      const createdAt = faker.date.recent({ days: 7 })

      // 50% chance of having an expiration date
      const expiresAt = Math.random() > 0.5 ? faker.date.future({ years: 0.1, refDate: createdAt }) : null

      // 30% chance of having an action URL
      const actionUrl =
        Math.random() > 0.7
          ? `/admin/${["employees", "documents", "pending", "settings"][Math.floor(Math.random() * 4)]}`
          : null

      notifications.push({
        title: faker.helpers.arrayElement([
          "New employee registration",
          "Document verification required",
          "System update",
          "Backup completed",
          "Security alert",
          "Payroll processed",
          "Leave request",
          "New policy update",
        ]),
        message: faker.helpers.arrayElement([
          "A new employee has registered and requires approval.",
          "New documents have been uploaded and need verification.",
          "The system will undergo maintenance tonight at 10 PM.",
          "Database backup has been completed successfully.",
          "Multiple failed login attempts detected.",
          "Monthly payroll has been processed successfully.",
          "An employee has requested leave approval.",
          "New government policy update requires action.",
        ]),
        type,
        is_read: isRead,
        recipient_id: user.id,
        created_at: createdAt,
        expires_at: expiresAt,
        action_url: actionUrl,
      })
    }

    // Insert notifications
    for (const notification of notifications) {
      await sql(
        `
        INSERT INTO notifications 
        (title, message, type, is_read, recipient_id, created_at, expires_at, action_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          notification.title,
          notification.message,
          notification.type,
          notification.is_read,
          notification.recipient_id,
          notification.created_at,
          notification.expires_at,
          notification.action_url,
        ],
      )
    }

    console.log(`Successfully seeded ${notifications.length} notifications`)
  } catch (error) {
    console.error("Error seeding notifications:", error)
    process.exit(1)
  }
}

// Run the seeding function
seedNotifications()
