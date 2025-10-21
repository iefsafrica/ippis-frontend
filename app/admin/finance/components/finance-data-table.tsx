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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
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
import { Pagination } from "@/app/admin/components/pagination"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

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
  isLoading?: boolean
  currencySymbol?: string
  showTotals?: boolean
  totalFields?: string[]
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
  isLoading = false,
  currencySymbol = "$",
  showTotals = false,
  totalFields = [],
  // currentRows,
  // handlePrev,
  // handleNext,
}: FinanceDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
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
    console.log(
      "Exporting to PDF:",
      selectedRows.length ? selectedRows : "all data"
    );
    // Implement PDF export logic
  };

  const handleExportCSV = () => {
    console.log(
      "Exporting to CSV:",
      selectedRows.length ? selectedRows : "all data"
    );
    // Implement CSV export logic
  };

  const handlePrint = () => {
    console.log("Printing:", selectedRows.length ? selectedRows : "all data");
    window.print();
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

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === currentItems.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentItems.map((item) => item.id));
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
          .map((v) => {
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
                                            (v) => v !== option.value
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
                  Export to PDF
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

            <Button
              onClick={onAdd}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add New
            </Button>
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
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selectedRows.length === currentItems.length &&
                    currentItems.length > 0
                  }
                  onCheckedChange={handleSelectAllRows}
                  aria-label="Select all rows"
                />
              </TableHead>
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
                  <TableCell>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
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
                  colSpan={columns.length + 2}
                  className="text-center py-8 text-gray-500"
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((row) => (
                <TableRow key={row.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onCheckedChange={() => handleSelectRow(row.id)}
                      aria-label={`Select row ${row.id}`}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.key}`}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(row.id)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(row.id)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onView(row.id)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEdit(row.id)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => confirmDelete(row.id)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}

            {/* Totals row */}
            {showTotals && Object.keys(totals).length > 0 && (
              <TableRow className="font-medium bg-gray-50">
                <TableCell>
                  <div className="h-4 w-4" />
                </TableCell>
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

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            {/* Item range + per-page selector */}
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                Showing 1 -
                50 of
                50 payer
              </p>

              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1); // Reset to page 1 when itemsPerPage changes
                }}
              >
                <SelectTrigger className="h-8 w-[110px]">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            // onClick={handlePrev}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {/* Dynamically render page numbers */}
          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
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
            );
          })}

          <Button
            variant="outline"
            size="sm"
            // onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
