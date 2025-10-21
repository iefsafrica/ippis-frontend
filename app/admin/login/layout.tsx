import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login | IPPIS",
  description: "Login to the IPPIS Admin Portal",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      {children}
    </div>
  )
}
