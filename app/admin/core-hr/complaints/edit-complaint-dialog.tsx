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
import { Loader2, User, Building, AlertCircle, AlertTriangle, MessageSquare, CheckCircle, FileText } from "lucide-react"
import { toast } from "sonner"
import type { UpdateEmployeeComplaintRequest } from "@/types/hr-core/employee-complaints"

interface EditComplaintDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdateEmployeeComplaintRequest & { id: number }) => Promise<void>
  initialData: any
  isLoading?: boolean
}

export function EditComplaintDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading: externalIsLoading 
}: EditComplaintDialogProps) {
  const [formData, setFormData] = useState<UpdateEmployeeComplaintRequest & { id: number }>({
    id: 0,
    complaint: "",
    status: "pending",
    priority: "medium",
    assigned_to: "",
    //@ts-expect-error - fix this later
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedPriority, setSelectedPriority] = useState("medium")
  const [selectedStatus, setSelectedStatus] = useState("pending")
  const [selectedAssignee, setSelectedAssignee] = useState("")

  useEffect(() => {
    if (initialData) {
      const priority = initialData.priority || "medium"
      const status = initialData.status || "pending"
      const assignedTo = initialData.assigned_to || ""
      
      setFormData({
        id: initialData.id || 0,
        complaint: initialData.complaint || "",
        status: status,
        priority: priority,
        assigned_to: assignedTo,
        //@ts-expect-error - fix this later
        notes: initialData.notes || "",
      })
      
      setSelectedPriority(priority)
      setSelectedStatus(status)
      setSelectedAssignee(assignedTo)
    }
  }, [initialData])

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id: 0,
        complaint: "",
        status: "pending",
        priority: "medium",
        assigned_to: "",
        //@ts-expect-error - fix this later
        notes: "",
      })
      setErrors({})
      setSelectedPriority("medium")
      setSelectedStatus("pending")
      setSelectedAssignee("")
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

  const handleSelectChange = (name: keyof UpdateEmployeeComplaintRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePriorityChange = (value: string) => {
    setSelectedPriority(value)
    handleSelectChange("priority", value)
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    handleSelectChange("status", value)
  }

  const handleAssigneeChange = (value: string) => {
    setSelectedAssignee(value)
    handleSelectChange("assigned_to", value)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    //@ts-expect-error - fix this later
    if (!formData.complaint.trim()) newErrors.complaint = "Complaint description is required"
    //@ts-expect-error - fix this later
    if (!formData.priority.trim()) newErrors.priority = "Priority is required"
    //@ts-expect-error - fix this later
    if (!formData.status.trim()) newErrors.status = "Status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating complaint record...")

    try {
      await onSubmit(formData)
      
      toast.success("Complaint record updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error: any) {
      console.error("Error updating complaint:", error)
      toast.error(error.message || "Failed to update complaint record. Please try again.", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ]

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" },
  ]

  const assigneeOptions = [
    { value: "hr_manager", label: "HR Manager" },
    { value: "department_head", label: "Department Head" },
    { value: "facilities_manager", label: "Facilities Manager" },
    { value: "compliance_officer", label: "Compliance Officer" },
  ]

  const isLoading = externalIsLoading || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden border border-gray-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <AlertCircle className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Complaint
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update complaint for {initialData?.employee_name || "employee"} (ID: #{initialData?.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Complaint Details</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium text-gray-700 mb-2 block">
                        Priority *
                      </Label>
                      <Select
                        value={selectedPriority}
                        onValueChange={handlePriorityChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-gray-500 mr-3" />
                            <SelectValue placeholder="Select priority" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <p className="text-sm text-red-600 mt-2">{errors.priority}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                        Status *
                      </Label>
                      <Select
                        value={selectedStatus}
                        onValueChange={handleStatusChange}
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
                    <Label htmlFor="complaint" className="text-sm font-medium text-gray-700 mb-2 block">
                      Complaint Description *
                    </Label>
                    <Textarea
                      id="complaint"
                      name="complaint"
                      value={formData.complaint}
                      onChange={handleChange}
                      className="min-h-[150px] border-gray-300 text-gray-900"
                      placeholder="Update complaint description..."
                      disabled={isLoading}
                    />
                    {errors.complaint && (
                      <p className="text-sm text-red-600 mt-2">{errors.complaint}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_to" className="text-sm font-medium text-gray-700 mb-2 block">
                      Assign To
                    </Label>
                    <Select
                      value={selectedAssignee}
                      onValueChange={handleAssigneeChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-500 mr-3" />
                          <SelectValue placeholder="Select assignee" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {assigneeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      //@ts-expect-error - fix this later
                      value={formData.notes}
                      onChange={handleChange}
                      className="min-h-[100px] border-gray-300 text-gray-900"
                      placeholder="Enter any additional notes or resolution details..."
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
                      You can update the complaint details, priority, status, and assignee here. 
                      Employee information and submission date cannot be modified.
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
                      Update Complaint
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