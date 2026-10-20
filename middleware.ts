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
  const path = request.nextUrl.pathname

  const isAuthRoute =
    path === "/admin/login" ||
    path === "/admin/forgot-password" ||
    path === "/admin/reset-password" ||
    path === "/auth/login" ||
    path === "/auth/forgot-password" ||
    path === "/login" ||
    path === "/forgot-password" ||
    path === "/reset-password"

  const isPublicPath =
    isAuthRoute ||
    path === "/" ||
    path.startsWith("/api/") ||
    path === "/register" ||
    path === "/track"

  const isAdminPath = path.startsWith("/admin")
  const token = request.cookies.get("token")?.value || request.cookies.get("ippis_token")?.value

  // Protect admin routes: redirect unauthenticated requests to /admin/login (except auth routes)
  if (isAdminPath && !isAuthRoute && !token) {
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(loginUrl)
  }

  // If the path is admin login and there is already a token, redirect to admin dashboard
  if ((path === "/admin/login" || path === "/login") && token) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // Continue with the request
  return response
}

// Run the middleware on all routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
