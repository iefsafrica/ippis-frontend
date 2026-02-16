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
import { Calendar, Target, X, CheckCircle, XCircle, FileText } from "lucide-react"
import type { TableGoalType } from "./goal-type-content"

interface ViewGoalTypeDialogProps {
  isOpen: boolean
  onClose: () => void
  goalType: TableGoalType
  onEdit?: () => void
  onDelete?: () => void
}

export function ViewGoalTypeDialog({
  isOpen,
  onClose,
  goalType,
  onEdit,
  onDelete,
}: ViewGoalTypeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Target className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Goal Type Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  View goal type information
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
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Goal Type Information</h3>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Target className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Goal Type</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{goalType.goalType}</p>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Created Date</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {goalType.createdDate
                          ? new Date(goalType.createdDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-500 font-medium">Status</span>
                      </div>
                      <Badge variant={goalType.status === "active" ? "success" : "secondary"} className="capitalize">
                        {goalType.status === "active" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {goalType.status}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Description</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {goalType.description || "No description"}
                      </p>
                    </div>
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
                  Edit Goal Type
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
