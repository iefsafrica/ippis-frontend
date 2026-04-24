"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Plus, Trash2, Edit, MoreVertical, FileCheck, FolderPlus, FolderOpen, Eye, Sparkles, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useCreateFolder, useDeleteFolder, useGetFolder, useGetFolders, useUpdateFolder } from "@/services/hooks/file-manager/folders"
import { useGetFileManagerDashboard } from "@/services/hooks/file-manager/dashboard"
import { useGetFiles } from "@/services/hooks/file-manager/files"

const fileManagerTabTriggerClasses =
  "rounded-full border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-white/80 data-[state=active]:border-emerald-600 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"

export function FileConfiguration() {
  const [isAddFileTypeDialogOpen, setIsAddFileTypeDialogOpen] = useState(false)
  const [storageLimit, setStorageLimit] = useState(1000) // GB
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false)
  const [versioningEnabled, setVersioningEnabled] = useState(true)
  const [maxVersions, setMaxVersions] = useState(5)
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  const [compressionEnabled, setCompressionEnabled] = useState(true)
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(true)
  const [retentionPeriod, setRetentionPeriod] = useState(365) // days

  const {
    data: dashboardResponse,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    refetch: refetchDashboard,
  } = useGetFileManagerDashboard()
  const {
    data: foldersResponse,
    isLoading: isFoldersLoading,
    refetch: refetchFolders,
  } = useGetFolders()
  const folders = foldersResponse?.data ?? []
  const { data: filesResponse, isLoading: isFilesLoading, refetch: refetchFiles } = useGetFiles()
  const files = filesResponse?.data ?? []
  const createFolderMutation = useCreateFolder()
  const updateFolderMutation = useUpdateFolder()
  const deleteFolderMutation = useDeleteFolder()

  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewFolderId, setViewFolderId] = useState<string | null>(null)
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null)
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null)
  const [folderName, setFolderName] = useState("")
  const [folderParentId, setFolderParentId] = useState<string>("root")
  const [renameFolderName, setRenameFolderName] = useState("")
  const [folderSearchTerm, setFolderSearchTerm] = useState("")

  const { data: viewedFolderResponse } = useGetFolder(viewFolderId ?? undefined, Boolean(viewFolderId))
  const viewedFolder = viewedFolderResponse?.data
  const dashboard = dashboardResponse?.data

  const liveFileTypes = useMemo(() => {
    const groups = new Map<
      string,
      { extension: string; name: string; mimeType: string; count: number; latestUpload: string; allowed: boolean }
    >()

    files.forEach((file) => {
      const extension = file.name.includes(".") ? `.${file.name.split(".").pop()?.toLowerCase() ?? ""}` : "—"
      const mimeType = file.file_type || "application/octet-stream"
      const key = `${extension}:${mimeType}`
      const existing = groups.get(key)

      const name =
        mimeType.startsWith("image/")
          ? "Image"
          : mimeType === "application/pdf"
            ? "PDF Document"
            : mimeType.includes("sheet") || mimeType.includes("excel")
              ? "Spreadsheet"
              : mimeType.includes("word") || mimeType.includes("document")
                ? "Document"
                : extension === "—"
                  ? "File"
                  : `${extension.slice(1).toUpperCase()} File`

      const allowed = ![".exe", ".js", ".mp4"].includes(extension)

      groups.set(key, {
        extension,
        name,
        mimeType,
        count: (existing?.count ?? 0) + 1,
        latestUpload:
          !existing || new Date(file.created_at).getTime() > new Date(existing.latestUpload).getTime()
            ? file.created_at
            : existing.latestUpload,
        allowed,
      })
    })

    return Array.from(groups.values()).sort((a, b) => b.count - a.count)
  }, [files])

  const liveSummary = {
    totalFiles: dashboard?.highlights.total_files ?? files.length,
    totalFolders: dashboard?.highlights.total_folders ?? folders.length,
    storageUsed: dashboard?.highlights.total_storage_used ?? 0,
    rootFolders: folders.filter((folder) => folder.parent_id === null).length,
  }

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

  const orderedFolders = [...folders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const rootFolders = orderedFolders.filter((folder) => folder.parent_id === null)
  const subFolders = orderedFolders.filter((folder) => folder.parent_id !== null)
  const filteredFolders = orderedFolders.filter((folder) => {
    const term = folderSearchTerm.toLowerCase()
    return (
      folder.name.toLowerCase().includes(term) ||
      folder.folder_id.toLowerCase().includes(term) ||
      resolveParentName(folder.parent_id).toLowerCase().includes(term)
    )
  })
  const latestFolder = orderedFolders[0]

  const formatFolderDate = (value: string) =>
    new Date(value).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const formatBytes = (value: number | string) => {
    const bytes = Number(value)
    if (!Number.isFinite(bytes)) return "-"
    if (bytes < 1024) return `${bytes} B`

    const units = ["KB", "MB", "GB", "TB"]
    let size = bytes / 1024
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex += 1
    }

    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`
  }

  const handleCreateFolder = async () => {
    const trimmedName = folderName.trim()
    if (!trimmedName) {
      toast.error("Enter a folder name before creating it.")
      return
    }

    try {
      await createFolderMutation.mutateAsync({
        name: trimmedName,
        parent_id: folderParentId === "root" ? null : folderParentId,
      })
      toast.success("Folder created successfully")
      setFolderName("")
      setFolderParentId("root")
      setIsFolderDialogOpen(false)
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
        error instanceof Error ? error.message : "Failed to update folder. Please try again."
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
        error instanceof Error ? error.message : "Failed to delete folder. Delete child folders first."
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              File configuration module
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">File Configuration</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Configure file storage, folder structure, and live file categories using the data already in your file-manager API.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                refetchDashboard()
                refetchFolders()
                refetchFiles()
              }}
              className="gap-2 rounded-full border border-gray-300 bg-white text-slate-700 shadow-sm transition-colors duration-150 ease-in-out hover:bg-[#f3fcf5] hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="rounded-full bg-[#008751] px-5 text-white hover:bg-[#00724a]">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Total Files</CardDescription>
              <CardTitle className="text-3xl">{liveSummary.totalFiles}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isDashboardLoading || isDashboardFetching || isFilesLoading ? "Loading live file count..." : "Live files from the API."}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Total Folders</CardDescription>
              <CardTitle className="text-3xl">{liveSummary.totalFolders}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Folders currently stored in the file manager.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Storage Used</CardDescription>
              <CardTitle className="text-3xl">{formatBytes(liveSummary.storageUsed)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Reported by the dashboard endpoint.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-none">
            <CardHeader className="pb-2">
              <CardDescription>Root Folders</CardDescription>
              <CardTitle className="text-3xl">{liveSummary.rootFolders}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Folders without parents.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mx-auto mb-4 flex h-auto w-full flex-wrap justify-center gap-1 rounded-full border border-emerald-200 bg-white/80 p-1 shadow-sm">
          <TabsTrigger className={fileManagerTabTriggerClasses} value="general">General Settings</TabsTrigger>
          <TabsTrigger className={fileManagerTabTriggerClasses} value="storage">Storage</TabsTrigger>
          <TabsTrigger className={fileManagerTabTriggerClasses} value="security">Security</TabsTrigger>
          <TabsTrigger className={fileManagerTabTriggerClasses} value="file-types">File Types</TabsTrigger>
          <TabsTrigger className={fileManagerTabTriggerClasses} value="folders">Folder Structure</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Document Versioning</CardTitle>
                <CardDescription>Configure version control for documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="versioning">Enable Versioning</Label>
                    <p className="text-sm text-muted-foreground">Keep track of document changes with version history</p>
                  </div>
                  <Switch id="versioning" checked={versioningEnabled} onCheckedChange={setVersioningEnabled} />
                </div>
                <div>
                  <Label htmlFor="max-versions">Maximum Versions</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="max-versions"
                      disabled={!versioningEnabled}
                      value={[maxVersions]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => setMaxVersions(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{maxVersions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Retention Policy</CardTitle>
                <CardDescription>Configure document retention settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-delete">Auto-Delete Old Files</Label>
                    <p className="text-sm text-muted-foreground">Automatically delete files after retention period</p>
                  </div>
                  <Switch id="auto-delete" checked={autoDeleteEnabled} onCheckedChange={setAutoDeleteEnabled} />
                </div>
                <div>
                  <Label htmlFor="retention-period">Retention Period (days)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="retention-period"
                      disabled={!autoDeleteEnabled}
                      value={[retentionPeriod]}
                      min={30}
                      max={3650}
                      step={30}
                      onValueChange={(value) => setRetentionPeriod(value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{retentionPeriod}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Audit Logging</CardTitle>
                <CardDescription>Configure file activity tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audit-logging">Enable Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Track all file operations for compliance and security
                    </p>
                  </div>
                  <Switch id="audit-logging" checked={auditLoggingEnabled} onCheckedChange={setAuditLoggingEnabled} />
                </div>
                <div className="space-y-2">
                  <Label>Log These Activities</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="log-view" defaultChecked />
                      <label
                        htmlFor="log-view"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        View/Download
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="log-edit" defaultChecked />
                      <label
                        htmlFor="log-edit"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Edit/Update
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="log-delete" defaultChecked />
                      <label
                        htmlFor="log-delete"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Delete
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="log-share" defaultChecked />
                      <label
                        htmlFor="log-share"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Share/Permissions
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Default Settings</CardTitle>
                <CardDescription>Configure default behavior for new files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-visibility">Default Visibility</Label>
                  <Select defaultValue="department">
                    <SelectTrigger id="default-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="department">Department Only</SelectItem>
                      <SelectItem value="organization">Organization-wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="default-category">Default Category</Label>
                  <Select defaultValue="uncategorized">
                    <SelectTrigger id="default-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uncategorized">Uncategorized</SelectItem>
                      <SelectItem value="hr">HR Documents</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Storage Limits</CardTitle>
                <CardDescription>Configure storage space allocation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storage-limit">Total Storage Limit (GB)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="storage-limit"
                      value={[storageLimit]}
                      min={100}
                      max={10000}
                      step={100}
                      onValueChange={(value) => setStorageLimit(value[0])}
                      className="flex-1"
                    />
                    <span className="w-16 text-center">{storageLimit} GB</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="per-user-limit">Per User Limit (GB)</Label>
                  <Select defaultValue="5">
                    <SelectTrigger id="per-user-limit">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 GB</SelectItem>
                      <SelectItem value="2">2 GB</SelectItem>
                      <SelectItem value="5">5 GB</SelectItem>
                      <SelectItem value="10">10 GB</SelectItem>
                      <SelectItem value="20">20 GB</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="warning-threshold">Warning Threshold (%)</Label>
                  <Select defaultValue="80">
                    <SelectTrigger id="warning-threshold">
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="70">70%</SelectItem>
                      <SelectItem value="80">80%</SelectItem>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Compression Settings</CardTitle>
                <CardDescription>Configure file compression to save space</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compression">Enable Compression</Label>
                    <p className="text-sm text-muted-foreground">Automatically compress files to save storage space</p>
                  </div>
                  <Switch id="compression" checked={compressionEnabled} onCheckedChange={setCompressionEnabled} />
                </div>
                <div>
                  <Label htmlFor="compression-level">Compression Level</Label>
                  <Select defaultValue="medium" disabled={!compressionEnabled}>
                    <SelectTrigger id="compression-level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Faster)</SelectItem>
                      <SelectItem value="medium">Medium (Balanced)</SelectItem>
                      <SelectItem value="high">High (Smaller Files)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File Types to Compress</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="compress-docs" defaultChecked disabled={!compressionEnabled} />
                      <label
                        htmlFor="compress-docs"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Documents (PDF, DOCX, TXT)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="compress-images" defaultChecked disabled={!compressionEnabled} />
                      <label
                        htmlFor="compress-images"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Images (JPG, PNG, GIF)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="compress-presentations" defaultChecked disabled={!compressionEnabled} />
                      <label
                        htmlFor="compress-presentations"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Presentations (PPTX)
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Backup Configuration</CardTitle>
                <CardDescription>Configure automatic backup settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-backup">Enable Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup files on schedule</p>
                  </div>
                  <Switch id="auto-backup" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="backup-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backup-retention">Backup Retention</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="backup-retention">
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Storage Location</CardTitle>
                <CardDescription>Configure where files are stored</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storage-type">Storage Type</Label>
                  <Select defaultValue="cloud">
                    <SelectTrigger id="storage-type">
                      <SelectValue placeholder="Select storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="cloud">Cloud Storage</SelectItem>
                      <SelectItem value="hybrid">Hybrid Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cloud-provider">Cloud Provider</Label>
                  <Select defaultValue="aws">
                    <SelectTrigger id="cloud-provider">
                      <SelectValue placeholder="Select cloud provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                      <SelectItem value="custom">Custom Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="storage-region">Storage Region</Label>
                  <Select defaultValue="us-east-1">
                    <SelectTrigger id="storage-region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-1">US West (N. California)</SelectItem>
                      <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                      <SelectItem value="af-south-1">Africa (Cape Town)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Encryption Settings</CardTitle>
                <CardDescription>Configure file encryption for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="encryption">Enable Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt files to protect sensitive information</p>
                  </div>
                  <Switch id="encryption" checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} />
                </div>
                <div>
                  <Label htmlFor="encryption-algorithm">Encryption Algorithm</Label>
                  <Select defaultValue="aes-256" disabled={!encryptionEnabled}>
                    <SelectTrigger id="encryption-algorithm">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes-128">AES-128</SelectItem>
                      <SelectItem value="aes-256">AES-256</SelectItem>
                      <SelectItem value="rsa-2048">RSA-2048</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="encrypt-in-transit">Encrypt in Transit</Label>
                    <p className="text-sm text-muted-foreground">Encrypt files during upload and download</p>
                  </div>
                  <Switch id="encrypt-in-transit" defaultChecked disabled={!encryptionEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="encrypt-at-rest">Encrypt at Rest</Label>
                    <p className="text-sm text-muted-foreground">Encrypt files when stored on disk</p>
                  </div>
                  <Switch id="encrypt-at-rest" defaultChecked disabled={!encryptionEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Access Control</CardTitle>
                <CardDescription>Configure file access permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="access-model">Access Control Model</Label>
                  <Select defaultValue="rbac">
                    <SelectTrigger id="access-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rbac">Role-Based Access Control</SelectItem>
                      <SelectItem value="abac">Attribute-Based Access Control</SelectItem>
                      <SelectItem value="dac">Discretionary Access Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enforce-permissions">Enforce Strict Permissions</Label>
                    <p className="text-sm text-muted-foreground">Strictly enforce access control rules</p>
                  </div>
                  <Switch id="enforce-permissions" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="admin-override">Allow Admin Override</Label>
                    <p className="text-sm text-muted-foreground">Administrators can override access controls</p>
                  </div>
                  <Switch id="admin-override" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-sharing">Allow Public Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow files to be shared with public links</p>
                  </div>
                  <Switch id="public-sharing" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Virus Scanning</CardTitle>
                <CardDescription>Configure virus scanning for uploaded files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="virus-scan">Enable Virus Scanning</Label>
                    <p className="text-sm text-muted-foreground">Scan all uploaded files for viruses and malware</p>
                  </div>
                  <Switch id="virus-scan" defaultChecked />
                </div>
                <div>
                  <Label htmlFor="scan-action">Action on Infected Files</Label>
                  <Select defaultValue="quarantine">
                    <SelectTrigger id="scan-action">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block Upload</SelectItem>
                      <SelectItem value="quarantine">Quarantine File</SelectItem>
                      <SelectItem value="delete">Delete File</SelectItem>
                      <SelectItem value="notify">Notify Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="scan-downloads">Scan on Download</Label>
                    <p className="text-sm text-muted-foreground">Scan files when they are downloaded</p>
                  </div>
                  <Switch id="scan-downloads" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Security Compliance</CardTitle>
                <CardDescription>Configure compliance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gdpr-compliance">GDPR Compliance</Label>
                    <p className="text-sm text-muted-foreground">Enable features required for GDPR compliance</p>
                  </div>
                  <Switch id="gdpr-compliance" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hipaa-compliance">HIPAA Compliance</Label>
                    <p className="text-sm text-muted-foreground">Enable features required for HIPAA compliance</p>
                  </div>
                  <Switch id="hipaa-compliance" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pci-compliance">PCI DSS Compliance</Label>
                    <p className="text-sm text-muted-foreground">Enable features required for PCI DSS compliance</p>
                  </div>
                  <Switch id="pci-compliance" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-classification">Data Classification</Label>
                    <p className="text-sm text-muted-foreground">Enable automatic data classification</p>
                  </div>
                  <Switch id="data-classification" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* File Types Tab */}
        <TabsContent value="file-types">
          <div className="space-y-6">
            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl">Live File Types</CardTitle>
                  <CardDescription>
                    This table is derived from files already uploaded to the file-manager API.
                  </CardDescription>
                </div>
                <Dialog open={isAddFileTypeDialogOpen} onOpenChange={setIsAddFileTypeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#008751] hover:bg-[#00724a]">
                      <Plus className="mr-2 h-4 w-4" />
                      Add File Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                      <DialogTitle>Request New File Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                        File type rules are driven by the data already in the system. If you want to allow a new format, upload a file of that type or extend the backend validation rules.
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="allow-file-type" defaultChecked />
                        <label htmlFor="allow-file-type" className="text-sm font-medium leading-none">
                          Mark as allowed in this workspace
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddFileTypeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-[#008751] hover:bg-[#00724a]">Close</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
            </Card>

            <div className="grid gap-3 md:grid-cols-3">
              <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription>Detected Types</CardDescription>
                  <CardTitle className="text-3xl">{liveFileTypes.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Unique types detected from uploaded files.</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription>Uploaded Files</CardDescription>
                  <CardTitle className="text-3xl">{files.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">All files currently returned by the API.</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardDescription>Live Sync</CardDescription>
                  <CardTitle className="text-3xl">{isFilesLoading ? "..." : "On"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Updates as soon as the file list changes.</p>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">File Type Registry</CardTitle>
                  <CardDescription>
                    {isFilesLoading ? "Loading files..." : `Showing ${liveFileTypes.length} detected file types.`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-2xl border-slate-200 bg-white text-slate-700"
                    onClick={() => {
                      refetchFiles()
                      refetchDashboard()
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Extension</TableHead>
                        <TableHead>Type Name</TableHead>
                        <TableHead>MIME Type</TableHead>
                        <TableHead>Files</TableHead>
                        <TableHead>Latest Upload</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {liveFileTypes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                            No file types detected yet. Upload a file to populate this table.
                          </TableCell>
                        </TableRow>
                      ) : (
                        liveFileTypes.map((fileType) => (
                          <TableRow key={`${fileType.extension}-${fileType.mimeType}`}>
                            <TableCell className="font-mono text-sm">{fileType.extension}</TableCell>
                            <TableCell>{fileType.name}</TableCell>
                            <TableCell className="max-w-[240px] truncate text-sm text-slate-600">{fileType.mimeType}</TableCell>
                            <TableCell>{fileType.count}</TableCell>
                            <TableCell>{formatFolderDate(fileType.latestUpload)}</TableCell>
                            <TableCell>
                              {fileType.allowed ? (
                                <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Allowed</Badge>
                              ) : (
                                <Badge className="border-amber-200 bg-amber-100 text-amber-800">Review</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Folders Tab */}
        <TabsContent value="folders">
          <div className="space-y-6">
            <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50 shadow-sm">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl">Folder Structure</CardTitle>
                  <CardDescription>Manage live folders from the file-manager API with the same visual language as the rest of the file manager.</CardDescription>
                </div>
                <Dialog
                  open={isFolderDialogOpen}
                  onOpenChange={(open) => {
                    setIsFolderDialogOpen(open)
                    if (!open) {
                      setFolderName("")
                      setFolderParentId("root")
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2 rounded-full bg-[#008751] px-5 hover:bg-[#00724a]">
                      <FolderPlus className="mr-2 h-4 w-4" />
                      Add Folder
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Folder</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="folder-name">Folder Name</Label>
                        <Input
                          id="folder-name"
                          placeholder="e.g. Invoices"
                          value={folderName}
                          onChange={(e) => setFolderName(e.target.value)}
                          className="rounded-2xl border-slate-200 bg-white transition hover:border-slate-300 focus-visible:ring-[#008751]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="folder-parent">Parent Folder</Label>
                        <Select value={folderParentId} onValueChange={setFolderParentId}>
                          <SelectTrigger id="folder-parent" className="rounded-2xl border-slate-200 bg-white transition hover:border-slate-300">
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
                      <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)} className="rounded-2xl border-slate-200 bg-white">
                        Cancel
                      </Button>
                      <Button
                        className="rounded-2xl bg-[#008751] hover:bg-[#00724a]"
                        onClick={handleCreateFolder}
                        disabled={createFolderMutation.isPending}
                      >
                        {createFolderMutation.isPending ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
            </Card>

            <div className="grid gap-3 md:grid-cols-3">
              <Card className="border-slate-200 shadow-none">
                <CardHeader className="pb-2">
                  <CardDescription>Total Folders</CardDescription>
                  <CardTitle className="text-3xl">{folders.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Live folders from the backend.</p>
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
                  <CardTitle className="text-3xl">{subFolders.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {latestFolder ? `Latest: ${latestFolder.name}` : "No folders created yet."}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.22)]">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">Live Folder Registry</CardTitle>
                  <CardDescription>
                    {isFoldersLoading
                      ? "Loading folders..."
                      : `Showing ${filteredFolders.length} of ${folders.length} folders.`}
                  </CardDescription>
                </div>
                <div className="w-full md:w-80">
                  <Input
                    placeholder="Search folders..."
                    value={folderSearchTerm}
                    onChange={(e) => setFolderSearchTerm(e.target.value)}
                    className="rounded-2xl border-slate-200 bg-white transition hover:border-slate-300 focus-visible:ring-[#008751]"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-2xl border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Folder Name</TableHead>
                        <TableHead>Folder ID</TableHead>
                        <TableHead>Parent Folder</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFolders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No folders found. Create one to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFolders.map((folder) => (
                          <TableRow key={folder.folder_id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 text-emerald-600" />
                                <span className="font-medium">{folder.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{folder.folder_id}</TableCell>
                            <TableCell>{resolveParentName(folder.parent_id)}</TableCell>
                            <TableCell>{formatFolderDate(folder.created_at)}</TableCell>
                          <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setViewFolderId(folder.folder_id)}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRenameFolderId(folder.folder_id)
                                      setIsRenameDialogOpen(true)
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDeleteFolderId(folder.folder_id)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
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
                placeholder="Enter folder name"
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
        description="This will remove the selected folder from the file manager."
        itemName={
          deleteFolderId ? folders.find((folder) => folder.folder_id === deleteFolderId)?.name ?? "this folder" : "this folder"
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
              <div className="font-medium">{viewedFolder ? formatFolderDate(viewedFolder.created_at) : "-"}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground">Updated At</div>
              <div className="font-medium">{viewedFolder ? formatFolderDate(viewedFolder.updated_at) : "-"}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
