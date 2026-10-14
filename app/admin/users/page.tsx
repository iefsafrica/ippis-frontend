import type { Metadata } from "next"
import { UsersContent } from "./users-content"

export const metadata: Metadata = {
  title: "User Management & Security | IPPIS Admin",
  description: "Enterprise user administration, multi-role assignment, MDA scoping, and access control audit logs (USR01-USR10)",
}

export default function UsersPage() {
  return <UsersContent />
}
