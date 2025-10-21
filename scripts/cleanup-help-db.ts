/**
 * Help Database Cleanup Script
 *
 * This script removes all help-related tables from the database.
 *
 * Usage:
 * npx tsx scripts/cleanup-help-db.ts
 *
 * Environment variables:
 * - DATABASE_URL: The database connection string
 */

import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

async function cleanupHelpDatabase() {
  try {
    console.log("Starting help database cleanup...")

    // Get the database connection
    const sql = neon(process.env.DATABASE_URL!)

    // Read the SQL script
    const sqlScript = fs.readFileSync(path.join(process.cwd(), "scripts", "cleanup-help-tables.sql"), "utf8")

    // Execute the SQL script
    await sql.query(sqlScript)

    console.log("✅ Successfully removed all help-related database tables")
  } catch (error) {
    console.error("❌ Error cleaning up help database:", error)
    process.exit(1)
  }
}

cleanupHelpDatabase()
