"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "email"
  | "password"
  | "number"
  | "switch"
  | "radio"
  | "checkbox"
  | "file"

export interface FormField {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  defaultValue?: any
  min?: number
  max?: number
  step?: number
  accept?: string
  multiple?: boolean
  disabled?: boolean
  description?: string
  validation?: {
    pattern?: RegExp
    minLength?: number
    maxLength?: number
    message?: string
  }
}

interface EnhancedFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel?: string
  cancelLabel?: string
  initialValues?: Record<string, any>
}

export function EnhancedForm({
  fields,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  initialValues = {},
}: EnhancedFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Initialize form data with initial values or default values from fields
    const data: Record<string, any> = {}
    fields.forEach((field) => {
      data[field.name] =
        initialValues[field.name] !== undefined
          ? initialValues[field.name]
          : field.defaultValue !== undefined
            ? field.defaultValue
            : field.type === "checkbox"
              ? false
              : ""
    })
    return data
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

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
      const value = formData[field.name]

      // Required validation
      if (field.required && (value === undefined || value === null || value === "")) {
        newErrors[field.name] = `${field.label} is required`
      }

      // Pattern validation
      if (value && field.validation?.pattern && !field.validation.pattern.test(value)) {
        newErrors[field.name] = field.validation.message || `Invalid format for ${field.label}`
      }

      // Length validation for strings
      if (typeof value === "string") {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          newErrors[field.name] = `${field.label} must be at least ${field.validation.minLength} characters`
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.name] = `${field.label} must be at most ${field.validation.maxLength} characters`
        }
      }

      // Number validation
      if (field.type === "number" && value !== "") {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          newErrors[field.name] = `${field.label} must be a number`
        } else {
          if (field.min !== undefined && numValue < field.min) {
            newErrors[field.name] = `${field.label} must be at least ${field.min}`
          }
          if (field.max !== undefined && numValue > field.max) {
            newErrors[field.name] = `${field.label} must be at most ${field.max}`
          }
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const renderField = (field: FormField) => {
    const { name, label, type, placeholder, required, options, disabled, description } = field
    const value = formData[name]
    const error = errors[name]

    const commonProps = {
      id: name,
      name,
      disabled: disabled || isSubmitting,
       "aria-invalid": !!error,
      "aria-describedby": error ? `${name}-error` : description ? `${name}-description` : undefined,
    }

    switch (type) {
      case "text":
      case "email":
      case "password":
      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={name} className="flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              {...commonProps}
              type={type}
              placeholder={placeholder}
              value={value || ""}
              onChange={(e) => handleChange(name, e.target.value)}
              min={field.min}
              max={field.max}
              step={field.step}
              className={error ? "border-red-500" : ""}
            />
            {description && !error && (
              <p id={`${name}-description`} className="text-sm text-gray-500">
                {description}
              </p>
            )}
            {error && (
              <p id={`${name}-error`} className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={name} className="flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              {...commonProps}
              placeholder={placeholder}
              value={value || ""}
              onChange={(e) => handleChange(name, e.target.value)}
              className={cn(error ? "border-red-500" : "", "min-h-[120px]")}
            />
            {description && !error && (
              <p id={`${name}-description`} className="text-sm text-gray-500">
                {description}
              </p>
            )}
            {error && (
              <p id={`${name}-error`} className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        )

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={name} className="flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value || ""}
              onValueChange={(value) => handleChange(name, value)}
              disabled={disabled || isSubmitting}
            >
              <SelectTrigger id={name} className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={placeholder || `Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && !error && (
              <p id={`${name}-description`} className="text-sm text-gray-500">
                {description}
              </p>
            )}
            {error && (
              <p id={`${name}-error`} className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        )

      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={name} className="flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground",
                    error && "border-red-500",
                  )}
                  disabled={disabled || isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), "PPP") : <span>{placeholder || "Pick a date"}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => handleChange(name, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {description && !error && (
              <p id={`${name}-description`} className="text-sm text-gray-500">
                {description}
              </p>
            )}
            {error && (
              <p id={`${name}-error`} className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        )

      case "switch":
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor={name} className="flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
              </Label>
              {description && (
                <p id={`${name}-description`} className="text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
            <Switch
              {...commonProps}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleChange(name, checked)}
            />
            {error && (
              <p id={`${name}-error`} className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={value || ""}
              onValueChange={(value) => handleChange(name, value)}
              className="flex flex-col space-y-1"
              disabled={disabled || isSubmitting}
            >
              {options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                  <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {description && !error && (
              <p id={`${name}-description`} className="text-sm text-gray-500">
                {description}
              </p>
            )}
            {error && (
              <p id={`${name}-error`} className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        )

      case "checkbox":
        if (options && options.length > 0) {
          // Multiple checkboxes
          return (
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
              </Label>
              <div className="space-y-2">
                {options.map((option) => {
                  const isChecked = Array.isArray(value) ? value.includes(option.value) : value === option.value

                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${name}-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (Array.isArray(value)) {
                            const newValue = checked
                              ? [...value, option.value]
                              : value.filter((v) => v !== option.value)
                            handleChange(name, newValue)
                          } else {
                            handleChange(name, checked ? option.value : "")
                          }
                        }}
                        disabled={disabled || isSubmitting}
                      />
                      <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
                    </div>
                  )
                })}
              </div>
              {description && !error && (
                <p id={`${name}-description`} className="text-sm text-gray-500">
                  {description}
                </p>
              )}
              {error && (
                <p id={`${name}-error`} className="text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>
          )
        } else {
          // Single checkbox
          return (
            <div className="flex items-start space-x-2">
              <Checkbox
                {...commonProps}
                checked={Boolean(value)}
                onCheckedChange={(checked) => handleChange(name, checked)}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor={name} className="flex items-center gap-1">
                  {label}
                  {required && <span className="text-red-500">*</span>}
                </Label>
                {description && !error && (
                  <p id={`${name}-description`} className="text-sm text-gray-500">
                    {description}
                  </p>
                )}
                {error && (
                  <p id={`${name}-error`} className="text-sm text-red-500">
                    {error}
                  </p>
                )}
              </div>
            </div>
          )
        }

      case "file":
        return (
          <div className="space-y-2">
            <Label htmlFor={name} className="flex items-center gap-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => {
                const files = e.target.files
                if (field.multiple) {
                  handleChange(name, files)
                } else {
                  handleChange(name, files?.[0] || null)
                }
              }}
              className={error ? "border-red-500" : ""}
            />
            {description && !error && (
              <p id={`${name}-description`} className="text-sm text-gray-500">
                {description}
              </p>
            )}
            {error && (
              <p id={`${name}-error`} className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.name}>{renderField(field)}</div>
      ))}

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
