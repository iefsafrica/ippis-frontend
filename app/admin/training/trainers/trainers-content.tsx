"use client"

import { useMemo } from "react"
import { CoreHRClientWrapper } from "@/app/admin/core-hr/components/core-hr-client-wrapper"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Briefcase, Loader2, RefreshCw } from "lucide-react"
import { useGetTrainers } from "@/services/hooks/trainings"
import { toast } from "sonner"

interface TrainerRow {
  id: string
  name: string
  specialization: string
  contact: string
  status: "active" | "inactive"
  trainings: number
}

const trainerColumns = [
  { key: "name", label: "Trainer", sortable: true },
  { key: "specialization", label: "Specialization", sortable: true },
  { key: "contact", label: "Contact", sortable: false },
  { key: "trainings", label: "Trainings", sortable: true },
  { key: "status", label: "Status", sortable: true },
]

export function TrainersContent() {
  const { data, isLoading, error, refetch } = useGetTrainers()
  const trainers = useMemo<TrainerRow[]>(() => {
    const payload = data?.data ?? []
    return payload.map((trainer, index) => {
      const normalizedStatus = (trainer.status ?? "").toLowerCase()
      return {
        id: `${trainer.trainer_name}-${index}`,
        name: trainer.trainer_name,
        specialization: trainer.type,
        contact: trainer.contact || "N/A",
        trainings: Number(trainer.trainings) || 0,
        status: normalizedStatus === "active" || normalizedStatus === "completed" ? "active" : "inactive",
      }
    })
  }, [data])

  const counts = useMemo(
    () => ({
      totalTrainers: trainers.length,
      activeTrainers: trainers.filter((trainer) => trainer.status === "active").length,
      totalTrainings: trainers.reduce((sum, trainer) => sum + trainer.trainings, 0),
    }),
    [trainers],
  )

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success("Trainers refreshed")
    } catch {
      toast.error("Unable to refresh trainers")
    }
  }

  if (error) {
    toast.error("Unable to load trainers")
  }

  return (
    <CoreHRClientWrapper title="Trainers" endpoint="/api/admin/training">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Trainers
              </h1>
              <p className="text-gray-600 mt-1">Facilitators assigned to training programs.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reload trainers</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Trainers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{counts.totalTrainers}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{counts.activeTrainers}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">Trainings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{counts.totalTrainings}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Trainers Overview</CardTitle>
              <CardDescription className="text-gray-600">Read-only list of trainers</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable title="Trainers" columns={trainerColumns} data={trainers} searchFields={[]} itemsPerPage={10} />
          </CardContent>
        </Card>
      </div>
    </CoreHRClientWrapper>
  )
}
