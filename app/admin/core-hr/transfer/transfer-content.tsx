"use client"

import { useState, useEffect } from "react"
import { CoreHRClientWrapper } from "../components/core-hr-client-wrapper"
import { DataTable } from "../components/data-table"
import { FormDialog } from "../components/form-dialog"
import { DetailsDialog } from "../components/details-dialog"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"

const API_BASE = "/api/admin/core-hr/transfers"

const transferFormFields = [
  { name: "employeeId", label: "Employee ID", type: "text", required: true },
  { name: "employeeName", label: "Employee Name", type: "text", required: true },
  { name: "fromDepartment", label: "From Department", type: "select", required: true, options: [
    { value: "Finance", label: "Finance" },
    { value: "Accounting", label: "Accounting" },
    { value: "Human Resources", label: "Human Resources" },
  ]},
  { name: "toDepartment", label: "To Department", type: "select", required: true, options: [
    { value: "Finance", label: "Finance" },
    { value: "Accounting", label: "Accounting" },
  ]},
  { name: "fromLocation", label: "From Location", type: "select", required: true, options: [
    { value: "Lagos HQ", label: "Lagos HQ" },
    { value: "Abuja Office", label: "Abuja Office" },
  ]},
  { name: "toLocation", label: "To Location", type: "select", required: true, options: [
    { value: "Lagos HQ", label: "Lagos HQ" },
    { value: "Abuja Office", label: "Abuja Office" },
  ]},
  { name: "transferDate", label: "Transfer Date", type: "date", required: true },
  { name: "effectiveDate", label: "Effective Date", type: "date", required: true },
  { name: "reason", label: "Reason", type: "textarea", required: true },
  { name: "notes", label: "Notes", type: "textarea", required: false },
  { name: "status", label: "Status", type: "select", required: true, options: [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]},
];

const transferDetailsFields = [
  { label: "Employee ID", key: "employeeId" },
  { label: "Employee Name", key: "employeeName" },
  { label: "From Department", key: "fromDepartment" },
  { label: "To Department", key: "toDepartment" },
  { label: "From Location", key: "fromLocation" },
  { label: "To Location", key: "toLocation" },
  { label: "Transfer Date", key: "transferDate", type: "date" },
  { label: "Effective Date", key: "effectiveDate", type: "date" },
  { label: "Reason", key: "reason", type: "longText" },
  { label: "Notes", key: "notes", type: "longText" },
  { label: "Status", key: "status", type: "status" },
  { label: "Requested By", key: "requestedBy" },
  { label: "Approved By", key: "approvedBy" },
  { label: "Requested At", key: "requestedAt", type: "datetime" },
  { label: "Approved At", key: "approvedAt", type: "datetime" },
];

const transferSearchFields = [];

