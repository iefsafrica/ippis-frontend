"use client"

import type React from "react"

import { useState } from "react"
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
import { Loader2 } from "lucide-react"

interface AddPromotionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function AddPromotionDialog({ isOpen, onClose, onSubmit }: AddPromotionDialogProps) {
  const [formData, setFormData] = useState({
    employee: "",
    employeeId: "",
    company: "",
    promotionTitle: "",
    date: new Date().toISOString().split("T")[0],
    previousPosition: "",
    details: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
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

    if (!formData.employee.trim()) newErrors.employee = "Employee name is required"
    if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required"
    if (!formData.company.trim()) newErrors.company = "Company is required"
    if (!formData.promotionTitle.trim()) newErrors.promotionTitle = "Promotion title is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.previousPosition.trim()) newErrors.previousPosition = "Previous position is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSubmit(formData)
      onClose()
      // Reset form
      setFormData({
        employee: "",
        employeeId: "",
        company: "",
        promotionTitle: "",
        date: new Date().toISOString().split("T")[0],
        previousPosition: "",
        details: "",
      })
    } catch (error) {
      console.error("Error submitting promotion:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Promotion</DialogTitle>
            <DialogDescription>
              Enter the details for the employee promotion. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee" className={errors.employee ? "text-red-500" : ""}>
                  Employee Name*
                </Label>
                <Input
                  id="employee"
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  className={errors.employee ? "border-red-500" : ""}
                />
                {errors.employee && <p className="text-xs text-red-500">{errors.employee}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId" className={errors.employeeId ? "text-red-500" : ""}>
                  Employee ID*
                </Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={errors.employeeId ? "border-red-500" : ""}
                />
                {errors.employeeId && <p className="text-xs text-red-500">{errors.employeeId}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className={errors.company ? "text-red-500" : ""}>
                Company/Department*
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={errors.company ? "border-red-500" : ""}
              />
              {errors.company && <p className="text-xs text-red-500">{errors.company}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="previousPosition" className={errors.previousPosition ? "text-red-500" : ""}>
                  Previous Position*
                </Label>
                <Input
                  id="previousPosition"
                  name="previousPosition"
                  value={formData.previousPosition}
                  onChange={handleChange}
                  className={errors.previousPosition ? "border-red-500" : ""}
                />
                {errors.previousPosition && <p className="text-xs text-red-500">{errors.previousPosition}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotionTitle" className={errors.promotionTitle ? "text-red-500" : ""}>
                  New Position/Title*
                </Label>
                <Input
                  id="promotionTitle"
                  name="promotionTitle"
                  value={formData.promotionTitle}
                  onChange={handleChange}
                  className={errors.promotionTitle ? "border-red-500" : ""}
                />
                {errors.promotionTitle && <p className="text-xs text-red-500">{errors.promotionTitle}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className={errors.date ? "text-red-500" : ""}>
                Promotion Date*
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details/Reason for Promotion</Label>
              <Textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={3}
                placeholder="Enter details about the promotion..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Promotion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
