

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
import { Plus, Trash2, FileEdit, Eye, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
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

interface PromotionContentProps {
  promotions: TablePromotion[];
  isLoading: boolean;
  onAddPromotion: (promotion: any) => void;
  onDeletePromotion: (id: string) => void;
  onSearch: (searchParams: any) => void;
}

type SortField = 'employee' | 'employeeId' | 'company' | 'promotionTitle' | 'date';
type SortDirection = 'asc' | 'desc';

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
  const [sortField, setSortField] = useState<SortField>('date');
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

  // Sort promotions based on selected field and direction - IMPORTANT FIX HERE
  const sortedPromotions = useMemo(() => {
    if (!promotions || promotions.length === 0) return [];
    
    const promotionsCopy = [...promotions];
    
    return promotionsCopy.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

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

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employee Promotions</h1>
          <div className="flex items-center space-x-2">
            <AdvancedSearch
              onSearch={handleSearch}
              //@ts-expect-error - fix any
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
              disabled={isRefreshing}
              title="Refresh Table"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Adding..." : "Add Promotion"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Promotions List</CardTitle>
                <CardDescription>
                  Manage employee promotions and career advancement records
                  {!isLoading && sortedPromotions.length > 0 && (
                    <span className="ml-2 text-sm font-medium">
                      (Sorted by {sortField} in {sortDirection}ending order)
                    </span>
                  )}
                </CardDescription>
              </div>
              {!isLoading && sortedPromotions.length > 0 && (
                <div className="text-sm text-gray-600">
                  Showing {paginatedPromotions.length} of {sortedPromotions.length} promotions
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => !isLoading && handleSort('employee')}
                    >
                      <div className="flex items-center">
                        Employee
                        {getSortIcon('employee')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => !isLoading && handleSort('employeeId')}
                    >
                      <div className="flex items-center">
                        Employee ID
                        {getSortIcon('employeeId')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => !isLoading && handleSort('company')}
                    >
                      <div className="flex items-center">
                        Company/Department
                        {getSortIcon('company')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => !isLoading && handleSort('promotionTitle')}
                    >
                      <div className="flex items-center">
                        Promotion Title
                        {getSortIcon('promotionTitle')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => !isLoading && handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {getSortIcon('date')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-[400px]">
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
                      <TableCell colSpan={6} className="h-24 text-center">
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
                        <TableCell className="font-medium">
                          {promotion.employee}
                        </TableCell>
                        <TableCell>{promotion.employeeId}</TableCell>
                        <TableCell>{promotion.company || 'N/A'}</TableCell>
                        <TableCell>{promotion.promotionTitle}</TableCell>
                        <TableCell>
                          {new Date(promotion.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewDetails(promotion)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteClick(promotion.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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
      </div>

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
  )
}