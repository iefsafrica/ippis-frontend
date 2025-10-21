"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "../components/pagination"
import { RefreshCw, Search, Filter, FileText, CheckCircle, XCircle, Clock, AlertCircle, Eye, MoreVertical } from "lucide-react"
import { ClearPendingEmployeesButton } from "../components/clear-pending-employees-button"
import { toast } from "sonner"
import { usePendingEmployees, useUpdateEmployeeStatus } from "@/services/hooks/employees/usePendingEmployees"
import { PendingEmployee } from "@/types/employees/pending-employees" 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Define the pagination type
interface PaginationProps {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface PendingContentProps {
  onRefresh?: () => void
}

export function PendingContent({ onRefresh }: PendingContentProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<PendingEmployee | null>(null)

  // Use the hooks
  const { data, isLoading, error, refetch } = usePendingEmployees(currentPage, 10)
  const updateEmployeeStatusMutation = useUpdateEmployeeStatus()
 
  // @ts-expect-error axios response mismatch
  const pendingEmployees: PendingEmployee[] = data?.employees || []
  // @ts-expect-error axios response mismatch
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: 10,
    totalPages: 0
  }

  const handleRefresh = () => {
    refetch()
    onRefresh?.()
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending Approval
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      case "document_verification":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <FileText className="mr-1 h-3 w-3" />
            Document Verification
          </Badge>
        )
      case "data_incomplete":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Data Incomplete
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", dateString, error)
      return "Invalid Date"
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // If your backend supports search, you should pass it in the query
    onRefresh?.()

