"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, FileText, Phone, User, X } from "lucide-react"
import type { Leave } from "@/types/calendar/leaves"
import { format } from "date-fns"

interface ViewLeaveDialogProps {
  isOpen: boolean
  onClose: () => void
  leave: Leave
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  approved: "bg-green-100 text-green-800 hover:bg-green-100",
  rejected: "bg-red-100 text-red-800 hover:bg-red-100",
}

export function ViewLeaveDialog({ isOpen, onClose, leave }: ViewLeaveDialogProps) {
  const [showFullReason, setShowFullReason] = useState(false)

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

  const statusClass = statusStyles[leave.status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"

  const dayCount = useMemo(() => {
    const start = new Date(leave.start_date)
    const end = new Date(leave.end_date)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  }, [leave.end_date, leave.start_date])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <CalendarDays className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Leave Request Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View leave request information for {leave.employee_name}
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
                      <p className="text-sm font-medium text-gray-900">{leave.employee_name}</p>
                      <p className="text-xs text-gray-500">{leave.employee_id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium">Status</span>
                      </div>
                      <Badge className={`${statusClass} py-1 px-2`} variant="outline">
                        {leave.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Leave Details</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <CalendarDays className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Leave Dates</span>
                    </div>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">Start Date</p>
                      <p className="text-xs text-gray-500">{formatDate(leave.start_date)}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-2">
                      <p className="text-sm font-medium text-gray-900">End Date</p>
                      <p className="text-xs text-gray-500">{formatDate(leave.end_date)}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">{dayCount} day(s)</div>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Leave Type</span>
                    </div>
                    <p className="text-sm text-gray-700">{leave.leave_type}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Reason</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {leave.reason ? (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {leave.reason.length > MAX_PREVIEW && !showFullReason
                            ? `${leave.reason.slice(0, MAX_PREVIEW)}...`
                            : leave.reason}
                        </p>
                        {leave.reason.length > MAX_PREVIEW && (
                          <button
                            onClick={() => setShowFullReason((value) => !value)}
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
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Emergency Contact</span>
                  </div>
                  <p className="text-sm text-gray-700">{leave.emergency_contact}</p>
                </div>

                {(leave.created_at || leave.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {leave.created_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(leave.created_at)}</p>
                        </div>
                      )}

                      {leave.updated_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(leave.updated_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
