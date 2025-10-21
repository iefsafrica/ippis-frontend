"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, AlertCircle, CheckCircle, Download, Info, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function ImportContent() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [validationResults, setValidationResults] = useState<{
    valid: boolean
    errors: string[]
    warnings: string[]
    totalRecords: number
    validRecords: number
  } | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadStatus("idle")
      setValidationResults(null)
      setImportComplete(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate file upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 200)

    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("validate", "true") // Only validate, don't import yet

      // Send the file to the API
      const response = await fetch("/api/admin/import/validate", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to validate file")
      }

      // Set validation results
      setValidationResults({
        valid: result.success,
        errors: result.errors || [],
        warnings: result.warnings || [],
        totalRecords: result.totalRecords || 0,
        validRecords: result.validRecords || 0,
      })

      setUploadStatus(result.success ? "success" : "error")
    } catch (error) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      setUploadStatus("error")

      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)

    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("validate", "false") // Actually import, not just validate

      console.log("Starting import process...")

      // Send the file to the API
      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      })

      console.log("Import API response status:", response.status)

      const result = await response.json()
      console.log("Import result:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to import file")
      }

      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.data?.importedRecords || 0} employees.`,
          variant: "default",
        })

        setImportComplete(true)
        setFile(null)
        setValidationResults(null)

        // Navigate to pending employees page after successful import
        setTimeout(() => {
          router.push("/admin/pending")
          router.refresh() // Force refresh the page data
        }, 1500)
      } else {
        toast({
          title: "Import Failed",
          description: result.message || "Failed to import employees",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Import error:", error)

      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClearData = async () => {
    try {
      setIsClearing(true)

      const response = await fetch("/api/admin/pending/clear", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "All pending employees have been cleared",
          variant: "default",
        })
      } else {
        throw new Error(data.error || "Failed to clear pending employees")
      }
    } catch (error) {
      console.error("Failed to clear data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  // Group template fields by registration form steps
  const templateFields = {
    verification: [
      { name: "BVN", required: true, description: "Bank Verification Number" },
      { name: "NIN", required: true, description: "National Identification Number" },
    ],
    personalInfo: [
      { name: "Title", required: true, description: "Mr/Mrs/Ms/Dr" },
      { name: "Surname", required: true, description: "Last name" },
      { name: "FirstName", required: true, description: "First name" },
      { name: "OtherNames", required: false, description: "Middle or other names" },
      { name: "PhoneNumber", required: true, description: "Mobile phone number" },
      { name: "Email", required: true, description: "Email address" },
      { name: "DateOfBirth", required: true, description: "YYYY-MM-DD format" },
      { name: "Sex", required: true, description: "Male/Female" },
      { name: "MaritalStatus", required: true, description: "Single/Married/Divorced/Widowed" },
      { name: "StateOfOrigin", required: true, description: "State of origin" },
      { name: "LGA", required: true, description: "Local Government Area" },
      { name: "StateOfResidence", required: true, description: "Current state of residence" },
      { name: "AddressStateOfResidence", required: true, description: "Full residential address" },
      { name: "NextOfKinName", required: true, description: "Next of kin full name" },
      { name: "NextOfKinRelationship", required: true, description: "Relationship with next of kin" },
      { name: "NextOfKinPhoneNumber", required: true, description: "Next of kin phone number" },
      { name: "NextOfKinAddress", required: true, description: "Next of kin address" },
    ],
    employmentInfo: [
      { name: "EmploymentIdNo", required: true, description: "Employee ID number" },
      { name: "ServiceNo", required: true, description: "Service number" },
      { name: "FileNo", required: true, description: "File number" },
      { name: "RankPosition", required: true, description: "Current rank or position" },
      { name: "Department", required: true, description: "Department" },
      { name: "Organization", required: true, description: "Ministry/Agency/Department" },
      { name: "EmploymentType", required: true, description: "Permanent/Contract/Temporary" },
      { name: "ProbationPeriod", required: false, description: "Probation period duration" },
      { name: "WorkLocation", required: true, description: "Primary work location" },
      { name: "DateOfFirstAppointment", required: true, description: "YYYY-MM-DD format" },
      { name: "GL", required: true, description: "Grade Level" },
      { name: "Step", required: true, description: "Step within Grade Level" },
      { name: "SalaryStructure", required: true, description: "E.g., CONPSS, CONMESS, etc." },
      { name: "Cadre", required: true, description: "Junior/Senior/Management" },
      { name: "NameOfBank", required: true, description: "Bank name" },
      { name: "AccountNumber", required: true, description: "Bank account number" },
      { name: "PFAName", required: true, description: "Pension Fund Administrator" },
      { name: "RSAPIN", required: true, description: "Retirement Savings Account PIN" },
      { name: "EducationalBackground", required: true, description: "Highest qualification and institution" },
      { name: "Certifications", required: false, description: "Professional certifications" },
    ],
    declaration: [
      { name: "Declaration", required: true, description: "Set to 'true' to confirm information is correct" },
    ],
  }

  const downloadTemplate = () => {
    // Redirect to the existing template
    window.open(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IPPIS%20Employee%20Template-L6ive2dMnl8hIm6YaTWoOktprXuQny.csv",
      "_blank",
    )
  }

  // Create a simpler CSV template with just name, email, department, position
  const downloadSimpleTemplate = () => {
    const headers = "Surname,FirstName,Email,Department,Position"
    const exampleRow1 = "Doe,John,john.doe@example.com,IT,Software Engineer"
    const exampleRow2 = "Smith,Jane,jane.smith@example.com,HR,HR Manager"
    const exampleRow3 = "Johnson,Michael,michael.johnson@example.com,Finance,Accountant"
    const csvContent = `${headers}\n${exampleRow1}\n${exampleRow2}\n${exampleRow3}`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "Simple_Employee_Template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Create a working sample CSV that will definitely work
  const downloadWorkingSample = () => {
    const csvContent = `Surname,FirstName,Email,Department,Position
