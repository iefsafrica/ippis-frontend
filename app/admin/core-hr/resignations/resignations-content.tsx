"use client"

import { useState, useEffect } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, FileText, Building, ArrowRight, Hash, Loader2, RefreshCw, CheckCircle, XCircle, Eye, Edit, Trash2, MoreVertical, LogOut, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useGetResignations,
  useCreateResignation,
  useUpdateResignation,
  useApproveResignation,
  useDisapproveResignation,
  useDeleteResignation,
} from "@/services/hooks/hr-core/useResignations"
import type {
  Resignation,
  CreateResignationRequest,
  UpdateResignationRequest,
  ApproveResignationRequest,
  DisapproveResignationRequest,
} from "@/types/hr-core/resignations"
import { Button } from "@/components/ui/button"
import { AddResignationDialog } from "./AddResignationDialog"
import { EditResignationDialog } from "./EditResignationDialog"
import { ViewResignationDialog } from "./ViewResignationDialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const resignationSearchFields = [
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
    name: "notice_date",
    label: "Notice Date",
    type: "date" as const,
  },
  {
    name: "resignation_date",
    label: "Resignation Date",
    type: "date" as const,
  },
  {
    name: "exit_interview",
    label: "Exit Interview",
    type: "select" as const,
    options: [
      { value: "pending", label: "Pending" },
      { value: "scheduled", label: "Scheduled" },
      { value: "completed", label: "Completed" },
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
      { value: "disapproved", label: "Disapproved" },
    ],
  },
]

// Action Dropdown Component
interface ActionDropdownProps {
  row: any;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onApprove: (id: number) => void;
  onDisapprove: (id: number) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  row,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onDisapprove,
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
          disabled={row.status !== "pending"}
        >
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
              onClick={() => onDisapprove(row.id)}
              className="text-red-600 focus:text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Disapprove
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem 
          onClick={() => onDelete(row.id)}
          className="text-red-600 focus:text-red-600"
          disabled={row.status !== "pending"}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Approve Confirmation Dialog
interface ApproveConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  employeeName: string
  isLoading?: boolean
}

function ApproveConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
  isLoading = false,
}: ApproveConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            Approve Resignation
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to approve the resignation request for <span className="font-semibold text-gray-900">{employeeName}</span>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Approval Note</p>
              <p className="text-sm text-green-700 mt-1">
                This action will mark the resignation as approved and the employee will be processed for exit formalities.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Resignation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Disapprove Confirmation Dialog
interface DisapproveConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  employeeName: string
  isLoading?: boolean
}

function DisapproveConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
  isLoading = false,
}: DisapproveConfirmationDialogProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      toast.error("Please provide a reason for disapproval")
      return
    }
    await onConfirm(reason)
    setReason("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            Disapprove Resignation
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to disapprove the resignation request for <span className="font-semibold text-gray-900">{employeeName}</span>?
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Important Note</p>
                  <p className="text-sm text-red-700 mt-1">
                    Disapproving a resignation will require the employee to continue working. Please provide a valid reason for disapproval.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disapprovalReason" className="text-sm font-medium">
                Reason for Disapproval *
              </Label>
              <Textarea
                id="disapprovalReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for disapproving this resignation..."
                className="min-h-[100px]"
                required
              />
              <p className="text-xs text-gray-500">
                This reason will be recorded and visible to the employee.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6 sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Disapproving...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Disapprove Resignation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ResignationsContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isDisapproveDialogOpen, setIsDisapproveDialogOpen] = useState(false)
  const [currentResignation, setCurrentResignation] = useState<Resignation | null>(null)
  
  const { 
    data: resignationsResponse, 
    isLoading: isLoadingResignations, 
    isError: isResignationsError,
    error: resignationsError,
    refetch: refetchResignations 
  } = useGetResignations()
  
  const createResignationMutation = useCreateResignation()
  const updateResignationMutation = useUpdateResignation()
  const approveResignationMutation = useApproveResignation()
  const disapproveResignationMutation = useDisapproveResignation()
  const deleteResignationMutation = useDeleteResignation()

  const resignations = resignationsResponse?.data || []

  const handleViewResignation = (id: number) => {
    const resignation = resignations.find((r: Resignation) => r.id === id)
    if (resignation) {
      setCurrentResignation(resignation)
      setIsViewDialogOpen(true)
    } else {
      toast.error("Resignation not found")
    }
  }

  const handleEditResignation = (id: number) => {
    const resignation = resignations.find((r: Resignation) => r.id === id)
    if (resignation) {
      setCurrentResignation(resignation)
      setIsEditDialogOpen(true)
    } else {
      toast.error("Resignation not found")
    }
  }

  const handleOpenDeleteDialog = (id: number) => {
    const resignation = resignations.find((r: Resignation) => r.id === id)
    if (resignation) {
      setCurrentResignation(resignation)
      setIsDeleteDialogOpen(true)
    } else {
      toast.error("Resignation not found")
    }
  }

  const handleOpenApproveDialog = (id: number) => {
    const resignation = resignations.find((r: Resignation) => r.id === id)
    if (resignation) {
      setCurrentResignation(resignation)
      setIsApproveDialogOpen(true)
    } else {
      toast.error("Resignation not found")
    }
  }

  const handleOpenDisapproveDialog = (id: number) => {
    const resignation = resignations.find((r: Resignation) => r.id === id)
    if (resignation) {
      setCurrentResignation(resignation)
      setIsDisapproveDialogOpen(true)
    } else {
      toast.error("Resignation not found")
    }
  }

  const handleApproveResignation = async () => {
    if (!currentResignation) return

    try {
      const payload: ApproveResignationRequest = {
        id: currentResignation.id,
        approved_by: "HR Manager",
      }
      await approveResignationMutation.mutateAsync(payload)
      toast.success("Resignation approved successfully")
      setIsApproveDialogOpen(false)
      setCurrentResignation(null)
      refetchResignations()
    } catch (error: any) {
      toast.error(error.message || "Failed to approve resignation")
    }
  }

  const handleDisapproveResignation = async (reason: string) => {
    if (!currentResignation) return

    try {
      const payload: DisapproveResignationRequest = {
        id: currentResignation.id,
        disapproved_by: "HR Manager",
        reason: reason
      }
      await disapproveResignationMutation.mutateAsync(payload)
      toast.success("Resignation disapproved successfully")
      setIsDisapproveDialogOpen(false)
      setCurrentResignation(null)
      refetchResignations()
    } catch (error: any) {
      toast.error(error.message || "Failed to disapprove resignation")
    }
  }

  const handleAddResignation = () => {
    setCurrentResignation(null)
    setIsAddDialogOpen(true)
  }

  const handleDeleteResignation = async () => {
    if (!currentResignation) return

    try {
      await deleteResignationMutation.mutateAsync(currentResignation.id)
      toast.success("Resignation deleted successfully")
      setIsDeleteDialogOpen(false)
      refetchResignations()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete resignation")
    }
  }

  const handleCreateResignation = async (data: CreateResignationRequest) => {
    try {
      await createResignationMutation.mutateAsync(data)
      toast.success("Resignation created successfully")
      setIsAddDialogOpen(false)
      refetchResignations()
    } catch (error: any) {
      toast.error(error.message || "Failed to create resignation")
      throw error
    }
  }

  // FIXED: This now properly handles the data with ID
  const handleUpdateResignation = async (data: UpdateResignationRequest & { id: number }) => {
    try {
      // Extract id and rest of data
      const { id, ...updateData } = data
      
      await updateResignationMutation.mutateAsync({
        id: id,
        data: updateData
      })
      toast.success("Resignation updated successfully")
      setIsEditDialogOpen(false)
      refetchResignations()
    } catch (error: any) {
      toast.error(error.message || "Failed to update resignation")
      throw error
    }
  }

  const handleManualRefresh = () => {
    refetchResignations()
    toast.info("Refreshing resignations...")
  }

  // Calculate statistics
  const pendingCount = resignations.filter((r: Resignation) => r.status === "pending").length
  const approvedCount = resignations.filter((r: Resignation) => r.status === "approved").length
  const disapprovedCount = resignations.filter((r: Resignation) => r.status === "disapproved").length
  const totalCount = resignations.length

  const isLoading = isLoadingResignations || 
    createResignationMutation.isPending || 
    updateResignationMutation.isPending || 
    approveResignationMutation.isPending ||
    disapproveResignationMutation.isPending ||
    deleteResignationMutation.isPending

  // Define columns inside the component so they have access to the handlers
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
                      row.status === "disapproved" ? "bg-red-500" : "bg-gray-400"
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
      key: "notice_date",
      label: "Notice Period",
      sortable: true,
      render: (value: string, row: any) => {
        try {
          const noticeDate = new Date(value)
          const resignationDate = new Date(row.resignation_date)
          
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center cursor-default">
                    <div className="h-9 w-9 rounded-md bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex flex-col items-center justify-center mr-2 flex-shrink-0">
                      <Calendar className="h-3 w-3 text-purple-600 mb-0.5" />
                      <span className="text-xs font-medium text-purple-700">{noticeDate.getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-900 truncate max-w-[60px]">
                          {noticeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <ArrowRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate max-w-[60px]">
                          {resignationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Notice period
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Notice: {noticeDate.toLocaleDateString()}</p>
                  <p className="text-xs">Resignation: {resignationDate.toLocaleDateString()}</p>
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
      key: "reason",
      label: "Reason",
      sortable: true,
      render: (value: string) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <div className="h-9 w-9 rounded-md bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center mr-2 flex-shrink-0">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{value}</div>
                  <div className="text-xs text-gray-500">Resignation reason</div>
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
      key: "exit_interview",
      label: "Exit Interview",
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
          Completed: { 
            label: "Completed", 
            className: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 hover:from-green-100 hover:to-emerald-100",
            icon: "✓"
          },
          Scheduled: { 
            label: "Scheduled", 
            className: "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-800 hover:from-blue-100 hover:to-cyan-100",
            icon: "📅"
          },
          Pending: { 
            label: "Pending", 
            className: "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-amber-100",
            icon: "⏳"
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
                <p className="text-xs">Exit Interview: {config.label}</p>
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
          disapproved: { 
            label: "Disapproved", 
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
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <ActionDropdown
          row={row}
          onView={handleViewResignation}
          onEdit={handleEditResignation}
          onDelete={handleOpenDeleteDialog}
          onApprove={handleOpenApproveDialog}
          onDisapprove={handleOpenDisapproveDialog}
        />
      ),
    },
  ]

  if (isLoadingResignations) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Resignations
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

  if (isResignationsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Employee Resignations</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-500 font-medium">Error loading resignations</p>
            <p className="text-gray-600 mt-1 text-sm">{resignationsError?.message}</p>
            <button 
              onClick={() => refetchResignations()}
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
    <CoreHRClientWrapper title="Employee Resignations" endpoint="/admin/hr/resignation">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center shadow-sm">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Resignations
              </h1>
              <p className="text-gray-600 mt-1">
                Manage employee resignations and approvals
                {resignationsResponse?.data && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({totalCount} resignation requests)
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
              onClick={handleAddResignation}
              disabled={isLoading}
              className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Add Resignation
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
                  <p className="text-xs text-gray-500 mt-1">Approved resignations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Disapproved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center mr-3">
                  <span className="text-red-800 font-bold">{disapprovedCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{disapprovedCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Disapproved resignations</p>
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
                <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                  <span className="text-blue-800 font-bold">{totalCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Total resignations</p>
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
                <CardTitle className="text-lg font-semibold text-gray-900">Resignation Requests</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and review employee resignation requests
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              title="Resignation Requests"
              columns={columns}
              data={resignations}
              searchFields={resignationSearchFields}
              onAdd={handleAddResignation}
              //@ts-expect-error - fix later
              onEdit={handleEditResignation}
              onDelete={handleOpenDeleteDialog}
              onView={handleViewResignation}
              showActions={true}
              isLoading={isLoading}
              emptyMessage={
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 border border-red-200 mb-4">
                    <LogOut className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resignation requests found</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first resignation request</p>
                  <Button
                    onClick={handleAddResignation}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Add Resignation Request
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddResignationDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleCreateResignation}
          isLoading={createResignationMutation.isPending}
        />

        {currentResignation && (
          <EditResignationDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false)
              setCurrentResignation(null)
            }}
            onSubmit={handleUpdateResignation}
            initialData={currentResignation}
            isLoading={updateResignationMutation.isPending}
          />
        )}

        {currentResignation && (
          <ViewResignationDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setCurrentResignation(null)
            }}
            resignation={currentResignation}
            //@ts-expect-error - fix later
            onEdit={() => {
              setIsViewDialogOpen(false)
              setIsEditDialogOpen(true)
            }}
            onDelete={() => {
              setIsViewDialogOpen(false)
              setIsDeleteDialogOpen(true)
            }}
            onApprove={() => {
              setIsViewDialogOpen(false)
              setIsApproveDialogOpen(true)
            }}
            onDisapprove={() => {
              setIsViewDialogOpen(false)
              setIsDisapproveDialogOpen(true)
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setCurrentResignation(null)
          }}
          onConfirm={handleDeleteResignation}
          title="Delete Resignation Request"
          description={`Are you sure you want to delete the resignation request for ${currentResignation?.employee_name}?`}
          itemName={`${currentResignation?.employee_name}'s resignation from ${currentResignation?.department}`}
          isLoading={deleteResignationMutation.isPending}
        />

        {/* Approve Confirmation Dialog */}
        {currentResignation && (
          <ApproveConfirmationDialog
            isOpen={isApproveDialogOpen}
            onClose={() => {
              setIsApproveDialogOpen(false)
              setCurrentResignation(null)
            }}
            onConfirm={handleApproveResignation}
            employeeName={currentResignation.employee_name}
            isLoading={approveResignationMutation.isPending}
          />
        )}

        {/* Disapprove Confirmation Dialog */}
        {currentResignation && (
          <DisapproveConfirmationDialog
            isOpen={isDisapproveDialogOpen}
            onClose={() => {
              setIsDisapproveDialogOpen(false)
              setCurrentResignation(null)
            }}
            onConfirm={handleDisapproveResignation}
            employeeName={currentResignation.employee_name}
            isLoading={disapproveResignationMutation.isPending}
          />
        )}
      </div>
    </CoreHRClientWrapper>
  )
}