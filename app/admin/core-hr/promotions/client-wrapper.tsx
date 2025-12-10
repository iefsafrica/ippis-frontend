
"use client"

import { useState, useEffect } from "react"
import { PromotionContent } from "./promotion-content"
import { useToast } from "@/hooks/use-toast"
import { 
  usePromotedEmployees, 
  useCreatePromotion, 
  useDeletePromotion
} from "@/services/hooks/hr-core/usePromotions"
import { TablePromotion } from "@/types/hr-core/promotion-management"
import {  CreatePromotionRequest } from "@/types/hr-core/promotion-management"


const transformToTablePromotion = (data: any): TablePromotion => {
  return {
    id: data.id?.toString() || Math.random().toString(),
    employee: data.employee_name || data.name || "Unknown",
    employeeId: data.employee_id || data.id || "",
    company: data.department || "Ministry",
    promotionTitle: data.new_position || data.position || "",
    date: data.effective_date || data.updated_at || new Date().toISOString(),
    previousPosition: data.previous_position || "N/A",
    details: data.reason || "",
    employeeEmail: data.employee_email || data.email || "",
    createdAt: data.created_at || "",
    updatedAt: data.updated_at || "",
    currentPosition: data.current_position || data.position || ""
  }
}

const transformToCreateRequest = (data: Omit<TablePromotion, 'id'>): CreatePromotionRequest => {
  return {
    employee_id: data.employeeId,
    department: data.company || null,
    previous_position: data.previousPosition,
    new_position: data.promotionTitle,
    effective_date: data.date,
    reason: data.details,
  }
}

// Search params type
export interface SearchParams {
  employee?: string;
  company?: string;
  promotionTitle?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function ClientWrapper() {
  const [tablePromotions, setTablePromotions] = useState<TablePromotion[]>([])
  const { toast } = useToast()
  
  // Use React Query hooks
  const { 
    data: promotionsData = [], 
    isLoading: isLoadingPromotions, 
    refetch: refetchPromotions,
    error: promotionsError 
  } = usePromotedEmployees()
  
  const createPromotionMutation = useCreatePromotion({
    onSuccess: () => {
      toast({
        title: "Promotion Added",
        description: "Promotion has been added successfully",
        variant: "default",
      })
      refetchPromotions()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add promotion: ${error.message}`,
        variant: "destructive",
      })
    }
  })
  
  const deletePromotionMutation = useDeletePromotion({
    onSuccess: () => {
      toast({
        title: "Promotion Deleted",
        description: "The promotion record has been deleted successfully",
        variant: "default",
      })
      refetchPromotions()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete promotion: ${error.message}`,
        variant: "destructive",
      })
    }
  })

  // Transform data when promotionsData changes
  useEffect(() => {
    if (promotionsData && promotionsData.length > 0) {
      const transformed = promotionsData.map(transformToTablePromotion)
      setTablePromotions(transformed)
    } else {
      setTablePromotions([])
    }
  }, [promotionsData])

  // Show error toast if there's an error loading promotions
  useEffect(() => {
    if (promotionsError) {
      toast({
        title: "Error Loading Promotions",
        description: "Failed to load promotion data. Please try again.",
        variant: "destructive",
      })
    }
  }, [promotionsError, toast])

  // Function to add a new promotion
  const handleAddPromotion = (newPromotionData: Omit<TablePromotion, 'id'>) => {
    const createRequest = transformToCreateRequest(newPromotionData)
    createPromotionMutation.mutate(createRequest)
  }

  // Function to delete a promotion
  const handleDeletePromotion = (id: string) => {
    const promotionId = parseInt(id)
    if (!isNaN(promotionId)) {
      deletePromotionMutation.mutate(promotionId)
    } else {
      toast({
        title: "Error",
        description: "Invalid promotion ID",
        variant: "destructive",
      })
    }
  }

  // Function to handle search
  const handleSearch = (searchParams: SearchParams) => {
    // If no search params, show all data
    if (!Object.values(searchParams).some((value) => value)) {
      const transformed = promotionsData.map(transformToTablePromotion)
      setTablePromotions(transformed)
      return
    }

    const filtered = (promotionsData || [])
      .filter((promotion: any) => {
        return Object.entries(searchParams).every(([key, value]) => {
          if (!value) return true

          if (key === "employee" && value) {
            return (promotion.employee_name || promotion.name || "")
              .toLowerCase()
              .includes((value as string).toLowerCase())
          }

          if (key === "company" && value) {
            return promotion.department
              ? promotion.department
                  .toLowerCase()
                  .includes((value as string).toLowerCase())
              : false
          }

          if (key === "promotionTitle" && value) {
            return (promotion.new_position || promotion.position || "")
              .toLowerCase()
              .includes((value as string).toLowerCase())
          }

          if (key === "dateFrom" && value) {
            const promotionDate = new Date(promotion.effective_date || promotion.updated_at)
            return promotionDate >= new Date(value as string)
          }

          if (key === "dateTo" && value) {
            const promotionDate = new Date(promotion.effective_date || promotion.updated_at)
            return promotionDate <= new Date(value as string)
          }

          return true
        })
      })
      .map(transformToTablePromotion)

    setTablePromotions(filtered)
  }

  // Combine loading states
  const isLoading = isLoadingPromotions || createPromotionMutation.isPending || deletePromotionMutation.isPending

  return (
    <PromotionContent
      promotions={tablePromotions}
      isLoading={isLoading}
      onAddPromotion={handleAddPromotion}
      onDeletePromotion={handleDeletePromotion}
      onSearch={handleSearch}
    />
  )
}