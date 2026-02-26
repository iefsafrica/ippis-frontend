"use client"

import dynamic from "next/dynamic"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2, Users, UserCheck, UserX, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import { usePendingEmployees } from "@/services/hooks/employees/usePendingEmployees"

type EmployeeTab = "employee" | "pending" | "import"

const EmployeesClientWrapper = dynamic(() => import("./client-wrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[40vh] w-full items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
    </div>
  ),
})

const PendingClientWrapper = dynamic(() => import("../pending/client-wrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[40vh] w-full items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
    </div>
  ),
})

const ImportClientWrapper = dynamic(() => import("../import/client-wrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[40vh] w-full items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
    </div>
  ),
})

const tabs: { key: EmployeeTab; label: string }[] = [
  { key: "employee", label: "Employee" },
  { key: "pending", label: "Pending Employee" },
  { key: "import", label: "Import Employees" },
]

export default function EmployeeSections() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tabParam = searchParams.get("tab")
  const activeTab: EmployeeTab =
    tabParam === "pending" || tabParam === "import" ? tabParam : "employee"
  const { data: employeesData } = useEmployeesList(1)
  const { data: pendingData } = usePendingEmployees(1, 10)

  const onTabChange = (tab: EmployeeTab) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === "employee") {
      params.delete("tab")
    } else {
      params.set("tab", tab)
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const sectionMeta: Record<EmployeeTab, { title: string; description: string }> = {
    employee: {
      title: "Employees",
      description: "Manage and view all approved employees in the system.",
    },
    pending: {
      title: "Pending Employees",
      description: "Manage and review employee submissions awaiting approval.",
    },
    import: {
      title: "Import Employees",
      description: "Upload and validate employee records from CSV.",
    },
  }

  const employeeRows = employeesData?.employees || []
  const totalEmployees = employeesData?.pagination?.total || 0
  const activeEmployees = employeeRows.filter((emp) => emp.status === "active").length
  const inactiveEmployees = employeeRows.filter((emp) => emp.status === "inactive").length
  const pendingEmployees = pendingData?.data?.pagination?.total || 0
  const statsByTab: Record<
    EmployeeTab,
    Array<{
      title: string
      value: number
      icon: typeof Users
      iconClassName: string
    }>
  > = {
    employee: [
      { title: "Total Employees", value: totalEmployees, icon: Users, iconClassName: "border-blue-200 bg-blue-100 text-blue-700" },
      { title: "Active (Current Page)", value: activeEmployees, icon: UserCheck, iconClassName: "border-green-200 bg-green-100 text-green-700" },
      { title: "Inactive (Current Page)", value: inactiveEmployees, icon: UserX, iconClassName: "border-red-200 bg-red-100 text-red-700" },
      { title: "Pending Queue", value: pendingEmployees, icon: Clock3, iconClassName: "border-amber-200 bg-amber-100 text-amber-700" },
    ],
    pending: [
      { title: "Pending Queue", value: pendingEmployees, icon: Clock3, iconClassName: "border-amber-200 bg-amber-100 text-amber-700" },
      { title: "Total Employees", value: totalEmployees, icon: Users, iconClassName: "border-blue-200 bg-blue-100 text-blue-700" },
      { title: "Active (Current Page)", value: activeEmployees, icon: UserCheck, iconClassName: "border-green-200 bg-green-100 text-green-700" },
      { title: "Inactive (Current Page)", value: inactiveEmployees, icon: UserX, iconClassName: "border-red-200 bg-red-100 text-red-700" },
    ],
    import: [
      { title: "Pending Queue", value: pendingEmployees, icon: Clock3, iconClassName: "border-amber-200 bg-amber-100 text-amber-700" },
      { title: "Total Employees", value: totalEmployees, icon: Users, iconClassName: "border-blue-200 bg-blue-100 text-blue-700" },
      { title: "Active (Current Page)", value: activeEmployees, icon: UserCheck, iconClassName: "border-green-200 bg-green-100 text-green-700" },
      { title: "Inactive (Current Page)", value: inactiveEmployees, icon: UserX, iconClassName: "border-red-200 bg-red-100 text-red-700" },
    ],
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 p-2 shadow-sm">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            type="button"
            variant={activeTab === tab.key ? "default" : "outline"}
            className={
              activeTab === tab.key
                ? "rounded-lg border border-[#008751] bg-[#008751] text-white shadow-sm transition-colors hover:bg-[#006f43]"
                : "rounded-lg border border-emerald-200 bg-white text-emerald-800 transition-colors hover:border-emerald-400 hover:bg-emerald-100 hover:text-emerald-900"
            }
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statsByTab[activeTab].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border border-gray-200 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className={`mr-3 flex h-8 w-8 items-center justify-center rounded-lg border ${stat.iconClassName}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card
        className={
          activeTab === "employee"
            ? "overflow-hidden rounded-xl border border-gray-200 shadow-sm"
            : "overflow-hidden rounded-xl border border-gray-200 shadow-lg"
        }
      >
        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 transition-colors hover:from-gray-100 hover:to-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {sectionMeta[activeTab].title}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {sectionMeta[activeTab].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[72vh] overflow-auto [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-slate-100 [&_tbody_tr:nth-child(odd)_td]:bg-white [&_tbody_tr:nth-child(even)_td]:bg-slate-50/85 [&_tbody_tr:hover_td]:bg-emerald-50/70">
            {activeTab === "employee" && <EmployeesClientWrapper />}
            {activeTab === "pending" && <PendingClientWrapper />}
            {activeTab === "import" && <ImportClientWrapper />}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
