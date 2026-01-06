"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertTriangle, RefreshCw, Search, Hash, Upload, Download, MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { useGetEmployeeWarnings, useGetEmployeeWarningByEmployeeId } from "@/services/hooks/hr-core/employeeWarnings"
import type { EmployeeWarning } from "@/types/hr-core/employeeWarnings"
import { AddWarningDialog } from "./AddWarningDialog"
import { EditWarningDialog } from "./EditWarningDialog"
import { ViewWarningDialog } from "./ViewWarningDialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useCreateEmployeeWarning, useUpdateEmployeeWarning, useDeleteEmployeeWarning, useUploadWarningDocument } from "@/services/hooks/hr-core/employeeWarnings"

export function WarningsContent() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedWarning, setSelectedWarning] = useState<EmployeeWarning | null>(null)
  const [searchEmployeeId, setSearchEmployeeId] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Use the hooks
  const { 
    data: warningsData, 
    isLoading: isLoadingWarnings,
    refetch: refetchWarnings
  } = useGetEmployeeWarnings()

  const {
    data: employeeWarningsData,
    isLoading: isLoadingEmployeeWarnings,
    refetch: refetchEmployeeWarnings
  } = useGetEmployeeWarningByEmployeeId(searchEmployeeId)

  const createWarningMutation = useCreateEmployeeWarning()
  const updateWarningMutation = useUpdateEmployeeWarning()
  const deleteWarningMutation = useDeleteEmployeeWarning()
  const uploadDocumentMutation = useUploadWarningDocument()

  // Transform API data to match table format
  const transformWarningData = (warning: EmployeeWarning) => {
    return {
      id: warning.id.toString(),
      employeeId: warning.employee_id,
      employeeName: warning.employee_name,
      employeeAvatar: "",
      department: warning.department,
      subject: warning.warning_subject,
      description: warning.warning_description,
      warningType: warning.warning_type,
      warningDate: warning.warning_date,
      issuedBy: warning.issued_by,
      status: warning.status,
      expiryDate: warning.expiry_date,
      supporting_documents: warning.supporting_documents,
      created_at: warning.created_at,
      updated_at: warning.updated_at,
    }
  }

  // Get warnings data based on search
  const getWarningsData = () => {
    if (searchEmployeeId && employeeWarningsData?.data) {
      return employeeWarningsData.data
        .slice()
        .sort((a: EmployeeWarning, b: EmployeeWarning) => Number(b.id) - Number(a.id))
        .map(transformWarningData)
    }
    if (warningsData?.data) {
      return warningsData.data
        .slice()
        .sort((a: EmployeeWarning, b: EmployeeWarning) => Number(b.id) - Number(a.id))
        .map(transformWarningData)
    }
    return []
  }

  const handleAdd = () => {
    setIsAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const warning = warningsData?.data?.find((w: EmployeeWarning) => w.id.toString() === id)
    if (warning) {
      setSelectedWarning(warning)
      setIsEditDialogOpen(true)
    }
  }

  const handleView = (id: string) => {
    const warning = warningsData?.data?.find((w: EmployeeWarning) => w.id.toString() === id)
    if (warning) {
      setSelectedWarning(warning)
      setIsViewDialogOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    const warning = warningsData?.data?.find((w: EmployeeWarning) => w.id.toString() === id)
    if (warning) {
      setSelectedWarning(warning)
      setIsDeleteDialogOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedWarning) return

    try {
      console.log("Deleting warning", { id: selectedWarning.id })
      await deleteWarningMutation.mutateAsync(selectedWarning.id)
      toast.success("Warning deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedWarning(null)
      refetchWarnings()
    } catch (error: any) {
      const serverMessage = error?.response?.data?.error || error?.message
      console.error("Delete error:", error)
      toast.error(serverMessage || "Failed to delete warning")
    }
  }

  const handleSubmitAdd = async (data: any) => {
    try {
      await createWarningMutation.mutateAsync(data)
      toast.success("Warning created successfully")
      setIsAddDialogOpen(false)
      refetchWarnings()
    } catch (error) {
      toast.error("Failed to create warning")
      console.error("Create error:", error)
      throw error
    }
  }

  const handleSubmitEdit = async (data: any) => {
    try {
      const { id, ...updateData } = data
      const idNum = Number(id ?? selectedWarning?.id)
      if (!idNum) {
        toast.error("Missing warning id. Please try again.")
        throw new Error("Missing warning id")
      }

      const updatePayload = { ...updateData, id: idNum }
      console.log("Updating warning", { id: idNum, data: updatePayload })

      await updateWarningMutation.mutateAsync({
        id: idNum,
        data: updatePayload,
      })

      toast.success("Warning updated successfully")
      setIsEditDialogOpen(false)
      setSelectedWarning(null)
      refetchWarnings()
    } catch (error: any) {
      const serverMessage = error?.response?.data?.error || error?.message
      console.error("Update error:", error)
      toast.error(serverMessage || "Failed to update warning")
      throw error
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await uploadDocumentMutation.mutateAsync(formData)
      toast.success("Document uploaded successfully")
      console.log("Uploaded document URL:", response.url)
      return response.url
    } catch (error) {
      toast.error("Failed to upload document")
      console.error("Upload error:", error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleEmployeeSearch = () => {
    if (searchEmployeeId) {
      refetchEmployeeWarnings()
    }
  }

  const handleManualRefresh = () => {
    refetchWarnings()
    if (searchEmployeeId) {
      refetchEmployeeWarnings()
    }
    toast.info("Refreshing warnings...")
  }

  // Calculate statistics
  const warnings = warningsData?.data || []
  const activeCount = warnings.filter((w: EmployeeWarning) => w.status === "active").length
  const expiredCount = warnings.filter((w: EmployeeWarning) => w.status === "expired").length
  const withdrawnCount = warnings.filter((w: EmployeeWarning) => w.status === "withdrawn").length
  const totalCount = warnings.length

  // Action dropdown component for each row
  interface ActionDropdownProps {
    row: any
    onView: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
  }

  const ActionDropdown: React.FC<ActionDropdownProps> = ({ row, onView, onEdit, onDelete }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(row.id)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(row.id)} disabled={row.status === "withdrawn" || row.status === "expired"}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(row.id)} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }


  // Table columns
  const columns = [
    {
      key: "employeeName",
      label: "Employee",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center">
            <div className="text-blue-700 font-bold text-xs">
              {value.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <div className="font-medium text-gray-900 truncate max-w-[140px] sm:max-w-[180px]">{value}</div>
            <div className="text-xs text-gray-500 truncate max-w-[140px] sm:max-w-[180px]">{row.employeeId}</div>
          </div>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{value}</div>
          </div>
        </div>
      ),
    },
    {
      key: "warningType",
      label: "Type",
      sortable: true,
      render: (value: string) => {
        const typeConfig: Record<string, { label: string; className: string; icon: string }> = {
          verbal: { 
            label: "Verbal", 
            className: "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800",
            icon: "🗣️"
          },
          written: { 
            label: "Written", 
            className: "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-800",
            icon: "📝"
          },
          final: { 
            label: "Final", 
            className: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800",
            icon: "⚠️"
          },
        }
        
        const config = typeConfig[value] || { 
          label: value, 
          className: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800",
          icon: "?"
        }
        
        return (
          <span className={`${config.className} px-3 py-1.5 font-medium rounded-full shadow-sm text-sm`}>
            <span className="mr-1.5">{config.icon}</span>
            {config.label}
          </span>
        )
      },
    },
    {
      key: "warningDate",
      label: "Date",
      sortable: true,
      render: (value: string) => {
        try {
          const date = new Date(value)
          return (
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex flex-col items-center justify-center mr-2 flex-shrink-0">
                <span className="text-xs font-medium text-purple-700">{date.getDate()}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-gray-500">
                  {date.getFullYear()}
                </div>
              </div>
            </div>
          )
        } catch {
          return <span className="text-gray-500">N/A</span>
        }
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
          active: { 
            label: "Active", 
            className: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-800",
            icon: "🔴"
          },
          expired: { 
            label: "Expired", 
            className: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800",
            icon: "⚫"
          },
          withdrawn: { 
            label: "Withdrawn", 
            className: "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-800",
            icon: "🔵"
          },
        }
        
        const config = statusConfig[value] || { 
          label: value, 
          className: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-800",
          icon: "?"
        }
        
        return (
          <span className={`${config.className} px-3 py-1.5 font-medium rounded-full shadow-sm text-sm`}>
            <span className="mr-1.5">{config.icon}</span>
            {config.label}
          </span>
        )
      },
    },
    {
      key: "issuedBy",
      label: "Issued By",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 flex items-center justify-center mr-2 flex-shrink-0">
            <div className="text-green-700 font-bold text-xs">HR</div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[100px]">{value}</div>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex justify-start">
          <ActionDropdown
            row={row}
            onView={(id) => handleView(id)}
            onEdit={(id) => handleEdit(id)}
            onDelete={(id) => handleDelete(id)}
          />
        </div>
      ),
    },
  ]

  const searchFields = [
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
        { value: "IT", label: "Information Technology" },
        { value: "HR", label: "Human Resources" },
        { value: "Marketing", label: "Marketing" },
        { value: "Sales", label: "Sales" },
        { value: "Operations", label: "Operations" },
        { value: "Customer Service", label: "Customer Service" },
      ],
    },
    {
      name: "warningType",
      label: "Warning Type",
      type: "select" as const,
      options: [
        { value: "verbal", label: "Verbal Warning" },
        { value: "written", label: "Written Warning" },
        { value: "final", label: "Final Warning" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "expired", label: "Expired" },
        { value: "withdrawn", label: "Withdrawn" },
      ],
    },
  ]

  const isLoading = isLoadingWarnings || 
    (searchEmployeeId ? isLoadingEmployeeWarnings : false) ||
    createWarningMutation.isPending || 
    updateWarningMutation.isPending || 
    deleteWarningMutation.isPending

  if (isLoadingWarnings) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Warnings
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

  return (
    <CoreHRClientWrapper title="Employee Warnings" endpoint="/admin/hr/warnings">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center shadow-sm">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Employee Warnings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage employee disciplinary warnings and notices
                {warningsData?.data && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({totalCount} active warnings)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center mr-3">
                  <span className="text-red-800 font-bold">{activeCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Currently active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Expired Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-800 font-bold">{expiredCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{expiredCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Past expiry date</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Withdrawn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center mr-3">
                  <span className="text-blue-800 font-bold">{withdrawnCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{withdrawnCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Withdrawn warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center mr-3">
                  <span className="text-purple-800 font-bold">{totalCount}</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Total warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="employeeSearch" className="text-sm font-medium text-gray-700 mb-2 block">
                  Search by Employee ID
                </Label>
                <div className="flex items-center space-x-3">
                  <Hash className="h-5 w-5 text-gray-500" />
                  <Input
                    id="employeeSearch"
                    type="text"
                    value={searchEmployeeId}
                    onChange={(e) => setSearchEmployeeId(e.target.value)}
                    placeholder="Employee ID"
                    aria-label="Search by employee ID"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  onClick={handleEmployeeSearch}
                  disabled={isLoadingEmployeeWarnings || !searchEmployeeId}
                  className="h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isLoadingEmployeeWarnings ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchEmployeeId("")
                    refetchWarnings()
                  }}
                  className="h-11 border-gray-300 hover:bg-gray-100"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Employee Warnings</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and review employee disciplinary warnings
                </CardDescription>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button
                  onClick={handleAdd}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Add Warning
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              title="Employee Warnings"
              columns={columns}
              data={getWarningsData()}
              searchFields={searchFields}
              onAdd={handleAdd}
              //@ts-expect-error - fix ts error
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              showActions={true}
              isLoading={isLoading}
              emptyMessage={
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 border border-red-200 mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No warnings found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchEmployeeId 
                      ? `No warnings found for employee ID: ${searchEmployeeId}`
                      : "Start by adding your first employee warning"
                    }
                  </p>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Upload Document Section */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Upload className="h-5 w-5 mr-2 text-gray-700" />
              Upload Warning Document
            </CardTitle>
            <CardDescription>
              Upload supporting documents for warnings (PDF, JPG, PNG, DOCX)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">Max file size: 5MB</p>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </>
                  )}
                </Button>
              </div>
              {uploadDocumentMutation.data && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">Document uploaded successfully!</p>
                      <p className="text-sm text-green-700 mt-1">
                        URL: <a href={uploadDocumentMutation.data.url} target="_blank" rel="noopener noreferrer" className="underline">{uploadDocumentMutation.data.url}</a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddWarningDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleSubmitAdd}
          isLoading={createWarningMutation.isPending}
        />

        {selectedWarning && (
          <EditWarningDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false)
              setSelectedWarning(null)
            }}
            onSubmit={handleSubmitEdit}
            initialData={selectedWarning}
            isLoading={updateWarningMutation.isPending}
          />
        )}

        {selectedWarning && (
          <ViewWarningDialog
            isOpen={isViewDialogOpen}
            onClose={() => {
              setIsViewDialogOpen(false)
              setSelectedWarning(null)
            }}
            warning={selectedWarning}
          />
        )}



        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setSelectedWarning(null)
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Employee Warning"
          description={`Are you sure you want to delete this warning?`}
          itemName={`${selectedWarning?.employee_name}'s ${selectedWarning?.warning_subject}`}
          isLoading={deleteWarningMutation.isPending}
        />
      </div>
    </CoreHRClientWrapper>
  )
}