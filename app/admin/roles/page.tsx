import type { Metadata } from "next"
import RolesContent from "./roles-content"

export const metadata: Metadata = {
  title: "Roles | IPPIS Admin",
  description: "Manage system roles and role assignments",
}

export default function RolesPage() {
  return <RolesContent />
}
