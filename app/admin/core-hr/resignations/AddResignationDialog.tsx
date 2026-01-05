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
import { Loader2, User, Building, Calendar, FileText, Hash, CheckCircle, Briefcase, ChevronDown, LogOut } from "lucide-react"
import { toast } from "sonner"
import { useAllEmployees } from "@/services/hooks/hr-core/usePromotions"
import type { CreateResignationRequest } from "@/types/hr-core/resignations"

interface AddResignationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateResignationRequest) => Promise<void>
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

export function AddResignationDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading: externalIsLoading 
}: AddResignationDialogProps) {
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error: employeesError,
    refetch,
    //@ts-expect-error - TS2345
  } = useAllEmployees({
    enabled: false,
  })

  const [formData, setFormData] = useState<CreateResignationRequest>({
    employee_id: "",
    employee_name: "",
    department: "",
    position: "",
    notice_date: new Date().toISOString().split("T")[0],
    resignation_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    reason: "",
    exit_interview: "pending",
    notes: "",
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
        employee_id: "",
        employee_name: "",
        department: "",
        position: "",
        notice_date: new Date().toISOString().split("T")[0],
        resignation_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        reason: "",
        exit_interview: "pending",
        notes: "",
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
          //@ts-expect-error TS2531
        } else if (employeesData.data && Array.isArray(employeesData.data)) {
            //@ts-expect-error TS2531
          employeeList = employeesData.data
          //@ts-expect-error TS2531
        } else if (employeesData.employees && Array.isArray(employeesData.employees)) {
            //@ts-expect-error TS2531
          employeeList = employeesData.employees
          //@ts-expect-error TS2531
        } else if (employeesData.data?.employees && Array.isArray(employeesData.data.employees)) {
            //@ts-expect-error TS2531
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

  const handleSelectChange = (name: keyof CreateResignationRequest, value: string) => {
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
        position: selectedEmployee.position || "",
      }))

      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.employee_id
        delete newErrors.employee_name
        delete newErrors.department
        delete newErrors.position
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employee_id.trim()) newErrors.employee_id = "Employee is required"
    if (!formData.employee_name.trim()) newErrors.employee_name = "Employee name is required"
    if (!formData.department.trim()) newErrors.department = "Department is required"
    if (!formData.position.trim()) newErrors.position = "Position is required"
    if (!formData.notice_date) newErrors.notice_date = "Notice date is required"
    if (!formData.resignation_date) newErrors.resignation_date = "Resignation date is required"
    
    const noticeDate = new Date(formData.notice_date)
    const resignationDate = new Date(formData.resignation_date)
    if (resignationDate <= noticeDate) {
      newErrors.resignation_date = "Resignation date must be after notice date"
    }
    
    if (!formData.reason.trim()) newErrors.reason = "Reason is required"
    if (!formData.exit_interview) newErrors.exit_interview = "Exit interview status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Creating resignation record...")

    try {
      await onSubmit(formData)
      
      toast.success("Resignation record created successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error) {
      console.error("Error creating resignation:", error)
      toast.error("Failed to create resignation record. Please try again.", {
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

  const exitInterviewOptions = [
    { value: "pending", label: "Pending" },
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
  ]

  const reasonOptions = [
    { value: "Personal reasons", label: "Personal reasons" },
    { value: "Career advancement", label: "Career advancement" },
    { value: "Better opportunity", label: "Better opportunity" },
    { value: "Health issues", label: "Health issues" },
    { value: "Family reasons", label: "Family reasons" },
    { value: "Relocation", label: "Relocation" },
    { value: "Retirement", label: "Retirement" },
    { value: "Dissatisfaction with job", label: "Dissatisfaction with job" },
    { value: "Other", label: "Other" },
  ]

  const isLoading = externalIsLoading || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <LogOut className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  New Resignation Request
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Create a resignation request for an employee
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
                              Department *
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

                          <div>
                            <Label className="text-xs text-gray-500 font-medium mb-1 block">
                              Position *
                            </Label>
                            <div className="flex items-center">
                              <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                                <Briefcase className="h-4 w-4 text-gray-600" />
                              </div>
                              <Input
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                                placeholder="e.g., Senior Accountant"
                                required
                              />
                            </div>
                            {errors.position && (
                              <p className="text-sm text-red-600 mt-1">{errors.position}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Resignation Details</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="notice_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        Notice Date *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="notice_date"
                          name="notice_date"
                          type="date"
                          value={formData.notice_date}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.notice_date && (
                        <p className="text-sm text-red-600 mt-2">{errors.notice_date}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resignation_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        Resignation Date *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="resignation_date"
                          name="resignation_date"
                          type="date"
                          value={formData.resignation_date}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.resignation_date && (
                        <p className="text-sm text-red-600 mt-2">{errors.resignation_date}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <Label htmlFor="reason" className="text-sm font-medium text-gray-700 mb-2 block">
                        Reason *
                      </Label>
                      <Select
                        value={formData.reason}
                        onValueChange={(value) => handleSelectChange("reason", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {reasonOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.reason && (
                        <p className="text-sm text-red-600 mt-2">{errors.reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="min-h-[100px] border-gray-300 text-gray-900"
                      placeholder="Enter any additional notes or details about the resignation..."
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
                      Submit Resignation
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