Doe,John,john.doe@example.com,IT,Software Engineer
Smith,Jane,jane.smith@example.com,HR,HR Manager
Johnson,Michael,michael.johnson@example.com,Finance,Accountant
Williams,Sarah,sarah.williams@example.com,Marketing,Marketing Specialist
Brown,Robert,robert.brown@example.com,Operations,Operations Manager`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "Working_Sample.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Import Employees</h1>
        <Button variant="destructive" size="sm" onClick={handleClearData} disabled={isClearing}>
          <Trash2 className="mr-2 h-4 w-4" />
          {isClearing ? "Clearing..." : "Clear All Pending"}
        </Button>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="template">Download Template</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Employee Data</CardTitle>
              <CardDescription>
                Upload a CSV file containing employee records to import into the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Import Process</AlertTitle>
                <AlertDescription>
                  Imported employees will be added to the existing Pending Employees list in descending order (newest
                  first). Records with duplicate email addresses will be skipped to prevent overwriting existing
                  records.
                </AlertDescription>
              </Alert>

              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Required Fields</AlertTitle>
                <AlertDescription>
                  Your CSV file must contain at least three columns: <strong>Surname</strong>,{" "}
                  <strong>FirstName</strong>, and <strong>Email</strong>. Optional columns include{" "}
                  <strong>department</strong> and <strong>position</strong>.
                </AlertDescription>
              </Alert>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" id="file-upload" className="hidden" accept=".csv" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium">{file ? file.name : "Click to upload or drag and drop"}</span>
                  <span className="text-xs text-gray-500 mt-1">CSV files only (max 20MB)</span>
                </label>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setFile(null)} className="ml-auto">
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={downloadWorkingSample} variant="outline" size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Working Sample CSV
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Download this sample CSV file that is guaranteed to work with our system
                </p>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Uploading & Validating...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {validationResults && (
                <div className="space-y-3">
                  <Alert variant={validationResults.errors.length > 0 ? "destructive" : "default"}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Validation Results</AlertTitle>
                    <AlertDescription>
                      Found {validationResults.totalRecords} records, {validationResults.validRecords} valid.
                    </AlertDescription>
                  </Alert>

                  {validationResults.errors.length > 0 && (
                    <div className="rounded border p-3">
                      <h4 className="font-medium text-destructive mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Errors ({validationResults.errors.length})
                      </h4>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        {validationResults.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResults.warnings.length > 0 && (
                    <div className="rounded border p-3">
                      <h4 className="font-medium text-amber-500 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Warnings ({validationResults.warnings.length})
                      </h4>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        {validationResults.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {importComplete && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Import Complete</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Employees have been successfully added to the Pending Employees list. Document upload links have
                    been sent to their email addresses.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              {!validationResults ? (
                <Button onClick={handleUpload} disabled={!file || uploading}>
                  {uploading ? "Validating..." : "Upload & Validate"}
                </Button>
              ) : (
                <Button
                  onClick={handleImport}
                  disabled={validationResults.errors.length > 0 || isImporting || importComplete}
                >
                  {isImporting ? "Importing..." : "Import & Save to Pending"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Download CSV Template</CardTitle>
              <CardDescription>
                Use our template to ensure your data is formatted correctly for import. The template includes all fields
                from the registration form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Document Upload Process</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Document uploads are not included in the CSV template. After importing employees, each employee will
                  receive an email with a secure link to upload their required documents.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-4">
                <Button onClick={downloadTemplate} variant="default" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Full CSV Template (Recommended)
                </Button>

                <Button onClick={downloadWorkingSample} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Working Sample CSV
                </Button>

                <Button onClick={downloadSimpleTemplate} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Simple CSV Template (name, email, department, position)
                </Button>
              </div>

              <div className="space-y-6">
                {Object.entries(templateFields).map(([section, fields], index) => (
                  <div key={section} className="space-y-3">
                    <h3 className="font-medium text-lg capitalize">
                      {section.replace(/([A-Z])/g, " $1").trim()} Fields
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/4">Field Name</TableHead>
                          <TableHead className="w-1/6">Required</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field) => (
                          <TableRow key={field.name}>
                            <TableCell className="font-medium">{field.name}</TableCell>
                            <TableCell>
                              {field.required ? (
                                <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100">
                                  Required
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-500">
                                  Optional
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{field.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {index < Object.entries(templateFields).length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ImportContent
