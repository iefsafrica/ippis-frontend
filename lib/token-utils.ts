import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "ippis-secure-token-secret"

/**
 * Generate a JWT token
 * @param payload Data to encode in the token
 * @param expiresIn Token expiration time (default: 7 days)
 * @returns JWT token string
 */
export function generateToken(payload: Record<string, any>, expiresIn = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

/**
 * Verify and decode a JWT token
 * @param token JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken<T = Record<string, any>>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}
