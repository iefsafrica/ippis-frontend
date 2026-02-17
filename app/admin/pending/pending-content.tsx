// // "use client"

// // import type React from "react"

// // import { useEffect, useState } from "react"
// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"
// // import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// // import { Badge } from "@/components/ui/badge"
// // import { Pagination } from "../components/pagination"
// // import { 
// //   RefreshCw, 
// //   Search, 
// //   Filter, 
// //   FileText, 
// //   CheckCircle, 
// //   XCircle, 
// //   Clock, 
// //   AlertCircle, 
// //   Eye, 
// //   MoreVertical,
// //   User,
// //   Building,
// //   DollarSign,
// //   MapPin,
// //   Contact,
// //   Server
// // } from "lucide-react"
// // import { ClearPendingEmployeesButton } from "../components/clear-pending-employees-button"
// // import { toast } from "sonner"
// // import { 
// //   usePendingEmployees, 
// //   useUpdateEmployeeStatus,
// //   useApprovePendingEmployee,
// //   useDeletePendingEmployee 
// // } from "@/services/hooks/employees/usePendingEmployees"
// // import { Employee3 } from "@/types/employees/pending-employees" 
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuSeparator,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu"
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog"
// // import { ScrollArea } from "@/components/ui/scroll-area"
// // import { Separator } from "@/components/ui/separator"
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table"
// // import {
// //   Tooltip,
// //   TooltipContent,
// //   TooltipProvider,
// //   TooltipTrigger,
// // } from "@/components/ui/tooltip"
// // import { Skeleton } from "@/components/ui/skeleton"
// // import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// // // Define the pagination type
// // interface PaginationProps {
// //   total: number
// //   page: number
// //   limit: number
// //   totalPages: number
// // }

// // interface PendingContentProps {
// //   onRefresh?: () => void
// // }

// // export function PendingContent({ onRefresh }: PendingContentProps) {
// //   const [currentPage, setCurrentPage] = useState(1)
// //   const [searchTerm, setSearchTerm] = useState("")
// //   const [activeTab, setActiveTab] = useState("all")
// //   const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
// //   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
// //   const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
// //   const [selectedEmployee, setSelectedEmployee] = useState<Employee3 | null>(null)

// //   // Use the hooks
// //   const { data, isLoading, error, refetch } = usePendingEmployees(currentPage, 10)
// //   const updateEmployeeStatusMutation = useUpdateEmployeeStatus()
// //   const approvePendingEmployeeMutation = useApprovePendingEmployee()
// //   const deletePendingEmployeeMutation = useDeletePendingEmployee()
 
// //   // @ts-expect-error axios response mismatch
// //   const pendingEmployees: Employee3[] = data?.employees || []
// //   // @ts-expect-error axios response mismatch
// //   const pagination = data?.pagination || {
// //     total: 0,
// //     page: currentPage,
// //     limit: 10,
// //     totalPages: 0
// //   }

// //   // Helper function to get full name
// //   const getFullName = (employee: Employee3) => {
// //     return `${employee.firstname} ${employee.surname}`.trim()
// //   }

// //   // Helper function to get initials for avatar
// //   const getInitials = (employee: Employee3) => {
// //     return `${employee.firstname?.[0] || ''}${employee.surname?.[0] || ''}`.toUpperCase()
// //   }

// //   // Helper function to get full name with other names
// //   const getFullNameWithOtherNames = (employee: Employee3) => {
// //     const baseName = `${employee.firstname} ${employee.surname}`
// //     if (employee.metadata?.["Other Names"]) {
// //       return `${baseName} ${employee.metadata["Other Names"]}`.trim()
// //     }
// //     return baseName
// //   }

// //   const handleRefresh = () => {
// //     refetch()
// //     onRefresh?.()
// //   }

// //   // Handle page change
// //   const handlePageChange = (page: number) => {
// //     setCurrentPage(page)
// //   }

// //   // Function to get status badge
// //   const getStatusBadge = (status: string) => {
// //     switch (status) {
// //       case "pending_approval":
// //         return (
// //           <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
// //             <Clock className="mr-1 h-3 w-3" />
// //             Pending Approval
// //           </Badge>
// //         )
// //       case "approved":
// //         return (
// //           <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
// //             <CheckCircle className="mr-1 h-3 w-3" />
// //             Approved
// //           </Badge>
// //         )
// //       case "rejected":
// //         return (
// //           <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
// //             <XCircle className="mr-1 h-3 w-3" />
// //             Rejected
// //           </Badge>
// //         )
// //       case "document_verification":
// //         return (
// //           <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
// //             <FileText className="mr-1 h-3 w-3" />
// //             Document Verification
// //           </Badge>
// //         )
// //       case "data_incomplete":
// //         return (
// //           <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
// //             <AlertCircle className="mr-1 h-3 w-3" />
// //             Data Incomplete
// //           </Badge>
// //         )
// //       default:
// //         return <Badge variant="secondary">{status}</Badge>
// //     }
// //   }

// //   const formatDate = (dateString: string | null | undefined) => {
// //     if (!dateString) return "N/A"
// //     try {
// //       const date = new Date(dateString)
// //       if (isNaN(date.getTime())) {
// //         return "Invalid Date"
// //       }
// //       return new Intl.DateTimeFormat("en-GB", {
// //         day: "2-digit",
// //         month: "short",
// //         year: "numeric",
// //         hour: "2-digit",
// //         minute: "2-digit",
// //       }).format(date)
// //     } catch (error) {
// //       console.error("Error formatting date:", dateString, error)
// //       return "Invalid Date"
// //     }
// //   }

// //   const formatSimpleDate = (dateString: string | null | undefined) => {
// //     if (!dateString) return "N/A"
// //     try {
// //       const date = new Date(dateString)
// //       if (isNaN(date.getTime())) {
// //         return "Invalid Date"
// //       }
// //       return new Intl.DateTimeFormat("en-GB", {
// //         day: "2-digit",
// //         month: "short",
// //         year: "numeric",
// //       }).format(date)
// //     } catch (error) {
// //       console.error("Error formatting date:", dateString, error)
// //       return "Invalid Date"
// //     }
// //   }

// //   const handleSearch = (e: React.FormEvent) => {
// //     e.preventDefault()
// //     // If your backend supports search, you should pass it in the query
// //     onRefresh?.()

// //     // Implement search functionality
// //     console.log("Searching for:", searchTerm)
// //     handleRefresh()
// //   }

// //   const handleViewDetails = (employee: Employee3) => {
// //     setSelectedEmployee(employee)
// //     setIsViewDetailsOpen(true)
// //   }

// //   // Handle approve button click
// //   const handleApproveClick = (employee: Employee3) => {
// //     setSelectedEmployee(employee)
// //     setIsApproveDialogOpen(true)
// //   }

// //   // Handle delete button click
// //   const handleDeleteClick = (employee: Employee3) => {
// //     setSelectedEmployee(employee)
// //     setIsDeleteDialogOpen(true)
// //   }

// //   // Handle approve submission using the new approvePendingEmployee hook
// //   const handleApprove = async () => {
// //     if (!selectedEmployee) return

// //     // Close the dialog first
// //     setIsApproveDialogOpen(false)

// //     // Show loading toast
// //     const loadingToast = toast.loading(`Approving ${getFullName(selectedEmployee)}...`)

// //     try {
// //       console.log("Approving employee:", {
// //         registrationId: selectedEmployee.registration_id,
// //         id: selectedEmployee.id.toString()
// //       })

// //       // Use the new approvePendingEmployee mutation hook with PATCH method
// //       const result = await approvePendingEmployeeMutation.mutateAsync({
// //         registrationId: selectedEmployee.registration_id,
// //         id: selectedEmployee.id.toString()
// //       })

// //       // Dismiss loading toast and show success
// //       toast.dismiss(loadingToast)
// //       toast.success("Employee Approved", {
// //         description: `${getFullName(selectedEmployee)} has been approved successfully and is now active.`,
// //       })
      
// //       // Refresh the data
// //       handleRefresh()
// //     } catch (error: any) {
// //       console.error("Error approving employee:", error)
// //       // Dismiss loading toast and show error
// //       toast.dismiss(loadingToast)
      
// //       let errorMessage = "Failed to approve employee. Please try again."
// //       if (error.response?.data?.error) {
// //         errorMessage = error.response.data.error
// //       } else if (error.message) {
// //         errorMessage = error.message
// //       }
      
// //       toast.error("Error", {
// //         description: errorMessage,
// //       })
// //     }
// //   }

// //   // Handle delete submission using the new deletePendingEmployee hook
// //   const handleDelete = async () => {
// //     if (!selectedEmployee) return

// //     // Close the dialog first
// //     setIsDeleteDialogOpen(false)

// //     // Show loading toast
// //     const loadingToast = toast.loading(`Deleting ${getFullName(selectedEmployee)}...`)

// //     try {
// //       console.log("Deleting employee:", {
// //         registrationId: selectedEmployee.registration_id
// //       })

// //       // Use the new deletePendingEmployee mutation hook
// //       const result = await deletePendingEmployeeMutation.mutateAsync({
// //         registrationId: selectedEmployee.registration_id
// //       })

// //       // Dismiss loading toast and show success
// //       toast.dismiss(loadingToast)
// //       toast.success("Employee Deleted", {
// //         description: `${getFullName(selectedEmployee)} has been deleted successfully.`,
// //       })
      
// //       // Refresh the data
// //       handleRefresh()
// //     } catch (error: any) {
// //       console.error("Error deleting employee:", error)
// //       // Dismiss loading toast and show error
// //       toast.dismiss(loadingToast)
      
// //       let errorMessage = "Failed to delete employee. Please try again."
// //       if (error.response?.data?.error) {
// //         errorMessage = error.response.data.error
// //       } else if (error.message) {
// //         errorMessage = error.message
// //       }
      
// //       toast.error("Error", {
// //         description: errorMessage,
// //       })
// //     }
// //   }

// //   // Alternative method using updateEmployeeStatus if needed
// //   const handleApproveWithStatusUpdate = async () => {
// //     if (!selectedEmployee) return

// //     // Close the dialog first
// //     setIsApproveDialogOpen(false)

// //     // Show loading toast
// //     const loadingToast = toast.loading(`Approving ${getFullName(selectedEmployee)}...`)

// //     try {
// //       // Use the updateEmployeeStatus mutation hook as fallback
// //       const result = await updateEmployeeStatusMutation.mutateAsync({
// //         id: selectedEmployee.id.toString(),
// //         status: "active"
// //       })

// //       // Dismiss loading toast and show success
// //       toast.dismiss(loadingToast)
// //       toast.success("Employee Approved", {
// //         description: `${getFullName(selectedEmployee)} has been approved successfully and is now active.`,
// //       })
      
// //       // Refresh the data
// //       handleRefresh()
// //     } catch (error: any) {
// //       console.error("Error approving employee:", error)
// //       // Dismiss loading toast and show error
// //       toast.dismiss(loadingToast)
      
// //       let errorMessage = "Failed to approve employee. Please try again."
// //       if (error.response?.data?.error) {
// //         errorMessage = error.response.data.error
// //       } else if (error.message) {
// //         errorMessage = error.message
// //       }
      
// //       toast.error("Error", {
// //         description: errorMessage,
// //       })
// //     }
// //   }