export function TransferContent() {
  const { data: session } = useSession();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [currentTransfer, setCurrentTransfer] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_BASE);
        const data = await response.json();
        setTransfers(data.map((transfer) => ({
          ...transfer,
          id: transfer.id.toString(),
          employeeId: transfer.employee?.employeeId || "",
          employeeName: transfer.employee?.name || "",
          transferDate: transfer.requestedAt,
          reason: transfer.transferReason,
          notes: transfer.remarks,
          requestedBy: transfer.requestedBy?.name || "System",
          approvedBy: transfer.approvedBy?.name || "N/A",
        })));
      } catch (error) {
        console.error("Failed to fetch transfers:", error);
        toast.error("Failed to load transfers");
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  const handleAddTransfer = () => {
    setCurrentTransfer(null);
    setIsEdit(false);
    setFormDialogOpen(true);
  };

  const handleEditTransfer = (id) => {
    const transfer = transfers.find((t) => t.id === id);
    if (transfer) {
      setCurrentTransfer(transfer);
      setIsEdit(true);
      setFormDialogOpen(true);
    }
  };

  const handleViewTransfer = (id) => {
    const transfer = transfers.find((t) => t.id === id);
    if (transfer) {
      setCurrentTransfer(transfer);
      setDetailsDialogOpen(true);
    }
  };

  const handleDeleteTransfer = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      setTransfers(transfers.filter((transfer) => transfer.id !== id));
      toast.success("Transfer deleted successfully");
    } catch (error) {
      console.error("Failed to delete transfer:", error);
      toast.error("Failed to delete transfer");
    }
  };

  const handleSubmitTransfer = async (data) => {
    try {
      const transferData = {
        employee: { id: parseInt(data.employeeId) },
        fromDepartment: data.fromDepartment,
        toDepartment: data.toDepartment,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        requestedAt: data.transferDate,
        effectiveDate: data.effectiveDate,
        transferReason: data.reason,
        remarks: data.notes,
        status: data.status,
        requestedBy: { id: session?.user.id },
      };

      if (isEdit && currentTransfer) {
        const response = await fetch(`${API_BASE}/${currentTransfer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transferData),
        });
        const updatedTransfer = await response.json();
        setTransfers(transfers.map((t) => t.id === currentTransfer.id ? {
          ...t,
          ...updatedTransfer,
          id: updatedTransfer.id.toString(),
          employeeId: updatedTransfer.employee?.employeeId || "",
          employeeName: updatedTransfer.employee?.name || "",
        } : t));
        toast.success("Transfer updated successfully");
      } else {
        const response = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transferData),
        });
        const newTransfer = await response.json();
        setTransfers([...transfers, {
          ...newTransfer,
          id: newTransfer.id.toString(),
          employeeId: newTransfer.employee?.employeeId || "",
          employeeName: newTransfer.employee?.name || "",
          requestedBy: session?.user.name || "System",
        }]);
        toast.success("Transfer created successfully");
      }
    } catch (error) {
      console.error("Failed to save transfer:", error);
      toast.error("Failed to save transfer");
    }
  };

  const handleApproveTransfer = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: session?.user.id }),
      });
      const approvedTransfer = await response.json();
      setTransfers(transfers.map((t) => t.id === id ? {
        ...t,
        status: "approved",
        approvedBy: session?.user.name || "Admin",
        approvedAt: new Date().toISOString(),
      } : t));
      toast.success("Transfer approved successfully");
    } catch (error) {
      console.error("Failed to approve transfer:", error);
      toast.error("Failed to approve transfer");
    }
  };

  const columns = [
    { key: "employeeName", label: "Employee Name", sortable: true },
    { key: "fromDepartment", label: "From Dept" },
    { key: "toDepartment", label: "To Dept" },
    { key: "status", label: "Status", sortable: true, render: (value) => (
      <Badge className={
        value === "approved" ? "bg-green-100 text-green-800" :
        value === "pending" ? "bg-yellow-100 text-yellow-800" :
        value === "completed" ? "bg-blue-100 text-blue-800" :
        value === "rejected" || value === "cancelled" ? "bg-red-100 text-red-800" :
        "bg-gray-100 text-gray-800"
      }>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge>
    ) },
    { key: "actions", label: "Actions", render: (_, row) => (
      <div className="flex space-x-2">
        <button onClick={() => handleViewTransfer(row.id)} className="text-blue-600 hover:text-blue-900">View</button>
        <button onClick={() => handleEditTransfer(row.id)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
        <button onClick={() => handleDeleteTransfer(row.id)} className="text-red-600 hover:text-red-900">Delete</button>
        {row.status === "pending" && <button onClick={() => handleApproveTransfer(row.id)} className="text-green-600 hover:text-green-900">Approve</button>}
      </div>
    ) },
  ];

  return (
    <CoreHRClientWrapper title="Employee Transfers" endpoint="/api/admin/core-hr/transfers">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Employee Transfers</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading transfers...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <DataTable
              title="Transfer"
              columns={columns}
              data={transfers}
              searchFields={transferSearchFields}
              onAdd={handleAddTransfer}
              onEdit={handleEditTransfer}
              onDelete={handleDeleteTransfer}
              onView={handleViewTransfer}
            />
          </div>
        )}
        <FormDialog
          title="Transfer"
          isOpen={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          onSubmit={handleSubmitTransfer}
          fields={transferFormFields}
          defaultValues={currentTransfer || {}}
          isEdit={isEdit}
        />
        <DetailsDialog
          title="Transfer Details"
          isOpen={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          fields={transferDetailsFields}
          data={currentTransfer || {}}
        />
      </div>
    </CoreHRClientWrapper>
  );
}
