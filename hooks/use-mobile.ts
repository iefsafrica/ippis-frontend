"use client"

import { useState, useEffect, useCallback } from "react"

interface MobileHookReturn {
  isMobile: boolean
  toggleSidebar: () => void
}

export function useMobile(): MobileHookReturn {
  const [isMobile, setIsMobile] = useState(false)

  // Function to check if the screen is mobile
  const checkMobile = useCallback(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768)
    }
  }, [])

  // Toggle sidebar function
  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-sidebar-toggle"))
    }
  }, [])

  // Check on mount and on resize
  useEffect(() => {
    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [checkMobile])

  return { isMobile, toggleSidebar }
}

export default useMobile
