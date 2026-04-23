"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Edit, RefreshCw, Trash2, Eye, Filter, ChevronDown, X, ArrowUpDown } from "lucide-react"

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  width?: string
}

interface FilterOption {
  id: string
  label: string
  options: { value: string; label: string }[]
}

interface FileManagerDataTableProps {
  title: string
  description?: string
  columns: Column[]
  data: any[]
  filterOptions?: FilterOption[]
  onAdd: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onChangeStatus?: (id: string) => void
  isLoading?: boolean
  showAddButton?: boolean
  defaultSortColumn?: string
  defaultSortDirection?: "asc" | "desc"
}

export function FileManagerDataTable({
  title,
  description,
  columns,
  data,
  filterOptions = [],
  onAdd,
  onEdit,
  onDelete,
  onView,
  onChangeStatus,
  isLoading = false,
  showAddButton = true,
  defaultSortColumn,
  defaultSortDirection = "asc",
}: FileManagerDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn ?? null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeFilters])

  useEffect(() => {
    if (defaultSortColumn) {
      setSortColumn(defaultSortColumn)
      setSortDirection(defaultSortDirection)
    }
  }, [defaultSortColumn, defaultSortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
      return
    }

    setSortColumn(column)
    setSortDirection("asc")
  }

  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }))
  }

  const clearFilter = (filterId: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev }
      delete next[filterId]
      return next
    })
  }

  const clearAllFilters = () => setActiveFilters({})

  const filteredData = data.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      Object.values(item).some((value) => String(value ?? "").toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
      if (!value || value === "all") {
        return true
      }

      if (key === "folder_scope") {
        if (value === "root") return item.parent_id === null
        if (value === "nested") return item.parent_id !== null
      }

      return String(item[key] ?? "") === value
    })

    return matchesSearch && matchesFilters
  })

  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    : filteredData

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const renderFilterBadges = () => {
    return Object.entries(activeFilters).map(([key, value]) => {
      const filter = filterOptions.find((option) => option.id === key)
      if (!filter) {
        return null
      }

      const displayValue =
        filter.options.find((option) => option.value === value)?.label ??
        value.charAt(0).toUpperCase() + value.slice(1)

      return (
        <Badge key={key} variant="outline" className="flex items-center gap-1 bg-blue-50">
          <span>
            {filter.label}: {displayValue}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-blue-100"
            onClick={() => clearFilter(key)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
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
            {filterOptions.length > 0 ? (
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter {title}</h4>
                    <div className="space-y-4">
                      {filterOptions.map((filter) => (
                        <div key={filter.id} className="space-y-2">
                          <Label htmlFor={filter.id}>{filter.label}</Label>
                          <Select
                            value={activeFilters[filter.id] || "all"}
                            onValueChange={(value) => handleFilterChange(filter.id, value)}
                          >
                            <SelectTrigger id={filter.id}>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              {filter.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={clearAllFilters}>
                        Clear All
                      </Button>
                      <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ) : null}

            {showAddButton ? (
              <Button onClick={onAdd} className="gap-1 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            ) : null}
          </div>
        </div>

        {Object.keys(activeFilters).length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {renderFilterBadges()}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
              onClick={clearAllFilters}
            >
              Clear all filters
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`whitespace-nowrap ${column.width ? column.width : ""}`}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSort(column.key)}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        <span className="sr-only">Sort by {column.label}</span>
                      </Button>
                    ) : null}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={`loading-cell-${index}-${colIndex}`}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((row) => (
                <TableRow key={row.id} className="group">
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.key}`}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onView(row.id)}
                        className="h-8 w-8 text-gray-600 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(row.id)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      {onChangeStatus && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onChangeStatus(row.id)}
                          className="h-8 w-8 text-green-600 hover:bg-green-50"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="sr-only">Change status</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(row.id)}
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {sortedData.length > 0 ? (
        <div className="px-1 py-3 text-sm text-gray-600">
          Showing {sortedData.length} {title.toLowerCase()}
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1
              return (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  className={page === currentPage ? "bg-green-300" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
