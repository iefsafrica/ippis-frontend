"use client"

import { useEffect } from "react"

export default function ClientErrorHandler() {
  useEffect(() => {
    // Handle global errors
    const handleError = (event: ErrorEvent) => {
      // Check if this is a service worker related error
      if (
        event.message &&
        (event.message.includes("ServiceWorker") ||
          event.message.includes("service worker") ||
          event.message.includes("Failed to register") ||
          event.message.includes("navigator.serviceWorker is null"))
      ) {
        // Prevent the error from propagating
        event.preventDefault()
        event.stopPropagation()
        console.log("Service worker error handled by ClientErrorHandler")
        return true
      }

      // Log other errors
      console.error("Client error:", event.message)
    }

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      // Check if this is a service worker related rejection
      if (
        event.reason &&
        event.reason.message &&
        (event.reason.message.includes("ServiceWorker") ||
          event.reason.message.includes("service worker") ||
          event.reason.message.includes("Failed to register") ||
          event.reason.message.includes("navigator.serviceWorker is null"))
      ) {
        // Prevent the rejection from propagating
        event.preventDefault()
        event.stopPropagation()
        console.log("Service worker rejection handled by ClientErrorHandler")
        return true
      }

      // Log other rejections
      console.error("Unhandled promise rejection:", event.reason)
    }

    // Add event listeners
    window.addEventListener("error", handleError, true)
    window.addEventListener("unhandledrejection", handleRejection, true)

    // Clean up
    return () => {
      window.removeEventListener("error", handleError, true)
      window.removeEventListener("unhandledrejection", handleRejection, true)
    }
  }, [])

  return null
}
