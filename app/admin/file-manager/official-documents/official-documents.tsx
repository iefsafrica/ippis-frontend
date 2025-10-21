"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Printer,
  FileOutput,
  FileSpreadsheet,
  FilePlus2,
  FileCheck,
  FileWarning,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

// Mock data for official documents
const mockDocuments = [
  {
    id: "1",
    name: "Employee Handbook v2.3.pdf",
    category: "HR Policies",
    status: "Published",
    version: "2.3",
    publishDate: "2023-05-15",
    expiryDate: "2024-05-15",
    author: "HR Director",
    approvedBy: "CEO",
    size: "3.2 MB",
    icon: <FileText className="h-5 w-5 text-red-500" />,
  },
  {
    id: "2",
    name: "Code of Conduct.pdf",
    category: "HR Policies",
    status: "Published",
    version: "1.5",
    publishDate: "2023-04-10",
    expiryDate: "2024-04-10",
    author: "Legal Department",
    approvedBy: "Board",
    size: "1.8 MB",
    icon: <FileText className="h-5 w-5 text-red-500" />,
  },
  {
    id: "3",
    name: "IT Security Policy.docx",
    category: "IT Policies",
    status: "Draft",
    version: "2.0",
    publishDate: "N/A",
    expiryDate: "N/A",
    author: "IT Manager",
    approvedBy: "Pending",
    size: "2.1 MB",
    icon: <FileText className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "4",
    name: "Financial Procedures Manual.pdf",
    category: "Finance",
    status: "Published",
    version: "3.1",
    publishDate: "2023-03-22",
    expiryDate: "2024-03-22",
    author: "Finance Director",
    approvedBy: "CFO",
    size: "4.5 MB",
    icon: <FileText className="h-5 w-5 text-red-500" />,
  },
  {
    id: "5",
    name: "Health and Safety Guidelines.pdf",
    category: "Health & Safety",
    status: "Published",
    version: "2.2",
    publishDate: "2023-02-15",
    expiryDate: "2024-02-15",
    author: "H&S Officer",
    approvedBy: "COO",
    size: "3.7 MB",
    icon: <FileText className="h-5 w-5 text-red-500" />,
  },
  {
    id: "6",
    name: "Travel and Expenses Policy.docx",
    category: "Finance",
    status: "Under Review",
    version: "1.8",
    publishDate: "2022-11-30",
    expiryDate: "2023-11-30",
    author: "Finance Manager",
    approvedBy: "CFO",
    size: "1.9 MB",
    icon: <FileText className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "7",
    name: "Procurement Procedures.pdf",
    category: "Finance",
    status: "Published",
    version: "2.0",
    publishDate: "2023-01-20",
    expiryDate: "2024-01-20",
    author: "Procurement Manager",
    approvedBy: "CFO",
    size: "2.8 MB",
    icon: <FileText className="h-5 w-5 text-red-500" />,
  },
  {
    id: "8",
    name: "Data Protection Policy.pdf",
    category: "Legal",
    status: "Published",
    version: "1.3",
    publishDate: "2023-04-05",
    expiryDate: "2024-04-05",
    author: "Data Protection Officer",
    approvedBy: "Board",
    size: "2.2 MB",
    icon: <FileText className="h-5 w-5 text-red-500" />,
  },
]

// Document categories
const documentCategories = ["All", "HR Policies", "IT Policies", "Finance", "Health & Safety", "Legal", "Operations"]

export function OfficialDocuments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isNewDocumentDialogOpen, setIsNewDocumentDialogOpen] = useState(false)

  // Filter documents based on search term and selected category
  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Published</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>
      case "Under Review":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Under Review</Badge>
      case "Expired":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Official Documents</h1>
          <p className="text-muted-foreground">Manage and organize all official organizational documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#008751] hover:bg-[#00724a]">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Official Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Drag and drop document here, or click to browse</p>
                  <Input type="file" className="hidden" id="document-upload" onChange={() => {}} />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("document-upload")?.click()}
                    className="mt-4"
                  >
                    Browse Files
                  </Button>
                </div>
                <div>
                  <Label htmlFor="doc-category">Document Category</Label>
                  <Select defaultValue="HR Policies">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.slice(1).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doc-version">Version</Label>
                  <Input id="doc-version" placeholder="e.g. 1.0" />
                </div>
                <div>
                  <Label htmlFor="doc-expiry">Expiry Date</Label>
                  <Input id="doc-expiry" type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#008751] hover:bg-[#00724a]">Upload</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewDocumentDialogOpen} onOpenChange={setIsNewDocumentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FilePlus2 className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="doc-name">Document Name</Label>
                  <Input id="doc-name" placeholder="Enter document name" />
                </div>
                <div>
                  <Label htmlFor="doc-category">Category</Label>
                  <Select defaultValue="HR Policies">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.slice(1).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doc-status">Status</Label>
                  <Select defaultValue="Draft">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doc-version">Version</Label>
                  <Input id="doc-version" placeholder="e.g. 1.0" />
                </div>
                <div>
                  <Label htmlFor="doc-description">Description</Label>
                  <Textarea id="doc-description" placeholder="Enter document description" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewDocumentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#008751] hover:bg-[#00724a]">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Document Browser */}
      <div className="mt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="mb-4 flex flex-wrap h-auto">
              {documentCategories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Filter by Status</DropdownMenuItem>
                <DropdownMenuItem>Filter by Date</DropdownMenuItem>
                <DropdownMenuItem>Filter by Author</DropdownMenuItem>
                <DropdownMenuItem>Filter by Version</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileOutput className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox />
                </TableHead>
                <TableHead>Document Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No documents found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {doc.icon}
                        <span>{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>{doc.publishDate}</TableCell>
                    <TableCell>{doc.expiryDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileCheck className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileWarning className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
      </div>
    </div>
  )
}
