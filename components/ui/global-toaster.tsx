"use client"

import { Toaster } from "sonner"

export function GlobalToaster() {
  return (
    <Toaster
      position="bottom-right"
      theme="light"
      richColors
      closeButton
      expand={false}
      duration={4000}
      toastOptions={{
        style: {
          borderLeft: "4px solid #22c55e",
          background: "#f0fdf4",
          color: "#166534",
        },
      }}
    />
  )
}
