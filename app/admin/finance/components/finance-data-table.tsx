"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Eye,
  Download,
  Printer,
  FileText,
  Filter,
  ChevronDown,
  X,
  ArrowUpDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import ExportService from "@/app/admin/services/export-service"
import { toast } from "sonner"

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
  type: "select" | "date" | "checkbox" | "number-range"
}

interface FinanceDataTableProps {
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
  onApprove?: (id: string) => void
  isLoading?: boolean
  currencySymbol?: string
  showTotals?: boolean
  totalFields?: string[]
  showAddButton?: boolean
  addButtonExtra?: React.ReactNode
}

export function FinanceDataTable({
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
  onApprove,
  isLoading = false,
  currencySymbol = "$",
  showTotals = false,
  totalFields = [],
  showAddButton = true,
  addButtonExtra,
  // currentRows,
  // handlePrev,
  // handleNext,
}: FinanceDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter data based on search term and active filters
  const filteredData = data.filter((item) => {
    // Search term filter
    const matchesSearch =
      !searchTerm ||
      Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Active filters
    const matchesFilters = Object.entries(activeFilters).every(
      ([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return true;

        const filterOption = filterOptions.find((option) => option.id === key);
        if (!filterOption) return true;

        if (filterOption.type === "select") {
          return item[key] === value;
        } else if (filterOption.type === "date") {
          const itemDate = new Date(item[key]);
          const filterDate = new Date(value);
          return itemDate.toDateString() === filterDate.toDateString();
        } else if (filterOption.type === "checkbox" && Array.isArray(value)) {
          return value.includes(item[key]);
        } else if (
          filterOption.type === "number-range" &&
          typeof value === "object"
        ) {
          const itemValue = Number(item[key]);
          const { min, max } = value;
          if (min !== undefined && max !== undefined) {
            return itemValue >= min && itemValue <= max;
          } else if (min !== undefined) {
            return itemValue >= min;
          } else if (max !== undefined) {
            return itemValue <= max;
          }
        }

        return true;
      }
    );

    return matchesSearch && matchesFilters;
  });

  // Sort data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Paginate data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Calculate totals for specified fields
  const totals = showTotals
    ? totalFields.reduce((acc, field) => {
        acc[field] = filteredData.reduce(
          (sum, item) => sum + (Number(item[field]) || 0),
          0
        );
        return acc;
      }, {} as Record<string, number>)
    : {};

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportPDF = () => {
    try {
      const exportColumns = columns.map((col) => ({
        header: col.label,
        accessor: col.key,
      }))

      ExportService.exportToPDF(sortedData, {
        title,
        filename: `${title.replace(/\s+/g, "_")}_export`,
        columns: exportColumns,
      })

      toast.success("PDF downloaded successfully")
    } catch (error) {
      console.error("PDF export error:", error)
      toast.error("Failed to export PDF")
    }
  };

  const handleExportCSV = () => {
    try {
      const exportColumns = columns.map((col) => ({
        header: col.label,
        accessor: col.key,
      }))

      ExportService.exportToCSV(sortedData, {
        title,
        filename: `${title.replace(/\s+/g, "_")}_export`,
        columns: exportColumns,
      })

      toast.success("CSV export downloaded successfully")
    } catch (error) {
      console.error("CSV export error:", error)
      toast.error("Failed to export CSV")
    }
  };

  const handlePrint = () => {
    try {
      const exportColumns = columns.map((col) => ({
        header: col.label,
        accessor: col.key,
      }))

      ExportService.printData(sortedData, {
        title,
        filename: `${title.replace(/\s+/g, "_")}_export`,
        columns: exportColumns,
      })
    } catch (error) {
      console.error("Print export error:", error)
      toast.error("Failed to open print dialog")
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const executeDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const clearFilter = (filterId: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const renderFilterBadges = () => {
    return Object.entries(activeFilters).map(([key, value]) => {
      const filterOption = filterOptions.find((option) => option.id === key);
      if (!filterOption) return null;

      let displayValue = value;

      if (filterOption.type === "select") {
        const option = filterOption.options.find((opt) => opt.value === value);
        displayValue = option?.label || value;
      } else if (filterOption.type === "date") {
        displayValue = format(new Date(value), "PPP");
      } else if (filterOption.type === "checkbox" && Array.isArray(value)) {
          displayValue = value
          .map((v: any) => {
            const option = filterOption.options.find((opt) => opt.value === v);
            return option?.label || v;
          })
          .join(", ");
      } else if (
        filterOption.type === "number-range" &&
        typeof value === "object"
      ) {
        const { min, max } = value;
        if (min !== undefined && max !== undefined) {
          displayValue = `${min} - ${max}`;
        } else if (min !== undefined) {
          displayValue = `≥ ${min}`;
        } else if (max !== undefined) {
          displayValue = `≤ ${max}`;
        }
      }

      return (
        <Badge
          key={key}
          variant="outline"
          className="flex items-center gap-1 bg-blue-50"
        >
          <span>
            {filterOption.label}: {displayValue}
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
      );
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
    })
      .format(value)
      .replace("$", currencySymbol);
  };

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
            {filterOptions.length > 0 && (
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

                          {filter.type === "select" && (
                            <Select
                              value={activeFilters[filter.id] || ""}
                              onValueChange={(value) =>
                                handleFilterChange(filter.id, value)
                              }
                            >
                              <SelectTrigger id={filter.id}>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {filter.options.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {filter.type === "date" && (
                            <div className="border rounded-md p-1">
                              <Calendar
                                mode="single"
                                selected={
                                  activeFilters[filter.id]
                                    ? new Date(activeFilters[filter.id])
                                    : undefined
                                }
                                onSelect={(date) =>
                                  handleFilterChange(filter.id, date)
                                }
                                className="rounded-md border"
                              />
                            </div>
                          )}

                          {filter.type === "checkbox" && (
                            <div className="space-y-2">
                              {filter.options.map((option) => (
                                <div
                                  key={option.value}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`${filter.id}-${option.value}`}
                                    checked={
                                      Array.isArray(activeFilters[filter.id]) &&
                                      activeFilters[filter.id]?.includes(
                                        option.value
                                      )
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentValues = Array.isArray(
                                        activeFilters[filter.id]
                                      )
                                        ? activeFilters[filter.id]
                                        : [];

                                      if (checked) {
                                        handleFilterChange(filter.id, [
                                          ...currentValues,
                                          option.value,
                                        ]);
                                      } else {
                                        handleFilterChange(
                                          filter.id,
                                          currentValues.filter(
                                            (v: any) => v !== option.value
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`${filter.id}-${option.value}`}
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}

                          {filter.type === "number-range" && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Min"
                                value={
                                  activeFilters[filter.id] &&
                                  activeFilters[filter.id].min !== undefined
                                    ? activeFilters[filter.id].min
                                    : ""
                                }
                                onChange={(e) => {
                                  const min =
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value);
                                  const current =
                                    activeFilters[filter.id] || {};
                                  handleFilterChange(filter.id, {
                                    ...current,
                                    min,
                                  });
                                }}
                                className="w-1/2"
                              />
                              <span>to</span>
                              <Input
                                type="number"
                                placeholder="Max"
                                value={
                                  activeFilters[filter.id] &&
                                  activeFilters[filter.id].max !== undefined
                                    ? activeFilters[filter.id].max
                                    : ""
                                }
                                onChange={(e) => {
                                  const max =
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value);
                                  const current =
                                    activeFilters[filter.id] || {};
                                  handleFilterChange(filter.id, {
                                    ...current,
                                    max,
                                  });
                                }}
                                className="w-1/2"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                      >
                        Clear All
                      </Button>
                      <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleExportPDF}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportCSV}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handlePrint}
                  className="cursor-pointer"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {addButtonExtra}
            {showAddButton ? (
              <Button
                onClick={onAdd}
                className="gap-1 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            ) : null}
          </div>
        </div>

        {/* Active filters display */}
        {Object.keys(activeFilters).length > 0 && (
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
        )}
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`whitespace-nowrap ${
                    column.width ? column.width : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSort(column.key)}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        <span className="sr-only">Sort by {column.label}</span>
                      </Button>
                    )}
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
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-8 text-gray-500"
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((row) => {
                const isApproved = String(row?.status ?? "").toLowerCase() === "approved"

                return (
                  <TableRow key={row.id} className="group">
                    {columns.map((column) => (
                      <TableCell key={`${row.id}-${column.key}`}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
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
                          disabled={isApproved}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        {onChangeStatus && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onChangeStatus(row.id)}
                            disabled={isApproved}
                            className="h-8 w-8 text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Change status</span>
                          </Button>
                        )}
                        {onApprove && !isApproved && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onApprove(row.id)}
                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => confirmDelete(row.id)}
                          disabled={isApproved}
                          className="h-8 w-8 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}

            {/* Totals row */}
            {showTotals && Object.keys(totals).length > 0 && (
              <TableRow className="font-medium bg-gray-50">
                {columns.map((column) => (
                  <TableCell key={`total-${column.key}`}>
                    {totalFields.includes(column.key)
                      ? column.render
                        ? column.render(totals[column.key], { id: "total" })
                        : formatCurrency(totals[column.key])
                      : column.key === "description"
                      ? "Total"
                      : null}
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {sortedData.length > 0 && (
        <div className="px-1 py-3 text-sm text-gray-600">
          Showing {sortedData.length} {title.toLowerCase()}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              return (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  className={page === currentPage ? "bg-green-300" : ""}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setItemToDelete(null)
        }}
        onConfirm={async () => {
          executeDelete()
        }}
        title={`Delete ${title}`}
        description={`Are you sure you want to delete this ${title.toLowerCase().replace(/s$/, "")}?`}
        itemName={itemToDelete ? `${title.slice(0, -1)} ${itemToDelete}` : title}
      />
    </div>
  );
}
