"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Briefcase,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Users,
  X,
} from "lucide-react"
import type { LocalTraining } from "@/utils/training-converters"

interface ViewTrainingDialogProps {
  isOpen: boolean
  onClose: () => void
  training: LocalTraining
  onEdit: () => void
  onDelete: () => void
}

const formatDate = (value?: string) => {
  if (!value) return "TBD"
  try {
    return format(new Date(value), "PPP")
  } catch {
    return value
  }
}

const formatDateTime = (value?: string) => {
  if (!value) return "TBD"
  try {
    return format(new Date(value), "PPpp")
  } catch {
    return value
  }
}

const formatCurrency = (value: number | undefined) => {
  if (!value && value !== 0) return "₦0.00"
  return `₦${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const statusBadge: Record<string, string> = {
  upcoming: "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800",
  "in-progress": "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800",
  completed: "bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-green-800",
  cancelled: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800",
}

export function ViewTrainingDialog({
  isOpen,
  onClose,
  training,
  onEdit,
  onDelete,
}: ViewTrainingDialogProps) {
  const normalizedStatus = training.status?.toLowerCase() ?? "upcoming"
  const badgeClass = statusBadge[normalizedStatus] ?? statusBadge.upcoming

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Training Program Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  {training.title} • {training.type}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-500">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${badgeClass} px-3 py-1.5 font-medium rounded-full`}>
                {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
              </Badge>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(training.startDate)} - {formatDate(training.endDate)}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <Users className="h-4 w-4" />
                <span>{training.participants ?? 0} participants</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(training.cost)}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-1 text-xs uppercase tracking-wide text-gray-500 font-medium">
                  <span>Trainer</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{training.trainer}</p>
              </div>
              <div>
                <div className="flex items-center mb-1 text-xs uppercase tracking-wide text-gray-500 font-medium">
                  <span>Location</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{training.location || "Not specified"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Schedule</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Start</span>
                  <p className="text-sm font-medium text-gray-900">{formatDate(training.startDate)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">End</span>
                  <p className="text-sm font-medium text-gray-900">{formatDate(training.endDate)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Cost</span>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(training.cost)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Participants</span>
                  <p className="text-sm font-medium text-gray-900">{training.participants ?? 0}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Content</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Description</span>
                  <p className="text-sm text-gray-700">{training.description || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Objectives</span>
                  <p className="text-sm text-gray-700">{training.objectives || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Materials</span>
                  <p className="text-sm text-gray-700">{training.materials || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Created at</div>
                <p className="text-sm text-gray-700">{formatDateTime(training.createdAt)}</p>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Last updated</div>
                <p className="text-sm text-gray-700">{formatDateTime(training.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-5 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between w-full flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={onDelete}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Training
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700">
                Close
              </Button>
              <Button onClick={onEdit} className="bg-blue-600 text-white hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit Training
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
