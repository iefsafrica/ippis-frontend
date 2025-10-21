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
import { Download, Printer, Edit, Trash2, Copy } from "lucide-react"

export type FinanceDetailsField = {
  label: string
  key: string
  type?: "text" | "date" | "status" | "currency" | "email" | "url" | "image" | "boolean" | "custom" | "reference"
  render?: (value: any) => React.ReactNode
  format?: string
  statusMap?: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }>
  currencySymbol?: string
  referencePrefix?: string
}

interface FinanceDetailsDialogProps {
  title: string
  data: Record<string, any>
  fields: FinanceDetailsField[]
  trigger?: React.ReactNode
  actions?: {
    edit?: boolean
    delete?: boolean
    print?: boolean
    download?: boolean
    copy?: boolean
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
  onCopy?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  currencySymbol?: string
}

export function FinanceDetailsDialog({
  title,
  data,
  fields,
  trigger,
  actions,
  onEdit,
  onDelete,
  onPrint,
  onDownload,
  onCopy,
  isOpen,
  onOpenChange,
  currencySymbol = "$",
}: FinanceDetailsDialogProps) {
  const renderValue = (field: FinanceDetailsField, value: any) => {
    if (value === undefined || value === null) {
      return <span className="text-muted-foreground">Not provided</span>
    }

    if (field.render) {
      return field.render(value)
    }

    const fieldCurrencySymbol = field.currencySymbol || currencySymbol

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
          currencyDisplay: "symbol",
        })
          .format(Number(value))
          .replace("$", fieldCurrencySymbol)
      case "boolean":
        return value ? "Yes" : "No"
      case "image":
        return <img src={value || "/placeholder.svg"} alt={field.label} className="h-20 w-20 object-cover rounded-md" />
      case "reference":
        return (
          <div className="flex items-center">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
              {field.referencePrefix || ""}
              {value}
            </span>
            {onCopy && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2"
                onClick={() => {
                  navigator.clipboard.writeText(`${field.referencePrefix || ""}${value}`)
                }}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy reference</span>
              </Button>
            )}
          </div>
        )
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
              {actions.copy && onCopy && (
                <Button variant="outline" size="sm" onClick={onCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
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
