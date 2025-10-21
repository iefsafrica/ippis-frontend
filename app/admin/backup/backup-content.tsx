"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Database, Download, CheckCircle, AlertTriangle, RefreshCw, HardDrive, Trash2, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Backup {
  id: number
  backupId: string
  name: string
  type: string
  status: string
  size: string
  location: string
  createdBy: string
  createdAt: string
  metadata: any
}

export default function BackupContent() {
  const { toast } = useToast()
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [restoreInProgress, setRestoreInProgress] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [backupHistory, setBackupHistory] = useState<Backup[]>([])
  const [backupSuccess, setBackupSuccess] = useState(false)
  const [restoreSuccess, setRestoreSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null)
  const [downloadingBackups, setDownloadingBackups] = useState<Record<string, boolean>>({})

  const [backupOptions, setBackupOptions] = useState({
    type: "full",
    location: "local",
    compression: "medium",
    encryption: "aes256",
    name: "",
  })

  const [restoreOptions, setRestoreOptions] = useState({
    backupId: "",
    source: "local",
    restoreType: "complete",
  })

  const [scheduleOptions, setScheduleOptions] = useState({
    frequency: "daily",
    time: "02:00",
    retentionPeriod: "30",
    maxBackups: "10",
  })

  // Fetch backup history on component mount
  useEffect(() => {
    fetchBackupHistory()
  }, [])

  const fetchBackupHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/backup")
      const result = await response.json()

      if (result.success) {
        setBackupHistory(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch backup history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching backup history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch backup history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackup = async () => {
    setBackupInProgress(true)
    setBackupProgress(0)
    setBackupSuccess(false)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 300)

    try {
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...backupOptions,
          performedBy: "admin", // In a real app, this would be the current user
        }),
      })

      const result = await response.json()

      clearInterval(progressInterval)

      if (result.success) {
        setBackupProgress(100)
        setBackupSuccess(true)
        fetchBackupHistory() // Refresh the backup history
        toast({
          title: "Success",
          description: "Database backup created successfully",
        })
      } else {
        setBackupProgress(0)
        toast({
          title: "Error",
          description: result.error || "Failed to create backup",
          variant: "destructive",
        })
      }
    } catch (error) {
      clearInterval(progressInterval)
      setBackupProgress(0)
      console.error("Error creating backup:", error)
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      })
    } finally {
      setBackupInProgress(false)
    }
  }

  const handleRestore = async () => {
    if (!restoreOptions.backupId) {
      toast({
        title: "Error",
        description: "Please select a backup to restore",
        variant: "destructive",
      })
      return
    }

    setRestoreInProgress(true)
    setRestoreProgress(0)
    setRestoreSuccess(false)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setRestoreProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 2
      })
    }, 200)

    try {
      const response = await fetch(`/api/admin/backup/${restoreOptions.backupId}/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restoreType: restoreOptions.restoreType,
          performedBy: "admin", // In a real app, this would be the current user
        }),
      })

      const result = await response.json()

      clearInterval(progressInterval)

      if (result.success) {
        setRestoreProgress(100)
        setRestoreSuccess(true)
        toast({
          title: "Success",
          description: "Database restored successfully",
        })
      } else {
        setRestoreProgress(0)
        toast({
          title: "Error",
          description: result.error || "Failed to restore database",
          variant: "destructive",
        })
      }
    } catch (error) {
      clearInterval(progressInterval)
      setRestoreProgress(0)
      console.error("Error restoring database:", error)
      toast({
        title: "Error",
        description: "Failed to restore database",
        variant: "destructive",
      })
    } finally {
      setRestoreInProgress(false)
    }
  }

  const handleSaveSchedule = async () => {
    try {
      const response = await fetch("/api/admin/backup/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...scheduleOptions,
          type: backupOptions.type,
          location: backupOptions.location,
          compression: backupOptions.compression,
          encryption: backupOptions.encryption,
          performedBy: "admin", // In a real app, this would be the current user
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Backup schedule saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save backup schedule",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving backup schedule:", error)
      toast({
        title: "Error",
        description: "Failed to save backup schedule",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBackup = async () => {
    if (!backupToDelete) return

    try {
      const response = await fetch(`/api/admin/backup/${backupToDelete}/delete?performedBy=admin`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Backup deleted successfully",
        })
        fetchBackupHistory() // Refresh the list
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete backup",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting backup:", error)
      toast({
        title: "Error",
        description: "Failed to delete backup",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setBackupToDelete(null)
    }
  }

  const confirmDeleteBackup = (backupId: string) => {
    setBackupToDelete(backupId)
    setDeleteDialogOpen(true)
  }

  const handleDownloadBackup = async (backupId: string) => {
    // Set downloading state for this backup
    setDownloadingBackups((prev) => ({ ...prev, [backupId]: true }))

    try {
      // Create a hidden anchor element to trigger the download
      const link = document.createElement("a")
      link.href = `/api/admin/backup/${backupId}/download`
      link.download = `backup-${backupId}.sql`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download Started",
        description: `Downloading backup ${backupId}`,
      })
    } catch (error) {
      console.error("Error downloading backup:", error)
      toast({
        title: "Error",
        description: "Failed to download backup",
        variant: "destructive",
      })
    } finally {
      // Reset downloading state after a short delay
      setTimeout(() => {
        setDownloadingBackups((prev) => ({ ...prev, [backupId]: false }))
      }, 2000)
    }
  }

  const handleRestoreFromHistory = (backupId: string) => {
    setRestoreOptions({
      ...restoreOptions,
      backupId,
    })

    // Switch to restore tab
    document.getElementById("restore-tab")?.click()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Database Backup</h1>
        <p className="text-muted-foreground">Manage database backups and restoration.</p>
      </div>

      <Tabs defaultValue="backup" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger id="restore-tab" value="restore">
            Restore
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Database Backup</CardTitle>
              <CardDescription>Create a backup of the entire database or specific tables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backup-type">Backup Type</Label>
                  <Select
                    value={backupOptions.type}
                    onValueChange={(value) => setBackupOptions({ ...backupOptions, type: value })}
                  >
                    <SelectTrigger id="backup-type">
                      <SelectValue placeholder="Select backup type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Backup</SelectItem>
                      <SelectItem value="data-only">Data Only</SelectItem>
                      <SelectItem value="schema-only">Schema Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-location">Backup Location</Label>
                  <Select
                    value={backupOptions.location}
                    onValueChange={(value) => setBackupOptions({ ...backupOptions, location: value })}
                  >
                    <SelectTrigger id="backup-location">
                      <SelectValue placeholder="Select backup location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="cloud">Cloud Storage</SelectItem>
                      <SelectItem value="external">External Drive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compression">Compression Level</Label>
                  <Select
                    value={backupOptions.compression}
                    onValueChange={(value) => setBackupOptions({ ...backupOptions, compression: value })}
                  >
                    <SelectTrigger id="compression">
                      <SelectValue placeholder="Select compression level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encryption">Encryption</Label>
                  <Select
                    value={backupOptions.encryption}
                    onValueChange={(value) => setBackupOptions({ ...backupOptions, encryption: value })}
                  >
                    <SelectTrigger id="encryption">
                      <SelectValue placeholder="Select encryption method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="aes128">AES-128</SelectItem>
                      <SelectItem value="aes256">AES-256</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-name">Backup Name (Optional)</Label>
                <Input
                  id="backup-name"
                  placeholder="Enter a name for this backup"
                  value={backupOptions.name}
                  onChange={(e) => setBackupOptions({ ...backupOptions, name: e.target.value })}
                />
              </div>

              {backupInProgress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Backup in progress...</span>
                    <span>{backupProgress}%</span>
                  </div>
                  <Progress value={backupProgress} className="h-2" />
                </div>
              )}

              {backupSuccess && !backupInProgress && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">Backup Completed</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Database backup has been successfully created and stored.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleBackup} disabled={backupInProgress} className="bg-green-700 hover:bg-green-800">
                {backupInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Backing Up...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Create Backup
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Backups</CardTitle>
              <CardDescription>Configure automatic backup schedules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schedule-frequency">Backup Frequency</Label>
                  <Select
                    value={scheduleOptions.frequency}
                    onValueChange={(value) => setScheduleOptions({ ...scheduleOptions, frequency: value })}
                  >
                    <SelectTrigger id="schedule-frequency">
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

                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Backup Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleOptions.time}
                    onChange={(e) => setScheduleOptions({ ...scheduleOptions, time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention-period">Retention Period (days)</Label>
                  <Input
                    id="retention-period"
                    type="number"
                    value={scheduleOptions.retentionPeriod}
                    onChange={(e) => setScheduleOptions({ ...scheduleOptions, retentionPeriod: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-backups">Maximum Backups to Keep</Label>
                  <Input
                    id="max-backups"
                    type="number"
                    value={scheduleOptions.maxBackups}
                    onChange={(e) => setScheduleOptions({ ...scheduleOptions, maxBackups: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSchedule} className="bg-green-700 hover:bg-green-800">
                <Calendar className="h-4 w-4 mr-2" />
                Save Schedule
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Restore Database</CardTitle>
              <CardDescription>Restore the database from a previous backup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-600">Warning</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Restoring a database will overwrite the current data. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="restore-source">Restore Source</Label>
                <Select
                  value={restoreOptions.source}
                  onValueChange={(value) => setRestoreOptions({ ...restoreOptions, source: value })}
                >
                  <SelectTrigger id="restore-source">
                    <SelectValue placeholder="Select restore source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Backup</SelectItem>
                    <SelectItem value="cloud">Cloud Backup</SelectItem>
                    <SelectItem value="upload">Upload Backup File</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-file">Select Backup</Label>
                <Select
                  value={restoreOptions.backupId}
                  onValueChange={(value) => setRestoreOptions({ ...restoreOptions, backupId: value })}
                >
                  <SelectTrigger id="backup-file">
                    <SelectValue placeholder="Select backup file" />
                  </SelectTrigger>
                  <SelectContent>
                    {backupHistory.length > 0 ? (
                      backupHistory.map((backup) => (
                        <SelectItem key={backup.backupId} value={backup.backupId}>
                          {backup.backupId} - {formatDate(backup.createdAt)} ({backup.size})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-backups" disabled>
                        No backups available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restore-options">Restore Options</Label>
                <Select
                  value={restoreOptions.restoreType}
                  onValueChange={(value) => setRestoreOptions({ ...restoreOptions, restoreType: value })}
                >
                  <SelectTrigger id="restore-options">
                    <SelectValue placeholder="Select restore options" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">Complete Restore</SelectItem>
                    <SelectItem value="data-only">Data Only</SelectItem>
                    <SelectItem value="structure-only">Structure Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {restoreInProgress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Restore in progress...</span>
                    <span>{restoreProgress}%</span>
                  </div>
                  <Progress value={restoreProgress} className="h-2" />
                </div>
              )}

              {restoreSuccess && !restoreInProgress && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">Restore Completed</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Database has been successfully restored from the backup.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleRestore}
                disabled={restoreInProgress || !restoreOptions.backupId}
                className="bg-green-700 hover:bg-green-800"
              >
                {restoreInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <HardDrive className="h-4 w-4 mr-2" />
                    Restore Database
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>View and manage previous database backups.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Backup ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Loading backup history...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : backupHistory.length > 0 ? (
                      backupHistory.map((backup) => (
                        <TableRow key={backup.backupId}>
                          <TableCell className="font-medium">{backup.backupId}</TableCell>
                          <TableCell>{formatDate(backup.createdAt)}</TableCell>
                          <TableCell>{backup.size}</TableCell>
                          <TableCell className="capitalize">{backup.type}</TableCell>
                          <TableCell>
                            {backup.status === "completed" ? (
                              <span className="flex items-center text-green-600 text-sm">
                                <CheckCircle className="h-3 w-3 mr-1" /> Completed
                              </span>
                            ) : (
                              <span className="flex items-center text-red-600 text-sm">
                                <AlertTriangle className="h-3 w-3 mr-1" /> Failed
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDownloadBackup(backup.backupId)}
                                disabled={downloadingBackups[backup.backupId]}
                                title="Download backup"
                              >
                                {downloadingBackups[backup.backupId] ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                                <span className="sr-only">Download</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRestoreFromHistory(backup.backupId)}
                                title="Restore from this backup"
                              >
                                <HardDrive className="h-4 w-4" />
                                <span className="sr-only">Restore</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => confirmDeleteBackup(backup.backupId)}
                                title="Delete backup"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No backup history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBackup}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
