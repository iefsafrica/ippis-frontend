"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Target, FileText, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface AddGoalTypeDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { goal_type: string; description: string; status: "active" | "inactive" }) => Promise<void> | void
}

export function AddGoalTypeDialog({ isOpen, onClose, onSubmit }: AddGoalTypeDialogProps) {
  const [formData, setFormData] = useState({
    goalType: "",
    description: "",
    status: "active" as "active" | "inactive",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        goalType: "",
        description: "",
        status: "active",
      })
      setErrors({})
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.goalType.trim()) newErrors.goalType = "Goal type is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.status) newErrors.status = "Status is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Creating goal type...")

    try {
      const payload = {
        goal_type: formData.goalType.trim(),
        description: formData.description.trim(),
        status: formData.status,
      }

      await onSubmit(payload)

      toast.success("Goal type created successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      onClose()
    } catch (error) {
      console.error("Error submitting goal type:", error)
      toast.error("Failed to create goal type. Please try again.", {
        id: loadingToast,
        duration: 4000,
      })
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
                  New Goal Type
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Create a performance goal type
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Goal Type Details</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="goalType" className="text-sm font-medium text-gray-700 mb-2 block">
                      Goal Type *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                        <Target className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input
                        id="goalType"
                        name="goalType"
                        value={formData.goalType}
                        onChange={handleChange}
                        className="h-11 border-gray-300 pl-12 text-gray-900"
                        placeholder="Enter goal type name"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.goalType && <p className="text-sm text-red-600 mt-2">{errors.goalType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                      Description *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 w-10 flex items-start justify-center pt-3 border-r border-gray-300 bg-gray-50 rounded-l-md h-[120px]">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the goal type..."
                        className="min-h-[120px] border-gray-300 pl-12 text-gray-900 resize-none"
                        rows={4}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.description && <p className="text-sm text-red-600 mt-2">{errors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                      Status *
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value as "active" | "inactive" }))
                      }
                    >
                      <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-red-600 mt-2">{errors.status}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Required fields are marked with *
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
                  className="h-10 px-8 bg-green-700 hover:bg-green-800 text-white flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Goal Type
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
