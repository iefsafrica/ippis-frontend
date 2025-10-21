import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || ""

export interface JWTPayload {
  id: number
  username: string
  role: string
  iat: number
  exp: number
}

export async function verifyAuthToken(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authenticated: false, error: "Missing or invalid authorization header" }
    }

    // Extract the token
    const token = authHeader.split(" ")[1]

    if (!token) {
      return { authenticated: false, error: "No token provided" }
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    return {
      authenticated: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      },
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { authenticated: false, error: "Invalid token" }
    } else if (error instanceof jwt.TokenExpiredError) {
      return { authenticated: false, error: "Token expired" }
    } else {
      console.error("Auth error:", error)
      return { authenticated: false, error: "Authentication error" }
    }
  }
}

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const { authenticated, user, error } = await verifyAuthToken(request)

    if (!authenticated) {
      return NextResponse.json({ error }, { status: 401 })
    }

    // Add the user to the request for use in the handler
    return handler(request, user)
  }
}

export function withRole(handler: Function, allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const { authenticated, user, error } = await verifyAuthToken(request)

    if (!authenticated) {
      return NextResponse.json({ error }, { status: 401 })
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Add the user to the request for use in the handler
    return handler(request, user)
  }
}
