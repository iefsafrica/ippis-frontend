"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Printer,
  FileSpreadsheet,
  FileIcon as FilePdf,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Check,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format, differenceInDays } from "date-fns"

export function ManageLeavesContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  // Mock data for demonstration
  const leaveData = [
    {
      id: "1",
      employeeId: "EMP001",
      employeeName: "John Doe",
      department: "IT",
      leaveType: "Annual Leave",
      fromDate: "2023-05-15",
      toDate: "2023-05-19",
      reason: "Family vacation",
      status: "approved",
      appliedOn: "2023-05-01",
    },
    {
      id: "2",
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      department: "HR",
      leaveType: "Sick Leave",
      fromDate: "2023-05-08",
      toDate: "2023-05-09",
      reason: "Not feeling well",
      status: "approved",
      appliedOn: "2023-05-07",
    },
    {
      id: "3",
      employeeId: "EMP003",
      employeeName: "Robert Johnson",
      department: "Finance",
      leaveType: "Casual Leave",
      fromDate: "2023-05-22",
      toDate: "2023-05-22",
      reason: "Personal work",
      status: "pending",
      appliedOn: "2023-05-10",
    },
    {
      id: "4",
      employeeId: "EMP004",
      employeeName: "Emily Davis",
      department: "Marketing",
      leaveType: "Maternity Leave",
      fromDate: "2023-06-01",
      toDate: "2023-08-31",
      reason: "Maternity leave",
      status: "approved",
      appliedOn: "2023-04-15",
    },
    {
      id: "5",
      employeeId: "EMP005",
      employeeName: "Michael Wilson",
      department: "Operations",
      leaveType: "Annual Leave",
      fromDate: "2023-05-25",
      toDate: "2023-05-26",
      reason: "Short break",
      status: "rejected",
      appliedOn: "2023-05-12",
      rejectionReason: "Insufficient staff during this period",
    },
  ]

  const handleAdd = () => {
    setAddDialogOpen(true)
  }

  const handleEdit = (item: any) => {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  const handleView = (item: any) => {
    setSelectedItem(item)
    setViewDialogOpen(true)
  }

  const handleDelete = (item: any) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleApprove = (item: any) => {
    console.log("Approving leave:", item.id)
    // Implement approve logic
  }

  const handleReject = (item: any) => {
    setSelectedItem(item)
    setRejectDialogOpen(true)
  }

  const handleSubmitReject = () => {
    console.log("Rejecting leave:", selectedItem.id, "Reason:", rejectionReason)
    setRejectDialogOpen(false)
    setRejectionReason("")
    // Implement reject logic
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

  const filteredData = leaveData.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.leaveType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Leaves</h1>
        <div className="flex items-center gap-2">
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
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Leave
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Management</CardTitle>
          <CardDescription>View and manage employee leave requests and balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search leaves..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From Date</TableHead>
                  <TableHead>To Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No leaves found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">{leave.employeeName}</TableCell>
                      <TableCell>{leave.department}</TableCell>
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell>{format(new Date(leave.fromDate), "PPP")}</TableCell>
                      <TableCell>{format(new Date(leave.toDate), "PPP")}</TableCell>
                      <TableCell>{differenceInDays(new Date(leave.toDate), new Date(leave.fromDate)) + 1}</TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize ${
                            leave.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : leave.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {leave.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprove(leave)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleReject(leave)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleView(leave)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(leave)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(leave)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Leave Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Leave</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emp001">John Doe (EMP001)</SelectItem>
                    <SelectItem value="emp002">Jane Smith (EMP002)</SelectItem>
                    <SelectItem value="emp003">Robert Johnson (EMP003)</SelectItem>
                    <SelectItem value="emp004">Emily Davis (EMP004)</SelectItem>
                    <SelectItem value="emp005">Michael Wilson (EMP005)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                    <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <Input id="fromDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <Input id="toDate" type="date" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" placeholder="Enter reason for leave" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="pending">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAddDialogOpen(false)}>Save Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Leave Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Leave</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-employee">Employee</Label>
                  <Select defaultValue={selectedItem.employeeId.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emp001">John Doe (EMP001)</SelectItem>
                      <SelectItem value="emp002">Jane Smith (EMP002)</SelectItem>
                      <SelectItem value="emp003">Robert Johnson (EMP003)</SelectItem>
                      <SelectItem value="emp004">Emily Davis (EMP004)</SelectItem>
                      <SelectItem value="emp005">Michael Wilson (EMP005)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-leaveType">Leave Type</Label>
                  <Select defaultValue={selectedItem.leaveType.toLowerCase().replace(/\s+/g, "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="maternity">Maternity Leave</SelectItem>
                      <SelectItem value="paternity">Paternity Leave</SelectItem>
                      <SelectItem value="bereavement">Bereavement Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fromDate">From Date</Label>
                  <Input id="edit-fromDate" type="date" defaultValue={selectedItem.fromDate} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-toDate">To Date</Label>
                  <Input id="edit-toDate" type="date" defaultValue={selectedItem.toDate} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-reason">Reason</Label>
                  <Textarea id="edit-reason" defaultValue={selectedItem.reason} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select defaultValue={selectedItem.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setEditDialogOpen(false)}>Update Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Leave Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Leave Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Employee</h3>
                  <p>{selectedItem.employeeName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Department</h3>
                  <p>{selectedItem.department}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Leave Type</h3>
                  <p>{selectedItem.leaveType}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Status</h3>
                  <Badge
                    className={`${
                      selectedItem.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedItem.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    } capitalize mt-1`}
                  >
                    {selectedItem.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium text-sm">From Date</h3>
                  <p>{format(new Date(selectedItem.fromDate), "PPP")}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">To Date</h3>
                  <p>{format(new Date(selectedItem.toDate), "PPP")}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Number of Days</h3>
                  <p>{differenceInDays(new Date(selectedItem.toDate), new Date(selectedItem.fromDate)) + 1}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Applied On</h3>
                  <p>{format(new Date(selectedItem.appliedOn), "PPP")}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-medium text-sm">Reason</h3>
                  <p>{selectedItem.reason}</p>
                </div>
                {selectedItem.status === "rejected" && selectedItem.rejectionReason && (
                  <div className="col-span-2">
                    <h3 className="font-medium text-sm">Rejection Reason</h3>
                    <p>{selectedItem.rejectionReason}</p>
                  </div>
                )}
              </div>

              {selectedItem.status === "pending" && (
                <DialogFooter className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setViewDialogOpen(false)
                      handleReject(selectedItem)
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setViewDialogOpen(false)
                      handleApprove(selectedItem)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this leave request? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Leave Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a reason for rejecting this leave request"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmitReject} disabled={!rejectionReason.trim()}>
              Reject Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
