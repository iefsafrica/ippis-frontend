"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Filter,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  FileText,
  FileImage,
  File,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommentDialog } from "../components/comment-dialog"
import { useAllDocuments } from "@/services/hooks/employees/usePendingEmployees"

// Define the Document interface to match the API response
interface Document {
  id: number;
  name: string;
  type: string;
  employee_name: string;
  employee_id: string;
  status: string;
  upload_date: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

export default function DocumentsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const { toast } = useToast()
  
  // Use the React Query hook to fetch documents
  const { data: documentsResponse, isLoading, error, refetch } = useAllDocuments()

  // @ts-expect-error axios response mismatch
  const documents: Document[] = documentsResponse?.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    employee_name: doc.employee_name,
    employee_id: doc.employee_id,
    status: doc.status,
    upload_date: doc.upload_date,
  })) || []

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.employee_name && doc.employee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesType = typeFilter === "all" || doc.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Group filtered documents by employee
  const employeeDocuments = filteredDocuments.reduce((acc: Record<string, Document[]>, doc) => {
    const employeeId = doc.employee_id;
    if (!acc[employeeId]) {
      acc[employeeId] = []
    }
    acc[employeeId].push(doc)
    return acc
  }, {})

  // Handle document preview
  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document)
    setShowPreviewDialog(true)
  }

  // Handle opening the approve dialog
  const handleOpenApproveDialog = (document: Document) => {
    setSelectedDocument(document)
    setShowApproveDialog(true)
  }

  // Handle opening the reject dialog
  const handleOpenRejectDialog = (document: Document) => {
    setSelectedDocument(document)
    setShowRejectDialog(true)
  }

  // Handle approving a document with comment
  const handleApproveDocument = async (comment: string) => {
    if (!selectedDocument) return

    try {
      // TODO: Replace with actual API call to update document status
      // await DocumentService.updateDocumentStatus(selectedDocument.id, "verified", comment)
      
      // For now, just refetch the documents
      await refetch()

      toast({
        title: "Success",
        description: `Document "${selectedDocument.name}" has been approved.`,
      })
    } catch (error) {
      console.error("Failed to approve document:", error)
      toast({
        title: "Error",
        description: "Failed to approve document. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Handle rejecting a document with comment
  const handleRejectDocument = async (comment: string) => {
    if (!selectedDocument) return

    try {
      // TODO: Replace with actual API call to update document status
      // await DocumentService.updateDocumentStatus(selectedDocument.id, "rejected", comment)
      
      // For now, just refetch the documents
      await refetch()

      toast({
        title: "Success",
        description: `Document "${selectedDocument.name}" has been rejected.`,
      })
    } catch (error) {
      console.error("Failed to reject document:", error)
      toast({
        title: "Error",
        description: "Failed to reject document. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Handle approving all documents for an employee with comment
  const handleApproveAllForEmployee = async (employeeId: string, employeeName: string) => {
    try {
      // Open a dialog to get comment
      setSelectedDocument({
        id: 0,
        name: "All Documents",
        type: "Other Document",
        employee_name: employeeName,
        employee_id: employeeId,
        status: "pending",
        upload_date: new Date().toISOString(),
      })
      setShowApproveDialog(true)
    } catch (error) {
      console.error("Failed to approve all documents:", error)
      toast({
        title: "Error",
        description: "Failed to approve all documents. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle rejecting all documents for an employee with comment
  const handleRejectAllForEmployee = async (employeeId: string, employeeName: string) => {
    try {
      // Open a dialog to get comment
      setSelectedDocument({
        id: 0,
        name: "All Documents",
        type: "Other Document",
        employee_name: employeeName,
        employee_id: employeeId,
        status: "pending",
        upload_date: new Date().toISOString(),
      })
      setShowRejectDialog(true)
    } catch (error) {
      console.error("Failed to reject all documents:", error)
      toast({
        title: "Error",
        description: "Failed to reject all documents. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle bulk approve with comment
  const handleBulkApproveWithComment = async (comment: string) => {
    if (!selectedDocument) return

    try {
      if (selectedDocument.id) {
        // Single document approval
        await handleApproveDocument(comment)
      } else {
        // TODO: Replace with actual bulk approval API call
        // await DocumentService.verifyAllDocumentsForEmployee(selectedDocument.employee_id, comment)
        
        // For now, just refetch the documents
        await refetch()

        toast({
          title: "Success",
          description: `All pending documents for ${selectedDocument.employee_name || 'this employee'} have been approved.`,
        })
      }
    } catch (error) {
      console.error("Failed to approve documents:", error)
      toast({
        title: "Error",
        description: "Failed to approve documents. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Handle bulk reject with comment
  const handleBulkRejectWithComment = async (comment: string) => {
    if (!selectedDocument) return

    try {
      if (selectedDocument.id) {
        // Single document rejection
        await handleRejectDocument(comment)
      } else {
        // TODO: Replace with actual bulk rejection API call
        // await DocumentService.rejectAllDocumentsForEmployee(selectedDocument.employee_id, comment)
        
        // For now, just refetch the documents
        await refetch()

        toast({
          title: "Success",
          description: `All pending documents for ${selectedDocument.employee_name || 'this employee'} have been rejected.`,
        })
      }
    } catch (error) {
      console.error("Failed to reject documents:", error)
      toast({
        title: "Error",
        description: "Failed to reject documents. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "Appointment Letter":
      case "Promotion Letter":
      case "Educational Certificate":
        return <FileText className="h-4 w-4" />
      case "Profile Image":
      case "Signature":
        return <FileImage className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  // Format employee name - handle empty spaces and undefined
  const formatEmployeeName = (name: string | undefined) => {
    if (!name || name.trim() === "") {
      return "Unknown Employee"
    }
    return name.trim()
  }

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  // Debug: Log the data to see what's happening
  useEffect(() => {
    console.log("Documents Response:", documentsResponse)
    console.log("Processed Documents:", documents)
    console.log("Filtered Documents:", filteredDocuments)
    console.log("Employee Documents:", employeeDocuments)
  }, [documentsResponse, documents, filteredDocuments, employeeDocuments])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage and verify employee documents.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Document Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search documents or employees..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-[180px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[180px]">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      <SelectValue placeholder="Document Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Appointment Letter">Appointment Letter</SelectItem>
                    <SelectItem value="Educational Certificate">Educational Certificate</SelectItem>
                    <SelectItem value="Promotion Letter">Promotion Letter</SelectItem>
                    <SelectItem value="Other Document">Other Document</SelectItem>
                    <SelectItem value="Profile Image">Profile Image</SelectItem>
                    <SelectItem value="Signature">Signature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Loader2 className="h-8 w-8 text-gray-500 animate-spin mr-2" />
              <span>Loading documents...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Failed to load documents. Please try again.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : Object.keys(employeeDocuments).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {documents.length === 0 ? "No documents found." : "No documents match your filters."}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(employeeDocuments).map(([employeeId, docs]) => {
                const employeeName = formatEmployeeName(docs[0]?.employee_name)
                const hasPendingDocs = docs.some((doc) => doc.status === "pending")

                return (
                  <Card key={employeeId} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={`/placeholder-graphic.png?height=36&width=36`} alt={employeeName} />
                            <AvatarFallback>
                              {employeeName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{employeeName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Employee ID: {employeeId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {docs.length} document{docs.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        {hasPendingDocs && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveAllForEmployee(employeeId, employeeName)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" /> Verify All
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectAllForEmployee(employeeId, employeeName)}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" /> Reject All
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {docs.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getDocumentIcon(doc.type)}
                                  <span className="font-medium">{doc.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{doc.type}</TableCell>
                              <TableCell>{getStatusBadge(doc.status)}</TableCell>
                              <TableCell>{new Date(doc.upload_date).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600"
                                    onClick={() => handlePreviewDocument(doc)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                  {doc.status === "pending" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-600"
                                        onClick={() => handleOpenApproveDialog(doc)}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="sr-only">Approve</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-600"
                                        onClick={() => handleOpenRejectDialog(doc)}
                                      >
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="sr-only">Reject</span>
                                      </Button>
                                    </>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => handlePreviewDocument(doc)}>
                                        View document
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>Download</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {doc.status === "pending" ? (
                                        <>
                                          <DropdownMenuItem
                                            className="text-green-600"
                                            onClick={() => handleOpenApproveDialog(doc)}
                                          >
                                            Approve
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() => handleOpenRejectDialog(doc)}
                                          >
                                            Reject
                                          </DropdownMenuItem>
                                        </>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedDocument(doc)
                                            setShowApproveDialog(true)
                                          }}
                                        >
                                          Change status
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
            <DialogDescription>
              Uploaded on{" "}
              {selectedDocument?.upload_date ? new Date(selectedDocument.upload_date).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="py-4">
              <div className="flex justify-center">
                {selectedDocument?.type === "Profile Image" || selectedDocument?.type === "Signature" ? (
                  <img
                    src={selectedDocument?.fileUrl || `/placeholder.svg?height=300&width=400`}
                    alt={selectedDocument?.name}
                    className="max-h-[400px] object-contain border rounded"
                  />
                ) : (
                  <div className="border rounded p-8 w-full h-[400px] flex flex-col items-center justify-center bg-gray-50">
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">{selectedDocument?.name}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedDocument?.fileType || "application/pdf"} • {formatFileSize(selectedDocument?.fileSize)}
                    </p>
                    <Button className="mt-4">Download Document</Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="details" className="py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Document Name</h4>
                    <p>{selectedDocument?.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Document Type</h4>
                    <p>{selectedDocument?.type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Employee</h4>
                    <p>{formatEmployeeName(selectedDocument?.employee_name)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Employee ID</h4>
                    <p>{selectedDocument?.employee_id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <div>{getStatusBadge(selectedDocument?.status || "")}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Upload Date</h4>
                    <p>
                      {selectedDocument?.upload_date
                        ? new Date(selectedDocument.upload_date).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">File Size</h4>
                    <p>{formatFileSize(selectedDocument?.fileSize)}</p>
                  </div>
                </div>

                {selectedDocument?.status === "pending" && (
                  <div className="flex gap-2 mt-6">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setShowPreviewDialog(false)
                        if (selectedDocument) handleOpenApproveDialog(selectedDocument)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve Document
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowPreviewDialog(false)
                        if (selectedDocument) handleOpenRejectDialog(selectedDocument)
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" /> Reject Document
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <CommentDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onSubmit={handleBulkApproveWithComment}
        title={`Approve ${selectedDocument?.id ? "Document" : "All Documents"}`}
        description={`Are you sure you want to approve ${
          selectedDocument?.id
            ? `"${selectedDocument.name}"`
            : `all pending documents for ${formatEmployeeName(selectedDocument?.employee_name)}`
        }?`}
        type="approve"
        entityName={selectedDocument?.name || ""}
      />

      {/* Reject Dialog */}
      <CommentDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onSubmit={handleBulkRejectWithComment}
        title={`Reject ${selectedDocument?.id ? "Document" : "All Documents"}`}
        description={`Are you sure you want to reject ${
          selectedDocument?.id
            ? `"${selectedDocument.name}"`
            : `all pending documents for ${formatEmployeeName(selectedDocument?.employee_name)}`
        }? Please provide a reason for rejection.`}
        type="reject"
        entityName={selectedDocument?.name || ""}
      />
    </div>
  )
}