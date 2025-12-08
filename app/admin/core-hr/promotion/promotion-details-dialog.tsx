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
import { TablePromotion } from "@/types/hr-core/promotion-management"

interface PromotionDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  promotion: TablePromotion | null
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

          {promotion.employeeEmail && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{promotion.employeeEmail}</p>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Company/Department</h3>
            <p className="mt-1">{promotion.company || 'Not specified'}</p>
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

          {(promotion.createdAt || promotion.updatedAt) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">System Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {promotion.createdAt && (
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p>{new Date(promotion.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
                {promotion.updatedAt && (
                  <div>
                    <span className="text-gray-500">Updated:</span>
                    <p>{new Date(promotion.updatedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}