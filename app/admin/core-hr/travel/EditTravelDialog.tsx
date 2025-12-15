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
import { Loader2, User, Building, Calendar, MapPin, Plane, Hotel, CreditCard, Briefcase, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import type { LocalTravel, UpdateTravelRequest } from "@/types/hr-core/travel"

interface EditTravelDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdateTravelRequest) => Promise<void>
  initialData: LocalTravel
  isLoading?: boolean
}

export function EditTravelDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading: externalIsLoading 
}: EditTravelDialogProps) {
  const [formData, setFormData] = useState<UpdateTravelRequest>({
    id: 0,
    employee_id: "",
    employee_name: "",
    department: "",
    purpose: "",
    start_date: "",
    end_date: "",
    destination: "",
    travel_mode: "",
    accommodation: "",
    estimated_cost: 0,
    advance_amount: 0,
    status: "pending",
  })

  const [estimatedCostInput, setEstimatedCostInput] = useState<string>("")
  const [advanceAmountInput, setAdvanceAmountInput] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id: 0,
        employee_id: "",
        employee_name: "",
        department: "",
        purpose: "",
        start_date: "",
        end_date: "",
        destination: "",
        travel_mode: "",
        accommodation: "",
        estimated_cost: 0,
        advance_amount: 0,
        status: "pending",
      })
      setEstimatedCostInput("")
      setAdvanceAmountInput("")
      setErrors({})
    }
  }, [isOpen])

  useEffect(() => {
    if (initialData) {
      const updateData: UpdateTravelRequest = {
        id: parseInt(initialData.id),
        employee_id: initialData.employeeId || "",
        employee_name: initialData.employeeName || "",
        department: initialData.department || "",
        purpose: initialData.purpose || "",
        start_date: initialData.startDate || "",
        end_date: initialData.endDate || "",
        destination: initialData.destination || "",
        travel_mode: initialData.travelMode || "",
        accommodation: initialData.accommodation || "",
        estimated_cost: parseFloat(initialData.estimatedCost) || 0,
        advance_amount: parseFloat(initialData.advanceAmount) || 0,
        status: initialData.status || "pending",
      }
      
      setFormData(updateData)
      setEstimatedCostInput(initialData.estimatedCost || "")
      setAdvanceAmountInput(initialData.advanceAmount || "")
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'estimated_cost') {
      setEstimatedCostInput(value)
      const numericValue = value === "" ? 0 : parseFloat(value.replace(/[^0-9.]/g, '')) || 0
      setFormData((prev) => ({ ...prev, [name]: numericValue }))
    } else if (name === 'advance_amount') {
      setAdvanceAmountInput(value)
      const numericValue = value === "" ? 0 : parseFloat(value.replace(/[^0-9.]/g, '')) || 0
      setFormData((prev) => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: keyof UpdateTravelRequest, value: string) => {
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

    if (!formData.employee_id?.trim()) newErrors.employee_id = "Employee is required"
    if (!formData.employee_name?.trim()) newErrors.employee_name = "Employee name is required"
    if (!formData.department?.trim()) newErrors.department = "Department is required"
    if (!formData.purpose?.trim()) newErrors.purpose = "Purpose is required"
    if (!formData.start_date) newErrors.start_date = "Start date is required"
    if (!formData.end_date) newErrors.end_date = "End date is required"
    if (formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = "End date must be after start date"
    }
    if (!formData.destination?.trim()) newErrors.destination = "Destination is required"
    if (!formData.travel_mode?.trim()) newErrors.travel_mode = "Travel mode is required"
    if (!formData.accommodation?.trim()) newErrors.accommodation = "Accommodation is required"
    if (!formData.estimated_cost || formData.estimated_cost <= 0) newErrors.estimated_cost = "Estimated cost must be greater than 0"
    if (formData.advance_amount && formData.advance_amount < 0) newErrors.advance_amount = "Advance amount cannot be negative"
    if (formData.advance_amount && formData.estimated_cost && formData.advance_amount > formData.estimated_cost) {
      newErrors.advance_amount = "Advance amount cannot exceed estimated cost"
    }
    if (!formData.status?.trim()) newErrors.status = "Status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating travel record...")

    try {
      await onSubmit(formData)
      
      toast.success("Travel record updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error) {
      console.error("Error updating travel:", error)
      toast.error("Failed to update travel record. Please try again.", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const travelModeOptions = [
    { value: "Flight", label: "Flight" },
    { value: "Train", label: "Train" },
    { value: "Bus", label: "Bus" },
    { value: "Car", label: "Car" },
    { value: "Other", label: "Other" },
  ]

  const accommodationOptions = [
    { value: "Hotel", label: "Hotel" },
    { value: "Airbnb", label: "Airbnb" },
    { value: "Guest House", label: "Guest House" },
    { value: "Company Apartment", label: "Company Apartment" },
    { value: "Other", label: "Other" },
  ]

  const departmentOptions = [
    { value: "Finance", label: "Finance" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Information Technology", label: "Information Technology" },
    { value: "Customer Service", label: "Customer Service" },
    { value: "Sales", label: "Sales" },
    { value: "Operations", label: "Operations" },
    { value: "Legal", label: "Legal" },
  ]

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  const isLoading = externalIsLoading || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Plane className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Travel Request
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update travel request for {initialData?.employeeName || "employee"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Employee Information</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="employee_id" className="text-xs text-gray-500 font-medium mb-1 block">
                          Employee ID *
                        </Label>
                        <div className="flex items-center">
                          <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <Input
                            id="employee_id"
                            name="employee_id"
                            value={formData.employee_id}
                            onChange={handleChange}
                            className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                            required
                          />
                        </div>
                        {errors.employee_id && (
                          <p className="text-sm text-red-600 mt-1">{errors.employee_id}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="employee_name" className="text-xs text-gray-500 font-medium mb-1 block">
                          Employee Name *
                        </Label>
                        <div className="flex items-center">
                          <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <Input
                            id="employee_name"
                            name="employee_name"
                            value={formData.employee_name}
                            onChange={handleChange}
                            className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                            required
                          />
                        </div>
                        {errors.employee_name && (
                          <p className="text-sm text-red-600 mt-1">{errors.employee_name}</p>
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

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Travel Details</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="purpose" className="text-sm font-medium text-gray-700 mb-2 block">
                        Purpose *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <Briefcase className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="purpose"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          placeholder="e.g., Conference, Client Meeting"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.purpose && (
                        <p className="text-sm text-red-600 mt-2">{errors.purpose}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destination" className="text-sm font-medium text-gray-700 mb-2 block">
                        Destination *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <MapPin className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="destination"
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          placeholder="e.g., Lagos, Abuja"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.destination && (
                        <p className="text-sm text-red-600 mt-2">{errors.destination}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        Start Date *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="start_date"
                          name="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.start_date && (
                        <p className="text-sm text-red-600 mt-2">{errors.start_date}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        End Date *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="end_date"
                          name="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.end_date && (
                        <p className="text-sm text-red-600 mt-2">{errors.end_date}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="travel_mode" className="text-sm font-medium text-gray-700 mb-2 block">
                        Travel Mode *
                      </Label>
                      <Select
                        value={formData.travel_mode}
                        onValueChange={(value) => handleSelectChange("travel_mode", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <div className="flex items-center">
                            <Plane className="h-4 w-4 text-gray-500 mr-3" />
                            <SelectValue placeholder="Select travel mode" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {travelModeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.travel_mode && (
                        <p className="text-sm text-red-600 mt-2">{errors.travel_mode}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accommodation" className="text-sm font-medium text-gray-700 mb-2 block">
                        Accommodation *
                      </Label>
                      <Select
                        value={formData.accommodation}
                        onValueChange={(value) => handleSelectChange("accommodation", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <div className="flex items-center">
                            <Hotel className="h-4 w-4 text-gray-500 mr-3" />
                            <SelectValue placeholder="Select accommodation" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {accommodationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.accommodation && (
                        <p className="text-sm text-red-600 mt-2">{errors.accommodation}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="estimated_cost" className="text-sm font-medium text-gray-700 mb-2 block">
                        Estimated Cost (₦) *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="estimated_cost"
                          name="estimated_cost"
                          type="number"
                          min="1"
                          step="0.01"
                          value={estimatedCostInput}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          placeholder="Enter amount"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.estimated_cost && (
                        <p className="text-sm text-red-600 mt-2">{errors.estimated_cost}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="advance_amount" className="text-sm font-medium text-gray-700 mb-2 block">
                        Advance Amount (₦)
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="advance_amount"
                          name="advance_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={advanceAmountInput}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          placeholder="Enter advance amount"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.advance_amount && (
                        <p className="text-sm text-red-600 mt-2">{errors.advance_amount}</p>
                      )}
                    </div>
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
                      Update Travel Request
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