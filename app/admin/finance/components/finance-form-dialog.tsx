"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type FinanceFormField = {
  name: string
  label: string
  type: "text" | "email" | "password" | "number" | "date" | "select" | "textarea" | "currency"
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
  currencySymbol?: string
}

interface FinanceFormDialogProps {
  title: string
  fields: FinanceFormField[]
  onSubmit: (data: Record<string, any>) => Promise<void>
  trigger?: React.ReactNode
  submitLabel?: string
  cancelLabel?: string
  initialValues?: Record<string, any>
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  currencySymbol?: string
}

export function FinanceFormDialog({
  title,
  fields,
  onSubmit,
  trigger,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  initialValues = {},
  isOpen,
  onOpenChange,
  currencySymbol = "₦",
}: FinanceFormDialogProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(isOpen || false)

  const controlledOpen = isOpen !== undefined ? isOpen : open
  const handleOpenChange = onOpenChange || setOpen

  useEffect(() => {
    if (controlledOpen) {
      setFormValues(initialValues || {})
      setErrors({})
    }
  }, [controlledOpen, initialValues])

  const handleChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
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
        const { validation } = field
        if (validation) {
          if ((field.type === "number" || field.type === "currency") && typeof value === "string") {
            const num = parseFloat(value)
            if (validation.min !== undefined && num < validation.min) {
              newErrors[field.name] = `${field.label} must be at least ${validation.min}`
            }
            if (validation.max !== undefined && num > validation.max) {
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
              newErrors[field.name] = `${field.label} format is invalid`
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
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formValues)
      handleOpenChange(false)
      setFormValues({})
    } catch (err) {
      console.error("Form submit error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FinanceFormField) => {
    const value = formValues[field.name] ?? field.defaultValue ?? ""
    const error = errors[field.name]
    const fieldCurrencySymbol = field.currencySymbol || currencySymbol

    const widthClass =
      field.width === "half"
        ? "col-span-1 sm:col-span-1"
        : field.width === "third"
        ? "col-span-1 sm:col-span-1 md:col-span-1"
        : "col-span-2"

    return (
      <div key={field.name} className={widthClass}>
        <div className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>

          {["text", "email", "password", "number"].includes(field.type) && (
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? "border-destructive" : ""}
            />
          )}

          {field.type === "currency" && (
            <div className="relative">
              <span className="absolute left-3 top-2.5">{fieldCurrencySymbol}</span>
              <Input
                id={field.name}
                type="number"
                step="0.01"
                className={cn("pl-7", error && "border-destructive")}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            </div>
          )}

          {field.type === "textarea" && (
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? "border-destructive" : ""}
            />
          )}

          {field.type === "select" && (
            <Select value={value} onValueChange={(val) => handleChange(field.name, val)}>
              <SelectTrigger className={error ? "border-destructive" : ""}>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", error && "border-destructive")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => handleChange(field.name, date?.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
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
