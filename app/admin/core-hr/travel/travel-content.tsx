"use client"

import { useState, useEffect } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User, CreditCard, Loader2, RefreshCw, Plane, Hotel, Briefcase, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { 
  useGetTravels, 
  useCreateTravel, 
  useUpdateTravel, 
  useDeleteTravel, 
  mapTravelToLocal
} from "@/services/hooks/hr-core/travel"
import type { CreateTravelRequest, UpdateTravelRequest, LocalTravel } from "@/types/hr-core/travel"
import { Button } from "@/components/ui/button"
import { AddTravelDialog } from "./AddTravelDialog"
import { EditTravelDialog } from "./EditTravelDialog"
import { ViewTravelDialog } from "./ViewTravelDialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const travelSearchFields = [
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
    ],
  },
  {
    name: "destination",
    label: "Destination",
    type: "text" as const,
  },
  {
    name: "purpose",
    label: "Purpose",
    type: "text" as const,
  },
  {
    name: "startDate",
    label: "Start Date",
    type: "date" as const,
  },
  {
    name: "endDate",
    label: "End Date",
    type: "date" as const,
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
]

export function TravelContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentTravel, setCurrentTravel] = useState<LocalTravel | null>(null)
  const [localTravels, setLocalTravels] = useState<LocalTravel[]>([])
  
  const { 
    data: travelsResponse, 
    isLoading: isLoadingTravels, 
    isError: isTravelsError,
    error: travelsError,
    refetch: refetchTravels 
  } = useGetTravels()
  
  const createTravelMutation = useCreateTravel()
  const updateTravelMutation = useUpdateTravel()
  const deleteTravelMutation = useDeleteTravel()

  useEffect(() => {
    if (travelsResponse?.success && travelsResponse.data) {
      const convertedTravels = travelsResponse.data.map(mapTravelToLocal)
      const sortedTravels = convertedTravels.sort((a, b) => {
        const idA = parseInt(a.id, 10)
        const idB = parseInt(b.id, 10)
        return idB - idA // Descending order
      })
      setLocalTravels(sortedTravels)
    }
  }, [travelsResponse])

  useEffect(() => {
    if (isTravelsError && travelsError) {
      toast.error("Failed to load travel records. Please try again.")
    }
  }, [isTravelsError, travelsError])

  const handleAddTravel = () => {
    setCurrentTravel(null)
    setIsAddDialogOpen(true)
  }

  const handleEditTravel = (id: string) => {
    const travel = localTravels.find((t) => t.id === id)
    if (travel) {
      setCurrentTravel(travel)
      setIsEditDialogOpen(true)
    }
  }

  const handleViewTravel = (id: string) => {
    const travel = localTravels.find((t) => t.id === id)
    if (travel) {
      setCurrentTravel(travel)
      setIsViewDialogOpen(true)
    }
  }

  const handleOpenDeleteDialog = (id: string) => {
    const travel = localTravels.find((t) => t.id === id)
    if (travel) {
      setCurrentTravel(travel)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleDeleteTravel = async () => {
    if (!currentTravel) return

    try {
      const travelId = parseInt(currentTravel.id)
      if (isNaN(travelId)) {
        toast.error("Invalid travel ID")
        return
      }

      await deleteTravelMutation.mutateAsync(travelId)
      
      // Remove the deleted travel from local state
      setLocalTravels(prev => prev.filter(travel => travel.id !== currentTravel.id))
      
      toast.success("Travel record deleted successfully")
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete travel record")
    }
  }

  const handleCreateTravel = async (data: CreateTravelRequest) => {
    try {
      const response = await createTravelMutation.mutateAsync(data)
      
      if (response.success) {
        const newTravel = mapTravelToLocal(response.data)
        setLocalTravels(prev => [newTravel, ...prev])
        
        toast.success(response.message || "Travel record created successfully")
        
        return response
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create travel record")
      throw error
    }
  }

  const handleUpdateTravel = async (data: UpdateTravelRequest) => {
    try {
      const response = await updateTravelMutation.mutateAsync(data)
      
      if (response.success) {
        const updatedTravel = mapTravelToLocal(response.data)
        setLocalTravels(prev => {
          const updated = prev.map(travel => travel.id === updatedTravel.id ? updatedTravel : travel)
          return updated.sort((a, b) => {
            const idA = parseInt(a.id, 10)
            const idB = parseInt(b.id, 10)
            return idB - idA
          })
        })
        
        toast.success(response.message || "Travel record updated successfully")
        
        return response
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update travel record")
      throw error
    }
  }

  const handleManualRefresh = () => {
    refetchTravels()
    toast.info("Refreshing travel records...")
  }

  // Define columns INSIDE the component so they can access the handler functions
  const columns = [
    {
      key: "employeeName",
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
                    <div className={`h-2 w-2 rounded-full ${
                      row.status === "approved" ? "bg-green-500" :
                      row.status === "pending" ? "bg-yellow-500" :
                      row.status === "completed" ? "bg-blue-500" : "bg-gray-400"
                    }`} />
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
      key: "purpose",
      label: "Purpose",
      sortable: true,
      render: (value: string) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <Briefcase className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <div className="truncate max-w-[120px] sm:max-w-[180px]">{value}</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{value}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "destination",
      label: "Destination",
      sortable: true,
      render: (value: string) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-default">
                <div className="relative">
                  <MapPin className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                </div>
                <span className="truncate max-w-[100px] sm:max-w-[150px]">{value}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Travel destination: {value}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      key: "startDate",
      label: "Travel Period",
      sortable: true,
      render: (value: string, row: any) => {
        const calculateDuration = () => {
          try {
            const start = new Date(value)
            const end = new Date(row.endDate)
            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays
          } catch {
            return 0
          }
        }
        
        const duration = calculateDuration()
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-default">
                  <div className="h-9 w-9 rounded-md bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center mr-2 flex-shrink-0">
                    <Calendar className="h-3 w-3 text-gray-600 mb-0.5" />
                    <span className="text-xs font-medium text-gray-700">{duration}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(row.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{duration} day{duration !== 1 ? 's' : ''} • {new Date(value).toLocaleDateString()} to {new Date(row.endDate).toLocaleDateString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      key: "estimatedCost",
      label: "Cost",
      sortable: true,
      render: (value: string) => {
        const amount = parseFloat(value) || 0
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-default">
                  <div className="h-9 w-9 rounded-md bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-center mr-2 flex-shrink-0">
                    <CreditCard className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">
                      ₦{amount.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {amount >= 1000000 ? `${(amount / 1000000).toFixed(1)}M` : 
                       amount >= 1000 ? `${(amount / 1000).toFixed(1)}K` : 
                       'Budget'}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Estimated cost: ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
          approved: { 
            label: "Approved", 
            className: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 hover:from-green-100 hover:to-emerald-100",
            icon: "✓"
          },
          pending: { 
            label: "Pending", 
            className: "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-amber-100",
            icon: "⏳"
          },
          completed: { 
            label: "Completed", 
            className: "bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 text-blue-800 hover:from-blue-100 hover:to-sky-100",
            icon: "✓"
          },
          rejected: { 
            label: "Rejected", 
            className: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800 hover:from-red-100 hover:to-rose-100",
            icon: "✗"
          },
          cancelled: { 
            label: "Cancelled", 
            className: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800 hover:from-gray-100 hover:to-slate-100",
            icon: "✗"
          },
        }
        
        const config = statusConfig[value] || { 
          label: value, 
          className: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800 hover:from-gray-100 hover:to-slate-100",
          icon: "?"
        }
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`${config.className} px-3 py-1.5 font-medium rounded-full shadow-sm`} variant="outline">
                  <span className="mr-1.5">{config.icon}</span>
                  {config.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Status: {config.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
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
            onClick={() => handleViewTravel(row.id)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEditTravel(row.id)}
            title="Edit"
            disabled={row.status !== "pending"}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleOpenDeleteDialog(row.id)}
            title="Delete"
            disabled={row.status !== "pending"}
            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Calculate statistics
  const totalCost = localTravels.reduce((sum, travel) => sum + parseFloat(travel.estimatedCost || "0"), 0)
  const pendingCount = localTravels.filter(t => t.status === "pending").length
  const approvedCount = localTravels.filter(t => t.status === "approved").length
  const completedCount = localTravels.filter(t => t.status === "completed").length

  const isLoading = isLoadingTravels || createTravelMutation.isPending || updateTravelMutation.isPending || deleteTravelMutation.isPending

  if (isLoadingTravels) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Travel
              </h1>
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white rounded-xl shadow border border-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (isTravelsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Employee Travel</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Plane className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-red-500 font-medium">Error loading travel records</p>
            <p className="text-gray-600 mt-1 text-sm">{travelsError?.message}</p>
            <button 
              onClick={() => refetchTravels()}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-sm hover:shadow-md transition-all"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CoreHRClientWrapper title="Employee Travel" endpoint="/api/admin/core-hr/travel">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
              <Plane className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Travel
              </h1>
              <p className="text-gray-600 mt-1">
                Manage travel requests and approvals
                {travelsResponse?.data && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({travelsResponse.data.length} travel requests)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleManualRefresh}
                    disabled={isLoading}
                    className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh table data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={handleAddTravel}
              disabled={isLoading}
              className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg"
            >
              <Plane className="h-4 w-4 mr-2" />
              Add Travel
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Travel Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₦{(totalCost / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalCost.toLocaleString()} total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-yellow-100 border border-yellow-200 flex items-center justify-center mr-3">
                  <span className="text-yellow-800 font-bold">{pendingCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center mr-3">
                  <span className="text-green-800 font-bold">{approvedCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{approvedCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Approved requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                  <span className="text-blue-800 font-bold">{completedCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Completed travels</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Travel Requests</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and review employee travel requests
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              title="Travel Requests"
              columns={columns}
              data={localTravels}
              searchFields={travelSearchFields}
              onAdd={handleAddTravel}
              //@ts-expect-error TS2345
              onEdit={handleEditTravel}
              onDelete={handleOpenDeleteDialog}
              onView={handleViewTravel}
              showActions={true}
              isLoading={isLoading}
              emptyMessage={
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 border border-blue-200 mb-4">
                    <Plane className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No travel requests found</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first travel request</p>
                  <Button
                    onClick={handleAddTravel}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <Plane className="h-4 w-4 mr-2" />
                    Add Travel Request
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddTravelDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          //@ts-expect-error TS2322
          onSubmit={handleCreateTravel}
          isLoading={createTravelMutation.isPending}
        />

        {currentTravel && (
          <EditTravelDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            //@ts-expect-error TS2322
            onSubmit={handleUpdateTravel}
            initialData={currentTravel}
            isLoading={updateTravelMutation.isPending}
          />
        )}

        {currentTravel && (
          <ViewTravelDialog
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
            travel={currentTravel}
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

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteTravel}
          title="Delete Travel Request"
          description={`Are you sure you want to delete the travel request for ${currentTravel?.employeeName}?`}
          itemName={`${currentTravel?.employeeName}'s travel request to ${currentTravel?.destination}`}
          isLoading={deleteTravelMutation.isPending}
        />
      </div>
    </CoreHRClientWrapper>
  )
}