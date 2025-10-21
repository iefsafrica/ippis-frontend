"use client"

import { useEffect } from "react"

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Add a global error handler for service worker related errors
    const handleServiceWorkerError = (event: Event) => {
      const error = (event as ErrorEvent).error || (event as any).reason

      // Check if this is a service worker related error
      if (
        error &&
        (error.name === "InvalidStateError" ||
          (typeof error.message === "string" &&
            (error.message.includes("ServiceWorker") ||
              error.message.includes("service worker") ||
              error.message.includes("Failed to register"))))
      ) {
        // Prevent the error from propagating
        event.preventDefault()
        event.stopPropagation()

        // Log the error silently (for debugging only)
        console.debug("[ServiceWorker] Prevented error:", error.message)
        return true
      }
      return false
    }

    // Add event listeners for both error types
    window.addEventListener("error", handleServiceWorkerError, true)
    window.addEventListener("unhandledrejection", handleServiceWorkerError, true)

    // Clean up on unmount
    return () => {
      window.removeEventListener("error", handleServiceWorkerError, true)
      window.removeEventListener("unhandledrejection", handleServiceWorkerError, true)
    }
  }, [])

  return null
}
