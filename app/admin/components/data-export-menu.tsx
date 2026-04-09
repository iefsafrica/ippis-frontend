"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { buttonHoverEnhancements } from "../employees/button-hover"

interface DataExportMenuProps {
  onExport: () => void
  title?: string
}

export function DataExportMenu({ onExport, title }: DataExportMenuProps) {
  return (
    <Button
      onClick={onExport}
      type="button"
      variant="outline"
      className={`${buttonHoverEnhancements} gap-1 w-full sm:w-auto`}
      aria-label={`Export ${title ?? "records"}`}
    >
      <Download className="h-4 w-4" />
      Export
    </Button>
  )
}
