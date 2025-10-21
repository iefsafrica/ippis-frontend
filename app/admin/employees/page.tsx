import type { Metadata } from "next"
import EmployeesClientWrapper from "./client-wrapper"
import { SetupDatabaseButton } from "../components/setup-database-button"

export const metadata: Metadata = {
  title: "IPPIS - Employees",
  description: "Manage and view all approved employees in the system.",
}

export default function EmployeesPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SetupDatabaseButton />
      </div>
      <EmployeesClientWrapper />
    </div>
  )
}
