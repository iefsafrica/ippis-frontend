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
import { Loader2, User, Building, Calendar, Award, ChevronDown, Hash, BadgeCheck, Gift } from "lucide-react"
import { useAllEmployees } from "@/services/hooks/hr-core/usePromotions"
import { toast } from "sonner"
import type { CreateAwardRequest } from "@/types/hr-core/awards"

interface AddAwardDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAwardRequest) => Promise<void>
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

export function AddAwardDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading: externalIsLoading 
}: AddAwardDialogProps) {
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error,
    refetch,
    //@ts-expect-error - TS is not aware of the possible structures
  } = useAllEmployees({
    enabled: false,
  })

  const [formData, setFormData] = useState<CreateAwardRequest>({
    employee_id: "",
    employee_name: "",
    department: "",
    award_type: "",
    gift_item: "",
    cash_prize: 0,
    award_date: new Date().toISOString().split("T")[0],
    description: "",
  })

  const [cashPrizeInput, setCashPrizeInput] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dropdownEmployees, setDropdownEmployees] = useState<DropdownEmployee[]>([])
  const [hasFetchedEmployees, setHasFetchedEmployees] = useState(false)
  const [shouldFetchEmployees, setShouldFetchEmployees] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Always fetch employees when dialog opens
      setShouldFetchEmployees(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (shouldFetchEmployees && !isLoadingEmployees) {
      const fetchEmployees = async () => {
        try {
          await refetch()
        } catch (error) {
          toast.error("Failed to load employees")
          console.error("Error fetching employees:", error)
        } finally {
          setShouldFetchEmployees(false)
          setHasFetchedEmployees(true)
        }
      }
      fetchEmployees()
    }
  }, [shouldFetchEmployees, refetch, isLoadingEmployees])

  useEffect(() => {
    if (!isOpen) {
      // Reset form but keep employees data
      setFormData({
        employee_id: "",
        employee_name: "",
        department: "",
        award_type: "",
        gift_item: "",
        cash_prize: 0,
        award_date: new Date().toISOString().split("T")[0],
        description: "",
      })
      setCashPrizeInput("")
      setErrors({})
      // Don't reset dropdownEmployees or hasFetchedEmployees here
    }
  }, [isOpen])

  useEffect(() => {
    if (employeesData) {
      try {
        let employeeList: any[] = []
        
        if (Array.isArray(employeesData)) {
          employeeList = employeesData
          //@ts-expect-error - TS is not aware of the possible structures
        } else if (employeesData.data && Array.isArray(employeesData.data)) {
            //@ts-expect-error - TS is not aware of the possible structures
          employeeList = employeesData.data
          //@ts-expect-error - TS is not aware of the possible structures
        } else if (employeesData.employees && Array.isArray(employeesData.employees)) {
            //@ts-expect-error - TS is not aware of the possible structures
          employeeList = employeesData.employees
          //@ts-expect-error - TS is not aware of the possible structures
        } else if (employeesData.data?.employees && Array.isArray(employeesData.data.employees)) {
            //@ts-expect-error - TS is not aware of the possible structures
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
        setDropdownEmployees((prev) => prev)
      }
    } else {
      setDropdownEmployees((prev) => prev)
    }
  }, [employeesData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'cash_prize') {
      setCashPrizeInput(value)
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

  const handleSelectChange = (name: keyof CreateAwardRequest, value: string) => {
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
    if (!formData.award_type.trim()) newErrors.award_type = "Award type is required"
    if (!formData.gift_item.trim()) newErrors.gift_item = "Gift item is required"
    if (formData.cash_prize < 0) newErrors.cash_prize = "Cash price cannot be negative"
    if (!formData.award_date) newErrors.award_date = "Award date is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Creating award record...")

    try {
      await onSubmit(formData)
      
      toast.success("Award record created successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error) {
      console.error("Error submitting award:", error)
      toast.error("Failed to create award record. Please try again.", {
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

  const isLoading = externalIsLoading || isSubmitting

  // Manually trigger employee fetch when dropdown is clicked
  const handleDropdownClick = () => {
    if (!hasFetchedEmployees || error) {
      setShouldFetchEmployees(true)
    }
  }

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
                  New Award Record
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Create an award entry for an employee
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
                      <SelectTrigger 
                        className="h-11 border-gray-300 hover:border-gray-400 text-gray-900"
                        onClick={handleDropdownClick}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            {isLoadingEmployees ? (
                              <Loader2 className="h-4 w-4 text-gray-500 mr-3 animate-spin" />
                            ) : (
                              <User className="h-4 w-4 text-gray-500 mr-3" />
                            )}
                            <SelectValue placeholder={
                              isLoadingEmployees ? "Loading employees..." : 
                              error ? "Click to load employees" :
                              "Search for employee..."
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
                            <p className="text-xs text-gray-500 mt-1">Click on dropdown to retry</p>
                          </div>
                        ) : dropdownEmployees.length === 0 ? (
                          <div className="p-4 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-3 text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-700">No employees found</p>
                            <p className="text-xs text-gray-500 mt-1">Click on dropdown to load employees</p>
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
                              <Input
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                                required
                              />
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

              {/* Award Details Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Award Details</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="award_type" className="text-sm font-medium text-gray-700 mb-2 block">
                        Award Type *
                      </Label>
                      <Select
                        value={formData.award_type}
                        onValueChange={(value) => handleSelectChange("award_type", value)}
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
                      {errors.award_type && (
                        <p className="text-sm text-red-600 mt-2">{errors.award_type}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cash_prize" className="text-sm font-medium text-gray-700 mb-2 block">
                        Cash Price (₦) *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <span className="text-gray-600">₦</span>
                        </div>
                        <Input
                          id="cash_prize"
                          name="cash_prize"
                          type="number"
                          min="0"
                          step="0.01"
                          value={cashPrizeInput}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          placeholder="Enter amount"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.cash_prize && (
                        <p className="text-sm text-red-600 mt-2">{errors.cash_prize}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gift_item" className="text-sm font-medium text-gray-700 mb-2 block">
                      Gift Item *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                        <Gift className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input
                        id="gift_item"
                        name="gift_item"
                        value={formData.gift_item}
                        onChange={handleChange}
                        className="h-11 border-gray-300 pl-12 text-gray-900"
                        placeholder="e.g., Certificate, Plaque, Trophy"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.gift_item && (
                      <p className="text-sm text-red-600 mt-2">{errors.gift_item}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="award_date" className="text-sm font-medium text-gray-700 mb-2 block">
                      Award Date *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input
                        id="award_date"
                        name="award_date"
                        type="date"
                        value={formData.award_date}
                        onChange={handleChange}
                        className="h-11 border-gray-300 pl-12 text-gray-900"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.award_date && (
                      <p className="text-sm text-red-600 mt-2">{errors.award_date}</p>
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
                  disabled={isLoading || isLoadingEmployees}
                  className="h-10 px-6 border-gray-300 hover:bg-gray-100 text-gray-700 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isLoadingEmployees || !formData.employee_id}
                  className="h-10 px-8 bg-green-700 hover:bg-green-800 text-white flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="h-4 w-4 mr-2" />
                      Create Award Record
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