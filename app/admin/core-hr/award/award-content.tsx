
"use client"

import { useState, useEffect } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { Badge } from "@/components/ui/badge"
import { Award, Calendar, User, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useGetAwards, useCreateAward, useUpdateAward, useDeleteAward } from "@/services/hooks/hr-core/awards"
import type { CreateAwardRequest, LocalAward, Award as ApiAward } from "@/types/hr-core/awards"
import { Button } from "@/components/ui/button"
import { AddAwardDialog } from "./add-award-dialog"
import { EditAwardDialog } from "./edit-award-dialog"
import { ViewAwardDialog } from "./view-award-dialog"
import { convertApiAwardToLocal, convertLocalAwardToApi } from "@/utils/award-converters"

const awardSearchFields = [
  {
    name: "employeeId",
    label: "Employee ID",
    type: "text" as const,
  },
  {
    name: "employeeName",
    label: "Employee Name",
    type: "text" as const,
  },
  {
    name: "department",
    label: "Department",
    type: "select" as const,
    options: [
      { value: "Finance", label: "Finance" },
      { value: "Human Resources", label: "Human Resources" },
      { value: "Information Technology", label: "Information Technology" },
      { value: "Customer Service", label: "Customer Service" },
      { value: "Sales", label: "Sales" },
      { value: "Operations", label: "Operations" },
      { value: "Legal", label: "Legal" },
      { value: "Informatiom and Communication Technology", label: "Information and Communication Technology" },
    ],
  },
  {
    name: "awardType",
    label: "Award Type",
    type: "select" as const,
    options: [
      { value: "Employee of the Month", label: "Employee of the Month" },
      { value: "Long Service Award", label: "Long Service Award" },
      { value: "Innovation Award", label: "Innovation Award" },
      { value: "Customer Excellence Award", label: "Customer Excellence Award" },
      { value: "Sales Champion", label: "Sales Champion" },
      { value: "Leadership Award", label: "Leadership Award" },
      { value: "Safety Award", label: "Safety Award" },
    ],
  },
  {
    name: "awardDate",
    label: "Award Date",
    type: "date" as const,
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending" },
    ],
  },
]