// //   // Determine which mutation is currently pending for loading states
// //   const isApprovePending = approvePendingEmployeeMutation.isPending || updateEmployeeStatusMutation.isPending
// //   const isDeletePending = deletePendingEmployeeMutation.isPending

// //   // Show loading state
// //   if (isLoading) {
// //     return (
// //       <div className="space-y-6">
// //         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
// //           <div className="space-y-2">
// //             <Skeleton className="h-8 w-64" />
// //             <Skeleton className="h-4 w-96" />
// //           </div>
// //           <div className="flex items-center gap-2">
// //             <Skeleton className="h-9 w-24" />
// //             <Skeleton className="h-9 w-32" />
// //           </div>
// //         </div>

// //         <div className="flex flex-col sm:flex-row justify-between gap-4">
// //           <Skeleton className="h-10 w-full sm:w-80" />
// //           <Skeleton className="h-10 w-24" />
// //         </div>

// //         <Card>
// //           <CardHeader>
// //             <Skeleton className="h-6 w-32" />
// //           </CardHeader>
// //           <CardContent>
// //             <div className="space-y-4">
// //               {[...Array(5)].map((_, i) => (
// //                 <div key={i} className="flex items-center space-x-4">
// //                   <Skeleton className="h-12 w-12 rounded-full" />
// //                   <div className="space-y-2">
// //                     <Skeleton className="h-4 w-40" />
// //                     <Skeleton className="h-3 w-32" />
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>
// //     )
// //   }

// //   // Show error state
// //   if (error) {
// //     return (
// //       <Card className="w-full">
// //         <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
// //           <div className="rounded-full bg-red-100 p-3">
// //             <AlertCircle className="h-8 w-8 text-red-600" />
// //           </div>
// //           <div className="text-center space-y-2">
// //             <h3 className="text-lg font-medium">Error loading employees</h3>
// //             <p className="text-sm text-muted-foreground max-w-md">{error.message}</p>
// //           </div>
// //           <Button onClick={handleRefresh} variant="outline">
// //             <RefreshCw className="mr-2 h-4 w-4" />
// //             Try Again
// //           </Button>
// //         </CardContent>
// //       </Card>
// //     )
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
// //         <div className="space-y-1">
// //           <h1 className="text-3xl font-bold tracking-tight">Pending Employees</h1>
// //           <p className="text-muted-foreground">
// //             Manage and review employee submissions awaiting approval
// //           </p>
// //         </div>
// //         <div className="flex items-center gap-2">
// //           <TooltipProvider>
// //             <Tooltip>
// //               <TooltipTrigger asChild>
// //                 <Button onClick={handleRefresh} variant="outline" size="sm">
// //                   <RefreshCw className="h-4 w-4" />
// //                 </Button>
// //               </TooltipTrigger>
// //               <TooltipContent>
// //                 <p>Refresh data</p>
// //               </TooltipContent>
// //             </Tooltip>
// //           </TooltipProvider>
// //           <ClearPendingEmployeesButton onSuccess={handleRefresh} />
// //         </div>
// //       </div>

// //       <Card>
// //         <CardHeader className="pb-3">
// //           <CardTitle>Employee Management</CardTitle>
// //           <CardDescription>
// //             Search, filter, and manage pending employee submissions
// //           </CardDescription>
// //         </CardHeader>
// //         <CardContent>
// //           <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
// //             <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
// //               <div className="relative w-full sm:w-80">
// //                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
// //                 <Input
// //                   placeholder="Search by name, email, or ID..."
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   className="pl-8"
// //                 />
// //               </div>
// //               <Button type="submit">Search</Button>
// //             </form>

// //             <div className="flex items-center gap-2">
// //               <Button variant="outline" size="sm">
// //                 <Filter className="mr-2 h-4 w-4" />
// //                 Filter
// //               </Button>
// //             </div>
// //           </div>

// //           <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
// //             <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
// //               <TabsTrigger value="all" className="flex items-center gap-2">
// //                 All
// //                 <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
// //                   {pendingEmployees.filter(emp => emp.status !== "active" && emp.status !== "approved").length}
// //                 </Badge>
// //               </TabsTrigger>
// //               <TabsTrigger value="pending_approval" className="flex items-center gap-2">
// //                 <Clock className="h-4 w-4" />
// //                 Pending
// //               </TabsTrigger>
// //               <TabsTrigger value="document_verification" className="flex items-center gap-2">
// //                 <FileText className="h-4 w-4" />
// //                 Documents
// //               </TabsTrigger>
// //               <TabsTrigger value="data_incomplete" className="flex items-center gap-2">
// //                 <AlertCircle className="h-4 w-4" />
// //                 Incomplete
// //               </TabsTrigger>
// //             </TabsList>

