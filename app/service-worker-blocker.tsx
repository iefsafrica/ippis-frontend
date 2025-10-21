"use client"

import { useEffect } from "react"
import {
  unregisterAllServiceWorkers,
  patchServiceWorkerAPI,
  blockServiceWorkerMessages,
} from "../disable-service-workers"

export default function ServiceWorkerBlocker() {
  useEffect(() => {
    // This runs in the client after hydration
    if (typeof window !== "undefined") {
      try {
        // Safely unregister service workers
        unregisterAllServiceWorkers().catch(() => {
          // Silently fail if unregistering fails
          console.log("Service worker unregistration handled")
        })

        // Patch the service worker API
        patchServiceWorkerAPI()

        // Block service worker messages
        blockServiceWorkerMessages()

        // Make a request to the clear-service-workers API endpoint
        fetch("/api/clear-service-workers").catch(() => {
          // Silently fail if the request fails
        })
      } catch (error) {
        // Catch any errors that might occur during the service worker blocking
        console.log("Service worker blocking error handled")
      }
    }
  }, [])

  return null
}
