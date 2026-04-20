"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { FolderKanban, Layers3, RefreshCw, Search, Sparkles, Tags } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FinanceCard } from "@/app/admin/finance/components/finance-card"
import { FinanceDataTable } from "@/app/admin/finance/components/finance-data-table"
import { FinanceDetailsDialog, type FinanceDetailsField } from "@/app/admin/finance/components/finance-details-dialog"
import { FinanceFormDialog } from "@/app/admin/finance/components/finance-form-dialog"
import {
  useCreateAssetCategory,
  useDeleteAssetCategory,
  useGetAssetCategories,
  useGetAssetCategory,
  useUpdateAssetCategory,
} from "@/services/hooks/assets/categories"

type AssetCategoryUI = {
  id: string
  category_id: string
  category_name: string
  description: string
  status: string
  createdAt?: string
  updatedAt?: string
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
]

const resolveStatus = (value?: string | null) => {
  const normalized = String(value ?? "").trim().toLowerCase()
  return statusOptions.find((item) => item.value === normalized)?.value || "pending"
}

const createFields = [
  {
    name: "category_name",
    label: "Category Name",
    type: "text" as const,
    required: true,
    placeholder: "Enter category name",
    width: "full" as const,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    placeholder: "Enter category description",
    width: "full" as const,
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    required: true,
    options: statusOptions,
    width: "half" as const,
  },
]

const editFields = [
  {
    name: "category_name",
    label: "Category Name",
    type: "text" as const,
    required: true,
    placeholder: "Enter category name",
    width: "full" as const,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    placeholder: "Enter category description",
    width: "full" as const,
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    required: true,
    options: statusOptions,
    width: "half" as const,
  },
]

const detailsFields: FinanceDetailsField[] = [
  { label: "Category ID", key: "category_id", type: "reference" },
  { label: "Category Name", key: "category_name" },
  { label: "Description", key: "description" },
  {
    label: "Status",
    key: "status",
    type: "status",
    statusMap: {
      active: { label: "Active", variant: "default" },
      pending: { label: "Pending", variant: "secondary" },
    },
  },
  { label: "Created At", key: "createdAt", type: "date", format: "PPpp" },
  { label: "Updated At", key: "updatedAt", type: "date", format: "PPpp" },
]

const normalizeAssetCategory = (category: any): AssetCategoryUI => ({
  id: String(category.id ?? category.category_id),
  category_id: String(category.category_id ?? category.id ?? ""),
  category_name: category.category_name ?? category.name ?? "",
  description: category.description ?? "",
  status: resolveStatus(category.status),
  createdAt: category.created_at ?? category.createdAt ?? undefined,
  updatedAt: category.updated_at ?? category.updatedAt ?? undefined,
})

const extractCategories = (responseData: any): any[] => {
  if (!responseData) return []
  if (Array.isArray(responseData)) return responseData
  if (Array.isArray(responseData.categories)) return responseData.categories
  return []
}