// //             <TabsContent value="all" className="space-y-4 mt-6">
// //               {pendingEmployees.length === 0 ? (
// //                 <Card>
// //                   <CardContent className="flex flex-col items-center justify-center py-12">
// //                     <div className="rounded-full bg-muted p-3 mb-4">
// //                       <User className="h-6 w-6 text-muted-foreground" />
// //                     </div>
// //                     <div className="text-center space-y-2">
// //                       <h3 className="text-lg font-medium">No pending employees found</h3>
// //                       <p className="text-sm text-muted-foreground">There are no pending employees in the database.</p>
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               ) : (
// //                 <div className="rounded-md border">
// //                   <Table>
// //                     <TableHeader>
// //                       <TableRow>
// //                         <TableHead>Employee</TableHead>
// //                         <TableHead>Contact</TableHead>
// //                         <TableHead>Department</TableHead>
// //                         <TableHead>Position</TableHead>
// //                         <TableHead>Status</TableHead>
// //                         <TableHead className="text-right">Actions</TableHead>
// //                       </TableRow>
// //                     </TableHeader>
// //                     <TableBody>
// //                       {pendingEmployees
// //                         .filter((emp: Employee3) => emp.status !== "active" && emp.status !== "approved")
// //                         .map((emp: Employee3) => (
// //                           <TableRow key={emp.id} className="group">
// //                             <TableCell>
// //                               <div className="flex items-center gap-3">
// //                                 <Avatar className="h-9 w-9 border">
// //                                   <AvatarFallback className="bg-primary/10 text-primary">
// //                                     {getInitials(emp)}
// //                                   </AvatarFallback>
// //                                 </Avatar>
// //                                 <div className="flex flex-col">
// //                                   <span className="font-medium">{getFullName(emp)}</span>
// //                                   <span className="text-xs text-muted-foreground">
// //                                     ID: {emp.registration_id}
// //                                   </span>
// //                                 </div>
// //                               </div>
// //                             </TableCell>
// //                             <TableCell>
// //                               <div className="flex flex-col">
// //                                 <span className="text-sm">{emp.email}</span>
// //                                 {emp.metadata?.["Phone Number"] && (
// //                                   <span className="text-xs text-muted-foreground">
// //                                     {emp.metadata["Phone Number"]}
// //                                   </span>
// //                                 )}
// //                               </div>
// //                             </TableCell>
// //                             <TableCell>
// //                               <div className="flex items-center gap-2">
// //                                 <Building className="h-4 w-4 text-muted-foreground" />
// //                                 <span>{emp.department || "-"}</span>
// //                               </div>
// //                             </TableCell>
// //                             <TableCell>{emp.position || "-"}</TableCell>
// //                             <TableCell>{getStatusBadge(emp.status)}</TableCell>
// //                             <TableCell className="text-right">
// //                               <DropdownMenu>
// //                                 <DropdownMenuTrigger asChild>
// //                                   <Button variant="ghost" className="h-8 w-8 p-0">
// //                                     <span className="sr-only">Open menu</span>
// //                                     <MoreVertical className="h-4 w-4" />
// //                                   </Button>
// //                                 </DropdownMenuTrigger>
// //                                 <DropdownMenuContent align="end" className="w-48">
// //                                   <DropdownMenuItem
// //                                     onClick={() => handleViewDetails(emp)}
// //                                     className="flex items-center cursor-pointer"
// //                                   >
// //                                     <Eye className="mr-2 h-4 w-4" />
// //                                     View Details
// //                                   </DropdownMenuItem>
// //                                   <DropdownMenuSeparator />
// //                                   <DropdownMenuItem
// //                                     onClick={() => handleApproveClick(emp)}
// //                                     className="flex items-center cursor-pointer text-green-600 focus:text-green-600"
// //                                     disabled={isApprovePending}
// //                                   >
// //                                     <CheckCircle className="mr-2 h-4 w-4" />
// //                                     {isApprovePending ? "Approving..." : "Approve Employee"}
// //                                   </DropdownMenuItem>
// //                                   <DropdownMenuItem
// //                                     onClick={() => handleDeleteClick(emp)}
// //                                     className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
// //                                     disabled={isDeletePending}
// //                                   >
// //                                     <XCircle className="mr-2 h-4 w-4" />
// //                                     {isDeletePending ? "Deleting..." : "Delete"}
// //                                   </DropdownMenuItem>
// //                                 </DropdownMenuContent>
// //                               </DropdownMenu>
// //                             </TableCell>
// //                           </TableRow>
// //                         ))}
// //                     </TableBody>
// //                   </Table>
// //                 </div>
// //               )}

// //               {pagination.totalPages > 1 && (
// //                 <div className="flex items-center justify-end">
// //                   <Pagination 
// //                     currentPage={pagination.page} 
// //                     totalPages={pagination.totalPages} 
// //                     onPageChange={handlePageChange} 
// //                   />
// //                 </div>
// //               )}
// //             </TabsContent>

// //             {["pending_approval", "document_verification", "data_incomplete"].map((tab) => (
// //               <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
// //                 {pendingEmployees.filter((employee: Employee3) => employee.status === tab).length === 0 ? (
// //                   <Card>
// //                     <CardContent className="flex flex-col items-center justify-center py-12">
// //                       <div className="rounded-full bg-muted p-3 mb-4">
// //                         <User className="h-6 w-6 text-muted-foreground" />
// //                       </div>
// //                       <div className="text-center space-y-2">
// //                         <h3 className="text-lg font-medium">
// //                           {tab === "pending_approval" && "No pending approvals"}
// //                           {tab === "document_verification" && "No document verification pending"}
// //                           {tab === "data_incomplete" && "No incomplete data"}
// //                         </h3>
// //                         <p className="text-sm text-muted-foreground">
// //                           {tab === "pending_approval" && "There are no pending employees with pending approval status."}
// //                           {tab === "document_verification" && "There are no employees waiting for document verification."}
// //                           {tab === "data_incomplete" && "There are no employees with incomplete data."}
// //                         </p>
// //                       </div>
// //                     </CardContent>
// //                   </Card>
// //                 ) : (
// //                   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
// //                     {pendingEmployees
// //                       .filter((employee: Employee3) => employee.status === tab)
// //                       .map((employee: Employee3) => (
// //                         <Card key={employee.id} className="overflow-hidden transition-all hover:shadow-md">
// //                           <CardHeader className="pb-3">
// //                             <div className="flex justify-between items-start">
// //                               <div className="flex items-center gap-3">
// //                                 <Avatar className="h-10 w-10 border">
// //                                   <AvatarFallback className="bg-primary/10 text-primary">
// //                                     {getInitials(employee)}
// //                                   </AvatarFallback>
// //                                 </Avatar>
// //                                 <div>
// //                                   <CardTitle className="text-lg">{getFullName(employee)}</CardTitle>
// //                                   <CardDescription>{employee.email}</CardDescription>
// //                                 </div>
// //                               </div>
// //                               {getStatusBadge(employee.status)}
// //                             </div>
// //                           </CardHeader>
// //                           <CardContent className="pb-3">
// //                             <div className="space-y-2 text-sm">
// //                               <div className="flex justify-between">
// //                                 <span className="text-muted-foreground">Department:</span>
// //                                 <span className="font-medium">{employee.department || "N/A"}</span>
// //                               </div>
// //                               <div className="flex justify-between">
// //                                 <span className="text-muted-foreground">Position:</span>
// //                                 <span className="font-medium">{employee.position || "N/A"}</span>
// //                               </div>
// //                               <div className="flex justify-between">
// //                                 <span className="text-muted-foreground">Submitted:</span>
// //                                 <span className="font-medium">{formatDate(employee.submission_date)}</span>
// //                               </div>
// //                             </div>
// //                           </CardContent>
// //                           <CardFooter className="bg-muted/50 pt-3">
// //                             <div className="flex justify-between w-full">
// //                               <TooltipProvider>
// //                                 <Tooltip>
// //                                   <TooltipTrigger asChild>
// //                                     <Button 
// //                                       variant="outline" 
// //                                       size="sm" 
// //                                       onClick={() => handleViewDetails(employee)}
// //                                     >
// //                                       <Eye className="h-4 w-4" />
// //                                     </Button>
// //                                   </TooltipTrigger>
// //                                   <TooltipContent>
// //                                     <p>View details</p>
// //                                   </TooltipContent>
// //                                 </Tooltip>
// //                               </TooltipProvider>
                              
// //                               <DropdownMenu>
// //                                 <DropdownMenuTrigger asChild>
// //                                   <Button variant="outline" size="sm">
// //                                     <MoreVertical className="h-4 w-4" />
// //                                   </Button>
// //                                 </DropdownMenuTrigger>
// //                                 <DropdownMenuContent align="end">
// //                                   <DropdownMenuItem
// //                                     onClick={() => handleViewDetails(employee)}
// //                                     className="flex items-center cursor-pointer"
// //                                   >
// //                                     <Eye className="mr-2 h-4 w-4" />
// //                                     View Details
// //                                   </DropdownMenuItem>
// //                                   <DropdownMenuSeparator />
// //                                   <DropdownMenuItem
// //                                     onClick={() => handleApproveClick(employee)}
// //                                     className="flex items-center cursor-pointer text-green-600 focus:text-green-600"
// //                                     disabled={isApprovePending}
// //                                   >
// //                                     <CheckCircle className="mr-2 h-4 w-4" />
// //                                     {isApprovePending ? "Approving..." : "Approve"}
// //                                   </DropdownMenuItem>
// //                                   <DropdownMenuItem
// //                                     onClick={() => handleDeleteClick(employee)}
// //                                     className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
// //                                     disabled={isDeletePending}
// //                                   >
// //                                     <XCircle className="mr-2 h-4 w-4" />
// //                                     {isDeletePending ? "Deleting..." : "Delete"}
// //                                   </DropdownMenuItem>
// //                                 </DropdownMenuContent>
// //                               </DropdownMenu>
// //                             </div>
// //                           </CardFooter>
// //                         </Card>
// //                       ))}
// //                   </div>
// //                 )}
// //               </TabsContent>
// //             ))}
// //           </Tabs>
// //         </CardContent>
// //       </Card>

// //       {/* View Details Dialog */}
// //       <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
// //         <DialogContent className="max-w-4xl h-[90vh] w-full p-0 flex flex-col">
// //           <DialogHeader className="px-6 py-4 border-b shrink-0">
// //             <div className="flex items-center gap-3">
// //               {selectedEmployee && (
// //                 <Avatar className="h-12 w-12 border-2">
// //                   <AvatarFallback className="bg-primary/10 text-primary text-lg">
// //                     {getInitials(selectedEmployee)}
// //                   </AvatarFallback>
// //                 </Avatar>
// //               )}
// //               <div>
// //                 <DialogTitle className="text-2xl font-bold">
// //                   {selectedEmployee ? getFullName(selectedEmployee) : 'Employee Details'}
// //                 </DialogTitle>
// //                 <DialogDescription>
// //                   Complete information about employee submission
// //                 </DialogDescription>
// //               </div>
// //             </div>
// //           </DialogHeader>
          
// //           {/* Scrollable content area */}
// //           <ScrollArea className="flex-1 px-6">
// //             <div className="space-y-6 py-2">
// //               {selectedEmployee && (
// //                 <>
// //                   {/* Basic Information Section */}
// //                   <Card>
// //                     <CardHeader className="pb-3">
// //                       <CardTitle className="flex items-center gap-2 text-lg">
// //                         <User className="h-5 w-5 text-primary" />
// //                         Basic Information
// //                       </CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">First Name</label>
// //                           <p className="text-sm">{selectedEmployee.firstname}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Surname</label>
// //                           <p className="text-sm">{selectedEmployee.surname}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Other Names</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Other Names"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Title</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.Title || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Gender</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.Gender || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Date of Birth"] ? formatSimpleDate(selectedEmployee.metadata["Date of Birth"]) : "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Marital Status"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Phone Number"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Email</label>
// //                           <p className="text-sm break-all">{selectedEmployee.email}</p>
// //                         </div>
// //                       </div>
// //                     </CardContent>
// //                   </Card>

// //                   {/* Employment Information Section */}
// //                   <Card>
// //                     <CardHeader className="pb-3">
// //                       <CardTitle className="flex items-center gap-2 text-lg">
// //                         <Building className="h-5 w-5 text-primary" />
// //                         Employment Information
// //                       </CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Employee ID"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Registration ID</label>
// //                           <p className="text-sm font-mono">{selectedEmployee.registration_id}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Department</label>
// //                           <p className="text-sm">{selectedEmployee.department || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Position</label>
// //                           <p className="text-sm">{selectedEmployee.position || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Cadre</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.Cadre || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Employment Type"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Date of First Appointment</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Date of First Appointment"] ? formatSimpleDate(selectedEmployee.metadata["Date of First Appointment"]) : "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Probation Period</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Probation Period"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Work Location</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Work Location"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Organization</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.Organization || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Service No</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Service No"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">File No</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["File No"] || "N/A"}</p>
// //                         </div>
// //                       </div>
// //                     </CardContent>
// //                   </Card>

// //                   {/* Salary and Grade Information */}
// //                   <Card>
// //                     <CardHeader className="pb-3">
// //                       <CardTitle className="flex items-center gap-2 text-lg">
// //                         <DollarSign className="h-5 w-5 text-primary" />
// //                         Salary & Grade Information
// //                       </CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Salary</label>
// //                           <p className="text-sm font-semibold">
// //                             {selectedEmployee.metadata?.Salary ? `₦${parseInt(selectedEmployee.metadata.Salary).toLocaleString()}` : "N/A"}
// //                           </p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Salary Structure</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Salary Structure"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">GL</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.GL || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Step</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.Step || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Payment Method"] || "N/A"}</p>
// //                         </div>
// //                       </div>
// //                     </CardContent>
// //                   </Card>

// //                   {/* Bank and Pension Information */}
// //                   <Card>
// //                     <CardHeader className="pb-3">
// //                       <CardTitle className="flex items-center gap-2 text-lg">
// //                         <Building className="h-5 w-5 text-primary" />
// //                         Bank & Pension Information
// //                       </CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Bank Name"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Account Number</label>
// //                           <p className="text-sm font-mono">{selectedEmployee.metadata?.["Account Number"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">PFA Name</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["PFA Name"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">RSA PIN</label>
// //                           <p className="text-sm font-mono">{selectedEmployee.metadata?.["RSA PIN"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">BVN Verified</label>
// //                           <Badge variant={selectedEmployee.metadata?.["BVN Verified"] === "YES" ? "default" : "secondary"}>
// //                             {selectedEmployee.metadata?.["BVN Verified"] || "N/A"}
// //                           </Badge>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">NIN Verified</label>
// //                           <Badge variant={selectedEmployee.metadata?.["NIN Verified"] === "YES" ? "default" : "secondary"}>
// //                             {selectedEmployee.metadata?.["NIN Verified"] || "N/A"}
// //                           </Badge>
// //                         </div>
// //                       </div>
// //                     </CardContent>
// //                   </Card>

// //                   {/* Address Information */}
// //                   <Card>
// //                     <CardHeader className="pb-3">
// //                       <CardTitle className="flex items-center gap-2 text-lg">
// //                         <MapPin className="h-5 w-5 text-primary" />
// //                         Address Information
// //                       </CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                         <div className="space-y-1 md:col-span-2">
// //                           <label className="text-sm font-medium text-muted-foreground">Residential Address</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Residential Address"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">State of Residence</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["State of Residence"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">State of Origin</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["State of Origin"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">LGA</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.LGA || "N/A"}</p>
// //                         </div>
// //                       </div>
// //                     </CardContent>
// //                   </Card>

// //                   {/* Next of Kin Information */}
// //                   <Card>
// //                     <CardHeader className="pb-3">
// //                       <CardTitle className="flex items-center gap-2 text-lg">
// //                         <Contact className="h-5 w-5 text-primary" />
// //                         Next of Kin Information
// //                       </CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Next of Kin Name</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Name"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Next of Kin Relationship</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Relationship"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Next of Kin Phone</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Phone"] || "N/A"}</p>
// //                         </div>
// //                         <div className="space-y-1 md:col-span-2">
// //                           <label className="text-sm font-medium text-muted-foreground">Next of Kin Address</label>
// //                           <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Address"] || "N/A"}</p>
// //                         </div>
// //                       </div>
// //                     </CardContent>
// //                   </Card>

// //                   {/* System Information */}
// //                   <Card>
// //                     <CardHeader className="pb-3">
// //                       <CardTitle className="flex items-center gap-2 text-lg">
// //                         <Server className="h-5 w-5 text-primary" />
// //                         System Information
// //                       </CardTitle>
// //                     </CardHeader>
// //                     <CardContent>
// //                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Status</label>
// //                           <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Source</label>
// //                           <Badge variant="outline">{selectedEmployee.source || "N/A"}</Badge>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Submission Date</label>
// //                           <p className="text-sm">{formatDate(selectedEmployee.submission_date)}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Created At</label>
// //                           <p className="text-sm">{formatDate(selectedEmployee.created_at)}</p>
// //                         </div>
// //                         <div className="space-y-1">
// //                           <label className="text-sm font-medium text-muted-foreground">Updated At</label>
// //                           <p className="text-sm">{formatDate(selectedEmployee.updated_at)}</p>
// //                         </div>
// //                       </div>
// //                     </CardContent>
// //                   </Card>
// //                 </>
// //               )}
// //             </div>
// //           </ScrollArea>
          
// //           <DialogFooter className="px-6 py-4 border-t shrink-0">
// //             <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
// //             {selectedEmployee && (
// //               <Button 
// //                 onClick={() => handleApproveClick(selectedEmployee)}
// //                 disabled={isApprovePending}
// //               >
// //                 <CheckCircle className="mr-2 h-4 w-4" />
// //                 {isApprovePending ? "Approving..." : "Approve Employee"}
// //               </Button>
// //             )}
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>


// //       <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
// //         <DialogContent className="sm:max-w-md">
// //           <DialogHeader>
// //             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
// //               <CheckCircle className="h-6 w-6 text-green-600" />
// //             </div>
// //             <DialogTitle className="text-xl font-bold text-center">Approve Employee</DialogTitle>
// //             <DialogDescription className="text-center pt-2">
// //               Are you sure you want to approve this employee?
// //             </DialogDescription>
// //           </DialogHeader>
// //           <div className="py-4">
// //             <div className="text-center space-y-2">
// //               <div className="font-semibold text-lg">
// //                 {selectedEmployee ? getFullName(selectedEmployee) : 'Employee'}
// //               </div>
// //               <div className="text-sm text-muted-foreground">
// //                 Registration ID: {selectedEmployee?.registration_id || "N/A"}
// //               </div>
// //             </div>
// //             <div className="mt-4 p-4 bg-muted rounded-lg">
// //               <div className="text-sm text-muted-foreground text-center">
// //                 This action will update the employee status to "active" and move them to the active employees list.
// //               </div>
// //             </div>
// //           </div>
// //           <DialogFooter className="flex flex-row gap-2 justify-center sm:justify-center">
// //             <Button 
// //               type="button" 
// //               variant="outline" 
// //               onClick={() => setIsApproveDialogOpen(false)}
// //               className="px-6"
// //               disabled={isApprovePending}
// //             >
// //               Cancel
// //             </Button>
// //             <Button 
// //               type="button" 
// //               onClick={handleApprove}
// //               disabled={isApprovePending}
// //               className="bg-green-600 hover:bg-green-700 px-6"
// //             >
// //               {isApprovePending ? (
// //                 <>
// //                   <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
// //                   Approving...
// //                 </>
// //               ) : (
// //                 "Approve Employee"
// //               )}
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Delete Confirmation Dialog */}
// //       <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
// //         <DialogContent className="sm:max-w-md">
// //           <DialogHeader>
// //             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
// //               <XCircle className="h-6 w-6 text-red-600" />
// //             </div>
// //             <DialogTitle className="text-xl font-bold text-center">Delete Employee</DialogTitle>
// //             <DialogDescription className="text-center pt-2">
// //               Are you sure you want to delete this employee?
// //             </DialogDescription>
// //           </DialogHeader>
// //           <div className="py-4">
// //             <div className="text-center space-y-2">
// //               <div className="font-semibold text-lg">
// //                 {selectedEmployee ? getFullName(selectedEmployee) : 'Employee'}
// //               </div>
// //               <div className="text-sm text-muted-foreground">
// //                 Registration ID: {selectedEmployee?.registration_id || "N/A"}
// //               </div>
// //             </div>
// //             <div className="mt-4 p-4 bg-muted rounded-lg">
// //               <div className="text-sm text-muted-foreground text-center">
// //                 This action cannot be undone. The employee record will be permanently removed from the system.
// //               </div>
// //             </div>
// //           </div>
// //           <DialogFooter className="flex flex-row gap-2 justify-center sm:justify-center">
// //             <Button 
// //               type="button" 
// //               variant="outline" 
// //               onClick={() => setIsDeleteDialogOpen(false)}
// //               className="px-6"
// //               disabled={isDeletePending}
// //             >
// //               Cancel
// //             </Button>
// //             <Button 
// //               type="button" 
// //               variant="destructive"
// //               onClick={handleDelete}
// //               disabled={isDeletePending}
// //               className="px-6"
// //             >
// //               {isDeletePending ? (
// //                 <>
// //                   <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
// //                   Deleting...
// //                 </>
// //               ) : (
// //                 "Delete Employee"
// //               )}
// //             </Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>
// //     </div>
// //   )
// // }


