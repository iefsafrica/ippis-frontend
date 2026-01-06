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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { DataExportMenu } from "@/app/admin/components/data-export-menu"
import { AdvancedSearch } from "@/app/admin/components/advanced-search"

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
  onAdd: () => void
  itemsPerPage?: number
}

export function DataTable({
  title,
  columns,
  data,
  searchFields,
  onAdd,
  itemsPerPage = 100, // Default to 100 as requested
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
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
    if (!searchTerm) return data

    return data.filter((item) => {
      return Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      )
    })
  }, [data, searchTerm])

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
      setSortDirection("asc")
    }
    // Reset to first page when sorting
    setCurrentPage(1)
  }

  const handleAdvancedSearch = (params: any) => {
    console.log("Advanced search params:", params)
    // Reset to first page after search
    setCurrentPage(1)
  }

  const handleExportPDF = () => {
    console.log("Exporting to PDF")
  }

  const handleExportCSV = () => {
    console.log("Exporting to CSV")
  }

  const handlePrint = () => {
    window.print()
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Generate page numbers for display - simple version like in the image
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    const pages = []
    if (currentPage <= 3) {
      // Show first 4 pages and last page
      pages.push(1, 2, 3, 4, '...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Show first page and last 4 pages
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      // Show first page, current-1, current, current+1, last page
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
    
    return pages
  }

  return (
    <div className="space-y-4 px-4 py-4">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder={`Search ${title.toLowerCase()}...`}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AdvancedSearch
            onSearch={handleAdvancedSearch}
            fields={searchFields}
            title={title}
          />

          <DataExportMenu
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            onPrint={handlePrint}
            title={title}
          />

          <Button
            onClick={onAdd}
            className="gap-1 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              {columns.map((column) => (
                <TableHead key={column.key} className="whitespace-nowrap py-3">
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
                    <TableCell key={`${row.id || index}-${column.key}`} className="py-3">
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

      {/* Clean Pagination - Like in the image */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-3">
          {/* Showing text - exactly like the image */}
          <div className="text-sm text-gray-600">
            Showing {Math.min(indexOfFirstItem + 1, totalItems)}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} {title.toLowerCase()}
          </div>
          
          {/* Navigation Controls - Simple and clean */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page Numbers - Clean and simple */}
              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map((page, index) => (
                  <div key={index}>
                    {page === "..." ? (
                      <span className="px-1.5 py-0.5 text-gray-400">...</span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(page as number)}
                        className={`h-8 min-w-8 px-0 text-sm ${
                          currentPage === page 
                            ? 'bg-gray-100 text-gray-900 font-medium' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Next Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}