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
import { Calendar, User, FileText, Building, ArrowRight, Hash, Briefcase, Clock, X, CheckCircle, XCircle, LogOut } from "lucide-react"
import type { Resignation } from "@/types/hr-core/resignations"
import { format } from "date-fns"

interface ViewResignationDialogProps {
  isOpen: boolean
  onClose: () => void
  resignation: Resignation
  onDisapprove: () => void
}

export function ViewResignationDialog({ 
  isOpen, 
  onClose, 
  resignation, 
  onDisapprove
}: ViewResignationDialogProps) {
  const [showFullReason, setShowFullReason] = useState(false)
  const [showFullNotes, setShowFullNotes] = useState(false)

  const initials = useMemo(() => {
    if (!resignation?.employee_name) return ""
    return resignation.employee_name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [resignation?.employee_name])

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
      approved: { 
        label: "Approved", 
        className: "bg-green-100 text-green-800 hover:bg-green-100",
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      },
      pending: { 
        label: "Pending", 
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      disapproved: { 
        label: "Disapproved", 
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

  const getExitInterviewBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      completed: { label: "Completed", className: "bg-green-100 text-green-800 hover:bg-green-100" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
      scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    }
    
    const config = statusConfig[status?.toLowerCase()] || { 
      label: status || "Unknown", 
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100" 
    }
    
    return (
      <Badge className={`${config.className} py-1 px-2`} variant="outline">
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
                <LogOut className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Resignation Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View resignation information for {resignation.employee_name}
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
                          <p className="text-sm font-medium text-gray-900">{resignation.employee_name}</p>
                          <p className="text-xs text-gray-500">{resignation.employee_id}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Hash className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Employee ID</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 font-mono">{resignation.employee_id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Building className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Department & Position</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{resignation.department}</p>
                      <p className="text-xs text-gray-500">{resignation.position}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium">Status</span>
                      </div>
                      {getStatusBadge(resignation.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Resignation Details</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Notice Period</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-1">
                        <p className="text-sm font-medium text-gray-900">Notice Date</p>
                        <p className="text-xs text-gray-500">{formatDate(resignation.notice_date)}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex-1">
                        <p className="text-sm font-medium text-gray-900">Resignation Date</p>
                        <p className="text-xs text-gray-500">{formatDate(resignation.resignation_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Exit Interview</span>
                    </div>
                    {getExitInterviewBadge(resignation.exit_interview)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Reason for Resignation</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {resignation.reason ? (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {resignation.reason.length > MAX_PREVIEW && !showFullReason
                            ? `${resignation.reason.slice(0, MAX_PREVIEW)}…`
                            : resignation.reason}
                        </p>
                        {resignation.reason.length > MAX_PREVIEW && (
                          <button
                            onClick={() => setShowFullReason(v => !v)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                            aria-expanded={showFullReason}
                          >
                            {showFullReason ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No reason provided</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Notes</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {resignation.notes ? (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {resignation.notes.length > MAX_PREVIEW && !showFullNotes
                            ? `${resignation.notes.slice(0, MAX_PREVIEW)}…`
                            : resignation.notes}
                        </p>
                        {resignation.notes.length > MAX_PREVIEW && (
                          <button
                            onClick={() => setShowFullNotes(v => !v)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                            aria-expanded={showFullNotes}
                          >
                            {showFullNotes ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No notes provided</p>
                    )}
                  </div>
                </div>

                {(resignation.approved_by || resignation.disapproved_by) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Approval Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resignation.approved_by && (
                        <div>
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Approved By</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-gray-900">{resignation.approved_by}</p>
                          </div>
                          {resignation.approved_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateTime(resignation.approved_at)}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {resignation.disapproved_by && (
                        <div>
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Disapproved By</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <p className="text-sm font-medium text-gray-900">{resignation.disapproved_by}</p>
                          </div>
                          {resignation.disapproved_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateTime(resignation.disapproved_at)}
                            </p>
                          )}
                          {resignation.disapproval_reason && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 font-medium">Reason: </span>
                              <span className="text-xs text-gray-700">{resignation.disapproval_reason}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(resignation.created_at || resignation.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resignation.created_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(resignation.created_at)}</p>
                        </div>
                      )}
                      
                      {resignation.updated_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(resignation.updated_at)}</p>
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

          
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}