// "use client"

// import type React from "react"

// import { useEffect, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Pagination } from "../components/pagination"
// import { 
//   RefreshCw, 
//   Search, 
//   Filter, 
//   FileText, 
//   CheckCircle, 
//   XCircle, 
//   Clock, 
//   AlertCircle, 
//   Eye, 
//   MoreVertical,
//   User,
//   Building,
//   DollarSign,
//   MapPin,
//   Contact,
//   Server,
//   Trash2,
//   ShieldAlert
// } from "lucide-react"
// import { ClearPendingEmployeesButton } from "../components/clear-pending-employees-button"
// import { toast } from "sonner"
// import { 
//   usePendingEmployees, 
//   useUpdateEmployeeStatus,
//   useApprovePendingEmployee,
//   useDeletePendingEmployee 
// } from "@/services/hooks/employees/usePendingEmployees"
// import { Employee3 } from "@/types/employees/pending-employees" 
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Separator } from "@/components/ui/separator"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip"
// import { Skeleton } from "@/components/ui/skeleton"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// // Define the pagination type
// interface PaginationProps {
//   total: number
//   page: number
//   limit: number
//   totalPages: number
// }

// interface PendingContentProps {
//   onRefresh?: () => void
// }

// export function PendingContent({ onRefresh }: PendingContentProps) {
//   const [currentPage, setCurrentPage] = useState(1)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [activeTab, setActiveTab] = useState("all")
//   const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
//   const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee3 | null>(null)

//   // Use the hooks
//   const { data, isLoading, error, refetch } = usePendingEmployees(currentPage, 10)
//   const updateEmployeeStatusMutation = useUpdateEmployeeStatus()
//   const approvePendingEmployeeMutation = useApprovePendingEmployee()
//   const deletePendingEmployeeMutation = useDeletePendingEmployee()
 
//   // @ts-expect-error axios response mismatch
//   const pendingEmployees: Employee3[] = data?.employees || []
//   // @ts-expect-error axios response mismatch
//   const pagination = data?.pagination || {
//     total: 0,
//     page: currentPage,
//     limit: 10,
//     totalPages: 0
//   }

//   // Helper function to get full name
//   const getFullName = (employee: Employee3) => {
//     return `${employee.firstname} ${employee.surname}`.trim()
//   }

//   // Helper function to get initials for avatar
//   const getInitials = (employee: Employee3) => {
//     return `${employee.firstname?.[0] || ''}${employee.surname?.[0] || ''}`.toUpperCase()
//   }

//   // Helper function to get full name with other names
//   const getFullNameWithOtherNames = (employee: Employee3) => {
//     const baseName = `${employee.firstname} ${employee.surname}`
//     if (employee.metadata?.["Other Names"]) {
//       return `${baseName} ${employee.metadata["Other Names"]}`.trim()
//     }
//     return baseName
//   }

//   const handleRefresh = () => {
//     refetch()
//     onRefresh?.()
//   }

//   // Handle page change
//   const handlePageChange = (page: number) => {
//     setCurrentPage(page)
//   }

//   // Function to get status badge
//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "pending_approval":
//         return (
//           <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
//             <Clock className="mr-1 h-3 w-3" />
//             Pending Approval
//           </Badge>
//         )
//       case "approved":
//         return (
//           <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
//             <CheckCircle className="mr-1 h-3 w-3" />
//             Approved
//           </Badge>
//         )
//       case "rejected":
//         return (
//           <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
//             <XCircle className="mr-1 h-3 w-3" />
//             Rejected
//           </Badge>
//         )
//       case "document_verification":
//         return (
//           <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
//             <FileText className="mr-1 h-3 w-3" />
//             Document Verification
//           </Badge>
//         )
//       case "data_incomplete":
//         return (
//           <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
//             <AlertCircle className="mr-1 h-3 w-3" />
//             Data Incomplete
//           </Badge>
//         )
//       default:
//         return <Badge variant="secondary">{status}</Badge>
//     }
//   }

//   const formatDate = (dateString: string | null | undefined) => {
//     if (!dateString) return "N/A"
//     try {
//       const date = new Date(dateString)
//       if (isNaN(date.getTime())) {
//         return "Invalid Date"
//       }
//       return new Intl.DateTimeFormat("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       }).format(date)
//     } catch (error) {
//       console.error("Error formatting date:", dateString, error)
//       return "Invalid Date"
//     }
//   }

//   const formatSimpleDate = (dateString: string | null | undefined) => {
//     if (!dateString) return "N/A"
//     try {
//       const date = new Date(dateString)
//       if (isNaN(date.getTime())) {
//         return "Invalid Date"
//       }
//       return new Intl.DateTimeFormat("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       }).format(date)
//     } catch (error) {
//       console.error("Error formatting date:", dateString, error)
//       return "Invalid Date"
//     }
//   }

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault()
//     // If your backend supports search, you should pass it in the query
//     onRefresh?.()

//     // Implement search functionality
//     console.log("Searching for:", searchTerm)
//     handleRefresh()
//   }

//   const handleViewDetails = (employee: Employee3) => {
//     setSelectedEmployee(employee)
//     setIsViewDetailsOpen(true)
//   }

//   // Handle approve button click
//   const handleApproveClick = (employee: Employee3) => {
//     setSelectedEmployee(employee)
//     setIsApproveDialogOpen(true)
//   }

//   // Handle delete button click
//   const handleDeleteClick = (employee: Employee3) => {
//     setSelectedEmployee(employee)
//     setIsDeleteDialogOpen(true)
//   }

//   // Handle approve submission using the new approvePendingEmployee hook
//   const handleApprove = async () => {
//     if (!selectedEmployee) return

//     // Close the dialog first
//     setIsApproveDialogOpen(false)

//     // Show loading toast
//     const loadingToast = toast.loading(`Approving ${getFullName(selectedEmployee)}...`)

//     try {
//       console.log("Approving employee:", {
//         registrationId: selectedEmployee.registration_id,
//         id: selectedEmployee.id.toString()
//       })

//       // Use the new approvePendingEmployee mutation hook with PATCH method
//       const result = await approvePendingEmployeeMutation.mutateAsync({
//         registrationId: selectedEmployee.registration_id,
//         id: selectedEmployee.id.toString()
//       })

//       // Dismiss loading toast and show success
//       toast.dismiss(loadingToast)
//       toast.success("Employee Approved", {
//         description: `${getFullName(selectedEmployee)} has been approved successfully and is now active.`,
//       })
      
//       // Refresh the data
//       handleRefresh()
//     } catch (error: any) {
//       console.error("Error approving employee:", error)
//       // Dismiss loading toast and show error
//       toast.dismiss(loadingToast)
      
//       let errorMessage = "Failed to approve employee. Please try again."
//       if (error.response?.data?.error) {
//         errorMessage = error.response.data.error
//       } else if (error.message) {
//         errorMessage = error.message
//       }
      
//       toast.error("Error", {
//         description: errorMessage,
//       })
//     }
//   }

//   // Handle delete submission using the new deletePendingEmployee hook
//   const handleDelete = async () => {
//     if (!selectedEmployee) return

//     // Close the dialog first
//     setIsDeleteDialogOpen(false)

//     // Show loading toast
//     const loadingToast = toast.loading(`Deleting ${getFullName(selectedEmployee)}...`)

//     try {
//       console.log("Deleting employee:", {
//         registrationId: selectedEmployee.registration_id
//       })

//       // Use the new deletePendingEmployee mutation hook
//       const result = await deletePendingEmployeeMutation.mutateAsync({
//         registrationId: selectedEmployee.registration_id
//       })

