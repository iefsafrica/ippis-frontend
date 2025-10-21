"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Printer, FileSpreadsheetIcon as FileCsv, FileIcon as FilePdf, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DataExportMenuProps {
  onExportPDF: () => void
  onExportCSV: () => void
  onPrint: () => void
  title: string
}

export function DataExportMenu({ onExportPDF, onExportCSV, onPrint, title }: DataExportMenuProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const { toast } = useToast()

  const handleExport = async (type: string, action: () => void) => {
    setIsExporting(type)

    try {
      // Show toast notification
      toast({
        title: `Preparing ${type} export`,
        description: "Please wait while we prepare your file...",
      })

      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Execute the export action
      action()

      // Success toast
      toast({
        title: "Export successful!",
        description: `Your ${type} has been exported successfully.`,
        variant: "success",
      })
    } catch (error) {
      // Error toast
      toast({
        title: "Export failed",
        description: `There was an error exporting your ${type}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 transition-all hover:bg-primary hover:text-primary-foreground"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 bg-white">
        <DropdownMenuItem
          onClick={() => handleExport('PDF', onExportPDF)}
          className="cursor-pointer flex items-center gap-2 p-3 hover:bg-muted rounded-md transition-colors"
          disabled={!!isExporting}
        >
          <div className="bg-red-100 p-2 rounded-md">
            <FilePdf className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">PDF Document</span>
            <span className="text-xs text-muted-foreground">
              Export as PDF file
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('CSV', onExportCSV)}
          className="cursor-pointer flex items-center gap-2 p-3 hover:bg-muted rounded-md transition-colors"
          disabled={!!isExporting}
        >
          <div className="bg-green-100 p-2 rounded-md">
            <FileCsv className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">CSV Spreadsheet</span>
            <span className="text-xs text-muted-foreground">
              Export as CSV file
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('Print', onPrint)}
          className="cursor-pointer flex items-center gap-2 p-3 hover:bg-muted rounded-md transition-colors"
          disabled={!!isExporting}
        >
          <div className="bg-blue-100 p-2 rounded-md">
            <Printer className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Print {title}</span>
            <span className="text-xs text-muted-foreground">
              Send to printer
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
