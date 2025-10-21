"use client"

import type React from "react"

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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Download, Printer, Edit, Trash2 } from "lucide-react"

export type DetailsField = {
  label: string
  key: string
  type?: "text" | "date" | "status" | "currency" | "email" | "url" | "image" | "boolean" | "custom"
  render?: (value: any) => React.ReactNode
  format?: string
  statusMap?: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }>
}

interface DetailsDialogProps {
  title: string
  data: Record<string, any>
  fields: DetailsField[]
  trigger?: React.ReactNode
  actions?: {
    edit?: boolean
    delete?: boolean
    print?: boolean
    download?: boolean
    custom?: {
      label: string
      icon: React.ReactNode
      onClick: () => void
    }[]
  }
  onEdit?: () => void
  onDelete?: () => void
  onPrint?: () => void
  onDownload?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DetailsDialog({
  title,
  data,
  fields,
  trigger,
  actions,
  onEdit,
  onDelete,
  onPrint,
  onDownload,
  isOpen,
  onOpenChange,
}: DetailsDialogProps) {
  const renderValue = (field: DetailsField, value: any) => {
    if (value === undefined || value === null) {
      return <span className="text-muted-foreground">Not provided</span>
    }

    if (field.render) {
      return field.render(value)
    }

    switch (field.type) {
      case "date":
        try {
          return format(new Date(value), field.format || "PPP")
        } catch (error) {
          return value
        }
      case "status":
        if (field.statusMap && field.statusMap[value]) {
          const status = field.statusMap[value]
          return <Badge variant={status.variant}>{status.label}</Badge>
        }
        return value
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number(value))
      case "boolean":
        return value ? "Yes" : "No"
      case "image":
        return <img src={value || "/placeholder.svg"} alt={field.label} className="h-20 w-20 object-cover rounded-md" />
      default:
        return String(value)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="grid grid-cols-3 gap-4">
                <div className="font-medium text-sm">{field.label}</div>
                <div className="col-span-2">{renderValue(field, data[field.key])}</div>
                <Separator className="col-span-3" />
              </div>
            ))}
          </div>
        </div>
        {actions && (
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              {actions.edit && onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {actions.delete && onDelete && (
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {actions.download && onDownload && (
                <Button variant="outline" size="sm" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              {actions.print && onPrint && (
                <Button variant="outline" size="sm" onClick={onPrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              )}
              {actions.custom &&
                actions.custom.map((action) => (
                  <Button key={action.label} variant="outline" size="sm" onClick={action.onClick}>
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              <DialogClose asChild>
                <Button variant="secondary" size="sm">
                  Close
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
