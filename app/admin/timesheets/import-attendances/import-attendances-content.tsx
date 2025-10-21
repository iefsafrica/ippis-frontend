"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileUp,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
  Printer,
  FileSpreadsheet,
  FileIcon as FilePdf,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ImportAttendancesContent() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("upload")

  // Mock data for preview
  const mockPreviewData = [
    {
      employeeId: "EMP001",
      name: "John Doe",
      department: "IT",
      date: "2023-05-08",
      clockIn: "08:30 AM",
      clockOut: "05:15 PM",
      status: "Present",
      valid: true,
    },
    {
      employeeId: "EMP002",
      name: "Jane Smith",
      department: "HR",
      date: "2023-05-08",
      clockIn: "09:05 AM",
      clockOut: "06:00 PM",
      status: "Late",
      valid: true,
    },
    {
      employeeId: "EMP003",
      name: "Robert Johnson",
      department: "Finance",
      date: "2023-05-08",
      clockIn: "08:00 AM",
      clockOut: "04:30 PM",
      status: "Present",
      valid: true,
    },
    {
      employeeId: "EMP004",
      name: "Emily Davis",
      department: "Marketing",
      date: "2023-05-08",
      clockIn: "",
      clockOut: "",
      status: "Absent",
      valid: true,
    },
    {
      employeeId: "INVALID",
      name: "Invalid Employee",
      department: "Unknown",
      date: "2023-05-08",
      clockIn: "08:45 AM",
      clockOut: "05:30 PM",
      status: "Present",
      valid: false,
      error: "Employee ID not found",
    },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setValidationErrors([])
      setUploadComplete(false)
    }
  }

  const handleUpload = () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)
      setIsUploading(false)
      setUploadComplete(true)

      // Simulate validation
      setPreviewData(mockPreviewData)

      // Check for validation errors
      const errors = mockPreviewData.filter((item) => !item.valid).map((item) => `Row for ${item.name}: ${item.error}`)

      setValidationErrors(errors)

      // Switch to preview tab if successful
      if (errors.length === 0) {
        setActiveTab("preview")
      }
    }, 3000)
  }

  const handleDownloadTemplate = () => {
    console.log("Downloading template...")
    // Implement template download logic
  }

  const handleImport = () => {
    console.log("Importing data...")
    // Implement import logic

    // Simulate success
    setTimeout(() => {
      setActiveTab("success")
    }, 1500)
  }

  const handleExportCSV = () => {
    console.log("Exporting to CSV...")
    // Implement CSV export logic
  }

  const handleExportPDF = () => {
    console.log("Exporting to PDF...")
    // Implement PDF export logic
  }

  const handlePrint = () => {
    console.log("Printing...")
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Import Attendances</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>

          {uploadComplete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FilePdf className="mr-2 h-4 w-4" />
                  Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="preview" disabled={!uploadComplete || validationErrors.length > 0}>
            Preview Data
          </TabsTrigger>
          <TabsTrigger
            value="success"
            disabled={!uploadComplete || validationErrors.length > 0 || activeTab !== "preview"}
          >
            Import Complete
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Attendance Data</CardTitle>
              <CardDescription>Upload a CSV or Excel file containing attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Drag and drop your file here, or click to browse</p>
                    <Input
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      className="mt-4"
                      onChange={handleFileChange}
                    />
                  </div>
                  {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Errors</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 mt-2">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {uploadComplete && validationErrors.length === 0 && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>File Validated Successfully</AlertTitle>
                    <AlertDescription>
                      Your file has been uploaded and validated. Click "Preview Data" to review before importing.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" disabled={isUploading}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={isUploading ? "opacity-80" : ""}
              >
                {isUploading ? "Uploading..." : "Upload & Validate"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview Data</CardTitle>
              <CardDescription>
                Review the data before importing. Records with errors will not be imported.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Validation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((item, index) => (
                      <TableRow key={index} className={!item.valid ? "bg-red-50" : ""}>
                        <TableCell>{item.employeeId}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.clockIn || "--"}</TableCell>
                        <TableCell>{item.clockOut || "--"}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>
                          {item.valid ? (
                            <Badge className="bg-green-100 text-green-800">Valid</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Error</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  Total Records: {previewData.length}, Valid: {previewData.filter((item) => item.valid).length},
                  Invalid: {previewData.filter((item) => !item.valid).length}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTab("upload")}>
                Back
              </Button>
              <Button onClick={handleImport}>Import Data</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="success">
          <Card>
            <CardHeader>
              <CardTitle>Import Successful</CardTitle>
              <CardDescription>Your attendance data has been successfully imported.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-10">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Import Complete</h3>
              <p className="mt-2 text-center text-gray-500">
                {previewData.filter((item) => item.valid).length} records have been successfully imported into the
                system.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => (window.location.href = "/admin/timesheets/attendances")}>
                View Attendance Records
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
