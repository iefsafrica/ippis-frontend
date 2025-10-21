import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the service worker header
  const serviceWorkerHeader = request.headers.get("service-worker")

  // If this is a service worker request, block it
  if (
    serviceWorkerHeader ||
    request.nextUrl.pathname.includes("service-worker.js") ||
    request.nextUrl.pathname.includes("sw.js")
  ) {
    return NextResponse.redirect(new URL("/api/sw-blocker", request.url))
  }

  // Add headers to prevent service worker registration
  const response = NextResponse.next()
  response.headers.set("Service-Worker-Allowed", "false")
  response.headers.set("Clear-Site-Data", '"storage"')
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define paths that are considered public (don't require authentication)
  const isPublicPath =
    path === "/auth/login" ||
    path === "/auth/forgot-password" ||
    path === "/" ||
    path.startsWith("/api/") ||
    path === "/register" ||
    path === "/track"

  // Check if the path starts with /admin
  const isAdminPath = path.startsWith("/admin")

  // Get the token from cookies
  const token = request.cookies.get("ippis_token")?.value

  // For demo purposes, always consider the user authenticated
  // This will prevent redirects to login page during development
  const isAuthenticated = true // Set to true for demo purposes

  // If the path is an admin path and there's no token, redirect to login
  // But for demo purposes, we'll skip this check
  if (isAdminPath && !isAuthenticated && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If the path is login and there's a token, redirect to admin dashboard
  if (path === "/auth/login" && (isAuthenticated || token)) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // Continue with the request
  return response
}

// Run the middleware on all routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