// Table columns configuration
const columns = [
  {
    key: "employeeId",
    label: "Employee ID",
    sortable: true,
  },
  {
    key: "employeeName",
    label: "Employee Name",
    sortable: true,
    render: (value: string) => (
      <div className="flex items-center">
        <User className="mr-2 h-4 w-4 text-gray-500" />
        <span className="truncate max-w-[180px]">{value}</span>
      </div>
    ),
  },
  {
    key: "department",
    label: "Department",
    sortable: true,
    render: (value: string) => (
      <div className="truncate max-w-[150px]">{value}</div>
    ),
  },
  {
    key: "awardType",
    label: "Award Type",
    sortable: true,
    render: (value: string) => (
      <div className="flex items-center">
        <Award className="mr-2 h-4 w-4 text-yellow-500 flex-shrink-0" />
        <span className="truncate max-w-[180px]">{value}</span>
      </div>
    ),
  },
  {
    key: "awardDate",
    label: "Award Date",
    sortable: true,
    render: (value: string) => (
      <div className="flex items-center">
        <Calendar className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
        {new Date(value).toLocaleDateString()}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => {
      const badgeClass = 
        value === "active" 
          ? "bg-green-100 text-green-800 hover:bg-green-100" 
          : value === "pending" 
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" 
            : "bg-red-100 text-red-800 hover:bg-red-100";
      
      const displayText = 
        value === "active" ? "Active" : 
        value === "pending" ? "Pending" : 
        value === "inactive" ? "Inactive" : value;
      
      return (
        <Badge className={badgeClass} variant="outline">
          {displayText}
        </Badge>
      );
    },
  },
]

export function AwardContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentAward, setCurrentAward] = useState<LocalAward | null>(null)
  const [localAwards, setLocalAwards] = useState<LocalAward[]>([])
  
  const { toast } = useToast()
  
  // Query hooks
  const { 
    data: awardsData, 
    isLoading: isLoadingAwards, 
    isError: isAwardsError,
    error: awardsError,
    refetch: refetchAwards 
  } = useGetAwards()
  
  const createAwardMutation = useCreateAward()
  const updateAwardMutation = useUpdateAward()
  const deleteAwardMutation = useDeleteAward()

  // Load awards from API
  useEffect(() => {
    if (awardsData?.success && awardsData.data) {
      const convertedAwards = awardsData.data.map(convertApiAwardToLocal)
      // Sort awards in descending order by ID (highest ID first)
      const sortedAwards = convertedAwards.sort((a, b) => {
        // Convert string IDs to numbers for proper numeric comparison
        const idA = parseInt(a.id, 10)
        const idB = parseInt(b.id, 10)
        return idB - idA // Descending order
      })
      setLocalAwards(sortedAwards)
    }
  }, [awardsData])

  // Handle API errors
  useEffect(() => {
    if (isAwardsError && awardsError) {
      toast({
        title: "Error",
        description: "Failed to load awards. Please try again.",
        variant: "destructive",
      })
    }
  }, [isAwardsError, awardsError, toast])

  const handleAddAward = () => {
    setCurrentAward(null)
    setIsAddDialogOpen(true)
  }

  const handleEditAward = (id: string) => {
    const award = localAwards.find((a) => a.id === id)
    if (award) {
      setCurrentAward(award)
      setIsEditDialogOpen(true)
    }
  }

  const handleViewAward = (id: string) => {
    const award = localAwards.find((a) => a.id === id)
    if (award) {
      setCurrentAward(award)
      setIsViewDialogOpen(true)
    }
  }

  const handleDeleteAward = async (id: string) => {
    if (!confirm("Are you sure you want to delete this award?")) return

    try {
      const awardId = parseInt(id)
      if (isNaN(awardId)) {
        toast({
          title: "Error",
          description: "Invalid award ID",
          variant: "destructive",
        })
        return
      }

      await deleteAwardMutation.mutateAsync(awardId)
      
      // Remove the deleted award from local state
      setLocalAwards(prev => prev.filter(award => award.id !== id))
      
      toast({
        title: "Success",
        description: "Award deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete award",
        variant: "destructive",
      })
    }
  }

  const handleCreateAward = async (data: CreateAwardRequest) => {
    try {
      const response = await createAwardMutation.mutateAsync(data)
      
      if (response.success) {
        const newAward = convertApiAwardToLocal(response.data)
        // Add new award at the beginning (since it will have the highest ID)
        setLocalAwards(prev => [newAward, ...prev])
        
        toast({
          title: "Success",
          description: response.message || "Award created successfully",
        })
        
        return response
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create award",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleUpdateAward = async (id: string, data: any) => {
    try {
      const awardId = parseInt(id)
      if (isNaN(awardId)) {
        throw new Error("Invalid award ID")
      }

      const apiData = convertLocalAwardToApi(data)
      const response = await updateAwardMutation.mutateAsync({ id: awardId, data: apiData })
      
      if (response.success) {
        const updatedAward = convertApiAwardToLocal(response.data)
        // Update award and maintain descending order
        setLocalAwards(prev => {
          const updated = prev.map(award => award.id === id ? updatedAward : award)
          // Re-sort to maintain descending order
          return updated.sort((a, b) => {
            const idA = parseInt(a.id, 10)
            const idB = parseInt(b.id, 10)
            return idB - idA
          })
        })
        
        toast({
          title: "Success",
          description: response.message || "Award updated successfully",
        })
        
        return response
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update award",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleManualRefresh = () => {
    refetchAwards()
    toast({
      title: "Refreshing",
      description: "Fetching latest awards...",
    })
  }

  const isLoading = isLoadingAwards || createAwardMutation.isPending || updateAwardMutation.isPending || deleteAwardMutation.isPending

  return (
    <CoreHRClientWrapper title="Employee Awards" endpoint="/api/admin/hr/awards">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Awards</h1>
            <p className="text-gray-600 mt-1">
              Manage employee awards and recognitions
              {awardsData?.data && (
                <span className="ml-2 text-sm text-gray-500">
                  ({awardsData.data.length} awards)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isLoading}
              title="Refresh Table"
              className="border-gray-300"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            {/* REMOVED: Green "Add Award" button from header */}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <DataTable
            title="Awards"
            columns={columns}
            data={localAwards}
            searchFields={awardSearchFields}
            
            onAdd={handleAddAward}
            //@ts-expect-error - TS is not aware of the possible structures
            onEdit={handleEditAward}
            onDelete={handleDeleteAward}
            onView={handleViewAward}
         
            isLoading={isLoading}
            emptyMessage="No awards found. Add your first award to get started."
          />
        </div>

        {/* Add Award Dialog */}
        <AddAwardDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          //@ts-expect-error - TS is not aware of the possible structures
          onSubmit={handleCreateAward}
          isLoading={createAwardMutation.isPending}
        />

        {/* Edit Award Dialog */}
        {currentAward && (
          <EditAwardDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            //@ts-expect-error - TS is not aware of the possible structures
            onSubmit={(data) => handleUpdateAward(currentAward.id, data)}
            initialData={currentAward}
            isLoading={updateAwardMutation.isPending}
          />
        )}

        {/* View Award Dialog */}
        {currentAward && (
          <ViewAwardDialog
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
            award={currentAward}
            onEdit={() => {
              setIsViewDialogOpen(false)
              setIsEditDialogOpen(true)
            }}
            onDelete={() => {
              setIsViewDialogOpen(false)
              handleDeleteAward(currentAward.id)
            }}
          />
        )}
      </div>
    </CoreHRClientWrapper>
  )
}

export function Loading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employee Awards</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col space-y-3">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}