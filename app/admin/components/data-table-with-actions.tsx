// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Pagination } from "@/app/admin/components/pagination"
// import {
//   Search,
//   Plus,
//   FileText,
//   Download,
//   Printer,
//   MoreHorizontal,
//   Edit,
//   Trash2,
//   Eye,
//   Filter,
//   X,
//   ChevronDown,
// } from "lucide-react"

// interface DataTableProps<T> {
//   title: string
//   description?: string
//   data: T[]
//   columns: {
//     key: keyof T | string
//     title: string
//     render?: (row: T) => React.ReactNode
//     sortable?: boolean
//     filterable?: boolean
//     hidden?: boolean
//   }[]
//   actions?: {
//     view?: boolean
//     edit?: boolean
//     delete?: boolean
//     custom?: {
//       name: string
//       icon: React.ReactNode
//       onClick: (row: T) => void
//     }[]
//   }
//   onAdd?: () => void
//   onEdit?: (row: T) => void
//   onDelete?: (row: T) => void
//   onView?: (row: T) => void
//   onExportCSV?: () => void
//   onExportPDF?: () => void
//   onPrint?: () => void
//   filterOptions?: {
//     key: keyof T
//     label: string
//     options: { label: string; value: string }[]
//   }[]
//   searchPlaceholder?: string
//   emptyStateMessage?: string
//   loading?: boolean
// }

// export function DataTableWithActions<T extends { id: string | number }>({
//   title,
//   description,
//   data,
//   columns,
//   actions = { view: true, edit: true, delete: true },
//   onAdd,
//   onEdit,
//   onDelete,
//   onView,
//   onExportCSV,
//   onExportPDF,
//   onPrint,
//   filterOptions,
//   searchPlaceholder = "Search...",
//   emptyStateMessage = "No records found",
//   loading = false,
// }: DataTableProps<T>) {
//   const [filteredData, setFilteredData] = useState<T[]>(data)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(100)
//   const [sortConfig, setSortConfig] = useState<{ key: keyof T | string; direction: "asc" | "desc" } | null>(null)
//   const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
//   const [isFilterOpen, setIsFilterOpen] = useState(false)

//   // Apply search, sort, and filters
//   useEffect(() => {
//     let result = [...data]

//     // Apply search
//     if (searchTerm) {
//       result = result.filter((item) =>
//         Object.entries(item).some(([key, value]) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
//       )
//     }

//     // Apply filters
//     Object.entries(activeFilters).forEach(([key, value]) => {
//       if (value) {
//         result = result.filter((item) => String(item[key as keyof T]).toLowerCase() === value.toLowerCase())
//       }
//     })

//     // Apply sort
//     if (sortConfig) {
//       result.sort((a, b) => {
//         const aValue = a[sortConfig.key as keyof T]
//         const bValue = b[sortConfig.key as keyof T]

//         if (aValue < bValue) {
//           return sortConfig.direction === "asc" ? -1 : 1
//         }
//         if (aValue > bValue) {
//           return sortConfig.direction === "asc" ? 1 : -1
//         }
//         return 0
//       })
//     }

//     setFilteredData(result)
//   }, [data, searchTerm, sortConfig, activeFilters])

//   // Pagination
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

//   // Sorting
//   const handleSort = (key: keyof T | string) => {
//     let direction: "asc" | "desc" = "asc"

//     if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc"
//     }

//     setSortConfig({ key, direction })
//   }

//   // Filtering
//   const handleFilterChange = (key: string, value: string) => {
//     setActiveFilters((prev) => ({
//       ...prev,
//       [key]: value,
//     }))
//   }

//   const clearFilter = (key: string) => {
//     setActiveFilters((prev) => {
//       const newFilters = { ...prev }
//       delete newFilters[key]
//       return newFilters
//     })
//   }

//   const clearAllFilters = () => {
//     setActiveFilters({})
//     setSearchTerm("")
//   }

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <CardTitle>{title}</CardTitle>
//             {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
//           </div>
//           <div className="flex flex-col sm:flex-row gap-2">
//             {onAdd && (
//               <Button onClick={onAdd} size="sm">
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add New
//               </Button>
//             )}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm">
//                   <Download className="h-4 w-4 mr-2" />
//                   Export
//                   <ChevronDown className="h-4 w-4 ml-2" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 {onExportCSV && (
//                   <DropdownMenuItem onClick={onExportCSV}>
//                     <FileText className="h-4 w-4 mr-2" />
//                     Export to CSV
//                   </DropdownMenuItem>
//                 )}
//                 {onExportPDF && (
//                   <DropdownMenuItem onClick={onExportPDF}>
//                     <FileText className="h-4 w-4 mr-2" />
//                     Export to PDF
//                   </DropdownMenuItem>
//                 )}
//                 {onPrint && (
//                   <DropdownMenuItem onClick={onPrint}>
//                     <Printer className="h-4 w-4 mr-2" />
//                     Print
//                   </DropdownMenuItem>
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex flex-col sm:flex-row gap-4 justify-between">
//             <div className="relative w-full sm:max-w-xs">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder={searchPlaceholder}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-8"
//               />
//             </div>
//             {filterOptions && filterOptions.length > 0 && (
//               <div className="flex gap-2">
//                 <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
//                   <Filter className="h-4 w-4 mr-2" />
//                   Filter
//                 </Button>
//                 {Object.keys(activeFilters).length > 0 && (
//                   <Button variant="ghost" size="sm" onClick={clearAllFilters}>
//                     <X className="h-4 w-4 mr-2" />
//                     Clear All
//                   </Button>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Active filters */}
//           {Object.keys(activeFilters).length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {Object.entries(activeFilters).map(([key, value]) => {
//                 const filterOption = filterOptions?.find((option) => option.key === key)
//                 const filterLabel = filterOption?.label || key
//                 const valueLabel = filterOption?.options.find((opt) => opt.value === value)?.label || value

