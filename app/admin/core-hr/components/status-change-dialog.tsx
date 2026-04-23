"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, RefreshCw } from "lucide-react"

type StatusOption = {
  value: string
  label: string
}

interface StatusChangeDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  currentStatus: string
  options: StatusOption[]
  onConfirm: (status: string) => Promise<void> | void
  confirmLabel?: string
  isLoading?: boolean
}

export function StatusChangeDialog({
  isOpen,
  onClose,
  title,
  description,
  currentStatus,
  options,
  onConfirm,
  confirmLabel = "Update Status",
  isLoading = false,
}: StatusChangeDialogProps) {
  const [status, setStatus] = useState(currentStatus)

  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus)
    }
  }, [currentStatus, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md overflow-hidden border border-gray-200 shadow-xl">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <RefreshCw className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">{description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
              <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-gray-300">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(status)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
