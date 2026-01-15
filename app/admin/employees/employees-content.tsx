"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Filter,
  Trash2,
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
  Download,
  Edit,
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
  const [statusFilter, setStatusFilter] = useState("all");
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
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
                       <TableCell className="text-center">{employee.uploaded_documents || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(employee)}
                            title="View Details"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(employee)}
                            title="Edit"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStatusChange(employee.id, "active", employee.name)}
                            title="Set Active"
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStatusChange(employee.id, "pending", employee.name)}
                            title="Set Pending"
                            className="text-amber-600 hover:text-amber-800"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStatusChange(employee.id, "inactive", employee.name)}
                            title="Set Inactive"
                            className="text-red-600 hover:text-red-800"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(employee)}
                            title="Delete"
                            className="text-red-600 hover:text-red-800"
                          >
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
                    <Label className="text-sm text-gray-600">Registration ID (IPPIS)</Label>
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

              {/* Next of Kin Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Next of Kin Information</h4>
                <div className="grid grid-cols-2 gap-4">
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

              {/* Education */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b pb-2">Education</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Certifications</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.Certifications || "Not provided"}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Educational Background</Label>
                    <div className="text-sm mt-1">{selectedEmployee.metadata?.EducationalBackground || "Not provided"}</div>
                  </div>
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
              <div className="flex gap-2">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
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