//                 return (
//                   <Badge key={key} variant="secondary" className="flex items-center gap-1">
//                     {filterLabel}: {valueLabel}
//                     <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter(key)} />
//                   </Badge>
//                 )
//               })}
//             </div>
//           )}

//           {/* Filter panel */}
//           {isFilterOpen && filterOptions && (
//             <div className="bg-muted p-4 rounded-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//               {filterOptions.map((filter) => (
//                 <div key={String(filter.key)} className="space-y-2">
//                   <label className="text-sm font-medium">{filter.label}</label>
//                   <Select
//                     value={activeFilters[filter.key as string] || ""}
//                     onValueChange={(value) => handleFilterChange(filter.key as string, value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select..." />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All</SelectItem>
//                       {filter.options.map((option) => (
//                         <SelectItem key={option.value} value={option.value}>
//                           {option.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Table */}
//           <div className="rounded-md border overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   {columns
//                     .filter((column) => !column.hidden)
//                     .map((column) => (
//                       <TableHead
//                         key={String(column.key)}
//                         className={column.sortable ? "cursor-pointer select-none" : ""}
//                         onClick={() => column.sortable && handleSort(column.key)}
//                       >
//                         <div className="flex items-center">
//                           {column.title}
//                           {sortConfig && sortConfig.key === column.key && (
//                             <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
//                           )}
//                         </div>
//                       </TableHead>
//                     ))}
//                   {(actions.view ||
//                     actions.edit ||
//                     actions.delete ||
//                     (actions.custom && actions.custom.length > 0)) && (
//                     <TableHead className="text-right">Actions</TableHead>
//                   )}
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {loading ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.filter((c) => !c.hidden).length + (actions ? 1 : 0)}
//                       className="h-24 text-center"
//                     >
//                       Loading...
//                     </TableCell>
//                   </TableRow>
//                 ) : paginatedData.length === 0 ? (
//                   <TableRow>
//                     <TableCell
//                       colSpan={columns.filter((c) => !c.hidden).length + (actions ? 1 : 0)}
//                       className="h-24 text-center"
//                     >
//                       {emptyStateMessage}
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   paginatedData.map((row) => (
//                     <TableRow key={String(row.id)}>
//                       {columns
//                         .filter((column) => !column.hidden)
//                         .map((column) => (
//                           <TableCell key={`${row.id}-${String(column.key)}`}>
//                             {column.render ? column.render(row) : String(row[column.key as keyof T] || "")}
//                           </TableCell>
//                         ))}
//                       {(actions.view ||
//                         actions.edit ||
//                         actions.delete ||
//                         (actions.custom && actions.custom.length > 0)) && (
//                         <TableCell className="text-right">
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" size="sm">
//                                 <MoreHorizontal className="h-4 w-4" />
//                                 <span className="sr-only">Open menu</span>
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               {actions.view && onView && (
//                                 <DropdownMenuItem onClick={() => onView(row)}>
//                                   <Eye className="h-4 w-4 mr-2" />
//                                   View
//                                 </DropdownMenuItem>
//                               )}
//                               {actions.edit && onEdit && (
//                                 <DropdownMenuItem onClick={() => onEdit(row)}>
//                                   <Edit className="h-4 w-4 mr-2" />
//                                   Edit
//                                 </DropdownMenuItem>
//                               )}
//                               {actions.delete && onDelete && (
//                                 <DropdownMenuItem
//                                   onClick={() => onDelete(row)}
//                                   className="text-destructive focus:text-destructive"
//                                 >
//                                   <Trash2 className="h-4 w-4 mr-2" />
//                                   Delete
//                                 </DropdownMenuItem>
//                               )}
//                               {actions.custom &&
//                                 actions.custom.map((action) => (
//                                   <DropdownMenuItem key={action.name} onClick={() => action.onClick(row)}>
//                                     {action.icon}
//                                     {action.name}
//                                   </DropdownMenuItem>
//                                 ))}
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </TableCell>
//                       )}
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {/* Pagination */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <p className="text-sm text-muted-foreground">
//                 Showing {filteredData.length > 0 ? startIndex + 1 : 0} to{" "}
//                 {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
//               </p>
//               <Select
//                 value={String(itemsPerPage)}
//                 onValueChange={(value) => {
//                   setItemsPerPage(Number(value))
//                   setCurrentPage(1)
//                 }}
//               >
//                 <SelectTrigger className="w-[100px]">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="10">10 rows</SelectItem>
//                   <SelectItem value="25">25 rows</SelectItem>
//                   <SelectItem value="50">50 rows</SelectItem>
//                   <SelectItem value="100">100 rows</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