//       // Dismiss loading toast and show success
//       toast.dismiss(loadingToast)
//       toast.success("Employee Deleted", {
//         description: `${getFullName(selectedEmployee)} has been deleted successfully.`,
//       })
      
//       // Refresh the data
//       handleRefresh()
//     } catch (error: any) {
//       console.error("Error deleting employee:", error)
//       // Dismiss loading toast and show error
//       toast.dismiss(loadingToast)
      
//       let errorMessage = "Failed to delete employee. Please try again."
//       if (error.response?.data?.error) {
//         errorMessage = error.response.data.error
//       } else if (error.message) {
//         errorMessage = error.message
//       }
      
//       toast.error("Error", {
//         description: errorMessage,
//       })
//     }
//   }

//   // Alternative method using updateEmployeeStatus if needed
//   const handleApproveWithStatusUpdate = async () => {
//     if (!selectedEmployee) return

//     // Close the dialog first
//     setIsApproveDialogOpen(false)

//     // Show loading toast
//     const loadingToast = toast.loading(`Approving ${getFullName(selectedEmployee)}...`)

//     try {
//       // Use the updateEmployeeStatus mutation hook as fallback
//       const result = await updateEmployeeStatusMutation.mutateAsync({
//         id: selectedEmployee.id.toString(),
//         status: "active"
//       })

//       // Dismiss loading toast and show success
//       toast.dismiss(loadingToast)
//       toast.success("Employee Approved", {
//         description: `${getFullName(selectedEmployee)} has been approved successfully and is now active.`,
//       })
      
//       // Refresh the data
//       handleRefresh()
//     } catch (error: any) {
//       console.error("Error approving employee:", error)
//       // Dismiss loading toast and show error
//       toast.dismiss(loadingToast)
      
//       let errorMessage = "Failed to approve employee. Please try again."
//       if (error.response?.data?.error) {
//         errorMessage = error.response.data.error
//       } else if (error.message) {
//         errorMessage = error.message
//       }
      
//       toast.error("Error", {
//         description: errorMessage,
//       })
//     }
//   }

//   // Determine which mutation is currently pending for loading states
//   const isApprovePending = approvePendingEmployeeMutation.isPending || updateEmployeeStatusMutation.isPending
//   const isDeletePending = deletePendingEmployeeMutation.isPending

//   // Show loading state
//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div className="space-y-2">
//             <Skeleton className="h-8 w-64" />
//             <Skeleton className="h-4 w-96" />
//           </div>
//           <div className="flex items-center gap-2">
//             <Skeleton className="h-9 w-24" />
//             <Skeleton className="h-9 w-32" />
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row justify-between gap-4">
//           <Skeleton className="h-10 w-full sm:w-80" />
//           <Skeleton className="h-10 w-24" />
//         </div>

//         <Card>
//           <CardHeader>
//             <Skeleton className="h-6 w-32" />
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="flex items-center space-x-4">
//                   <Skeleton className="h-12 w-12 rounded-full" />
//                   <div className="space-y-2">
//                     <Skeleton className="h-4 w-40" />
//                     <Skeleton className="h-3 w-32" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   // Show error state
//   if (error) {
//     return (
//       <Card className="w-full">
//         <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
//           <div className="rounded-full bg-red-100 p-3">
//             <AlertCircle className="h-8 w-8 text-red-600" />
//           </div>
//           <div className="text-center space-y-2">
//             <h3 className="text-lg font-medium">Error loading employees</h3>
//             <p className="text-sm text-muted-foreground max-w-md">{error.message}</p>
//           </div>
//           <Button onClick={handleRefresh} variant="outline">
//             <RefreshCw className="mr-2 h-4 w-4" />
//             Try Again
//           </Button>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="space-y-1">
//           <h1 className="text-3xl font-bold tracking-tight">Pending Employees</h1>
//           <p className="text-muted-foreground">
//             Manage and review employee submissions awaiting approval
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button onClick={handleRefresh} variant="outline" size="sm">
//                   <RefreshCw className="h-4 w-4" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Refresh data</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//           <ClearPendingEmployeesButton onSuccess={handleRefresh} />
//         </div>
//       </div>

//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle>Employee Management</CardTitle>
//           <CardDescription>
//             Search, filter, and manage pending employee submissions
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
//             <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
//               <div className="relative w-full sm:w-80">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search by name, email, or ID..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-8"
//                 />
//               </div>
//               <Button type="submit">Search</Button>
//             </form>

//             <div className="flex items-center gap-2">
//               <Button variant="outline" size="sm">
//                 <Filter className="mr-2 h-4 w-4" />
//                 Filter
//               </Button>
//             </div>
//           </div>

//           <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
//               <TabsTrigger value="all" className="flex items-center gap-2">
//                 All
//                 <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
//                   {pendingEmployees.filter(emp => emp.status !== "active" && emp.status !== "approved").length}
//                 </Badge>
//               </TabsTrigger>
//               <TabsTrigger value="pending_approval" className="flex items-center gap-2">
//                 <Clock className="h-4 w-4" />
//                 Pending
//               </TabsTrigger>
//               <TabsTrigger value="document_verification" className="flex items-center gap-2">
//                 <FileText className="h-4 w-4" />
//                 Documents
//               </TabsTrigger>
//               <TabsTrigger value="data_incomplete" className="flex items-center gap-2">
//                 <AlertCircle className="h-4 w-4" />
//                 Incomplete
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="all" className="space-y-4 mt-6">
//               {pendingEmployees.length === 0 ? (
//                 <Card>
//                   <CardContent className="flex flex-col items-center justify-center py-12">
//                     <div className="rounded-full bg-muted p-3 mb-4">
//                       <User className="h-6 w-6 text-muted-foreground" />
//                     </div>
//                     <div className="text-center space-y-2">
//                       <h3 className="text-lg font-medium">No pending employees found</h3>
//                       <p className="text-sm text-muted-foreground">There are no pending employees in the database.</p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 <div className="rounded-md border">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Employee</TableHead>
//                         <TableHead>Contact</TableHead>
//                         <TableHead>Department</TableHead>
//                         <TableHead>Position</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {pendingEmployees
//                         .filter((emp: Employee3) => emp.status !== "active" && emp.status !== "approved")
//                         .map((emp: Employee3) => (
//                           <TableRow key={emp.id} className="group">
//                             <TableCell>
//                               <div className="flex items-center gap-3">
//                                 <Avatar className="h-9 w-9 border">
//                                   <AvatarFallback className="bg-primary/10 text-primary">
//                                     {getInitials(emp)}
//                                   </AvatarFallback>
//                                 </Avatar>
//                                 <div className="flex flex-col">
//                                   <span className="font-medium">{getFullName(emp)}</span>
//                                   <span className="text-xs text-muted-foreground">
//                                     ID: {emp.registration_id}
//                                   </span>
//                                 </div>
//                               </div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="flex flex-col">
//                                 <span className="text-sm">{emp.email}</span>
//                                 {emp.metadata?.["Phone Number"] && (
//                                   <span className="text-xs text-muted-foreground">
//                                     {emp.metadata["Phone Number"]}
//                                   </span>
//                                 )}
//                               </div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="flex items-center gap-2">
//                                 <Building className="h-4 w-4 text-muted-foreground" />
//                                 <span>{emp.department || "-"}</span>
//                               </div>
//                             </TableCell>
//                             <TableCell>{emp.position || "-"}</TableCell>
//                             <TableCell>{getStatusBadge(emp.status)}</TableCell>
//                             <TableCell className="text-right">
//                               <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                   <Button variant="ghost" className="h-8 w-8 p-0">
//                                     <span className="sr-only">Open menu</span>
//                                     <MoreVertical className="h-4 w-4" />
//                                   </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent align="end" className="w-48">
//                                   <DropdownMenuItem
//                                     onClick={() => handleViewDetails(emp)}
//                                     className="flex items-center cursor-pointer"
//                                   >
//                                     <Eye className="mr-2 h-4 w-4" />
//                                     View Details
//                                   </DropdownMenuItem>
//                                   <DropdownMenuSeparator />
//                                   <DropdownMenuItem
//                                     onClick={() => handleApproveClick(emp)}
//                                     className="flex items-center cursor-pointer text-green-600 focus:text-green-600"
//                                     disabled={isApprovePending}
//                                   >
//                                     <CheckCircle className="mr-2 h-4 w-4" />
//                                     {isApprovePending ? "Approving..." : "Approve Employee"}
//                                   </DropdownMenuItem>
//                                   <DropdownMenuItem
//                                     onClick={() => handleDeleteClick(emp)}
//                                     className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
//                                     disabled={isDeletePending}
//                                   >
//                                     <Trash2 className="mr-2 h-4 w-4" />
//                                     {isDeletePending ? "Deleting..." : "Delete"}
//                                   </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}

//               {pagination.totalPages > 1 && (
//                 <div className="flex items-center justify-end">
//                   <Pagination 
//                     currentPage={pagination.page} 
//                     totalPages={pagination.totalPages} 
//                     onPageChange={handlePageChange} 
//                   />
//                 </div>
//               )}
//             </TabsContent>

//             {["pending_approval", "document_verification", "data_incomplete"].map((tab) => (
//               <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
//                 {pendingEmployees.filter((employee: Employee3) => employee.status === tab).length === 0 ? (
//                   <Card>
//                     <CardContent className="flex flex-col items-center justify-center py-12">
//                       <div className="rounded-full bg-muted p-3 mb-4">
//                         <User className="h-6 w-6 text-muted-foreground" />
//                       </div>
//                       <div className="text-center space-y-2">
//                         <h3 className="text-lg font-medium">
//                           {tab === "pending_approval" && "No pending approvals"}
//                           {tab === "document_verification" && "No document verification pending"}
//                           {tab === "data_incomplete" && "No incomplete data"}
//                         </h3>
//                         <p className="text-sm text-muted-foreground">
//                           {tab === "pending_approval" && "There are no pending employees with pending approval status."}
//                           {tab === "document_verification" && "There are no employees waiting for document verification."}
//                           {tab === "data_incomplete" && "There are no employees with incomplete data."}
//                         </p>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ) : (
//                   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                     {pendingEmployees
//                       .filter((employee: Employee3) => employee.status === tab)
//                       .map((employee: Employee3) => (
//                         <Card key={employee.id} className="overflow-hidden transition-all hover:shadow-md">
//                           <CardHeader className="pb-3">
//                             <div className="flex justify-between items-start">
//                               <div className="flex items-center gap-3">
//                                 <Avatar className="h-10 w-10 border">
//                                   <AvatarFallback className="bg-primary/10 text-primary">
//                                     {getInitials(employee)}
//                                   </AvatarFallback>
//                                 </Avatar>
//                                 <div>
//                                   <CardTitle className="text-lg">{getFullName(employee)}</CardTitle>
//                                   <CardDescription>{employee.email}</CardDescription>
//                                 </div>
//                               </div>
//                               {getStatusBadge(employee.status)}
//                             </div>
//                           </CardHeader>
//                           <CardContent className="pb-3">
//                             <div className="space-y-2 text-sm">
//                               <div className="flex justify-between">
//                                 <span className="text-muted-foreground">Department:</span>
//                                 <span className="font-medium">{employee.department || "N/A"}</span>
//                               </div>
//                               <div className="flex justify-between">
//                                 <span className="text-muted-foreground">Position:</span>
//                                 <span className="font-medium">{employee.position || "N/A"}</span>
//                               </div>
//                               <div className="flex justify-between">
//                                 <span className="text-muted-foreground">Submitted:</span>
//                                 <span className="font-medium">{formatDate(employee.submission_date)}</span>
//                               </div>
//                             </div>
//                           </CardContent>
//                           <CardFooter className="bg-muted/50 pt-3">
//                             <div className="flex justify-between w-full">
//                               <TooltipProvider>
//                                 <Tooltip>
//                                   <TooltipTrigger asChild>
//                                     <Button 
//                                       variant="outline" 
//                                       size="sm" 
//                                       onClick={() => handleViewDetails(employee)}
//                                     >
//                                       <Eye className="h-4 w-4" />
//                                     </Button>
//                                   </TooltipTrigger>
//                                   <TooltipContent>
//                                     <p>View details</p>
//                                   </TooltipContent>
//                                 </Tooltip>
//                               </TooltipProvider>
                              
