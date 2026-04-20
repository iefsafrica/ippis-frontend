"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Box, Layers3, RefreshCw, Search, Sparkles, Warehouse } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FinanceCard } from "../finance/components/finance-card"
import { FinanceDataTable } from "../finance/components/finance-data-table"
import { FinanceDetailsDialog, type FinanceDetailsField } from "../finance/components/finance-details-dialog"
import { FinanceFormDialog } from "../finance/components/finance-form-dialog"
import { useGetAssetCategories } from "@/services/hooks/assets/categories"
import {
  useCreateAsset,
  useDeleteAsset,
  useGetAsset,
  useGetAssets,
  useGetAssetsMetrics,
  useUpdateAsset,
} from "@/services/hooks/assets/assets"

type AssetUI = {
  id: string
  asset_id: string
  asset_name: string
  category_id: string
  categoryName: string
  serial_number: string
  status: string
  location: string
  assigned_to: string
  notes: string
  purchase_date?: string | null
  purchase_cost?: number | string | null
  createdAt?: string
  updatedAt?: string
}

const statusOptions = [
  { value: "Available", label: "Available" },
  { value: "Assigned", label: "Assigned" },
  { value: "In Use", label: "In Use" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Retired", label: "Retired" },
]

const resolveStatus = (value?: string | null) => {
  const normalized = String(value ?? "").trim().toLowerCase().replace(/[-_]+/g, " ")
  return statusOptions.find((item) => item.value.toLowerCase() === normalized)?.value || statusOptions[0].value
}

const normalizeCategories = (responseData: any): Array<{ id: string; name: string }> => {
  const rawCategories = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.categories)
      ? responseData.categories
      : []

  return rawCategories.map((category: any) => ({
    id: String(category.category_id ?? category.id ?? ""),
    name: String(category.category_name ?? category.name ?? ""),
  }))
}

const normalizeAsset = (asset: any, categories: Array<{ id: string; name: string }>): AssetUI => ({
  id: String(asset.id ?? asset.asset_id),
  asset_id: String(asset.asset_id ?? asset.id ?? ""),
  asset_name: String(asset.asset_name ?? ""),
  category_id: String(asset.category_id ?? ""),
  categoryName: categories.find((category) => category.id === String(asset.category_id ?? ""))?.name || String(asset.category_id ?? ""),
  serial_number: String(asset.serial_number ?? ""),
  status: resolveStatus(asset.status),
  location: String(asset.location ?? ""),
  assigned_to: String(asset.assigned_to ?? ""),
  notes: String(asset.notes ?? ""),
  purchase_date: asset.purchase_date ?? null,
  purchase_cost: asset.purchase_cost ?? null,
  createdAt: asset.created_at ?? asset.createdAt ?? undefined,
  updatedAt: asset.updated_at ?? asset.updatedAt ?? undefined,
})

const detailsFields: FinanceDetailsField[] = [
  { label: "Asset ID", key: "asset_id", type: "reference" },
  { label: "Asset Name", key: "asset_name" },
  { label: "Category", key: "categoryName" },
  { label: "Serial Number", key: "serial_number" },
  {
    label: "Status",
    key: "status",
    type: "status",
    statusMap: {
      Available: { label: "Available", variant: "default" },
      Assigned: { label: "Assigned", variant: "secondary" },
      "In Use": { label: "In Use", variant: "secondary" },
      Maintenance: { label: "Maintenance", variant: "outline" },
      Retired: { label: "Retired", variant: "destructive" },
    },
  },
  { label: "Location", key: "location" },
  { label: "Assigned To", key: "assigned_to" },
  { label: "Purchase Date", key: "purchase_date", type: "date", format: "PP" },
  { label: "Purchase Cost", key: "purchase_cost", type: "currency", currencySymbol: "₦" },
  { label: "Notes", key: "notes" },
  { label: "Created At", key: "createdAt", type: "date", format: "PPpp" },
  { label: "Updated At", key: "updatedAt", type: "date", format: "PPpp" },
]

