"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/app/admin/core-hr/components/data-table"
import { Building2, Calendar, CheckCircle, CheckCircle2, Clock, Edit, Eye, Hash, Loader2, MapPin, RefreshCw, Trash2, X, XCircle } from "lucide-react"
import { toast } from "sonner"
import {
  useCreateLocation,
  useDeleteLocation,
  useGetLocations,
  useUpdateLocation,
} from "@/services/hooks/organizations/location/useLocation"
import type { CreateLocationPayload, Location, UpdateLocationPayload } from "@/types/organizations/location/location-management"

type LocationFormState = {
  name: string
  company_code: string
  address: string
  city: string
  state: string
  country: string
  status: string
}

const defaultFormState: LocationFormState = {
  name: "",
  company_code: "",
  address: "",
  city: "",
  state: "",
  country: "",
  status: "active",
}

export default function LocationContent() {
  const { data, isLoading, error, refetch } = useGetLocations()
  const createLocationMutation = useCreateLocation()
  const updateLocationMutation = useUpdateLocation()
  const deleteLocationMutation = useDeleteLocation()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [form, setForm] = useState<LocationFormState>(defaultFormState)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const locations = data?.data || []

  const activeCount = useMemo(
    () => locations.filter((row) => row.status?.toLowerCase() === "active").length,
    [locations]
  )
  const inactiveCount = useMemo(
    () => locations.filter((row) => row.status?.toLowerCase() === "inactive").length,
    [locations]
  )
  const recentCount = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return locations.filter((row) => (row.created_at ? new Date(row.created_at) >= thirtyDaysAgo : false)).length
  }, [locations])

  const searchFields = [
    { name: "name", label: "Location Name", type: "text" as const },
    { name: "city", label: "City", type: "text" as const },
    { name: "state", label: "State", type: "text" as const },
    { name: "country", label: "Country", type: "text" as const },
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
    { name: "created_at", label: "Created Date", type: "date" as const },
  ]

  const resetForm = () => setForm(defaultFormState)

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (location: Location) => {
    setSelectedLocation(location)
    setForm({
      name: location.name || "",
      company_code: location.company_code || "",
      address: location.address || "",
      city: location.city || "",
      state: location.state || "",
      country: location.country || "",
      status: location.status || "active",
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (location: Location) => {
    setSelectedLocation(location)
    setShowViewDialog(true)
  }

  const openDeleteDialog = (location: Location) => {
    setSelectedLocation(location)
    setShowDeleteDialog(true)
  }

  const handleCreateLocation = async () => {
    if (!form.name.trim() || !form.company_code.trim()) {
      toast.error("Location name and company code are required")
      return
    }

    const payload: CreateLocationPayload = {
      name: form.name.trim(),
      company_code: form.company_code.trim(),
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      country: form.country.trim() || undefined,
      status: form.status,
    }

    try {
      await createLocationMutation.mutateAsync(payload)
      toast.success("Location created successfully")
      setShowAddDialog(false)
      resetForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create location"
      toast.error(message)
    }
  }

  const handleUpdateLocation = async () => {
    if (!selectedLocation) return
    if (!form.name.trim() || !form.company_code.trim()) {
      toast.error("Location name and company code are required")
      return
    }

    const payload: UpdateLocationPayload = {
      id: selectedLocation.id,
      name: form.name.trim(),
      company_code: form.company_code.trim(),
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      country: form.country.trim() || undefined,
      status: form.status,
    }

    try {
      await updateLocationMutation.mutateAsync(payload)
      toast.success("Location updated successfully")
      setShowEditDialog(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update location"
      toast.error(message)
    }
  }

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return
    try {
      await deleteLocationMutation.mutateAsync(selectedLocation.id)
      toast.success("Location deleted successfully")
      setShowDeleteDialog(false)
      setSelectedLocation(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete location"
      toast.error(message)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusKey = status?.toLowerCase()
    if (statusKey === "active") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 py-1 px-2" variant="outline">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    }

    if (statusKey === "inactive") {
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 py-1 px-2" variant="outline">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </Badge>
      )
    }

    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 py-1 px-2" variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        {status || "Pending"}
      </Badge>
    )
  }

  const columns = [
    {
      key: "name",
      label: "Location Name",
      sortable: true,
      render: (value: string, row: Location) => (
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mr-2 flex-shrink-0">
            <MapPin className="h-4 w-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{value}</div>
            <div className="text-xs text-gray-500">
              {[row.city, row.state, row.country].filter(Boolean).join(", ") || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "address",
      label: "Address",
      sortable: false,
      render: (value: string) => (
        <div className="text-sm text-gray-600 max-w-[280px] truncate" title={value}>
          {value || "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <Badge
          variant="outline"
          className={
            value?.toLowerCase() === "active"
              ? "border-green-200 bg-green-50 text-green-700"
              : value?.toLowerCase() === "inactive"
                ? "border-gray-200 bg-gray-50 text-gray-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
          }
        >
          {value?.toLowerCase() === "active" ? (
            <CheckCircle2 className="mr-1 h-3 w-3" />
          ) : value?.toLowerCase() === "inactive" ? (
            <XCircle className="mr-1 h-3 w-3" />
          ) : (
            <RefreshCw className="mr-1 h-3 w-3" />
          )}
          {value}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created Date",
      sortable: true,
      render: (value: string) => {
        const created = value ? new Date(value) : null
        if (!created || Number.isNaN(created.getTime())) {
          return <div className="text-sm text-gray-500">N/A</div>
        }
        return (
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center mr-2 flex-shrink-0">
              <Calendar className="h-3 w-3 text-orange-600 mb-0.5" />
              <span className="text-xs font-medium text-orange-700">{created.getDate()}</span>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900">
                {created.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="text-xs text-gray-500">{created.toLocaleDateString("en-US", { year: "numeric" })}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Location) => (
        <div className="flex justify-start space-x-2">
          <Button variant="outline" size="icon" onClick={() => openViewDialog(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-blue-600 hover:text-blue-800" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-800"
            onClick={() => openDeleteDialog(row)}
            disabled={deleteLocationMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
        <p className="text-red-600 text-sm">{error.message || "Failed to load locations"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
              Location
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base break-words">
              Manage organization location records
              <span className="ml-1 sm:ml-2 text-sm text-gray-500">({locations.length} records)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="h-10 px-3.5 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg flex-1 md:flex-none"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
          <Button
            className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg flex-1 md:flex-none"
            onClick={openAddDialog}
          >
            Add Location
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Inactive Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{inactiveCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Recent Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{recentCount}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{locations.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <DataTable title="Location" columns={columns} data={locations} searchFields={searchFields} onAdd={openAddDialog} />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
            <DialogDescription>Create a new location record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="location-name">Name</Label>
              <Input
                id="location-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter location name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-company-code">Company Code</Label>
              <Input
                id="location-company-code"
                value={form.company_code}
                onChange={(e) => setForm((prev) => ({ ...prev, company_code: e.target.value }))}
                placeholder="Enter company code (e.g. IPPIS-C 00001)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-address">Address</Label>
              <Input
                id="location-address"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-city">City</Label>
              <Input
                id="location-city"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-state">State</Label>
              <Input
                id="location-state"
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="Enter state"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-country">Country</Label>
              <Input
                id="location-country"
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                placeholder="Enter country"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLocation} disabled={createLocationMutation.isPending}>
              {createLocationMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>Update location details for {selectedLocation?.name || "selected location"}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-location-name">Name</Label>
              <Input
                id="edit-location-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-company-code">Company Code</Label>
              <Input
                id="edit-location-company-code"
                value={form.company_code}
                onChange={(e) => setForm((prev) => ({ ...prev, company_code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-address">Address</Label>
              <Input
                id="edit-location-address"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-city">City</Label>
              <Input
                id="edit-location-city"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-state">State</Label>
              <Input
                id="edit-location-state"
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-country">Country</Label>
              <Input
                id="edit-location-country"
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
                disabled={updateLocationMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={updateLocationMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLocation} disabled={updateLocationMutation.isPending}>
              {updateLocationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Location Details
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    View location information for {selectedLocation?.name}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowViewDialog(false)}
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedLocation && (
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Location Information</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Location Name</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{selectedLocation.name}</p>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <Hash className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Location ID</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 font-mono">{selectedLocation.id}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">Status</span>
                          </div>
                          {getStatusBadge(selectedLocation.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Address Details</h3>
                  <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700"><span className="font-medium">Company Code:</span> {selectedLocation.company_code || "N/A"}</p>
                      <p className="text-sm text-gray-700 mt-2"><span className="font-medium">Company Name:</span> {selectedLocation.company_name || "N/A"}</p>
                      <p className="text-sm text-gray-700"><span className="font-medium">Address:</span> {selectedLocation.address || "N/A"}</p>
                      <p className="text-sm text-gray-700 mt-2"><span className="font-medium">City:</span> {selectedLocation.city || "N/A"}</p>
                      <p className="text-sm text-gray-700 mt-2"><span className="font-medium">State:</span> {selectedLocation.state || "N/A"}</p>
                      <p className="text-sm text-gray-700 mt-2"><span className="font-medium">Country:</span> {selectedLocation.country || "N/A"}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Created At</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedLocation.created_at ? new Date(selectedLocation.created_at).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setSelectedLocation(null)
        }}
        onConfirm={handleDeleteLocation}
        title="Delete Location"
        description={`Are you sure you want to delete ${selectedLocation?.name || "this location"}?`}
        itemName={selectedLocation?.name || "this location"}
        isLoading={deleteLocationMutation.isPending}
      />
    </div>
  )
}