    // Implement search functionality
    console.log("Searching for:", searchTerm)
    handleRefresh()
  }

  const handleViewDetails = (employee: PendingEmployee) => {
    setSelectedEmployee(employee)
    setIsViewDetailsOpen(true)
  }

  // Handle approve button click
  const handleApproveClick = (employee: PendingEmployee) => {
    setSelectedEmployee(employee)
    setIsApproveDialogOpen(true)
  }

  // Handle delete button click
  const handleDeleteClick = (employee: PendingEmployee) => {
    setSelectedEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  // Handle approve submission using the mutation hook
  const handleApprove = async () => {
    if (!selectedEmployee) return

    // Close the dialog first
    setIsApproveDialogOpen(false)

    // Show loading toast
    const loadingToast = toast.loading(`Approving ${selectedEmployee.name}...`)

    try {
      // Use the mutation hook to update employee status to "active"
      const result = await updateEmployeeStatusMutation.mutateAsync({
        id: selectedEmployee.id,
        status: "active"
      })

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success("Employee Approved", {
        description: `${selectedEmployee.name} has been approved successfully and is now active.`,
      })
      
      // Refresh the data
      handleRefresh()
    } catch (error) {
      console.error("Error approving employee:", error)
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      toast.error("Error", {
        description: "Failed to approve employee. Please try again.",
      })
    }
  }

  // Handle delete submission (UI only)
  const handleDelete = () => {
    if (!selectedEmployee) return

    toast.info("Delete Functionality", {
      description: "Delete functionality is not yet implemented.",
    })
    setIsDeleteDialogOpen(false)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading pending employees...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Error loading employees</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Pending Employees</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <ClearPendingEmployeesButton onSuccess={handleRefresh} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
          <Input
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending_approval">Pending Approval</TabsTrigger>
          <TabsTrigger value="document_verification">Document Verification</TabsTrigger>
          <TabsTrigger value="data_incomplete">Data Incomplete</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {pendingEmployees.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">No pending employees found</h3>
                  <p className="text-sm text-muted-foreground">There are no pending employees in the database.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Email</th>
                    <th className="py-2 px-4 text-left">Department</th>
                    <th className="py-2 px-4 text-left">Position</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEmployees
                    .filter((emp: PendingEmployee) => emp.status !== "active" && emp.status !== "approved")
                    .map((emp: PendingEmployee) => (
                      <tr key={emp.id} className="border-b">
                        <td className="py-2 px-4">{emp.name}</td>
                        <td className="py-2 px-4">{emp.email}</td>
                        <td className="py-2 px-4">{emp.department || "-"}</td>
                        <td className="py-2 px-4">{emp.position || "-"}</td>
                        <td className="py-2 px-4">{getStatusBadge(emp.status)}</td>
                        <td className="py-2 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(emp)}
                                className="flex items-center cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleApproveClick(emp)}
                                className="flex items-center cursor-pointer text-green-600 focus:text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(emp)}
                                className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </TabsContent>

        <TabsContent value="pending_approval" className="space-y-4">
          {pendingEmployees.filter((employee: PendingEmployee) => employee.status === "pending_approval").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">No pending employees found</h3>
                  <p className="text-sm text-muted-foreground">
                    There are no pending employees with pending approval status.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingEmployees
                .filter((employee: PendingEmployee) => employee.status === "pending_approval")
                .map((employee: PendingEmployee) => (
                  <Card key={employee.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>{employee.name || "Unknown"}</CardTitle>
                          <CardDescription>{employee.email || "No email"}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(employee.status || "unknown")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="font-medium">ID:</span> {employee.id || "Unknown"}
                        </div>
                        {employee.department && (
                          <div>
                            <span className="font-medium">Department:</span> {employee.department}
                          </div>
                        )}
                        {employee.position && (
                          <div>
                            <span className="font-medium">Position:</span> {employee.position}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Join Date:</span> {formatDate(employee.join_date)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleApproveClick(employee)}
                              className="flex items-center cursor-pointer text-green-600 focus:text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(employee)}
                              className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="document_verification" className="space-y-4">
          {pendingEmployees.filter((employee: PendingEmployee) => employee.status === "document_verification").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">No document verification pending</h3>
                  <p className="text-sm text-muted-foreground">
                    There are no employees waiting for document verification.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingEmployees
                .filter((employee: PendingEmployee) => employee.status === "document_verification")
                .map((employee: PendingEmployee) => (
                  <Card key={employee.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>{employee.name || "Unknown"}</CardTitle>
                          <CardDescription>{employee.email || "No email"}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(employee.status || "unknown")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="font-medium">ID:</span> {employee.id || "Unknown"}
                        </div>
                        {employee.department && (
                          <div>
                            <span className="font-medium">Department:</span> {employee.department}
                          </div>
                        )}
                        {employee.position && (
                          <div>
                            <span className="font-medium">Position:</span> {employee.position}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Join Date:</span> {formatDate(employee.join_date)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleApproveClick(employee)}
                              className="flex items-center cursor-pointer text-green-600 focus:text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(employee)}
                              className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="data_incomplete" className="space-y-4">
          {pendingEmployees.filter((employee: PendingEmployee) => employee.status === "data_incomplete").length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">No incomplete data</h3>
                  <p className="text-sm text-muted-foreground">There are no employees with incomplete data.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingEmployees
                .filter((employee: PendingEmployee) => employee.status === "data_incomplete")
                .map((employee: PendingEmployee) => (
                  <Card key={employee.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>{employee.name || "Unknown"}</CardTitle>
                          <CardDescription>{employee.email || "No email"}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(employee.status || "unknown")}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="font-medium">ID:</span> {employee.id || "Unknown"}
                        </div>
                        {employee.department && (
                          <div>
                            <span className="font-medium">Department:</span> {employee.department}
                          </div>
                        )}
                        {employee.position && (
                          <div>
                            <span className="font-medium">Position:</span> {employee.position}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Join Date:</span> {formatDate(employee.join_date)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(employee)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleApproveClick(employee)}
                              className="flex items-center cursor-pointer text-green-600 focus:text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(employee)}
                              className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Employee Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedEmployee && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Full Name</h4>
                    <p>{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Email</h4>
                    <p>{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Employee ID</h4>
                    <p>{selectedEmployee.id}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Department</h4>
                    <p>{selectedEmployee.department || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Position</h4>
                    <p>{selectedEmployee.position || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                    <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Join Date</h4>
                    <p>{formatDate(selectedEmployee.join_date)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Confirm Approval</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to approve this employee?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center space-y-2">
              <div className="font-semibold text-lg">{selectedEmployee?.name}</div>
              <div className="text-sm text-muted-foreground">
                (Bio ID: {selectedEmployee?.id || "N/A"})
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground text-center">
              This action will update the employee status to "active" and move them to the active list.
            </div>
          </div>
          <DialogFooter className="flex flex-row gap-2 justify-center sm:justify-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
              className="px-6"
              disabled={updateEmployeeStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleApprove}
              disabled={updateEmployeeStatusMutation.isPending}
              className="bg-green-600 hover:bg-green-700 px-6"
            >
              {updateEmployeeStatusMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to delete this employee?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center space-y-2">
              <div className="font-semibold text-lg">{selectedEmployee?.name}</div>
              <div className="text-sm text-muted-foreground">
                (Bio ID: {selectedEmployee?.id || "N/A"})
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground text-center">
              This action cannot be undone. The employee record will be permanently removed from the system.
            </div>
          </div>
          <DialogFooter className="flex flex-row gap-2 justify-center sm:justify-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDelete}
              className="px-6"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}