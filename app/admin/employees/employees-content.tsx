"use client"

import { useMemo, useState, useRef } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Filter,
  Trash2,
  Plus,
  Search,
  SlidersHorizontal,
  FileText,
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
  Hash,
  CreditCard,
  GraduationCap,
  Shield,
  User,
  IdCard,
  Printer,
  Download,
  Edit,
  Eye,
  X,
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

interface PayslipData {
  employee: {
    name: string;
    ippisNumber: string;
    ministry: string;
    designation: string;
    department: string;
    dateOfFirstAppointment: string;
    dateOfBirth: string;
    tradeUnion: string;
    grade: string;
    step: string;
    gender: string;
    taxState: string;
  };
  bank: {
    name: string;
    branch: string;
    accountNumber: string;
  };
  pension: {
    pfaName: string;
    pin: string;
  };
  earnings: Array<{
    description: string;
    amount: number;
  }>;
  deductions: Array<{
    description: string;
    amount: number;
  }>;
  summary: {
    grossEarnings: number;
    totalDeductions: number;
    netSalary: number;
  };
  cumulative: {
    tax: number;
    income: number;
    pension: number;
    nhf: number;
  };
}

export default function EmployeesContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(100);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
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

  // Handle edit employee - just opens the modal
  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditDialog(true);
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

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearchTerm = !searchTerm.trim()
        ? true
        : [employee.name, employee.email, employee.department, employee.position, employee.registration_id]
            .filter(Boolean)
            .some((value) => value!.toString().toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = employee.status === statusFilter;
      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;

      const matchesAdvanced = Object.entries(advancedSearchParams).every(([key, rawValue]) => {
        const queryValue = rawValue?.toString().trim().toLowerCase();
        if (!queryValue) return true;
        const itemValue = employee[key as keyof Employee];
        if (itemValue == null) return false;

        if (key === "join_date") {
          const dateValue = new Date(itemValue as string);
          if (Number.isNaN(dateValue.getTime())) {
            return false;
          }
          const normalizedDate = dateValue.toISOString().slice(0, 10);
          return normalizedDate === queryValue;
        }

        return itemValue.toString().toLowerCase().includes(queryValue);
      });

      return matchesSearchTerm && matchesStatus && matchesDepartment && matchesAdvanced;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter, advancedSearchParams]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get payslip data from API
  const getPayslipData = async (employeeId: string): Promise<PayslipData | null> => {
    try {
      const response = await fetch(`/api/admin/employees/${employeeId}/payslip`);
      if (!response.ok) {
        throw new Error('Failed to fetch payslip data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payslip data:', error);
      // Return null if API fails, we'll handle this in the print function
      return null;
    }
  };

  // Generate payslip data from employee data
  const generatePayslipData = (employee: Employee): PayslipData => {
    // Extract data from employee metadata or use defaults
    const metadata = employee.metadata || {};
    
    // Earnings data - using actual metadata values when available
    const basicSalary = parseFloat(metadata["Basic Salary"]) || 171690.17;
    const housingAllowance = parseFloat(metadata["Housing Allowance"]) || 50000;
    const transportAllowance = parseFloat(metadata["Transport Allowance"]) || 20000;
    const otherAllowances = parseFloat(metadata["Other Allowances"]) || 21141;
    
    const grossEarnings = basicSalary + housingAllowance + transportAllowance + otherAllowances;
    
    // Deductions data - using actual metadata values when available
    const tax = parseFloat(metadata["Tax"]) || 20377.84;
    const pension = parseFloat(metadata["Pension"]) || 13735.21;
    const nhf = parseFloat(metadata["NHF"]) || 4292.25;
    const unionDues = parseFloat(metadata["Union Dues"]) || 1337.47;
    
    const totalDeductions = tax + pension + nhf + unionDues;
    const netSalary = grossEarnings - totalDeductions;

    // Cumulative data
    const cumulativeTax = parseFloat(metadata["Cumulative Tax"]) || 183400.56;
    const cumulativeIncome = parseFloat(metadata["Cumulative Income"]) || 2119548.98;
    const cumulativePension = parseFloat(metadata["Cumulative Pension"]) || 609222.03;
    const cumulativeNHF = parseFloat(metadata["Cumulative NHF"]) || 38630.25;

    return {
      employee: {
        name: employee.name,
        ippisNumber: employee.registration_id || metadata["IPPIS Number"] || "Not assigned",
        ministry: metadata["Ministry"] || "Office Of The Auditor General Of The Federation-Oaugef",
        designation: employee.position,
        department: employee.department,
        dateOfFirstAppointment: metadata["Date of First Appointment"] || "08-DEC-2017",
        dateOfBirth: metadata["Date of Birth"] || "21-JUL-1983",
        tradeUnion: metadata["Trade Union"] || "ASSOCIATION OF SENIOR CIVIL SERVANT OF NIGERIA",
        grade: metadata["Grade"] || "SL10_CONPSS",
        step: metadata["Step"] || "7",
        gender: metadata["Gender"] || "Male",
        taxState: metadata["Tax State"] || "FCT (ABUJA)"
      },
      bank: {
        name: metadata["Bank Name"] || "FIRST BANK OF NIGERIA PLC",
        branch: metadata["Bank Branch"] || "UVO BRANCH",
        accountNumber: metadata["Account Number"] || "2042994547"
      },
      pension: {
        pfaName: metadata["PFA Name"] || "Leadway Pensure PFA Limited",
        pin: metadata["RSA PIN"] || "PEN200850444611"
      },
      earnings: [
        { description: "Basic Salary", amount: basicSalary },
        { description: "Housing Allowance", amount: housingAllowance },
        { description: "Transport Allowance", amount: transportAllowance },
        { description: "Other Allowances", amount: otherAllowances }
      ],
      deductions: [
        { description: "Tax", amount: tax },
        { description: "Pension", amount: pension },
        { description: "NHF", amount: nhf },
        { description: "Union Dues", amount: unionDues }
      ],
      summary: {
        grossEarnings,
        totalDeductions,
        netSalary
      },
      cumulative: {
        tax: cumulativeTax,
        income: cumulativeIncome,
        pension: cumulativePension,
        nhf: cumulativeNHF
      }
    };
  };

  const handlePrint = async () => {
    if (!selectedEmployee) return;

    try {
      // Try to get payslip data from API first
      let payslipData = await getPayslipData(selectedEmployee.id);
      
      // If API fails, generate from employee data
      if (!payslipData) {
        payslipData = generatePayslipData(selectedEmployee);
      }

      const currentDate = new Date();
      const monthYear = currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }).toUpperCase();

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Employee Payslip - ${selectedEmployee.name}</title>
              <style>
                /* Reset and base styles */
                * { 
                  margin: 0; 
                  padding: 0; 
                  box-sizing: border-box; 
                }
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  margin: 20px;
                  color: #333;
                  background: white;
                  line-height: 1.4;
                  font-size: 12px;
                }
                
                /* Header section */
                .payslip-header { 
                  text-align: center;
                  border-bottom: 3px double #2c5aa0;
                  padding-bottom: 15px;
                  margin-bottom: 20px;
                }
                .government-title { 
                  font-size: 16px;
                  font-weight: bold;
                  color: #2c5aa0;
                  margin-bottom: 5px;
                  text-transform: uppercase;
                }
                .payslip-title { 
                  font-size: 14px;
                  font-weight: bold;
                  color: #d40000;
                  margin-bottom: 5px;
                  text-transform: uppercase;
                }
                .period { 
                  font-size: 13px;
                  font-weight: bold;
                  color: #2c5aa0;
                }
                
                /* Employee info sections */
                .section { 
                  margin-bottom: 15px;
                  border: 1px solid #ddd;
                  border-radius: 4px;
                  overflow: hidden;
                }
                .section-header { 
                  background: #2c5aa0;
                  color: white;
                  padding: 6px 10px;
                  font-weight: bold;
                  font-size: 11px;
                }
                .section-content { 
                  padding: 8px 10px;
                }
                
                /* Grid layouts */
                .grid-2 { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 15px;
                }
                .grid-3 { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr 1fr; 
                  gap: 10px;
                }
                
                /* Info rows */
                .info-row {
                  display: flex;
                  margin-bottom: 4px;
                }
                .info-label {
                  font-weight: bold;
                  min-width: 140px;
                  color: #555;
                }
                .info-value {
                  flex: 1;
                  color: #333;
                }
                
                /* Tables */
                .earnings-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 10px 0;
                }
                .earnings-table th {
                  background: #f0f0f0;
                  border: 1px solid #ddd;
                  padding: 6px;
                  text-align: left;
                  font-weight: bold;
                  font-size: 10px;
                }
                .earnings-table td {
                  border: 1px solid #ddd;
                  padding: 6px;
                  font-size: 10px;
                }
                .earnings-table .total-row {
                  background: #f8f8f8;
                  font-weight: bold;
                }
                
                /* Summary sections */
                .summary-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-top: 10px;
                }
                .summary-box {
                  border: 1px solid #ddd;
                  border-radius: 4px;
                  padding: 8px;
                }
                .summary-box h4 {
                  background: #2c5aa0;
                  color: white;
                  padding: 4px 8px;
                  margin: -8px -8px 8px -8px;
                  font-size: 11px;
                  text-align: center;
                }
                
                /* Totals */
                .total-amount {
                  font-weight: bold;
                  color: #2c5aa0;
                  font-size: 11px;
                }
                
                /* Footer */
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  padding-top: 10px;
                  border-top: 2px solid #2c5aa0;
                  font-style: italic;
                  color: #666;
                  font-size: 10px;
                }
                
                /* Print-specific styles */
                @media print {
                  body { 
                    margin: 0.3in;
                    font-size: 10pt;
                  }
                  .no-print { 
                    display: none !important; 
                  }
                  .section {
                    page-break-inside: avoid;
                  }
                  .payslip-header {
                    border-bottom: 3px double #2c5aa0 !important;
                  }
                }
                
                /* Utility classes */
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .text-bold { font-weight: bold; }
                .mb-2 { margin-bottom: 8px; }
                .mt-2 { margin-top: 8px; }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 15px; text-align: center; color: #666; font-size: 10px;">
                Generated from Employee Management System - ${new Date().toLocaleDateString()}
              </div>
              
              <!-- Payslip Header -->
              <div class="payslip-header">
                <div class="government-title">FEDERAL GOVERNMENT OF NIGERIA</div>
                <div class="payslip-title">EMPLOYEE PAYSLIP</div>
                <div class="period">${monthYear}</div>
              </div>

              <!-- Employee Personal Information -->
              <div class="section">
                <div class="section-header">EMPLOYEE INFORMATION</div>
                <div class="section-content">
                  <div class="grid-2">
                    <div>
                      <div class="info-row">
                        <span class="info-label">Employee Name:</span>
                        <span class="info-value">${payslipData.employee.name}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">IPPIS Number:</span>
                        <span class="info-value">${payslipData.employee.ippisNumber}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Ministry:</span>
                        <span class="info-value">${payslipData.employee.ministry}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Designation:</span>
                        <span class="info-value">${payslipData.employee.designation}</span>
                      </div>
                    </div>
                    <div>
                      <div class="info-row">
                        <span class="info-label">Date of First Appt:</span>
                        <span class="info-value">${payslipData.employee.dateOfFirstAppointment}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Date of Birth:</span>
                        <span class="info-value">${payslipData.employee.dateOfBirth}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Trade Union:</span>
                        <span class="info-value">${payslipData.employee.tradeUnion}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Grade/Step:</span>
                        <span class="info-value">${payslipData.employee.grade} / ${payslipData.employee.step}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bank & Pension Information -->
              <div class="section">
                <div class="section-header">BANK & PENSION INFORMATION</div>
                <div class="section-content">
                  <div class="grid-2">
                    <div>
                      <div class="info-row text-bold" style="margin-bottom: 6px;">Bank Details</div>
                      <div class="info-row">
                        <span class="info-label">Bank Name:</span>
                        <span class="info-value">${payslipData.bank.name}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Bank Branch:</span>
                        <span class="info-value">${payslipData.bank.branch}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Account Number:</span>
                        <span class="info-value">${payslipData.bank.accountNumber}</span>
                      </div>
                    </div>
                    <div>
                      <div class="info-row text-bold" style="margin-bottom: 6px;">Pension Details</div>
                      <div class="info-row">
                        <span class="info-label">PFA Name:</span>
                        <span class="info-value">${payslipData.pension.pfaName}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Pension PIN:</span>
                        <span class="info-value">${payslipData.pension.pin}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Earnings & Deductions -->
              <div class="section">
                <div class="section-header">EARNINGS & DEDUCTIONS</div>
                <div class="section-content">
                  <div class="grid-2">
                    <!-- Earnings -->
                    <div>
                      <table class="earnings-table">
                        <thead>
                          <tr>
                            <th colspan="2">GROSS EARNINGS</th>
                          </tr>
                          <tr>
                            <th>Earnings</th>
                            <th class="text-right">Amount (₦)</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${payslipData.earnings.map(earning => `
                            <tr>
                              <td>${earning.description}</td>
                              <td class="text-right">${formatCurrency(earning.amount)}</td>
                            </tr>
                          `).join('')}
                          <tr class="total-row">
                            <td><strong>Total Gross Earnings</strong></td>
                            <td class="text-right total-amount">${formatCurrency(payslipData.summary.grossEarnings)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <!-- Deductions -->
                    <div>
                      <table class="earnings-table">
                        <thead>
                          <tr>
                            <th colspan="2">DEDUCTIONS</th>
                          </tr>
                          <tr>
                            <th>Deductions</th>
                            <th class="text-right">Amount (₦)</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${payslipData.deductions.map(deduction => `
                            <tr>
                              <td>${deduction.description}</td>
                              <td class="text-right">${formatCurrency(deduction.amount)}</td>
                            </tr>
                          `).join('')}
                          <tr class="total-row">
                            <td><strong>Total Deductions</strong></td>
                            <td class="text-right total-amount">${formatCurrency(payslipData.summary.totalDeductions)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary & Cumulative Balances -->
              <div class="section">
                <div class="section-header">SUMMARY & CUMULATIVE BALANCES</div>
                <div class="section-content">
                  <div class="summary-grid">
                    <!-- Payment Summary -->
                    <div class="summary-box">
                      <h4>SUMMARY OF PAYMENTS</h4>
                      <div class="info-row">
                        <span class="info-label">Total Gross Earnings:</span>
                        <span class="info-value text-right">${formatCurrency(payslipData.summary.grossEarnings)}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Total Deductions:</span>
                        <span class="info-value text-right">${formatCurrency(payslipData.summary.totalDeductions)}</span>
                      </div>
                      <div class="info-row text-bold mt-2" style="border-top: 1px solid #ddd; padding-top: 4px;">
                        <span class="info-label">NET SALARY:</span>
                        <span class="info-value text-right total-amount">${formatCurrency(payslipData.summary.netSalary)}</span>
                      </div>
                    </div>
                    
                    <!-- Cumulative Balances -->
                    <div class="summary-box">
                      <h4>CUMULATIVE BALANCES</h4>
                      <div class="info-row">
                        <span class="info-label">Cumulative Tax:</span>
                        <span class="info-value text-right">${formatCurrency(payslipData.cumulative.tax)}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Cumulative Income:</span>
                        <span class="info-value text-right">${formatCurrency(payslipData.cumulative.income)}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Cumulative Pension:</span>
                        <span class="info-value text-right">${formatCurrency(payslipData.cumulative.pension)}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Cumulative NHF:</span>
                        <span class="info-value text-right">${formatCurrency(payslipData.cumulative.nhf)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                *Generated By : Powered by WALPBERRY is okay don't put consultant*
              </div>

              <div class="no-print" style="margin-top: 20px; text-align: center; color: #666; font-size: 10px;">
                Confidential Employee Document - Generated on ${new Date().toLocaleDateString()}
              </div>

              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }
                
                function formatCurrency(amount) {
                  return new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                    minimumFractionDigits: 2
                  }).format(amount);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error generating payslip:', error);
      toast.error("Error", {
        description: "Failed to generate payslip. Please try again.",
      });
    }
  };


  const handleDownloadPDF = async () => {
    if (!selectedEmployee) return;

    try {
   toast.info("Feature Coming Soon", {
        description: "PDF download functionality will be available soon.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error("Error", {
        description: "Failed to download PDF. Please try again.",
      });
    }
  };

  
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
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
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
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
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <div className="w-full sm:w-[180px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-[180px]">
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

          <div className="w-full overflow-x-auto rounded-md [-webkit-overflow-scrolling:touch]">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Uploaded Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 text-gray-500 animate-spin mr-2" />
                        <span>Loading employees...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
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
                       <TableCell className="text-center">{employee.uploaded_documents || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(employee)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

         <div className="mt-5 flex h-fit w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div className="mb-2 flex items-center justify-end sm:mb-0">
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
    <div className="mt-2 flex items-center justify-end sm:mt-0">
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
        <DialogContent className="p-0 max-w-3xl overflow-hidden border border-gray-200 shadow-xl">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <User className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Employee Details
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    Complete information for {selectedEmployee?.name}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowViewDialog(false)}
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedEmployee && (
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Employee Information</h3>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Employee Name</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12 border border-blue-100">
                              <AvatarImage
                                src={`/abstract-geometric-shapes.png?key=n1gxi&height=48&width=48&query=${encodeURIComponent(
                                  selectedEmployee.name
                                )}`}
                                alt={selectedEmployee.name}
                              />
                              <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
                                {selectedEmployee.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{selectedEmployee.name}</p>
                              <p className="text-xs text-gray-500">{selectedEmployee.email}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center mb-2">
                            <Hash className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Employee ID</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 font-mono">{selectedEmployee.id}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <Building className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-xs text-gray-500 font-medium">Department & Position</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{selectedEmployee.department}</p>
                          <p className="text-xs text-gray-500">{selectedEmployee.position || "Not specified"}</p>
                        </div>

                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-xs text-gray-500 font-medium">Status</span>
                          </div>
                          {getStatusBadge(selectedEmployee.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-6">Employee Details</h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center mb-2">
                          <Mail className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-xs text-gray-500 font-medium">Contact</span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                          <p className="text-sm text-gray-700"><span className="font-medium">Email:</span> {selectedEmployee.email || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Phone:</span> {selectedEmployee.metadata?.["Phone Number"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Address:</span> {selectedEmployee.metadata?.["Residential Address"] || "N/A"}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-xs text-gray-500 font-medium">Employment</span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                          <p className="text-sm text-gray-700"><span className="font-medium">Registration ID:</span> {selectedEmployee.registration_id || "Not assigned"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Join Date:</span> {formatDate(selectedEmployee.join_date)}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Work Location:</span> {selectedEmployee.metadata?.["Work Location"] || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 font-medium">Additional Information</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <p className="text-sm text-gray-700"><span className="font-medium">Gender:</span> {selectedEmployee.metadata?.Gender || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Marital Status:</span> {selectedEmployee.metadata?.["Marital Status"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">State of Origin:</span> {selectedEmployee.metadata?.["State of Origin"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">State of Residence:</span> {selectedEmployee.metadata?.["State of Residence"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Bank Name:</span> {selectedEmployee.metadata?.["Bank Name"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Account Number:</span> {selectedEmployee.metadata?.["Account Number"] || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Created At</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedEmployee.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Last Updated</p>
                          <p className="text-sm text-gray-600">{formatSimpleDate(selectedEmployee.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="px-8 py-5 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Employee Slip
                </Button>
                <Button
                  onClick={handleDownloadPDF} 
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog - UI Only */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Employee
            </DialogTitle>
            <DialogDescription>
              Update the details for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstname" className="text-sm font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-firstname"
                    defaultValue={selectedEmployee.metadata?.FirstName || ""}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-surname" className="text-sm font-medium">
                    Surname <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-surname"
                    defaultValue={selectedEmployee.metadata?.Surname || ""}
                    placeholder="Enter surname"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  defaultValue={selectedEmployee.email}
                  placeholder="Enter email address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-department" className="text-sm font-medium">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select defaultValue={selectedEmployee.department}>
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="edit-position" className="text-sm font-medium">
                    Position <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-position"
                    defaultValue={selectedEmployee.position}
                    placeholder="Enter position"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-medium">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select defaultValue={selectedEmployee.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Metadata Fields */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-4">Additional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="edit-phone"
                      defaultValue={selectedEmployee.metadata?.["Phone Number"] || ""}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender" className="text-sm font-medium">
                      Gender
                    </Label>
                    <Select defaultValue={selectedEmployee.metadata?.Gender || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="edit-address" className="text-sm font-medium">
                    Residential Address
                  </Label>
                  <Input
                    id="edit-address"
                    defaultValue={selectedEmployee.metadata?.["Residential Address"] || ""}
                    placeholder="Enter residential address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-bank" className="text-sm font-medium">
                      Bank Name
                    </Label>
                    <Input
                      id="edit-bank"
                      defaultValue={selectedEmployee.metadata?.["Bank Name"] || ""}
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-account" className="text-sm font-medium">
                      Account Number
                    </Label>
                    <Input
                      id="edit-account"
                      defaultValue={selectedEmployee.metadata?.["Account Number"] || ""}
                      placeholder="Enter account number"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4 border-t">
            <div className="flex gap-2 w-full justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Update Employee
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
