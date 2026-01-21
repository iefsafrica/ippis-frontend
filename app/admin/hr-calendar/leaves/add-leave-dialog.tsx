"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, FileText, Loader2, Phone, User, CheckCircle, Building, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useCreateLeave } from "@/services/hooks/calendar/leaves"
import { useAllEmployees } from "@/services/hooks/hr-core/usePromotions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeaveFormData {
  employee_id: string
  employee_name: string
  department: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  emergency_contact: string
}

interface AddLeaveDialogProps {
  isOpen: boolean
  onClose: () => void
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
  }
}

interface DropdownEmployee extends Employee {
  displayName: string
  department: string
}

const defaultFormState: LeaveFormData = {
  employee_id: "",
  employee_name: "",
  department: "",
  leave_type: "",
  start_date: new Date().toISOString().split("T")[0],
  end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  reason: "",
  emergency_contact: "",
}

export function AddLeaveDialog({ isOpen, onClose }: AddLeaveDialogProps) {
  const createLeaveMutation = useCreateLeave()
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error: employeesError,
    refetch,
    //@ts-expect-error - TS2345
  } = useAllEmployees({
    enabled: false,
  })
  const [formData, setFormData] = useState<LeaveFormData>(defaultFormState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dropdownEmployees, setDropdownEmployees] = useState<DropdownEmployee[]>([])
  const [hasFetchedEmployees, setHasFetchedEmployees] = useState(false)
  const [shouldFetchEmployees, setShouldFetchEmployees] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldFetchEmployees(true)
    }
    if (!isOpen) {
      setFormData(defaultFormState)
      setErrors({})
    }
  }, [isOpen])

  useEffect(() => {
    if (shouldFetchEmployees && !isLoadingEmployees) {
      const fetchEmployees = async () => {
        try {
          await refetch()
        } catch (error) {
          toast.error("Failed to load employees")
        } finally {
          setShouldFetchEmployees(false)
          setHasFetchedEmployees(true)
        }
      }
      fetchEmployees()
    }
  }, [shouldFetchEmployees, refetch, isLoadingEmployees])

  useEffect(() => {
    if (!employeesData) return
    try {
      let employeeList: any[] = []
      if (Array.isArray(employeesData)) {
        employeeList = employeesData
        //@ts-expect-error - TS2531
      } else if (employeesData.data && Array.isArray(employeesData.data)) {
        //@ts-expect-error - TS2531
        employeeList = employeesData.data
        //@ts-expect-error - TS2531
      } else if (employeesData.employees && Array.isArray(employeesData.employees)) {
        //@ts-expect-error - TS2531
        employeeList = employeesData.employees
        //@ts-expect-error - TS2531
      } else if (employeesData.data?.employees && Array.isArray(employeesData.data.employees)) {
        //@ts-expect-error - TS2531
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
            department: department || "",
          }
        })
        .filter((emp: DropdownEmployee) => emp.id && emp.displayName)

      setDropdownEmployees(mappedEmployees)
    } catch (error) {
      setDropdownEmployees((prev) => prev)
    }
  }, [employeesData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
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
        const next = { ...prev }
        delete next.employee_id
        delete next.employee_name
        delete next.department
        return next
      })
    }
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.employee_id.trim()) nextErrors.employee_id = "Employee ID is required"
    if (!formData.employee_name.trim()) nextErrors.employee_name = "Employee name is required"
    if (!formData.department.trim()) nextErrors.department = "Department is required"
    if (!formData.leave_type.trim()) nextErrors.leave_type = "Leave type is required"
    if (!formData.start_date) nextErrors.start_date = "Start date is required"
    if (!formData.end_date) nextErrors.end_date = "End date is required"
    if (!formData.reason.trim()) nextErrors.reason = "Reason is required"
    if (!formData.emergency_contact.trim()) nextErrors.emergency_contact = "Emergency contact is required"

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate < startDate) {
        nextErrors.end_date = "End date must be on or after start date"
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Creating leave request...")

    try {
      await createLeaveMutation.mutateAsync({
        employee_id: formData.employee_id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        emergency_contact: formData.emergency_contact,
      })

      toast.success("Leave request created successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to create leave request", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = createLeaveMutation.isPending || isSubmitting

  const handleDropdownClick = () => {
    if (!hasFetchedEmployees || employeesError) {
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
                <CalendarDays className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  New Leave Request
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Create a leave request for an employee
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Leave Details</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
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
                              <SelectValue
                                placeholder={
                                  isLoadingEmployees
                                    ? "Loading employees..."
                                    : employeesError
                                      ? "Click to load employees"
                                      : "Search for employee..."
                                }
                              />
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
                              <SelectItem key={employee.id} value={employee.id} className="py-3 hover:bg-gray-50">
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
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.employee_id && <p className="text-sm text-red-600 mt-2">{errors.employee_id}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employee_name" className="text-sm font-medium text-gray-700 mb-2 block">
                        Employee Name *
                      </Label>
                      <div className="flex items-center">
                        <div className="h-11 flex items-center justify-center w-10 border border-gray-300 border-r-0 bg-gray-50 rounded-l-md">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="employee_name"
                          name="employee_name"
                          value={formData.employee_name}
                          onChange={handleChange}
                          className="h-11 border-gray-300 rounded-l-none text-left"
                          placeholder="Employee name"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.employee_name && <p className="text-sm text-red-600 mt-2">{errors.employee_name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium text-gray-700 mb-2 block">
                        Department *
                      </Label>
                      <div className="flex items-center">
                        <div className="h-11 flex items-center justify-center w-10 border border-gray-300 border-r-0 bg-gray-50 rounded-l-md">
                          <Building className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="h-11 border-gray-300 rounded-l-none text-left"
                          placeholder="Department"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.department && <p className="text-sm text-red-600 mt-2">{errors.department}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leave_type" className="text-sm font-medium text-gray-700 mb-2 block">
                        Leave Type *
                      </Label>
                      <div className="flex items-center">
                        <div className="h-11 flex items-center justify-center w-10 border border-gray-300 border-r-0 bg-gray-50 rounded-l-md">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="leave_type"
                          name="leave_type"
                          value={formData.leave_type}
                          onChange={handleChange}
                          className="h-11 border-gray-300 rounded-l-none text-left"
                          placeholder="Vacation"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.leave_type && <p className="text-sm text-red-600 mt-2">{errors.leave_type}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        Start Date *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <CalendarDays className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="start_date"
                          name="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900 text-left"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.start_date && <p className="text-sm text-red-600 mt-2">{errors.start_date}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 mb-2 block">
                        End Date *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <CalendarDays className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="end_date"
                          name="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900 text-left"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.end_date && <p className="text-sm text-red-600 mt-2">{errors.end_date}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-medium text-gray-700 mb-2 block">
                      Reason *
                    </Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      className="min-h-[120px] border-gray-300 text-gray-900 text-left"
                      placeholder="Enter reason for leave"
                      disabled={isLoading}
                    />
                    {errors.reason && <p className="text-sm text-red-600 mt-2">{errors.reason}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact" className="text-sm font-medium text-gray-700 mb-2 block">
                      Emergency Contact *
                    </Label>
                    <div className="flex items-center">
                      <div className="h-11 flex items-center justify-center w-10 border border-gray-300 border-r-0 bg-gray-50 rounded-l-md">
                        <Phone className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input
                        id="emergency_contact"
                        name="emergency_contact"
                        value={formData.emergency_contact}
                        onChange={handleChange}
                        className="h-11 border-gray-300 rounded-l-none text-left"
                        placeholder="john.doe@example.com"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.emergency_contact && (
                      <p className="text-sm text-red-600 mt-2">{errors.emergency_contact}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">Required fields are marked with *</div>
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
                      Create Leave
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
