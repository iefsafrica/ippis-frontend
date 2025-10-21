"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Employee3 } from "@/types/employee"

const EmployeesContent = dynamic(() => import("./employees-content"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

export default function EmployeesClientWrapper() {
  const [employees, setEmployees] = useState<Employee3[]>([])

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await fetch("/api/admin/employees")
      const data = await res.json()
      setEmployees((data.data?.employees || []).filter((emp: Employee3) => emp.status === "active"))
    }
    fetchEmployees()
  }, [])

  return <EmployeesContent employees={employees} />
}