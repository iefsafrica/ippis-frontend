"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  FolderPlus,
  Upload,
  Download,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  FileUp,
  FilePlus2,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  FilePieChart,
  Printer,
  FileOutput,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data for file manager
const mockFiles = [
  {
    id: "1",
    name: "Employee Handbook.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: "2023-05-12",
    owner: "HR Department",
    shared: true,
    category: "Documents",
    icon: <FileText className="h-5 w-5 text-red-500" />,
  },
  {
    id: "2",
    name: "Quarterly Report Q1.xlsx",
    type: "xlsx",
    size: "1.8 MB",
    modified: "2023-05-10",
    owner: "Finance Team",
    shared: true,
    category: "Spreadsheets",
    icon: <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  },
  {
    id: "3",
    name: "Company Logo.png",
    type: "png",
    size: "0.5 MB",
    modified: "2023-05-08",
    owner: "Marketing",
    shared: false,
    category: "Images",
    icon: <FileImage className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "4",
    name: "Training Videos.zip",
    type: "zip",
    size: "156 MB",
    modified: "2023-05-05",
    owner: "Training Dept",
    shared: true,
    category: "Archives",
    icon: <FileArchive className="h-5 w-5 text-yellow-500" />,
  },
  {
    id: "5",
    name: "Annual Budget.xlsx",
    type: "xlsx",
    size: "3.2 MB",
    modified: "2023-05-01",
    owner: "Finance Team",
    shared: false,
    category: "Spreadsheets",
    icon: <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  },
  {
    id: "6",
    name: "Onboarding Presentation.pptx",
    type: "pptx",
    size: "8.7 MB",
    modified: "2023-04-28",
    owner: "HR Department",
    shared: true,
    category: "Presentations",
    icon: <FilePieChart className="h-5 w-5 text-orange-500" />,
  },
  {
    id: "7",
    name: "Website Backup.zip",
    type: "zip",
    size: "245 MB",
    modified: "2023-04-25",
    owner: "IT Department",
    shared: false,
    category: "Archives",
    icon: <FileArchive className="h-5 w-5 text-yellow-500" />,
  },
  {
    id: "8",
    name: "Company Policies.docx",
    type: "docx",
    size: "1.2 MB",
    modified: "2023-04-20",
    owner: "Legal Team",
    shared: true,
    category: "Documents",
    icon: <FileText className="h-5 w-5 text-blue-500" />,
  },
]

// Mock data for storage usage
const storageData = {
  total: 1000, // GB
  used: 427, // GB
  categories: [
    { name: "Documents", size: 120, color: "bg-blue-500" },
    { name: "Images", size: 85, color: "bg-green-500" },
    { name: "Videos", size: 150, color: "bg-red-500" },
    { name: "Archives", size: 72, color: "bg-yellow-500" },
  ],
}

export function FileManagerDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false)

  // Filter files based on search term and selected tab
  const filteredFiles = mockFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = selectedTab === "all" || file.category.toLowerCase() === selectedTab.toLowerCase()
    return matchesSearch && matchesTab
  })

  // Calculate storage usage percentage
  const storageUsagePercentage = (storageData.used / storageData.total) * 100

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">File Manager</h1>
          <p className="text-muted-foreground">Manage and organize all your files in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#008751] hover:bg-[#00724a]">
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or click to browse</p>
                  <Input type="file" multiple className="hidden" id="file-upload" onChange={() => {}} />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="mt-4"
                  >
                    Browse Files
                  </Button>
                </div>
                <div>
                  <Label htmlFor="folder">Upload to folder</Label>
                  <Select defaultValue="root">
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root Directory</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="images">Images</SelectItem>
                      <SelectItem value="videos">Videos</SelectItem>
                    </SelectContent>
                  </Select>
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

          <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input id="folder-name" placeholder="Enter folder name" />
                </div>
                <div>
                  <Label htmlFor="parent-folder">Parent Folder</Label>
                  <Select defaultValue="root">
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root Directory</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="images">Images</SelectItem>
                      <SelectItem value="videos">Videos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#008751] hover:bg-[#00724a]">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Storage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Storage Usage</CardTitle>
            <CardDescription>
              {storageData.used} GB of {storageData.total} GB used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#008751]" style={{ width: `${storageUsagePercentage}%` }}></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {(storageData.total - storageData.used).toFixed(1)} GB available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Storage by Category</CardTitle>
            <CardDescription>Breakdown of storage usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {storageData.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${category.color} mr-2`}></div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium">{category.size} GB</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common file operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start" onClick={() => setIsUploadDialogOpen(true)}>
                <FileUp className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => setIsNewFolderDialogOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
              <Button variant="outline" className="justify-start">
                <FilePlus2 className="mr-2 h-4 w-4" />
                New File
              </Button>
              <Button variant="outline" className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Browser */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Files & Folders</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
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
                <DropdownMenuItem>Filter by Type</DropdownMenuItem>
                <DropdownMenuItem>Filter by Date</DropdownMenuItem>
                <DropdownMenuItem>Filter by Size</DropdownMenuItem>
                <DropdownMenuItem>Filter by Owner</DropdownMenuItem>
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

        <Tabs defaultValue="all" onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="Documents">Documents</TabsTrigger>
            <TabsTrigger value="Images">Images</TabsTrigger>
            <TabsTrigger value="Spreadsheets">Spreadsheets</TabsTrigger>
            <TabsTrigger value="Archives">Archives</TabsTrigger>
            <TabsTrigger value="Presentations">Presentations</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-0">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Shared</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No files found. Try adjusting your search or filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {file.icon}
                            <span>{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{file.size}</TableCell>
                        <TableCell>{file.modified}</TableCell>
                        <TableCell>{file.owner}</TableCell>
                        <TableCell>
                          {file.shared ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Shared
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Private
                            </Badge>
                          )}
                        </TableCell>
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
                                Rename
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
