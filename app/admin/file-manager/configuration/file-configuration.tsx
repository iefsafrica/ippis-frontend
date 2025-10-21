"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Plus, Trash2, Edit, Users, MoreVertical, FileCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data for file types
const fileTypes = [
  { id: "1", extension: ".pdf", name: "PDF Document", maxSize: "10 MB", allowed: true },
  { id: "2", extension: ".docx", name: "Word Document", maxSize: "10 MB", allowed: true },
  { id: "3", extension: ".xlsx", name: "Excel Spreadsheet", maxSize: "10 MB", allowed: true },
  { id: "4", extension: ".pptx", name: "PowerPoint Presentation", maxSize: "20 MB", allowed: true },
  { id: "5", extension: ".jpg", name: "JPEG Image", maxSize: "5 MB", allowed: true },
  { id: "6", extension: ".png", name: "PNG Image", maxSize: "5 MB", allowed: true },
  { id: "7", extension: ".zip", name: "ZIP Archive", maxSize: "50 MB", allowed: true },
  { id: "8", extension: ".mp4", name: "MP4 Video", maxSize: "100 MB", allowed: false },
  { id: "9", extension: ".exe", name: "Executable File", maxSize: "0", allowed: false },
  { id: "10", extension: ".js", name: "JavaScript File", maxSize: "1 MB", allowed: false },
]

// Mock data for folder structure
const folderStructure = [
  { id: "1", name: "HR Documents", path: "/hr-documents", accessLevel: "HR Department" },
  { id: "2", name: "Finance", path: "/finance", accessLevel: "Finance Department" },
  { id: "3", name: "IT Policies", path: "/it-policies", accessLevel: "IT Department" },
  { id: "4", name: "Legal", path: "/legal", accessLevel: "Legal Department" },
  { id: "5", name: "Public", path: "/public", accessLevel: "All Employees" },
  { id: "6", name: "Management", path: "/management", accessLevel: "Management Only" },
]

export function FileConfiguration() {
  const [isAddFileTypeDialogOpen, setIsAddFileTypeDialogOpen] = useState(false)
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false)
  const [storageLimit, setStorageLimit] = useState(1000) // GB
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false)
  const [versioningEnabled, setVersioningEnabled] = useState(true)
  const [maxVersions, setMaxVersions] = useState(5)
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  const [compressionEnabled, setCompressionEnabled] = useState(true)
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(true)
  const [retentionPeriod, setRetentionPeriod] = useState(365) // days

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">File Configuration</h1>
          <p className="text-muted-foreground">Configure file storage, permissions, and other settings</p>
        </div>
        <Button className="bg-[#008751] hover:bg-[#00724a]">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="file-types">File Types</TabsTrigger>
          <TabsTrigger value="folders">Folder Structure</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
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

            <Card>
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

            <Card>
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

            <Card>
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
            <Card>
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

            <Card>
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

            <Card>
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

            <Card>
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
            <Card>
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

            <Card>
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

            <Card>
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

            <Card>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Allowed File Types</h2>
            <Dialog open={isAddFileTypeDialogOpen} onOpenChange={setIsAddFileTypeDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add File Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add File Type</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="file-extension">File Extension</Label>
                    <Input id="file-extension" placeholder="e.g. .pdf" />
                  </div>
                  <div>
                    <Label htmlFor="file-type-name">Display Name</Label>
                    <Input id="file-type-name" placeholder="e.g. PDF Document" />
                  </div>
                  <div>
                    <Label htmlFor="max-file-size">Maximum Size</Label>
                    <Select defaultValue="10">
                      <SelectTrigger id="max-file-size">
                        <SelectValue placeholder="Select maximum size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 MB</SelectItem>
                        <SelectItem value="5">5 MB</SelectItem>
                        <SelectItem value="10">10 MB</SelectItem>
                        <SelectItem value="20">20 MB</SelectItem>
                        <SelectItem value="50">50 MB</SelectItem>
                        <SelectItem value="100">100 MB</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allow-file-type" defaultChecked />
                    <label htmlFor="allow-file-type" className="text-sm font-medium leading-none">
                      Allow this file type
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddFileTypeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#008751] hover:bg-[#00724a]">Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Extension</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Maximum Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fileTypes.map((fileType) => (
                  <TableRow key={fileType.id}>
                    <TableCell className="font-mono">{fileType.extension}</TableCell>
                    <TableCell>{fileType.name}</TableCell>
                    <TableCell>{fileType.maxSize}</TableCell>
                    <TableCell>
                      {fileType.allowed ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Allowed</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200">Blocked</Badge>
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
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {fileType.allowed ? (
                            <DropdownMenuItem>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Block
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <FileCheck className="mr-2 h-4 w-4" />
                              Allow
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Folders Tab */}
        <TabsContent value="folders">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Folder Structure</h2>
            <Dialog open={isAddFolderDialogOpen} onOpenChange={setIsAddFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Folder</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input id="folder-name" placeholder="e.g. HR Documents" />
                  </div>
                  <div>
                    <Label htmlFor="folder-path">Path</Label>
                    <Input id="folder-path" placeholder="e.g. /hr-documents" />
                  </div>
                  <div>
                    <Label htmlFor="folder-access">Access Level</Label>
                    <Select defaultValue="department">
                      <SelectTrigger id="folder-access">
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        <SelectItem value="department">Department Only</SelectItem>
                        <SelectItem value="management">Management Only</SelectItem>
                        <SelectItem value="admin">Administrators Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddFolderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#008751] hover:bg-[#00724a]">Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folder Name</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {folderStructure.map((folder) => (
                  <TableRow key={folder.id}>
                    <TableCell>{folder.name}</TableCell>
                    <TableCell className="font-mono">{folder.path}</TableCell>
                    <TableCell>{folder.accessLevel}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Manage Access
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
