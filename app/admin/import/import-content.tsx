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
import { useRouter } from "next/navigation"
import { useImportEmployees } from "@/services/hooks/employees/useEmployees"
import { toast } from "sonner"

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
  const [importComplete, setImportComplete] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  // Use the import employees hook
  const importEmployeesMutation = useImportEmployees()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadStatus("idle")
      setValidationResults(null)
      setImportComplete(false)
      setImportError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setImportError(null)

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
      // For validation, we'll do a simple frontend validation
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Basic validation - check for required columns
      const requiredColumns = ['Surname', 'FirstName', 'Email'];
      const missingColumns = requiredColumns.filter(col => 
        !headers.some(header => header.toLowerCase().includes(col.toLowerCase()))
      );

      const errors: string[] = [];
      const warnings: string[] = [];

      if (missingColumns.length > 0) {
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Check if file has data rows
      if (lines.length <= 1) {
        errors.push('CSV file contains no data rows');
      }

      // Check for duplicate emails in the CSV
      const emails = new Set();
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          const values = line.split(',').map(v => v.trim());
          const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
          if (emailIndex >= 0 && values[emailIndex]) {
            const email = values[emailIndex];
            if (emails.has(email)) {
              warnings.push(`Duplicate email found in CSV: ${email}`);
            } else {
              emails.add(email);
            }
          }
        }
      }

      const totalRecords = Math.max(0, lines.length - 1); // Exclude header
      const validRecords = errors.length === 0 ? totalRecords : 0;

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Set validation results
      setValidationResults({
        valid: errors.length === 0,
        errors,
        warnings,
        totalRecords,
        validRecords,
      });

      setUploadStatus(errors.length === 0 ? "success" : "error");

      if (errors.length === 0) {
        toast.success("Validation Successful", {
          description: `Found ${totalRecords} valid records ready for import.`
        });
      } else {
        toast.error("Validation Failed", {
          description: "Please fix the errors before importing."
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadStatus("error");

      toast.error("Validation Error", {
        description: error instanceof Error ? error.message : "Failed to read CSV file"
      });
    } finally {
      setUploading(false);
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImportError(null);

    try {
      console.log("Starting import process...")

      // Use the React Query mutation for importing employees
      const result = await importEmployeesMutation.mutateAsync({ file })

      console.log("Full import result:", result)

      // Check if the import was successful - handle different response structures
      let isSuccess = false;
      let message = "";
      let importedCount = 0;

      // Handle different possible response structures
      if (result && typeof result === 'object') {
        // Case 1: Direct success flag
        if (result.success === true) {
          isSuccess = true;
          message = result.message || "Employees imported successfully";
          importedCount = result.data?.length || 0;
        }
        // Case 2: Check for data array (success implied)
        else if (Array.isArray(result.data) && result.data.length > 0) {
          isSuccess = true;
          message = result.message || `Successfully imported ${result.data.length} employees`;
          importedCount = result.data.length;
        }
       
        else if (result.message && result.message.toLowerCase().includes('success')) {
          isSuccess = true;
          message = result.message;
          importedCount = result.data?.length || 0;
        }
       //@ts-ignore
        else if (!result.error && !result.details) {
          isSuccess = true;
          message = "Import completed successfully";
          importedCount = result.data?.length || 0;
        }
      }

      if (isSuccess) {
        toast.success("Import Successful", {
          description: message
        });

        setImportComplete(true)
        setFile(null)
        setValidationResults(null)
        setTimeout(() => {
          router.push("/admin/pending")
          router.refresh() 
        }, 1500)
      } else {
      //@ts-ignore
        const errorMessage = result?.error || result?.message || result?.details || "Failed to import employees";
        setImportError(errorMessage);
        
        console.error("Import failed with response:", result);
        toast.error("Import Failed", {
          description: errorMessage
        });
      }
    } catch (error: any) {
      console.error("Import error:", error)
      
      // Extract meaningful error message from the error response
      let errorMessage = "Failed to import employees";
      
      if (error?.response?.data) {
        // Axios error structure
        const errorData = error.response.data;
        errorMessage = errorData.details || errorData.error || errorData.message || errorMessage;
      } else if (error?.data) {
        // Direct data field
        const errorData = error.data;
        errorMessage = errorData.details || errorData.error || errorData.message || errorMessage;
      } else if (error?.details) {
        // Direct error details
        errorMessage = error.details;
      } else if (error?.error) {
        // Direct error field
        errorMessage = error.error;
      } else if (error?.message) {
        // Standard error message
        errorMessage = error.message;
      }

      setImportError(errorMessage);

      // Show specific error message for duplicate registration ID
      if (errorMessage.includes('duplicate key') && errorMessage.includes('registration_id')) {
        toast.error("Duplicate Employee Found", {
          description: "Some employees already exist in the system with the same registration IDs. Please check for duplicates in your CSV file."
        });
      } else {
        toast.error("Import Failed", {
          description: errorMessage
        });
      }
    }
  }

  const handleClearData = async () => {
    try {
      setIsClearing(true)

      toast.error("Feature Not Implemented", {
        description: "Clear pending employees functionality requires backend implementation."
      });
    } catch (error) {
      console.error("Failed to clear data:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsClearing(false)
    }
  }

  // Group template fields by registration form steps
  const templateFields = {
    basicInfo: [
      { name: "Surname", required: true, description: "Last name" },
      { name: "FirstName", required: true, description: "First name" },
      { name: "Email", required: true, description: "Email address" },
      { name: "Department", required: false, description: "Department name" },
      { name: "Position", required: false, description: "Job position" },
    ]
  }

  const downloadTemplate = () => {
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
                  Imported employees will be added to the existing Pending Employees list. Records with duplicate email addresses or registration IDs will be skipped.
                </AlertDescription>
              </Alert>
              {/* @ts-ignore */}
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
                    <span>Validating CSV...</span>
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

              {importError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import Error</AlertTitle>
                  <AlertDescription>
                    {importError.includes('duplicate key') && importError.includes('registration_id') ? (
                      <div>
                        <p className="font-semibold">Duplicate Employee Records Detected</p>
                        <p className="mt-2">
                          The system found employees with duplicate registration IDs. This usually happens when:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>You are trying to import employees that already exist in the system</li>
                          <li>Your CSV file contains duplicate rows</li>
                          <li>The registration ID generation is conflicting</li>
                        </ul>
                        <p className="mt-2">
                          <strong>Solution:</strong> Please check your CSV file for duplicate entries and ensure you're not re-importing existing employees.
                        </p>
                      </div>
                    ) : (
                      importError
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {importComplete && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Import Complete</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Employees have been successfully added to the Pending Employees list.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              {!validationResults ? (
                <Button onClick={handleUpload} disabled={!file || uploading}>
                  {uploading ? "Validating..." : "Upload & Validate"}
                </Button>
              ) : (
                <Button
                  onClick={handleImport}
                  disabled={validationResults.errors.length > 0 || importEmployeesMutation.isPending || importComplete}
                >
                  {importEmployeesMutation.isPending ? "Importing..." : "Import & Save to Pending"}
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
                Use our template to ensure your data is formatted correctly for import.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <Button onClick={downloadTemplate} variant="default" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Full CSV Template
                </Button>

                <Button onClick={downloadWorkingSample} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Working Sample CSV
                </Button>

                <Button onClick={downloadSimpleTemplate} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Simple CSV Template
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