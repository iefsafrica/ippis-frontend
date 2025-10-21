"use client"

import { useState } from "react"
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { EnhancedForm, type FormField } from "@/app/admin/components/enhanced-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserCheck, FileUp, Download } from "lucide-react"
import { format } from "date-fns"

export function AttendancesContent() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for demonstration
  const attendanceData = [
    {
      id: "1",
      employeeId: "EMP001",
      name: "John Doe",
      department: "IT",
      date: "2023-05-08",
      clockIn: "08:30 AM",
      clockOut: "05:15 PM",
      status: "present",
      notes: "",
    },
    {
      id: "2",
      employeeId: "EMP002",
      name: "Jane Smith",
      department: "HR",
      date: "2023-05-08",
      clockIn: "09:05 AM",
      clockOut: "06:00 PM",
      status: "late",
      notes: "Traffic delay",
    },
    {
      id: "3",
      employeeId: "EMP003",
      name: "Robert Johnson",
      department: "Finance",
      date: "2023-05-08",
      clockIn: "08:00 AM",
      clockOut: "04:30 PM",
      status: "present",
      notes: "",
    },
    {
      id: "4",
      employeeId: "EMP004",
      name: "Emily Davis",
      department: "Marketing",
      date: "2023-05-08",
      clockIn: "",
      clockOut: "",
      status: "absent",
      notes: "Sick",
    },
    {
      id: "5",
      employeeId: "EMP005",
      name: "Michael Wilson",
      department: "Operations",
      date: "2023-05-08",
      clockIn: "08:45 AM",
      clockOut: "05:30 PM",
      status: "present",
      notes: "",
    },
  ]

  const columns = [
    {
      key: "employeeId",
      label: "Employee ID",
      sortable: true,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) => format(new Date(value), "PPP"),
    },
    {
      key: "clockIn",
      label: "Clock In",
      sortable: true,
    },
    {
      key: "clockOut",
      label: "Clock Out",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const statusStyles = {
          present: "bg-green-100 text-green-800",
          absent: "bg-red-100 text-red-800",
          late: "bg-yellow-100 text-yellow-800",
          leave: "bg-blue-100 text-blue-800",
        }
        const style = statusStyles[value as keyof typeof statusStyles] || "bg-gray-100 text-gray-800"
        return <Badge className={`${style} capitalize`}>{value}</Badge>
      },
    },
  ]

  const filterOptions = [
    {
      id: "department",
      label: "Department",
      type: "select" as const,
      options: [
        { value: "IT", label: "IT" },
        { value: "HR", label: "HR" },
        { value: "Finance", label: "Finance" },
        { value: "Marketing", label: "Marketing" },
        { value: "Operations", label: "Operations" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "present", label: "Present" },
        { value: "absent", label: "Absent" },
        { value: "late", label: "Late" },
        { value: "leave", label: "Leave" },
      ],
    },
    {
      id: "date",
      label: "Date",
      type: "date" as const,
      options: [],
    },
  ]

  const formFields: FormField[] = [
    {
      name: "employeeId",
      label: "Employee",
      type: "select",
      required: true,
      options: [
        { value: "EMP001", label: "EMP001 - John Doe" },
        { value: "EMP002", label: "EMP002 - Jane Smith" },
        { value: "EMP003", label: "EMP003 - Robert Johnson" },
        { value: "EMP004", label: "EMP004 - Emily Davis" },
        { value: "EMP005", label: "EMP005 - Michael Wilson" },
      ],
    },
    {
      name: "date",
      label: "Date",
      type: "date",
      required: true,
    },
    {
      name: "clockIn",
      label: "Clock In",
      type: "text",
      placeholder: "HH:MM AM/PM",
    },
    {
      name: "clockOut",
      label: "Clock Out",
      type: "text",
      placeholder: "HH:MM AM/PM",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "present", label: "Present" },
        { value: "absent", label: "Absent" },
        { value: "late", label: "Late" },
        { value: "leave", label: "Leave" },
      ],
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Add any additional notes here",
    },
  ]

  const handleAdd = () => {
    setAddDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    const item = attendanceData.find((item) => item.id === id)
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  const handleView = (id: string) => {
    const item = attendanceData.find((item) => item.id === id)
    setSelectedItem(item)
    setViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    console.log("Delete item with ID:", id)
    // Implement delete logic here
  }

  const handleSubmitAdd = (data: Record<string, any>) => {
    console.log("Add attendance:", data)
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setAddDialogOpen(false)
    }, 1000)
  }

  const handleSubmitEdit = (data: Record<string, any>) => {
    console.log("Edit attendance:", data)
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setEditDialogOpen(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendances</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleAdd}>
            <UserCheck className="mr-2 h-4 w-4" />
            Mark Attendance
          </Button>
        </div>
      </div>

      <EnhancedDataTable
        title="Attendance Records"
        description="View and manage employee attendance records"
        columns={columns}
        data={attendanceData}
        filterOptions={filterOptions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        isLoading={isLoading}
      />

      {/* Add Attendance Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={formFields}
            onSubmit={handleSubmitAdd}
            onCancel={() => setAddDialogOpen(false)}
            isSubmitting={isLoading}
            submitLabel="Save Attendance"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          <EnhancedForm
            fields={formFields}
            onSubmit={handleSubmitEdit}
            onCancel={() => setEditDialogOpen(false)}
            isSubmitting={isLoading}
            submitLabel="Update Attendance"
            initialValues={selectedItem}
          />
        </DialogContent>
      </Dialog>

      {/* View Attendance Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Employee</h3>
                  <p>
                    {selectedItem.employeeId} - {selectedItem.name}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Department</h3>
                  <p>{selectedItem.department}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Date</h3>
                  <p>{format(new Date(selectedItem.date), "PPP")}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Status</h3>
                  <Badge
                    className={`${
                      selectedItem.status === "present"
                        ? "bg-green-100 text-green-800"
                        : selectedItem.status === "absent"
                          ? "bg-red-100 text-red-800"
                          : selectedItem.status === "late"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                    } capitalize mt-1`}
                  >
                    {selectedItem.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Clock In</h3>
                  <p>{selectedItem.clockIn || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Clock Out</h3>
                  <p>{selectedItem.clockOut || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-medium text-sm">Notes</h3>
                  <p>{selectedItem.notes || "No notes"}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
