"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface FormField {
  name: string
  label: string
  type: "text" | "textarea" | "select" | "date" | "number"
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
}

interface FormDialogProps {
  title: string
  fields: FormField[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Record<string, any>) => void
  initialData?: Record<string, any>
  isEdit?: boolean
}

export function FormDialog({
  title,
  fields,
  open,
  onOpenChange,
  onSubmit,
  initialData = {},
  isEdit = false,
}: FormDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      const missingFields = fields
        .filter((field) => field.required && !formData[field.name])
        .map((field) => field.label)

      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Please fill in the following required fields: ${missingFields.join(", ")}`,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Submit the form data
      await onSubmit(formData)

      // Close the dialog
      onOpenChange(false)

      // Show success message
      toast({
        title: "Success",
        description: `${title} ${isEdit ? "updated" : "created"} successfully.`,
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} ${title.toLowerCase()}.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] w-full max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isEdit ? `Update ${title}` : `Add New ${title}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.type === 'textarea' ? 'sm:col-span-2 space-y-2' : 'space-y-2'}
              >
                <Label htmlFor={field.name}>
                  {field.label}{' '}
                  {field.required && <span className="text-rose-500">*</span>}
                </Label>
                <div>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      className="min-h-[80px]"
                    />
                  ) : field.type === 'select' ? (
                    <Select
                      value={formData[field.name] || ''}
                      onValueChange={(value) => handleChange(field.name, value)}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            field.placeholder || `Select ${field.label}`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'date' ? (
                    <Input
                      id={field.name}
                      type="date"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  ) : field.type === 'number' ? (
                    <Input
                      id={field.name}
                      type="number"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#008751] hover:bg-[#007647] text-white font-semibold shadow-xs"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
