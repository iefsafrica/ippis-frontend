"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, Printer } from "lucide-react"

export interface ExportButtonsProps {
  onPrint?: () => void
  onExportCSV?: () => void
  onExportPDF?: () => void
  isLoading?: boolean
}

export function ExportButtons({
  onPrint,
  onExportCSV,
  onExportPDF,
  isLoading = false,
}: ExportButtonsProps = {}) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else if (typeof window !== "undefined") {
      window.print()
    }
  }

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5" disabled={isLoading}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onExportCSV && (
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={onExportCSV}>
              <FileText className="h-4 w-4 text-emerald-600" />
              Export to CSV
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={onExportPDF || handlePrint}
          >
            <FileText className="h-4 w-4 text-rose-600" />
            Export to PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5"
        onClick={handlePrint}
        disabled={isLoading}
        title="Print tabular data report"
      >
        <Printer className="h-4 w-4 text-slate-700" />
        Print Data
      </Button>
    </div>
  )
}
