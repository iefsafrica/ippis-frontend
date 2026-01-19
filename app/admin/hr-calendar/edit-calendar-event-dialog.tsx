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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Building, FileText, Users, MapPin, Tag, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useUpdateCalendarEvent } from "@/services/hooks/calendar/events"
import type { CalendarEvent } from "@/types/calendar/events"

interface CalendarEventFormData {
  title: string
  event_type: string
  department: string
  start_date: string
  end_date: string
  all_day: boolean
  location: string
  description: string
  attendees: string
}

interface EditCalendarEventDialogProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent | null
}

const eventTypeOptions = [
  { value: "Meeting", label: "Meeting" },
  { value: "Training", label: "Training" },
  { value: "Holiday", label: "Holiday" },
  { value: "Deadline", label: "Deadline" },
  { value: "Other", label: "Other" },
]

const toDateInput = (value?: string) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

export function EditCalendarEventDialog({ isOpen, onClose, event }: EditCalendarEventDialogProps) {
  const updateCalendarEventMutation = useUpdateCalendarEvent()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<CalendarEventFormData>({
    title: "",
    event_type: "",
    department: "",
    start_date: "",
    end_date: "",
    all_day: false,
    location: "",
    description: "",
    attendees: "",
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        event_type: event.event_type || "",
        department: event.department || "",
        start_date: toDateInput(event.start_date),
        end_date: toDateInput(event.end_date),
        all_day: !!event.all_day,
        location: event.location || "",
        description: event.description || "",
        attendees: Array.isArray(event.attendees) ? event.attendees.join(", ") : "",
      })
    }
  }, [event])

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

  const handleSelectChange = (name: keyof CalendarEventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleCheckboxChange = (value: boolean | "indeterminate") => {
    setFormData((prev) => ({ ...prev, all_day: value === true }))
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.title.trim()) nextErrors.title = "Title is required"
    if (!formData.event_type.trim()) nextErrors.event_type = "Event type is required"
    if (!formData.department.trim()) nextErrors.department = "Department is required"
    if (!formData.start_date) nextErrors.start_date = "Start date is required"
    if (!formData.end_date) nextErrors.end_date = "End date is required"

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
    if (!event) return
    if (!validateForm()) return

    setIsSubmitting(true)
    const loadingToast = toast.loading("Updating calendar event...")

    try {
      const payload = {
        id: event.id,
        title: formData.title,
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        all_day: formData.all_day,
        department: formData.department,
        location: formData.location,
        description: formData.description,
        attendees: formData.attendees
          ? formData.attendees.split(",").map((attendee) => attendee.trim()).filter(Boolean)
          : [],
      }

      await updateCalendarEventMutation.mutateAsync(payload)

      toast.success("Calendar event updated successfully!", {
        id: loadingToast,
        duration: 3000,
      })

      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to update calendar event", {
        id: loadingToast,
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = updateCalendarEventMutation.isPending || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  Edit Calendar Event
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update event details for {event?.title || "calendar event"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Event Details</h3>
                  <span className="text-xs text-gray-500">Required fields marked with *</span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                        Event Title *
                      </Label>
                      <div className="flex items-center">
                        <div className="h-11 flex items-center justify-center w-10 border border-gray-300 border-r-0 bg-gray-50 rounded-l-md">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="h-11 border-gray-300 rounded-l-none"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.title && <p className="text-sm text-red-600 mt-2">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event_type" className="text-sm font-medium text-gray-700 mb-2 block">
                        Event Type *
                      </Label>
                      <Select
                        value={formData.event_type}
                        onValueChange={(value) => handleSelectChange("event_type", value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-11 border-gray-300 text-gray-900">
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 text-gray-500 mr-3" />
                            <SelectValue placeholder="Select event type" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.event_type && <p className="text-sm text-red-600 mt-2">{errors.event_type}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="h-11 border-gray-300 rounded-l-none"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.department && <p className="text-sm text-red-600 mt-2">{errors.department}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                        Location
                      </Label>
                      <div className="flex items-center">
                        <div className="h-11 flex items-center justify-center w-10 border border-gray-300 border-r-0 bg-gray-50 rounded-l-md">
                          <MapPin className="h-4 w-4 text-gray-600" />
                        </div>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="h-11 border-gray-300 rounded-l-none"
                          disabled={isLoading}
                        />
                      </div>
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
                      {errors.start_date && <p className="text-sm text-red-600 mt-2">{errors.start_date}</p>}
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
                      {errors.end_date && <p className="text-sm text-red-600 mt-2">{errors.end_date}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rounded-md border border-gray-200 p-4">
                    <Checkbox checked={formData.all_day} onCheckedChange={handleCheckboxChange} />
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">All-day event</Label>
                      <p className="text-xs text-gray-500">Mark this event as all-day</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="min-h-[120px] border-gray-300 text-gray-900"
                      placeholder="Update event description..."
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendees" className="text-sm font-medium text-gray-700 mb-2 block">
                      Attendees
                    </Label>
                    <div className="flex items-center">
                      <div className="h-11 flex items-center justify-center w-10 border border-gray-300 border-r-0 bg-gray-50 rounded-l-md">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <Input
                        id="attendees"
                        name="attendees"
                        value={formData.attendees}
                        onChange={handleChange}
                        className="h-11 border-gray-300 rounded-l-none"
                        placeholder="EMP14098, EMP14382"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Comma-separated list of attendees</p>
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
                      Update Event
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
