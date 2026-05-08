"use client"

import { useMemo, useState, useRef } from "react"
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
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
  ShieldAlert,
  User,
  AlertCircle,
  IdCard,
  Printer,
  Download,
  Edit,
  Eye,
  X,
  XCircle,
  RefreshCw,
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
import { EnhancedDataTable } from "@/app/admin/components/enhanced-data-table"
import { Employee } from "@/types/employees/employee-management"
import { useEmployeesList, useAddEmployee } from "@/services/hooks/employees/useEmployees"
import { AddEmployeePayload } from "@/types/employees/employee-management"
import { buttonHoverEnhancements } from "./button-hover"
import { downloadEmployeeDetailsPdf } from "./employee-details-pdf"
import { nigerianStates, getLgasByState } from "@/app/register/nigeria-data"
import {
  getCadreOptions,
  getCadreForGradeLevel,
  getGradeLevelOptions,
  getStepOptions,
  salaryStructureOptions,
} from "@/lib/register-salary-structure"
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
  const [itemsPerPage] = useState(1000);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [newEmployee, setNewEmployee] = useState<AddEmployeePayload>({
    firstname: "",
    surname: "",
    email: "",
    department: "",
    position: "",
    nin: "",
    middlename: "",
    gender: "",
    telephoneno: "",
    birthdate: "",
    state_of_origin: "",
    residence_address: "",
    residence_state: "",
    residence_lga: "",
    profession: "",
    maritalstatus: "",
    title: "",
    next_of_kin_name: "",
    next_of_kin_relationship: "",
    next_of_kin_phone_number: "",
    next_of_kin_address: "",
    employment_id_no: "",
    service_no: "",
    file_no: "",
    rank_position: "",
    organization: "",
    employment_type: "",
    probation_period: "",
    work_location: "",
    date_of_first_appointment: "",
    grade_level: "",
    salary_structure: "",
    step: "",
    cadre: "",
    bank_name: "",
    account_number: "",
    pfa_name: "",
    rsapin: "",
    rsa_pin: "",
    educational_background: "",
    certifications: "",
    nuban_account_number: "",
  });
  const [addEmployeeErrors, setAddEmployeeErrors] = useState<Record<string, string>>({});

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

  const updateEmployeeField = <K extends keyof AddEmployeePayload>(
    field: K,
    value: AddEmployeePayload[K]
  ) => {
    setNewEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (addEmployeeErrors[String(field)]) {
      setAddEmployeeErrors((prev) => {
        const next = { ...prev };
        delete next[String(field)];
        return next;
      });
    }
  };

  const requiredLabel = (label: string) => (
    <>
      {label} <span className="text-red-500">*</span>
    </>
  );

  const addEmployeeFieldClassName = (field: string) =>
    addEmployeeErrors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  const renderFieldError = (field: string) =>
    addEmployeeErrors[field] ? (
      <p className="text-red-500 text-xs mt-1">{addEmployeeErrors[field]}</p>
    ) : null;

  const availableResidenceLgas = useMemo(
    () => getLgasByState(newEmployee.residence_state),
    [newEmployee.residence_state]
  );

  const availableGradeLevels = useMemo(
    () => getGradeLevelOptions(newEmployee.salary_structure || ""),
    [newEmployee.salary_structure]
  );

  const availableStepOptions = useMemo(
    () => getStepOptions(newEmployee.salary_structure || "", newEmployee.grade_level || ""),
    [newEmployee.salary_structure, newEmployee.grade_level]
  );

  const availableCadreOptions = useMemo(
    () => getCadreOptions(newEmployee.salary_structure || ""),
    [newEmployee.salary_structure]
  );

  const derivedCadre = useMemo(
    () => getCadreForGradeLevel(newEmployee.salary_structure || "", newEmployee.grade_level || ""),
    [newEmployee.salary_structure, newEmployee.grade_level]
  );

  const updateResidenceState = (value: string) => {
    updateEmployeeField("residence_state", value);
    updateEmployeeField("residence_lga", "");
  };

  const updateEmploymentField = (
    field:
      | "employment_id_no"
      | "service_no"
      | "file_no"
      | "rank_position"
      | "organization"
      | "employment_type"
      | "probation_period"
      | "work_location"
      | "date_of_first_appointment"
      | "grade_level"
      | "salary_structure"
      | "step"
      | "cadre"
      | "bank_name"
      | "account_number"
      | "pfa_name"
      | "rsapin"
      | "rsa_pin"
      | "educational_background"
      | "certifications"
      | "nuban_account_number",
    value: string
  ) => {
    if (field === "salary_structure") {
      updateEmployeeField("salary_structure", value);
      updateEmployeeField("grade_level", "");
      updateEmployeeField("step", "");
      updateEmployeeField("cadre", "");
      return;
    }

    if (field === "grade_level") {
      updateEmployeeField("grade_level", value);
      updateEmployeeField("step", "");
      if (newEmployee.salary_structure) {
        updateEmployeeField("cadre", "");
      }
      return;
    }

    updateEmployeeField(field, value);
    if (field === "account_number") {
      updateEmployeeField("nuban_account_number", value);
    }
    if (field === "nuban_account_number") {
      updateEmployeeField("account_number", value);
    }
    if (field === "rsapin") {
      updateEmployeeField("rsa_pin", value);
    }
  };

  const getAddEmployeeErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    return (
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      (axiosError.message === "Network Error"
        ? "Unable to reach the server. Please check your connection and try again."
        : axiosError.message) ||
      "Failed to add employee. Please try again."
    );
  };

  const validateAddEmployeeForm = () => {
    const nextErrors: Record<string, string> = {};
    const requiredFields: Array<[keyof AddEmployeePayload, string, () => string]> = [
      ["firstname", "First name is required.", () => newEmployee.firstname ?? ""],
      ["surname", "Surname is required.", () => newEmployee.surname ?? ""],
      ["email", "Email is required.", () => newEmployee.email ?? ""],
      ["department", "Department is required.", () => newEmployee.department ?? ""],
      ["position", "Position is required.", () => newEmployee.position ?? ""],
      ["nin", "NIN is required.", () => newEmployee.nin ?? ""],
      ["middlename", "Middle name is required.", () => newEmployee.middlename ?? ""],
      ["gender", "Gender is required.", () => newEmployee.gender ?? ""],
      ["telephoneno", "Telephone number is required.", () => newEmployee.telephoneno ?? ""],
      ["birthdate", "Birth date is required.", () => newEmployee.birthdate ?? ""],
      ["state_of_origin", "State of origin is required.", () => newEmployee.state_of_origin ?? ""],
      ["residence_address", "Residential address is required.", () => newEmployee.residence_address ?? ""],
      ["residence_state", "State of residence is required.", () => newEmployee.residence_state ?? ""],
      ["residence_lga", "Local government area is required.", () => newEmployee.residence_lga ?? ""],
      ["profession", "Profession is required.", () => newEmployee.profession ?? ""],
      ["maritalstatus", "Marital status is required.", () => newEmployee.maritalstatus ?? ""],
      ["title", "Title is required.", () => newEmployee.title ?? ""],
      ["next_of_kin_name", "Next of kin name is required.", () => newEmployee.next_of_kin_name ?? ""],
      ["next_of_kin_relationship", "Next of kin relationship is required.", () => newEmployee.next_of_kin_relationship ?? ""],
      ["next_of_kin_phone_number", "Next of kin phone number is required.", () => newEmployee.next_of_kin_phone_number ?? ""],
      ["next_of_kin_address", "Next of kin address is required.", () => newEmployee.next_of_kin_address ?? ""],
      ["employment_id_no", "Employment ID No is required.", () => newEmployee.employment_id_no ?? ""],
      ["service_no", "Service No is required.", () => newEmployee.service_no ?? ""],
      ["file_no", "File No is required.", () => newEmployee.file_no ?? ""],
      ["rank_position", "Rank/Position is required.", () => newEmployee.rank_position ?? ""],
      ["organization", "Organization is required.", () => newEmployee.organization ?? ""],
      ["employment_type", "Employment Type is required.", () => newEmployee.employment_type ?? ""],
      ["probation_period", "Probation period is required.", () => newEmployee.probation_period ?? ""],
      ["work_location", "Work location is required.", () => newEmployee.work_location ?? ""],
      ["date_of_first_appointment", "Date of first appointment is required.", () => newEmployee.date_of_first_appointment ?? ""],
      ["grade_level", "Grade level is required.", () => newEmployee.grade_level ?? ""],
      ["salary_structure", "Salary structure is required.", () => newEmployee.salary_structure ?? ""],
      ["step", "Step is required.", () => newEmployee.step ?? ""],
      ["cadre", "Cadre is required.", () => newEmployee.cadre || derivedCadre || ""],
      ["bank_name", "Bank name is required.", () => newEmployee.bank_name ?? ""],
      ["account_number", "Account number is required.", () => newEmployee.account_number ?? ""],
      ["nuban_account_number", "NUBAN account number is required.", () => newEmployee.nuban_account_number ?? ""],
      ["pfa_name", "PFA name is required.", () => newEmployee.pfa_name ?? ""],
      ["rsapin", "RSA PIN is required.", () => newEmployee.rsapin ?? ""],
      ["educational_background", "Educational background is required.", () => newEmployee.educational_background ?? ""],
      ["certifications", "Certifications are required.", () => newEmployee.certifications ?? ""],
    ];

    requiredFields.forEach(([field, message, getValue]) => {
      const value = getValue ? getValue() : newEmployee[field];
      if (!String(value ?? "").trim()) {
        nextErrors[field] = message;
      }
    });

    setAddEmployeeErrors(nextErrors);
    return nextErrors;
  };

  // Extract employees and pagination from the data
  const employees = employeesData?.employees || [];
  const paginationInfo = employeesData?.pagination || {
    page: currentPage,
    limit: itemsPerPage,
    total: 0,
    totalPages: 0,
  };

  const handleAddEmployee = async () => {
    const validationErrors = validateAddEmployeeForm();
    if (Object.keys(validationErrors).length > 0) {
      const missingFields = Object.values(validationErrors);
      toast.error("Validation Error", {
        description: missingFields.length
          ? `Please fill in: ${missingFields.join(", ")}`
          : "Please fill in every field in the add employee form.",
      });
      return;
    }

    const trimmedFirstname = newEmployee.firstname.trim();
    const trimmedSurname = newEmployee.surname.trim();
    const trimmedEmail = newEmployee.email.trim();
    const trimmedDepartment = newEmployee.department.trim();
    const trimmedPosition = newEmployee.position.trim();

    const normalize = (value?: string | null) => value?.trim() || "";
    const trimmedMiddleName = normalize(newEmployee.middlename);
    const trimmedFullName = [trimmedFirstname, trimmedMiddleName, trimmedSurname].filter(Boolean).join(" ").trim();
    const employmentIdNo = normalize(newEmployee.employment_id_no);
    const serviceNo = normalize(newEmployee.service_no);
    const fileNo = normalize(newEmployee.file_no);
    const rankPosition = normalize(newEmployee.rank_position);
    const organization = normalize(newEmployee.organization);
    const employmentType = normalize(newEmployee.employment_type);
    const probationPeriod = normalize(newEmployee.probation_period);
    const workLocation = normalize(newEmployee.work_location);
    const dateOfFirstAppointment = normalize(newEmployee.date_of_first_appointment);
    const gradeLevel = normalize(newEmployee.grade_level);
    const salaryStructure = normalize(newEmployee.salary_structure);
    const step = normalize(newEmployee.step);
    const cadre = normalize(newEmployee.cadre) || derivedCadre || "";
    const bankName = normalize(newEmployee.bank_name);
    const accountNumber = normalize(newEmployee.account_number);
    const pfaName = normalize(newEmployee.pfa_name);
    const rsaPin = normalize(newEmployee.rsapin || newEmployee.rsa_pin);
    const educationalBackground = normalize(newEmployee.educational_background);
    const certifications = normalize(newEmployee.certifications);
    const nubanAccountNumber = normalize(newEmployee.nuban_account_number) || accountNumber;
    const metadata = {
      "FirstName": trimmedFirstname,
      "Surname": trimmedSurname,
      "MiddleName": trimmedMiddleName,
      "Title": normalize(newEmployee.title),
      "Gender": normalize(newEmployee.gender),
      "Phone Number": normalize(newEmployee.telephoneno),
      "Birthdate": normalize(newEmployee.birthdate),
      "NIN": normalize(newEmployee.nin),
      "State of Origin": normalize(newEmployee.state_of_origin),
      "Residential Address": normalize(newEmployee.residence_address),
      "State of Residence": normalize(newEmployee.residence_state),
      "LGA": normalize(newEmployee.residence_lga),
      "Profession": normalize(newEmployee.profession),
      "Marital Status": normalize(newEmployee.maritalstatus),
      "Next of Kin Name": normalize(newEmployee.next_of_kin_name),
      "Next of Kin Relationship": normalize(newEmployee.next_of_kin_relationship),
      "Next of Kin Phone Number": normalize(newEmployee.next_of_kin_phone_number),
      "Next of Kin Address": normalize(newEmployee.next_of_kin_address),
      "Employment ID No": employmentIdNo,
      "Service No": serviceNo,
      "File No": fileNo,
      "Rank/Position": rankPosition,
      "Organization": organization,
      "Employment Type": employmentType,
      "Probation Period": probationPeriod,
      "Work Location": workLocation,
      "Bank Name": bankName,
      "Account Number": accountNumber,
      "PFA Name": pfaName,
      "RSA PIN": rsaPin,
      "Grade Level": gradeLevel,
      "Salary Structure": salaryStructure,
      "Cadre": cadre,
      "step": step,
      "Date of First Appointment": dateOfFirstAppointment,
      "Educational Background": educationalBackground,
      "Certifications": certifications,
    };

    const payload: AddEmployeePayload = {
      firstname: trimmedFirstname,
      surname: trimmedSurname,
      name: trimmedFullName,
      first_name: trimmedFirstname,
      firstName: trimmedFirstname,
      last_name: trimmedSurname,
      lastName: trimmedSurname,
      email: trimmedEmail,
      department: trimmedDepartment,
      position: trimmedPosition,
      nin: normalize(newEmployee.nin),
      middlename: normalize(newEmployee.middlename),
      gender: normalize(newEmployee.gender),
      telephoneno: normalize(newEmployee.telephoneno),
      birthdate: normalize(newEmployee.birthdate),
      state_of_origin: normalize(newEmployee.state_of_origin),
      residence_address: normalize(newEmployee.residence_address),
      residence_state: normalize(newEmployee.residence_state),
      residence_lga: normalize(newEmployee.residence_lga),
      profession: normalize(newEmployee.profession),
      maritalstatus: normalize(newEmployee.maritalstatus),
      title: normalize(newEmployee.title),
      next_of_kin_name: normalize(newEmployee.next_of_kin_name),
      next_of_kin_relationship: normalize(newEmployee.next_of_kin_relationship),
      next_of_kin_phone_number: normalize(newEmployee.next_of_kin_phone_number),
      next_of_kin_address: normalize(newEmployee.next_of_kin_address),
      employment_id_no: employmentIdNo,
      employmentIdNo,
      service_no: serviceNo,
      serviceNo,
      file_no: fileNo,
      fileNo,
      rank_position: rankPosition,
      rankPosition,
      organization,
      employment_type: employmentType,
      employmentType,
      probation_period: probationPeriod,
      probationPeriod,
      work_location: workLocation,
      date_of_first_appointment: dateOfFirstAppointment,
      grade_level: gradeLevel,
      salary_structure: salaryStructure,
      step,
      cadre: cadre,
      bank_name: bankName,
      account_number: accountNumber,
      pfa_name: pfaName,
      rsapin: rsaPin,
      rsa_pin: rsaPin,
      educational_background: educationalBackground,
      certifications: certifications,
      nuban_account_number: nubanAccountNumber,
      metadata,
    };

    try {
      await addEmployeeMutation.mutateAsync(payload, {
        onSuccess: (data) => {
          setShowAddDialog(false);
          setNewEmployee({
            firstname: "",
            surname: "",
            email: "",
            department: "",
            position: "",
            nin: "",
            middlename: "",
            gender: "",
            telephoneno: "",
            birthdate: "",
            state_of_origin: "",
            residence_address: "",
            residence_state: "",
            residence_lga: "",
            profession: "",
            maritalstatus: "",
            title: "",
    next_of_kin_name: "",
    next_of_kin_relationship: "",
    next_of_kin_phone_number: "",
    next_of_kin_address: "",
    employment_id_no: "",
    service_no: "",
    file_no: "",
    rank_position: "",
    organization: "",
    employment_type: "",
    probation_period: "",
    work_location: "",
    date_of_first_appointment: "",
    grade_level: "",
            salary_structure: "",
            step: "",
            cadre: "",
            bank_name: "",
            account_number: "",
            pfa_name: "",
            rsapin: "",
            rsa_pin: "",
            educational_background: "",
            certifications: "",
            nuban_account_number: "",
          });

          // Refetch the employees list to include the new employee
          refetch();

          toast.success("Success", {
            description: data.message || "Employee has been added successfully.",
          });
        },
        onError: (error: Error) => {
          console.error("Failed to add employee:", error);
          const errorMessage = getAddEmployeeErrorMessage(error);
          if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("exist")) {
            setAddEmployeeErrors((prev) => ({
              ...prev,
              email: errorMessage,
            }));
          }
          toast.error("Error", {
            description: errorMessage,
          });
        }
      });
    } catch (error) {
      // Error is handled in onError callback
      console.error("Failed to add employee:", error);
    }
  };

  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);

  const closeDeleteDialog = () => {
    setIsDeleteConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  const deleteSelectedEmployee = async () => {
    if (!employeeToDelete) {
      return;
    }

    setIsDeletePending(true);
    try {
      const response = await fetch(`/api/admin/employees/${employeeToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete employee");
      }

      refetch();

      toast.success("Success", {
        description: `Employee ${employeeToDelete.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast.error("Error", {
        description: error instanceof Error
          ? error.message
          : "Failed to delete employee. Please try again.",
      });
    } finally {
      setIsDeletePending(false);
      closeDeleteDialog();
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
    setEmployeeToDelete(employee);
    setIsDeleteConfirmOpen(true);
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
        step: metadata["step"] || metadata["Step"] || "7",
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
      const logoUrl = `${window.location.origin}/images/ippis-logo.jpeg`;

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
                @page {
                  size: A4;
                  margin: 12mm;
                }
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  margin: 0;
                  padding: 18px;
                  color: #0f172a;
                  background: #eef2f7;
                  line-height: 1.4;
                  font-size: 12px;
                }
                .page {
                  max-width: 940px;
                  margin: 0 auto;
                  background: #ffffff;
                  border: 1px solid #d6deea;
                  border-radius: 20px;
                  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.10);
                  overflow: hidden;
                }
                
                /* Header section */
                .payslip-header { 
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 16px;
                  border-bottom: 1px solid #dbe3ef;
                  padding: 24px 28px 18px;
                  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
                }
                .brand-lockup {
                  display: flex;
                  align-items: center;
                  gap: 16px;
                  min-width: 0;
                }
                .brand-logo {
                  width: 64px;
                  height: 64px;
                  object-fit: contain;
                  border-radius: 16px;
                  background: #f8fafc;
                  border: 1px solid #dbe3ef;
                  padding: 8px;
                }
                .government-title { 
                  font-size: 17px;
                  font-weight: bold;
                  color: #0f172a;
                  letter-spacing: 0.02em;
                }
                .payslip-title { 
                  display: inline-flex;
                  align-items: center;
                  font-size: 12px;
                  font-weight: bold;
                  color: #0f766e;
                  margin-top: 4px;
                  padding: 4px 10px;
                  border: 1px solid #99f6e4;
                  background: #f0fdfa;
                  border-radius: 9999px;
                  text-transform: uppercase;
                  letter-spacing: 0.18em;
                }
                .period { 
                  margin-top: 6px;
                  font-size: 13px;
                  font-weight: bold;
                  color: #334155;
                  letter-spacing: 0.08em;
                }
                .header-meta {
                  min-width: 220px;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                  gap: 8px;
                }
                .meta-pill {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  min-width: 180px;
                  padding: 8px 12px;
                  border-radius: 9999px;
                  background: #f8fafc;
                  border: 1px solid #dbe3ef;
                  color: #334155;
                  font-size: 11px;
                  font-weight: 600;
                }
                
                /* Employee info sections */
                .section { 
                  margin: 18px 28px;
                  border: 1px solid #dbe3ef;
                  border-radius: 18px;
                  overflow: hidden;
                  background: #ffffff;
                }
                .section-header { 
                  background: linear-gradient(90deg, #0f172a 0%, #1d4ed8 100%);
                  color: white;
                  padding: 10px 14px;
                  font-weight: bold;
                  font-size: 11px;
                  letter-spacing: 0.12em;
                  text-transform: uppercase;
                }
                .section-content { 
                  padding: 14px;
                }
                
                /* Grid layouts */
                .grid-2 { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 14px;
                }
                .grid-3 { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr 1fr; 
                  gap: 10px;
                }
                
                /* Info rows */
                .info-row {
                  display: grid;
                  grid-template-columns: minmax(0, 1fr);
                  gap: 4px;
                  margin-bottom: 10px;
                  padding-bottom: 10px;
                  border-bottom: 1px solid #eef2f7;
                }
                .info-label {
                  font-weight: bold;
                  min-width: 0;
                  color: #64748b;
                  font-size: 10px;
                  text-transform: uppercase;
                  letter-spacing: 0.12em;
                }
                .info-value {
                  min-width: 0;
                  color: #0f172a;
                  font-weight: 600;
                  word-break: break-word;
                }
                
                /* Tables */
                .earnings-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 10px 0 0;
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
                  gap: 14px;
                  margin-top: 10px;
                }
                .summary-box {
                  border: 1px solid #dbe3ef;
                  border-radius: 16px;
                  padding: 8px;
                  background: #f8fafc;
                }
                .summary-box h4 {
                  background: #0f172a;
                  color: white;
                  padding: 6px 8px;
                  margin: -8px -8px 8px -8px;
                  font-size: 11px;
                  text-align: center;
                  letter-spacing: 0.12em;
                }
                
                /* Totals */
                .total-amount {
                  font-weight: bold;
                  color: #1d4ed8;
                  font-size: 11px;
                }
                
                /* Footer */
                .footer {
                  text-align: center;
                  margin: 18px 28px 0;
                  padding: 14px 0 18px;
                  border-top: 1px solid #dbe3ef;
                  color: #64748b;
                  font-size: 10px;
                }
                
                /* Print-specific styles */
                @media print {
                  body { 
                    margin: 0;
                    padding: 0;
                    font-size: 10pt;
                    background: white;
                  }
                  .no-print { 
                    display: none !important; 
                  }
                  .section {
                    page-break-inside: avoid;
                  }
                  .page {
                    border: none;
                    border-radius: 0;
                    box-shadow: none;
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
              <div class="page">
                <div class="no-print" style="padding: 16px 28px 0; text-align: center; color: #64748b; font-size: 10px;">
                  Generated from Employee Management System - ${new Date().toLocaleDateString()}
                </div>

                <!-- Payslip Header -->
                <div class="payslip-header">
                  <div class="brand-lockup">
                    <img src="${logoUrl}" alt="IPPIS logo" class="brand-logo" />
                    <div>
                      <div class="government-title">FEDERAL MINISTRY OF FINANCE</div>
                      <div class="payslip-title">EMPLOYEE PAYSLIP</div>
                      <div class="period">${monthYear}</div>
                    </div>
                  </div>
                  <div class="header-meta">
                    <div class="meta-pill">Payslip ID: ${payslipData.employee.ippisNumber || selectedEmployee.id}</div>
                    <div class="meta-pill">Status: ${selectedEmployee.status || "Active"}</div>
                  </div>
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
                Generated by IPPIS Payroll System
              </div>

              <div class="no-print" style="margin: 18px 28px 24px; text-align: center; color: #64748b; font-size: 10px;">
                Confidential Employee Document - Generated on ${new Date().toLocaleDateString()}
              </div>

              </div>

              <script>
                function waitForImages() {
                  const images = Array.from(document.images || []);
                  return Promise.all(
                    images.map((image) => {
                      if (image.complete) {
                        return Promise.resolve();
                      }

                      return new Promise((resolve) => {
                        image.onload = image.onerror = () => resolve();
                      });
                    }),
                  );
                }

                async function prepareAndPrint() {
                  if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                  }

                  await waitForImages();
                  await new Promise((resolve) => setTimeout(resolve, 250));
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 750);
                }

                window.addEventListener('load', function() {
                  prepareAndPrint();
                });
                
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
      await downloadEmployeeDetailsPdf(selectedEmployee)
      toast.success("PDF downloaded successfully", {
        description: `${selectedEmployee.name || "Employee"} details have been downloaded as a PDF.`,
      })
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error("Error", {
        description: "Failed to download PDF. Please try again.",
      });
    }
  };

  
  const exportColumns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Department", accessor: "department" },
    { header: "Position", accessor: "position" },
    { header: "Status", accessor: "status" },
    { header: "Join Date", accessor: "join_date" },
  ];

    const performExport = (type: 'pdf' | 'csv' | 'print') => {
      try {
        const exportOptions = {
          title: "Employees List",
          filename: "employees-list",
          columns: exportColumns,
        };

        if (type === "pdf") {
          ExportService.exportToPDF(employees, exportOptions);
          toast.success("PDF export opened in new window. Use your browser's print dialog to save as PDF!");
        } else if (type === "csv") {
          ExportService.exportToCSV(employees, exportOptions);
          toast.success("CSV file has been generated and downloaded successfully!");
        } else if (type === "print") {
          ExportService.printData(employees, exportOptions);
          toast.success("Print dialog opened!");
        }
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Export failed. Please try again.");
      }
    };

    const handleExportList = () => performExport("csv");

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
  const formatDate = (dateString?: string) => {
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
  const formatSimpleDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const formatEmployeeDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    return formatDate(dateString);
  };

  const formatEmployeeSimpleDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    return formatSimpleDate(dateString);
  };

  const normalizeEmployeeMetadata = (
    metadata: Employee["metadata"] | string | null | undefined
  ): Record<string, string> => {
    if (!metadata) return {};

    if (typeof metadata === "string") {
      try {
        const parsed = JSON.parse(metadata);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return Object.entries(parsed).reduce<Record<string, string>>((acc, [key, value]) => {
            if (value === null || value === undefined) return acc;
            acc[key] = String(value);
            return acc;
          }, {});
        }
      } catch {
        return {};
      }

      return {};
    }

    return Object.entries(metadata).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value === null || value === undefined) return acc;
      acc[key] = String(value);
      return acc;
    }, {});
  };

  const getEmployeeValue = (
    employee: Employee | null,
    keys: string[],
    fallback = "N/A"
  ) => {
    if (!employee) return fallback;

    for (const key of keys) {
      const value = (employee as unknown as Record<string, unknown>)[key];
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        return String(value);
      }
    }

    return fallback;
  };

  const getEmployeeMetadataValue = (
    employee: Employee | null,
    keys: string[],
    fallback = "N/A"
  ) => {
    if (!employee) return fallback;

    const metadata = normalizeEmployeeMetadata(employee.metadata);
    for (const key of keys) {
      const value = metadata[key];
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        return String(value);
      }
    }

    return fallback;
  };

  const buildEmployeeDetailRows = (employee: Employee) => {
    const rows: Array<{
      section: string;
      field: string;
      value: string;
    }> = [];

    const pushSection = (
      section: string,
      fields: Array<{
        field: string;
        value: string;
      }>
    ) => {
      fields.forEach((item) => {
        rows.push({
          section,
          field: item.field,
          value: item.value || "N/A",
        });
      });
    };

    pushSection("Employee Information", [
      { field: "Employee ID", value: getEmployeeValue(employee, ["id", "employee_id"]) },
      { field: "Name", value: getEmployeeValue(employee, ["name", "firstname", "firstName", "first_name"]) },
      { field: "Email", value: getEmployeeValue(employee, ["email"]) },
      { field: "Department", value: getEmployeeValue(employee, ["department"]) },
      { field: "Position", value: getEmployeeValue(employee, ["position"]) },
      { field: "Status", value: getEmployeeValue(employee, ["status"]) },
      { field: "Registration ID", value: getEmployeeValue(employee, ["registration_id"]) },
      { field: "Join Date", value: formatEmployeeSimpleDate(getEmployeeValue(employee, ["join_date", "submission_date"])) },
      { field: "Created At", value: formatEmployeeDate(getEmployeeValue(employee, ["created_at", "createdAt"])) },
      { field: "Updated At", value: formatEmployeeDate(getEmployeeValue(employee, ["updated_at", "updatedAt"])) },
    ]);

    pushSection("Personal Information", [
      { field: "First Name", value: getEmployeeMetadataValue(employee, ["FirstName", "firstName", "firstname"]) },
      { field: "Surname", value: getEmployeeMetadataValue(employee, ["Surname", "lastName", "last_name"]) },
      { field: "Middle Name", value: getEmployeeMetadataValue(employee, ["MiddleName", "middleName", "middlename"]) },
      { field: "Title", value: getEmployeeMetadataValue(employee, ["Title", "title"]) },
      { field: "Gender", value: getEmployeeMetadataValue(employee, ["Gender", "gender"]) },
      { field: "Phone Number", value: getEmployeeMetadataValue(employee, ["Phone Number", "telephoneno", "phone_number"]) },
      { field: "Birthdate", value: getEmployeeMetadataValue(employee, ["Birthdate", "birthdate"]) },
      { field: "Marital Status", value: getEmployeeMetadataValue(employee, ["Marital Status", "maritalstatus"]) },
      { field: "State of Origin", value: getEmployeeMetadataValue(employee, ["State of Origin", "state_of_origin"]) },
      { field: "State of Residence", value: getEmployeeMetadataValue(employee, ["State of Residence", "residence_state"]) },
      { field: "Residential Address", value: getEmployeeMetadataValue(employee, ["Residential Address", "residence_address"]) },
      { field: "LGA", value: getEmployeeMetadataValue(employee, ["LGA", "residence_lga"]) },
      { field: "Profession", value: getEmployeeMetadataValue(employee, ["Profession", "profession"]) },
      { field: "Next of Kin Name", value: getEmployeeMetadataValue(employee, ["Next of Kin Name", "next_of_kin_name"]) },
      { field: "Next of Kin Relationship", value: getEmployeeMetadataValue(employee, ["Next of Kin Relationship", "next_of_kin_relationship"]) },
      { field: "Next of Kin Phone Number", value: getEmployeeMetadataValue(employee, ["Next of Kin Phone Number", "next_of_kin_phone_number"]) },
      { field: "Next of Kin Address", value: getEmployeeMetadataValue(employee, ["Next of Kin Address", "next_of_kin_address"]) },
    ]);

    pushSection("Employment Information", [
      { field: "Employment ID No", value: getEmployeeMetadataValue(employee, ["Employment ID No", "employment_id_no", "employmentIdNo"]) },
      { field: "Service No", value: getEmployeeMetadataValue(employee, ["Service No", "service_no", "serviceNo"]) },
      { field: "File No", value: getEmployeeMetadataValue(employee, ["File No", "file_no", "fileNo"]) },
      { field: "Rank/Position", value: getEmployeeMetadataValue(employee, ["Rank/Position", "rank_position", "rankPosition"]) },
      { field: "Organization", value: getEmployeeMetadataValue(employee, ["Organization", "organization"]) },
      { field: "Employment Type", value: getEmployeeMetadataValue(employee, ["Employment Type", "employment_type", "employmentType"]) },
      { field: "Probation Period", value: getEmployeeMetadataValue(employee, ["Probation Period", "probation_period", "probationPeriod"]) },
      { field: "Work Location", value: getEmployeeMetadataValue(employee, ["Work Location", "work_location"]) },
      { field: "Grade Level", value: getEmployeeMetadataValue(employee, ["Grade Level", "grade_level"]) },
      { field: "Step", value: getEmployeeMetadataValue(employee, ["step", "Step"]) },
      { field: "Salary Structure", value: getEmployeeMetadataValue(employee, ["Salary Structure", "salary_structure"]) },
      { field: "Cadre", value: getEmployeeMetadataValue(employee, ["Cadre", "cadre"]) },
      { field: "Date of First Appointment", value: getEmployeeMetadataValue(employee, ["Date of First Appointment", "date_of_first_appointment"]) },
    ]);

    pushSection("Bank & Pension Information", [
      { field: "Bank Name", value: getEmployeeMetadataValue(employee, ["Bank Name", "bank_name"]) },
      { field: "Account Number", value: getEmployeeMetadataValue(employee, ["Account Number", "account_number"]) },
      { field: "NUBAN Account Number", value: getEmployeeMetadataValue(employee, ["nuban_account_number", "NUBAN Account Number"]) },
      { field: "PFA Name", value: getEmployeeMetadataValue(employee, ["PFA Name", "pfa_name"]) },
      { field: "RSA PIN", value: getEmployeeMetadataValue(employee, ["RSA PIN", "rsa_pin", "rsapin"]) },
    ]);

    pushSection("Education", [
      { field: "Educational Background", value: getEmployeeMetadataValue(employee, ["Educational Background", "educational_background"]) },
      { field: "Certifications", value: getEmployeeMetadataValue(employee, ["Certifications", "certifications"]) },
    ]);

    pushSection("Audit Trail", [
      { field: "Registration ID", value: getEmployeeValue(employee, ["registration_id"]) },
      { field: "Status", value: getEmployeeValue(employee, ["status"]) },
      { field: "Source", value: getEmployeeValue(employee, ["source"]) },
      { field: "Submission Date", value: formatEmployeeDate(getEmployeeValue(employee, ["submission_date"])) },
      { field: "Created At", value: formatEmployeeDate(getEmployeeValue(employee, ["created_at", "createdAt"])) },
      { field: "Updated At", value: formatEmployeeDate(getEmployeeValue(employee, ["updated_at", "updatedAt"])) },
    ]);

    return rows;
  };

  const employeeColumns = [
    {
      key: "name",
      label: "Employee",
    render: (_value: string, employee: Employee) => (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{employee.name}</span>
        <span className="text-sm text-muted-foreground">{employee.email}</span>
      </div>
    ),
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "position",
      label: "Position",
    },
    {
      key: "status",
      label: "Status",
      render: (_value: string, employee: Employee) => getStatusBadge(employee.status) ?? "Unknown",
    },
    {
      key: "join_date",
      label: "Join Date",
      render: (value: string) => (value ? new Date(value).toLocaleDateString("en-US") : "N/A"),
    },
    {
      key: "uploaded_documents",
      label: "Uploaded Documents",
      render: (value: string) => value || "N/A",
    },
  ];

  const findEmployeeById = (id: string) => {
    return filteredEmployees.find((employee) => employee.id === id) ??
      employees.find((employee) => employee.id === id);
  };

  const handleViewRow = (id: string) => {
    const employee = findEmployeeById(id);
    if (employee) {
      handleView(employee);
    }
  };

  const handleEditRow = (id: string) => {
    const employee = findEmployeeById(id);
    if (employee) {
      handleEdit(employee);
    }
  };

  const handleDeleteRow = (id: string) => {
    const employee = findEmployeeById(id);
    if (employee) {
      handleDelete(employee);
    }
  };

  const renderEmployeeActions = (employee: Employee) => (
    <div className="flex justify-end">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleViewRow(employee.id)}
        title="View Details"
        className="text-blue-600 hover:text-blue-800"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );

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
          <Button onClick={() => refetch()} className={buttonHoverEnhancements}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <Button
            onClick={() => setShowAddDialog(true)}
            className={`${buttonHoverEnhancements} bg-green-600 text-white shadow-sm w-full sm:w-auto hover:bg-green-800 hover:!bg-green-800`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <DataExportMenu onExport={handleExportList} title="Employees" />
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
                  <SelectTrigger className={`${buttonHoverEnhancements} border border-gray-300 rounded`} >
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
                  <SelectTrigger className={`${buttonHoverEnhancements} border border-gray-300 rounded`}>
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

          <EnhancedDataTable
            title="Employees"
            columns={employeeColumns}
            data={filteredEmployees}
            onAdd={() => setShowAddDialog(true)}
            onEdit={handleEditRow}
            onDelete={handleDeleteRow}
            onView={handleViewRow}
            renderRowActions={renderEmployeeActions}
            isLoading={isLoading}
            hideControlBar
            hideSummaryCards
            hideFooterControls
          />

         <div className="mt-5 flex h-fit w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !isDeletePending) {
            closeDeleteDialog();
          }
        }}
      >
        <DialogContent className="max-w-sm sm:max-w-md w-[90%] mx-auto py-4">
          <DialogHeader className="text-center px-2">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-60"></div>
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-200">
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <DialogTitle className="text-lg font-semibold text-red-700">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600 mt-1">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 px-2">
            <Card className="border-red-200 bg-red-50/60 mb-3">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  {employeeToDelete && (
                    <Avatar className="h-8 w-8 border border-red-200">
                      <AvatarFallback className="bg-red-100 text-red-700 text-xs font-semibold">
                        {employeeToDelete.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">
                      {employeeToDelete?.name || "Employee"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      ID: {employeeToDelete?.registration_id || "N/A"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-slate-500" />
                        <span>{employeeToDelete?.department || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-slate-500" />
                        <span>{employeeToDelete?.position || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 text-xs mb-0.5">
                    Important Notice
                  </h4>
                  <ul className="text-[11px] text-amber-700 list-disc list-inside space-y-0.5">
                    <li>Permanently deletes this record</li>
                    <li>Removes all associated data</li>
                    <li>Cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-slate-50 rounded-md border">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded border border-red-300 bg-white">
                  <Trash2 className="h-3 w-3 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 leading-tight">
                    You are about to delete permanently
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    click on the <span className="font-mono bg-slate-200 px-1 rounded">DELETE</span> button to confirm
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 px-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isDeletePending && closeDeleteDialog()}
              className="flex-1 px-4 py-2 text-xs border-slate-300 hover:bg-slate-50"
              disabled={isDeletePending}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={deleteSelectedEmployee}
              disabled={isDeletePending}
              className="flex-1 px-4 py-2 text-xs bg-gradient-to-r text-white from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md shadow-red-200"
            >
              {isDeletePending ? (
                <>
                  <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                className={`${buttonHoverEnhancements} h-8 w-8 text-gray-500 hover:text-gray-700`}
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
                          <p className="text-sm text-gray-700"><span className="font-medium">Full Name:</span> {selectedEmployee.name || "N/A"}</p>
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
                          <p className="text-sm text-gray-700"><span className="font-medium">Status:</span> {selectedEmployee.status || "N/A"}</p>
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
                          <p className="text-sm text-gray-700"><span className="font-medium">Employment ID No:</span> {selectedEmployee.metadata?.["Employment ID No"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Service No:</span> {selectedEmployee.metadata?.["Service No"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">File No:</span> {selectedEmployee.metadata?.["File No"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Rank/Position:</span> {selectedEmployee.metadata?.["Rank/Position"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Organization:</span> {selectedEmployee.metadata?.Organization || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Employment Type:</span> {selectedEmployee.metadata?.["Employment Type"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Probation Period:</span> {selectedEmployee.metadata?.["Probation Period"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Grade Level:</span> {selectedEmployee.metadata?.["Grade Level"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Step:</span> {selectedEmployee.metadata?.step || selectedEmployee.metadata?.Step || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Salary Structure:</span> {selectedEmployee.metadata?.["Salary Structure"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Cadre:</span> {selectedEmployee.metadata?.Cadre || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">PFA Name:</span> {selectedEmployee.metadata?.["PFA Name"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">RSA PIN:</span> {selectedEmployee.metadata?.["RSA PIN"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Bank Name:</span> {selectedEmployee.metadata?.["Bank Name"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Account Number:</span> {selectedEmployee.metadata?.["Account Number"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Gender:</span> {selectedEmployee.metadata?.Gender || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Marital Status:</span> {selectedEmployee.metadata?.["Marital Status"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">State of Origin:</span> {selectedEmployee.metadata?.["State of Origin"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">State of Residence:</span> {selectedEmployee.metadata?.["State of Residence"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Educational Background:</span> {selectedEmployee.metadata?.["Educational Background"] || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Certifications:</span> {selectedEmployee.metadata?.Certifications || "N/A"}</p>
                          <p className="text-sm text-gray-700"><span className="font-medium">Date of First Appointment:</span> {selectedEmployee.metadata?.["Date of First Appointment"] || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Registration ID</p>
                          <p className="text-sm text-gray-600">{selectedEmployee.registration_id || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Created At</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedEmployee.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Updated At</p>
                          <p className="text-sm text-gray-600">{formatSimpleDate(selectedEmployee.updated_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Join Date</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedEmployee.join_date)}</p>
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
                <Button
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                  className={buttonHoverEnhancements}
                >
                  Close
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handlePrint}
                  className={`${buttonHoverEnhancements} bg-blue-600 hover:bg-blue-700 text-white`}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Employee Slip
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className={`${buttonHoverEnhancements} border-green-600 text-green-600 hover:bg-green-50`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Employee Details PDF
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
                  <SelectTrigger className={buttonHoverEnhancements}>
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
                  <SelectTrigger className={buttonHoverEnhancements}>
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
                    <SelectTrigger className={buttonHoverEnhancements}>
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
                className={buttonHoverEnhancements}
              >
                Cancel
              </Button>
              <Button
                className={`${buttonHoverEnhancements} bg-blue-600 hover:bg-blue-700`}
              >
                Update Employee
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[960px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add New Employee
            </DialogTitle>
            <DialogDescription>
              Fill in the employee details expected by the backend payload.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleAddEmployee(); }}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstname">{requiredLabel("First Name")}</Label>
                <Input id="firstname" placeholder="Enter first name" value={newEmployee.firstname} onChange={(e) => updateEmployeeField("firstname", e.target.value)} className={addEmployeeFieldClassName("firstname")} />
                {renderFieldError("firstname")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">{requiredLabel("Surname")}</Label>
                <Input id="surname" placeholder="Enter surname" value={newEmployee.surname} onChange={(e) => updateEmployeeField("surname", e.target.value)} className={addEmployeeFieldClassName("surname")} />
                {renderFieldError("surname")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="middlename">{requiredLabel("Middle Name")}</Label>
                <Input id="middlename" placeholder="Enter middle name" value={newEmployee.middlename} onChange={(e) => updateEmployeeField("middlename", e.target.value)} className={addEmployeeFieldClassName("middlename")} />
                {renderFieldError("middlename")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">{requiredLabel("Title")}</Label>
                <Select value={newEmployee.title} onValueChange={(value) => updateEmployeeField("title", value)}>
                  <SelectTrigger id="title" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("title")}`}>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Miss">Miss</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Prof">Prof</SelectItem>
                    <SelectItem value="Engr">Engr</SelectItem>
                  </SelectContent>
                </Select>
                {renderFieldError("title")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{requiredLabel("Email")}</Label>
                <Input id="email" type="email" placeholder="Enter email address" value={newEmployee.email} onChange={(e) => updateEmployeeField("email", e.target.value)} className={addEmployeeFieldClassName("email")} />
                {renderFieldError("email")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephoneno">{requiredLabel("Telephone Number")}</Label>
                <Input id="telephoneno" placeholder="Enter phone number" value={newEmployee.telephoneno} onChange={(e) => updateEmployeeField("telephoneno", e.target.value)} className={addEmployeeFieldClassName("telephoneno")} />
                {renderFieldError("telephoneno")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">{requiredLabel("Birthdate")}</Label>
                <DatePicker
                  value={newEmployee.birthdate ? new Date(newEmployee.birthdate) : undefined}
                  onValueChange={(date) =>
                    updateEmployeeField("birthdate", date ? date.toISOString().split("T")[0] : "")
                  }
                  placeholder="Select birthdate"
                  className={`w-full ${addEmployeeFieldClassName("birthdate")}`}
                />
                {renderFieldError("birthdate")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nin">{requiredLabel("NIN")}</Label>
                <Input id="nin" placeholder="Enter NIN" value={newEmployee.nin} onChange={(e) => updateEmployeeField("nin", e.target.value)} className={addEmployeeFieldClassName("nin")} />
                {renderFieldError("nin")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">{requiredLabel("Gender")}</Label>
                <Select value={newEmployee.gender} onValueChange={(value) => updateEmployeeField("gender", value)}>
                  <SelectTrigger id="gender" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("gender")}`}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {renderFieldError("gender")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalstatus">{requiredLabel("Marital Status")}</Label>
                <Select value={newEmployee.maritalstatus} onValueChange={(value) => updateEmployeeField("maritalstatus", value)}>
                  <SelectTrigger id="maritalstatus" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("maritalstatus")}`}>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
                {renderFieldError("maritalstatus")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">{requiredLabel("Department")}</Label>
                <Select value={newEmployee.department} onValueChange={(value) => updateEmployeeField("department", value)}>
                  <SelectTrigger id="department" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("department")}`}>
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
                {renderFieldError("department")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">{requiredLabel("Position")}</Label>
                <Input id="position" placeholder="Enter position" value={newEmployee.position} onChange={(e) => updateEmployeeField("position", e.target.value)} className={addEmployeeFieldClassName("position")} />
                {renderFieldError("position")}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="state_of_origin">{requiredLabel("State of Origin")}</Label>
                <Select value={newEmployee.state_of_origin} onValueChange={(value) => updateEmployeeField("state_of_origin", value)}>
                  <SelectTrigger id="state_of_origin" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("state_of_origin")}`}>
                    <SelectValue placeholder="Select state of origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError("state_of_origin")}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="residence_address">{requiredLabel("Residential Address")}</Label>
                <Input id="residence_address" placeholder="Enter residential address" value={newEmployee.residence_address} onChange={(e) => updateEmployeeField("residence_address", e.target.value)} className={addEmployeeFieldClassName("residence_address")} />
                {renderFieldError("residence_address")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="residence_state">{requiredLabel("State of Residence")}</Label>
                <Select value={newEmployee.residence_state} onValueChange={updateResidenceState}>
                  <SelectTrigger id="residence_state" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("residence_state")}`}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError("residence_state")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="residence_lga">{requiredLabel("LGA")}</Label>
                <Select
                  value={newEmployee.residence_lga}
                  onValueChange={(value) => updateEmployeeField("residence_lga", value)}
                  disabled={!newEmployee.residence_state}
                >
                  <SelectTrigger id="residence_lga" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("residence_lga")}`}>
                    <SelectValue placeholder={newEmployee.residence_state ? "Select LGA" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableResidenceLgas.map((lga) => (
                      <SelectItem key={lga} value={lga}>
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError("residence_lga")}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profession">{requiredLabel("Profession")}</Label>
                <Input id="profession" placeholder="Enter profession" value={newEmployee.profession} onChange={(e) => updateEmployeeField("profession", e.target.value)} className={addEmployeeFieldClassName("profession")} />
                {renderFieldError("profession")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_of_kin_name">{requiredLabel("Next of Kin Name")}</Label>
                <Input id="next_of_kin_name" placeholder="Enter next of kin name" value={newEmployee.next_of_kin_name} onChange={(e) => updateEmployeeField("next_of_kin_name", e.target.value)} className={addEmployeeFieldClassName("next_of_kin_name")} />
                {renderFieldError("next_of_kin_name")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_of_kin_relationship">{requiredLabel("Next of Kin Relationship")}</Label>
                <Input id="next_of_kin_relationship" placeholder="Enter relationship" value={newEmployee.next_of_kin_relationship} onChange={(e) => updateEmployeeField("next_of_kin_relationship", e.target.value)} className={addEmployeeFieldClassName("next_of_kin_relationship")} />
                {renderFieldError("next_of_kin_relationship")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_of_kin_phone_number">{requiredLabel("Next of Kin Phone")}</Label>
                <Input id="next_of_kin_phone_number" placeholder="Enter next of kin phone number" value={newEmployee.next_of_kin_phone_number} onChange={(e) => updateEmployeeField("next_of_kin_phone_number", e.target.value)} className={addEmployeeFieldClassName("next_of_kin_phone_number")} />
                {renderFieldError("next_of_kin_phone_number")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_of_kin_address">{requiredLabel("Next of Kin Address")}</Label>
                <Input id="next_of_kin_address" placeholder="Enter next of kin address" value={newEmployee.next_of_kin_address} onChange={(e) => updateEmployeeField("next_of_kin_address", e.target.value)} className={addEmployeeFieldClassName("next_of_kin_address")} />
                {renderFieldError("next_of_kin_address")}
              </div>
            </div>

            <Card className="border-green-200">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Employment Record</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employment_id_no">{requiredLabel("Employment ID No")}</Label>
                    <Input
                      id="employment_id_no"
                      placeholder="Enter employment ID number"
                      value={newEmployee.employment_id_no ?? ""}
                      onChange={(e) => updateEmployeeField("employment_id_no", e.target.value)}
                      className={addEmployeeFieldClassName("employment_id_no")}
                    />
                    {renderFieldError("employment_id_no")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_no">{requiredLabel("Service No")}</Label>
                    <Input
                      id="service_no"
                      placeholder="Enter service number"
                      value={newEmployee.service_no ?? ""}
                      onChange={(e) => updateEmployeeField("service_no", e.target.value)}
                      className={addEmployeeFieldClassName("service_no")}
                    />
                    {renderFieldError("service_no")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file_no">{requiredLabel("File No")}</Label>
                    <Input
                      id="file_no"
                      placeholder="Enter file number"
                      value={newEmployee.file_no ?? ""}
                      onChange={(e) => updateEmployeeField("file_no", e.target.value)}
                      className={addEmployeeFieldClassName("file_no")}
                    />
                    {renderFieldError("file_no")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rank_position">{requiredLabel("Rank/Position")}</Label>
                    <Select value={newEmployee.rank_position ?? ""} onValueChange={(value) => updateEmployeeField("rank_position", value)}>
                      <SelectTrigger id="rank_position" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("rank_position")}`}>
                        <SelectValue placeholder="Select rank/position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior Officer">Junior Officer</SelectItem>
                        <SelectItem value="Senior Officer">Senior Officer</SelectItem>
                        <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Senior Manager">Senior Manager</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("rank_position")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">{requiredLabel("Organization")}</Label>
                    <Input
                      id="organization"
                      placeholder="Enter organization"
                      value={newEmployee.organization ?? ""}
                      onChange={(e) => updateEmployeeField("organization", e.target.value)}
                      className={addEmployeeFieldClassName("organization")}
                    />
                    {renderFieldError("organization")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment_type">{requiredLabel("Employment Type")}</Label>
                    <Select value={newEmployee.employment_type ?? ""} onValueChange={(value) => updateEmployeeField("employment_type", value)}>
                      <SelectTrigger id="employment_type" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("employment_type")}`}>
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                        <SelectItem value="Probation">Probation</SelectItem>
                        <SelectItem value="Intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("employment_type")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="probation_period">{requiredLabel("Probation Period")}</Label>
                    <Select value={newEmployee.probation_period ?? ""} onValueChange={(value) => updateEmployeeField("probation_period", value)}>
                      <SelectTrigger id="probation_period" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("probation_period")}`}>
                        <SelectValue placeholder="Select probation period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="3 Months">3 Months</SelectItem>
                        <SelectItem value="6 Months">6 Months</SelectItem>
                        <SelectItem value="1 Year">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderFieldError("probation_period")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="work_location">{requiredLabel("Work Location")}</Label>
                    <Input
                      id="work_location"
                      placeholder="Enter work location"
                      value={newEmployee.work_location ?? ""}
                      onChange={(e) => updateEmploymentField("work_location", e.target.value)}
                      className={addEmployeeFieldClassName("work_location")}
                    />
                    {renderFieldError("work_location")}
                  </div>

                  <div className="space-y-2">
                    <Label>{requiredLabel("Date of First Appointment")}</Label>
                    <DatePicker
                      value={newEmployee.date_of_first_appointment ? new Date(newEmployee.date_of_first_appointment) : undefined}
                      onValueChange={(date) =>
                        updateEmploymentField(
                          "date_of_first_appointment",
                          date ? date.toISOString().split("T")[0] : ""
                        )
                      }
                      placeholder="Select appointment date"
                      className={`w-full ${addEmployeeFieldClassName("date_of_first_appointment")}`}
                    />
                    {renderFieldError("date_of_first_appointment")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_structure">{requiredLabel("Salary Structure")}</Label>
                    <Select
                      value={newEmployee.salary_structure ?? ""}
                      onValueChange={(value) => updateEmploymentField("salary_structure", value)}
                    >
                      <SelectTrigger id="salary_structure" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("salary_structure")}`}>
                        <SelectValue placeholder="Select salary structure" />
                      </SelectTrigger>
                      <SelectContent>
                        {salaryStructureOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError("salary_structure")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade_level">{requiredLabel("Grade Level")}</Label>
                    <Select
                      value={newEmployee.grade_level ?? ""}
                      onValueChange={(value) => updateEmploymentField("grade_level", value)}
                      disabled={!newEmployee.salary_structure}
                    >
                      <SelectTrigger id="grade_level" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("grade_level")}`}>
                        <SelectValue placeholder={newEmployee.salary_structure ? "Select grade level" : "Select salary structure first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGradeLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError("grade_level")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="step">{requiredLabel("Step")}</Label>
                    <Select
                      value={newEmployee.step ?? ""}
                      onValueChange={(value) => updateEmploymentField("step", value)}
                      disabled={!newEmployee.salary_structure || !newEmployee.grade_level}
                    >
                      <SelectTrigger id="step" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("step")}`}>
                        <SelectValue
                          placeholder={
                            newEmployee.salary_structure
                              ? newEmployee.grade_level
                                ? "Select step"
                                : "Select grade level first"
                              : "Select salary structure first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStepOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError("step")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cadre">{requiredLabel("Cadre")}</Label>
                    <Select
                      value={derivedCadre || newEmployee.cadre || ""}
                      onValueChange={(value) => updateEmploymentField("cadre", value)}
                      disabled={!newEmployee.salary_structure || Boolean(derivedCadre)}
                    >
                      <SelectTrigger id="cadre" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("cadre")}`}>
                        <SelectValue
                          placeholder={
                            !newEmployee.salary_structure
                              ? "Select salary structure first"
                              : derivedCadre
                                ? "Auto-filled from grade level"
                                : "Select cadre"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCadreOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError("cadre")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Banking and Pension Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">{requiredLabel("Bank Name")}</Label>
                    <Select
                      value={newEmployee.bank_name ?? ""}
                      onValueChange={(value) => updateEmploymentField("bank_name", value)}
                    >
                      <SelectTrigger id="bank_name" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("bank_name")}`}>
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Access Bank",
                          "Zenith Bank",
                          "First Bank",
                          "UBA",
                          "GTBank",
                          "Fidelity Bank",
                          "Union Bank",
                          "Ecobank",
                          "FCMB",
                          "Sterling Bank",
                        ].map((bank) => (
                          <SelectItem key={bank} value={bank}>
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError("bank_name")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_number">{requiredLabel("Account Number")}</Label>
                    <Input
                      id="account_number"
                      placeholder="Enter account number"
                      value={newEmployee.account_number ?? ""}
                      onChange={(e) => updateEmploymentField("account_number", e.target.value)}
                      maxLength={10}
                      className={addEmployeeFieldClassName("account_number")}
                    />
                    {renderFieldError("account_number")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nuban_account_number">{requiredLabel("NUBAN Account Number")}</Label>
                    <Input
                      id="nuban_account_number"
                      placeholder="Enter NUBAN account number"
                      value={newEmployee.nuban_account_number ?? ""}
                      onChange={(e) => updateEmploymentField("nuban_account_number", e.target.value)}
                      maxLength={10}
                      className={addEmployeeFieldClassName("nuban_account_number")}
                    />
                    {renderFieldError("nuban_account_number")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pfa_name">{requiredLabel("PFA Name")}</Label>
                    <Select
                      value={newEmployee.pfa_name ?? ""}
                      onValueChange={(value) => updateEmploymentField("pfa_name", value)}
                    >
                      <SelectTrigger id="pfa_name" className={`${buttonHoverEnhancements} ${addEmployeeFieldClassName("pfa_name")}`}>
                        <SelectValue placeholder="Select PFA" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "ARM Pension",
                          "Stanbic IBTC Pension",
                          "Premium Pension",
                          "Leadway Pensure",
                          "FCMB Pensions",
                          "Trustfund Pensions",
                          "Sigma Pensions",
                          "Crusader Sterling Pensions",
                          "AIICO Pension",
                          "NLPC Pension",
                        ].map((pfa) => (
                          <SelectItem key={pfa} value={pfa}>
                            {pfa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError("pfa_name")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rsapin">{requiredLabel("RSA PIN")}</Label>
                    <Input
                      id="rsapin"
                      placeholder="Enter RSA PIN"
                      value={newEmployee.rsapin ?? ""}
                      onChange={(e) => updateEmploymentField("rsapin", e.target.value)}
                      className={addEmployeeFieldClassName("rsapin")}
                    />
                    {renderFieldError("rsapin")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Educational Background and Certifications</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="educational_background">{requiredLabel("Educational Background")}</Label>
                    <Textarea
                      id="educational_background"
                      placeholder="Enter educational background"
                      value={newEmployee.educational_background ?? ""}
                      onChange={(e) => updateEmploymentField("educational_background", e.target.value)}
                      rows={4}
                      className={addEmployeeFieldClassName("educational_background")}
                    />
                    {renderFieldError("educational_background")}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">{requiredLabel("Certifications")}</Label>
                    <Textarea
                      id="certifications"
                      placeholder="Enter certifications"
                      value={newEmployee.certifications ?? ""}
                      onChange={(e) => updateEmploymentField("certifications", e.target.value)}
                      rows={4}
                      className={addEmployeeFieldClassName("certifications")}
                    />
                    {renderFieldError("certifications")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className={buttonHoverEnhancements}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addEmployeeMutation.isPending}
                className={`${buttonHoverEnhancements} bg-green-700 hover:bg-green-800 hover:!bg-green-800`}
              >
                {addEmployeeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
