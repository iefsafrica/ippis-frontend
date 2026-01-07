"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  useGetTerminations,
  useCreateTermination,
  useUpdateTermination,
  useDeleteTermination,
} from "@/services/hooks/hr-core/useTerminations"
import type {
  Termination,
  CreateTerminationRequest,
  UpdateTerminationRequest,
} from "@/types/hr-core/terminations"
import { DataTable } from "../components/data-table"
import { AddTerminationDialog } from "./AddTerminationDialog"
import { EditTerminationDialog } from "./EditTerminationDialog"
import { ViewTerminationDialog } from "./ViewTerminationDialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, User, Building, Calendar, FileText, Hash, MoreVertical, Eye, Edit, Trash2, XCircle, RefreshCw, AlertCircle } from "lucide-react"
import { format } from "date-fns"

const terminationSearchFields = [
  {
    name: "employee_id",
    label: "Employee ID",
    type: "text" as const,
  },
  {
    name: "employee_name",
    label: "Employee Name",
    type: "text" as const,
  },
  {
    name: "department",
    label: "Department",
    type: "select" as const,
    options: [
      { value: "IT", label: "Information Technology" },
      { value: "Finance", label: "Finance" },
      { value: "Accounting", label: "Accounting" },
      { value: "Human Resources", label: "Human Resources" },
      { value: "Customer Service", label: "Customer Service" },
      { value: "Sales", label: "Sales" },
      { value: "Operations", label: "Operations" },
      { value: "Legal", label: "Legal" },
      { value: "Marketing", label: "Marketing" },
    ],
  },
  {
    name: "termination_date",
    label: "Termination Date",
    type: "date" as const,
  },
  {
    name: "termination_type",
    label: "Termination Type",
    type: "select" as const,
    options: [
      { value: "resignation", label: "Resignation" },
      { value: "termination", label: "Termination" },
      { value: "retirement", label: "Retirement" },
      { value: "layoff", label: "Layoff" },
      { value: "dismissal", label: "Dismissal" },
      { value: "end_of_contract", label: "End of Contract" },
      { value: "mutual_agreement", label: "Mutual Agreement" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "", label: "All" },
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "completed", label: "Completed" },
      { value: "revoked", label: "Revoked" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
]

// Action Dropdown Component
interface ActionDropdownProps {
  row: any;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  row,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(row.id)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onEdit(row.id)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(row.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TerminationsContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTermination, setCurrentTermination] = useState<Termination | null>(null)
  
  const { 
    data: terminationsResponse, 
    isLoading: isLoadingTerminations, 
    isError: isTerminationsError,
    error: terminationsError,
    refetch: refetchTerminations 
  } = useGetTerminations()
  
  const createTerminationMutation = useCreateTermination()
  const updateTerminationMutation = useUpdateTermination()
  const deleteTerminationMutation = useDeleteTermination()

  const terminations = (terminationsResponse?.data || []).slice().sort((a: Termination, b: Termination) => b.id - a.id)

  const handleViewTermination = (id: number) => {
    const termination = terminations.find((t: Termination) => t.id === id)
    if (termination) {
      setCurrentTermination(termination)
      setIsViewDialogOpen(true)
    } else {
      toast.error("Termination not found")
    }
  }

  const handleEditTermination = (id: number) => {
    const termination = terminations.find((t: Termination) => t.id === id)
    if (termination) {
      setCurrentTermination(termination)
      setIsEditDialogOpen(true)
    } else {
      toast.error("Termination not found")
    }
  }

  const handleOpenDeleteDialog = (id: number) => {
    const termination = terminations.find((t: Termination) => t.id === id)
    if (termination) {
      setCurrentTermination(termination)
      setIsDeleteDialogOpen(true)
    } else {
      toast.error("Termination not found")
    }
  }

  const handleAddTermination = () => {
    setCurrentTermination(null)
    setIsAddDialogOpen(true)
  }

  const handleDeleteTermination = async () => {
    if (!currentTermination) return

    try {
      await deleteTerminationMutation.mutateAsync(currentTermination.id)
      toast.success("Termination deleted successfully")
      setIsDeleteDialogOpen(false)
      refetchTerminations()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete termination")
    }
  }

  const handleCreateTermination = async (data: CreateTerminationRequest) => {
    try {
      await createTerminationMutation.mutateAsync(data)
      toast.success("Termination created successfully")
      setIsAddDialogOpen(false)
      refetchTerminations()
    } catch (error: any) {
      toast.error(error.message || "Failed to create termination")
      throw error
    }
  }

  const handleUpdateTermination = async (data: UpdateTerminationRequest & { id: number }) => {
    try {
      const { id, ...updateData } = data
      
      await updateTerminationMutation.mutateAsync({
        id: id,
        data: updateData
      })
      toast.success("Termination updated successfully")
      setIsEditDialogOpen(false)
      refetchTerminations()
    } catch (error: any) {
      toast.error(error.message || "Failed to update termination")
      throw error
    }
  }

  const handleManualRefresh = () => {
    refetchTerminations()
    toast.info("Refreshing terminations...")
  }

  // Calculate statistics
  const activeCount = terminations.filter((t: Termination) => t.status === "active").length
  const pendingCount = terminations.filter((t: Termination) => t.status === "pending").length
  const completedCount = terminations.filter((t: Termination) => t.status === "completed").length
  const revokedCount = terminations.filter((t: Termination) => t.status === "revoked").length
  const totalCount = terminations.length

  const isLoading = isLoadingTerminations || 
    createTerminationMutation.isPending || 
    updateTerminationMutation.isPending || 
    deleteTerminationMutation.isPending

  const renderTerminationType = (value: string) => {
    const typeConfig: Record<string, { label: string; className: string; icon: string }> = {
      resignation: { 
        label: "Resignation", 
        className: "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-800 hover:from-blue-100 hover:to-cyan-100",
        icon: "↩️"
      },
      termination: { 
        label: "Termination", 
        className: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 hover:from-red-100 hover:to-rose-100",
        icon: "🚫"
      },
      retirement: { 
        label: "Retirement", 
        className: "bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 text-purple-800 hover:from-purple-100 hover:to-violet-100",
        icon: "👵"
      },
      layoff: { 
        label: "Layoff", 
        className: "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-800 hover:from-orange-100 hover:to-amber-100",
        icon: "📉"
      },
      dismissal: { 
        label: "Dismissal", 
        className: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 hover:from-red-100 hover:to-rose-100",
        icon: "⚖️"
      },
      end_of_contract: { 
        label: "End of Contract", 
        className: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800 hover:from-gray-100 hover:to-slate-100",
        icon: "📄"
      },
      mutual_agreement: { 
        label: "Mutual Agreement", 
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 hover:from-green-100 hover:to-emerald-100",
        icon: "🤝"
      },
    }
    
    const config = typeConfig[value] || { 
      label: value, 
      className: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800 hover:from-gray-100 hover:to-slate-100",
      icon: "?"
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${config.className} px-3 py-1.5 font-medium rounded-full shadow-sm`} variant="outline">
              <span className="mr-1.5">{config.icon}</span>
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Termination Type: {config.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const renderStatus = (value: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
      active: { 
        label: "Active", 
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 hover:from-green-100 hover:to-emerald-100",
        icon: "✓"
      },
      pending: { 
        label: "Pending", 
        className: "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-amber-100",
        icon: "⏳"
      },
      completed: { 
        label: "Completed", 
        className: "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-800 hover:from-blue-100 hover:to-cyan-100",
        icon: "✅"
      },
      revoked: { 
        label: "Revoked", 
        className: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 hover:from-red-100 hover:to-rose-100",
        icon: "↩️"
      },
      cancelled: { 
        label: "Cancelled", 
        className: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800 hover:from-gray-100 hover:to-slate-100",
        icon: "✗"
      },
    }
    
    const config = statusConfig[value] || { 
      label: value, 
      className: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800 hover:from-gray-100 hover:to-slate-100",
      icon: "?"
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${config.className} px-3 py-1.5 font-medium rounded-full shadow-sm`} variant="outline">
              <span className="mr-1.5">{config.icon}</span>
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Status: {config.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const renderEmployee = (value: string, row: any) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <div className={`h-2 w-2 rounded-full ${
                    row.status === "active" ? "bg-green-500" :
                    row.status === "pending" ? "bg-yellow-500" :
                    row.status === "revoked" ? "bg-red-500" : "bg-gray-400"
                  }`} />
                </div>
              </div>
              <div className="ml-3 min-w-0">
                <div className="font-medium text-gray-900 truncate max-w-[140px] sm:max-w-[180px]">{value}</div>
                <div className="text-xs text-gray-500 truncate max-w-[140px] sm:max-w-[180px]">{row.employee_id}</div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">View details for {value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const renderDepartment = (value: string, row: any) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                <Building className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{value}</div>
                <div className="text-xs text-gray-500 truncate max-w-[140px]">{row.position}</div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Department: {value}</p>
            <p className="text-xs">Position: {row.position}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const renderTerminationDate = (value: string) => {
    try {
      const date = new Date(value)
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <div className="h-9 w-9 rounded-md bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex flex-col items-center justify-center mr-2 flex-shrink-0">
                  <Calendar className="h-3 w-3 text-purple-600 mb-0.5" />
                  <span className="text-xs font-medium text-purple-700">{date.getDate()}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-gray-500">
                    Termination date
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Termination Date: {date.toLocaleDateString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    } catch {
      return <span className="text-gray-500">Invalid date</span>
    }
  }

  const renderReason = (value: string) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center mr-2 flex-shrink-0">
                <FileText className="h-4 w-4 text-red-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{value}</div>
                <div className="text-xs text-gray-500">Termination reason</div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const columns = [
    {
      key: "employee_name",
      label: "Employee",
      sortable: true,
      render: renderEmployee,
    },
    {
      key: "department",
      label: "Department & Position",
      sortable: true,
      render: renderDepartment,
    },
    {
      key: "termination_type",
      label: "Termination Type",
      sortable: true,
      render: renderTerminationType,
    },
    {
      key: "termination_reason",
      label: "Reason",
      sortable: true,
      render: renderReason,
    },
    {
      key: "termination_date",
      label: "Termination Date",
      sortable: true,
      render: renderTerminationDate,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: renderStatus,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <ActionDropdown
          row={row}
          onView={handleViewTermination}
          onEdit={handleEditTermination}
          onDelete={handleOpenDeleteDialog}
        />
      ),
    },
  ]

  if (isLoadingTerminations) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Terminations
              </h1>
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map(i => (
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

  if (isTerminationsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Employee Terminations</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-500 font-medium">Error loading terminations</p>
            <p className="text-gray-600 mt-1 text-sm">{terminationsError?.message}</p>
            <button 
              onClick={() => refetchTerminations()}
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center shadow-sm">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Employee Terminations
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee termination records and documentation
              {terminationsResponse?.data && (
                <span className="ml-2 text-sm text-gray-500">
                  ({totalCount} termination records)
                </span>
              )}
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
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={handleAddTermination}
            disabled={isLoading}
            className="h-10 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Add Termination
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Terminations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                <span className="text-blue-800 font-bold">{totalCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                <p className="text-xs text-gray-500 mt-1">All terminations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
                <span className="text-green-800 font-bold">{activeCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
                <p className="text-xs text-gray-500 mt-1">Active terminations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-yellow-100 border border-yellow-200 flex items-center justify-center mr-3">
                <span className="text-yellow-800 font-bold">{pendingCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                <p className="text-xs text-gray-500 mt-1">Pending review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                <span className="text-blue-800 font-bold">{completedCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
                <p className="text-xs text-gray-500 mt-1">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Revoked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center mr-3">
                <span className="text-red-800 font-bold">{revokedCount}</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{revokedCount}</div>
                <p className="text-xs text-gray-500 mt-1">Revoked terminations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Termination Records</CardTitle>
              <CardDescription className="text-gray-600">
                Manage and review employee termination records
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            title="Termination Records"
            columns={columns}
            data={terminations}
            searchFields={terminationSearchFields}
            onAdd={handleAddTermination}
            //@ts-expect-error - row id type
            onEdit={handleEditTermination}
            onDelete={handleOpenDeleteDialog}
            onView={handleViewTermination}
            showActions={true}
            isLoading={isLoading}
            emptyMessage={
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 border border-red-200 mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No termination records found</h3>
                <p className="text-gray-600 mb-4">Start by adding your first termination record</p>
                <Button
                  onClick={handleAddTermination}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Add Termination Record
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTerminationDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleCreateTermination}
        isLoading={createTerminationMutation.isPending}
      />

      {currentTermination && (
        <EditTerminationDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setCurrentTermination(null)
          }}
          onSubmit={handleUpdateTermination}
          initialData={currentTermination}
          isLoading={updateTerminationMutation.isPending}
        />
      )}

      {currentTermination && (
        <ViewTerminationDialog
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false)
            setCurrentTermination(null)
          }}
          termination={currentTermination}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCurrentTermination(null)
        }}
        onConfirm={handleDeleteTermination}
        title="Delete Termination Record"
        description={`Are you sure you want to delete the termination record for ${currentTermination?.employee_name}?`}
        itemName={`${currentTermination?.employee_name}'s termination from ${currentTermination?.department}`}
        isLoading={deleteTerminationMutation.isPending}
      />
    </div>
  )
}