import { neon } from "@neondatabase/serverless"
import fs from "fs"
import path from "path"

async function clearAllTables() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    console.log("Connecting to database...")

    // Read the SQL script
    const scriptPath = path.join(process.cwd(), "scripts", "clear-all-tables.sql")
    const sqlScript = fs.readFileSync(scriptPath, "utf8")

    console.log("Executing SQL script to clear tables...")

    // Execute the script
    await sql.query(sqlScript)

    console.log("All tables cleared successfully!")
  } catch (error) {
    console.error("Error clearing tables:", error)
    process.exit(1)
  }
}

clearAllTables()
