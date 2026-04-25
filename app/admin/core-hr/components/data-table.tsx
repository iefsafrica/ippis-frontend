// "use client"

// import type React from "react"
// import { useState } from "react"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"

// import { Search, Plus } from "lucide-react"
// import { Pagination } from "@/app/admin/components/pagination"
// import { DataExportMenu } from "@/app/admin/components/data-export-menu"
// import { AdvancedSearch } from "@/app/admin/components/advanced-search"

// interface DataTableProps {
//   title: string
//   columns: {
//     key: string
//     label: string
//     sortable?: boolean
//     render?: (value: any, row: any) => React.ReactNode
//   }[]
//   data: any[]
//   searchFields: Array<{
//     name: string
//     label: string
//     type: "text" | "select" | "date"
//     options?: Array<{ value: string; label: string }>
//   }>
//   onAdd: () => void
// }

// export function DataTable({
//   title,
//   columns,
//   data,
//   searchFields,
//   onAdd,
// }: DataTableProps) {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage] = useState(10)
//   const [sortColumn, setSortColumn] = useState<string | null>(null)
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

//   // Filter data
//   const filteredData = data.filter((item) => {
//     if (!searchTerm) return true

//     return Object.values(item).some(
//       (value) =>
//         value &&
//         value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
//     )
//   })

//   // Sort data
//   const sortedData = sortColumn
//     ? [...filteredData].sort((a, b) => {
//         const aValue = a[sortColumn]
//         const bValue = b[sortColumn]

//         if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
//         if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
//         return 0
//       })
//     : filteredData

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage
//   const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)
//   const totalPages = Math.ceil(sortedData.length / itemsPerPage)

//   const handleSort = (column: string) => {
//     if (sortColumn === column) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc")
//     } else {
//       setSortColumn(column)
//       setSortDirection("asc")
//     }
//   }

//   const handleAdvancedSearch = (params: any) => {
//     console.log("Advanced search params:", params)
//   }

//   const handleExportPDF = () => {
//     console.log("Exporting to PDF")
//   }

//   const handleExportCSV = () => {
//     console.log("Exporting to CSV")
//   }

//   const handlePrint = () => {
//     window.print()
//   }

//   return (
//     <div className="space-y-4">
//       {/* Top controls */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="relative w-full sm:w-64">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
//           <Input
//             type="search"
//             placeholder={`Search ${title.toLowerCase()}...`}
//             className="pl-8"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <AdvancedSearch
//             onSearch={handleAdvancedSearch}
//             fields={searchFields}
//             title={title}
//           />

//           <DataExportMenu
//             onExportPDF={handleExportPDF}
//             onExportCSV={handleExportCSV}
//             onPrint={handlePrint}
//             title={title}
//           />