export function AssetsContent() {
  const { data: metricsData, isLoading: metricsLoading, isFetching: metricsFetching, isError: metricsError, refetch: refetchMetrics } = useGetAssetsMetrics()
  const { data: assetsData, isLoading, isFetching, isError, refetch } = useGetAssets()
  const { data: categoriesData } = useGetAssetCategories()
  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const deleteAsset = useDeleteAsset()

  const categories = useMemo(() => normalizeCategories(categoriesData?.data), [categoriesData])
  const categoryOptions = useMemo(() => categories.map((category) => ({ value: category.id, label: category.name })), [categories])

  const [selectedAsset, setSelectedAsset] = useState<AssetUI | null>(null)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const assets = useMemo(
    () => (assetsData?.data?.assets ?? []).map((asset) => normalizeAsset(asset, categories)),
    [assetsData, categories],
  )

  const selectedAssetDetailsQuery = useGetAsset(selectedAssetId ?? undefined, isDetailsOpen || isEditOpen)
  const selectedAssetDetails = selectedAssetDetailsQuery.data?.data
    ? normalizeAsset(selectedAssetDetailsQuery.data.data, categories)
    : selectedAsset

  useEffect(() => {
    if (isError) toast.error("Failed to load assets")
  }, [isError])

  useEffect(() => {
    if (metricsError) toast.error("Failed to load asset metrics")
  }, [metricsError])

  useEffect(() => {
    if (selectedAssetDetailsQuery.isError && selectedAssetId) {
      toast.error("Failed to load asset details")
    }
  }, [selectedAssetDetailsQuery.isError, selectedAssetId])

  const metrics = metricsData?.data?.highlights
  const totalAssets = metrics?.total_assets ?? assets.length
  const activeCategories = metrics?.active_categories ?? categories.length
  const inventoryValue = metrics?.total_inventory_value ?? assets.reduce((sum, asset) => sum + Number(asset.purchase_cost ?? 0), 0)

  const columns = [
    { key: "asset_id", label: "Asset ID", sortable: true },
    { key: "asset_name", label: "Asset Name", sortable: true },
    {
      key: "categoryName",
      label: "Category",
      sortable: true,
    },
    { key: "serial_number", label: "Serial Number", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const normalized = String(value ?? "").toLowerCase().replace(/[-_]+/g, " ")
        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              normalized === "available"
                ? "bg-green-100 text-green-800"
                : normalized === "assigned" || normalized === "in use"
                  ? "bg-blue-100 text-blue-800"
                  : normalized === "maintenance"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
            }`}
          >
            {value || "Unknown"}
          </span>
        )
      },
    },
    { key: "location", label: "Location", sortable: true },
    { key: "assigned_to", label: "Assigned To", sortable: true },
    {
      key: "purchase_cost",
      label: "Purchase Cost",
      sortable: true,
      render: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "NGN",
        }).format(Number(value ?? 0)),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "N/A"),
    },
  ]

  const filterOptions = [
    {
      id: "category_id",
      label: "Category",
      options: categoryOptions,
      type: "select" as const,
    },
    {
      id: "status",
      label: "Status",
      options: statusOptions,
      type: "select" as const,
    },
  ]

  const createFields = [
    { name: "asset_name", label: "Asset Name", type: "text" as const, required: true, placeholder: "Enter asset name", width: "full" as const },
    { name: "category_id", label: "Category", type: "select" as const, required: true, options: categoryOptions, width: "half" as const },
    { name: "serial_number", label: "Serial Number", type: "text" as const, required: true, placeholder: "Enter serial number", width: "half" as const },
    { name: "purchase_date", label: "Purchase Date", type: "date" as const, width: "half" as const },
    { name: "purchase_cost", label: "Purchase Cost", type: "currency" as const, placeholder: "Enter purchase cost", width: "half" as const, currencySymbol: "₦" },
    { name: "status", label: "Status", type: "select" as const, required: true, options: statusOptions, width: "half" as const },
    { name: "location", label: "Location", type: "text" as const, required: true, placeholder: "Enter location", width: "half" as const },
    { name: "assigned_to", label: "Assigned To", type: "text" as const, placeholder: "Enter assigned to", width: "half" as const },
    { name: "notes", label: "Notes", type: "textarea" as const, placeholder: "Enter notes", width: "full" as const },
  ]

  const editFields = [
    { name: "status", label: "Status", type: "select" as const, required: true, options: statusOptions, width: "half" as const },
    { name: "location", label: "Location", type: "text" as const, required: true, placeholder: "Enter location", width: "half" as const },
    { name: "notes", label: "Notes", type: "textarea" as const, placeholder: "Enter notes", width: "full" as const },
  ]

  const handleViewAsset = (id: string) => {
    const asset = assets.find((item) => item.id === id)
    if (!asset) return

    setSelectedAsset(asset)
    setSelectedAssetId(asset.asset_id)
    setIsDetailsOpen(true)
  }

  const handleEditAsset = (id: string) => {
    const asset = assets.find((item) => item.id === id)
    if (!asset) return

    setSelectedAsset(asset)
    setSelectedAssetId(asset.asset_id)
    setIsEditOpen(true)
  }

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await deleteAsset.mutateAsync(assetId)
      toast.success("Asset deleted successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete asset")
    }
  }

  const handleAddAsset = () => {
    setSelectedAsset(null)
    setSelectedAssetId(null)
    setIsCreateOpen(true)
  }

  const handleSubmitCreateAsset = async (formData: Record<string, any>) => {
    try {
      await createAsset.mutateAsync({
        asset_name: String(formData.asset_name ?? "").trim(),
        category_id: String(formData.category_id ?? "").trim(),
        serial_number: String(formData.serial_number ?? "").trim(),
        status: String(formData.status ?? "").trim(),
        location: String(formData.location ?? "").trim(),
        assigned_to: formData.assigned_to ? String(formData.assigned_to).trim() : null,
        notes: formData.notes ? String(formData.notes).trim() : null,
        purchase_date: formData.purchase_date ? String(formData.purchase_date).slice(0, 10) : null,
        purchase_cost: formData.purchase_cost ? Number(formData.purchase_cost) : null,
      })
      toast.success("Asset created successfully")
      setIsCreateOpen(false)
    } catch (error: any) {
      toast.error(error?.message || "Create failed")
    }
  }

  const handleSubmitUpdateAsset = async (formData: Record<string, any>) => {
    if (!selectedAsset) {
      toast.error("No asset selected")
      return
    }

    try {
      await updateAsset.mutateAsync({
        asset_id: selectedAsset.asset_id,
        status: String(formData.status ?? "").trim(),
        location: String(formData.location ?? "").trim(),
        notes: formData.notes ? String(formData.notes).trim() : null,
      })
      toast.success("Asset updated successfully")
      setIsEditOpen(false)
      setSelectedAsset(null)
      setSelectedAssetId(null)
    } catch (error: any) {
      toast.error(error?.message || "Update failed")
    }
  }

  const handleDetailsOpenChange = (open: boolean) => {
    setIsDetailsOpen(open)
    if (!open) {
      setSelectedAssetId(null)
    }
  }

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open)
    if (!open) {
      setSelectedAssetId(null)
    }
  }

  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Assets module
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Assets</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage asset records with live React Query updates, metrics, details lookup, edits, and deletes.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              refetch()
              refetchMetrics()
            }}
            className="w-full gap-2 rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm xl:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <FinanceCard
            title="Total Assets"
            value={totalAssets}
            icon={<Box className="h-4 w-4 text-slate-500" />}
            isLoading={isLoading || isFetching || metricsLoading || metricsFetching}
          />
          <FinanceCard
            title="Active Categories"
            value={activeCategories}
            icon={<Layers3 className="h-4 w-4 text-slate-500" />}
            description={`${activeCategories} active categories`}
            isLoading={isLoading || isFetching || metricsLoading || metricsFetching}
          />
          <FinanceCard
            title="Inventory Value"
            value={inventoryValue}
            isCurrency
            currencySymbol="₦"
            icon={<Warehouse className="h-4 w-4 text-slate-500" />}
            description="Current inventory value"
            isLoading={isLoading || isFetching || metricsLoading || metricsFetching}
          />
        </div>
      </div>

      {isError || metricsError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble fetching assets.
          <Button
            variant="outline"
            onClick={() => {
              refetch()
              refetchMetrics()
            }}
            className="ml-3 rounded-xl border-red-200 bg-white"
          >
            Retry
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Asset registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage asset entries.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Use the table search and filters for quick lookup</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <FinanceDataTable
            title="Assets"
            description="Premium asset management table"
            data={assets}
            filterOptions={filterOptions}
            columns={columns}
            onAdd={handleAddAsset}
            onEdit={handleEditAsset}
            onView={handleViewAsset}
            onDelete={(id) => handleDeleteAsset(assets.find((item) => item.id === id)?.asset_id ?? id)}
            currencySymbol="₦"
            isLoading={isLoading || isFetching}
          />
        </div>
      </Card>

      <FinanceFormDialog
        title="New Asset"
        fields={createFields}
        initialValues={{
          asset_name: "",
          category_id: categoryOptions[0]?.value || "",
          serial_number: "",
          purchase_date: new Date().toISOString().slice(0, 10),
          purchase_cost: "",
          status: statusOptions[0].value,
          location: "",
          assigned_to: "",
          notes: "",
        }}
        isOpen={isCreateOpen}
        onOpenChange={handleCreateOpenChange}
        onSubmit={handleSubmitCreateAsset}
        submitLabel="Save Asset"
        currencySymbol="₦"
      />

      <FinanceFormDialog
        title="Edit Asset"
        fields={editFields}
        initialValues={
          selectedAsset
            ? {
                status: selectedAsset.status,
                location: selectedAsset.location,
                notes: selectedAsset.notes,
              }
            : {
                status: statusOptions[0].value,
                location: "",
                notes: "",
              }
        }
        isOpen={isEditOpen}
        onOpenChange={handleEditOpenChange}
        onSubmit={handleSubmitUpdateAsset}
        submitLabel="Update Asset"
        currencySymbol="₦"
      />

      <FinanceDetailsDialog
        title="Asset Details"
        data={selectedAssetDetails || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        onEdit={() => {
          setIsDetailsOpen(false)
          if (selectedAsset) {
            setIsEditOpen(true)
          }
        }}
        onDelete={() => {
          setIsDetailsOpen(false)
          if (selectedAsset) {
            handleDeleteAsset(selectedAsset.asset_id)
          }
        }}
        actions={{
          edit: true,
          delete: true,
        }}
        deleteConfirmation={{
          enabled: true,
          title: "Delete Asset",
          description: "This will permanently remove the asset record.",
          itemName: selectedAsset?.asset_name || "Asset",
        }}
        currencySymbol="₦"
      />
    </div>
  )
}
