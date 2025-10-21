import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Clear cookies
  const cookieStore = cookies()

  // Clear any auth cookies (adjust names as needed for your auth system)
  cookieStore.delete("auth_token")
  cookieStore.delete("user_session")

  // Redirect to login page
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))
}
