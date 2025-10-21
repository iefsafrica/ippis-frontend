import bcryptjs from "bcryptjs"

// Number of salt rounds for bcryptjs
const SALT_ROUNDS = 10

/**
 * Hash a password using bcryptjs
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, SALT_ROUNDS)
}

/**
 * Compare a plain text password with a hashed password
 * @param password The plain text password
 * @param hashedPassword The hashed password to compare against
 * @returns True if the passwords match, false otherwise
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword)
}

/**
 * Generate a hash for the default admin password (for database seeding)
 * This is a synchronous function intended for use in scripts
 * @param password The plain text password
 * @returns The hashed password
 */
export function generatePasswordHashSync(password: string): string {
  return bcryptjs.hashSync(password, SALT_ROUNDS)
}
