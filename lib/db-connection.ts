/**
 * Database connection and utility functions
 */

import { neon } from "@neondatabase/serverless"
import { Pool } from "pg"

// Database connection configuration
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set")
}

// Create a Neon SQL client
const sqlClient = neon(connectionString!)

// Create a connection pool for backward compatibility
// This ensures existing code that uses pool.query() continues to work
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to database:", err)
  } else {
    console.log("Database connected successfully at:", res.rows[0].now)
  }
})

// Helper function to run migrations
async function runMigrations() {
  console.log("Running database migrations (not implemented in this demo)")
  // In a real application, this function would run database migrations
  // using a tool like umzug or similar.
}

// Helper function to test the database connection
async function testConnection(): Promise<{ success: boolean; message: string; timestamp: string }> {
  try {
    const result = await sqlClient`SELECT 1`
    return {
      success: true,
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}

// Export both the pool for backward compatibility and the sqlClient for new code
export { pool, sqlClient, runMigrations, testConnection }

// Export the sqlClient as getSqlClient
export const getSqlClient = () => sqlClient
