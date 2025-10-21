// This file contains utilities to disable service workers

// Function to unregister all service workers
export async function unregisterAllServiceWorkers() {
  if (typeof window === "undefined" || !navigator.serviceWorker) {
    return
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
      console.log("Unregistered service worker:", registration.scope)
    }
  } catch (error) {
    console.error("Error unregistering service workers:", error)
  }
}

// Function to patch service worker API
export function patchServiceWorkerAPI() {
  if (typeof window === "undefined" || !navigator.serviceWorker) {
    return
  }

  try {
    // Create a mock registration object
    const mockRegistration = {
      scope: "/",
      update: () => Promise.resolve(),
      unregister: () => Promise.resolve(true),
      active: null,
      installing: null,
      waiting: null,
      addEventListener: () => {},
      removeEventListener: () => {},
    }

    // Replace the register method
    navigator.serviceWorker.register = () => {
      console.warn("Service Worker registration prevented")
      return Promise.resolve(mockRegistration)
    }

    // Replace other methods
    navigator.serviceWorker.getRegistration = () => Promise.resolve(null)
    navigator.serviceWorker.getRegistrations = () => Promise.resolve([])
    navigator.serviceWorker.startMessages = () => {}

    // Set controller to null
    navigator.serviceWorker.controller = null

    // Set ready to resolved promise
    navigator.serviceWorker.ready = Promise.resolve(mockRegistration)
  } catch (error) {
    console.error("Error patching service worker API:", error)
  }
}

// Function to add event listeners to block service worker messages
export function blockServiceWorkerMessages() {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.addEventListener(
      "message",
      (event) => {
        if (
          event.data &&
          (event.data.type === "SKIP_WAITING" ||
            event.data.type === "WAITING_SKIP" ||
            (typeof event.data === "object" && event.data.source === "service-worker"))
        ) {
          event.stopImmediatePropagation()
        }
      },
      true,
    )

    window.addEventListener(
      "error",
      (event) => {
        if (
          event.message &&
          (event.message.includes("ServiceWorker") ||
            event.message.includes("service worker") ||
            event.message.includes("Failed to register"))
        ) {
          event.preventDefault()
          event.stopPropagation()
          return true
        }
      },
      true,
    )

    window.addEventListener(
      "unhandledrejection",
      (event) => {
        if (
          event.reason &&
          event.reason.message &&
          (event.reason.message.includes("ServiceWorker") ||
            event.reason.message.includes("service worker") ||
            event.reason.message.includes("Failed to register"))
        ) {
          event.preventDefault()
          event.stopPropagation()
          return true
        }
      },
      true,
    )
  } catch (error) {
    console.error("Error setting up service worker message blocking:", error)
  }
}
