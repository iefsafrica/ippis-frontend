

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
import { Loader2, User, Building, Calendar, Briefcase, Award, FileText, ChevronDown, Hash, BadgeCheck, ChevronRight } from "lucide-react"
import { useAllEmployees } from "@/services/hooks/hr-core/usePromotions"
import { Employee } from "@/types/hr-core/promotion-management"
import { toast } from "sonner"

interface AddPromotionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void> | void
}

interface DropdownEmployee extends Employee {
  displayName: string
}

export function AddPromotionDialog({ isOpen, onClose, onSubmit }: AddPromotionDialogProps) {
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error,
    refetch,
    //@ts-expect-error - disabling automatic fetch
  } = useAllEmployees({
    enabled: false,
  })

  const [formData, setFormData] = useState({
    employee: "",
    employeeId: "",
    company: "",
    promotionTitle: "",
    date: new Date().toISOString().split("T")[0],
    previousPosition: "",
    details: "",
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
        employee: "",
        employeeId: "",
        company: "",
        promotionTitle: "",
        date: new Date().toISOString().split("T")[0],
        previousPosition: "",
        details: "",
      })
      setErrors({})
      setDropdownEmployees([])
    }
  }, [isOpen])

  useEffect(() => {
    const list: Employee[] | null = Array.isArray(employeesData)
      ? employeesData
      : //@ts-expect-error - handle different possible structures
      employeesData?.data?.employees
      ? //@ts-expect-error - handle different possible structures
        employeesData.data.employees
      : //@ts-expect-error - handle different possible structures
      employeesData?.employees
      ? //@ts-expect-error - handle different possible structures
        employeesData.employees
      : null

    if (list && Array.isArray(list)) {
      const mappedEmployees = list
        .map((emp: Employee) => {
          const displayName =
            emp.name ||
            (emp.metadata?.FirstName && emp.metadata?.Surname
              ? `${emp.metadata.FirstName} ${emp.metadata.Surname}`
              : "Unnamed Employee")

          const position =
            emp.position || emp.metadata?.Position || emp.metadata?.jobTitle || "No position specified"

          const department = emp.department || emp.metadata?.Department || "Unknown Department"

          return {
            ...emp,
            displayName,
            position,
            department,
            company: emp.department || "Unknown Company",
          }
        })
        .filter((emp: DropdownEmployee) => emp.id && emp.displayName)
      setDropdownEmployees(mappedEmployees)
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

  const handleEmployeeSelect = (selectedEmployeeId: string) => {
    const selectedEmployee = dropdownEmployees.find((emp) => emp.id === selectedEmployeeId)

    if (selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        employeeId: selectedEmployee.id,
        employee: selectedEmployee.displayName,
        company: selectedEmployee.department || "",
        previousPosition: selectedEmployee.position || "",
      }))

      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.employeeId
        delete newErrors.employee
        delete newErrors.company
        delete newErrors.previousPosition
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employee.trim()) newErrors.employee = "Employee name is required"
    if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required"
    if (!formData.company.trim()) newErrors.company = "Company is required"
    if (!formData.promotionTitle.trim()) newErrors.promotionTitle = "Promotion title is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.previousPosition.trim()) newErrors.previousPosition = "Previous position is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Creating promotion record...")

    try {
      const promotionData = {
        employee_id: formData.employeeId,
        department: formData.company || null,
        previous_position: formData.previousPosition,
        new_position: formData.promotionTitle,
        effective_date: formData.date,
        reason: formData.details,
      }
      
      await onSubmit(promotionData)
      
      toast.success("Promotion record created successfully!", {
        id: loadingToast,
        duration: 3000,
      })
      
      onClose()
    } catch (error) {
      console.error("Error submitting promotion:", error)
      toast.error("Failed to create promotion record. Please try again.", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
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
                <DialogTitle className="text-lg font-semibold text-gray-900">New Promotion Record</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Create a promotion entry for an employee
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              {/* Employee Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Employee Information</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employee" className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Employee *
                    </Label>
                    <Select 
                      value={formData.employeeId} 
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
                                  <p className="text-sm pt-2 font-medium text-gray-900 leading-tight">{employee.displayName}</p>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.employeeId && (
                      <p className="text-sm text-red-600 mt-2">{errors.employeeId}</p>
                    )}
                  </div>

                  {formData.employeeId && (
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
                                value={formData.employee}
                                readOnly
                                className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500 font-medium mb-1 block">
                              Current Position
                            </Label>
                            <div className="flex items-center">
                              <div className="h-10 flex items-center justify-center w-10 border-r border-gray-200 bg-white">
                                <Briefcase className="h-4 w-4 text-gray-600" />
                              </div>
                              <Input
                                value={formData.previousPosition}
                                readOnly
                                className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                              />
                            </div>
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
                                value={formData.employeeId}
                                readOnly
                                className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                              />
                            </div>
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
                                value={formData.company}
                                readOnly
                                className="h-10 border-0 bg-white pl-3 text-sm font-medium text-gray-900"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Promotion Details Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Promotion Details</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="previousPosition" className="text-sm font-medium text-gray-700 mb-2 block">
                        Current Position *
                      </Label>
                      <div className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <Briefcase className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="previousPosition"
                          name="previousPosition"
                          value={formData.previousPosition}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 text-gray-900"
                          placeholder="Current position"
                          readOnly
                        />
                      </div>
                      {errors.previousPosition && (
                        <p className="text-sm text-red-600 mt-2">{errors.previousPosition}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="promotionTitle" className="text-sm font-medium text-gray-700 mb-2 block">
                        New Position *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                          <Award className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="promotionTitle"
                          name="promotionTitle"
                          value={formData.promotionTitle}
                          onChange={handleChange}
                          className="h-11 border-gray-300 pl-12 focus:border-green-600 focus:ring-green-600/20 text-gray-900"
                          placeholder="Enter new position"
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.promotionTitle && (
                        <p className="text-sm text-red-600 mt-2">{errors.promotionTitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md">
                    <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 block">
                      Effective Date *
                    </Label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r border-gray-300 bg-gray-50 rounded-l-md">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="h-11 border-gray-300 pl-12 text-gray-900"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-sm text-red-600 mt-2">{errors.date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details" className="text-sm font-medium text-gray-700 mb-2 block">
                      Promotion Notes
                    </Label>
                    <Textarea
                      id="details"
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      placeholder="Enter details about the promotion, reasons for advancement, and any additional notes..."
                      className="min-h-[120px] border-gray-300 focus:border-green-600 focus:ring-green-600/20 text-gray-900 resize-none"
                      rows={4}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Optional: Add supporting information for this promotion
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
                  disabled={isSubmitting}
                  className="h-10 px-6 border-gray-300 hover:bg-gray-100 text-gray-700 flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingEmployees}
                  className="h-10 px-8 bg-green-700 hover:bg-green-800 text-white flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="h-4 w-4 mr-2" />
                      Create Promotion Record
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