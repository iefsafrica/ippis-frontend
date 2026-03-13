"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, RefreshCw, Eye, Edit, Trash2 } from "lucide-react";
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper";
import { DataTable } from "../components/data-table";
import { AddPromotionDialog } from "./add-promotion-dialog";
import { toast } from "sonner";
import type { TablePromotion } from "@/types/hr-core/promotion-management";

interface PromotionContentProps {
  promotions: TablePromotion[];
  isLoading: boolean;
  onAddPromotion: (promotion: any) => Promise<any>;
  onDeletePromotion: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

const promotionSearchFields = [
  { name: "employee", label: "Employee", type: "text" as const },
  { name: "employeeId", label: "Employee ID", type: "text" as const },
  { name: "company", label: "Department", type: "text" as const },
  { name: "promotionTitle", label: "New Position", type: "text" as const },
  { name: "date", label: "Effective Date", type: "date" as const },
];

export function PromotionContent({
  promotions,
  isLoading,
  onAddPromotion,
  onDeletePromotion,
  onRefresh,
  isRefreshing,
}: PromotionContentProps) {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(
    null
  );

  const handleDeleteConfirm = async () => {
    if (!selectedPromotionId) return;
    try {
      await onDeletePromotion(selectedPromotionId);
      toast.success("Promotion deleted successfully");
    } catch (error) {
      toast.error("Failed to delete promotion");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPromotionId(null);
    }
  };

  const handleViewDetails = (promotion: TablePromotion) => {
    router.push(`/admin/core-hr/promotions/${promotion.employeeId}`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPromotionId(id);
    setIsDeleteDialogOpen(true);
  };

  const totalPromotions = promotions.length;
  const uniqueEmployees = new Set(
    promotions.map((promotion) => promotion.employeeId || promotion.employee)
  ).size;
  const uniqueDepartments = new Set(
    promotions.map((promotion) => promotion.company || "Unassigned")
  ).size;

  const promotionStats = [
    {
      label: "Total promotions",
      value: totalPromotions,
      description: "Records in the system",
    },
    {
      label: "Employees promoted",
      value: uniqueEmployees,
      description: "Unique individuals",
    },
    {
      label: "Departments represented",
      value: uniqueDepartments,
      description: "Teams with changes",
    },
  ];

  const columns = [
    {
      key: "employee",
      label: "Employee",
      sortable: true,
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: "employeeId",
      label: "Employee ID",
      sortable: true,
      render: (value: string) => <div>{value}</div>,
    },
    {
      key: "company",
      label: "Department",
      sortable: true,
      render: (value: string) => <div>{value || "Unassigned"}</div>,
    },
    {
      key: "promotionTitle",
      label: "New Position",
      sortable: true,
      render: (value: string) => <div>{value}</div>,
    },
    {
      key: "date",
      label: "Effective Date",
      sortable: true,
      render: (value: string) => <div>{new Date(value).toLocaleDateString()}</div>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: TablePromotion) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewDetails(row)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDeleteClick(row.id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <CoreHRClientWrapper title="Employee Promotions" endpoint="/api/admin/hr/promotions">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Promotions</h1>
            <p className="text-gray-600 mt-1">
              Track submitted and approved promotion slips
              <span className="ml-2 text-sm text-gray-500">
                ({totalPromotions} records)
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="border-gray-300 hover:bg-gray-100"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {promotionStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                {stat.label}
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <DataTable
            title="Promotions"
            columns={columns}
            data={promotions}
            searchFields={promotionSearchFields}
            onAdd={() => setIsAddDialogOpen(true)}
            itemsPerPage={50}
          />
        </div>

        <AddPromotionDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={onAddPromotion}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CoreHRClientWrapper>
  );
}