export function CategoryContent() {
  const { data, isLoading, isFetching, isError, refetch } = useGetAssetCategories()
  const createCategory = useCreateAssetCategory()
  const updateCategory = useUpdateAssetCategory()
  const deleteCategory = useDeleteAssetCategory()

  const [selectedCategory, setSelectedCategory] = useState<AssetCategoryUI | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const categories = useMemo(
    () => extractCategories(data?.data).map(normalizeAssetCategory),
    [data],
  )

  const selectedCategoryDetailsQuery = useGetAssetCategory(
    selectedCategoryId ?? undefined,
    isDetailsOpen || isEditOpen,
  )
  const selectedCategoryDetails = selectedCategoryDetailsQuery.data?.data
    ? normalizeAssetCategory(selectedCategoryDetailsQuery.data.data)
    : selectedCategory

  useEffect(() => {
    if (isError) toast.error("Failed to load asset categories")
  }, [isError])

  useEffect(() => {
    if (selectedCategoryDetailsQuery.isError && selectedCategoryId) {
      toast.error("Failed to load category details")
    }
  }, [selectedCategoryDetailsQuery.isError, selectedCategoryId])

  const activeCategories = categories.filter((category) => category.status === "active").length
  const pendingCategories = categories.filter((category) => category.status === "pending").length

  const columns = [
    { key: "category_id", label: "Category ID", sortable: true },
    { key: "category_name", label: "Category Name", sortable: true },
    { key: "description", label: "Description", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : value === "pending"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown"}
        </span>
      ),
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
      id: "status",
      label: "Status",
      options: statusOptions,
      type: "select" as const,
    },
  ]

  const handleViewCategory = (id: string) => {
    const category = categories.find((item) => item.id === id)
    if (!category) return

    setSelectedCategory(category)
    setSelectedCategoryId(category.category_id)
    setIsDetailsOpen(true)
  }

  const handleEditCategory = (id: string) => {
    const category = categories.find((item) => item.id === id)
    if (!category) return

    setSelectedCategory(category)
    setSelectedCategoryId(category.category_id)
    setIsEditOpen(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory.mutateAsync(categoryId)
      toast.success("Category deleted successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete category")
    }
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setSelectedCategoryId(null)
    setIsCreateOpen(true)
  }

  const handleSubmitCreateCategory = async (formData: Record<string, any>) => {
    try {
      await createCategory.mutateAsync({
        category_name: String(formData.category_name ?? "").trim(),
        description: formData.description ? String(formData.description).trim() : null,
        status: String(formData.status ?? "").trim(),
      })
      toast.success("Category created successfully")
      setIsCreateOpen(false)
    } catch (error: any) {
      toast.error(error?.message || "Create failed")
    }
  }

  const handleSubmitUpdateCategory = async (formData: Record<string, any>) => {
    if (!selectedCategory) {
      toast.error("No category selected")
      return
    }

    try {
      await updateCategory.mutateAsync({
        category_id: selectedCategory.category_id,
        category_name: String(formData.category_name ?? "").trim(),
        description: formData.description ? String(formData.description).trim() : null,
        status: String(formData.status ?? "").trim(),
      })
      toast.success("Category updated successfully")
      setIsEditOpen(false)
      setSelectedCategory(null)
      setSelectedCategoryId(null)
    } catch (error: any) {
      toast.error(error?.message || "Update failed")
    }
  }

  const handleDetailsOpenChange = (open: boolean) => {
    setIsDetailsOpen(open)
    if (!open) {
      setSelectedCategoryId(null)
    }
  }

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open)
    if (!open) {
      setSelectedCategoryId(null)
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
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Asset Categories</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage asset category records with live React Query updates, details lookup, edits, and deletes.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => refetch()}
            className="w-full gap-2 rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm xl:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <FinanceCard
            title="Total Categories"
            value={categories.length}
            icon={<Tags className="h-4 w-4 text-slate-500" />}
            isLoading={isLoading || isFetching}
          />
          <FinanceCard
            title="Active"
            value={activeCategories}
            icon={<FolderKanban className="h-4 w-4 text-slate-500" />}
            description={`${activeCategories} active categories`}
            isLoading={isLoading || isFetching}
          />
          <FinanceCard
            title="Pending"
            value={pendingCategories}
            icon={<Layers3 className="h-4 w-4 text-slate-500" />}
            description={`${pendingCategories} pending categories`}
            isLoading={isLoading || isFetching}
          />
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble fetching asset categories.
          <Button variant="outline" onClick={() => refetch()} className="ml-3 rounded-xl border-red-200 bg-white">
            Retry
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Category registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage asset categories.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Use the table search and filters for quick lookup</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <FinanceDataTable
            title="Asset Categories"
            description="Premium asset category management table"
            data={categories}
            filterOptions={filterOptions}
            columns={columns}
            onAdd={handleAddCategory}
            onEdit={handleEditCategory}
            onView={handleViewCategory}
            onDelete={(id) => handleDeleteCategory(categories.find((item) => item.id === id)?.category_id ?? id)}
            isLoading={isLoading || isFetching}
          />
        </div>
      </Card>

      <FinanceFormDialog
        title="New Asset Category"
        fields={createFields}
        initialValues={{
          category_name: "",
          description: "",
          status: "pending",
        }}
        isOpen={isCreateOpen}
        onOpenChange={handleCreateOpenChange}
        onSubmit={handleSubmitCreateCategory}
        submitLabel="Save Category"
      />

      <FinanceFormDialog
        title="Edit Asset Category"
        fields={editFields}
        initialValues={
          selectedCategory
            ? {
                category_name: selectedCategory.category_name,
                description: selectedCategory.description,
                status: selectedCategory.status,
              }
            : {
                category_name: "",
                description: "",
                status: "pending",
              }
        }
        isOpen={isEditOpen}
        onOpenChange={handleEditOpenChange}
        onSubmit={handleSubmitUpdateCategory}
        submitLabel="Update Category"
      />

      <FinanceDetailsDialog
        title="Asset Category Details"
        data={selectedCategoryDetails || {}}
        fields={detailsFields}
        isOpen={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        onEdit={() => {
          setIsDetailsOpen(false)
          if (selectedCategory) {
            setIsEditOpen(true)
          }
        }}
        onDelete={() => {
          setIsDetailsOpen(false)
          if (selectedCategory) {
            handleDeleteCategory(selectedCategory.category_id)
          }
        }}
        actions={{
          edit: true,
          delete: true,
        }}
        deleteConfirmation={{
          enabled: true,
          title: "Delete Category",
          description: "This will permanently remove the category record.",
          itemName: selectedCategory?.category_name || "Category",
        }}
      />
    </div>
  )
}
