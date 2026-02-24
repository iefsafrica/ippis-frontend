'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Pagination } from '@/app/admin/components/pagination';
import { DataExportMenu } from '@/app/admin/components/data-export-menu';
import { AdvancedSearch } from '@/app/admin/components/advanced-search';
import { Plus, Eye, ChevronUp, ChevronDown, RefreshCw, User, Building, Award, Calendar } from 'lucide-react';
import { AddPromotionDialog } from './add-promotion-dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TablePromotion } from '@/types/hr-core/promotion-management';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PromotionContentProps {
  promotions: TablePromotion[];
  isLoading: boolean;
  onAddPromotion: (promotion: any) => void;
  onDeletePromotion: (id: string) => void;
  onSearch: (searchParams: any) => void;
}

type SortField = 'employee' | 'employeeId' | 'company' | 'promotionTitle' | 'date' | 'id';
type SortDirection = 'asc' | 'desc';

// Extend TablePromotion to include promotionId
interface ExtendedTablePromotion extends TablePromotion {
  promotionId?: number;
}

export function PromotionContent({
  promotions,
  isLoading,
  onAddPromotion,
  onDeletePromotion,
  onSearch,
}: PromotionContentProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(
    null
  );
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleAddPromotion = async (promotionData: any) => {
    try {
      await onAddPromotion(promotionData);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedPromotionId) {
      const loadingToast = toast.loading("Deleting promotion...");
      const promotionIdNum = parseInt(selectedPromotionId, 10);
      if (!isNaN(promotionIdNum)) {
        try {
          onDeletePromotion(selectedPromotionId);
          toast.success("Promotion deleted successfully!", { id: loadingToast });
        } catch (error) {
          toast.error("Failed to delete promotion. Please try again.", { 
            id: loadingToast,
            duration: 4000,
          });
        }
      }
      setIsDeleteDialogOpen(false);
      setSelectedPromotionId(null);
    }
  };

  // Sort promotions based on selected field and direction
  const sortedPromotions = useMemo(() => {
    if (!promotions || promotions.length === 0) return [];
    
    const promotionsCopy = [...promotions] as ExtendedTablePromotion[];
    
    return promotionsCopy.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle ID sorting (using promotionId if available)
      if (sortField === 'id') {
        // Try to use promotionId if available, otherwise parse the string id
        aValue = a.promotionId || parseInt(a.id) || 0;
        bValue = b.promotionId || parseInt(b.id) || 0;
      }
      
      // Handle date sorting
      if (sortField === 'date') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        aValue = dateA.getTime();
        bValue = dateB.getTime();
      }
      
      // Handle string sorting (case insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        // For descending, we want larger values first
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [promotions, sortField, sortDirection]);

  const itemsPerPage = 50;
  const totalPages = Math.ceil(sortedPromotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPromotions = sortedPromotions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportPDF = () => {
    const loadingToast = toast.loading("Exporting to PDF...");
    setTimeout(() => {
      toast.success("Promotions data has been exported as PDF", { id: loadingToast });
    }, 1500);
  };

  const handleExportCSV = () => {
    const loadingToast = toast.loading("Exporting to CSV...");
    setTimeout(() => {
      toast.success("Promotions data has been exported as CSV", { id: loadingToast });
    }, 1500);
  };

  const handlePrint = () => {
    toast.info("Preparing promotions data for printing");
    window.print();
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPromotionId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (promotion: TablePromotion) => {
    router.push(`/admin/core-hr/promotions/${promotion.employeeId}`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const searchFields = [
    { name: 'employee', label: 'Employee', type: 'text' },
    { name: 'company', label: 'Company/Department', type: 'text' },
    { name: 'promotionTitle', label: 'Promotion Title', type: 'text' },
    { name: 'dateFrom', label: 'Date From', type: 'date' },
    { name: 'dateTo', label: 'Date To', type: 'date' },
  ];

  const handleSearch = (searchParams: any) => {
    const loadingToast = toast.loading("Searching promotions...");
    setTimeout(() => {
      toast.success("Search completed", { id: loadingToast });
      onSearch(searchParams);
    }, 1000);
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Calculate statistics (similar to resignations pattern)
  const totalCount = promotions.length;

  // Define columns with the same pattern as resignations
  const columns = [
    {
      key: "employee",
      label: "Employee",
      sortable: true,
      render: (value: string, row: any) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="ml-3 min-w-0">
                  <div className="font-medium text-gray-900 truncate max-w-[140px] sm:max-w-[180px]">{value}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[140px] sm:max-w-[180px]">{row.employeeId}</div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">View details for {value}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "company",
      label: "Department & Position",
      sortable: true,
      render: (value: string, row: any) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <div className="h-9 w-9 rounded-md bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                  <Building className="h-4 w-4 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{value || 'N/A'}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[140px]">{row.previousPosition}</div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Department: {value || 'Not specified'}</p>
              <p className="text-xs">Previous Position: {row.previousPosition}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "promotionTitle",
      label: "Promotion Details",
      sortable: true,
      render: (value: string, row: any) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <div className="h-9 w-9 rounded-md bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex items-center justify-center mr-2 flex-shrink-0">
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{value}</div>
                  <div className="text-xs text-gray-500">New position</div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Promotion to: {value}</p>
              <p className="text-xs">From: {row.previousPosition}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "date",
      label: "Effective Date",
      sortable: true,
      render: (value: string) => {
        try {
          const date = new Date(value);
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center cursor-default">
                    <div className="h-9 w-9 rounded-md bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex flex-col items-center justify-center mr-2 flex-shrink-0">
                      <Calendar className="h-3 w-3 text-green-600 mb-0.5" />
                      <span className="text-xs font-medium text-green-700">{date.getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[80px]">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">Effective date</div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{date.toLocaleDateString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        } catch {
          return <span className="text-gray-500">N/A</span>;
        }
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewDetails(row)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-0 py-4 sm:px-4 sm:py-6">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="hidden h-12 w-12 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-sm sm:flex sm:items-center sm:justify-center">
            <Award className="h-6 w-6 text-green-600" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
              Employee Promotions
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee promotions and career advancement
              {promotions && (
                <span className="ml-2 text-sm text-gray-500">
                  ({totalCount} promotion records)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          <AdvancedSearch
            onSearch={handleSearch}
            //@ts-ignore
            fields={searchFields}
            title="Promotions"
          />
          <DataExportMenu
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            onPrint={handlePrint}
            title="Promotions"
          />
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="h-10 w-full rounded-lg border-gray-300 px-3.5 font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 sm:w-auto"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            disabled={isLoading}
            className="h-10 w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 font-medium text-white hover:from-green-700 hover:to-green-800 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Promotion
          </Button>
        </div>
      </div>

      {/* Statistics Card */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Promotion Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
              <span className="text-green-800 font-bold">{totalCount}</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <p className="text-xs text-gray-500 mt-1">Total promotion records in system</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Promotion Records</CardTitle>
              <CardDescription className="text-gray-600">
                Manage and review employee promotion records
              </CardDescription>
            </div>
            {!isLoading && sortedPromotions.length > 0 && (
              <div className="text-sm text-gray-600">
                Sorted by {sortField === 'id' ? 'promotion ID' : sortField} in {sortDirection}ending order
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[60vh] w-full overflow-x-auto overflow-y-auto rounded-md [-webkit-overflow-scrolling:touch]">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead 
                      key={column.key}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => !isLoading && column.sortable && handleSort(column.key as SortField)}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {column.sortable && getSortIcon(column.key as SortField)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-[400px]">
                      <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
                        <div className="text-center">
                          <p className="text-lg font-medium text-gray-700">Loading promotions...</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Please wait while we fetch the latest promotion records
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-gray-400">
                          <svg 
                            className="w-12 h-12 mx-auto" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="1.5" 
                              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" 
                            />
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No promotions found</p>
                        <p className="text-gray-500 text-sm">Add a new promotion to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPromotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      {columns.map((column) => (
                        <TableCell key={`${promotion.id}-${column.key}`}>
                          {column.render 
                          //@ts-expect-error - TS doesn't infer correctly here
                            ? column.render(promotion[column.key as keyof TablePromotion], promotion)
                            : promotion[column.key as keyof TablePromotion]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AddPromotionDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
        }}
        onSubmit={handleAddPromotion}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              promotion record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
