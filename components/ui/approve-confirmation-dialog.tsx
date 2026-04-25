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
import { CheckCircle2, Loader2, X } from "lucide-react"

interface ApproveConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title?: string
  description?: string
  itemName?: string
  isLoading?: boolean
}

export function ApproveConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Approve Record",
  description = "Are you sure you want to approve this record?",
  itemName = "this item",
  isLoading = false,
}: ApproveConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md mx-4 sm:mx-0 sm:max-w-lg overflow-hidden border border-gray-200 shadow-2xl rounded-xl">
        <DialogHeader className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 leading-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1 pr-4">
                  {description}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 -mt-1 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="ml-3.5">
                <h3 className="text-sm font-semibold text-emerald-800">
                  Approval requires confirmation
                </h3>
                <div className="mt-2 text-sm text-emerald-700">
                  <p className="leading-relaxed">
                    You are about to approve <span className="font-semibold">{itemName}</span>.
                  </p>
                  <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200">
                    <div className="flex items-center text-xs text-emerald-600">
                      <CheckCircle2 className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="font-medium">Proceed only if the record is correct</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:hidden">
            <div className="flex items-center justify-center p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0" />
              <span className="text-xs font-medium text-emerald-800">
                This approval will update the record status
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center text-xs text-gray-500">
                <CheckCircle2 className="h-3 w-3 mr-1 text-gray-400" />
                <span>This action updates status immediately</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="h-11 px-4 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium flex-1 sm:flex-none order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="h-11 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 flex-1 sm:flex-none order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="hidden sm:inline">Approving...</span>
                    <span className="sm:hidden">Approve</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline text-white">Approve</span>
                    <span className="sm:hidden">Approve</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
