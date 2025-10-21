"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, Printer } from "lucide-react"

export function ExportButtons() {
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export to PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" className="flex items-center gap-1">
        <Printer className="h-4 w-4" />
        Print
      </Button>
    </div>
  )
}
