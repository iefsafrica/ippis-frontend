import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

async function setupNotificationsDb() {
  try {
    console.log("Setting up notifications database...")

    // Get the database URL from environment variables
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    // Create a SQL client
    const sql = neon(databaseUrl)

    // Read the SQL schema file
    const schemaPath = path.join(process.cwd(), "database", "notifications-schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Execute the SQL schema
    await sql.query(schema)

    console.log("Notifications database setup completed successfully")
  } catch (error) {
    console.error("Error setting up notifications database:", error)
    process.exit(1)
  }
}

// Run the setup function
setupNotificationsDb()
