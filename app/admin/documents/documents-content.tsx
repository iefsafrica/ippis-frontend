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
  MoreVertical,
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
  Info,
  Download,
  User,
  IdCard,
  Calendar,
  FileCheck,
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
import { useDocuments } from "@/services/hooks/employees/usePendingEmployees"

// Define the Document interface to match the API response
interface DocumentByEmployee {
  registrationId: string;
  name: string;
  documents: {
    appointmentLetter: string | null;
    educationalCertificates: string | null;
    profileImage: string | null;
    signature: string | null;
  };
  status: string | null;
  uploadedAt: string | null;
}

export default function DocumentsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentByEmployee | null>(null)
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const { toast } = useToast()
  
  const { data: documentsResponse, isLoading, error, refetch } = useDocuments()

 //@ts-expect-error
  const documents: DocumentByEmployee[] = documentsResponse || []

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.registrationId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    
    // Check if the document has the filtered type
    const matchesType = typeFilter === "all" || 
      (typeFilter === "appointmentLetter" && doc.documents.appointmentLetter) ||
      (typeFilter === "educationalCertificates" && doc.documents.educationalCertificates) ||
      (typeFilter === "profileImage" && doc.documents.profileImage) ||
      (typeFilter === "signature" && doc.documents.signature)
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Handle document preview
  const handlePreviewDocument = (document: DocumentByEmployee, documentType: string) => {
    setSelectedDocument(document)
    setSelectedDocumentType(documentType)
    setShowPreviewDialog(true)
  }

  // Handle viewing document details
  const handleViewDetails = (document: DocumentByEmployee, documentType: string) => {
    setSelectedDocument(document)
    setSelectedDocumentType(documentType)
    setShowDetailsDialog(true)
  }

  // Handle opening the approve dialog
  const handleOpenApproveDialog = (document: DocumentByEmployee, documentType: string = "") => {
    setSelectedDocument(document)
    setSelectedDocumentType(documentType)
    setShowApproveDialog(true)
  }

  // Handle opening the reject dialog
  const handleOpenRejectDialog = (document: DocumentByEmployee, documentType: string = "") => {
    setSelectedDocument(document)
    setSelectedDocumentType(documentType)
    setShowRejectDialog(true)
  }

  // Handle approving a document with comment
  const handleApproveDocument = async (comment: string) => {
    if (!selectedDocument) return

    try {
      // TODO: Replace with actual API call to update document status
      // await DocumentService.updateDocumentStatus(selectedDocument.registrationId, selectedDocumentType, "verified", comment)
      
      // For now, just refetch the documents
      await refetch()

      toast({
        title: "Success",
        description: `Document has been approved.`,
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
      // await DocumentService.updateDocumentStatus(selectedDocument.registrationId, selectedDocumentType, "rejected", comment)
      
      // For now, just refetch the documents
      await refetch()

      toast({
        title: "Success",
        description: `Document has been rejected.`,
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
  const handleApproveAllForEmployee = async (document: DocumentByEmployee) => {
    try {
      setSelectedDocument(document)
      setSelectedDocumentType("")
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
  const handleRejectAllForEmployee = async (document: DocumentByEmployee) => {
    try {
      setSelectedDocument(document)
      setSelectedDocumentType("")
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
      if (selectedDocumentType) {
        // Single document approval
        await handleApproveDocument(comment)
      } else {
        // TODO: Replace with actual bulk approval API call
        // await DocumentService.verifyAllDocumentsForEmployee(selectedDocument.registrationId, comment)
        
        // For now, just refetch the documents
        await refetch()

        toast({
          title: "Success",
          description: `All pending documents for ${selectedDocument.name} have been approved.`,
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
      if (selectedDocumentType) {
        // Single document rejection
        await handleRejectDocument(comment)
      } else {
        // TODO: Replace with actual bulk rejection API call
        // await DocumentService.rejectAllDocumentsForEmployee(selectedDocument.registrationId, comment)
        
        // For now, just refetch the documents
        await refetch()

        toast({
          title: "Success",
          description: `All pending documents for ${selectedDocument.name} have been rejected.`,
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
      case "appointmentLetter":
        return <FileText className="h-4 w-4" />
      case "educationalCertificates":
        return <FileText className="h-4 w-4" />
      case "profileImage":
        return <FileImage className="h-4 w-4" />
      case "signature":
        return <FileImage className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case "appointmentLetter":
        return "Appointment Letter"
      case "educationalCertificates":
        return "Educational Certificates"
      case "profileImage":
        return "Profile Image"
      case "signature":
        return "Signature"
      default:
        return type
    }
  }

  const getStatusBadge = (status: string | null) => {
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
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Clock className="h-3 w-3 mr-1" /> Not Uploaded
          </Badge>
        )
    }
  }

  // Format employee name - handle empty spaces and undefined
  const formatEmployeeName = (name: string | undefined) => {
    if (!name || name.trim() === "") {
      return "Unknown Employee"
    }
    return name.trim()
  }

  // Get document URL for a specific type
  const getDocumentUrl = (document: DocumentByEmployee, type: string) => {
    switch (type) {
      case "appointmentLetter":
        return document.documents.appointmentLetter
      case "educationalCertificates":
        return document.documents.educationalCertificates
      case "profileImage":
        return document.documents.profileImage
      case "signature":
        return document.documents.signature
      default:
        return null
    }
  }

  // Check if employee has any pending documents
  const hasPendingDocuments = (document: DocumentByEmployee) => {
    return document.status === "pending" || 
           Object.values(document.documents).some(doc => doc !== null)
  }

  // Get the count of uploaded documents for an employee
  const getUploadedDocumentCount = (document: DocumentByEmployee) => {
    return Object.values(document.documents).filter(doc => doc !== null).length
  }

  // Debug: Log the data to see what's happening
  useEffect(() => {
    console.log("Documents Response:", documentsResponse)
    console.log("Processed Documents:", documents)
    console.log("Filtered Documents:", filteredDocuments)
  }, [documentsResponse, documents, filteredDocuments])

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
                    <SelectItem value="appointmentLetter">Appointment Letter</SelectItem>
                    <SelectItem value="educationalCertificates">Educational Certificates</SelectItem>
                    <SelectItem value="profileImage">Profile Image</SelectItem>
                    <SelectItem value="signature">Signature</SelectItem>
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
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {documents.length === 0 ? "No documents found." : "No documents match your filters."}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredDocuments.map((document) => {
                const employeeName = formatEmployeeName(document.name)
                const hasPendingDocs = hasPendingDocuments(document)
                const uploadedCount = getUploadedDocumentCount(document)

                return (
                  <Card key={document.registrationId} className="overflow-hidden">
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
                              Registration ID: {document.registrationId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {uploadedCount} document{uploadedCount !== 1 ? "s" : ""} uploaded • Status: {getStatusBadge(document.status)}
                            </p>
                          </div>
                        </div>
                        {hasPendingDocs && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveAllForEmployee(document)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" /> Verify All
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectAllForEmployee(document)}
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
                            <TableHead>Document Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(document.documents).map(([type, url]) => (
                            <TableRow key={type}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getDocumentIcon(type)}
                                  <span className="font-medium">{getDocumentTypeName(type)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {url ? (
                                  getStatusBadge(document.status)
                                ) : (
                                  <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                    Not Uploaded
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : "Not uploaded"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  {url && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-600"
                                        onClick={() => handlePreviewDocument(document, type)}
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View</span>
                                      </Button>
                                      {document.status === "pending" && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-green-600"
                                            onClick={() => handleOpenApproveDialog(document, type)}
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="sr-only">Approve</span>
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600"
                                            onClick={() => handleOpenRejectDialog(document, type)}
                                          >
                                            <AlertTriangle className="h-4 w-4" />
                                            <span className="sr-only">Reject</span>
                                          </Button>
                                        </>
                                      )}
                                    </>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      {url ? (
                                        <>
                                          <DropdownMenuItem 
                                            onClick={() => handlePreviewDocument(document, type)}
                                            className="cursor-pointer"
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Preview Document
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleViewDetails(document, type)}
                                            className="cursor-pointer"
                                          >
                                            <Info className="h-4 w-4 mr-2" />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="cursor-pointer">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          {document.status === "pending" && (
                                            <>
                                              <DropdownMenuItem
                                                className="text-green-600 cursor-pointer"
                                                onClick={() => handleOpenApproveDialog(document, type)}
                                              >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                className="text-red-600 cursor-pointer"
                                                onClick={() => handleOpenRejectDialog(document, type)}
                                              >
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Reject
                                              </DropdownMenuItem>
                                            </>
                                          )}
                                        </>
                                      ) : (
                                        <DropdownMenuItem disabled className="cursor-not-allowed">
                                          <File className="h-4 w-4 mr-2" />
                                          Document not uploaded
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
            <DialogTitle>
              {selectedDocument && selectedDocumentType && getDocumentTypeName(selectedDocumentType)}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument && `Employee: ${formatEmployeeName(selectedDocument.name)}`}
              {selectedDocument?.uploadedAt && ` • Uploaded on ${new Date(selectedDocument.uploadedAt).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="py-4">
              <div className="flex justify-center">
                {selectedDocument && selectedDocumentType && (
                  (selectedDocumentType === "profileImage" || selectedDocumentType === "signature") ? (
                    <img
                      src={getDocumentUrl(selectedDocument, selectedDocumentType) || `/placeholder.svg?height=300&width=400`}
                      alt={getDocumentTypeName(selectedDocumentType)}
                      className="max-h-[400px] object-contain border rounded"
                    />
                  ) : (
                    <div className="border rounded p-8 w-full h-[400px] flex flex-col items-center justify-center bg-gray-50">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">{getDocumentTypeName(selectedDocumentType)}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Document preview not available
                      </p>
                      <Button className="mt-4">Download Document</Button>
                    </div>
                  )
                )}
              </div>
            </TabsContent>
            <TabsContent value="details" className="py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Document Type</h4>
                    <p>{selectedDocumentType && getDocumentTypeName(selectedDocumentType)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Employee</h4>
                    <p>{selectedDocument && formatEmployeeName(selectedDocument.name)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Registration ID</h4>
                    <p>{selectedDocument?.registrationId}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <div>{getStatusBadge(selectedDocument?.status || null)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Upload Date</h4>
                    <p>
                      {selectedDocument?.uploadedAt
                        ? new Date(selectedDocument.uploadedAt).toLocaleDateString()
                        : "Not uploaded"}
                    </p>
                  </div>
                </div>

                {selectedDocument?.status === "pending" && selectedDocumentType && getDocumentUrl(selectedDocument, selectedDocumentType) && (
                  <div className="flex gap-2 mt-6">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setShowPreviewDialog(false)
                        if (selectedDocument && selectedDocumentType) handleOpenApproveDialog(selectedDocument, selectedDocumentType)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve Document
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowPreviewDialog(false)
                        if (selectedDocument && selectedDocumentType) handleOpenRejectDialog(selectedDocument, selectedDocumentType)
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

      {/* Document Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Document Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about {selectedDocumentType && getDocumentTypeName(selectedDocumentType)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Document Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Document Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Document Type</p>
                      <p>{selectedDocumentType && getDocumentTypeName(selectedDocumentType)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Employee Name</p>
                      <p>{selectedDocument && formatEmployeeName(selectedDocument.name)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration ID</p>
                      <p>{selectedDocument?.registrationId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Upload Date</p>
                      <p>
                        {selectedDocument?.uploadedAt
                          ? new Date(selectedDocument.uploadedAt).toLocaleDateString()
                          : "Not uploaded"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Verification Status</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedDocument?.status || null)}
                  <div>
                    <p className="text-sm font-medium">
                      {selectedDocument?.status === "verified" && "Document has been verified"}
                      {selectedDocument?.status === "pending" && "Awaiting verification"}
                      {selectedDocument?.status === "rejected" && "Document was rejected"}
                      {!selectedDocument?.status && "Document not uploaded"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedDocument?.status === "pending" && "Pending review by administrator"}
                      {selectedDocument?.status === "verified" && "Approved and verified"}
                      {selectedDocument?.status === "rejected" && "Requires correction and resubmission"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Availability */}
            {selectedDocumentType && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Document Availability</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDocumentUrl(selectedDocument!, selectedDocumentType) ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Document is available</p>
                            <p className="text-sm text-gray-500">Ready for preview and download</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="font-medium">Document not uploaded</p>
                            <p className="text-sm text-gray-500">Employee needs to upload this document</p>
                          </div>
                        </>
                      )}
                    </div>
                    {getDocumentUrl(selectedDocument!, selectedDocumentType) && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedDocument?.status === "pending" && selectedDocumentType && getDocumentUrl(selectedDocument, selectedDocumentType) && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  onClick={() => {
                    setShowDetailsDialog(false)
                    if (selectedDocument && selectedDocumentType) handleOpenApproveDialog(selectedDocument, selectedDocumentType)
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve Document
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailsDialog(false)
                    if (selectedDocument && selectedDocumentType) handlePreviewDocument(selectedDocument, selectedDocumentType)
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailsDialog(false)
                    if (selectedDocument && selectedDocumentType) handleOpenRejectDialog(selectedDocument, selectedDocumentType)
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" /> Reject
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
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
        title={`Approve ${selectedDocumentType ? "Document" : "All Documents"}`}
        description={`Are you sure you want to approve ${
          selectedDocumentType
            ? `"${selectedDocumentType && getDocumentTypeName(selectedDocumentType)}"`
            : `all pending documents for ${selectedDocument && formatEmployeeName(selectedDocument.name)}`
        }?`}
        type="approve"
        entityName={selectedDocumentType ? getDocumentTypeName(selectedDocumentType) : (selectedDocument?.name || "")}
      />

      {/* Reject Dialog */}
      <CommentDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onSubmit={handleBulkRejectWithComment}
        title={`Reject ${selectedDocumentType ? "Document" : "All Documents"}`}
        description={`Are you sure you want to reject ${
          selectedDocumentType
            ? `"${selectedDocumentType && getDocumentTypeName(selectedDocumentType)}"`
            : `all pending documents for ${selectedDocument && formatEmployeeName(selectedDocument.name)}`
        }? Please provide a reason for rejection.`}
        type="reject"
        entityName={selectedDocumentType ? getDocumentTypeName(selectedDocumentType) : (selectedDocument?.name || "")}
      />
    </div>
  )
}