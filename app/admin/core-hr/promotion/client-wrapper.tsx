"use client"

import { useState, useEffect, useCallback } from "react"
import { PromotionContent } from "./promotion-content"
import { useToast } from "@/hooks/use-toast"
import { 
  usePromotedEmployees, 
  useCreatePromotion, 
  useDeletePromotion,
  usePromotedEmployeeDetails 
} from "@/services/hooks/hr-core/usePromotions"
import { TablePromotion } from "@/types/hr-core/promotion-management"
//@ts-expect-error - fix any
const transformToTablePromotion = (data: PromotionResponseData): TablePromotion => {
  return {
    id: data.promotion_id.toString(),
    employee: data.employee_name,
    employeeId: data.employee_id,
    company: data.department || "Ministry",
    promotionTitle: data.new_position,
    date: data.effective_date,
    previousPosition: data.previous_position,
    details: data.reason,
    employeeEmail: data.employee_email,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    currentPosition: data.current_position
  }
}

//@ts-expect-error - fix any
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Use React Query hooks
  const { 
    data: promotionsData = [], 
    isLoading: isLoadingPromotions, 
    refetch: refetchPromotions,
    error: promotionsError 
  } = usePromotedEmployees()
  
  // Hook for employee details
  const { 
    data: employeeDetails,
    isLoading: isLoadingDetails,
    error: detailsError
    //@ts-expect-error - fix any
  } = usePromotedEmployeeDetails(selectedEmployeeId || '', {
    enabled: !!selectedEmployeeId
  })
  
  const createPromotionMutation = useCreatePromotion({
    onSuccess: (newPromotion) => {
      const tablePromotion = transformToTablePromotion(newPromotion)
      setTablePromotions(prev => [tablePromotion, ...prev])
      toast({
        title: "Promotion Added",
        description: `${newPromotion.employee_name} has been promoted to ${newPromotion.new_position}`,
        variant: "success" as any,
      })
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
    onSuccess: (_, promotionId) => {
      setTablePromotions(prev => prev.filter(promotion => promotion.id !== promotionId.toString()))
      toast({
        title: "Promotion Deleted",
        description: "The promotion record has been deleted successfully",
        variant: "success" as any,
      })
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

  // Show error toast if there's an error loading details
  useEffect(() => {
    if (detailsError) {
      toast({
        title: "Error Loading Details",
        description: "Failed to load employee details. Please try again.",
        variant: "destructive",
      })
    }
  }, [detailsError, toast])

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

  // Function to handle view details
  const handleViewDetails = useCallback((employeeId: string) => {
    setSelectedEmployeeId(employeeId)
  }, [])

  // Function to close details dialog
  const handleCloseDetails = useCallback(() => {
    setSelectedEmployeeId(null)
  }, [])

  // Function to handle search
  const handleSearch = (searchParams: SearchParams) => {
    // If no search params, show all data
    if (!Object.values(searchParams).some((value) => value)) {
      const transformed = promotionsData.map(transformToTablePromotion)
      setTablePromotions(transformed)
      return
    }

    const filtered = promotionsData
      .filter((promotion) => {
        return Object.entries(searchParams).every(([key, value]) => {
          if (!value) return true

          if (key === "employee" && value) {
            return promotion.employee_name
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
            return promotion.new_position
              .toLowerCase()
              .includes((value as string).toLowerCase())
          }

          if (key === "dateFrom" && value) {
            return new Date(promotion.effective_date) >= new Date(value as string)
          }

          if (key === "dateTo" && value) {
            return new Date(promotion.effective_date) <= new Date(value as string)
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
      //@ts-expect-error - fix any
      onViewDetails={handleViewDetails}
      employeeDetails={employeeDetails}
      isDetailsLoading={isLoadingDetails}
      isDetailsDialogOpen={!!selectedEmployeeId}
      onCloseDetails={handleCloseDetails}
    />
  )
}