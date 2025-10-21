"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminLoading from "./loading"
import { useAuth } from "@/lib/auth-context"

export default function AdminClientWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Only redirect if we've finished loading and there's no user
    if (!loading) {
      if (!user) {
        router.push("/admin/login")
      } else {
        setIsReady(true)
      }
    }
  }, [user, loading, router])

  if (loading || !isReady) {
    return <AdminLoading />
  }

  return <>{children}</>
}
