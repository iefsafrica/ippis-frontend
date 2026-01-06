"use client"

import { useState, useEffect } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Building, AlertCircle, ArrowRight, Hash, Loader2, RefreshCw, CheckCircle, XCircle, Eye, Edit, Trash2, MoreVertical, MessageSquare, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import {
  useGetEmployeeComplaints,
  useCreateEmployeeComplaint,
  useUpdateEmployeeComplaint,
  useDeleteEmployeeComplaint,
} from "@/services/hooks/hr-core/useEmployeeComplaints"
import type {
  CreateEmployeeComplaintRequest,
  UpdateEmployeeComplaintRequest,
} from "@/types/hr-core/employee-complaints"
import { Button } from "@/components/ui/button"
import { AddComplaintDialog } from "./add-complaint-dialog"
import { EditComplaintDialog } from "./edit-complaint-dialog"
import { ViewComplaintDialog } from "./view-complaint-dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const complaintSearchFields = [
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
      { value: "Finance", label: "Finance" },
      { value: "Accounting", label: "Accounting" },
      { value: "Human Resources", label: "Human Resources" },
      { value: "Information Technology", label: "Information Technology" },
      { value: "Customer Service", label: "Customer Service" },
      { value: "Sales", label: "Sales" },
      { value: "Operations", label: "Operations" },
      { value: "Legal", label: "Legal" },
    ],
  },
  {
    name: "submitted_on",
    label: "Submission Date",
    type: "date" as const,
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "", label: "All" },
      { value: "pending", label: "Pending" },
      { value: "in_progress", label: "In Progress" },
      { value: "resolved", label: "Resolved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
  {
    name: "priority",
    label: "Priority",
    type: "select" as const,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
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
          disabled={row.status === "resolved" || row.status === "rejected"}
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
  );
};

