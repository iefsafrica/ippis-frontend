"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, CheckCircle, XCircle } from "lucide-react"

interface DetailsField {
  label: string
  key: string
  type?: "text" | "date" | "status" | "longText" | "badge"
}

interface DetailsDialogProps {
  title: string
  fields: DetailsField[]
  data: Record<string, any>
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}

export function DetailsDialog({ title, fields, data, open, onOpenChange, onEdit }: DetailsDialogProps) {
  const renderFieldValue = (field: DetailsField) => {
    const value = data[field.key]

    if (value === undefined || value === null) {
      return <span className="text-gray-400">Not provided</span>
    }

    switch (field.type) {
      case "date":
        return (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            {new Date(value).toLocaleDateString()}
          </div>
        )
      case "status":
        return (
          <Badge
            className={
              value === "Approved" || value === "Active" || value === "Completed"
                ? "bg-green-100 text-green-800"
                : value === "Pending" || value === "In Progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : value === "Rejected" || value === "Inactive" || value === "Cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }
          >
            {value === "Approved" || value === "Active" || value === "Completed" ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : value === "Rejected" || value === "Inactive" || value === "Cancelled" ? (
              <XCircle className="mr-1 h-3 w-3" />
            ) : null}
            {value}
          </Badge>
        )
      case "longText":
        return (
          <div className="flex items-start">
            <FileText className="mr-2 h-4 w-4 text-gray-500 mt-0.5" />
            <div className="whitespace-pre-wrap">{value}</div>
          </div>
        )
      case "badge":
        return (
          <Badge variant="outline" className="font-normal">
            {value}
          </Badge>
        )
      default:
        return <span>{value}</span>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">{title} Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className={
                field.type === "longText"
                  ? "sm:col-span-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 space-y-1"
                  : "rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 space-y-1"
              }
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{field.label}</div>
              <div className="text-sm font-medium text-slate-900">{renderFieldValue(field)}</div>
            </div>
          ))}
        </div>
        <DialogFooter className="pt-4 border-t border-slate-100 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-200 text-slate-700">
            Close
          </Button>
          <Button onClick={onEdit} className="bg-[#008751] hover:bg-[#007647] text-white font-semibold shadow-xs">
            Edit Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
