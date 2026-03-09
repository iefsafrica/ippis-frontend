"use client"

import { useEffect, useMemo, useState } from "react"
import { ReportLayout } from "../components/report-layout"
import { DateFilter } from "../components/date-filter"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import { getEmployeesList } from "@/services/endpoints/employees/employees"
import { useGetLeaves } from "@/services/hooks/calendar/leaves"
import type { Employee } from "@/types/employees/employee-management"

const isDateWithinRange = (value: Date, start: Date, end: Date) => {
  const dayValue = new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const dayEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return dayValue >= dayStart && dayValue <= dayEnd
}

export default function EmployeesReportPage() {
  const { data: firstPageEmployees, isLoading: isEmployeesLoading } = useEmployeesList(1)
  const { data: leavesResponse, isLoading: isLeavesLoading } = useGetLeaves()
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [isHydratingEmployees, setIsHydratingEmployees] = useState(false)

  useEffect(() => {
    const hydrateEmployees = async () => {
      const pageOneEmployees = firstPageEmployees?.employees ?? []
      const totalPages = firstPageEmployees?.pagination?.totalPages ?? 1

      if (!pageOneEmployees.length) {
        setAllEmployees([])
        return
      }

      if (totalPages <= 1) {
        setAllEmployees(pageOneEmployees)
        return
      }

      setIsHydratingEmployees(true)

      try {
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, idx) => getEmployeesList(idx + 2)),
        )

        const merged = [...pageOneEmployees, ...remainingPages.flatMap((page) => page.employees ?? [])]

        // De-duplicate in case the API returns overlapping records.
        const deduplicated = Array.from(new Map(merged.map((employee) => [employee.id, employee])).values())
        setAllEmployees(deduplicated)
      } catch {
        setAllEmployees(pageOneEmployees)
      } finally {
        setIsHydratingEmployees(false)
      }
    }

    hydrateEmployees()
  }, [firstPageEmployees])

  const activeLeaveEmployeeIds = useMemo(() => {
    const leaves = leavesResponse?.data ?? []
    const today = new Date()

    return new Set(
      leaves
        .filter((leave) => {
          const status = (leave.status ?? "").toLowerCase()
          const isApproved = !status || status === "approved" || status === "active"

          const startDate = new Date(leave.start_date)
          const endDate = new Date(leave.end_date)
          const hasValidDates = !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())

          return isApproved && hasValidDates && isDateWithinRange(today, startDate, endDate)
        })
        .map((leave) => String(leave.employee_id)),
    )
  }, [leavesResponse])

  const stats = useMemo(() => {
    const totalEmployees = firstPageEmployees?.pagination?.total ?? allEmployees.length

    const inactiveEmployees = allEmployees.filter(
      (employee) => String(employee.status).toLowerCase() === "inactive",
    ).length

    const onLeaveEmployees = allEmployees.filter((employee) => activeLeaveEmployeeIds.has(String(employee.id))).length

    const activeEmployees = allEmployees.filter(
      (employee) =>
        String(employee.status).toLowerCase() === "active" && !activeLeaveEmployeeIds.has(String(employee.id)),
    ).length

    return {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      inactiveEmployees,
    }
  }, [firstPageEmployees, allEmployees, activeLeaveEmployeeIds])

  const isStatsLoading = isEmployeesLoading || isLeavesLoading || isHydratingEmployees
  const activePercent = stats.totalEmployees > 0 ? ((stats.activeEmployees / stats.totalEmployees) * 100).toFixed(1) : "0.0"
  const onLeavePercent = stats.totalEmployees > 0 ? ((stats.onLeaveEmployees / stats.totalEmployees) * 100).toFixed(1) : "0.0"
  const inactivePercent = stats.totalEmployees > 0 ? ((stats.inactiveEmployees / stats.totalEmployees) * 100).toFixed(1) : "0.0"

  return (
    <ReportLayout title="Employees Report" description="Comprehensive employee data, demographics, and statistics">
      <DateFilter />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700">Total Employees</h3>
            <p className="text-3xl font-bold mt-2">{isStatsLoading ? "..." : stats.totalEmployees.toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-1">Live count from employee records</p>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700">Active</h3>
            <p className="text-3xl font-bold mt-2">{isStatsLoading ? "..." : stats.activeEmployees.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">{activePercent}% of total</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-amber-700">On Leave</h3>
            <p className="text-3xl font-bold mt-2">{isStatsLoading ? "..." : stats.onLeaveEmployees.toLocaleString()}</p>
            <p className="text-sm text-amber-600 mt-1">{onLeavePercent}% of total</p>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-700">Inactive</h3>
            <p className="text-3xl font-bold mt-2">{isStatsLoading ? "..." : stats.inactiveEmployees.toLocaleString()}</p>
            <p className="text-sm text-red-600 mt-1">{inactivePercent}% of total</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Gender Distribution</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Age Distribution</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Department Distribution</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Years of Service</h3>
            <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h3 className="text-lg font-medium p-4 border-b">Employee Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Employee ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Position</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Hire Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">EMP-{1000 + i}</td>
                      <td className="px-4 py-3 text-sm">John Doe</td>
                      <td className="px-4 py-3 text-sm">IT</td>
                      <td className="px-4 py-3 text-sm">Software Engineer</td>
                      <td className="px-4 py-3 text-sm">2020-06-15</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReportLayout>
  )
}