export function ComplaintsContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentComplaint, setCurrentComplaint] = useState<any>(null)
  
  const { 
    data: complaintsResponse, 
    isLoading: isLoadingComplaints, 
    isError: isComplaintsError,
    error: complaintsError,
    refetch: refetchComplaints 
  } = useGetEmployeeComplaints()
  
  const createComplaintMutation = useCreateEmployeeComplaint()
  const updateComplaintMutation = useUpdateEmployeeComplaint()
  const deleteComplaintMutation = useDeleteEmployeeComplaint()

  const complaints = complaintsResponse?.data || []

  const handleViewComplaint = (id: number) => {
    const complaint = complaints.find((c: any) => c.id === id)
    if (complaint) {
      setCurrentComplaint(complaint)
      setIsViewDialogOpen(true)
    } else {
      toast.error("Complaint not found")
    }
  }

  const handleEditComplaint = (id: number) => {
    const complaint = complaints.find((c: any) => c.id === id)
    if (complaint) {
      setCurrentComplaint(complaint)
      setIsEditDialogOpen(true)
    } else {
      toast.error("Complaint not found")
    }
  }

  const handleOpenDeleteDialog = (id: number) => {
    const complaint = complaints.find((c: any) => c.id === id)
    if (complaint) {
      setCurrentComplaint(complaint)
      setIsDeleteDialogOpen(true)
    } else {
      toast.error("Complaint not found")
    }
  }

  const handleAddComplaint = () => {
    setCurrentComplaint(null)
    setIsAddDialogOpen(true)
  }

  const handleDeleteComplaint = async () => {
    if (!currentComplaint) return

    try {
      await deleteComplaintMutation.mutateAsync(currentComplaint.id)
      toast.success("Complaint deleted successfully")
      setIsDeleteDialogOpen(false)
      refetchComplaints()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete complaint")
    }
  }

  const handleCreateComplaint = async (data: CreateEmployeeComplaintRequest) => {
    try {
      await createComplaintMutation.mutateAsync(data)
      toast.success("Complaint created successfully")
      setIsAddDialogOpen(false)
      refetchComplaints()
    } catch (error: any) {
      toast.error(error.message || "Failed to create complaint")
      throw error
    }
  }

  const handleUpdateComplaint = async (data: UpdateEmployeeComplaintRequest & { id: number }) => {
    try {
      const { id, ...updateData } = data
      
      await updateComplaintMutation.mutateAsync({
        id: id,
        //@ts-expect-error - fix this later
        data: updateData
      })
      toast.success("Complaint updated successfully")
      setIsEditDialogOpen(false)
      refetchComplaints()
    } catch (error: any) {
      toast.error(error.message || "Failed to update complaint")
      throw error
    }
  }

  const handleManualRefresh = () => {
    refetchComplaints()
    toast.info("Refreshing complaints...")
  }

  // Calculate statistics
  const pendingCount = complaints.filter((c: any) => c.status === "pending").length
  const inProgressCount = complaints.filter((c: any) => c.status === "in_progress").length
  const resolvedCount = complaints.filter((c: any) => c.status === "resolved").length
  const rejectedCount = complaints.filter((c: any) => c.status === "rejected").length
  const totalCount = complaints.length

  const isLoading = isLoadingComplaints || 
    createComplaintMutation.isPending || 
    updateComplaintMutation.isPending || 
    deleteComplaintMutation.isPending

  // Define columns
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
                      row.status === "resolved" ? "bg-green-500" :
                      row.status === "in_progress" ? "bg-blue-500" :
                      row.status === "pending" ? "bg-yellow-500" : "bg-red-500"
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
      key: "department",
      label: "Department & Position",
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
      ),
    },
    {
      key: "complaint",
      label: "Complaint",
      sortable: true,
      render: (value: string) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <div className="h-9 w-9 rounded-md bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex items-center justify-center mr-2 flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                    {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                  </div>
                  <div className="text-xs text-gray-500">Complaint details</div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">{value}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value: string) => {
        const priorityConfig: Record<string, { label: string; className: string; icon: string }> = {
          high: { 
            label: "High", 
            className: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 hover:from-red-100 hover:to-rose-100",
            icon: "🔥"
          },
          medium: { 
            label: "Medium", 
            className: "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-amber-100",
            icon: "⚠️"
          },
          low: { 
            label: "Low", 
            className: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 hover:from-green-100 hover:to-emerald-100",
            icon: "📝"
          },
        }
        
        const config = priorityConfig[value] || { 
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
                <p className="text-xs">Priority: {config.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
          resolved: { 
            label: "Resolved", 
            className: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 hover:from-green-100 hover:to-emerald-100",
            icon: "✓"
          },
          in_progress: { 
            label: "In Progress", 
            className: "bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 text-blue-800 hover:from-blue-100 hover:to-sky-100",
            icon: "🔄"
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
      key: "submitted_on",
      label: "Submitted On",
      sortable: true,
      render: (value: string) => {
        try {
          const submittedDate = new Date(value)
          
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center cursor-default">
                    <div className="h-9 w-9 rounded-md bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 flex flex-col items-center justify-center mr-2 flex-shrink-0">
                      <Calendar className="h-3 w-3 text-orange-600 mb-0.5" />
                      <span className="text-xs font-medium text-orange-700">{submittedDate.getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">
                        {submittedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {submittedDate.toLocaleDateString('en-US', { year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Submitted: {submittedDate.toLocaleDateString()}</p>
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
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <ActionDropdown
          row={row}
          onView={handleViewComplaint}
          onEdit={handleEditComplaint}
          onDelete={handleOpenDeleteDialog}
        />
      ),
    },
  ]

  if (isLoadingComplaints) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Complaints
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

  if (isComplaintsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Employee Complaints</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-500 font-medium">Error loading complaints</p>
            <p className="text-gray-600 mt-1 text-sm">{complaintsError?.message}</p>
            <button 
              onClick={() => refetchComplaints()}
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
    <CoreHRClientWrapper title="Employee Complaints" endpoint="/admin/hr/complaints">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Complaints
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and resolve employee complaints and grievances
                {complaintsResponse?.data && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({totalCount} complaints)
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
              onClick={handleAddComplaint}
              disabled={isLoading}
              className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Add Complaint
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-yellow-100 border border-yellow-200 flex items-center justify-center mr-3">
                  <span className="text-yellow-800 font-bold">{pendingCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                  <span className="text-blue-800 font-bold">{inProgressCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{inProgressCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Being addressed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
                  <span className="text-green-800 font-bold">{resolvedCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{resolvedCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Successfully resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center mr-3">
                  <span className="text-purple-800 font-bold">{totalCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Total complaints</p>
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
                <CardTitle className="text-lg font-semibold text-gray-900">Complaints</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and review employee complaints
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              title="Complaints"
              columns={columns}
              data={complaints}
              searchFields={complaintSearchFields}
              onAdd={handleAddComplaint}
              //@ts-expect-error - fix this later
              onEdit={handleEditComplaint}
              onDelete={handleOpenDeleteDialog}
              onView={handleViewComplaint}
              showActions={true}
              isLoading={isLoading}
              emptyMessage={
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 border border-blue-200 mb-4">
                    <AlertCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first complaint</p>
                  <Button
                    onClick={handleAddComplaint}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Add Complaint
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddComplaintDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleCreateComplaint}
          isLoading={createComplaintMutation.isPending}
        />

        {currentComplaint && (
          <EditComplaintDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false)
              setCurrentComplaint(null)
            }}
            onSubmit={handleUpdateComplaint}
            initialData={currentComplaint}
            isLoading={updateComplaintMutation.isPending}
          />
        )}

        {currentComplaint && (
          <ViewComplaintDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setCurrentComplaint(null)
            }}
            complaint={currentComplaint}
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
            setCurrentComplaint(null)
          }}
          onConfirm={handleDeleteComplaint}
          title="Delete Complaint"
          description={`Are you sure you want to delete the complaint for ${currentComplaint?.employee_name}?`}
          itemName={`${currentComplaint?.employee_name}'s complaint`}
          isLoading={deleteComplaintMutation.isPending}
        />
      </div>
    </CoreHRClientWrapper>
  )
}