//           <Button
//             onClick={onAdd}
//             className="gap-1 bg-green-600 hover:bg-green-700"
//           >
//             <Plus className="h-4 w-4" />
//             Add New
//           </Button>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="rounded-md border bg-white">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               {columns.map((column) => (
//                 <TableHead key={column.key} className="whitespace-nowrap">
//                   <div className="flex items-center gap-1">
//                     {column.label}
//                     {column.sortable && (
//                       <button
//                         onClick={() => handleSort(column.key)}
//                         className="p-1 hover:bg-gray-100 rounded"
//                       >
//                         {sortColumn === column.key
//                           ? sortDirection === "asc"
//                             ? "↑"
//                             : "↓"
//                           : "↕"}
//                       </button>
//                     )}
//                   </div>
//                 </TableHead>
//               ))}
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {currentItems.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="text-center py-8 text-gray-500"
//                 >
//                   No records found
//                 </TableCell>
//               </TableRow>
//             ) : (
//               currentItems.map((row) => (
//                 <TableRow key={row.id}>
//                   {columns.map((column) => (
//                     <TableCell key={`${row.id}-${column.key}`}>
//                       {column.render
//                         ? column.render(row[column.key], row)
//                         : row[column.key]}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-center mt-4">
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={setCurrentPage}
//           />
//         </div>
//       )}
//     </div>
//   )
// }



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
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, Download } from "lucide-react"
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
  itemsPerPage = 1000, // Display 1000 items per page
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
  // Simulate loading state (remove in production)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)
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
              value.toString().toLowerCase().includes(normalizedSearchTerm),
          )

      const matchesAdvancedSearch = Object.entries(advancedSearchParams).every(([key, rawValue]) => {
        const queryValue = rawValue?.toString().toLowerCase().trim()
        if (!queryValue) return true

        const itemValue = item?.[key]
        if (itemValue == null) return false

        if (typeof itemValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(queryValue)) {
          const dateCandidate = itemValue.slice(0, 10)
          return dateCandidate === queryValue
        }

        return itemValue.toString().toLowerCase().includes(queryValue)
      })

      return matchesSearch && matchesAdvancedSearch
    })
  }, [data, searchTerm, advancedSearchParams])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      // Handle null/undefined values
      if (aValue == null) return sortDirection === "asc" ? -1 : 1
      if (bValue == null) return sortDirection === "asc" ? 1 : -1

      // Handle different types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  // Calculate pagination values
  const totalItems = sortedData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  // Get current items
  const currentItems = useMemo(() => {
    return sortedData.slice(indexOfFirstItem, indexOfLastItem)
  }, [sortedData, indexOfFirstItem, indexOfLastItem])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection(defaultSortDirection)
    }
    // Reset to first page when sorting
    setCurrentPage(1)
  }

  const handleAdvancedSearch = (params: any) => {
    setAdvancedSearchParams(params || {})
    // Reset to first page after search
    setCurrentPage(1)
  }

    const performExport = (type: 'pdf' | 'csv' | 'print') => {
      try {
        const exportColumns = columns.map((col) => ({
          header: col.label,
          accessor: col.key,
        }))

        const exportOptions = {
          title: normalizedTitle,
          filename: `${exportFilenameTitle}_export`,
          columns: exportColumns,
        }

        if (type === 'pdf') {
          ExportService.exportToPDF(sortedData, exportOptions)
          toast.success("PDF export opened in new window. Use your browser's print dialog to save as PDF!")
        } else if (type === 'csv') {
          ExportService.exportToCSV(sortedData, exportOptions)
          toast.success("CSV export downloaded successfully!")
        } else if (type === 'print') {
          ExportService.printData(sortedData, exportOptions)
          toast.success("Print dialog opened!")
        }
      } catch (error) {
        toast.error("Export failed. Please try again.")
        console.error("Export error:", error)
      }
    }

    const handleExport = () => performExport('csv')



  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, advancedSearchParams])



  return (
    <div className="space-y-4 px-0 sm:px-4 py-4">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder={`Search ${normalizedTitleLower}...`}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {extraSearchControls && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {extraSearchControls}
            </div>
          )}
        </div>

        <div className="flex w-full sm:w-auto flex-wrap items-center justify-end gap-2 sm:gap-3">
          <AdvancedSearch
            onSearch={handleAdvancedSearch}
            fields={searchFields}
            title={normalizedTitle}
          />

          <Button
            variant="outline"
            onClick={onExport ?? handleExport}
            type="button"
            className={`${buttonHoverEnhancements} gap-1 w-full sm:w-auto`}
          >
            <Download className="h-4 w-4" />
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
                      className={cn("gap-1 bg-green-600 hover:bg-green-700", addButtonClassName)}
                      {...restAddButtonProps}
                      disabled={buttonDisabled}
                    >
                      {addButtonLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Plus className="h-4 w-4" />
                      {addButtonLoading
                        ? "Processing..."
                        : addButtonLabel ?? "Add New"}
                    </Button>
                  </>
                )
              })()}
            </>
          )}
        </div>
      </div>

      {/* Data list */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div
          className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
        >
        <Table className={cn("min-w-[980px] table-auto", tableClassName)}>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              {columns.map((column) => (
                <TableHead key={column.key} className="whitespace-nowrap py-3 hover:bg-gray-100/80 transition-colors">
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        aria-label={`Sort by ${column.label}`}
                      >
                        {sortColumn === column.key ? (
                          sortDirection === "asc" ? (
                            <span className="text-blue-600">↑</span>
                          ) : (
                            <span className="text-blue-600">↓</span>
                          )
                        ) : (
                          <span className="text-gray-400">↕</span>
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
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="hover:bg-gray-50/50">
                  {columns.map((column, colIndex) => (
                    <TableCell key={`skeleton-${index}-${colIndex}`} className="py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-lg font-medium mb-2">No records found</div>
                    <div className="text-sm text-gray-400">
                      Try adjusting your search or filter
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((row, index) => (
                <TableRow key={row.id || index} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((column) => (
                    <TableCell key={`${row.id || index}-${column.key}`} className="py-3 whitespace-nowrap">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Display total items */}
      {totalItems > 0 && (
        <div className="text-sm text-gray-600 px-1 py-3">
          Showing {totalItems} {normalizedTitleLower}
        </div>
      )}

    </div>
  )
}
