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
import { Calendar, MapPin, User, Building, Plane, Hotel, CreditCard, Briefcase, Hash, Clock, Edit, Trash2, X, FileText } from "lucide-react"
import type { LocalTravel } from "@/types/hr-core/travel"
import { format } from "date-fns"

interface ViewTravelDialogProps {
  isOpen: boolean
  onClose: () => void
  travel: LocalTravel
  onEdit: () => void
  onDelete: () => void
}

export function ViewTravelDialog({ 
  isOpen, 
  onClose, 
  travel, 
  onEdit, 
  onDelete 
}: ViewTravelDialogProps) {
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
      completed: { label: "Completed", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
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

  const calculateDuration = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
    } catch {
      return "N/A"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Plane className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Travel Request Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View travel information for {travel.employeeName}
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
                      <p className="text-sm font-medium text-gray-900">{travel.employeeName}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Building className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Department</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{travel.department}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Hash className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Employee ID</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 font-mono">{travel.employeeId}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium">Status</span>
                      </div>
                      {getStatusBadge(travel.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Travel Details</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Purpose</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{travel.purpose}</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Destination</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{travel.destination}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Travel Dates</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(travel.startDate)} - {formatDate(travel.endDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {calculateDuration(travel.startDate, travel.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Plane className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Travel Mode</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{travel.travelMode}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Hotel className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Accommodation</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{travel.accommodation}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Estimated Cost</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₦{parseFloat(travel.estimatedCost || "0").toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Advance Amount</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₦{parseFloat(travel.advanceAmount || "0").toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                {travel.notes && (
                  <div>
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-xs text-gray-500 font-medium">Notes</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{travel.notes}</p>
                    </div>
                  </div>
                )}

                {(travel.created_at || travel.updated_at) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">Metadata</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {travel.created_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Created At</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(travel.created_at)}</p>
                        </div>
                      )}
                      
                      {travel.updated_at && (
                        <div>
                          <div className="flex items-center mb-2">
                            <Clock className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(travel.updated_at)}</p>
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
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Travel
            </Button>
            
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
                Edit Travel
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}