"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Eye, FileText, Filter, RefreshCw, Trash2, Upload, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useDeleteFile, useGetFiles, useUploadFile } from "@/services/hooks/file-manager/files"
import { useGetFolders } from "@/services/hooks/file-manager/folders"

type PreviewState = {
  fileId: string | null
  error: boolean
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const formatSize = (value: string | number) => {
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

const getCategory = (fileType: string) => {
  const normalized = fileType.toLowerCase()
  if (normalized.startsWith("image/")) return "Images"
  if (normalized === "application/pdf") return "PDF"
  if (normalized.includes("word") || normalized.includes("doc")) return "Documents"
  if (normalized.includes("sheet") || normalized.includes("excel") || normalized.includes("spreadsheet")) return "Spreadsheets"
  return "Files"
}

export function OfficialDocuments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedFolderId, setSelectedFolderId] = useState<string>("root")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [preview, setPreview] = useState<PreviewState>({ fileId: null, error: false })
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: foldersResponse } = useGetFolders()
  const folders = foldersResponse?.data ?? []

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
      setIsDraggingFile(false)
    }
  }, [isUploadDialogOpen])

  const folderOptions = useMemo(() => [{ folder_id: "root", name: "Root Folder" }, ...folders], [folders])
  const categories = useMemo(
    () => ["All", "PDF", "Images", "Documents", "Spreadsheets", "Files"],
    [],
  )

  const previewFile = files.find((file) => file.file_id === preview.fileId) ?? null
  const previewUrl = previewFile?.file_url ? encodeURI(previewFile.file_url) : ""
  const latestFile = [...files].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]
  const categoryCounts = {
    PDF: files.filter((file) => getCategory(file.file_type) === "PDF").length,
    Images: files.filter((file) => getCategory(file.file_type) === "Images").length,
    Documents: files.filter((file) => getCategory(file.file_type) === "Documents").length,
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.file_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.file_type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "All" || getCategory(file.file_type) === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Choose a file before uploading.")
      return
    }

    try {
      await uploadFileMutation.mutateAsync({
        file: selectedFile,
        folder_id: selectedFolderId === "root" ? null : selectedFolderId,
      })
      toast.success("Document uploaded successfully")
      setSelectedFile(null)
      setIsUploadDialogOpen(false)
      await refetchFiles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload document.")
    }
  }

  const handleDelete = async () => {
    if (!deleteFileId) return
    try {
      await deleteFileMutation.mutateAsync(deleteFileId)
      toast.success("Document deleted successfully")
      setDeleteFileId(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete document.")
    }
  }

  const handleFilePick = (file: File | null) => {
    setSelectedFile(file)
    setIsDraggingFile(false)
  }

  const triggerFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Official documents module
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Official Documents</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Browse, preview, upload, and delete live files from the file-manager API.
              </p>
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
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-2xl bg-[#008751] hover:bg-[#00724a]">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>Upload Official Document</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="doc-folder">Target Folder</Label>
                    <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                      <SelectTrigger
                        id="doc-folder"
                        className="rounded-2xl border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
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
                    <Label>File</Label>
                    <div
                      className={`rounded-3xl border-2 border-dashed p-5 transition ${
                        isDraggingFile
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDraggingFile(true)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDraggingFile(true)
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDraggingFile(false)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDraggingFile(false)
                        handleFilePick(e.dataTransfer.files?.[0] ?? null)
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        id="doc-file"
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
                      />

                      <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                          <Upload className="h-7 w-7 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-900">Drop your file here</p>
                          <p className="text-sm text-slate-500">
                            Drag and drop a document, or browse from your device.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-2xl border-slate-200 bg-white text-slate-700"
                            onClick={triggerFilePicker}
                          >
                            Browse Files
                          </Button>
                          <span className="text-xs text-slate-400">PDF, images, and documents supported</span>
                        </div>
                      </div>
                    </div>

                    {selectedFile ? (
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{selectedFile.name}</p>
                          <p className="text-xs text-slate-500">
                            {selectedFile.type || "application/octet-stream"} · {formatSize(selectedFile.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          onClick={() => {
                            handleFilePick(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ""
                            }
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#008751] hover:bg-[#00724a]" onClick={handleUpload} disabled={uploadFileMutation.isPending}>
                    {uploadFileMutation.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Documents</CardDescription>
            <CardTitle className="text-3xl">{files.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">All files returned by the file-manager endpoint.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Current Folder</CardDescription>
            <CardTitle className="text-3xl">{selectedFolderId === "root" ? "Root" : "Folder"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {selectedFolderId === "root"
                ? "Browsing root folder files."
                : folderOptions.find((folder) => folder.folder_id === selectedFolderId)?.name ?? selectedFolderId}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Latest Upload</CardDescription>
            <CardTitle className="text-3xl">{latestFile ? "1" : "0"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {latestFile ? `${latestFile.name} - ${formatDate(latestFile.created_at)}` : "No documents available."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>PDF Documents</CardDescription>
            <CardTitle className="text-3xl">{categoryCounts.PDF}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">PDF files in the current file view.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Images</CardDescription>
            <CardTitle className="text-3xl">{categoryCounts.Images}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Image files available for inline preview.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Other Docs</CardDescription>
            <CardTitle className="text-3xl">{categoryCounts.Documents}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Word and related document formats.</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.26)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Document browser</h2>
              <p className="text-sm text-slate-500">Preview documents with the eye icon, directly in a modal.</p>
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
              <Button variant="outline" className="rounded-2xl border-slate-200 bg-white text-slate-700" onClick={() => refetchFiles()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {isFilesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              We had trouble fetching documents.
              <Button variant="outline" onClick={() => refetchFiles()} className="ml-3 rounded-xl border-red-200 bg-white">
                Retry
              </Button>
            </div>
          ) : null}

          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Filter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full rounded-2xl border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 md:w-[220px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>File ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFilesLoading || isFilesFetching ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`doc-loading-${index}`}>
                      <TableCell colSpan={7}>
                        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No documents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFiles.map((file) => (
                    <TableRow key={file.file_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{file.file_id}</TableCell>
                      <TableCell>{getCategory(file.file_type)}</TableCell>
                      <TableCell>{file.file_type}</TableCell>
                      <TableCell>{formatSize(file.file_size)}</TableCell>
                      <TableCell>{formatDate(file.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-50" onClick={() => setPreview({ fileId: file.file_id, error: false })}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => setDeleteFileId(file.file_id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
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
      </div>

      <Dialog
        open={Boolean(previewFile)}
        onOpenChange={(open) => {
          if (!open) {
            setPreview({ fileId: null, error: false })
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
                  <div className="font-medium">{formatSize(previewFile.file_size)}</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border bg-white">
                {previewFile.file_type?.startsWith("image/") ? (
                  !preview.error ? (
                    <img
                      src={previewUrl}
                      alt={previewFile.name}
                      className="max-h-[60vh] w-full object-contain"
                      onError={() => setPreview((current) => ({ ...current, error: true }))}
                    />
                  ) : (
                    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center">
                      <FileText className="h-10 w-10 text-slate-400" />
                      <p className="text-sm text-slate-500">The image could not be loaded directly.</p>
                      <Button asChild className="rounded-2xl bg-[#008751] hover:bg-[#00724a]">
                        <a href={previewUrl} target="_blank" rel="noreferrer">
                          Open Image
                        </a>
                      </Button>
                    </div>
                  )
                ) : previewFile.file_type === "application/pdf" ? (
                  <iframe src={previewUrl} title={previewFile.name} className="h-[70vh] w-full" />
                ) : (
                  <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
                    <FileText className="h-10 w-10 text-slate-400" />
                    <div className="max-w-md space-y-2">
                      <p className="font-medium text-slate-900">Preview not available for this file type.</p>
                      <p className="text-sm text-slate-500">You can still open the file directly in a new tab.</p>
                    </div>
                    <Button asChild className="rounded-2xl bg-[#008751] hover:bg-[#00724a]">
                      <a href={previewUrl} target="_blank" rel="noreferrer">
                        Open File
                      </a>
                    </Button>
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
        onConfirm={handleDelete}
        title="Delete Document"
        description="This action removes the document from the file manager."
        itemName={deleteFileId ? files.find((file) => file.file_id === deleteFileId)?.name ?? "this document" : "this document"}
        isLoading={deleteFileMutation.isPending}
      />
    </div>
  )
}
