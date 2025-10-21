import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Settings | IPPIS Admin",
  description: "Manage system settings and preferences",
}

export default function SettingsPage() {
  return <ClientWrapper />
}
