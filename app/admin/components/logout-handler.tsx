"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

export default function LogoutHandler() {
  const { logout } = useAuth()

  useEffect(() => {
    logout()
  }, [logout])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Logging out...</h1>
        <p className="text-gray-600">You are being logged out of the system.</p>
      </div>
    </div>
  )
}
