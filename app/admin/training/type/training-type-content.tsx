"use client"

import { useMemo } from "react"
import { CoreHRClientWrapper } from "@/app/admin/core-hr/components/core-hr-client-wrapper"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"
import { useGetTrainingTypes } from "@/services/hooks/trainings"
import { toast } from "sonner"

interface TrainingTypeRow {
  id: string
  name: string
  category: string
  duration: string
  trainingCount: number
  status: "active" | "inactive"
}

const trainingTypeColumns = [
  { key: "name", label: "Training Type", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "duration", label: "Duration", sortable: true },
  { key: "trainingCount", label: "Trainings", sortable: true },
  { key: "status", label: "Status", sortable: true },
]

const trainingTypeSearchFields = [
  { name: "name", label: "Training Type", type: "text" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: [
      { value: "Career Growth", label: "Career Growth" },
      { value: "Skills Development", label: "Skills Development" },
    ],
  },
  { name: "duration", label: "Duration", type: "text" },
]

export function TrainingTypeContent() {
  const { data, error } = useGetTrainingTypes()
  const types = useMemo<TrainingTypeRow[]>(() => {
    const payload = data?.data ?? []
    return payload.map((item) => {
      const isActive = (item.status ?? "").toLowerCase() === "active"
      return {
        id: item.type,
        name: item.type,
        category: isActive ? "Career Growth" : "Skills Development",
        duration: `${item.trainings ?? "0"} sessions`,
        trainingCount: Number(item.trainings) || 0,
        status: isActive ? "active" : "inactive",
      }
    })
  }, [data])

  const counts = useMemo(
    () => ({
      totalTypes: types.length,
      activeTypes: types.filter((type) => type.status === "active").length,
      totalTrainings: types.reduce((sum, type) => sum + type.trainingCount, 0),
    }),
    [types],
  )

  if (error) {
    toast.error("Unable to load training types")
  }

  return (
    <CoreHRClientWrapper title="Training Types" endpoint="/api/admin/training">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Training Types
              </h1>
              <p className="text-gray-600 mt-1">Catalog of training categories and their usage.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Training types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{counts.totalTypes}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Active types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{counts.activeTypes}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Total trainings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{counts.totalTrainings}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Training Types Overview</CardTitle>
              <CardDescription className="text-gray-600">Review categories without action buttons.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              title="Training Types"
              columns={trainingTypeColumns}
              data={types}
              searchFields={trainingTypeSearchFields}
              itemsPerPage={10}
            />
          </CardContent>
        </Card>
      </div>
    </CoreHRClientWrapper>
  )
}
