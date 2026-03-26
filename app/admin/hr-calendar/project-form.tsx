"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerWithRange } from "./date-range-picker"
import {
  CustomSelect,
  CustomSelectContent,
  CustomSelectItem,
  CustomSelectTrigger,
  CustomSelectValue,
} from "@/components/ui/custom-select"
import { addDays } from "date-fns"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

const projectSchema = z.object({
  title: z.string().min(2, {
    message: "Project title must be at least 2 characters.",
  }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  manager: z.string().min(2, {
    message: "Project manager name must be at least 2 characters.",
  }),
  team: z.string().min(2, {
    message: "Team members must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  status: z.string({
    required_error: "Please select a project status.",
  }),
  priority: z.string({
    required_error: "Please select a priority level.",
  }),
  budget: z.string().optional(),
  completion: z.number().min(0).max(100),
})

export function ProjectForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      dateRange: {
        from: new Date(),
        to: addDays(new Date(), 30),
      },
      manager: "",
      team: "",
      description: "",
      status: "",
      priority: "",
      budget: "",
      completion: 0,
    },
  })

  function onSubmit(values: z.infer<typeof projectSchema>) {
    setIsSubmitting(true)
    const loadingToast = toast.loading("Adding project...")

    // Simulate API call
    setTimeout(() => {
      toast.dismiss(loadingToast)
      toast.success("Project added successfully")
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
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="IPPIS System Upgrade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Project Timeline</FormLabel>
              <DatePickerWithRange date={field.value} setDate={field.onChange} />
              <FormDescription>Select the start and end dates for the project.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manager"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Manager</FormLabel>
              <FormControl>
                <Input placeholder="Jane Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="team"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Members</FormLabel>
              <FormControl>
                <Input placeholder="John Doe, Jane Smith, Robert Johnson" {...field} />
              </FormControl>
              <FormDescription>Comma-separated list of team members</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the project scope and objectives" className="resize-none" {...field} />
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
                <FormLabel>Project Status</FormLabel>
                <CustomSelect value={field.value} onValueChange={field.onChange}>
                  <CustomSelectTrigger>
                    <CustomSelectValue placeholder="Select status" />
                  </CustomSelectTrigger>
                  <CustomSelectContent>
                    <CustomSelectItem value="not-started">Not Started</CustomSelectItem>
                    <CustomSelectItem value="planning">Planning</CustomSelectItem>
                    <CustomSelectItem value="in-progress">In Progress</CustomSelectItem>
                    <CustomSelectItem value="on-hold">On Hold</CustomSelectItem>
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
                    <CustomSelectItem value="critical">Critical</CustomSelectItem>
                  </CustomSelectContent>
                </CustomSelect>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="₦0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="completion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completion Percentage: {field.value}%</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Add Project"}
        </Button>
      </form>
    </Form>
  )
}
