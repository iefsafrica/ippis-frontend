// "use client"

// import { useEffect } from "react"

// export default function GlobalPatch() {
//   useEffect(() => {
//     // Prevent automatic service worker registration if it's causing issues
//     if (typeof window !== "undefined" && "serviceWorker" in navigator) {
//       // Store the original registration function
//       const originalRegister = navigator.serviceWorker.register

//       // Override with a version that catches errors
//       navigator.serviceWorker.register = function (...args) {
//         return originalRegister.apply(this, args).catch((error) => {
//           console.warn("Service worker registration suppressed:", error)
//           // Return a resolved promise to prevent errors from bubbling up
//           return Promise.resolve(undefined as any)
//         })
//       }

//       console.log("Applied service worker registration patch")
//     }
//   }, [])

//   return null
// }


"use client";

import { useEffect } from "react";

export default function GlobalPatch() {
  useEffect(() => {
    // Prevent automatic service worker registration if it's causing issues
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      navigator.serviceWorker
    ) {
      // Store the original registration function
      const originalRegister = navigator.serviceWorker.register;

      // Override with a version that catches errors
      navigator.serviceWorker.register = function (...args) {
        return originalRegister.apply(this, args).catch((error) => {
          console.warn("Service worker registration suppressed:", error);
          return Promise.resolve(undefined as any);
        });
      };

      console.log("Applied service worker registration patch");
    }
  }, []);

  return null;
}
