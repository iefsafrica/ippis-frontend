"use client"

import type React from "react"
import { useState } from "react"

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

import { Search, Plus } from "lucide-react"
import { Pagination } from "@/app/admin/components/pagination"
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
}

export function DataTable({
  title,
  columns,
  data,
  searchFields,
  onAdd,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Filter data
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true

    return Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )
  })

  // Sort data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    : filteredData

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleAdvancedSearch = (params: any) => {
    console.log("Advanced search params:", params)
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

  return (
    <div className="space-y-4">
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
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {sortColumn === column.key
                          ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </button>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-500"
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.key}`}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
