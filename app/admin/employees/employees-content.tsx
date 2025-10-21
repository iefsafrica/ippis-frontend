"use client"

import { useState, useEffect } from "react"
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
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Pagination } from "../components/pagination"
import { useToast } from "@/components/ui/use-toast"
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
import { Employee3 } from "@/types/employee";

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function EmployeesContent({ employees: initialEmployees }: { employees: Employee3[] }) {
  const [employees, setEmployees] = useState<Employee3[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const [showAddDialog, setShowAddDialog] = useState(false);
  type NewEmployee = {
    name: string;
    email: string;
    department: string;
    position: string;
    status: "active" | "inactive" | "pending";
  };

  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    name: "",
    email: "",
    department: "Finance",
    position: "",
    status: "active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [advancedSearchParams, setAdvancedSearchParams] = useState<
    Record<string, string>
  >({});

  const { toast } = useToast();
  const router = useRouter();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (departmentFilter !== "all") params.append("department", departmentFilter);
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());

      Object.entries(advancedSearchParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/admin/employees?${params.toString()}`);
      if (!response.ok) throw new Error(`Failed to fetch employees: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setEmployees(data.data.employees);
        setPaginationInfo(data.data.pagination);
      } else {
        throw new Error(data.error || "Failed to fetch employees");
      }
    } catch (error) {
      console.error("Failed to load employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        variant: "destructive", 
      });
    } finally {
      setLoading(false);
    }
  };

  // Load employees with filters
  useEffect(() => {
    // Add a small delay to prevent too many API calls while typing
    const handler = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(handler);
  }, [
    searchTerm,
    statusFilter,
    departmentFilter,
    currentPage,
    itemsPerPage,
    advancedSearchParams,
    toast,
  ]);

const handleAddEmployee = async () => {
  // Basic validation
  if (!newEmployee.name || !newEmployee.email || !newEmployee.position) {
    toast({
      title: "Validation Error",
      description: "Please fill in all required fields.",
      variant: "destructive",
    });
    return;
  }

  setIsSubmitting(true);
  try {
    const response = await fetch("http://localhost:3000/api/admin/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEmployee),
    });

    if (!response.ok) {
      const errorData = await response.json();

      // Handle duplicate email error specifically
      if (
        errorData.details &&
        errorData.details.includes("duplicate key") &&
        errorData.details.includes("employees_email_key")
      ) {
        throw new Error("An employee with this email already exists.");
      }

      throw new Error(errorData.error || "Failed to add employee");
    }

    const data = await response.json();

    // Refresh the employee list
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (departmentFilter !== "all")
      params.append("department", departmentFilter);
    params.append("page", currentPage.toString());
    params.append("limit", itemsPerPage.toString());

    const refreshResponse = await fetch(
      `http://localhost:3000/api/admin/employees?${params.toString()}`
    );
    const refreshData = await refreshResponse.json();

    if (refreshData.success) {
      setEmployees(refreshData.data.employees);
      setPaginationInfo(refreshData.data.pagination);
    }

    setShowAddDialog(false);
    setNewEmployee({
      name: "",
      email: "",
      department: "Finance",
      position: "",
      status: "active" as const,
    });

    toast({
      title: "Success",
      description: `Employee ${data.data.name} has been added successfully.`,
    });
  } catch (error) {
    console.error("Failed to add employee:", error);
    toast({
      title: "Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to add employee. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
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

      // Refresh employee list
      await fetchEmployees();

      toast({
        title: "Success",
        description: `Employee ${name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete employee. Please try again.",
        variant: "destructive",
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

      //  Refresh the table
      const handleDeleteEmployee = async (id: string, name: string) => {
        try {
          const response = await fetch(`/api/admin/employees/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete employee");
          }

          // Refresh employee list after successful deletion
          await fetchEmployees();

          toast({
            title: "Deleted",
            description: `Employee ${name} has been deleted successfully.`,
          });
        } catch (error) {
          console.error("Failed to delete employee:", error);
          toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to delete employee. Please try again.",
            variant: "destructive",
          });
        }
      };

      const fetchEmployees = async () => {
        try {
          const params = new URLSearchParams();
          if (searchTerm) params.append("search", searchTerm);
          if (statusFilter !== "all") params.append("status", statusFilter);
          if (departmentFilter !== "all")
            params.append("department", departmentFilter);
          params.append("page", currentPage.toString());
          params.append("limit", itemsPerPage.toString());

          const response = await fetch(
            `/api/admin/employees?${params.toString()}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch employees");
          }
          const data = await response.json();

          if (data.success) {
            setEmployees(data.data.employees);
            setPaginationInfo(data.data.pagination);
          } else {
            throw new Error(data.error || "Failed to fetch employees");
          }
        } catch (error) {
          console.error("Error fetching employees:", error);
        }
      };

      //------------------

      // Refresh the employee list
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (departmentFilter !== "all")
        params.append("department", departmentFilter);
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());

      const refreshResponse = await fetch(
        `/api/admin/employees?${params.toString()}`
      );
      const refreshData = await refreshResponse.json();

      if (refreshData.success) {
        setEmployees(refreshData.data.employees);
        setPaginationInfo(refreshData.data.pagination);
      }

      toast({
        title: "Success",
        description: `Employee ${name}'s status has been updated to ${status}.`,
      });
    } catch (error) {
      console.error("Failed to update employee status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update employee status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle advanced search
  const handleAdvancedSearch = (params: Record<string, string>) => {
    setAdvancedSearchParams(params);
    setCurrentPage(1); // Reset to first page when applying new search
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

    toast({
      title: "Export Complete",
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

    toast({
      title: "Export Complete",
      description: "The CSV file has been generated successfully.",
    });
  };

  const handlePrint = () => {
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

  // Handler for viewing employee details
  const handleView = (employee: Employee3) => {
    router.push(`/admin/employees/${employee.id}`);
  };

  // Handler for editing employee
  const handleEdit = (employee: Employee3) => {
    router.push(`/admin/employees/${employee.id}/edit`);
  };

  // Handler for deleting employee
  const handleDelete = (employee: Employee3) => {
    handleDeleteEmployee(employee.id, employee.name);
  };

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
          <DataExportMenu
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            onPrint={handlePrint}
            title="Employees"
          />
          {/* <Button className="gap-1 bg-green-700 hover:bg-green-800" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Employee
          </Button> */}
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
                {loading ? (
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
                              variant="outline"
                              size="sm"
                            >
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleView(employee)}>View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(employee)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(employee)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex w-full h-fit  items-center justify-between mt-5">

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

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the details of the new employee. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                className="col-span-3"
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
              disabled={isSubmitting}
              className="bg-green-700 hover:bg-green-800"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
