"use client"

import { useState, useEffect } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User, Building, Briefcase, Hash, Loader2, RefreshCw, ArrowRight, CheckCircle, XCircle, Eye, Edit, Trash2, MoreVertical } from "lucide-react"
import { toast } from "sonner"
import {
  useTransfers,
  useCreateTransfer,
  useUpdateTransfer,
  useDeleteTransfer,
} from "@/services/hooks/hr-core/useTransfer"
import type {
  Transfer,
  CreateTransferPayload,
  UpdateTransferPayload,
  TransferFilters,
} from "@/types/hr-core/transfer"
import { Button } from "@/components/ui/button"
import { AddTransferDialog } from "./add-transfer-dialog"
import { EditTransferDialog } from "./edit-transfer-dialog"
import { ViewTransferDialog } from "./view-transfer-dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const transferSearchFields = [
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
    name: "from_department",
    label: "From Department",
    type: "select" as const,
    options: [
      { value: "Finance", label: "Finance" },
      { value: "Accounting", label: "Accounting" },
      { value: "Human Resources", label: "Human Resources" },
    ],
  },
  {
    name: "to_department",
    label: "To Department",
    type: "select" as const,
    options: [
      { value: "Finance", label: "Finance" },
      { value: "Accounting", label: "Accounting" },
      { value: "Human Resources", label: "Human Resources" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "", label: "All" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
]

// Action Dropdown Component
interface ActionDropdownProps {
  row: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  row,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
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
        <DropdownMenuItem onClick={() => onEdit(row.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        
        {row.status === "pending" && (
          <>
            <DropdownMenuItem 
              onClick={() => onApprove(row.id)}
              className="text-green-600 focus:text-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onReject(row.id)}
              className="text-red-600 focus:text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem 
          onClick={() => onDelete(row.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns = [
 
  {
    key: "employee_name",
    label: "Employee",
    sortable: true,
    render: (value: string, row: any) => (
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
                    row.status === "approved" ? "bg-green-500" :
                    row.status === "pending" ? "bg-yellow-500" :
                    row.status === "rejected" || row.status === "cancelled" ? "bg-red-500" : "bg-gray-400"
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
    ),
  },
  {
    key: "from_department",
    label: "From → To",
    sortable: true,
    render: (value: string, row: any) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                <Building className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-900 truncate max-w-[80px]">{value}</span>
                  <ArrowRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 truncate max-w-[80px]">{row.to_department}</span>
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[180px]">
                  {row.from_position} → {row.to_position}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Department: {value} → {row.to_department}</p>
            <p className="text-xs">Position: {row.from_position} → {row.to_position}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    key: "from_location",
    label: "Location",
    sortable: true,
    render: (value: string, row: any) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-default">
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center mr-2 flex-shrink-0">
                <MapPin className="h-4 w-4 text-red-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-900 truncate max-w-[80px]">{value}</span>
                  <ArrowRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900 truncate max-w-[80px]">{row.to_location}</span>
                </div>
                <div className="text-xs text-gray-500">Location transfer</div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Location: {value} → {row.to_location}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    key: "effective_date",
    label: "Effective Date",
    sortable: true,
    render: (value: string) => {
      try {
        const date = new Date(value)
        const today = new Date()
        const diffTime = date.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
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
                    <div className="font-medium text-gray-900">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className={`text-xs ${diffDays < 0 ? 'text-gray-500' : diffDays <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {diffDays < 0 ? 'Past' : diffDays === 0 ? 'Today' : `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Effective from: {date.toLocaleDateString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      } catch {
        return <span className="text-gray-500">N/A</span>
      }
    },
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => {
      const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
        approved: { 
          label: "Approved", 
          className: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 hover:from-green-100 hover:to-emerald-100",
          icon: "✓"
        },
        pending: { 
          label: "Pending", 
          className: "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-amber-100",
          icon: "⏳"
        },
        rejected: { 
          label: "Rejected", 
          className: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 hover:from-red-100 hover:to-rose-100",
          icon: "✗"
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
    },
  },
   {
    key: "actions",
    label: "Actions",
    render: (_: any, row: any) => (
      <ActionDropdown
        row={row}
        onView={() => handleViewTransfer?.(row.id)}
        onEdit={() => handleEditTransfer?.(row.id)}
        onDelete={() => handleOpenDeleteDialog?.(row.id)}
        onApprove={() => handleApproveTransfer?.(row.id)}
        onReject={() => handleRejectTransfer?.(row.id)}
      />
    ),
  },
]

let handleViewTransfer: ((id: string) => void) | undefined;
let handleEditTransfer: ((id: string) => void) | undefined;
let handleOpenDeleteDialog: ((id: string) => void) | undefined;
let handleApproveTransfer: ((id: string) => void) | undefined;
let handleRejectTransfer: ((id: string) => void) | undefined;

export function TransferContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTransfer, setCurrentTransfer] = useState<Transfer | null>(null)
  const [filters, setFilters] = useState<TransferFilters>({})
  
  const { 
    data: transfersResponse, 
    isLoading: isLoadingTransfers, 
    isError: isTransfersError,
    error: transfersError,
    refetch: refetchTransfers 
  } = useTransfers(filters)
  
  const createTransferMutation = useCreateTransfer()
  const updateTransferMutation = useUpdateTransfer()
  const deleteTransferMutation = useDeleteTransfer()
//@ts-expect-error - transfersResponse may be undefined
  const transfers = transfersResponse?.data || []

  // Assign the handlers so the ActionDropdown can use them
  handleViewTransfer = (id: string) => {
    const transfer = transfers.find((t: Transfer) => t.id.toString() === id)
    if (transfer) {
      setCurrentTransfer(transfer)
      setIsViewDialogOpen(true)
    }
  }

  handleEditTransfer = (id: string) => {
    const transfer = transfers.find((t: Transfer) => t.id.toString() === id)
    if (transfer) {
      setCurrentTransfer(transfer)
      setIsEditDialogOpen(true)
    }
  }

  handleOpenDeleteDialog = (id: string) => {
    const transfer = transfers.find((t: Transfer) => t.id.toString() === id)
    if (transfer) {
      setCurrentTransfer(transfer)
      setIsDeleteDialogOpen(true)
    }
  }

  handleApproveTransfer = async (id: string) => {
    if (window.confirm("Are you sure you want to approve this transfer?")) {
      try {
        const updatePayload: UpdateTransferPayload = {
          id: parseInt(id),
          status: "approved",
        }
        await updateTransferMutation.mutateAsync(updatePayload)
        toast.success("Transfer approved successfully")
        refetchTransfers()
      } catch (error) {
        toast.error("Failed to approve transfer")
      }
    }
  }

  handleRejectTransfer = async (id: string) => {
    if (window.confirm("Are you sure you want to reject this transfer?")) {
      try {
        const updatePayload: UpdateTransferPayload = {
          id: parseInt(id),
          status: "rejected",
        }
        await updateTransferMutation.mutateAsync(updatePayload)
        toast.success("Transfer rejected successfully")
        refetchTransfers()
      } catch (error) {
        toast.error("Failed to reject transfer")
      }
    }
  }

  const handleAddTransfer = () => {
    setCurrentTransfer(null)
    setIsAddDialogOpen(true)
  }

  const handleDeleteTransfer = async () => {
    if (!currentTransfer) return

    try {
      await deleteTransferMutation.mutateAsync(currentTransfer.id)
      
      toast.success("Transfer deleted successfully")
      setIsDeleteDialogOpen(false)
      refetchTransfers()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete transfer")
    }
  }

  const handleCreateTransfer = async (data: CreateTransferPayload) => {
    try {
      const response = await createTransferMutation.mutateAsync(data)
      
      if (response.success) {
        toast.success(response.message || "Transfer created successfully")
        setIsAddDialogOpen(false)
        refetchTransfers()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create transfer")
      throw error
    }
  }

  const handleUpdateTransfer = async (data: UpdateTransferPayload) => {
    try {
      const response = await updateTransferMutation.mutateAsync(data)
      
      if (response.success) {
        toast.success(response.message || "Transfer updated successfully")
        setIsEditDialogOpen(false)
        refetchTransfers()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update transfer")
      throw error
    }
  }

  const handleManualRefresh = () => {
    refetchTransfers()
    toast.info("Refreshing transfers...")
  }

  // Calculate statistics
  const pendingCount = transfers.filter((t: Transfer) => t.status === "pending").length
  const approvedCount = transfers.filter((t: Transfer) => t.status === "approved").length
  const rejectedCount = transfers.filter((t: Transfer) => t.status === "rejected").length
  const cancelledCount = transfers.filter((t: Transfer) => t.status === "cancelled").length

  const isLoading = isLoadingTransfers || createTransferMutation.isPending || updateTransferMutation.isPending || deleteTransferMutation.isPending

  if (isLoadingTransfers) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Transfers
              </h1>
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
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

  if (isTransfersError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Employee Transfers</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Building className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-500 font-medium">Error loading transfers</p>
            <p className="text-gray-600 mt-1 text-sm">{transfersError?.message}</p>
            <button 
              onClick={() => refetchTransfers()}
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
    <CoreHRClientWrapper title="Employee Transfers" endpoint="/admin/hr/transfer">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Transfers
              </h1>
              <p className="text-gray-600 mt-1">
                Manage employee transfers and approvals
                {/* @ts-expect-error - transfersResponse may be undefined */}
                {transfersResponse?.data && (
                  <span className="ml-2 text-sm text-gray-500">
                    {/* @ts-expect-error - transfersResponse may be undefined */}
                    ({transfersResponse.data.length} transfer requests)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh table data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={handleAddTransfer}
              disabled={isLoading}
              className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Add Transfer
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-yellow-100 border border-yellow-200 flex items-center justify-center mr-3">
                  <span className="text-yellow-800 font-bold">{pendingCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
                  <span className="text-green-800 font-bold">{approvedCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{approvedCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Approved transfers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center mr-3">
                  <span className="text-red-800 font-bold">{rejectedCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{rejectedCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Rejected transfers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-800 font-bold">{cancelledCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{cancelledCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Cancelled transfers</p>
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
                <CardTitle className="text-lg font-semibold text-gray-900">Transfer Requests</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and review employee transfer requests
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              title="Transfer Requests"
              columns={columns}
              data={transfers}
              searchFields={transferSearchFields}
              onAdd={handleAddTransfer}
              //@ts-expect-error - transfersResponse may be undefined
              onEdit={handleEditTransfer}
              onDelete={handleOpenDeleteDialog}
              onView={handleViewTransfer}
              showActions={true}
              isLoading={isLoading}
              emptyMessage={
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 border border-blue-200 mb-4">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transfer requests found</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first transfer request</p>
                  <Button
                    onClick={handleAddTransfer}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Add Transfer Request
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddTransferDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleCreateTransfer}
          isLoading={createTransferMutation.isPending}
        />

        {currentTransfer && (
          <EditTransferDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSubmit={handleUpdateTransfer}
            initialData={currentTransfer}
            isLoading={updateTransferMutation.isPending}
          />
        )}

        {currentTransfer && (
          <ViewTransferDialog
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
            transfer={currentTransfer}
            onEdit={() => {
              setIsViewDialogOpen(false)
              setIsEditDialogOpen(true)
            }}
            onDelete={() => {
              setIsViewDialogOpen(false)
              setIsDeleteDialogOpen(true)
            }}
            onApprove={async () => {
              if (window.confirm("Are you sure you want to approve this transfer?")) {
                try {
                  const updatePayload: UpdateTransferPayload = {
                    id: currentTransfer.id,
                    status: "approved",
                  }
                  await updateTransferMutation.mutateAsync(updatePayload)
                  toast.success("Transfer approved successfully")
                  setIsViewDialogOpen(false)
                  refetchTransfers()
                } catch (error) {
                  toast.error("Failed to approve transfer")
                }
              }
            }}
            onReject={async () => {
              if (window.confirm("Are you sure you want to reject this transfer?")) {
                try {
                  const updatePayload: UpdateTransferPayload = {
                    id: currentTransfer.id,
                    status: "rejected",
                  }
                  await updateTransferMutation.mutateAsync(updatePayload)
                  toast.success("Transfer rejected successfully")
                  setIsViewDialogOpen(false)
                  refetchTransfers()
                } catch (error) {
                  toast.error("Failed to reject transfer")
                }
              }
            }}
          />
        )}

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteTransfer}
          title="Delete Transfer Request"
          description={`Are you sure you want to delete the transfer request for ${currentTransfer?.employee_name}?`}
          itemName={`${currentTransfer?.employee_name}'s transfer from ${currentTransfer?.from_department} to ${currentTransfer?.to_department}`}
          isLoading={deleteTransferMutation.isPending}
        />
      </div>
    </CoreHRClientWrapper>
  )
}