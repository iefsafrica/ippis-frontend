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
import { Loader2, User, Building, Calendar, MapPin, ArrowRight, Hash, CheckCircle, Briefcase, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useAllEmployees } from "@/services/hooks/hr-core/usePromotions"
import type { Transfer, UpdateTransferPayload } from "@/types/hr-core/transfer"

interface EditTransferDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdateTransferPayload) => Promise<void>
  initialData: Transfer
  isLoading?: boolean
}

interface Employee {
  id: string
  name?: string
  employeeId?: string
  department?: string
  position?: string
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

export function EditTransferDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isLoading: externalIsLoading 
}: EditTransferDialogProps) {
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error: employeesError,
    refetch,
    //@ts-expect-error - refetch exists
  } = useAllEmployees({
    enabled: false,
  })

  const [formData, setFormData] = useState<UpdateTransferPayload>({
    id: 0,
    employee_id: "",
    employee_name: "",
    from_department: "",
    from_position: "",
    to_department: "",
    to_position: "",
    to_location: "",
    effective_date: "",
    reason: "",
    status: "pending",
  })

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
        id: 0,
        employee_id: "",
        employee_name: "",
        from_department: "",
        from_position: "",
        to_department: "",
        to_position: "",
        to_location: "",
        effective_date: "",
        reason: "",
        status: "pending",
      })
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
            const position = emp.position || emp.Position || emp.metadata?.Position || emp.metadata?.jobTitle || ""
            
            const displayName = name || (firstName && surname ? `${firstName} ${surname}` : firstName || surname || "Unnamed Employee")
            
            return {
              ...emp,
              id,
              displayName,
              department,
              position,
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

  useEffect(() => {
    if (initialData) {
      const updateData: UpdateTransferPayload = {
        id: initialData.id,
        employee_id: initialData.employee_id,
        employee_name: initialData.employee_name,
        from_department: initialData.from_department,
        from_position: initialData.from_position,
        to_department: initialData.to_department,
        to_position: initialData.to_position,
        to_location: initialData.to_location,
        effective_date: initialData.effective_date.split("T")[0],
        reason: initialData.reason,
        status: initialData.status,
      }
      
      setFormData(updateData)
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

  const handleSelectChange = (name: keyof UpdateTransferPayload, value: string) => {
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
        from_department: selectedEmployee.department || "",
        from_position: selectedEmployee.position || "",
      }))

      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.employee_id
        delete newErrors.employee_name
        delete newErrors.from_department
        delete newErrors.from_position
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employee_id?.trim()) newErrors.employee_id = "Employee is required"
    if (!formData.employee_name?.trim()) newErrors.employee_name = "Employee name is required"
    if (!formData.from_department?.trim()) newErrors.from_department = "From department is required"
    if (!formData.to_department?.trim()) newErrors.to_department = "To department is required"
    if (!formData.from_position?.trim()) newErrors.from_position = "From position is required"
    if (!formData.to_position?.trim()) newErrors.to_position = "To position is required"
    if (!formData.to_location?.trim()) newErrors.to_location = "To location is required"
    if (!formData.effective_date) newErrors.effective_date = "Effective date is required"
    if (!formData.reason?.trim()) newErrors.reason = "Reason is required"
    if (!formData.status?.trim()) newErrors.status = "Status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating transfer record...")

    try {
      await onSubmit(formData)
      
      toast.success("Transfer record updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error) {
      console.error("Error updating transfer:", error)
      toast.error("Failed to update transfer record. Please try again.", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const departmentOptions = [
    { value: "Finance", label: "Finance" },
    { value: "Accounting", label: "Accounting" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Information Technology", label: "Information Technology" },
    { value: "Customer Service", label: "Customer Service" },
    { value: "Sales", label: "Sales" },
    { value: "Operations", label: "Operations" },
    { value: "Legal", label: "Legal" },
  ]

  const locationOptions = [
    { value: "Lagos HQ", label: "Lagos HQ" },
    { value: "Abuja Office", label: "Abuja Office" },
    { value: "Port Harcourt Office", label: "Port Harcourt Office" },
    { value: "Kano Office", label: "Kano Office" },
    { value: "Ibadan Office", label: "Ibadan Office" },
  ]

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
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
                <ArrowRight className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Transfer Request
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update transfer request for {initialData?.employee_name || "employee"}
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
                        ) : employeesError ? (
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
                                <div className="flex flex-col min-w-0">
                                  <p className="text-sm font-medium text-gray-900 leading-tight">
                                    {employee.displayName}
                                  </p>
                                  {employee.department && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {employee.department}
                                      {employee.position && ` • ${employee.position}`}
                                    </p>
                                  )}
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

                          <div>
                            <Label htmlFor="from_department" className="text-xs text-gray-500 font-medium mb-1 block">
                              Current Department *
                            </Label>
                            <div className="flex items-center">
                              <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                                <Building className="h-4 w-4 text-gray-600" />
                              </div>
                              <Input
                                id="from_department"
                                name="from_department"
                                value={formData.from_department}
                                onChange={handleChange}
                                className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                                required
                              />
                            </div>
                            {errors.from_department && (
                              <p className="text-sm text-red-600 mt-1">{errors.from_department}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="employee_id" className="text-xs text-gray-500 font-medium mb-1 block">
                              Employee ID *
                            </Label>
                            <div className="flex items-center">
                              <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                                <Hash className="h-4 w-4 text-gray-600" />
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
                            <Label htmlFor="from_position" className="text-xs text-gray-500 font-medium mb-1 block">
                              Current Position *
                            </Label>
                            <div className="flex items-center">
                              <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                                <Briefcase className="h-4 w-4 text-gray-600" />
                              </div>
                              <Input
                                id="from_position"
                                name="from_position"
                                value={formData.from_position}
                                onChange={handleChange}
                                className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                                required
                              />
                            </div>
                            {errors.from_position && (
                              <p className="text-sm text-red-600 mt-1">{errors.from_position}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Transfer Details</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="to_department" className="text-sm font-medium text-gray-700 mb-2 block">
                        New Department *
                      </Label>
                      <Select
                        value={formData.to_department}
                        onValueChange={(value) => handleSelectChange("to_department", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <div className="flex items-center">
                            <ArrowRight className="h-4 w-4 text-gray-500 mr-3" />
                            <SelectValue placeholder="Select new department" />
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
                      {errors.to_department && (
                        <p className="text-sm text-red-600 mt-2">{errors.to_department}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="to_position" className="text-sm font-medium text-gray-700 mb-2 block">
                        New Position *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <Briefcase className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="to_position"
                          name="to_position"
                          value={formData.to_position}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          placeholder="e.g., Finance Manager"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.to_position && (
                        <p className="text-sm text-red-600 mt-2">{errors.to_position}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="to_location" className="text-sm font-medium text-gray-700 mb-2 block">
                        New Location *
                      </Label>
                      <Select
                        value={formData.to_location}
                        onValueChange={(value) => handleSelectChange("to_location", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                            <SelectValue placeholder="Select new location" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {locationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.to_location && (
                        <p className="text-sm text-red-600 mt-2">{errors.to_location}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="effective_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        Effective Date *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="effective_date"
                          name="effective_date"
                          type="date"
                          value={formData.effective_date}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.effective_date && (
                        <p className="text-sm text-red-600 mt-2">{errors.effective_date}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="space-y-2">
                      <Label htmlFor="reason" className="text-sm font-medium text-gray-700 mb-2 block">
                        Reason for Transfer *
                      </Label>
                      <Textarea
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="min-h-[100px] border-gray-300 text-gray-900"
                        placeholder="Please provide a detailed reason for the transfer..."
                        disabled={isLoading}
                      />
                      {errors.reason && (
                        <p className="text-sm text-red-600 mt-2">{errors.reason}</p>
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
                      Update Transfer Request
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