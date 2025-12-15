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
import { Loader2, User, Building, Calendar, MapPin, Plane, Hotel, CreditCard, ChevronDown, Hash, CheckCircle, Briefcase } from "lucide-react"
import { useAllEmployees } from "@/services/hooks/hr-core/usePromotions"
import { toast } from "sonner"
import type { CreateTravelRequest } from "@/types/hr-core/travel"

interface AddTravelDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTravelRequest) => Promise<void>
  isLoading?: boolean
}

interface Employee {
  id: string
  name?: string
  employeeId?: string
  department?: string
  employee_id?: string
  employee_name?: string
  metadata?: {
    FirstName?: string
    Surname?: string
    Department?: string
    Position?: string
    jobTitle?: string
  }
}

interface DropdownEmployee extends Employee {
  displayName: string
}

export function AddTravelDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading: externalIsLoading 
}: AddTravelDialogProps) {
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error,
    refetch,
    //@ts-expect-error - refetch exists
  } = useAllEmployees({
    enabled: false,
  })

  const [formData, setFormData] = useState<CreateTravelRequest>({
    employee_id: "",
    employee_name: "",
    department: "",
    purpose: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    destination: "",
    travel_mode: "",
    accommodation: "",
    estimated_cost: 0,
    advance_amount: 0,
  })

  const [estimatedCostInput, setEstimatedCostInput] = useState<string>("")
  const [advanceAmountInput, setAdvanceAmountInput] = useState<string>("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dropdownEmployees, setDropdownEmployees] = useState<DropdownEmployee[]>([])
  const [hasFetchedEmployees, setHasFetchedEmployees] = useState(false)

  useEffect(() => {
    if (isOpen && !hasFetchedEmployees) {
      const fetchEmployees = async () => {
        try {
          await refetch()
        } catch (error) {
          toast.error("Failed to load employees")
          console.error("Error fetching employees:", error)
        }
      }
      fetchEmployees()
      setHasFetchedEmployees(true)
    }
  }, [isOpen, refetch, hasFetchedEmployees])

  useEffect(() => {
    if (!isOpen) {
      setHasFetchedEmployees(false)
      setFormData({
        employee_id: "",
        employee_name: "",
        department: "",
        purpose: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        destination: "",
        travel_mode: "",
        accommodation: "",
        estimated_cost: 0,
        advance_amount: 0,
      })
      setEstimatedCostInput("")
      setAdvanceAmountInput("")
      setErrors({})
      setDropdownEmployees([])
    }
  }, [isOpen])

  useEffect(() => {
    if (employeesData) {
      try {
        let employeeList: any[] = []
        
        if (Array.isArray(employeesData)) {
          employeeList = employeesData
          //@ts-expect-error - refetch exists
        } else if (employeesData.data && Array.isArray(employeesData.data)) {
            //@ts-expect-error - refetch exists
          employeeList = employeesData.data
          //@ts-expect-error - refetch exists
        } else if (employeesData.employees && Array.isArray(employeesData.employees)) {
            //@ts-expect-error - refetch exists
          employeeList = employeesData.employees
          //@ts-expect-error - refetch exists
        } else if (employeesData.data?.employees && Array.isArray(employeesData.data.employees)) {
            //@ts-expect-error - refetch exists
          employeeList = employeesData.data.employees
        }
        
        const mappedEmployees = employeeList
          .map((emp: any) => {
            const id = emp.id || emp.employeeId || emp.employee_id || ""
            const name = emp.name || emp.employeeName || emp.employee_name || ""
            const firstName = emp.firstName || emp.FirstName || emp.metadata?.FirstName || ""
            const surname = emp.surname || emp.Surname || emp.metadata?.Surname || ""
            const department = emp.department || emp.Department || emp.metadata?.Department || ""
            
            const displayName = name || (firstName && surname ? `${firstName} ${surname}` : firstName || surname || "Unnamed Employee")
            
            return {
              ...emp,
              id,
              displayName,
              department,
            }
          })
          .filter((emp: DropdownEmployee) => emp.id && emp.displayName)
        
        setDropdownEmployees(mappedEmployees)
      } catch (error) {
        console.error("Error processing employee data:", error)
        setDropdownEmployees([])
      }
    } else {
      setDropdownEmployees([])
    }
  }, [employeesData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'estimated_cost') {
      setEstimatedCostInput(value)
      const numericValue = value === "" ? 0 : parseFloat(value.replace(/[^0-9.]/g, '')) || 0
      setFormData((prev) => ({ 
        ...prev, 
        [name]: numericValue 
      }))
    } else if (name === 'advance_amount') {
      setAdvanceAmountInput(value)
      const numericValue = value === "" ? 0 : parseFloat(value.replace(/[^0-9.]/g, '')) || 0
      setFormData((prev) => ({ 
        ...prev, 
        [name]: numericValue 
      }))
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value 
      }))
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: keyof CreateTravelRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleEmployeeSelect = (selectedEmployeeId: string) => {
    const selectedEmployee = dropdownEmployees.find((emp) => emp.id === selectedEmployeeId)

    if (selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        employee_id: selectedEmployee.id,
        employee_name: selectedEmployee.displayName,
        department: selectedEmployee.department || "",
      }))

      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.employee_id
        delete newErrors.employee_name
        delete newErrors.department
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employee_id.trim()) newErrors.employee_id = "Employee is required"
    if (!formData.employee_name.trim()) newErrors.employee_name = "Employee name is required"
    if (!formData.department.trim()) newErrors.department = "Department is required"
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required"
    if (!formData.start_date) newErrors.start_date = "Start date is required"
    if (!formData.end_date) newErrors.end_date = "End date is required"
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = "End date must be after start date"
    }
    if (!formData.destination.trim()) newErrors.destination = "Destination is required"
    if (!formData.travel_mode.trim()) newErrors.travel_mode = "Travel mode is required"
    if (!formData.accommodation.trim()) newErrors.accommodation = "Accommodation is required"
    if (formData.estimated_cost <= 0) newErrors.estimated_cost = "Estimated cost must be greater than 0"
    if (formData.advance_amount < 0) newErrors.advance_amount = "Advance amount cannot be negative"
    if (formData.advance_amount > formData.estimated_cost) {
      newErrors.advance_amount = "Advance amount cannot exceed estimated cost"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Creating travel record...")

    try {
      await onSubmit(formData)
      
      toast.success("Travel record created successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error) {
      console.error("Error submitting travel:", error)
      toast.error("Failed to create travel record. Please try again.", {
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
                  New Travel Request
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Create a travel request for an employee
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
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employee_id" className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Employee *
                    </Label>
                    <Select 
                      value={formData.employee_id} 
                      onValueChange={handleEmployeeSelect} 
                      disabled={isLoadingEmployees}
                    >
                      <SelectTrigger className="h-11 border-gray-300 hover:border-gray-400 text-gray-900">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            {isLoadingEmployees ? (
                              <Loader2 className="h-4 w-4 text-gray-500 mr-3 animate-spin" />
                            ) : (
                              <User className="h-4 w-4 text-gray-500 mr-3" />
                            )}
                            <SelectValue placeholder={
                              isLoadingEmployees ? "Loading employees..." : "Search for employee..."
                            } />
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border border-gray-300 shadow-lg max-h-72">
                        {isLoadingEmployees ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-3 text-gray-500" />
                            <span className="text-sm text-gray-600">Loading employees...</span>
                          </div>
                        ) : error ? (
                          <div className="p-4 text-center">
                            <p className="text-sm text-gray-700">Error loading employees</p>
                            <p className="text-xs text-gray-500 mt-1">Please try again</p>
                          </div>
                        ) : dropdownEmployees.length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-sm text-gray-700">No employees found</p>
                          </div>
                        ) : (
                          dropdownEmployees.map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={employee.id}
                              className="py-3 hover:bg-gray-50"
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded flex items-center justify-center mr-3 border border-gray-200 mt-0.5">
                                  <span className="text-gray-700 font-medium text-xs">
                                    {employee.displayName.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex min-w-0">
                                  <p className="text-sm pt-2 font-medium text-gray-900 leading-tight">
                                    {employee.displayName}
                                  </p>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.employee_id && (
                      <p className="text-sm text-red-600 mt-2">{errors.employee_id}</p>
                    )}
                  </div>

                  {formData.employee_id && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-500 font-medium mb-1 block">
                              Employee Name
                            </Label>
                            <div className="flex items-center">
                              <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <Input
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

                          <div>
                            <Label className="text-xs text-gray-500 font-medium mb-1 block">
                              Department
                            </Label>
                            <div className="flex items-center">
                              <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                                <Building className="h-4 w-4 text-gray-600" />
                              </div>
                              <Select
                                value={formData.department}
                                onValueChange={(value) => handleSelectChange("department", value)}
                                disabled={isLoading}
                              >
                                <SelectTrigger className="h-10 border-0 bg-white pl-3">
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                  {departmentOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {errors.department && (
                              <p className="text-sm text-red-600 mt-1">{errors.department}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-500 font-medium mb-1 block">
                              Employee ID
                            </Label>
                            <div className="flex items-center">
                              <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                                <Hash className="h-4 w-4 text-gray-600" />
                              </div>
                              <Input
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
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Travel Details Section */}
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
                          placeholder="e.g., Conference, Client Meeting, Training"
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
                          placeholder="e.g., Lagos, Abuja, London"
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
                  disabled={isLoading || isLoadingEmployees}
                  className="h-10 px-6 border-gray-300 hover:bg-gray-100 text-gray-700 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isLoadingEmployees}
                  className="h-10 px-8 bg-green-700 hover:bg-green-800 text-white flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Travel Request
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