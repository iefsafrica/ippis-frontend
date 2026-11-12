"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Inbox,
} from "lucide-react"
import { AdvancedSearch } from "@/app/admin/components/advanced-search"
import ExportService from "@/app/admin/services/export-service"
import { toast } from "sonner"
import { buttonHoverEnhancements } from "@/app/admin/employees/button-hover"

interface DataTableProps {
  title: string
  columns: {
    key: string
    label: string
    sortable?: boolean
    render?: (value: any, row: any) => React.ReactNode
  }[]
  data: any[]
  searchFields: Array<{
    name: string
    label: string
    type: "text" | "select" | "date"
    options?: Array<{ value: string; label: string }>
  }>
  onAdd?: () => void
  itemsPerPage?: number
  defaultSortColumn?: string
  defaultSortDirection?: "asc" | "desc"
  extraSearchControls?: React.ReactNode
  addButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
  addButtonLoading?: boolean
  onExport?: () => void
  exportLabel?: string
  addButtonLabel?: string
  tableClassName?: string
  addButtonExtra?: React.ReactNode
}

export function DataTable({
  title,
  columns,
  data,
  searchFields,
  onAdd,
  itemsPerPage = 1000,
  defaultSortColumn,
  defaultSortDirection = "asc",
  extraSearchControls,
  addButtonProps,
  addButtonLoading = false,
  onExport,
  exportLabel,
  addButtonLabel,
  tableClassName,
  addButtonExtra,
}: DataTableProps) {
  const normalizedTitle = title?.trim() || "Records"
  const normalizedTitleLower = normalizedTitle.toLowerCase()
  const exportFilenameTitle = normalizedTitle.replace(/\s+/g, "_")
  const [searchTerm, setSearchTerm] = useState("")
  const [advancedSearchParams, setAdvancedSearchParams] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn ?? null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const normalizedSearchTerm = searchTerm.trim().toLowerCase()
      const matchesSearch = !normalizedSearchTerm
        ? true
        : Object.values(item).some(
            (value) =>
              value &&
              value.toString().toLowerCase().includes(normalizedSearchTerm)
          )

      const matchesAdvanced = Object.entries(advancedSearchParams).every(
        ([key, value]) => {
          if (!value) return true
          const itemValue = item[key]?.toString().toLowerCase() || ""
          return itemValue.includes(value.toLowerCase())
        }
      )

      return matchesSearch && matchesAdvanced
    })
  }, [data, searchTerm, advancedSearchParams])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      }

      const aStr = aVal.toString().toLowerCase()
      const bStr = bVal.toString().toLowerCase()

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }, [filteredData, sortColumn, sortDirection])

  // Pagination
  const totalItems = sortedData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = sortedData.slice(startIndex, endIndex)

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else {
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection("asc")
    }
  }

  const handleAdvancedSearch = (params: Record<string, string>) => {
    setAdvancedSearchParams(params)
    setCurrentPage(1)
  }

  const performExport = (type: "excel" | "pdf" | "csv" | "print") => {
    const exportColumns = columns.map((col) => ({
      key: col.key,
      title: col.label,
    }))

    const exportOptions = {
      filename: `${exportFilenameTitle}_Export_${new Date().toISOString().split("T")[0]}`,
      title: `${normalizedTitle} Report`,
      description: `Official administrative register export generated on ${new Date().toLocaleDateString()}`,
      columns: exportColumns,
      orientation: "landscape" as const,
      data: sortedData,
    }

    try {
      if (type === "excel") {
        ExportService.exportToExcel(sortedData, exportOptions)
        toast.success("Excel export downloaded successfully!")
      } else if (type === "pdf") {
        ExportService.exportToPDF(sortedData, exportOptions)
        toast.success("PDF export opened in new window.")
      } else if (type === "csv") {
        ExportService.exportToCSV(sortedData, exportOptions)
        toast.success("CSV export downloaded successfully!")
      } else if (type === "print") {
        ExportService.printData(sortedData, exportOptions)
        toast.success("Print dialog opened!")
      }
    } catch (error) {
      toast.error("Export failed. Please try again.")
      console.error("Export error:", error)
    }
  }

  const handleExport = () => performExport("csv")

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, advancedSearchParams])

  return (
    <div className="space-y-4 px-0 py-2">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder={`Search ${normalizedTitleLower}...`}
              className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-[#008751] focus:border-[#008751] text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {extraSearchControls && (
            <div className="flex flex-wrap items-center gap-2">
              {extraSearchControls}
            </div>
          )}
        </div>

        <div className="flex w-full sm:w-auto flex-wrap items-center justify-end gap-2">
          <AdvancedSearch
            onSearch={handleAdvancedSearch}
            fields={searchFields}
            title={normalizedTitle}
          />

          <Button
            variant="outline"
            onClick={onExport ?? handleExport}
            type="button"
            className={`${buttonHoverEnhancements} gap-1.5 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 w-full sm:w-auto rounded-lg shadow-2xs font-medium`}
          >
            <Download className="h-4 w-4 text-slate-500" />
            {exportLabel ?? "Export"}
          </Button>

          {onAdd && (
            <>
              {(() => {
                const { className: addButtonClassName, disabled: addButtonDisabled, ...restAddButtonProps } =
                  addButtonProps ?? {}
                const buttonDisabled = (addButtonDisabled ?? false) || addButtonLoading

                return (
                  <>
                    {addButtonExtra}
                    <Button
                      onClick={onAdd}
                      className={cn(
                        "gap-1.5 bg-[#008751] hover:bg-[#007647] text-white font-semibold rounded-lg shadow-xs hover:shadow transition-all",
                        addButtonClassName
                      )}
                      {...restAddButtonProps}
                      disabled={buttonDisabled}
                    >
                      {addButtonLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Plus className="h-4 w-4" />
                      {addButtonLoading ? "Processing..." : addButtonLabel ?? "Add New"}
                    </Button>
                  </>
                )
              })()}
            </>
          )}
        </div>
      </div>

      {/* Modern Card Table Wrapper */}
      <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div
          className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
        >
          <Table className={cn("min-w-[980px] table-auto", tableClassName)}>
            <TableHeader>
              <TableRow className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="whitespace-nowrap py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
                          aria-label={`Sort by ${column.label}`}
                        >
                          {sortColumn === column.key ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-[#008751]" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-[#008751]" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-slate-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={`skeleton-${index}-${colIndex}`} className="py-4 px-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-16 text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                        <Inbox className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        No records found
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        {searchTerm
                          ? `No results matching "${searchTerm}". Try a different keyword.`
                          : "There are no entries currently in this register."}
                      </p>
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchTerm("")}
                          className="text-xs text-[#008751] hover:text-[#007647]"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    className="hover:bg-emerald-50/20 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`${row.id || index}-${column.key}`}
                        className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300 text-sm font-normal"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key] ?? "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info & pagination */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 gap-2">
            <div>
              Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{endIndex}</span> of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> {normalizedTitleLower}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>
                <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2 text-xs"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
