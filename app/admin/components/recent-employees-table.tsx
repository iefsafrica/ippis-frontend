"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"

type RecentEmployee = {
  id: string
  name: string
  email: string
  department: string
  status: "active" | "pending" | "inactive" | string
  date: string
}

interface RecentEmployeesTableProps {
  data?: RecentEmployee[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDeactivate?: (id: string) => void
}

const statusClasses: Record<string, string> = {
  active: "bg-[#008751]/10 text-[#008751] border-[#008751]/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "—"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return dateString
  }
}

const getUserInitials = (name?: string) => {
  if (!name) return "U"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function RecentEmployeesTable({
  data = [],
  onView,
  onEdit,
  onDeactivate,
}: RecentEmployeesTableProps) {
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value: string, row: RecentEmployee) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#008751]/10 text-[#008751]">
              {getUserInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "status",
      label: "Status",
      render: (_value: string, row: RecentEmployee) => {
        const rawStatus = row.status || "inactive"
        const normalized = rawStatus.toLowerCase()
        const label = normalized.charAt(0).toUpperCase() + normalized.slice(1)
        const className = statusClasses[normalized] || statusClasses.inactive

        return (
          <Badge variant="outline" className={className}>
            {label}
          </Badge>
        )
      },
    },
    {
      key: "date",
      label: "Date",
      render: (value: string) => formatDate(value),
    },
  ]

  const handleAction = {
    onView: (id: string) => onView?.(id),
    onEdit: (id: string) => onEdit?.(id),
    onDelete: (id: string) => onDeactivate?.(id),
  }

  return (
    <EnhancedDataTable
      title="Recent Employees"
      data={data}
      columns={columns}
      onAdd={() => undefined}
      onView={handleAction.onView}
      onEdit={handleAction.onEdit}
      onDelete={handleAction.onDelete}
      filterOptions={[]}
    />
  )
}
