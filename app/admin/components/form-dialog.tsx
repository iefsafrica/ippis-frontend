"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type FormField = {
  name: string
  label: string
  type: "text" | "email" | "password" | "number" | "date" | "select" | "textarea" | "checkbox" | "file"
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  helpText?: string
  width?: "full" | "half" | "third"
}

interface FormDialogProps {
  title: string
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => Promise<void>
  trigger?: React.ReactNode
  submitLabel?: string
  cancelLabel?: string
  initialValues?: Record<string, any>
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FormDialog({
  title,
  fields,
  onSubmit,
  trigger,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  initialValues = {},
  isOpen,
  onOpenChange,
}: FormDialogProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(isOpen || false)

  const controlledOpen = isOpen !== undefined ? isOpen : open
  const handleOpenChange = onOpenChange || setOpen

  const handleChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formValues[field.name]

      if (field.required && (value === undefined || value === null || value === "")) {
        newErrors[field.name] = `${field.label} is required`
      }

      if (value !== undefined && value !== null && value !== "") {
        const validation = field.validation

        if (validation) {
          if (field.type === "number") {
            const numValue = Number(value)

            if (validation.min !== undefined && numValue < validation.min) {
              newErrors[field.name] = `${field.label} must be at least ${validation.min}`
            }

            if (validation.max !== undefined && numValue > validation.max) {
              newErrors[field.name] = `${field.label} must be at most ${validation.max}`
            }
          }

          if (typeof value === "string") {
            if (validation.minLength !== undefined && value.length < validation.minLength) {
              newErrors[field.name] = `${field.label} must be at least ${validation.minLength} characters`
            }

            if (validation.maxLength !== undefined && value.length > validation.maxLength) {
              newErrors[field.name] = `${field.label} must be at most ${validation.maxLength} characters`
            }

            if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
              newErrors[field.name] = `${field.label} is not valid`
            }
          }
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formValues)
      handleOpenChange(false)
      // Reset form after successful submission
      setFormValues(initialValues)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formValues[field.name] !== undefined ? formValues[field.name] : field.defaultValue
    const error = errors[field.name]

    const widthClass =
      field.width === "half"
        ? "col-span-1 sm:col-span-1"
        : field.width === "third"
          ? "col-span-1 sm:col-span-1 md:col-span-1"
          : "col-span-2"

    return (
      <div key={field.name} className={widthClass}>
        {field.type === "checkbox" ? (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.type === "text" || field.type === "email" || field.type === "password" || field.type === "number" ? (
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={value || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className={error ? "border-destructive" : ""}
              />
            ) : field.type === "textarea" ? (
              <Textarea
                id={field.name}
                name={field.name}
                placeholder={field.placeholder}
                value={value || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className={error ? "border-destructive" : ""}
              />
            ) : field.type === "select" ? (
              <Select value={value || ""} onValueChange={(val) => handleChange(field.name, val)}>
                <SelectTrigger className={error ? "border-destructive" : ""}>
                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "date" ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !value && "text-muted-foreground",
                      error && "border-destructive",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(date) => handleChange(field.name, date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : field.type === "file" ? (
              <Input
                id={field.name}
                name={field.name}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  handleChange(field.name, file)
                }}
                className={error ? "border-destructive" : ""}
              />
            ) : null}

            {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={controlledOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">{fields.map(renderField)}</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
