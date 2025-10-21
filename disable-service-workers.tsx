// Utility functions to disable service workers

// Function to unregister all service workers
export async function unregisterAllServiceWorkers() {
  if (typeof window === "undefined") {
    return
  }

  try {
    // Check if navigator and serviceWorker exist before accessing
    if (navigator && "serviceWorker" in navigator && navigator.serviceWorker) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log("Unregistered service worker:", registration.scope)
      }
    }
  } catch (error) {
    console.log("Error unregistering service workers - handled gracefully")
  }
}


// Function to patch service worker API
export function patchServiceWorkerAPI() {
  if (typeof window === "undefined") {
    return
  }

  try {
    // Only proceed if navigator exists
    if (!navigator) return

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

    // Check if serviceWorker exists before trying to patch it
    if ("serviceWorker" in navigator) {
      // Use Object.defineProperty to safely replace the serviceWorker object
      try {
        Object.defineProperty(navigator, "serviceWorker", {
          value: {
            // Provide safe methods that won't throw errors
            register: () => {
              console.log("Service Worker registration prevented")
              return Promise.resolve(mockRegistration)
            },
            getRegistration: () => Promise.resolve(null),
            getRegistrations: () => Promise.resolve([]),
            startMessages: () => {},
            controller: null,
            ready: Promise.resolve(mockRegistration),
          },
          configurable: true,
          enumerable: true,
          writable: false,
        })
      } catch (e) {
        console.log("Error redefining serviceWorker - handled gracefully")
      }
    }
  } catch (error) {
    console.log("Error patching service worker API - handled gracefully")
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
        // Specifically catch service worker errors
        if (
          event.message &&
          (event.message.includes("ServiceWorker") ||
            event.message.includes("service worker") ||
            event.message.includes("Failed to register") ||
            event.message.includes("navigator.serviceWorker is null"))
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
            event.reason.message.includes("Failed to register") ||
            event.reason.message.includes("navigator.serviceWorker is null"))
        ) {
          event.preventDefault()
          event.stopPropagation()
          return true
        }
      },
      true,
    )
  } catch (error) {
    console.log("Error setting up service worker message blocking - handled gracefully")
  }
}
