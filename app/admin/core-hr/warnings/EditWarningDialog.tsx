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
import { Loader2, FileText, CheckCircle, AlertTriangle, Calendar, User } from "lucide-react"
import { toast } from "sonner"
import type { UpdateEmployeeWarningRequest, EmployeeWarning } from "@/types/hr-core/employeeWarnings"

interface EditWarningDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdateEmployeeWarningRequest & { id: number }) => Promise<void>
  initialData: EmployeeWarning
  isLoading?: boolean
}

export function EditWarningDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading: externalIsLoading 
}: EditWarningDialogProps) {
  const [formData, setFormData] = useState<UpdateEmployeeWarningRequest & { id: number }>({
    id: 0,
    employee_id: "",
    employee_name: "",
    department: "",
    warning_subject: "",
    warning_description: "",
    warning_type: "written",
    warning_date: "",
    expiry_date: "",
    issued_by: "",
    supporting_documents: "",
    status: "active",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        employee_id: initialData.employee_id,
        employee_name: initialData.employee_name,
        department: initialData.department,
        warning_subject: initialData.warning_subject,
        warning_description: initialData.warning_description,
        warning_type: initialData.warning_type,
        warning_date: initialData.warning_date.split('T')[0],
        expiry_date: initialData.expiry_date.split('T')[0],
        issued_by: initialData.issued_by,
        supporting_documents: initialData.supporting_documents,
        status: initialData.status,
      })
    }
  }, [initialData])

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id: 0,
        employee_id: "",
        employee_name: "",
        department: "",
        warning_subject: "",
        warning_description: "",
        warning_type: "written",
        warning_date: "",
        expiry_date: "",
        issued_by: "",
        supporting_documents: "",
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

  const handleSelectChange = (name: keyof UpdateEmployeeWarningRequest, value: string) => {
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

    if (!formData.employee_id?.trim()) newErrors.employee_id = "Employee ID is required"
    if (!formData.employee_name?.trim()) newErrors.employee_name = "Employee name is required"
    if (!formData.department?.trim()) newErrors.department = "Department is required"
    if (!formData.warning_subject?.trim()) newErrors.warning_subject = "Warning subject is required"
    if (!formData.warning_description?.trim()) newErrors.warning_description = "Warning description is required"
    if (!formData.warning_date) newErrors.warning_date = "Warning date is required"
    if (!formData.expiry_date) newErrors.expiry_date = "Expiry date is required"
    
    const warningDate = new Date(formData.warning_date || "")
    const expiryDate = new Date(formData.expiry_date || "")
    if (expiryDate <= warningDate) {
      newErrors.expiry_date = "Expiry date must be after warning date"
    }
    
    if (!formData.issued_by?.trim()) newErrors.issued_by = "Issued by is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating employee warning...")

    try {
      await onSubmit(formData)
      
      toast.success("Employee warning updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error) {
      console.error("Error updating warning:", error)
      toast.error("Failed to update employee warning. Please try again.", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const departmentOptions = [
    { value: "Finance", label: "Finance" },
    { value: "IT", label: "Information Technology" },
    { value: "HR", label: "Human Resources" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Operations", label: "Operations" },
    { value: "Customer Service", label: "Customer Service" },
    { value: "Legal", label: "Legal" },
  ]

  const warningTypeOptions = [
    { value: "verbal", label: "Verbal Warning" },
    { value: "written", label: "Written Warning" },
    { value: "final", label: "Final Warning" },
  ]

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "withdrawn", label: "Withdrawn" },
  ]

  const isLoading = externalIsLoading || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Employee Warning
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update warning for {initialData?.employee_name} (ID: #{initialData?.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Warning Details</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="warning_subject" className="text-sm font-medium text-gray-700 mb-2 block">
                        Warning Subject *
                      </Label>
                      <Input
                        id="warning_subject"
                        name="warning_subject"
                        value={formData.warning_subject}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-gray-900"
                        disabled={isLoading}
                        required
                      />
                      {errors.warning_subject && (
                        <p className="text-sm text-red-600 mt-2">{errors.warning_subject}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warning_type" className="text-sm font-medium text-gray-700 mb-2 block">
                        Warning Type *
                      </Label>
                      <Select
                        value={formData.warning_type}
                        onValueChange={(value) => handleSelectChange("warning_type", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {warningTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="warning_description" className="text-sm font-medium text-gray-700 mb-2 block">
                      Description *
                    </Label>
                    <Textarea
                      id="warning_description"
                      name="warning_description"
                      value={formData.warning_description}
                      onChange={handleChange}
                      className="min-h-[120px] border-gray-300 text-gray-900"
                      disabled={isLoading}
                      required
                    />
                    {errors.warning_description && (
                      <p className="text-sm text-red-600 mt-2">{errors.warning_description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="warning_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        Warning Date *
                      </Label>
                      <Input
                        id="warning_date"
                        name="warning_date"
                        type="date"
                        value={formData.warning_date}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-gray-900"
                        disabled={isLoading}
                        required
                      />
                      {errors.warning_date && (
                        <p className="text-sm text-red-600 mt-2">{errors.warning_date}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiry_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        Expiry Date *
                      </Label>
                      <Input
                        id="expiry_date"
                        name="expiry_date"
                        type="date"
                        value={formData.expiry_date}
                        onChange={handleChange}
                        className="h-11 border-gray-300 text-gray-900"
                        disabled={isLoading}
                        required
                      />
                      {errors.expiry_date && (
                        <p className="text-sm text-red-600 mt-2">{errors.expiry_date}</p>
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
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issued_by" className="text-sm font-medium text-gray-700 mb-2 block">
                      Issued By *
                    </Label>
                    <Input
                      id="issued_by"
                      name="issued_by"
                      value={formData.issued_by}
                      onChange={handleChange}
                      className="h-11 border-gray-300 text-gray-900"
                      disabled={isLoading}
                      required
                    />
                    {errors.issued_by && (
                      <p className="text-sm text-red-600 mt-2">{errors.issued_by}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supporting_documents" className="text-sm font-medium text-gray-700 mb-2 block">
                      Supporting Documents URL
                    </Label>
                    <Input
                      id="supporting_documents"
                      name="supporting_documents"
                      value={formData.supporting_documents}
                      onChange={handleChange}
                      className="h-11 border-gray-300 text-gray-900"
                      placeholder="https://example.com/document.pdf"
                      disabled={isLoading}
                    />
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
                      Update Warning
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