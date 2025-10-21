"use client"

import { useEffect } from "react"

export default function HeadScript() {
  useEffect(() => {
    // Safely initialize any scripts that might register service workers
    const initializeScripts = async () => {
      try {
        // Add a small delay to ensure document is ready
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Any service worker registration or initialization can go here
        // This ensures the document is in a valid state first

        console.log("Scripts initialized successfully")
      } catch (error) {
        console.error("Failed to initialize scripts:", error)
      }
    }

    // Only run in browser environment
    if (typeof window !== "undefined") {
      initializeScripts()
    }

    return () => {
      // Cleanup if needed
    }
  }, [])

  return null
}
