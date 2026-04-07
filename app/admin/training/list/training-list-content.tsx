"use client"

import { useEffect, useMemo, useState } from "react"
import { CoreHRClientWrapper } from "@/app/admin/core-hr/components/core-hr-client-wrapper"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format } from "date-fns"
import { Briefcase, Calendar, DollarSign, Edit, Eye, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { useCreateTraining, useDeleteTraining, useGetTrainings, useUpdateTraining } from "@/services/hooks/trainings"
import { LocalTraining, TrainingFormData, mapApiTrainingToLocal, transformFormToCreateTraining, transformFormToUpdateTraining } from "@/utils/training-converters"
import { ViewTrainingDialog } from "./ViewTrainingDialog"

const trainingSearchFields = [
  { name: "title", label: "Training Title", type: "text" as const },
  { name: "trainer", label: "Trainer", type: "text" as const },
  {
    name: "type",
    label: "Training Type",
    type: "select" as const,
    options: [
      { value: "Professional Development", label: "Professional Development" },
      { value: "Technical Skills", label: "Technical Skills" },
      { value: "Soft Skills", label: "Soft Skills" },
      { value: "Compliance", label: "Compliance" },
      { value: "Onboarding", label: "Onboarding" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "upcoming", label: "Upcoming" },
      { value: "in-progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  { name: "startDate", label: "Start Date", type: "date" as const },
]

const statusBadge: Record<string, string> = {
  upcoming: "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800",
  "in-progress": "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800",
  completed: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800",
  cancelled: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800",
}

const TRAINING_TAB_SEQUENCE = ["basic", "schedule"] as const
type TrainingTab = (typeof TRAINING_TAB_SEQUENCE)[number]

const TAB_LABELS: Record<TrainingTab, string> = {
  basic: "Basic",
  schedule: "Schedule",
}

const trainingTabFields: Record<TrainingTab, FormField[]> = {
  basic: [
    {
      name: "title",
      label: "Training Title",
      type: "text",
      placeholder: "Enter training title",
      required: true,
    },
    {
      name: "type",
      label: "Training Type",
      type: "select",
      options: [
        { value: "Professional Development", label: "Professional Development" },
        { value: "Technical Skills", label: "Technical Skills" },
        { value: "Soft Skills", label: "Soft Skills" },
        { value: "Compliance", label: "Compliance" },
        { value: "Onboarding", label: "Onboarding" },
      ],
      required: true,
    },
    {
      name: "trainer",
      label: "Trainer",
      type: "text",
      placeholder: "Enter trainer name",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "upcoming", label: "Upcoming" },
        { value: "in-progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
      required: true,
    },
  ],
  schedule: [
    {
      name: "startDate",
      label: "Start Date",
      type: "date",
      datePickerVariant: "input",
      placeholder: "Pick a start date",
      required: true,
    },
    {
      name: "participants",
      label: "Participants",
      type: "number",
      placeholder: "Enter number of participants",
      required: true,
    },
    {
      name: "cost",
      label: "Cost (₦)",
      type: "number",
      placeholder: "Enter cost in Naira",
      required: true,
    },
  ],
}

export function TrainingListContent() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<LocalTraining | null>(null)
  const [localTrainings, setLocalTrainings] = useState<LocalTraining[]>([])
  const [activeAddTab, setActiveAddTab] = useState<TrainingTab>("basic")
  const [activeEditTab, setActiveEditTab] = useState<TrainingTab>("basic")
  const [addFormValues, setAddFormValues] = useState<Partial<TrainingFormData>>({})
  const [editFormValues, setEditFormValues] = useState<Partial<TrainingFormData>>({})

  const {
    data: trainingsData,
    isLoading: isLoadingTrainings,
    isError: isTrainingsError,
    error: trainingsError,
    isFetching: isFetchingTrainings,
    refetch: refetchTrainings,
  } = useGetTrainings()

  const createTrainingMutation = useCreateTraining()
  const updateTrainingMutation = useUpdateTraining()
  const deleteTrainingMutation = useDeleteTraining()

  const getNextTrainingTab = (current: TrainingTab): TrainingTab => {
    const currentIndex = TRAINING_TAB_SEQUENCE.indexOf(current)
    if (currentIndex === -1 || currentIndex >= TRAINING_TAB_SEQUENCE.length - 1) {
      return current
    }
    return TRAINING_TAB_SEQUENCE[currentIndex + 1]
  }

  const isFinalTrainingTab = (tab: TrainingTab) => tab === TRAINING_TAB_SEQUENCE[TRAINING_TAB_SEQUENCE.length - 1]

  useEffect(() => {
    if (!trainingsData?.data) {
      setLocalTrainings([])
      return
    }

    const mapped = trainingsData.data.map(mapApiTrainingToLocal)
    const sorted = mapped.sort(
      (a, b) => new Date(b.startDate).valueOf() - new Date(a.startDate).valueOf(),
    )
    setLocalTrainings(sorted)
  }, [trainingsData])

  useEffect(() => {
    if (isTrainingsError && trainingsError) {
      toast.error("Unable to load trainings. Please try again.")
    }
  }, [isTrainingsError, trainingsError])

  const isBusy =
    isFetchingTrainings ||
    createTrainingMutation.isPending ||
    updateTrainingMutation.isPending ||
    deleteTrainingMutation.isPending

  const stats = useMemo(
    () => [
      {
        label: "Training programs",
        value: localTrainings.length,
        description: "Active & planned programs",
      },
      {
        label: "Participants",
        value: localTrainings.reduce((sum, training) => sum + (training.participants ?? 0), 0),
        description: "Registered employees",
      },
      {
        label: "Investment",
        value: `₦ ${localTrainings.reduce((sum, training) => sum + (training.cost ?? 0), 0).toLocaleString()}`,
        description: "Program budgets",
      },
    ],
    [localTrainings],
  )

  const currentDialogTab = isEditing ? activeEditTab : activeAddTab
  const setCurrentDialogTab = (tab: TrainingTab) => {
    if (isEditing) {
      setActiveEditTab(tab)
    } else {
      setActiveAddTab(tab)
    }
  }
  const currentFormValues = isEditing ? editFormValues : addFormValues

  const handleAdd = () => {
    setIsEditing(false)
    setSelectedTraining(null)
    setAddFormValues({})
    setActiveAddTab("basic")
    setAddEditDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const training = localTrainings.find((item) => item.id === id)
    if (!training) return
    setIsEditing(true)
    setSelectedTraining(training)
    setEditFormValues({
      title: training.title,
      type: training.type,
      trainer: training.trainer,
      status: training.status,
      startDate: training.startDate,
      participants: training.participants,
      cost: training.cost,
    })
    setActiveEditTab("basic")
    setAddEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const training = localTrainings.find((item) => item.id === id)
    if (!training) return
    setSelectedTraining(training)
    setViewDialogOpen(true)
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [trainingToDelete, setTrainingToDelete] = useState<LocalTraining | null>(null)

  const handleOpenDeleteDialog = (training: LocalTraining) => {
    setTrainingToDelete(training)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!trainingToDelete) return
    try {
      await deleteTrainingMutation.mutateAsync(Number(trainingToDelete.id))
      setLocalTrainings((prev) => prev.filter((item) => item.id !== trainingToDelete.id))
      toast.success(`${trainingToDelete.title} deleted`)
      if (selectedTraining?.id === trainingToDelete.id) {
        setSelectedTraining(null)
        setViewDialogOpen(false)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete training")
    } finally {
      setIsDeleteDialogOpen(false)
      setTrainingToDelete(null)
    }
  }

  const handleFinalSubmit = async (form: TrainingFormData) => {
    try {
      if (isEditing && selectedTraining) {
        const response = await updateTrainingMutation.mutateAsync({
          id: Number(selectedTraining.id),
          data: transformFormToUpdateTraining(form),
        })
        if (response.success) {
          const updated = mapApiTrainingToLocal(response.data)
          setLocalTrainings((prev) => prev.map((item) => (item.id === selectedTraining.id ? updated : item)))
          setSelectedTraining(updated)
          toast.success(response.message || "Training updated")
        }
      } else {
        const response = await createTrainingMutation.mutateAsync(transformFormToCreateTraining(form))
        if (response.success) {
          const created = mapApiTrainingToLocal(response.data)
          setLocalTrainings((prev) => [created, ...prev])
          toast.success(response.message || "Training created")
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save training")
    } finally {
      setAddFormValues({})
      setEditFormValues({})
      setActiveAddTab("basic")
      setActiveEditTab("basic")
      setAddEditDialogOpen(false)
      setIsEditing(false)
    }
  }

  const handleAddTabSubmit = async (tab: TrainingTab, data: Record<string, any>) => {
    const combined = { ...addFormValues, ...data }
    setAddFormValues(combined)
    if (isFinalTrainingTab(tab)) {
      await handleFinalSubmit(combined as TrainingFormData)
    } else {
      setActiveAddTab(getNextTrainingTab(tab))
    }
  }

  const handleEditTabSubmit = async (tab: TrainingTab, data: Record<string, any>) => {
    const combined = { ...editFormValues, ...data }
    setEditFormValues(combined)
    if (isFinalTrainingTab(tab)) {
      await handleFinalSubmit(combined as TrainingFormData)
    } else {
      setActiveEditTab(getNextTrainingTab(tab))
    }
  }

  const columns = [
    {
      key: "title",
      label: "Training Title",
      sortable: true,
      render: (value: string) => <span className="font-medium text-gray-900 truncate">{value}</span>,
    },
    {
      key: "trainer",
      label: "Trainer",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <span className="truncate max-w-[150px]">{value}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
    },
    {
      key: "startDate",
      label: "Start Date",
      sortable: true,
      render: (value: string, row: LocalTraining) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="flex flex-col text-sm text-gray-700">
                  <span>{value ? format(new Date(value), "MMM d, yyyy") : "TBD"}</span>
                  <span className="text-xs text-gray-400">
                    {row.endDate ? format(new Date(row.endDate), "MMM d, yyyy") : "No end date"}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Period: {value ? new Date(value).toLocaleDateString() : "TBD"} –{" "}
                {row.endDate ? new Date(row.endDate).toLocaleDateString() : "ongoing"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "participants",
      label: "Participants",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span>{typeof value === "number" ? value : "0"}</span>
        </div>
      ),
    },
    {
      key: "cost",
      label: "Cost",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span>₦{typeof value === "number" ? value.toLocaleString() : "0"}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const normalized = (value || "").toLowerCase()
        const badgeClass = statusBadge[normalized] ?? statusBadge["upcoming"]
        return (
          <Badge className={`${badgeClass} px-3 py-1.5 font-medium rounded-full`}>
            {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
          </Badge>
        )
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: LocalTraining) => (
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleView(row.id)}
            className="border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row.id)}
            className="border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenDeleteDialog(row)}
            className="border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoadingTrainings) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Training Programs
              </h1>
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (isTrainingsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Training Programs</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Briefcase className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-500 font-medium">Error loading training programs</p>
            <p className="text-gray-600 mt-1 text-sm">{trainingsError?.message}</p>
            <button
              onClick={() => refetchTrainings()}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-sm hover:shadow-md transition-all"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CoreHRClientWrapper title="Training Programs" endpoint="/api/admin/training">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Training Programs
              </h1>
              <p className="text-gray-600 mt-1">
                Manage employee training, schedules, and costs
                {localTrainings.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">({localTrainings.length} programs)</span>
                )}
              </p>
            </div>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            disabled={isBusy}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Add Training Program
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <CardDescription className="text-xs text-gray-500 mt-1">{stat.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Training Programs</CardTitle>
                <CardDescription className="text-gray-600">Review and update training entries.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              title="Training Programs"
              columns={columns}
              data={localTrainings}
              searchFields={trainingSearchFields}
              itemsPerPage={10}
            />
          </CardContent>
        </Card>

        <Dialog
          open={addEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setAddEditDialogOpen(false)
              setIsEditing(false)
              setSelectedTraining(null)
              setAddFormValues({})
              setEditFormValues({})
              setActiveAddTab("basic")
              setActiveEditTab("basic")
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Training Program" : "Add Training Program"}</DialogTitle>
            </DialogHeader>
            <Tabs value={currentDialogTab} onValueChange={(value) => setCurrentDialogTab(value as TrainingTab)}>
              <TabsList className="grid grid-cols-3">
                {TRAINING_TAB_SEQUENCE.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {TAB_LABELS[tab]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {TRAINING_TAB_SEQUENCE.map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <EnhancedForm
                    fields={trainingTabFields[tab]}
                    onSubmit={(data) =>
                      isEditing ? handleEditTabSubmit(tab, data) : handleAddTabSubmit(tab, data)
                    }
                    onCancel={() => {
                      setAddEditDialogOpen(false)
                      setIsEditing(false)
                      setSelectedTraining(null)
                    }}
                    isSubmitting={createTrainingMutation.isPending || updateTrainingMutation.isPending}
                    submitLabel={
                      isFinalTrainingTab(tab)
                        ? isEditing
                          ? "Update"
                          : "Create"
                        : "Next"
                    }
                    initialValues={currentFormValues ?? undefined}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </DialogContent>
        </Dialog>

        {selectedTraining && (
          <ViewTrainingDialog
            training={selectedTraining}
            isOpen={viewDialogOpen}
            onClose={() => {
              setViewDialogOpen(false)
              setSelectedTraining(null)
            }}
            onEdit={() => {
              setViewDialogOpen(false)
              handleEdit(selectedTraining.id)
            }}
            onDelete={() => {
              setViewDialogOpen(false)
              handleOpenDeleteDialog(selectedTraining)
            }}
          />
        )}

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setTrainingToDelete(null)
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Training Program"
          description={`Are you sure you want to delete ${trainingToDelete?.title ?? "this training"}?`}
          itemName={trainingToDelete?.title ?? "this training"}
          isLoading={deleteTrainingMutation.isPending}
        />
      </div>
    </CoreHRClientWrapper>
  )
}
