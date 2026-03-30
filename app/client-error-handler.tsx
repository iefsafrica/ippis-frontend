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

    const preventServiceWorker = () => {
      if (typeof navigator !== "undefined" && !navigator.serviceWorker) {
        const mockServiceWorker = {
          register: () =>
            Promise.resolve({
              scope: "/",
              update: () => Promise.resolve(),
              unregister: () => Promise.resolve(true),
              active: null,
              installing: null,
              waiting: null,
              addEventListener: () => {},
              removeEventListener: () => {},
            }),
          getRegistration: () => Promise.resolve(null),
          getRegistrations: () => Promise.resolve([]),
          startMessages: () => {},
          controller: null,
          ready: Promise.resolve({
            scope: "/",
            update: () => Promise.resolve(),
            unregister: () => Promise.resolve(true),
            active: null,
            installing: null,
            waiting: null,
            addEventListener: () => {},
            removeEventListener: () => {},
          }),
        }

        try {
          Object.defineProperty(navigator, "serviceWorker", {
            value: mockServiceWorker,
            configurable: true,
            enumerable: true,
            writable: false,
          })
        } catch (error) {
          console.log("Failed to define mock serviceWorker:", error)
        }
      }
    }

    preventServiceWorker()

    // Clean up
    return () => {
      window.removeEventListener("error", handleError, true)
      window.removeEventListener("unhandledrejection", handleRejection, true)
    }
  }, [])

  return null
}
