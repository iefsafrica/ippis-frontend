"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import {
  CustomSelect,
  CustomSelectContent,
  CustomSelectItem,
  CustomSelectTrigger,
  CustomSelectValue,
} from "@/components/ui/custom-select"
import { addDays } from "date-fns"
import { toast } from "sonner"

const taskSchema = z.object({
  title: z.string().min(2, {
    message: "Task title must be at least 2 characters.",
  }),
  dueDate: z.date(),
  assignee: z.string().min(2, {
    message: "Assignee name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  status: z.string({
    required_error: "Please select a task status.",
  }),
  priority: z.string({
    required_error: "Please select a priority level.",
  }),
  relatedProject: z.string().optional(),
})

export function TaskForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      dueDate: addDays(new Date(), 7),
      assignee: "",
      description: "",
      status: "",
      priority: "",
      relatedProject: "",
    },
  })

  function onSubmit(values: z.infer<typeof taskSchema>) {
    setIsSubmitting(true)
    const loadingToast = toast.loading("Adding task...")

    // Simulate API call
    setTimeout(() => {
      toast.dismiss(loadingToast)
      toast.success("Task added successfully")
      setIsSubmitting(false)
      form.reset()
    }, 1000)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Update Employee Records" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <DatePicker value={field.value} onValueChange={field.onChange} />
              <FormDescription>Select the due date for this task.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe what needs to be done" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Status</FormLabel>
                <CustomSelect value={field.value} onValueChange={field.onChange}>
                  <CustomSelectTrigger>
                    <CustomSelectValue placeholder="Select status" />
                  </CustomSelectTrigger>
                  <CustomSelectContent>
                    <CustomSelectItem value="not-started">Not Started</CustomSelectItem>
                    <CustomSelectItem value="in-progress">In Progress</CustomSelectItem>
                    <CustomSelectItem value="pending">Pending</CustomSelectItem>
                    <CustomSelectItem value="completed">Completed</CustomSelectItem>
                    <CustomSelectItem value="cancelled">Cancelled</CustomSelectItem>
                  </CustomSelectContent>
                </CustomSelect>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <CustomSelect value={field.value} onValueChange={field.onChange}>
                  <CustomSelectTrigger>
                    <CustomSelectValue placeholder="Select priority" />
                  </CustomSelectTrigger>
                  <CustomSelectContent>
                    <CustomSelectItem value="low">Low</CustomSelectItem>
                    <CustomSelectItem value="medium">Medium</CustomSelectItem>
                    <CustomSelectItem value="high">High</CustomSelectItem>
                    <CustomSelectItem value="urgent">Urgent</CustomSelectItem>
                  </CustomSelectContent>
                </CustomSelect>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="relatedProject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related Project (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="IPPIS System Upgrade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Add Task"}
        </Button>
      </form>
    </Form>
  )
}
