"use client"

import React, { useMemo, useState } from "react"
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
import { Calendar, User, Building, ArrowRight, Hash, MessageSquare, AlertTriangle, X, CheckCircle, XCircle, Clock, FileText, Briefcase } from "lucide-react"
import { format } from "date-fns"

interface ViewComplaintDialogProps {
  isOpen: boolean
  onClose: () => void
  complaint: any
  onEdit?: () => void
  onDelete?: () => void
  onResolve?: () => void
  onReject?: () => void
}

export function ViewComplaintDialog({ 
  isOpen, 
  onClose, 
  complaint, 
  onEdit,
  onDelete,
  onResolve,
  onReject
}: ViewComplaintDialogProps) {
  const [showFullComplaint, setShowFullComplaint] = useState(false)
  const [showFullNotes, setShowFullNotes] = useState(false)

  const initials = useMemo(() => {
    if (!complaint?.employee_name) return ""
    return complaint.employee_name
      .split(" ")
      //@ts-expect-error - fix this later
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [complaint?.employee_name])

  const MAX_PREVIEW = 300

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
    const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      resolved: { 
        label: "Resolved", 
        className: "bg-green-100 text-green-800 hover:bg-green-100",
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      },
      in_progress: { 
        label: "In Progress", 
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      pending: { 
        label: "Pending", 
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      rejected: { 
        label: "Rejected", 
        className: "bg-red-100 text-red-800 hover:bg-red-100",
        icon: <XCircle className="h-3 w-3 mr-1" />
      },
    }
    
    const config = statusConfig[status?.toLowerCase()] || { 
      label: status || "Unknown", 
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      icon: null
    }
    
    return (
      <Badge className={`${config.className} py-1 px-2`} variant="outline">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      high: { 
        label: "High", 
        className: "bg-red-100 text-red-800 hover:bg-red-100",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      },
      medium: { 
        label: "Medium", 
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      },
      low: { 
        label: "Low", 
        className: "bg-green-100 text-green-800 hover:bg-green-100",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      },
    }
    
    const config = priorityConfig[priority?.toLowerCase()] || { 
      label: priority || "Unknown", 
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      icon: null
    }
    
    return (
      <Badge className={`${config.className} py-1 px-2`} variant="outline">
        {config.icon}
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
                <MessageSquare className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Complaint Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View complaint information for {complaint.employee_name}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Employee Information</h3>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Employee Name</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                          {initials || <User className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{complaint.employee_name}</p>
                          <p className="text-xs text-gray-500">{complaint.employee_id}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Hash className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Employee ID</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 font-mono">{complaint.employee_id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Building className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Department & Position</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{complaint.department}</p>
                      <p className="text-xs text-gray-500">{complaint.position}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium">Status & Priority</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(complaint.status)}
                        {getPriorityBadge(complaint.priority)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Complaint Details</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Submission Date</span>
                    </div>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{formatDate(complaint.submitted_on || complaint.created_at)}</p>
                      <p className="text-xs text-gray-500">Complaint submitted</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Assigned To</span>
                    </div>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {complaint.assigned_to || <span className="text-gray-500">Unassigned</span>}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Complaint Description</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {complaint.complaint ? (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {complaint.complaint.length > MAX_PREVIEW && !showFullComplaint
                            ? `${complaint.complaint.slice(0, MAX_PREVIEW)}…`
                            : complaint.complaint}
                        </p>
                        {complaint.complaint.length > MAX_PREVIEW && (
                          <button
                            onClick={() => setShowFullComplaint(v => !v)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                            aria-expanded={showFullComplaint}
                          >
                            {showFullComplaint ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No complaint description provided</p>
                    )}
                  </div>
                </div>

                {complaint.notes && (
                  <div>
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Additional Notes</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {complaint.notes.length > MAX_PREVIEW && !showFullNotes
                            ? `${complaint.notes.slice(0, MAX_PREVIEW)}…`
                            : complaint.notes}
                        </p>
                        {complaint.notes.length > MAX_PREVIEW && (
                          <button
                            onClick={() => setShowFullNotes(v => !v)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                            aria-expanded={showFullNotes}
                          >
                            {showFullNotes ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    </div>
                  </div>
                )}

                {(complaint.resolved_by || complaint.resolved_at || complaint.rejection_reason) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Resolution Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {complaint.resolved_by && (
                        <div>
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Resolved By</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-gray-900">{complaint.resolved_by}</p>
                          </div>
                          {complaint.resolved_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateTime(complaint.resolved_at)}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {complaint.rejection_reason && (
                        <div>
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Rejection Reason</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <p className="text-sm font-medium text-gray-900">{complaint.rejected_by || "Rejected"}</p>
                          </div>
                          {complaint.rejected_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateTime(complaint.rejected_at)}
                            </p>
                          )}
                          <div className="mt-2">
                            <span className="text-xs text-gray-500 font-medium">Reason: </span>
                            <span className="text-xs text-gray-700">{complaint.rejection_reason}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(complaint.created_at || complaint.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {complaint.created_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(complaint.created_at)}</p>
                        </div>
                      )}
                      
                      {complaint.updated_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(complaint.updated_at)}</p>
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
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Close
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onDelete}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
              {onEdit && (
                <Button
                  type="button"
                  onClick={onEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Edit Complaint
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}