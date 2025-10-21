"use client"

import { useEffect } from "react"
import { initializeServices } from "./services/initialize-services"

export default function ClientInitializer() {
  useEffect(() => {
    // Wrap in try/catch to prevent initialization errors from breaking the app
    try {
      // Add a small delay to ensure document is ready
      setTimeout(() => {
        // Initialize services on the client side
        initializeServices()
        console.log("Services initialized successfully")
      }, 100)
    } catch (error) {
      console.error("Failed to initialize services:", error)
    }
  }, [])

  // This component doesn't render anything
  return null
}
