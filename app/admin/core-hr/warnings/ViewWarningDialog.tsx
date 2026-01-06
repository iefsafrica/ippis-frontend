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
import { Calendar, User, FileText, Building, ArrowRight, Hash, Briefcase, Clock, XCircle, CheckCircle, AlertTriangle, Shield, Download } from "lucide-react"
import type { EmployeeWarning } from "@/types/hr-core/employeeWarnings"
import { format } from "date-fns"

interface ViewWarningDialogProps {
  isOpen: boolean
  onClose: () => void
  warning: EmployeeWarning
}

export function ViewWarningDialog({ 
  isOpen, 
  onClose, 
  warning 
}: ViewWarningDialogProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)

  const initials = useMemo(() => {
    if (!warning?.employee_name) return ""
    return warning.employee_name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [warning?.employee_name])

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
      active: { 
        label: "Active", 
        className: "bg-red-100 text-red-800 hover:bg-red-100",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      },
      expired: { 
        label: "Expired", 
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      withdrawn: { 
        label: "Withdrawn", 
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        icon: <CheckCircle className="h-3 w-3 mr-1" />
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

  const getWarningTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; className: string }> = {
      verbal: { label: "Verbal Warning", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
      written: { label: "Written Warning", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
      final: { label: "Final Warning", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    }
    
    const config = typeConfig[type?.toLowerCase()] || { 
      label: type || "Unknown", 
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
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Warning Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View warning information for {warning.employee_name}
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
              <XCircle className="h-4 w-4" />
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
                          <p className="text-sm font-medium text-gray-900">{warning.employee_name}</p>
                          <p className="text-xs text-gray-500">{warning.employee_id}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Hash className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Employee ID</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 font-mono">{warning.employee_id}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Building className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Department</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{warning.department}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Issued By</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{warning.issued_by}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Warning Details</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Warning Subject</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{warning.warning_subject}</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <Shield className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Warning Type</span>
                    </div>
                    {getWarningTypeBadge(warning.warning_type)}
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-xs text-gray-500 font-medium">Status</span>
                    </div>
                    {getStatusBadge(warning.status)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Warning Period</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 flex-1">
                      <p className="text-sm font-medium text-gray-900">Warning Date</p>
                      <p className="text-xs text-gray-500">{formatDate(warning.warning_date)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-1">
                      <p className="text-sm font-medium text-gray-900">Expiry Date</p>
                      <p className="text-xs text-gray-500">{formatDate(warning.expiry_date)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-500 font-medium">Description</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {warning.warning_description ? (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {warning.warning_description.length > MAX_PREVIEW && !showFullDescription
                            ? `${warning.warning_description.slice(0, MAX_PREVIEW)}…`
                            : warning.warning_description}
                        </p>
                        {warning.warning_description.length > MAX_PREVIEW && (
                          <button
                            onClick={() => setShowFullDescription(v => !v)}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                            aria-expanded={showFullDescription}
                          >
                            {showFullDescription ? "Show less" : "Show more"}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No description provided</p>
                    )}
                  </div>
                </div>

                {warning.supporting_documents && (
                  <div>
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Supporting Documents</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(warning.supporting_documents, '_blank')}
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(warning.supporting_documents, '_blank')}
                        className="border-gray-300 hover:bg-gray-100"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Timestamps</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {warning.created_at && (
                      <div>
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-xs text-gray-500 font-medium">Created At</span>
                        </div>
                        <p className="text-sm text-gray-600">{formatDateTime(warning.created_at)}</p>
                      </div>
                    )}
                    
                    {warning.updated_at && (
                      <div>
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                        </div>
                        <p className="text-sm text-gray-600">{formatDateTime(warning.updated_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
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

            <div className="flex items-center space-x-2">
              {warning.supporting_documents && (
                <Button
                  variant="outline"
                  onClick={() => window.open(warning.supporting_documents, '_blank')}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}