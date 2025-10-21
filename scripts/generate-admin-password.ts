import { generatePasswordHashSync } from "../lib/password-utils"

// Default admin password
const DEFAULT_PASSWORD = "admin123"

// Generate hash
const hash = generatePasswordHashSync(DEFAULT_PASSWORD)

console.log("Generated password hash for admin user:")
console.log(hash)
console.log("\nYou can use this hash in your admin_schema.sql file.")
