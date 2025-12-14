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
import { Loader2, User, Building, Calendar, Award, ChevronDown, Hash, BadgeCheck, Gift, Briefcase } from "lucide-react"
import type { LocalAward } from "@/types/hr-core/awards"
import { toast } from "sonner"

interface EditAwardDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  initialData: LocalAward
  isLoading?: boolean
}

export function EditAwardDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading: externalIsLoading 
}: EditAwardDialogProps) {
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    department: "",
    awardType: "",
    giftItem: "",
    cashPrice: "",
    awardDate: "",
    description: "",
    status: "active",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        employeeId: "",
        employeeName: "",
        department: "",
        awardType: "",
        giftItem: "",
        cashPrice: "",
        awardDate: "",
        description: "",
        status: "active",
      })
      setErrors({})
    }
  }, [isOpen])

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeId: initialData.employeeId || "",
        employeeName: initialData.employeeName || "",
        department: initialData.department || "",
        awardType: initialData.awardType || "",
        giftItem: initialData.giftItem || "",
        cashPrice: initialData.cashPrice?.toString() || "",
        awardDate: initialData.awardDate || new Date().toISOString().split("T")[0],
        description: initialData.description || "",
        status: initialData.status || "active",
      })
    }
  }, [initialData])

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

  const handleSelectChange = (name: string, value: string) => {
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

    if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required"
    if (!formData.employeeName.trim()) newErrors.employeeName = "Employee name is required"
    if (!formData.department.trim()) newErrors.department = "Department is required"
    if (!formData.awardType.trim()) newErrors.awardType = "Award type is required"
    if (!formData.giftItem.trim()) newErrors.giftItem = "Gift item is required"
    if (!formData.cashPrice.trim()) newErrors.cashPrice = "Cash price is required"
    if (parseFloat(formData.cashPrice) < 0) newErrors.cashPrice = "Cash price cannot be negative"
    if (!formData.awardDate) newErrors.awardDate = "Award date is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.status.trim()) newErrors.status = "Status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating award record...")

    try {
      await onSubmit(formData)
      
      toast.success("Award record updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error) {
      console.error("Error updating award:", error)
      toast.error("Failed to update award record. Please try again.", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const awardTypeOptions = [
    { value: "Employee of the Month", label: "Employee of the Month" },
    { value: "Long Service Award", label: "Long Service Award" },
    { value: "Innovation Award", label: "Innovation Award" },
    { value: "Customer Excellence Award", label: "Customer Excellence Award" },
    { value: "Sales Champion", label: "Sales Champion" },
    { value: "Leadership Award", label: "Leadership Award" },
    { value: "Team Player Award", label: "Team Player Award" },
    { value: "Safety Award", label: "Safety Award" },
    { value: "Quality Excellence Award", label: "Quality Excellence Award" },
  ]

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ]

  const departmentOptions = [
    { value: "Finance", label: "Finance" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Information Technology", label: "Information Technology" },
    { value: "Customer Service", label: "Customer Service" },
    { value: "Sales", label: "Sales" },
    { value: "Operations", label: "Operations" },
    { value: "Legal", label: "Legal" },
    { value: "Informatiom and Communication Technology", label: "Information and Communication Technology" },
  ]

  const isLoading = externalIsLoading || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Award className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Award Record
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update award entry for {initialData?.employeeName || "employee"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              {/* Employee Information Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Employee Information</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="employeeId" className="text-xs text-gray-500 font-medium mb-1 block">
                          Employee ID *
                        </Label>
                        <div className="flex items-center">
                          <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                            <Hash className="h-4 w-4 text-gray-600" />
                          </div>
                          <Input
                            id="employeeId"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                            required
                          />
                        </div>
                        {errors.employeeId && (
                          <p className="text-sm text-red-600 mt-1">{errors.employeeId}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="employeeName" className="text-xs text-gray-500 font-medium mb-1 block">
                          Employee Name *
                        </Label>
                        <div className="flex items-center">
                          <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <Input
                            id="employeeName"
                            name="employeeName"
                            value={formData.employeeName}
                            onChange={handleChange}
                            className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                            required
                          />
                        </div>
                        {errors.employeeName && (
                          <p className="text-sm text-red-600 mt-1">{errors.employeeName}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="department" className="text-xs text-gray-500 font-medium mb-1 block">
                          Department *
                        </Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleSelectChange("department", value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-10 border-0 bg-white pl-3">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 text-gray-500 mr-3" />
                              <SelectValue placeholder="Select department" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {departmentOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.department && (
                          <p className="text-sm text-red-600 mt-1">{errors.department}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="status" className="text-xs text-gray-500 font-medium mb-1 block">
                          Status *
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleSelectChange("status", value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-10 border-0 bg-white pl-3">
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
                          <p className="text-sm text-red-600 mt-1">{errors.status}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Award Details Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Award Details</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="awardType" className="text-sm font-medium text-gray-700 mb-2 block">
                        Award Type *
                      </Label>
                      <Select
                        value={formData.awardType}
                        onValueChange={(value) => handleSelectChange("awardType", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <div className="flex items-center">
                            <Award className="h-4 w-4 text-gray-500 mr-3" />
                            <SelectValue placeholder="Select award type" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {awardTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.awardType && (
                        <p className="text-sm text-red-600 mt-2">{errors.awardType}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cashPrice" className="text-sm font-medium text-gray-700 mb-2 block">
                        Cash Price (₦) *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <span className="text-gray-600">₦</span>
                        </div>
                        <Input
                          id="cashPrice"
                          name="cashPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.cashPrice}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          placeholder="Enter amount"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.cashPrice && (
                        <p className="text-sm text-red-600 mt-2">{errors.cashPrice}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="giftItem" className="text-sm font-medium text-gray-700 mb-2 block">
                      Gift Item *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                        <Gift className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input
                        id="giftItem"
                        name="giftItem"
                        value={formData.giftItem}
                        onChange={handleChange}
                        className="h-11 border-gray-300 pl-12 text-gray-900"
                        placeholder="e.g., Certificate, Plaque, Trophy"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.giftItem && (
                      <p className="text-sm text-red-600 mt-2">{errors.giftItem}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="awardDate" className="text-sm font-medium text-gray-700 mb-2 block">
                      Award Date *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input
                        id="awardDate"
                        name="awardDate"
                        type="date"
                        value={formData.awardDate}
                        onChange={handleChange}
                        className="h-11 border-gray-300 pl-12 text-gray-900"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.awardDate && (
                      <p className="text-sm text-red-600 mt-2">{errors.awardDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter details about the award, reasons for recognition, and any additional notes..."
                      className="min-h-[120px] border-gray-300 text-gray-900 resize-none"
                      rows={4}
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-2">{errors.description}</p>
                    )}
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
                      <BadgeCheck className="h-4 w-4 mr-2" />
                      Update Award Record
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