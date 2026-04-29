import type { Metadata } from "next"
import PermissionsContent from "./permissions-content"

export const metadata: Metadata = {
  title: "Permissions | IPPIS Admin",
  description: "Manage system permissions",
}

export default function PermissionsPage() {
  return <PermissionsContent />
}