//                               <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                   <Button variant="outline" size="sm">
//                                     <MoreVertical className="h-4 w-4" />
//                                   </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent align="end">
//                                   <DropdownMenuItem
//                                     onClick={() => handleViewDetails(employee)}
//                                     className="flex items-center cursor-pointer"
//                                   >
//                                     <Eye className="mr-2 h-4 w-4" />
//                                     View Details
//                                   </DropdownMenuItem>
//                                   <DropdownMenuSeparator />
//                                   <DropdownMenuItem
//                                     onClick={() => handleApproveClick(employee)}
//                                     className="flex items-center cursor-pointer text-green-600 focus:text-green-600"
//                                     disabled={isApprovePending}
//                                   >
//                                     <CheckCircle className="mr-2 h-4 w-4" />
//                                     {isApprovePending ? "Approving..." : "Approve"}
//                                   </DropdownMenuItem>
//                                   <DropdownMenuItem
//                                     onClick={() => handleDeleteClick(employee)}
//                                     className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
//                                     disabled={isDeletePending}
//                                   >
//                                     <Trash2 className="mr-2 h-4 w-4" />
//                                     {isDeletePending ? "Deleting..." : "Delete"}
//                                   </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                               </DropdownMenu>
//                             </div>
//                           </CardFooter>
//                         </Card>
//                       ))}
//                   </div>
//                 )}
//               </TabsContent>
//             ))}
//           </Tabs>
//         </CardContent>
//       </Card>

//       {/* View Details Dialog */}
//       <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
//         <DialogContent className="max-w-4xl h-[90vh] w-full p-0 flex flex-col">
//           <DialogHeader className="px-6 py-4 border-b shrink-0">
//             <div className="flex items-center gap-3">
//               {selectedEmployee && (
//                 <Avatar className="h-12 w-12 border-2">
//                   <AvatarFallback className="bg-primary/10 text-primary text-lg">
//                     {getInitials(selectedEmployee)}
//                   </AvatarFallback>
//                 </Avatar>
//               )}
//               <div>
//                 <DialogTitle className="text-2xl font-bold">
//                   {selectedEmployee ? getFullName(selectedEmployee) : 'Employee Details'}
//                 </DialogTitle>
//                 <DialogDescription>
//                   Complete information about employee submission
//                 </DialogDescription>
//               </div>
//             </div>
//           </DialogHeader>
          
//           {/* Scrollable content area */}
//           <ScrollArea className="flex-1 px-6">
//             <div className="space-y-6 py-2">
//               {selectedEmployee && (
//                 <>
//                   {/* Basic Information Section */}
//                   <Card>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         <User className="h-5 w-5 text-primary" />
//                         Basic Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">First Name</label>
//                           <p className="text-sm">{selectedEmployee.firstname}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Surname</label>
//                           <p className="text-sm">{selectedEmployee.surname}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Other Names</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Other Names"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Title</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.Title || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Gender</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.Gender || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Date of Birth"] ? formatSimpleDate(selectedEmployee.metadata["Date of Birth"]) : "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Marital Status"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Phone Number"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Email</label>
//                           <p className="text-sm break-all">{selectedEmployee.email}</p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Employment Information Section */}
//                   <Card>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         <Building className="h-5 w-5 text-primary" />
//                         Employment Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Employee ID"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Registration ID</label>
//                           <p className="text-sm font-mono">{selectedEmployee.registration_id}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Department</label>
//                           <p className="text-sm">{selectedEmployee.department || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Position</label>
//                           <p className="text-sm">{selectedEmployee.position || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Cadre</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.Cadre || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Employment Type"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Date of First Appointment</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Date of First Appointment"] ? formatSimpleDate(selectedEmployee.metadata["Date of First Appointment"]) : "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Probation Period</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Probation Period"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Work Location</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Work Location"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Organization</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.Organization || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Service No</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Service No"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">File No</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["File No"] || "N/A"}</p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Salary and Grade Information */}
//                   <Card>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         <DollarSign className="h-5 w-5 text-primary" />
//                         Salary & Grade Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Salary</label>
//                           <p className="text-sm font-semibold">
//                             {selectedEmployee.metadata?.Salary ? `₦${parseInt(selectedEmployee.metadata.Salary).toLocaleString()}` : "N/A"}
//                           </p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Salary Structure</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Salary Structure"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">GL</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.GL || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Step</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.Step || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Payment Method"] || "N/A"}</p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Bank and Pension Information */}
//                   <Card>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         <Building className="h-5 w-5 text-primary" />
//                         Bank & Pension Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Bank Name"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Account Number</label>
//                           <p className="text-sm font-mono">{selectedEmployee.metadata?.["Account Number"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">PFA Name</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["PFA Name"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">RSA PIN</label>
//                           <p className="text-sm font-mono">{selectedEmployee.metadata?.["RSA PIN"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">BVN Verified</label>
//                           <Badge variant={selectedEmployee.metadata?.["BVN Verified"] === "YES" ? "default" : "secondary"}>
//                             {selectedEmployee.metadata?.["BVN Verified"] || "N/A"}
//                           </Badge>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">NIN Verified</label>
//                           <Badge variant={selectedEmployee.metadata?.["NIN Verified"] === "YES" ? "default" : "secondary"}>
//                             {selectedEmployee.metadata?.["NIN Verified"] || "N/A"}
//                           </Badge>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Address Information */}
//                   <Card>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         <MapPin className="h-5 w-5 text-primary" />
//                         Address Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <div className="space-y-1 md:col-span-2">
//                           <label className="text-sm font-medium text-muted-foreground">Residential Address</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Residential Address"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">State of Residence</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["State of Residence"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">State of Origin</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["State of Origin"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">LGA</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.LGA || "N/A"}</p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Next of Kin Information */}
//                   <Card>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         <Contact className="h-5 w-5 text-primary" />
//                         Next of Kin Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Next of Kin Name</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Name"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Next of Kin Relationship</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Relationship"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Next of Kin Phone</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Phone"] || "N/A"}</p>
//                         </div>
//                         <div className="space-y-1 md:col-span-2">
//                           <label className="text-sm font-medium text-muted-foreground">Next of Kin Address</label>
//                           <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Address"] || "N/A"}</p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* System Information */}
//                   <Card>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="flex items-center gap-2 text-lg">
//                         <Server className="h-5 w-5 text-primary" />
//                         System Information
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Status</label>
//                           <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Source</label>
//                           <Badge variant="outline">{selectedEmployee.source || "N/A"}</Badge>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Submission Date</label>
//                           <p className="text-sm">{formatDate(selectedEmployee.submission_date)}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Created At</label>
//                           <p className="text-sm">{formatDate(selectedEmployee.created_at)}</p>
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-sm font-medium text-muted-foreground">Updated At</label>
//                           <p className="text-sm">{formatDate(selectedEmployee.updated_at)}</p>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </>
//               )}
//             </div>
//           </ScrollArea>
          
//           <DialogFooter className="px-6 py-4 border-t shrink-0">
//             <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Close</Button>
//             {selectedEmployee && (
//               <Button 
//                 onClick={() => handleApproveClick(selectedEmployee)}
//                 disabled={isApprovePending}
//               >
//                 <CheckCircle className="mr-2 h-4 w-4" />
//                 {isApprovePending ? "Approving..." : "Approve Employee"}
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>


//       <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
//               <CheckCircle className="h-6 w-6 text-green-600" />
//             </div>
//             <DialogTitle className="text-xl font-bold text-center">Approve Employee</DialogTitle>
//             <DialogDescription className="text-center pt-2">
//               Are you sure you want to approve this employee?
//             </DialogDescription>
//           </DialogHeader>
//           <div className="py-4">
//             <div className="text-center space-y-2">
//               <div className="font-semibold text-lg">
//                 {selectedEmployee ? getFullName(selectedEmployee) : 'Employee'}
//               </div>
//               <div className="text-sm text-muted-foreground">
//                 Registration ID: {selectedEmployee?.registration_id || "N/A"}
//               </div>
//             </div>
//             <div className="mt-4 p-4 bg-muted rounded-lg">
//               <div className="text-sm text-muted-foreground text-center">
//                 This action will update the employee status to "active" and move them to the active employees list.
//               </div>
//             </div>
//           </div>
//           <DialogFooter className="flex flex-row gap-2 justify-center sm:justify-center">
//             <Button 
//               type="button" 
//               variant="outline" 
//               onClick={() => setIsApproveDialogOpen(false)}
//               className="px-6"
//               disabled={isApprovePending}
//             >
//               Cancel
//             </Button>
//             <Button 
//               type="button" 
//               onClick={handleApprove}
//               disabled={isApprovePending}
//               className="bg-green-600 hover:bg-green-700 px-6"
//             >
//               {isApprovePending ? (
//                 <>
//                   <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
//                   Approving...
//                 </>
//               ) : (
//                 "Approve Employee"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Enhanced Delete Confirmation Dialog */}
//       <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//   <DialogContent className="max-w-sm sm:max-w-md w-[90%] mx-auto py-4">
//     <DialogHeader className="text-center px-2">
//       <div className="flex justify-center mb-2">
//         <div className="relative">
//           <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-60"></div>
//           <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200">
//             <ShieldAlert className="h-6 w-6 text-red-600" />
//           </div>
//         </div>
//       </div>

//       <DialogTitle className="text-lg font-semibold text-red-700">
//         Confirm Deletion
//       </DialogTitle>
//       <DialogDescription className="text-xs text-gray-600 mt-1">
//         This action cannot be undone
//       </DialogDescription>
//     </DialogHeader>

