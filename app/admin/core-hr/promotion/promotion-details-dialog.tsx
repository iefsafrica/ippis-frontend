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

interface Promotion {
  id: string
  employee: string
  employeeId: string
  company: string
  promotionTitle: string
  date: string
  previousPosition: string
  details: string
}

interface PromotionDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  promotion: Promotion | null
}

export function PromotionDetailsDialog({ isOpen, onClose, promotion }: PromotionDetailsDialogProps) {
  if (!promotion) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Promotion Details</DialogTitle>
          <DialogDescription>Viewing details for {promotion.employee}'s promotion</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employee</h3>
              <p className="mt-1">{promotion.employee}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
              <p className="mt-1">{promotion.employeeId}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Company/Department</h3>
            <p className="mt-1">{promotion.company}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Previous Position</h3>
              <p className="mt-1">{promotion.previousPosition}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">New Position</h3>
              <p className="mt-1">{promotion.promotionTitle}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Promotion Date</h3>
            <p className="mt-1">{new Date(promotion.date).toLocaleDateString()}</p>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Details/Reason</h3>
            <p className="mt-1 whitespace-pre-wrap">{promotion.details || "No details provided"}</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
