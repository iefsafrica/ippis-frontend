"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const EmployeesContent = dynamic(() => import("./employees-content"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

export default function EmployeesClientWrapper() {
  return <EmployeesContent />
}
