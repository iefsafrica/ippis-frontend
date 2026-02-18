"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Building2, Calendar, CheckCircle2, Edit, Eye, RefreshCw, Trash2, XCircle } from "lucide-react"
import { toast } from "sonner"
import type { OrganizationRecord } from "../data"

interface OrganizationTableContentProps {
  title: string
  records: OrganizationRecord[]
}

export default function OrganizationTableContent({ title, records }: OrganizationTableContentProps) {
  const [rows, setRows] = useState<OrganizationRecord[]>(records)

  const activeCount = useMemo(() => rows.filter((row) => row.status === "active").length, [rows])
  const inactiveCount = useMemo(() => rows.filter((row) => row.status === "inactive").length, [rows])
  const recentCount = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return rows.filter((row) => new Date(row.createdDate) >= thirtyDaysAgo).length
  }, [rows])

  const searchFields = [
    { name: "name", label: `${title} Name`, type: "text" as const },
    { name: "code", label: "Code", type: "text" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    { name: "createdDate", label: "Created Date", type: "date" as const },
  ]

  const columns = [
    {
      key: "name",
      label: `${title} Name`,
      sortable: true,
      render: (value: string, row: OrganizationRecord) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mr-2 flex-shrink-0">
            <Building2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{value}</div>
            <div className="text-xs text-gray-500">{row.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      render: (value: string) => (
        <div className="text-sm text-gray-600 max-w-[280px] truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: OrganizationRecord["status"]) => (
        <Badge
          variant="outline"
          className={
            value === "active"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-gray-200 bg-gray-50 text-gray-700"
          }
        >
          {value === "active" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
          {value}
        </Badge>
      ),
    },
    {
      key: "createdDate",
      label: "Created Date",
      sortable: true,
      render: (value: string) => {
        const created = new Date(value)
        return (
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center mr-2 flex-shrink-0">
              <Calendar className="h-3 w-3 text-orange-600 mb-0.5" />
              <span className="text-xs font-medium text-orange-700">{created.getDate()}</span>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900">
                {created.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="text-xs text-gray-500">{created.toLocaleDateString("en-US", { year: "numeric" })}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: OrganizationRecord) => (
        <div className="flex justify-start space-x-2">
          <Button variant="outline" size="icon" onClick={() => toast.info(`Viewing ${row.name}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => toast.info(`Editing ${row.name}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-800"
            onClick={() => {
              setRows((prev) => prev.filter((item) => item.id !== row.id))
              toast.success(`${row.name} removed from dummy data`)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-gray-600 mt-1">
              Dummy records for {title.toLowerCase()} management
              <span className="ml-2 text-sm text-gray-500">({rows.length} records)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
            onClick={() => {
              setRows(records)
              toast.success("Dummy data refreshed")
            }}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
            onClick={() => toast.info(`Add ${title} is in demo mode`)}
          >
            Add {title}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inactive {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{inactiveCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recent {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{recentCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{rows.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <DataTable title={title} columns={columns} data={rows} searchFields={searchFields} onAdd={() => toast.info(`Add ${title} is in demo mode`)} />
        </CardContent>
      </Card>
    </div>
  )
}
