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
import { CalendarDays, FileText, Loader2, Phone, User, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useUpdateLeave } from "@/services/hooks/calendar/leaves"
import type { Leave } from "@/types/calendar/leaves"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LeaveFormData {
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  reason: string
  emergency_contact: string
  status: string
}

interface EditLeaveDialogProps {
  isOpen: boolean
  onClose: () => void
  leave: Leave | null
}

const toDateInput = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

export function EditLeaveDialog({ isOpen, onClose, leave }: EditLeaveDialogProps) {
  const updateLeaveMutation = useUpdateLeave()
  const [formData, setFormData] = useState<LeaveFormData>({
    employee_id: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    emergency_contact: "",
    status: "pending",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (leave) {
      setFormData({
        employee_id: leave.employee_id || "",
        leave_type: leave.leave_type || "",
        start_date: toDateInput(leave.start_date),
        end_date: toDateInput(leave.end_date),
        reason: leave.reason || "",
        emergency_contact: leave.emergency_contact || "",
        status: leave.status || "pending",
      })
    }
  }, [leave])

  useEffect(() => {
    if (!isOpen) {
      setErrors({})
    }
  }, [isOpen])

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

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.employee_id.trim()) nextErrors.employee_id = "Employee ID is required"
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
    if (!leave) return
    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating leave request...")

    try {
      await updateLeaveMutation.mutateAsync({
        id: leave.id,
        employee_id: formData.employee_id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        emergency_contact: formData.emergency_contact,
        status: formData.status,
      })

      toast.success("Leave request updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })

      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to update leave request", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = updateLeaveMutation.isPending || isSubmitting

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
                  Edit Leave Request
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update leave request for {leave?.employee_name || "employee"}
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
                        Employee ID *
                      </Label>
                      <div className="flex items-center">
                        <div className="h-11 flex items-center justify-center w-10 border border-gray-300 border-r-0 bg-gray-50 rounded-l-md">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="employee_id"
                          name="employee_id"
                          value={formData.employee_id}
                          onChange={handleChange}
                          className="h-11 border-gray-300 rounded-l-none text-left"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.employee_id && <p className="text-sm text-red-600 mt-2">{errors.employee_id}</p>}
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
                        disabled={isLoading}
                      />
                    </div>
                    {errors.emergency_contact && (
                      <p className="text-sm text-red-600 mt-2">{errors.emergency_contact}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                      Status
                    </Label>
                    <Select value={formData.status} onValueChange={handleSelectChange} disabled={isLoading}>
                      <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
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
                      Update Leave
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
