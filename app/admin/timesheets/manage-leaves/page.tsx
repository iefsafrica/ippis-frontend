import type { Metadata } from "next"
import ClientWrapper from "./client-wrapper"

export const metadata: Metadata = {
  title: "Manage Leaves | IPPIS Admin",
  description: "View and manage employee leave requests and balances",
}

export default function ManageLeavesPage() {
  return <ClientWrapper />
}
