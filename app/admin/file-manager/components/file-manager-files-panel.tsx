"use client"

import { useEffect, useState } from "react"
import { Eye, FileText, RefreshCw, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import type { Folder } from "@/types/file-manager/folders"
import { useDeleteFile, useGetFiles, useUploadFile } from "@/services/hooks/file-manager/files"

type FileManagerFilesPanelProps = {
  folders: Folder[]
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const formatFileSize = (value: string | number) => {
  const bytes = Number(value)
  if (!Number.isFinite(bytes)) {
    return "-"
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ["KB", "MB", "GB", "TB"]
  let size = bytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

export function FileManagerFilesPanel({ folders }: FileManagerFilesPanelProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>("root")
  const [uploadFolderId, setUploadFolderId] = useState<string>("root")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [previewFileId, setPreviewFileId] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)

  const {
    data: filesResponse,
    isLoading: isFilesLoading,
    isFetching: isFilesFetching,
    isError: isFilesError,
    refetch: refetchFiles,
  } = useGetFiles(selectedFolderId === "root" ? null : selectedFolderId)
  const files = filesResponse?.data ?? []

  const uploadFileMutation = useUploadFile()
  const deleteFileMutation = useDeleteFile()

  useEffect(() => {
    if (!isUploadDialogOpen) {
      setSelectedFile(null)
      setUploadFolderId(selectedFolderId)
    }
  }, [isUploadDialogOpen, selectedFolderId])

  const folderOptions = [{ folder_id: "root", name: "Root Folder" }, ...folders]
  const selectedFolderName =
    selectedFolderId === "root"
      ? "Root Folder"
      : folders.find((folder) => folder.folder_id === selectedFolderId)?.name ?? selectedFolderId

  const latestFile = [...files].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]
  const previewFile = files.find((file) => file.file_id === previewFileId) ?? null
  const previewUrl = previewFile?.file_url ? encodeURI(previewFile.file_url) : ""

  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error("Choose a file before uploading.")
      return
    }

    try {
      await uploadFileMutation.mutateAsync({
        file: selectedFile,
        folder_id: uploadFolderId === "root" ? null : uploadFolderId,
      })
      toast.success("File uploaded successfully")
      setSelectedFile(null)
      setIsUploadDialogOpen(false)
      await refetchFiles()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload file."
      toast.error(message)
    }
  }

  const handleDeleteFile = async () => {
    if (!deleteFileId) {
      return
    }

    try {
      await deleteFileMutation.mutateAsync(deleteFileId)
      toast.success("File deleted successfully")
      setDeleteFileId(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete file."
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.22)]">
        <CardHeader className="gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              File manager module
            </div>
            <div>
              <CardTitle className="text-2xl">File Registry</CardTitle>
              <CardDescription>
                Upload files, browse folder-scoped file lists, and remove documents through the live API.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => refetchFiles()}
              className="gap-2 rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              className="gap-2 rounded-2xl bg-[#008751] hover:bg-[#00724a]"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Files in View</CardDescription>
            <CardTitle className="text-3xl">{files.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Files currently returned by the selected folder endpoint.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Selected Folder</CardDescription>
            <CardTitle className="text-3xl">{selectedFolderId === "root" ? "Root" : "Folder"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{selectedFolderName}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Latest File</CardDescription>
            <CardTitle className="text-3xl">{latestFile ? "1" : "0"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {latestFile ? `${latestFile.name} - ${formatDate(latestFile.created_at)}` : "No files available."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.22)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Files in folder</h2>
              <p className="text-sm text-slate-500">Switch folders to load the matching API response.</p>
            </div>

            <div className="flex flex-col gap-3 sm:min-w-[320px] sm:flex-row">
              <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map((folder) => (
                    <SelectItem key={folder.folder_id} value={folder.folder_id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => refetchFiles()}
                className="rounded-2xl border-slate-200 bg-white text-slate-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {isFilesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              We had trouble fetching files for this folder.
              <Button
                variant="outline"
                onClick={() => refetchFiles()}
                className="ml-3 rounded-xl border-red-200 bg-white"
              >
                Retry
              </Button>
            </div>
          ) : null}

          <div className="rounded-xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>File ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFilesLoading || isFilesFetching ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`file-loading-${index}`}>
                      <TableCell colSpan={6}>
                        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No files found for this folder.
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file.file_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          <div className="min-w-0">
                            <div className="truncate font-medium">{file.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{file.file_url}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{file.file_id}</TableCell>
                      <TableCell>{file.file_type}</TableCell>
                      <TableCell>{formatFileSize(file.file_size)}</TableCell>
                      <TableCell>{formatDate(file.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:bg-slate-50"
                            onClick={() => setPreviewFileId(file.file_id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View file</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteFileId(file.file_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete file</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <Dialog
        open={isUploadDialogOpen}
        onOpenChange={(open) => {
          setIsUploadDialogOpen(open)
          if (!open) {
            setSelectedFile(null)
            setUploadFolderId(selectedFolderId)
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-folder">Target Folder</Label>
              <Select value={uploadFolderId} onValueChange={setUploadFolderId}>
                <SelectTrigger id="file-folder">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map((folder) => (
                    <SelectItem key={folder.folder_id} value={folder.folder_id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-input">File</Label>
              <Input
                id="file-input"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              {selectedFile ? (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#008751] hover:bg-[#00724a]"
              onClick={handleUploadFile}
              disabled={uploadFileMutation.isPending}
            >
              {uploadFileMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(previewFile)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewFileId(null)
            setPreviewError(false)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>

          {previewFile ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-3 rounded-2xl border bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground">File Name</div>
                  <div className="font-medium">{previewFile.name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">File Type</div>
                  <div className="font-medium">{previewFile.file_type}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">File ID</div>
                  <div className="font-mono text-xs">{previewFile.file_id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Size</div>
                  <div className="font-medium">{formatFileSize(previewFile.file_size)}</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border bg-white">
                {previewFile.file_type?.startsWith("image/") ? (
                  !previewError ? (
                    <img
                      src={previewUrl}
                      alt={previewFile.name}
                      className="max-h-[60vh] w-full object-contain"
                      onError={() => setPreviewError(true)}
                    />
                  ) : (
                    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
                      <FileText className="h-10 w-10 text-slate-400" />
                      <div className="max-w-md space-y-2">
                        <p className="font-medium text-slate-900">Preview not available.</p>
                        <p className="text-sm text-slate-500">
                          The image URL could not be loaded directly, so the browser can only open the file link.
                        </p>
                      </div>
                      <Button asChild className="rounded-2xl bg-[#008751] hover:bg-[#00724a]">
                        <a href={previewUrl} target="_blank" rel="noreferrer">
                          Open Image
                        </a>
                      </Button>
                    </div>
                  )
                ) : previewFile.file_type === "application/pdf" ? (
                  <iframe
                    src={previewUrl}
                    title={previewFile.name}
                    className="h-[70vh] w-full"
                  />
                ) : (
                  <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
                    <FileText className="h-10 w-10 text-slate-400" />
                    <div className="max-w-md space-y-2">
                      <p className="font-medium text-slate-900">Preview not available for this file type.</p>
                      <p className="text-sm text-slate-500">
                        You can still open the file directly in a new tab or use the download URL below.
                      </p>
                    </div>
                    <Button asChild className="rounded-2xl bg-[#008751] hover:bg-[#00724a]">
                      <a href={previewUrl} target="_blank" rel="noreferrer">
                        Open File
                      </a>
                    </Button>
                    <div className="max-w-full break-all rounded-xl border bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      {previewUrl}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={Boolean(deleteFileId)}
        onClose={() => setDeleteFileId(null)}
        onConfirm={handleDeleteFile}
        title="Delete File"
        description="This action removes the file from the selected folder."
        itemName={
          deleteFileId ? files.find((file) => file.file_id === deleteFileId)?.name ?? "this file" : "this file"
        }
        isLoading={deleteFileMutation.isPending}
      />
    </div>
  )
}
