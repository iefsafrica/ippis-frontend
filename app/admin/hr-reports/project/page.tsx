"use client"

import { useMemo } from "react"
import { ReportLayout } from "../components/report-layout"
import { DateFilter } from "../components/date-filter"
import { useHrProjects } from "@/services/hooks/hr-reports/projects"
import type { Project } from "@/types/calendar/projects"

type ProjectStatusKey = "completed" | "inProgress" | "onHold" | "notStarted"

const statusCardConfig: {
  key: ProjectStatusKey
  title: string
  bgClass: string
  borderClass: string
  textClass: string
  helper: string
}[] = [
  {
    key: "completed",
    title: "Completed",
    bgClass: "bg-green-50",
    borderClass: "border-green-100",
    textClass: "text-green-700",
    helper: "Successfully delivered",
  },
  {
    key: "inProgress",
    title: "In Progress",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-100",
    textClass: "text-blue-700",
    helper: "Active delivery",
  },
  {
    key: "onHold",
    title: "On Hold",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-100",
    textClass: "text-amber-700",
    helper: "Awaiting action",
  },
  {
    key: "notStarted",
    title: "Not Started",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-100",
    textClass: "text-purple-700",
    helper: "Planning phase",
  },
]

const formatDate = (value?: string) => {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

const getStatusKey = (status?: string): ProjectStatusKey => {
  const normalized = (status ?? "").toLowerCase()

  if (normalized.includes("complete")) return "completed"
  if (normalized.includes("hold")) return "onHold"
  if (normalized.includes("start")) return "notStarted"
  return "inProgress"
}

export default function ProjectReportPage() {
  const { data, isLoading, isError } = useHrProjects()
  const projects: Project[] = data?.data ?? []
  const totalProjects = projects.length

  const statusCounts = useMemo(() => {
    const base: Record<ProjectStatusKey, number> = {
      completed: 0,
      inProgress: 0,
      onHold: 0,
      notStarted: 0,
    }

    return projects.reduce<Record<ProjectStatusKey, number>>((acc, project) => {
      const key = getStatusKey(project.project_status)
      acc[key] += 1
      return acc
    }, { ...base })
  }, [projects])

  const tableRows = isLoading ? [] : projects

  return (
    <ReportLayout title="Project Report" description="Monitor project progress, resource allocation, and timelines">
      <DateFilter />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusCardConfig.map((config) => (
            <div
              key={config.key}
              className={`p-4 rounded-lg border ${config.bgClass} ${config.borderClass}`}
            >
              <h3 className={`text-lg font-medium ${config.textClass}`}>{config.title}</h3>
              <p className="text-3xl font-bold mt-2">{isLoading ? "..." : statusCounts[config.key].toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">{config.helper}</p>
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Project Status Overview</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex flex-col items-center justify-center gap-2">
            <p className="text-gray-500">High-level insights coming soon</p>
            <p className="text-sm text-muted-foreground">{isError && !isLoading ? "Unable to load status metrics right now." : `${totalProjects} tracked projects`}</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Resource Allocation</h3>
          <div className="h-[300px] bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <h3 className="text-lg font-medium p-4 border-b">Project Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Project Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Manager</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Progress</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                      Loading projects...
                    </td>
                  </tr>
                )}
                {!isLoading && tableRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                      No projects found for the selected filters.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  tableRows.map((project) => {
                    const completion = Math.min(Math.max(project.completion_percentage ?? 0, 0), 100)
                    const statusKey = getStatusKey(project.project_status)
                    return (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold">{project.project_title}</td>
                        <td className="px-4 py-3 text-sm">{project.project_manager_id}</td>
                        <td className="px-4 py-3 text-sm">{formatDate(project.start_date)}</td>
                        <td className="px-4 py-3 text-sm">{formatDate(project.end_date)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{completion.toFixed(0)}%</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              statusKey === "completed"
                                ? "bg-green-100 text-green-800"
                                : statusKey === "inProgress"
                                ? "bg-blue-100 text-blue-800"
                                : statusKey === "onHold"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {project.project_status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ReportLayout>
  )
}
