"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { FileManagerDataTable } from "@/app/admin/file-manager/components/file-manager-data-table"
import {
  useCreateFolder,
  useDeleteFolder,
  useGetFolder,
  useGetFolders,
  useUpdateFolder,
} from "@/services/hooks/file-manager/folders"

export function FileManagerDashboard() {
  const {
    data: foldersResponse,
    isLoading: isFoldersLoading,
    isFetching: isFoldersFetching,
    isError: isFoldersError,
    refetch: refetchFolders,
  } = useGetFolders()
  const folders = foldersResponse?.data ?? []

  const createFolderMutation = useCreateFolder()
  const updateFolderMutation = useUpdateFolder()
  const deleteFolderMutation = useDeleteFolder()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewFolderId, setViewFolderId] = useState<string | null>(null)
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null)
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null)
  const [folderName, setFolderName] = useState("")
  const [parentFolderId, setParentFolderId] = useState<string>("root")
  const [renameFolderName, setRenameFolderName] = useState("")

  const { data: viewedFolderResponse } = useGetFolder(viewFolderId ?? undefined, Boolean(viewFolderId))
  const viewedFolder = viewedFolderResponse?.data

  useEffect(() => {
    if (!renameFolderId) {
      setRenameFolderName("")
      return
    }

    const folder = folders.find((item) => item.folder_id === renameFolderId)
    setRenameFolderName(folder?.name ?? "")
  }, [folders, renameFolderId])

  const resolveParentName = (parentId: string | null) => {
    if (!parentId) {
      return "Root"
    }

    return folders.find((folder) => folder.folder_id === parentId)?.name ?? parentId
  }

  const rootFolders = folders.filter((folder) => folder.parent_id === null)
  const nestedFolders = folders.filter((folder) => folder.parent_id !== null)
  const latestFolder = [...folders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const tableColumns = [
    { key: "name", label: "Folder Name", sortable: true },
    { key: "folder_id", label: "Folder ID", sortable: true },
    {
      key: "parent_name",
      label: "Parent Folder",
      sortable: true,
    },
    {
      key: "created_at",
      label: "Created At",
      sortable: true,
      render: (value: string) => (value ? formatDate(value) : "-"),
    },
    {
      key: "scope",
      label: "Scope",
      sortable: true,
      render: (value: string) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            value === "Root"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ]

  const tableData = folders.map((folder) => ({
    id: folder.folder_id,
    name: folder.name,
    folder_id: folder.folder_id,
    parent_id: folder.parent_id,
    parent_name: resolveParentName(folder.parent_id),
    created_at: folder.created_at,
    scope: folder.parent_id === null ? "Root" : "Nested",
  }))

  const filterOptions = [
    {
      id: "folder_scope",
      label: "Folder Type",
      options: [
        { value: "root", label: "Root" },
        { value: "nested", label: "Nested" },
      ],
    },
  ]

  const handleCreateFolder = async () => {
    const trimmedName = folderName.trim()
    if (!trimmedName) {
      toast.error("Enter a folder name before creating it.")
      return
    }

    try {
      await createFolderMutation.mutateAsync({
        name: trimmedName,
        parent_id: parentFolderId === "root" ? null : parentFolderId,
      })
      toast.success("Folder created successfully")
      setFolderName("")
      setParentFolderId("root")
      setIsCreateDialogOpen(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create folder. Please try again."
      toast.error(message)
    }
  }

  const handleRenameFolder = async () => {
    if (!renameFolderId) {
      return
    }

    const trimmedName = renameFolderName.trim()
    if (!trimmedName) {
      toast.error("Enter a folder name before saving.")
      return
    }

    try {
      await updateFolderMutation.mutateAsync({
        folder_id: renameFolderId,
        name: trimmedName,
      })
      toast.success("Folder renamed successfully")
      setRenameFolderId(null)
      setIsRenameDialogOpen(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to rename folder. Please try again."
      toast.error(message)
    }
  }

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) {
      return
    }

    try {
      await deleteFolderMutation.mutateAsync(deleteFolderId)
      toast.success("Folder deleted successfully")
      setDeleteFolderId(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Folder could not be deleted. Delete the folder contents first."
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              File manager module
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Folder Management</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage live folders from the file-manager endpoints with create, rename, view, and delete flows.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => refetchFolders()}
            className="w-full gap-2 rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm xl:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Total Folders</CardDescription>
              <CardTitle className="text-3xl">{folders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">All folders returned by the API.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Root Folders</CardDescription>
              <CardTitle className="text-3xl">{rootFolders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Folders with no parent folder.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Nested Folders</CardDescription>
              <CardTitle className="text-3xl">{nestedFolders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {latestFolder ? `Latest: ${latestFolder.name}` : "No folders created yet."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setFolderName("")
            setParentFolderId("root")
          }
        }}
      >
            <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="parent-folder">Parent Folder</Label>
              <Select value={parentFolderId} onValueChange={setParentFolderId}>
                <SelectTrigger id="parent-folder">
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Root Folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.folder_id} value={folder.folder_id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#008751] hover:bg-[#00724a]"
              onClick={handleCreateFolder}
              disabled={createFolderMutation.isPending}
            >
              {createFolderMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isFoldersError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          We had trouble fetching folders.
          <Button variant="outline" onClick={() => refetchFolders()} className="ml-3 rounded-xl border-red-200 bg-white">
            Retry
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Folder registry</h2>
              <p className="text-sm text-slate-500">Browse, filter, and manage file-manager folders.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                {isFoldersLoading || isFoldersFetching
                  ? "Loading folders..."
                  : `Showing ${tableData.length} folders`}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <FileManagerDataTable
            title="Folders"
            description="Premium file manager folder table"
            data={tableData}
            columns={tableColumns}
            filterOptions={filterOptions}
            defaultSortColumn="created_at"
            defaultSortDirection="desc"
            onAdd={() => setIsCreateDialogOpen(true)}
            onEdit={(id) => {
              setRenameFolderId(id)
              setIsRenameDialogOpen(true)
            }}
            onView={(id) => setViewFolderId(id)}
            onDelete={(id) => {
              setDeleteFolderId(id)
              setIsDeleteDialogOpen(true)
            }}
            isLoading={isFoldersLoading || isFoldersFetching}
          />
        </div>
      </Card>

      <Dialog
        open={isRenameDialogOpen}
        onOpenChange={(open) => {
          setIsRenameDialogOpen(open)
          if (!open) {
            setRenameFolderId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="rename-folder-name">Folder Name</Label>
              <Input
                id="rename-folder-name"
                value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
                placeholder="Enter new folder name"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false)
                setRenameFolderId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#008751] hover:bg-[#00724a]"
              onClick={handleRenameFolder}
              disabled={updateFolderMutation.isPending}
            >
              {updateFolderMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeleteFolderId(null)
        }}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        description="This action removes the folder from the file manager."
        itemName={
          deleteFolderId
            ? folders.find((folder) => folder.folder_id === deleteFolderId)?.name ?? "this folder"
            : "this folder"
        }
        isLoading={deleteFolderMutation.isPending}
      />

      <Dialog open={Boolean(viewFolderId)} onOpenChange={(open) => !open && setViewFolderId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Folder Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4 text-sm">
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground">Folder Name</div>
              <div className="font-medium">{viewedFolder?.name ?? "Loading..."}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground">Folder ID</div>
              <div className="font-mono">{viewedFolder?.folder_id ?? "-"}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground">Parent Folder</div>
              <div className="font-medium">{resolveParentName(viewedFolder?.parent_id ?? null)}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground">Created At</div>
              <div className="font-medium">{viewedFolder ? formatDate(viewedFolder.created_at) : "-"}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground">Updated At</div>
              <div className="font-medium">{viewedFolder ? formatDate(viewedFolder.updated_at) : "-"}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
