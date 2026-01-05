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
import { Loader2, FileText, CheckCircle, LogOut } from "lucide-react"
import { toast } from "sonner"
import type { UpdateResignationRequest, Resignation } from "@/types/hr-core/resignations"

interface EditResignationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdateResignationRequest & { id: number }) => Promise<void>
  initialData: Resignation
  isLoading?: boolean
}

export function EditResignationDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading: externalIsLoading 
}: EditResignationDialogProps) {
  // Capitalize the first letter to match API expectations
  const formatExitInterviewValue = (value: string): string => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }

  const parseExitInterviewValue = (value: string): string => {
    return value.toLowerCase()
  }

  const [formData, setFormData] = useState<UpdateResignationRequest & { id: number }>({
    id: 0,
    notes: "",
    exit_interview: "pending",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        notes: initialData.notes || "",
        //@ts-expect-error - fix this later
        exit_interview: parseExitInterviewValue(initialData.exit_interview || "pending"),
      })
    }
  }, [initialData])

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id: 0,
        notes: "",
        exit_interview: "pending",
      })
      setErrors({})
    }
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const handleSelectChange = (name: keyof UpdateResignationRequest, value: string) => {
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
    
    if (!formData.exit_interview) newErrors.exit_interview = "Exit interview status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating resignation record...")

    try {
      // Format the data for API (capitalize exit_interview)
      const formattedData = {
        ...formData,
        //@ts-expect-error - fix this later
        exit_interview: formatExitInterviewValue(formData.exit_interview)
      }
      //@ts-expect-error - fix this later
      await onSubmit(formattedData)
      
      toast.success("Resignation record updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error: any) {
      console.error("Error updating resignation:", error)
      toast.error(error.message || "Failed to update resignation record. Please try again.", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const exitInterviewOptions = [
    { value: "pending", label: "Pending" },
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
  ]

  const isLoading = externalIsLoading || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden border border-gray-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <LogOut className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Resignation Request
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update resignation request for {initialData?.employee_name || "employee"} (ID: #{initialData?.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Resignation Details</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="exit_interview" className="text-sm font-medium text-gray-700 mb-2 block">
                      Exit Interview Status *
                    </Label>
                    <Select
                      value={formData.exit_interview}
                      onValueChange={(value) => handleSelectChange("exit_interview", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-500 mr-3" />
                          <SelectValue placeholder="Select status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {exitInterviewOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.exit_interview && (
                      <p className="text-sm text-red-600 mt-2">{errors.exit_interview}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="min-h-[150px] border-gray-300 text-gray-900"
                      placeholder="Update notes about the resignation..."
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">Note</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Only notes and exit interview status can be updated for a resignation request. 
                      Other details like dates and reason require creating a new resignation request.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Required fields are marked with *
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="h-10 px-6 border-gray-300 hover:bg-gray-100 text-gray-700 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Resignation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}