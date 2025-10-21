
'use client';

import { useState } from 'react';
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
import { Plus, Trash2, FileEdit, Eye } from 'lucide-react';
import { AddPromotionDialog } from './add-promotion-dialog';
import { PromotionDetailsDialog } from './promotion-details-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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

interface Promotion {
  id: string;
  employee: string;
  employeeId: string;
  company: string;
  promotionTitle: string;
  date: string;
  previousPosition: string;
  details: string;
}

interface PromotionContentProps {
  promotions: Promotion[];
  isLoading: boolean;
  onAddPromotion: (promotion: Omit<Promotion, 'id'>) => void;
  onDeletePromotion: (id: string) => void;
  onSearch: (searchParams: any) => void;
}

export function PromotionContent({
  promotions,
  isLoading,
  onAddPromotion,
  onDeletePromotion,
  onSearch,
}: PromotionContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(
    null
  );
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  const itemsPerPage = 50;
  const totalPages = Math.ceil(promotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPromotions = promotions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportPDF = () => {
    toast({
      title: 'PDF Export',
      description: 'Promotions data has been exported as PDF',
    });
  };

  const handleExportCSV = () => {
    toast({
      title: 'CSV Export',
      description: 'Promotions data has been exported as CSV',
    });
  };

  const handlePrint = () => {
    toast({
      title: 'Print',
      description: 'Preparing promotions data for printing',
    });
    window.print();
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPromotionId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPromotionId) {
      onDeletePromotion(selectedPromotionId);
      setIsDeleteDialogOpen(false);
      setSelectedPromotionId(null);
    }
  };

  const handleViewDetails = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsDetailsDialogOpen(true);
  };

  const searchFields = [
    { name: 'employee', label: 'Employee', type: 'text' },
    { name: 'company', label: 'Company', type: 'text' },
    { name: 'promotionTitle', label: 'Promotion Title', type: 'text' },
    { name: 'dateFrom', label: 'Date From', type: 'date' },
    { name: 'dateTo', label: 'Date To', type: 'date' },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employee Promotions</h1>
          <div className="flex items-center space-x-2">
            <AdvancedSearch
              onSearch={onSearch}
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
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Promotion
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Promotions List</CardTitle>
            <CardDescription>
              Manage employee promotions and career advancement records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Promotion Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPromotions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No promotions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedPromotions.map((promotion) => (
                          <TableRow key={promotion.id}>
                            <TableCell className="font-medium">
                              {promotion.employee}
                            </TableCell>
                            <TableCell>{promotion.company}</TableCell>
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
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() =>
                                    handleDeleteClick(promotion.id)
                                  }
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

                <div className="flex items-center justify-center mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AddPromotionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={onAddPromotion}
      />

      <PromotionDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        promotion={selectedPromotion}
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