//     <div className="py-3 px-2">
//       {/* Employee Info Card - compact */}
//       <Card className="border-red-200 bg-red-50/60 mb-3">
//         <CardContent className="p-2">
//           <div className="flex items-center gap-2">
//             {selectedEmployee && (
//               <Avatar className="h-8 w-8 border border-red-200">
//                 <AvatarFallback className="bg-red-100 text-red-700 text-xs font-semibold">
//                   {getInitials(selectedEmployee)}
//                 </AvatarFallback>
//               </Avatar>
//             )}
//             <div className="flex-1">
//               <h4 className="font-medium text-sm leading-tight">
//                 {selectedEmployee ? getFullName(selectedEmployee) : "Employee"}
//               </h4>
//               <p className="text-[11px] text-muted-foreground">
//                 ID: {selectedEmployee?.registration_id || "N/A"}
//               </p>
//               <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-600">
//                 <div className="flex items-center gap-1">
//                   <Building className="h-3 w-3 text-slate-500" />
//                   <span>{selectedEmployee?.department || "N/A"}</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <User className="h-3 w-3 text-slate-500" />
//                   <span>{selectedEmployee?.position || "N/A"}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Warning Section */}
//       <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
//         <div className="flex items-start gap-2">
//           <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
//           <div>
//             <h4 className="font-semibold text-amber-800 text-xs mb-0.5">
//               Important Notice
//             </h4>
//             <ul className="text-[11px] text-amber-700 list-disc list-inside space-y-0.5">
//               <li>Permanently deletes this record</li>
//               <li>Removes all associated data</li>
//               <li>Cannot be undone</li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Confirmation Check */}
//       <div className="mt-3 p-2 bg-slate-50 rounded-md border">
//         <div className="flex items-center gap-2">
//           <div className="flex items-center justify-center w-5 h-5 rounded border border-red-300 bg-white">
//             <Trash2 className="h-3 w-3 text-red-600" />
//           </div>
//           <div>
//             <p className="text-xs font-medium text-slate-700 leading-tight">
//               You are about to delete permanently
//             </p>
//             <p className="text-[11px] text-slate-500 mt-0.5">
//               click on the  <span className="font-mono bg-slate-200 px-1 rounded">DELETE</span>button to confirm
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>

//     {/* Footer Buttons */}
//     <DialogFooter className="flex flex-col sm:flex-row gap-2 px-2 mt-2">
//       <Button
//         type="button"
//         variant="outline"
//         onClick={() => setIsDeleteDialogOpen(false)}
//         className="flex-1 px-4 py-2 text-xs border-slate-300 hover:bg-slate-50"
//         disabled={isDeletePending}
//       >
//         <XCircle className="mr-1 h-3.5 w-3.5" />
//         Cancel
//       </Button>

//       <Button
//         type="button"
//         variant="destructive"
//         onClick={handleDelete}
//         disabled={isDeletePending}
//         className="flex-1 px-4 py-2 text-xs bg-gradient-to-r text-white from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md shadow-red-200"
//       >
//         {isDeletePending ? (
//           <>
//             <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
//             Deleting...
//           </>
//         ) : (
//           <>
//             <Trash2 className="mr-1 h-3.5 w-3.5" />
//             Delete
//           </>
//         )}
//       </Button>
//     </DialogFooter>
//   </DialogContent>
// </Dialog>

//     </div>
//   )
// }




"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  X,
  Users,
  User,
  Building,
  DollarSign,
  MapPin,
  Contact,
  Server,
  Trash2,
  ShieldAlert,
  Ban,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { ClearPendingEmployeesButton } from "../components/clear-pending-employees-button"
