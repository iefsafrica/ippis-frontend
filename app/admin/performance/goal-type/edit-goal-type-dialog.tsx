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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle, Target } from "lucide-react"
import type { TableGoalType } from "./goal-type-content"

interface EditGoalTypeDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { goal_type: string; description: string; status: "active" | "inactive" }) => Promise<void>
  goalType: TableGoalType
}

export function EditGoalTypeDialog({
  isOpen,
  onClose,
  onSubmit,
  goalType,
}: EditGoalTypeDialogProps) {
  const [formData, setFormData] = useState({
    goalType: goalType.goalType,
    description: goalType.description,
    status: goalType.status as "active" | "inactive",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData({
      goalType: goalType.goalType,
      description: goalType.description,
      status: goalType.status,
    })
  }, [goalType.goalType, goalType.description, goalType.status])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        goal_type: formData.goalType.trim(),
        description: formData.description.trim(),
        status: formData.status,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Target className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Goal Type
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update goal type details
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Goal Type
                </Label>
                <Input
                  value={formData.goalType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, goalType: e.target.value }))}
                  className="h-11 border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description
                </Label>
                <Input
                  value={formData.description || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="h-11 border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as "active" | "inactive" }))}
                >
                  <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Goal type name, description, and status can be updated here.
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="h-10 px-6 border-gray-300 hover:bg-gray-100 text-gray-700 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Goal Type
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
