

"use client"

import { useState, useEffect, useRef } from "react"
import { PromotionContent } from "./promotion-content"
import { toast } from "sonner"
import { 
  usePromotedEmployees, 
  useCreatePromotion, 
  useDeletePromotion
} from "@/services/hooks/hr-core/usePromotions"
import { TablePromotion, CreatePromotionRequest } from "@/types/hr-core/promotion-management"

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
  const [originalPromotions, setOriginalPromotions] = useState<TablePromotion[]>([])
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  
  // Use React Query hooks
  const { 
    data: promotionsData = [], 
    isLoading: isLoadingPromotions, 
    error: promotionsError,
    refetch: refetchPromotions
  } = usePromotedEmployees()
  
  // Function to sort data in descending order by date
  const sortDataByDateDescending = (data: TablePromotion[]): TablePromotion[] => {
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      try {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Newest first (descending)
      } catch (error) {
        return 0;
      }
    });
  };
  
  // Function to manually refresh promotions data
  const refreshPromotionsData = async () => {
    try {
      setIsManualRefreshing(true)
      const { data: newData } = await refetchPromotions()
      
      if (newData && newData.length > 0) {
        // Transform the data first
        const transformed = newData.map(transformToTablePromotion)
        // Sort by date in descending order
        const sortedTransformed = sortDataByDateDescending(transformed);
        setTablePromotions(sortedTransformed)
        setOriginalPromotions(sortedTransformed)
        toast.success("Promotions updated")
      } else {
        setTablePromotions([])
        setOriginalPromotions([])
      }
      
      setNeedsRefresh(false)
    } catch (error) {
      console.error("Error refreshing promotions:", error)
      toast.error("Failed to refresh promotions")
    } finally {
      setIsManualRefreshing(false)
    }
  }
  
  // Create promotion mutation
  const createPromotionMutation = useCreatePromotion({
    onSuccess: () => {
      setNeedsRefresh(true)
      toast.success("Promotion created successfully!")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create promotion")
    }
  })
  
  // Delete promotion mutation
  const deletePromotionMutation = useDeletePromotion({
    onSuccess: () => {
      refreshPromotionsData()
      toast.success("Promotion deleted successfully!")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete promotion")
    }
  })

  // Initial data load with sorting
  useEffect(() => {
    if (promotionsData && promotionsData.length > 0) {
      // Transform the data first
      const transformed = promotionsData.map(transformToTablePromotion)
      // Sort by date in descending order
      const sortedTransformed = sortDataByDateDescending(transformed);
      setTablePromotions(sortedTransformed)
      setOriginalPromotions(sortedTransformed)
    } else {
      setTablePromotions([])
      setOriginalPromotions([])
    }
  }, [promotionsData])

  // Check if we need to refresh
  useEffect(() => {
    if (needsRefresh && !isManualRefreshing) {
      refreshPromotionsData()
    }
  }, [needsRefresh])

  // Show error toast if there's an error loading promotions
  useEffect(() => {
    if (promotionsError) {
      toast.error("Failed to load promotion data. Please try again.")
    }
  }, [promotionsError])

  // Function to add a new promotion
  const handleAddPromotion = async (promotionData: any) => {
    try {
      const result = await createPromotionMutation.mutateAsync(promotionData)
      return result
    } catch (error) {
      throw error
    }
  }

  // Function to delete a promotion
  const handleDeletePromotion = async (id: string) => {
    try {
      const promotionId = parseInt(id)
      if (!isNaN(promotionId)) {
        await deletePromotionMutation.mutateAsync(promotionId)
      } else {
        toast.error("Invalid promotion ID")
        throw new Error("Invalid promotion ID")
      }
    } catch (error) {
      throw error
    }
  }

  // Function to handle search
  const handleSearch = (searchParams: SearchParams) => {
    // If no search params, reset to original data
    if (!Object.values(searchParams).some((value) => value)) {
      setTablePromotions(originalPromotions)
      return
    }

    const filtered = originalPromotions.filter((promotion) => {
      return Object.entries(searchParams).every(([key, value]) => {
        if (!value) return true

        const searchValue = String(value).toLowerCase()
        
        if (key === "employee" && value) {
          return promotion.employee.toLowerCase().includes(searchValue)
        }

        if (key === "company" && value) {
          //@ts-expect-error - fix any
          return promotion.company.toLowerCase().includes(searchValue)
        }

        if (key === "promotionTitle" && value) {
          return promotion.promotionTitle.toLowerCase().includes(searchValue)
        }

        if (key === "dateFrom" && value) {
          const promotionDate = new Date(promotion.date)
          return promotionDate >= new Date(value)
        }

        if (key === "dateTo" && value) {
          const promotionDate = new Date(promotion.date)
          return promotionDate <= new Date(value)
        }

        return true
      })
    })

    setTablePromotions(filtered)
  }

  // Combine loading states
  const isLoading = isLoadingPromotions || createPromotionMutation.isPending || deletePromotionMutation.isPending || isManualRefreshing

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