/**
 * Admin Database Setup Script
 *
 * This script initializes the admin database by making a POST request to the setup endpoint.
 *
 * Usage:
 * npx tsx scripts/setup-admin-db.ts
 *
 * Environment variables:
 * - ADMIN_SETUP_TOKEN: The token required for authorization
 * - API_BASE_URL: The base URL of the API (defaults to http://localhost:3000)
 */

async function setupAdminDatabase() {
  const token = process.env.ADMIN_SETUP_TOKEN
  const baseUrl = process.env.API_BASE_URL || "http://localhost:3000"

  if (!token) {
    console.error("Error: ADMIN_SETUP_TOKEN environment variable is not set")
    process.exit(1)
  }

  try {
    console.log("Setting up admin database...")

    const response = await fetch(`${baseUrl}/api/admin/db-setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (response.ok) {
      console.log("✅ Success:", data.message || "Admin database setup completed successfully")
      process.exit(0)
    } else {
      console.error("❌ Error:", data.error || "Failed to set up admin database")
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : "An unknown error occurred")
    process.exit(1)
  }
}

setupAdminDatabase()
