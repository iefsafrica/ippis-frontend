"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User, Building, ArrowRight, Hash, Briefcase, Clock, Edit, Trash2, X, FileText, CheckCircle, XCircle } from "lucide-react"
import type { Transfer } from "@/types/hr-core/transfer"
import { format } from "date-fns"

interface ViewTransferDialogProps {
  isOpen: boolean
  onClose: () => void
  transfer: Transfer
  onEdit: () => void
  onDelete: () => void
  onApprove: () => void
  onReject: () => void
}

export function ViewTransferDialog({ 
  isOpen, 
  onClose, 
  transfer, 
  onEdit, 
  onDelete,
  onApprove,
  onReject
}: ViewTransferDialogProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp")
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      approved: { label: "Approved", className: "bg-green-100 text-green-800 hover:bg-green-100" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800 hover:bg-red-100" },
      cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
    }
    
    const config = statusConfig[status?.toLowerCase()] || { label: status || "Unknown", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" }
    
    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <ArrowRight className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Transfer Request Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View transfer information for {transfer.employee_name}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Employee Information</h3>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Employee Name</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{transfer.employee_name}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Hash className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Employee ID</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 font-mono">{transfer.employee_id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium">Status</span>
                      </div>
                      {getStatusBadge(transfer.status)}
                    </div>

                    {transfer.approved_by && (
                      <div>
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-xs text-gray-500 font-medium">Approved By</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{transfer.approved_by}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Transfer Details</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Building className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Department Transfer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-1">
                        <p className="text-sm font-medium text-gray-900">{transfer.from_department}</p>
                        <p className="text-xs text-gray-500">{transfer.from_position}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex-1">
                        <p className="text-sm font-medium text-gray-900">{transfer.to_department}</p>
                        <p className="text-xs text-gray-500">{transfer.to_position}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Location Transfer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-1">
                        <p className="text-sm font-medium text-gray-900">{transfer.from_location}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex-1">
                        <p className="text-sm font-medium text-gray-900">{transfer.to_location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Effective Date</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(transfer.effective_date)}
                    </p>
                  </div>

                  {transfer.approved_at && (
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Approved At</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTime(transfer.approved_at)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Reason for Transfer</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{transfer.reason}</p>
                  </div>
                </div>

                {(transfer.created_at || transfer.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {transfer.created_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(transfer.created_at)}</p>
                        </div>
                      )}
                      
                      {transfer.updated_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(transfer.updated_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-5 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onDelete}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Transfer
              </Button>
              
              {transfer.status === "pending" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onApprove}
                    className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onReject}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={onEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Transfer
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}