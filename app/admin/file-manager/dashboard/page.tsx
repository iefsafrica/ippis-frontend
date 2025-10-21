import { FileManagerDashboard } from "./file-manager-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "File Manager | IPPIS Admin",
  description: "Manage all your files and documents in one place",
}

export default function FileManagerPage() {
  return <FileManagerDashboard />
}
