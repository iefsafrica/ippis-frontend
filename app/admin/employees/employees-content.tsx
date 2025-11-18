"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Filter,
  MoreVerticalIcon,
  Plus,
  Search,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  CreditCard,
  GraduationCap,
  Shield,
  User,
  IdCard,
  Printer,
} from "lucide-react"
import { Pagination } from "../components/pagination"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DataExportMenu } from "../components/data-export-menu"
import { AdvancedSearch } from "../components/advanced-search"
import ExportService from "../services/export-service"
import { Employee } from "@/types/employees/employee-management";
import { useEmployeesList, useAddEmployee } from "@/services/hooks/employees/useEmployees"
import { AddEmployeePayload } from "@/types/employees/employee-management"

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function EmployeesContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(100);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [newEmployee, setNewEmployee] = useState<AddEmployeePayload>({
    surname: "",
    firstname: "",
    email: "",
    department: "Finance",
    position: "",
    status: "active",
  });

  const [advancedSearchParams, setAdvancedSearchParams] = useState<
    Record<string, string>
  >({});

  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use React Query hooks for employees data
  const { 
    data: employeesData, 
    isLoading, 
    error,
    refetch 
  } = useEmployeesList(currentPage);

  // Use the add employee mutation
  const addEmployeeMutation = useAddEmployee();

  // Extract employees and pagination from the data
  const employees = employeesData?.employees || [];
  const paginationInfo = employeesData?.pagination || {
    page: currentPage,
    limit: itemsPerPage,
    total: 0,
    totalPages: 0,
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.firstname || !newEmployee.surname || !newEmployee.email || !newEmployee.position) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      await addEmployeeMutation.mutateAsync(newEmployee, {
        onSuccess: (data) => {
          setShowAddDialog(false);
          setNewEmployee({
            surname: "",
            firstname: "",
            email: "",
            department: "Finance",
            position: "",
            status: "active",
          });

          // Refetch the employees list to include the new employee
          refetch();

          toast.success("Success", {
            description: data.message || "Employee has been added successfully.",
          });
        },
        onError: (error: Error) => {
          console.error("Failed to add employee:", error);
          toast.error("Error", {
            description: error.message || "Failed to add employee. Please try again.",
          });
        }
      });
    } catch (error) {
      // Error is handled in onError callback
      console.error("Failed to add employee:", error);
    }
  };

  // Handle employee deletion
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete employee");
      }

      refetch();

      toast.success("Success", {
        description: `Employee ${name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast.error("Error", {
        description: error instanceof Error
          ? error.message
          : "Failed to delete employee. Please try again.",
      });
    }
  };

  // Handle status change
  const handleStatusChange = async (
    id: string,
    status: "active" | "inactive" | "pending",
    name: string
  ) => {
    try {
      const response = await fetch(`/api/admin/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update employee status");
      }

      refetch();

      toast.success("Success", {
        description: `Employee ${name}'s status has been updated to ${status}.`,
      });
    } catch (error) {
      console.error("Failed to update employee status:", error);
      toast.error("Error", {
        description: error instanceof Error
          ? error.message
          : "Failed to update employee status. Please try again.",
      });
    }
  };

  // Handle view employee details
  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowViewDialog(true);
  };

  // Handle edit employee
  const handleEdit = (employee: Employee) => {
    router.push(`/admin/employees/${employee.id}/edit`);
  };

  // Handle delete employee
  const handleDelete = (employee: Employee) => {
    handleDeleteEmployee(employee.id, employee.name);
  };

  // Handle advanced search
  const handleAdvancedSearch = (params: Record<string, string>) => {
    setAdvancedSearchParams(params);
    setCurrentPage(1);
  };


  const handlePrint = () => {
    if (!selectedEmployee) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Employee Details - ${selectedEmployee.name}</title>
            <style>
              /* Reset and base styles */
              * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
              }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 20px;
                color: #374151;
                background: white;
                line-height: 1.5;
              }
              
              /* Header section */
              .print-header { 
                display: flex;
                align-items: center;
                gap: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 24px;
              }
              .employee-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid #e5e7eb;
              }
              .employee-info-main {
                flex: 1;
              }
              .employee-name { 
                font-size: 24px; 
                font-weight: 600; 
                color: #111827;
                margin-bottom: 4px;
              }
              .employee-meta {
                display: flex;
                align-items: center;
                gap: 16px;
                flex-wrap: wrap;
              }
              .meta-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                color: #6b7280;
              }
              .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                border: 1px solid;
              }
              .status-active { 
                background-color: #f0fdf4; 
                color: #166534; 
                border-color: #bbf7d0; 
              }
              .status-pending { 
                background-color: #fffbeb; 
                color: #92400e; 
                border-color: #fde68a; 
              }
              .status-inactive { 
                background-color: #fef2f2; 
                color: #991b1b; 
                border-color: #fecaca; 
              }
              
              /* Section styles */
              .section { 
                margin-bottom: 32px; 
                page-break-inside: avoid;
              }
              .section-title { 
                font-size: 18px; 
                font-weight: 600; 
                color: #111827;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 8px; 
                margin-bottom: 16px;
              }
              
              /* Grid layouts */
              .grid-2 { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px;
              }
              .grid-field { 
                margin-bottom: 16px;
              }
              .field-label { 
                font-weight: 500; 
                font-size: 14px; 
                color: #6b7280; 
                margin-bottom: 4px;
                display: block;
              }
              .field-value { 
                font-size: 14px;
                color: #111827;
                font-weight: 400;
                word-wrap: break-word;
              }
              
              /* Full width fields */
              .col-span-2 { grid-column: span 2; }
              
              /* Print-specific styles */
              @media print {
                body { 
                  margin: 0.5in;
                  font-size: 12pt;
                }
                .section { 
                  page-break-inside: avoid;
                  margin-bottom: 24pt;
                }
                .no-print { 
                  display: none !important; 
                }
                .print-header {
                  margin-bottom: 20pt;
                  padding-bottom: 12pt;
                }
                .section-title {
                  font-size: 14pt;
                  margin-bottom: 12pt;
                }
                .grid-2 {
                  gap: 16pt;
                }
                .grid-field {
                  margin-bottom: 12pt;
                }
              }
              
              /* Utility classes */
              .text-sm { font-size: 14px; }
              .font-medium { font-weight: 500; }
              .text-gray-900 { color: #111827; }
              .text-gray-600 { color: #6b7280; }
              .border-b { border-bottom: 1px solid #e5e7eb; }
              .pb-2 { padding-bottom: 8px; }
              .pb-4 { padding-bottom: 16px; }
              .pt-4 { padding-top: 16px; }
              .space-y-4 > * + * { margin-top: 16px; }
              .space-y-6 > * + * { margin-top: 24px; }
              .gap-4 { gap: 16px; }
              .flex { display: flex; }
              .items-center { align-items: center; }
              .gap-1 { gap: 4px; }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: center; color: #666; font-size: 12px;">
              Generated from Employee Management System - ${new Date().toLocaleDateString()}
            </div>
            
            <!-- Employee Header -->
            <div class="print-header">
              <img
                src="/abstract-geometric-shapes.png?key=n1gxi&height=60&width=60&query=${encodeURIComponent(selectedEmployee.name)}"
                alt="${selectedEmployee.name}"
                class="employee-avatar"
                onerror="this.style.display='none'"
              />
              <div class="employee-info-main">
                <h1 class="employee-name">${selectedEmployee.name}</h1>
                <div class="employee-meta">
                  <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    ${selectedEmployee.email}
                  </div>
                  <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                      <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                      <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    ${selectedEmployee.department}
                  </div>
                  <div class="meta-item">
                  
                    <span class="status-badge ${selectedEmployee.status === 'active' ? 'status-active' : selectedEmployee.status === 'pending' ? 'status-pending' : 'status-inactive'}">
                      ${selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Basic Information -->
            <div class="section">
              <h2 class="section-title">Basic Information</h2>
              <div class="grid-2">
                <div class="grid-field">
                  <span class="field-label">Employee ID</span>
                  <div class="field-value">${selectedEmployee.id}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Registration ID</span>
                  <div class="field-value">${selectedEmployee.registration_id || "Not assigned"}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Position</span>
                  <div class="field-value">${selectedEmployee.position}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Organization</span>
                  <div class="field-value">${selectedEmployee.metadata?.Organization || "Not specified"}</div>
                </div>
              </div>
            </div>

            <!-- Personal Details -->
            <div class="section">
              <h2 class="section-title">Personal Details</h2>
              <div class="grid-2">
                ${[
                  { label: "Title", value: selectedEmployee.metadata?.Title },
                  { label: "Gender", value: selectedEmployee.metadata?.Gender },
                  { label: "Surname", value: selectedEmployee.metadata?.Surname },
                  { label: "First Name", value: selectedEmployee.metadata?.FirstName },
                  { label: "Other Names", value: selectedEmployee.metadata?.OtherNames },
                  { label: "Date of Birth", value: selectedEmployee.metadata?.["Date of Birth"] },
                  { label: "Marital Status", value: selectedEmployee.metadata?.["Marital Status"] },
                  { label: "Phone Number", value: selectedEmployee.metadata?.["Phone Number"] },
                ].map(field => `
                  <div class="grid-field">
                    <span class="field-label">${field.label}</span>
                    <div class="field-value">${field.value || "Not provided"}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Address Information -->
            <div class="section">
              <h2 class="section-title">Address Information</h2>
              <div class="grid-2">
                <div class="grid-field col-span-2">
                  <span class="field-label">Residential Address</span>
                  <div class="field-value">${selectedEmployee.metadata?.["Residential Address"] || "Not provided"}</div>
                </div>
                ${[
                  { label: "State of Residence", value: selectedEmployee.metadata?.["State of Residence"] },
                  { label: "State of Origin", value: selectedEmployee.metadata?.["State of Origin"] },
                  { label: "LGA", value: selectedEmployee.metadata?.LGA },
                  { label: "Work Location", value: selectedEmployee.metadata?.["Work Location"] },
                ].map(field => `
                  <div class="grid-field">
                    <span class="field-label">${field.label}</span>
                    <div class="field-value">${field.value || "Not provided"}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Employment Information -->
            <div class="section">
              <h2 class="section-title">Employment Information</h2>
              <div class="grid-2">
                ${[
                  { label: "Employee ID", value: selectedEmployee.metadata?.["Employee ID"] },
                  { label: "Service No", value: selectedEmployee.metadata?.["Service No"] },
                  { label: "Employment Type", value: selectedEmployee.metadata?.["Employment Type"] },
                  { label: "Date of First Appointment", value: selectedEmployee.metadata?.["Date of First Appointment"] },
                  { label: "Probation Period", value: selectedEmployee.metadata?.["Probation Period"] },
                  { label: "Salary Structure", value: selectedEmployee.metadata?.["Salary Structure"] },
                  { label: "GL", value: selectedEmployee.metadata?.GL },
                  { label: "Step", value: selectedEmployee.metadata?.Step },
                  { label: "Cadre", value: selectedEmployee.metadata?.Cadre },
                ].map(field => `
                  <div class="grid-field">
                    <span class="field-label">${field.label}</span>
                    <div class="field-value">${field.value || "Not specified"}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Financial Information -->
            <div class="section">
              <h2 class="section-title">Financial Information</h2>
              <div class="grid-2">
                ${[
                  { label: "Bank Name", value: selectedEmployee.metadata?.["Bank Name"] },
                  { label: "Account Number", value: selectedEmployee.metadata?.["Account Number"] },
                  { label: "PFA Name", value: selectedEmployee.metadata?.["PFA Name"] },
                  { label: "RSA PIN", value: selectedEmployee.metadata?.["RSA PIN"] },
                  { label: "Payment Method", value: selectedEmployee.metadata?.["Payment Method"] },
                ].map(field => `
                  <div class="grid-field">
                    <span class="field-label">${field.label}</span>
                    <div class="field-value">${field.value || "Not provided"}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Education & Next of Kin -->
            <div class="section">
              <h2 class="section-title">Education & Next of Kin</h2>
              <div class="grid-2">
                <div class="grid-field">
                  <span class="field-label">Certifications</span>
                  <div class="field-value">${selectedEmployee.metadata?.Certifications || "Not provided"}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Educational Background</span>
                  <div class="field-value">${selectedEmployee.metadata?.EducationalBackground || "Not provided"}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Next of Kin Name</span>
                  <div class="field-value">${selectedEmployee.metadata?.["Next of Kin Name"] || "Not provided"}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Next of Kin Phone</span>
                  <div class="field-value">${selectedEmployee.metadata?.["Next of Kin Phone"] || "Not provided"}</div>
                </div>
                <div class="grid-field col-span-2">
                  <span class="field-label">Next of Kin Address</span>
                  <div class="field-value">${selectedEmployee.metadata?.["Next of Kin Address"] || "Not provided"}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Next of Kin Relationship</span>
                  <div class="field-value">${selectedEmployee.metadata?.["Next of Kin Relationship"] || "Not provided"}</div>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div class="section">
              <h2 class="section-title">System Information</h2>
              <div class="grid-2">
                <div class="grid-field">
                  <span class="field-label">Join Date</span>
                  <div class="field-value">${formatDate(selectedEmployee.join_date)}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Created On</span>
                  <div class="field-value">${formatDate(selectedEmployee.created_at)}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Updated On</span>
                  <div class="field-value">${formatDate(selectedEmployee.updated_at)}</div>
                </div>
                <div class="grid-field">
                  <span class="field-label">Last Updated</span>
                  <div class="field-value">${formatSimpleDate(selectedEmployee.updated_at)}</div>
                </div>
              </div>
            </div>

            <div class="no-print" style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
              Confidential Employee Document - Generated on ${new Date().toLocaleDateString()}
            </div>

            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Export functions
  const handleExportPDF = () => {
    const columns = [
      { header: "Name", accessor: "name" },
      { header: "Email", accessor: "email" },
      { header: "Department", accessor: "department" },
      { header: "Position", accessor: "position" },
      { header: "Status", accessor: "status" },
      { header: "Join Date", accessor: "join_date" },
    ];

    ExportService.exportToPDF(employees, {
      title: "Employees List",
      filename: "employees-list",
      columns,
    });

    toast.success("Export Complete", {
      description: "The PDF has been generated successfully.",
    });
  };

  const handleExportCSV = () => {
    const columns = [
      { header: "Name", accessor: "name" },
      { header: "Email", accessor: "email" },
      { header: "Department", accessor: "department" },
      { header: "Position", accessor: "position" },
      { header: "Status", accessor: "status" },
      { header: "Join Date", accessor: "join_date" },
    ];

    ExportService.exportToCSV(employees, {
      title: "Employees List",
      filename: "employees-list",
      columns,
    });

    toast.success("Export Complete", {
      description: "The CSV file has been generated successfully.",
    });
  };

  const handlePrintList = () => {
    const columns = [
      { header: "Name", accessor: "name" },
      { header: "Email", accessor: "email" },
      { header: "Department", accessor: "department" },
      { header: "Position", accessor: "position" },
      { header: "Status", accessor: "status" },
      { header: "Join Date", accessor: "join_date" },
    ];

    ExportService.printData(employees, {
      title: "Employees List",
      filename: "employees-list",
      columns,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <AlertTriangle className="h-3 w-3 mr-1" /> Inactive
          </Badge>
        );
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format simple date (without time)
  const formatSimpleDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US');
  };

  // Advanced search fields
  const searchFields = [
    { name: "name", label: "Name", type: "text" as const },
    { name: "email", label: "Email", type: "text" as const },
    {
      name: "department",
      label: "Department",
      type: "select" as const,
      options: [
        { value: "Finance", label: "Finance" },
        { value: "HR", label: "HR" },
        { value: "IT", label: "IT" },
        { value: "Operations", label: "Operations" },
        { value: "Legal", label: "Legal" },
        { value: "Marketing", label: "Marketing" },
      ],
    },
    { name: "position", label: "Position", type: "text" as const },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    { name: "join_date", label: "Join Date", type: "date" as const },
  ];

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Employees</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage and view all approved employees in the system.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <DataExportMenu
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            onPrint={handlePrintList}
            title="Employees"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-[180px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[180px]">
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      <SelectValue placeholder="Department" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AdvancedSearch
                onSearch={handleAdvancedSearch}
                fields={searchFields}
                title="Employees"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 text-gray-500 animate-spin mr-2" />
                        <span>Loading employees...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={`/abstract-geometric-shapes.png?key=n1gxi&height=36&width=36&query=${encodeURIComponent(
                                employee.name
                              )}`}
                              alt={employee.name}
                            />
                            <AvatarFallback>
                              {employee.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell>
                        {employee.join_date ? new Date(employee.join_date).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(employee)}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(employee)}>
                              Edit employee
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(employee.id, "active", employee.name)}
                              className="text-green-600 focus:text-green-600"
                            >
                              Set Active
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(employee.id, "pending", employee.name)}
                              className="text-amber-600 focus:text-amber-600"
                            >
                              Set Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(employee.id, "inactive", employee.name)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Set Inactive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(employee)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Delete employee
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

          <div className="flex w-full h-fit items-center justify-between mt-5">
            <div className="flex items-center justify-end mb-2">
              <label
                htmlFor="itemsPerPage"
                className="mr-2 text-sm text-muted-foreground"
              >
                Rows per page:
              </label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paginationInfo.totalPages > 0 && (
              <div className="mt-4 flex items-center justify-end">
                <Pagination
                  currentPage={paginationInfo.page}
                  totalPages={paginationInfo.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Employee Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Employee Profile</DialogTitle>
            <DialogDescription>
              Complete information for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6 py-2">
              {/* Employee Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="flex items-center gap-4">
                  <img
                    src={`/abstract-geometric-shapes.png?key=n1gxi&height=60&width=60&query=${encodeURIComponent(
                      selectedEmployee.name
                    )}`}
                    alt={selectedEmployee.name}
                    className="size-[60px] rounded-full object-cover border"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedEmployee.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {selectedEmployee.department}
                      </div>
                      <div>
                        {getStatusBadge(selectedEmployee.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Employee ID</Label>
                    <div className="text-sm mt-1 font-medium">{selectedEmployee.id}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Registration ID</Label>
                    <div className="text-sm mt-1">{selectedEmployee.registration_id || "Not assigned"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Position</Label>
                    <div className="text-sm mt-1 font-medium">{selectedEmployee.position}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Organization</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.Organization || "Not specified"}</div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Personal Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Title", value: selectedEmployee.metadata?.Title },
                    { label: "Gender", value: selectedEmployee.metadata?.Gender },
                    { label: "Surname", value: selectedEmployee.metadata?.Surname },
                    { label: "First Name", value: selectedEmployee.metadata?.FirstName },
                    { label: "Other Names", value: selectedEmployee.metadata?.OtherNames },
                    { label: "Date of Birth", value: selectedEmployee.metadata?.["Date of Birth"] },
                    { label: "Marital Status", value: selectedEmployee.metadata?.["Marital Status"] },
                    { label: "Phone Number", value: selectedEmployee.metadata?.["Phone Number"] },
                  ].map((field, index) => (
                    <div key={index}>
                      <Label className="text-sm text-gray-600">{field.label}</Label>
                      <div className="text-sm mt-1">{field.value || "Not provided"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Address Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-600">Residential Address</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.["Residential Address"] || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">State of Residence</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.["State of Residence"] || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">State of Origin</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.["State of Origin"] || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">LGA</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.LGA || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Work Location</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.["Work Location"] || "Not provided"}</div>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Employment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Employee ID", value: selectedEmployee.metadata?.["Employee ID"] },
                    { label: "Service No", value: selectedEmployee.metadata?.["Service No"] },
                    { label: "Employment Type", value: selectedEmployee.metadata?.["Employment Type"] },
                    { label: "Date of First Appointment", value: selectedEmployee.metadata?.["Date of First Appointment"] },
                    { label: "Probation Period", value: selectedEmployee.metadata?.["Probation Period"] },
                    { label: "Salary Structure", value: selectedEmployee.metadata?.["Salary Structure"] },
                    { label: "GL", value: selectedEmployee.metadata?.GL },
                    { label: "Step", value: selectedEmployee.metadata?.Step },
                    { label: "Cadre", value: selectedEmployee.metadata?.Cadre },
                  ].map((field, index) => (
                    <div key={index}>
                      <Label className="text-sm text-gray-600">{field.label}</Label>
                      <div className="text-sm mt-1">{field.value || "Not specified"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Financial Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Bank Name", value: selectedEmployee.metadata?.["Bank Name"] },
                    { label: "Account Number", value: selectedEmployee.metadata?.["Account Number"] },
                    { label: "PFA Name", value: selectedEmployee.metadata?.["PFA Name"] },
                    { label: "RSA PIN", value: selectedEmployee.metadata?.["RSA PIN"] },
                    { label: "Payment Method", value: selectedEmployee.metadata?.["Payment Method"] },
                  ].map((field, index) => (
                    <div key={index}>
                      <Label className="text-sm text-gray-600">{field.label}</Label>
                      <div className="text-sm mt-1">{field.value || "Not provided"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Next of Kin */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Education & Next of Kin</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Certifications</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.Certifications || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Educational Background</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.EducationalBackground || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Next of Kin Name</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.["Next of Kin Name"] || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Next of Kin Phone</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.["Next of Kin Phone"] || "Not provided"}</div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-600">Next of Kin Address</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.["Next of Kin Address"] || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Next of Kin Relationship</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.["Next of Kin Relationship"] || "Not provided"}</div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">System Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Join Date</Label>
                    <div className="text-sm mt-1">{formatDate(selectedEmployee.join_date)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Created On</Label>
                    <div className="text-sm mt-1">{formatDate(selectedEmployee.created_at)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Updated On</Label>
                    <div className="text-sm mt-1">{formatDate(selectedEmployee.updated_at)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Last Updated</Label>
                    <div className="text-sm mt-1">{formatSimpleDate(selectedEmployee.updated_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t">
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="h-4 w-4 mr-2" />
                Print Details
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the details of the new employee. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstname" className="text-right">
                First Name
              </Label>
              <Input
                id="firstname"
                value={newEmployee.firstname}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, firstname: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter first name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="surname" className="text-right">
                Surname
              </Label>
              <Input
                id="surname"
                value={newEmployee.surname}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, surname: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter surname"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter email address"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Select
                value={newEmployee.department}
                onValueChange={(value) =>
                  setNewEmployee({ ...newEmployee, department: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Position
              </Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, position: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter position"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newEmployee.status}
                onValueChange={(value: "active" | "inactive" | "pending") =>
                  setNewEmployee({ ...newEmployee, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddEmployee}
              disabled={addEmployeeMutation.isPending}
              className="bg-green-700 hover:bg-green-800"
            >
              {addEmployeeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}