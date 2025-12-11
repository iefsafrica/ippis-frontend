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
    id: data.promotion_id?.toString() || data.id?.toString() || Math.random().toString(),
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
    currentPosition: data.current_position || data.position || "",
    promotionId: data.promotion_id || data.id
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

// Extend TablePromotion type to include promotionId
interface ExtendedTablePromotion extends TablePromotion {
  promotionId?: number;
}

export default function ClientWrapper() {
  const [tablePromotions, setTablePromotions] = useState<ExtendedTablePromotion[]>([])
  const [originalPromotions, setOriginalPromotions] = useState<ExtendedTablePromotion[]>([])
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  
  // Use React Query hooks
  const { 
    data: promotionsData = [], 
    isLoading: isLoadingPromotions, 
    error: promotionsError,
    refetch: refetchPromotions
  } = usePromotedEmployees()
  
  // Function to sort data in descending order by promotionId
  const sortDataByPromotionIdDescending = (data: ExtendedTablePromotion[]): ExtendedTablePromotion[] => {
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      // Use promotionId for sorting - highest number first (descending)
      const idA = a.promotionId || parseInt(a.id) || 0;
      const idB = b.promotionId || parseInt(b.id) || 0;
      return idB - idA; // Newest first (descending)
    });
  };
  
  // Function to manually refresh promotions data
  const refreshPromotionsData = async () => {
    try {
      setIsManualRefreshing(true)
      const { data: newData } = await refetchPromotions()
      
      if (newData && newData.length > 0) {
        const transformed = newData.map(transformToTablePromotion)
        const sortedTransformed = sortDataByPromotionIdDescending(transformed);
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
      // Sort by promotionId in descending order
      const sortedTransformed = sortDataByPromotionIdDescending(transformed);
      console.log("Sorted by promotionId, first 5:", sortedTransformed.slice(0, 5).map(p => ({
        id: p.id,
        promotionId: p.promotionId,
        employee: p.employee,
        promotionTitle: p.promotionTitle
      })));
      
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
          //@ts-expect-error - company exists on promotion
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

    // Keep the search results sorted by promotionId descending
    const sortedFiltered = sortDataByPromotionIdDescending(filtered);
    setTablePromotions(sortedFiltered)
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