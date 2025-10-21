import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Database Backup | IPPIS Admin",
  description: "Manage database backups and restoration",
}

export default function BackupPage() {
  return <ClientWrapper />
}
