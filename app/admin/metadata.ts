import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | IPPIS Admin",
    default: "Admin Dashboard | IPPIS Nigeria",
  },
  description: "Administrative dashboard for the Integrated Personnel and Payroll Information System",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}
