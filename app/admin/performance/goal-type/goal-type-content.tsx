"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { AddGoalTypeDialog } from "./add-goal-type-dialog"
import { EditGoalTypeDialog } from "./edit-goal-type-dialog"
import { ViewGoalTypeDialog } from "./view-goal-type-dialog"
import {
  Target,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

export interface TableGoalType {
  id: string
  goalType: string
  description: string
  status: "active" | "inactive"
  createdDate: string
}

interface GoalTypeContentProps {
  goalTypes: TableGoalType[]
  isLoading: boolean
  isError?: boolean
  errorMessage?: string
  onRefresh: () => void
  onAddGoalType: (goalType: { goal_type: string; description: string; status: "active" | "inactive" }) => void
  onEditGoalType: (id: string, data: { goal_type: string; description: string; status: "active" | "inactive" }) => void
  onDeleteGoalType: (id: string) => void
}

const searchFields = [
  { name: "goalType", label: "Goal Type", type: "text" as const },
  { name: "description", label: "Description", type: "text" as const },
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

export default function GoalTypeContent({
  goalTypes,
  isLoading,
  isError,
  errorMessage,
  onRefresh,
  onAddGoalType,
  onEditGoalType,
  onDeleteGoalType,
}: GoalTypeContentProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentGoalType, setCurrentGoalType] = useState<TableGoalType | null>(null)

  const activeCount = useMemo(
    () => goalTypes.filter((g) => g.status === "active").length,
    [goalTypes]
  )
  const inactiveCount = useMemo(
    () => goalTypes.filter((g) => g.status === "inactive").length,
    [goalTypes]
  )
  const recentCount = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return goalTypes.filter((g) => {
      try {
        return new Date(g.createdDate) >= thirtyDaysAgo
      } catch {
        return false
      }
    }).length
  }, [goalTypes])
  const totalCount = goalTypes.length

  const handleManualRefresh = () => {
    toast.info("Refreshing goal types...")
    onRefresh()
  }

  const handleAddGoalType = async (data: { goal_type: string; description: string; status: "active" | "inactive" }) => {
    try {
      await onAddGoalType(data)
    } catch (error) {
      throw error
    }
  }

  const handleView = (id: string) => {
    const goalType = goalTypes.find((g) => g.id === id)
    if (!goalType) {
      toast.error("Goal type not found")
      return
    }
    setCurrentGoalType(goalType)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const goalType = goalTypes.find((g) => g.id === id)
    if (!goalType) {
      toast.error("Goal type not found")
      return
    }
    setCurrentGoalType(goalType)
    setIsEditDialogOpen(true)
  }

  const handleDeletePrompt = (id: string) => {
    const goalType = goalTypes.find((g) => g.id === id)
    if (!goalType) {
      toast.error("Goal type not found")
      return
    }
    setCurrentGoalType(goalType)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!currentGoalType) return
    await onDeleteGoalType(currentGoalType.id)
    setIsDeleteDialogOpen(false)
    setCurrentGoalType(null)
  }

  const handleEditSubmit = async (data: { goal_type: string; description: string; status: "active" | "inactive" }) => {
    if (!currentGoalType) return
    await onEditGoalType(currentGoalType.id, data)
    setIsEditDialogOpen(false)
    setCurrentGoalType(null)
  }

  const sortedGoalTypes = useMemo(() => {
    return [...goalTypes].sort((a, b) => {
      const idA = parseInt(a.id) || 0
      const idB = parseInt(b.id) || 0
      return idB - idA
    })
  }, [goalTypes])

  const columns = [
    {
      key: "goalType",
      label: "Goal Type",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center cursor-default">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mr-2 flex-shrink-0">
            <Target className="h-4 w-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{value}</div>
            <div className="text-xs text-gray-500">Performance goal type</div>
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
          {value || "No description"}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: TableGoalType["status"]) => (
        //@ts-expect-error -- to be done
        <Badge variant={value === "active" ? "success" : "secondary"} className="capitalize">
          {value === "active" ? (
            <CheckCircle className="mr-1 h-3 w-3" />
          ) : (
            <XCircle className="mr-1 h-3 w-3" />
          )}
          {value}
        </Badge>
      ),
    },
    {
      key: "createdDate",
      label: "Created Date",
      sortable: true,
      render: (value: string) => {
        try {
          const created = new Date(value)
          return (
            <div className="flex items-center cursor-default">
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center mr-2 flex-shrink-0">
                <Calendar className="h-3 w-3 text-orange-600 mb-0.5" />
                <span className="text-xs font-medium text-orange-700">{created.getDate()}</span>
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900">
                  {created.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div className="text-xs text-gray-500">
                  {created.toLocaleDateString("en-US", { year: "numeric" })}
                </div>
              </div>
            </div>
          )
        } catch {
          return <span className="text-gray-500">N/A</span>
        }
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: TableGoalType) => (
        <div className="flex justify-start space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleView(row.id)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row.id)}
            title="Edit"
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDeletePrompt(row.id)}
            title="Delete"
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-50 to-green-100 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Goal Types
              </h1>
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
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

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Goal Types</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-500 font-medium">Error loading goal types</p>
            <p className="text-gray-600 mt-1 text-sm">{errorMessage}</p>
            <button
              onClick={onRefresh}
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Goal Types
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and review performance goal types
              <span className="ml-2 text-sm text-gray-500">({totalCount} goal types)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            disabled={isLoading}
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Add Goal Type
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Goal Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-yellow-100 border border-yellow-200 flex items-center justify-center mr-3">
                <span className="text-yellow-800 font-bold">{activeCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inactive Goal Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                <span className="text-blue-800 font-bold">{inactiveCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{inactiveCount}</div>
                <p className="text-xs text-gray-500 mt-1">Currently inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recent Goal Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
                <span className="text-green-800 font-bold">{recentCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{recentCount}</div>
                <p className="text-xs text-gray-500 mt-1">Added in last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Goal Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center mr-3">
                <span className="text-purple-800 font-bold">{totalCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                <p className="text-xs text-gray-500 mt-1">Total goal types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Goal Types</CardTitle>
              <CardDescription className="text-gray-600">
                Manage and review performance goal type records
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Goal Types"
            columns={columns}
            data={sortedGoalTypes}
            searchFields={searchFields}
            onAdd={() => setIsAddDialogOpen(true)}
          />
        </CardContent>
      </Card>

      <AddGoalTypeDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddGoalType}
      />

      {currentGoalType && (
        <EditGoalTypeDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setCurrentGoalType(null)
          }}
          onSubmit={handleEditSubmit}
          goalType={currentGoalType}
        />
      )}

      {currentGoalType && (
        <ViewGoalTypeDialog
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false)
          }}
          goalType={currentGoalType}
          onEdit={() => {
            setIsViewDialogOpen(false)
            setIsEditDialogOpen(true)
          }}
          onDelete={() => {
            setIsViewDialogOpen(false)
            setIsDeleteDialogOpen(true)
          }}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCurrentGoalType(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Goal Type"
        description={`Are you sure you want to delete ${currentGoalType?.goalType || "this goal type"}?`}
        itemName={currentGoalType?.goalType || "this goal type"}
      />
    </div>
  )
}
