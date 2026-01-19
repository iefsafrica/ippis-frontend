"use client"

import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerWithRange } from "./date-range-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { addDays } from "date-fns"
import { useCreateCalendarEvent, useUpdateCalendarEvent } from "@/services/hooks/calendar/events"
import { toast } from "sonner"

const eventFormSchema = z.object({
  title: z.string().min(2, {
    message: "Event title must be at least 2 characters.",
  }),
  eventType: z.string({
    //@ts-expect-error type issue
    required_error: "Please select an event type.",
  }),
  department: z.string().min(2, {
    message: "Department is required.",
  }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  description: z.string().optional(),
  attendees: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

interface AddEventFormProps {
  mode?: "create" | "edit"
  eventId?: number
  initialValues?: Partial<EventFormValues>
  onSuccess?: () => void
}

export function AddEventForm({
  mode = "create",
  eventId,
  initialValues,
  onSuccess,
}: AddEventFormProps) {
  const createCalendarEventMutation = useCreateCalendarEvent()
  const updateCalendarEventMutation = useUpdateCalendarEvent()

  const defaultValues = useMemo<EventFormValues>(() => {
    return {
      title: "",
      eventType: "",
      department: "",
      dateRange: {
        from: new Date(),
        to: addDays(new Date(), 1),
      },
      allDay: false,
      location: "",
      description: "",
      attendees: "",
    }
  }, [])

  const resolvedDefaults = useMemo<EventFormValues>(() => {
    return {
      ...defaultValues,
      ...initialValues,
      dateRange: initialValues?.dateRange || defaultValues.dateRange,
    }
  }, [defaultValues, initialValues])

  const form = useForm<EventFormValues>({
     //@ts-expect-error type issue
    resolver: zodResolver(eventFormSchema),
    defaultValues: resolvedDefaults,
  })

  useEffect(() => {
    if (initialValues) {
      form.reset(resolvedDefaults)
    }
  }, [form, initialValues, resolvedDefaults])

  async function onSubmit(values: EventFormValues) {
    try {
      const payload = {
        title: values.title,
        event_type: values.eventType,
        start_date: values.dateRange.from.toISOString().split("T")[0],
        end_date: values.dateRange.to.toISOString().split("T")[0],
        all_day: values.allDay,
        department: values.department,
        location: values.location || "",
        description: values.description || "",
        attendees: values.attendees
          ? values.attendees.split(",").map((attendee) => attendee.trim()).filter(Boolean)
          : [],
      }

      if (mode === "edit" && eventId) {
        await updateCalendarEventMutation.mutateAsync({ id: eventId, ...payload })
        toast.success("Calendar event updated successfully")
      } else {
        await createCalendarEventMutation.mutateAsync(payload)
        toast.success("Calendar event created successfully")
        form.reset(defaultValues)
      }

      onSuccess?.()
    } catch (error: any) {
      const fallbackMessage = mode === "edit" ? "Failed to update calendar event" : "Failed to create calendar event"
      toast.error(error.message || fallbackMessage)
    }
  }

  const isSubmitting = createCalendarEventMutation.isPending || updateCalendarEventMutation.isPending
  const submitLabel = mode === "edit" ? "Update Event" : "Create Event"

  return (
    <Form {...form}>
     {/* @ts-expect-error type issue */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
        //@ts-expect-error type issue
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Department Meeting" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
        //@ts-expect-error type issue
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
        //@ts-expect-error type issue
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="Human Resources" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
        //@ts-expect-error type issue
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Event Date</FormLabel>
              <DatePickerWithRange
                date={field.value}
                setDate={(range) => field.onChange(range as EventFormValues["dateRange"])}
              />
              <FormDescription>Select the start and end dates for your event.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
        //@ts-expect-error type issue
          control={form.control}
          name="allDay"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>All-day event</FormLabel>
                <FormDescription>This event will be shown as an all-day event</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
        //@ts-expect-error type issue
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Conference Room A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
        //@ts-expect-error type issue
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any additional details about the event" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
        //@ts-expect-error type issue
          control={form.control}
          name="attendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attendees (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="John Doe, Jane Smith" {...field} />
              </FormControl>
              <FormDescription>Comma-separated list of attendees</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