import { toast } from "sonner"
import { 
  usePendingEmployees, 
  useUpdateEmployeeStatus,
  useApprovePendingEmployee,
  useDeletePendingEmployee,
  useRejectPendingEmployee 
} from "@/services/hooks/employees/usePendingEmployees"
import { Employee3 } from "@/types/employees/pending-employees" 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee3 | null>(null)

  // Use the hooks
  const { data, isLoading, error, refetch } = usePendingEmployees(currentPage, 10)
  const updateEmployeeStatusMutation = useUpdateEmployeeStatus()
  const approvePendingEmployeeMutation = useApprovePendingEmployee()
  const deletePendingEmployeeMutation = useDeletePendingEmployee()
  const rejectPendingEmployeeMutation = useRejectPendingEmployee()
 
  // @ts-expect-error axios response mismatch
  const pendingEmployees: Employee3[] = data?.employees || []
  // @ts-expect-error axios response mismatch
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: 10,
    totalPages: 0
  }
  const totalItems = pagination.total
  const indexOfFirstItem = totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const indexOfLastItem = Math.min(pagination.page * pagination.limit, totalItems)

  // Helper function to get full name
  const getFullName = (employee: Employee3) => {
    return `${employee.firstname} ${employee.surname}`.trim()
  }

  // Helper function to get initials for avatar
  const getInitials = (employee: Employee3) => {
    return `${employee.firstname?.[0] || ''}${employee.surname?.[0] || ''}`.toUpperCase()
  }

  // Helper function to get full name with other names
  const getFullNameWithOtherNames = (employee: Employee3) => {
    const baseName = `${employee.firstname} ${employee.surname}`
    if (employee.metadata?.["Other Names"]) {
      return `${baseName} ${employee.metadata["Other Names"]}`.trim()
    }
    return baseName
  }

  const handleRefresh = () => {
    refetch()
    onRefresh?.()
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))
  }

  const getPageNumbers = () => {
    const totalPages = pagination.totalPages
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    const pages = []
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
    }
    
    return pages
  }

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_approval":
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      case "document_verification":
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
            <FileText className="mr-1 h-3 w-3" />
            Document Verification
          </Badge>
        )
      case "data_incomplete":
        return (
          <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
            <AlertCircle className="mr-1 h-3 w-3" />
            Data Incomplete
          </Badge>
        )
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">{status}</Badge>
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

  const formatSimpleDate = (dateString: string | null | undefined) => {
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

  const handleViewDetails = (employee: Employee3) => {
    setSelectedEmployee(employee)
    setIsViewDetailsOpen(true)
  }

  // Handle approve button click
  const handleApproveClick = (employee: Employee3) => {
    setSelectedEmployee(employee)
    setIsApproveDialogOpen(true)
  }

  // Handle delete button click
  const handleDeleteClick = (employee: Employee3) => {
    setSelectedEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  // Handle reject button click
  const handleRejectClick = (employee: Employee3) => {
    setSelectedEmployee(employee)
    setIsRejectDialogOpen(true)
  }

  // Handle approve submission using the new approvePendingEmployee hook
  const handleApprove = async () => {
    if (!selectedEmployee) return

    // Close the dialog first
    setIsApproveDialogOpen(false)

    // Show loading toast
    const loadingToast = toast.loading(`Approving ${getFullName(selectedEmployee)}...`)

    try {
      console.log("Approving employee:", {
        registrationId: selectedEmployee.registration_id,
        id: selectedEmployee.id.toString()
      })

      // Use the new approvePendingEmployee mutation hook with PATCH method
      const result = await approvePendingEmployeeMutation.mutateAsync({
        registrationId: selectedEmployee.registration_id,
        id: selectedEmployee.id.toString()
      })

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success("Employee Approved", {
        description: `${getFullName(selectedEmployee)} has been approved successfully and is now active.`,
      })
      
      // Refresh the data
      handleRefresh()
    } catch (error: any) {
      console.error("Error approving employee:", error)
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      
      let errorMessage = "Failed to approve employee. Please try again."
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error("Error", {
        description: errorMessage,
      })
    }
  }

  // Handle delete submission using the new deletePendingEmployee hook
  const handleDelete = async () => {
    if (!selectedEmployee) return

    // Close the dialog first
    setIsDeleteDialogOpen(false)

    // Show loading toast
    const loadingToast = toast.loading(`Deleting ${getFullName(selectedEmployee)}...`)

    try {
      console.log("Deleting employee:", {
        registrationId: selectedEmployee.registration_id
      })

      // Use the new deletePendingEmployee mutation hook
      const result = await deletePendingEmployeeMutation.mutateAsync({
        registrationId: selectedEmployee.registration_id
      })

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success("Employee Deleted", {
        description: `${getFullName(selectedEmployee)} has been deleted successfully.`,
      })
      
      // Refresh the data
      handleRefresh()
    } catch (error: any) {
      console.error("Error deleting employee:", error)
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      
      let errorMessage = "Failed to delete employee. Please try again."
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error("Error", {
        description: errorMessage,
      })
    }
  }

  // Handle reject submission using the new rejectPendingEmployee hook
  const handleReject = async () => {
    if (!selectedEmployee) return

    // Close the dialog first
    setIsRejectDialogOpen(false)

    // Show loading toast
    const loadingToast = toast.loading(`Rejecting ${getFullName(selectedEmployee)}...`)

    try {
      console.log("Rejecting employee:", {
        registrationId: selectedEmployee.registration_id
      })

      // Use the new rejectPendingEmployee mutation hook
      const result = await rejectPendingEmployeeMutation.mutateAsync({
        registrationId: selectedEmployee.registration_id
      })

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success("Employee Rejected", {
        description: `${getFullName(selectedEmployee)} has been rejected and removed from pending list.`,
      })
      
      // Refresh the data
      handleRefresh()
    } catch (error: any) {
      console.error("Error rejecting employee:", error)
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      
      let errorMessage = "Failed to reject employee. Please try again."
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error("Error", {
        description: errorMessage,
      })
    }
  }

  // Alternative method using updateEmployeeStatus if needed
  const handleApproveWithStatusUpdate = async () => {
    if (!selectedEmployee) return

    // Close the dialog first
    setIsApproveDialogOpen(false)

    // Show loading toast
    const loadingToast = toast.loading(`Approving ${getFullName(selectedEmployee)}...`)

    try {
      // Use the updateEmployeeStatus mutation hook as fallback
      const result = await updateEmployeeStatusMutation.mutateAsync({
        id: selectedEmployee.id.toString(),
        status: "active"
      })

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success("Employee Approved", {
        description: `${getFullName(selectedEmployee)} has been approved successfully and is now active.`,
      })
      
      // Refresh the data
      handleRefresh()
    } catch (error: any) {
      console.error("Error approving employee:", error)
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      
      let errorMessage = "Failed to approve employee. Please try again."
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error("Error", {
        description: errorMessage,
      })
    }
  }

  // Determine which mutation is currently pending for loading states
  const isApprovePending = approvePendingEmployeeMutation.isPending || updateEmployeeStatusMutation.isPending
  const isDeletePending = deletePendingEmployeeMutation.isPending
  const isRejectPending = rejectPendingEmployeeMutation.isPending

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-10 w-full sm:w-80" />
          <Skeleton className="h-10 w-24" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Error loading employees</h3>
            <p className="text-sm text-muted-foreground max-w-md">{error.message}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Pending Employees
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and review employee submissions awaiting approval
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ClearPendingEmployeesButton onSuccess={handleRefresh} />
        </div>
      </div>

      <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">Employee Management</CardTitle>
          <CardDescription className="text-gray-600">
            Search, filter, and manage pending employee submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {pendingEmployees.filter(emp => emp.status !== "active" && emp.status !== "approved").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending_approval" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="document_verification" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="data_incomplete" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Incomplete
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {pendingEmployees.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-medium">No pending employees found</h3>
                      <p className="text-sm text-muted-foreground">There are no pending employees in the database.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingEmployees
                        .filter((emp: Employee3) => emp.status !== "active" && emp.status !== "approved")
                        .map((emp: Employee3) => (
                          <TableRow key={emp.id} className="group">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(emp)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium">{getFullName(emp)}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ID: {emp.registration_id}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">{emp.email}</span>
                                {emp.metadata?.["Phone Number"] && (
                                  <span className="text-xs text-muted-foreground">
                                    {emp.metadata["Phone Number"]}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{emp.department || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell>{emp.position || "-"}</TableCell>
                            <TableCell>{getStatusBadge(emp.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleViewDetails(emp)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleApproveClick(emp)}
                                  title={isApprovePending ? "Approving..." : "Approve Employee"}
                                  disabled={isApprovePending}
                                  className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleRejectClick(emp)}
                                  title={isRejectPending ? "Rejecting..." : "Reject"}
                                  disabled={isRejectPending}
                                  className="text-amber-600 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteClick(emp)}
                                  title={isDeletePending ? "Deleting..." : "Delete"}
                                  disabled={isDeletePending}
                                  className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-3">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstItem}-{indexOfLastItem} of {totalItems} employees
                  </div>
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1 mx-1">
                        {getPageNumbers().map((page, index) => (
                          <div key={index}>
                            {page === "..." ? (
                              <span className="px-1.5 py-0.5 text-gray-400">...</span>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePageChange(page as number)}
                                className={`h-8 min-w-8 px-0 text-sm ${
                                  currentPage === page 
                                    ? "bg-gray-100 text-gray-900 font-medium" 
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === pagination.totalPages}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {["pending_approval", "document_verification", "data_incomplete"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
                {pendingEmployees.filter((employee: Employee3) => employee.status === tab).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-medium">
                          {tab === "pending_approval" && "No pending approvals"}
                          {tab === "document_verification" && "No document verification pending"}
                          {tab === "data_incomplete" && "No incomplete data"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {tab === "pending_approval" && "There are no pending employees with pending approval status."}
                          {tab === "document_verification" && "There are no employees waiting for document verification."}
                          {tab === "data_incomplete" && "There are no employees with incomplete data."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingEmployees
                      .filter((employee: Employee3) => employee.status === tab)
                      .map((employee: Employee3) => (
                        <Card key={employee.id} className="overflow-hidden transition-all hover:shadow-md">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(employee)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{getFullName(employee)}</CardTitle>
                                  <CardDescription>{employee.email}</CardDescription>
                                </div>
                              </div>
                              {getStatusBadge(employee.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Department:</span>
                                <span className="font-medium">{employee.department || "N/A"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Position:</span>
                                <span className="font-medium">{employee.position || "N/A"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Submitted:</span>
                                <span className="font-medium">{formatDate(employee.submission_date)}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-muted/50 pt-3">
                            <div className="flex w-full justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => handleViewDetails(employee)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleApproveClick(employee)}
                                title={isApprovePending ? "Approving..." : "Approve"}
                                disabled={isApprovePending}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRejectClick(employee)}
                                title={isRejectPending ? "Rejecting..." : "Reject"}
                                disabled={isRejectPending}
                                className="text-amber-600 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteClick(employee)}
                                title={isDeletePending ? "Deleting..." : "Delete"}
                                disabled={isDeletePending}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="p-0 max-w-4xl overflow-hidden border border-gray-200 shadow-xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <User className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Pending Employee Details
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    {selectedEmployee ? `View submission for ${getFullName(selectedEmployee)}` : "View employee submission"}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsViewDetailsOpen(false)}
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] px-8 py-6">
            <div className="space-y-6">
              {selectedEmployee && (
                <>
                  {/* Basic Information Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-primary" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">First Name</label>
                          <p className="text-sm">{selectedEmployee.firstname}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Surname</label>
                          <p className="text-sm">{selectedEmployee.surname}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Other Names</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Other Names"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Title</label>
                          <p className="text-sm">{selectedEmployee.metadata?.Title || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Gender</label>
                          <p className="text-sm">{selectedEmployee.metadata?.Gender || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Date of Birth"] ? formatSimpleDate(selectedEmployee.metadata["Date of Birth"]) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Marital Status"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Phone Number"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm break-all">{selectedEmployee.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Employment Information Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building className="h-5 w-5 text-primary" />
                        Employment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Employee ID"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Registration ID</label>
                          <p className="text-sm font-mono">{selectedEmployee.registration_id}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Department</label>
                          <p className="text-sm">{selectedEmployee.department || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Position</label>
                          <p className="text-sm">{selectedEmployee.position || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Cadre</label>
                          <p className="text-sm">{selectedEmployee.metadata?.Cadre || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Employment Type"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Date of First Appointment</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Date of First Appointment"] ? formatSimpleDate(selectedEmployee.metadata["Date of First Appointment"]) : "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Probation Period</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Probation Period"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Work Location</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Work Location"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Organization</label>
                          <p className="text-sm">{selectedEmployee.metadata?.Organization || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Service No</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Service No"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">File No</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["File No"] || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Salary and Grade Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Salary & Grade Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Salary</label>
                          <p className="text-sm font-semibold">
                            {selectedEmployee.metadata?.Salary ? `₦${parseInt(selectedEmployee.metadata.Salary).toLocaleString()}` : "N/A"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Salary Structure</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Salary Structure"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">GL</label>
                          <p className="text-sm">{selectedEmployee.metadata?.GL || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Step</label>
                          <p className="text-sm">{selectedEmployee.metadata?.Step || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Payment Method"] || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bank and Pension Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building className="h-5 w-5 text-primary" />
                        Bank & Pension Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Bank Name"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                          <p className="text-sm font-mono">{selectedEmployee.metadata?.["Account Number"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">PFA Name</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["PFA Name"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">RSA PIN</label>
                          <p className="text-sm font-mono">{selectedEmployee.metadata?.["RSA PIN"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">BVN Verified</label>
                          <Badge variant={selectedEmployee.metadata?.["BVN Verified"] === "YES" ? "default" : "secondary"}>
                            {selectedEmployee.metadata?.["BVN Verified"] || "N/A"}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">NIN Verified</label>
                          <Badge variant={selectedEmployee.metadata?.["NIN Verified"] === "YES" ? "default" : "secondary"}>
                            {selectedEmployee.metadata?.["NIN Verified"] || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-muted-foreground">Residential Address</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Residential Address"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">State of Residence</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["State of Residence"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">State of Origin</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["State of Origin"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">LGA</label>
                          <p className="text-sm">{selectedEmployee.metadata?.LGA || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next of Kin Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Contact className="h-5 w-5 text-primary" />
                        Next of Kin Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Next of Kin Name</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Name"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Next of Kin Relationship</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Relationship"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Next of Kin Phone</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Phone"] || "N/A"}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-muted-foreground">Next of Kin Address</label>
                          <p className="text-sm">{selectedEmployee.metadata?.["Next of Kin Address"] || "N/A"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Server className="h-5 w-5 text-primary" />
                        System Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Source</label>
                          <Badge variant="outline">{selectedEmployee.source || "N/A"}</Badge>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Submission Date</label>
                          <p className="text-sm">{formatDate(selectedEmployee.submission_date)}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Created At</label>
                          <p className="text-sm">{formatDate(selectedEmployee.created_at)}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                          <p className="text-sm">{formatDate(selectedEmployee.updated_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="px-8 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
              <Button
                variant="outline"
                onClick={() => setIsViewDetailsOpen(false)}
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Close
              </Button>
              {selectedEmployee && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleRejectClick(selectedEmployee)}
                    disabled={isRejectPending}
                    variant="outline"
                    className="text-amber-600 border-amber-200 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    {isRejectPending ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button 
                    onClick={() => handleApproveClick(selectedEmployee)}
                    disabled={isApprovePending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isApprovePending ? "Approving..." : "Approve Employee"}
                  </Button>
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-center">Approve Employee</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to approve this employee?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center space-y-2">
              <div className="font-semibold text-lg">
                {selectedEmployee ? getFullName(selectedEmployee) : 'Employee'}
              </div>
              <div className="text-sm text-muted-foreground">
                Registration ID: {selectedEmployee?.registration_id || "N/A"}
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground text-center">
                This action will update the employee status to "active" and move them to the active employees list.
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row gap-2 justify-center sm:justify-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
              className="px-6"
              disabled={isApprovePending}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleApprove}
              disabled={isApprovePending}
              className="bg-green-600 hover:bg-green-700 px-6"
            >
              {isApprovePending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md w-[90%] mx-auto py-4">
          <DialogHeader className="text-center px-2">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-60"></div>
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 border border-amber-200">
                  <Ban className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>

            <DialogTitle className="text-lg font-semibold text-amber-700">
              Confirm Rejection
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600 mt-1">
              Employee will be removed from pending list
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 px-2">
            {/* Employee Info Card - compact */}
            <Card className="border-amber-200 bg-amber-50/60 mb-3">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  {selectedEmployee && (
                    <Avatar className="h-8 w-8 border border-amber-200">
                      <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-semibold">
                        {getInitials(selectedEmployee)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">
                      {selectedEmployee ? getFullName(selectedEmployee) : "Employee"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      ID: {selectedEmployee?.registration_id || "N/A"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-slate-500" />
                        <span>{selectedEmployee?.department || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-500" />
                        <span>{selectedEmployee?.position || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 text-xs mb-0.5">
                    What happens when you reject?
                  </h4>
                  <ul className="text-[11px] text-amber-700 list-disc list-inside space-y-0.5">
                    <li>Employee will be removed from pending list</li>
                    <li>They can reapply using the reapply link</li>
                    <li>No permanent data deletion</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reapply Notice */}
            <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded border border-blue-300 bg-white">
                  <RotateCcw className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-700 leading-tight">
                    Reapplication is possible
                  </p>
                  <p className="text-[11px] text-blue-600 mt-0.5">
                    Employee will receive a reapply link via email
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 px-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              className="flex-1 px-4 py-2 text-xs border-slate-300 hover:bg-slate-50"
              disabled={isRejectPending}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleReject}
              disabled={isRejectPending}
              className="flex-1 px-4 py-2 text-xs bg-gradient-to-r text-white from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md shadow-amber-200"
            >
              {isRejectPending ? (
                <>
                  <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <Ban className="mr-1 h-3.5 w-3.5" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm sm:max-w-md w-[90%] mx-auto py-4">
          <DialogHeader className="text-center px-2">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-60"></div>
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200">
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <DialogTitle className="text-lg font-semibold text-red-700">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600 mt-1">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 px-2">
            {/* Employee Info Card - compact */}
            <Card className="border-red-200 bg-red-50/60 mb-3">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  {selectedEmployee && (
                    <Avatar className="h-8 w-8 border border-red-200">
                      <AvatarFallback className="bg-red-100 text-red-700 text-xs font-semibold">
                        {getInitials(selectedEmployee)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">
                      {selectedEmployee ? getFullName(selectedEmployee) : "Employee"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      ID: {selectedEmployee?.registration_id || "N/A"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-slate-500" />
                        <span>{selectedEmployee?.department || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-500" />
                        <span>{selectedEmployee?.position || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 text-xs mb-0.5">
                    Important Notice
                  </h4>
                  <ul className="text-[11px] text-amber-700 list-disc list-inside space-y-0.5">
                    <li>Permanently deletes this record</li>
                    <li>Removes all associated data</li>
                    <li>Cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Confirmation Check */}
            <div className="mt-3 p-2 bg-slate-50 rounded-md border">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded border border-red-300 bg-white">
                  <Trash2 className="h-3 w-3 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 leading-tight">
                    You are about to delete permanently
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    click on the  <span className="font-mono bg-slate-200 px-1 rounded">DELETE</span>button to confirm
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 px-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 px-4 py-2 text-xs border-slate-300 hover:bg-slate-50"
              disabled={isDeletePending}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeletePending}
              className="flex-1 px-4 py-2 text-xs bg-gradient-to-r text-white from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md shadow-red-200"
            >
              {isDeletePending ? (
                <>
                  <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
