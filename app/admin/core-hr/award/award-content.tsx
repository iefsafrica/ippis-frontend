"use client"

import { useState, useEffect } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { Badge } from "@/components/ui/badge"
import { Award, Calendar, User, RefreshCw, Loader2, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useGetAwards, useCreateAward, useUpdateAward, useDeleteAward } from "@/services/hooks/hr-core/awards"
import type { CreateAwardRequest, LocalAward, Award as ApiAward } from "@/types/hr-core/awards"
import { Button } from "@/components/ui/button"
import { AddAwardDialog } from "./add-award-dialog"
import { EditAwardDialog } from "./edit-award-dialog"
import { ViewAwardDialog } from "./view-award-dialog"
import { convertApiAwardToLocal, convertLocalAwardToApi } from "@/utils/award-converters"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

export function AwardContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentAward, setCurrentAward] = useState<LocalAward | null>(null)
  const [localAwards, setLocalAwards] = useState<LocalAward[]>([])
  
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
      toast.error("Failed to load awards. Please try again.", {
        style: {
          background: "#EF4444",
          color: "white",
          border: "none",
        },
      })
    }
  }, [isAwardsError, awardsError])

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

  const handleOpenDeleteDialog = (id: string) => {
    const award = localAwards.find((a) => a.id === id)
    if (award) {
      setCurrentAward(award)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleDeleteAward = async () => {
    if (!currentAward) return

    try {
      const awardId = parseInt(currentAward.id)
      if (isNaN(awardId)) {
        toast.error("Invalid award ID", {
          style: {
            background: "#EF4444",
            color: "white",
            border: "none",
          },
        })
        return
      }

      await deleteAwardMutation.mutateAsync(awardId)
      
      // Remove the deleted award from local state
      setLocalAwards(prev => prev.filter(award => award.id !== currentAward.id))
      
      toast.success("Award deleted successfully", {
        style: {
          background: "#10B981",
          color: "white",
          border: "none",
        },
      })
      
      setIsDeleteDialogOpen(false)
      setCurrentAward(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete award", {
        style: {
          background: "#EF4444",
          color: "white",
          border: "none",
        },
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
        
        toast.success(response.message || "Award created successfully", {
          style: {
            background: "#10B981",
            color: "white",
            border: "none",
          },
        })
        
        return response
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create award", {
        style: {
          background: "#EF4444",
          color: "white",
          border: "none",
        },
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
        
        toast.success(response.message || "Award updated successfully", {
          style: {
            background: "#10B981",
            color: "white",
            border: "none",
          },
        })
        
        return response
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update award", {
        style: {
          background: "#EF4444",
          color: "white",
          border: "none",
        },
      })
      throw error
    }
  }

  const handleManualRefresh = () => {
    refetchAwards()
    toast.info("Fetching latest awards...", {
      style: {
        background: "#3B82F6",
        color: "white",
        border: "none",
      },
    })
  }

  const isLoading = isLoadingAwards || createAwardMutation.isPending || updateAwardMutation.isPending || deleteAwardMutation.isPending

  // Define columns inside the component so they have access to the handlers
  const columns = [
    {
      key: "employeeId",
      label: "Employee ID",
      sortable: true,
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: "employeeName",
      label: "Employee Name",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center mr-3">
            <User className="h-4 w-4 text-blue-600" />
          </div>
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
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 flex items-center justify-center mr-3">
            <Award className="h-4 w-4 text-yellow-600" />
          </div>
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
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex items-center justify-center mr-3">
            <Calendar className="h-4 w-4 text-purple-600" />
          </div>
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
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleViewAward(row.id)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEditAward(row.id)}
            title="Edit"
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenDeleteDialog(row.id)}
            title="Delete"
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

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
              className="border-gray-300 hover:bg-gray-100"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <DataTable
            title="Awards"
            columns={columns}
            data={localAwards}
            searchFields={awardSearchFields}
            onAdd={handleAddAward}
            //@ts-expect-error - fix type 
            isLoading={isLoading}
            emptyMessage={
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-50 border border-yellow-200 mb-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No awards found</h3>
                <p className="text-gray-600 mb-4">Start by adding your first award</p>
                <Button
                  onClick={handleAddAward}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Add Award
                </Button>
              </div>
            }
          />
        </div>

        {/* Add Award Dialog */}
        <AddAwardDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          //@ts-expect-error - fix type
          onSubmit={handleCreateAward}
          isLoading={createAwardMutation.isPending}
        />

        {/* Edit Award Dialog */}
        {currentAward && (
          <EditAwardDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            //@ts-expect-error - fix type
            onSubmit={(data) => handleUpdateAward(currentAward.id, data)}
            initialData={currentAward}
            isLoading={updateAwardMutation.isPending}
          />
        )}

        {/* View Award Dialog */}
        {currentAward && (
          <ViewAwardDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setCurrentAward(null)
            }}
            award={currentAward}
            onEdit={() => {
              setIsViewDialogOpen(false)
              setIsEditDialogOpen(true)
            }}
            onDelete={() => {
              setIsViewDialogOpen(false)
              setIsDeleteDialogOpen(true)
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-white border border-gray-200 shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                Delete Award
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                Are you sure you want to delete the award for{" "}
                <span className="font-semibold text-gray-900">{currentAward?.employeeName}</span>?
                <br />
                <span className="text-gray-600 text-sm mt-2 block">
                  Award: {currentAward?.awardType} • Date: {currentAward?.awardDate ? new Date(currentAward.awardDate).toLocaleDateString() : "N/A"}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="bg-gray-50 px-6 py-4 rounded-b-lg">
              <AlertDialogCancel 
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setCurrentAward(null)
                }}
                disabled={deleteAwardMutation.isPending}
                className="bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAward}
                disabled={deleteAwardMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteAwardMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Award
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
