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
import { Loader2 } from "lucide-react"
import React from "react"

interface ConfirmActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  isLoading?: boolean
  actionLabel?: string
  actionVariant?: "default" | "success" | "danger"
  icon?: React.ReactNode
}

export function ConfirmActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading,
  actionLabel = "Confirm",
  actionVariant = "default",
  icon,
}: ConfirmActionDialogProps) {
  const actionClasses =
    actionVariant === "success"
      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
      : actionVariant === "danger"
      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md mx-4 sm:mx-0 sm:max-w-lg overflow-hidden border border-gray-200 shadow-2xl rounded-xl">
        <DialogHeader className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg border">
                {icon}
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
              ✕
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          {itemName && (
            <div className="text-sm text-gray-700">
              <span className="font-medium">{itemName}</span>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-4">
            <div />
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
                onClick={onConfirm}
                disabled={isLoading}
                className={`h-11 px-6 ${actionClasses} text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 flex-1 sm:flex-none order-1 sm:order-2`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    {icon && <span className="mr-2">{icon}</span>}
                    <span className="hidden sm:inline">{actionLabel}</span>
                    <span className="sm:hidden">{actionLabel}</span>
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