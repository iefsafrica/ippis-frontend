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
import { Loader2, FileText, CheckCircle, LogOut, Calendar } from "lucide-react"
import { toast } from "sonner"
import type { UpdateTerminationRequest, Termination } from "@/types/hr-core/terminations"
import { format } from "date-fns"

interface EditTerminationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdateTerminationRequest & { id: number }) => Promise<void>
  initialData: Termination
  isLoading?: boolean
}

export function EditTerminationDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading: externalIsLoading 
}: EditTerminationDialogProps) {
  const [formData, setFormData] = useState<UpdateTerminationRequest & { id: number }>({
    id: initialData?.id || 0,
    termination_reason: "",
    status: "active",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        termination_reason: initialData.termination_reason || "",
        termination_type: initialData.termination_type || "resignation",
        status: initialData.status || "active",
      })
    }
  }, [initialData])

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id: 0,
        termination_reason: "",
        status: "active",
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

  const handleSelectChange = (name: keyof UpdateTerminationRequest, value: string) => {
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
    
    if (!formData.status) newErrors.status = "Status is required"
    if (!formData.termination_reason?.trim()) newErrors.termination_reason = "Termination reason is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating termination record...")

    try {
      await onSubmit(formData)
      
      toast.success("Termination record updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error: any) {
      console.error("Error updating termination:", error)
      toast.error(error.message || "Failed to update termination record. Please try again.", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const terminationTypeOptions = [
    { value: "resignation", label: "Resignation" },
    { value: "termination", label: "Termination" },
    { value: "retirement", label: "Retirement" },
    { value: "layoff", label: "Layoff" },
    { value: "dismissal", label: "Dismissal" },
    { value: "end_of_contract", label: "End of Contract" },
    { value: "mutual_agreement", label: "Mutual Agreement" },
  ]

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "revoked", label: "Revoked" },
    { value: "cancelled", label: "Cancelled" },
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
                  Edit Termination Record
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update termination record for {initialData?.employee_name || "employee"} (ID: #{initialData?.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Termination Details</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="termination_type" className="text-sm font-medium text-gray-700 mb-2 block">
                        Termination Type
                      </Label>
                      <Select
                        value={formData.termination_type}
                        onValueChange={(value) => handleSelectChange("termination_type", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-3" />
                            <SelectValue placeholder="Select termination type" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {terminationTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.termination_type && (
                        <p className="text-sm text-red-600 mt-2">{errors.termination_type}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                        Status *
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleSelectChange("status", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-red-600 mt-2">{errors.status}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="termination_reason" className="text-sm font-medium text-gray-700 mb-2 block">
                      Termination Reason *
                    </Label>
                    <Textarea
                      id="termination_reason"
                      name="termination_reason"
                      value={formData.termination_reason}
                      onChange={handleChange}
                      className="min-h-[150px] border-gray-300 text-gray-900"
                      placeholder="Update termination reason..."
                      disabled={isLoading}
                    />
                    {errors.termination_reason && (
                      <p className="text-sm text-red-600 mt-2">{errors.termination_reason}</p>
                    )}
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
                      You can update the termination reason, type, and status. Other details like employee information 
                      and termination date are fixed once created.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500 font-medium mb-1 block">
                      Termination Date
                    </Label>
                    <div className="flex items-center">
                      <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input
                        value={format(new Date(initialData.termination_date), "PPP")}
                        className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Original termination date: {format(new Date(initialData.termination_date), "PPP")}
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
                      Update Termination
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