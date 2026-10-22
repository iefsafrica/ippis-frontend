"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  Users,
  UserCheck,
  Clock,
  Building,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  Briefcase,
  Eye,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  IdCard,
  CreditCard,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGetCompanies } from "@/services/hooks/organizations/company/useCompany"
import { useGetDepartments } from "@/services/hooks/organizations/department/useDepartment"
import { useEmployeesList } from "@/services/hooks/employees/useEmployees"
import { usePendingEmployees } from "@/services/hooks/employees/usePendingEmployees"
import type { Company } from "@/types/organizations/company/company-management"
import type { Department } from "@/types/organizations/department/department-management"

export interface UnifiedEmployee {
  id: string | number
  name: string
  email: string
  phone: string
  ippisNumber: string
  serviceNo: string
  fileNo: string
  nin: string
  registrationId: string
  department: string
  position: string
  rank: string
  cadre: string
  gradeLevel: string
  step: string
  mdaName: string
  companyId?: string | number
  companyCode?: string
  status: "active" | "pending" | string
  workLocation: string
  stateOfOrigin: string
  gender: string
  birthdate: string
  maritalStatus: string
  residentialAddress: string
  bankName: string
  accountNumber: string
  pfaName: string
  rsaPin: string
  nextOfKinName: string
  nextOfKinPhone: string
  joinDate: string
}

function normalizeEmployee(
  emp: any,
  defaultStatus: "active" | "pending",
  companies: Company[],
  departments: Department[]
): UnifiedEmployee {
  // Extract name
  const name =
    emp.name ||
    [emp.firstname || emp.first_name || emp.firstName, emp.surname || emp.last_name || emp.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Personnel Record"

  // Parse metadata if present
  let meta: Record<string, any> = {}
  if (emp.metadata) {
    if (typeof emp.metadata === "string") {
      try {
        meta = JSON.parse(emp.metadata)
      } catch {
        meta = {}
      }
    } else if (typeof emp.metadata === "object") {
      meta = emp.metadata
    }
  }

  // Extract raw organization string
  const rawOrg =
    emp.organization ||
    emp.company_name ||
    meta.organization ||
    meta.Organization ||
    meta.mda ||
    meta.MDA ||
    meta.ministry ||
    meta.Ministry ||
    meta.company_name ||
    ""

  // Extract department name
  const deptName = emp.department || meta.department || meta.Department || ""

  // Match company
  let matchedCompany: Company | undefined

  if (rawOrg) {
    const rawLower = String(rawOrg).trim().toLowerCase()
    matchedCompany = companies.find((c) => {
      const cName = (c.name || "").trim().toLowerCase()
      const cCode = ((c as any).company_code || "").trim().toLowerCase()
      return (
        cName === rawLower ||
        cCode === rawLower ||
        (cName && rawLower.includes(cName)) ||
        (cName && cName.includes(rawLower))
      )
    })
  }

  if (!matchedCompany && deptName) {
    const matchedDept = departments.find(
      (d) => d.name?.trim().toLowerCase() === deptName.trim().toLowerCase()
    )
    if (matchedDept && matchedDept.company_id) {
      matchedCompany = companies.find((c) => String(c.id) === String(matchedDept.company_id))
    }
  }

  const mdaName = matchedCompany?.name || (rawOrg ? String(rawOrg) : "General Federal Service")
  const companyId = matchedCompany?.id
  const companyCode = (matchedCompany as any)?.company_code || ""

  // Determine status
  let status = (emp.status || defaultStatus).toLowerCase()
  if (status === "approved" || status === "enrolled") status = "active"
  if (status === "awaiting" || status === "submitted") status = "pending"

  return {
    id: emp.id || emp.registration_id || Math.random().toString(),
    name,
    email: emp.email || meta.email || "—",
    phone: emp.telephoneno || emp.phone_number || meta.telephoneno || meta["Phone Number"] || "—",
    ippisNumber:
      emp.employee_id ||
      emp.employment_id_no ||
      meta.employment_id_no ||
      meta["Employment ID No"] ||
      emp.service_no ||
      meta.service_no ||
      "—",
    serviceNo: emp.service_no || meta.service_no || meta["Service No"] || "—",
    fileNo: emp.file_no || meta.file_no || meta["File No"] || "—",
    nin: emp.nin || meta.nin || meta.NIN || "—",
    registrationId: emp.registration_id || meta.registration_id || "",
    department: deptName || "General Administration",
    position:
      emp.position ||
      emp.rank_position ||
      meta.rank_position ||
      meta["Rank/Position"] ||
      meta.position ||
      "Civil Service Officer",
    rank: emp.rank_position || meta.rank_position || meta["Rank/Position"] || "—",
    cadre: emp.cadre || meta.cadre || meta.Cadre || "Administrative Cadre",
    gradeLevel: emp.grade_level || meta.grade_level || meta["Grade Level"] || "GL-08",
    step: emp.step || meta.step || meta.Step || "1",
    mdaName,
    companyId,
    companyCode,
    status,
    workLocation:
      emp.work_location ||
      meta.work_location ||
      meta["Work Location"] ||
      meta.residence_state ||
      "Federal Capital Territory (Abuja)",
    stateOfOrigin: emp.state_of_origin || meta.state_of_origin || meta["State of Origin"] || "—",
    gender: emp.gender || meta.gender || meta.Gender || "—",
    birthdate: emp.birthdate || meta.birthdate || meta.Birthdate || "—",
    maritalStatus: emp.maritalstatus || meta.maritalstatus || meta["Marital Status"] || "—",
    residentialAddress:
      emp.residence_address || meta.residence_address || meta["Residential Address"] || "—",
    bankName: emp.bank_name || meta.bank_name || meta["Bank Name"] || "—",
    accountNumber: emp.account_number || meta.account_number || meta["Account Number"] || "—",
    pfaName: emp.pfa_name || meta.pfa_name || meta["PFA Name"] || "—",
    rsaPin: emp.rsapin || emp.rsa_pin || meta.rsa_pin || meta.rsapin || meta["RSA PIN"] || "—",
    nextOfKinName: emp.next_of_kin_name || meta.next_of_kin_name || meta["Next of Kin Name"] || "—",
    nextOfKinPhone:
      emp.next_of_kin_phone_number ||
      meta.next_of_kin_phone_number ||
      meta["Next of Kin Phone Number"] ||
      "—",
    joinDate:
      emp.join_date ||
      emp.submission_date ||
      emp.created_at ||
      meta.date_of_first_appointment ||
      meta["Date of First Appointment"] ||
      "—",
  }
}

export function MdaEmployeesDirectory() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedEmployee, setSelectedEmployee] = useState<UnifiedEmployee | null>(null)
  const pageSize = 8

  // Live queries
  const { data: companiesData, isLoading: isLoadingCompanies } = useGetCompanies()
  const { data: departmentsData } = useGetDepartments()
  const {
    data: activeEmployeesData,
    isLoading: isLoadingActive,
    refetch: refetchActive,
  } = useEmployeesList(1)
  const {
    data: pendingEmployeesData,
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = usePendingEmployees(1, 100)

  const companies = useMemo(() => companiesData?.data || [], [companiesData])
  const departments = useMemo(() => departmentsData?.data || [], [departmentsData])

  // Extract raw lists
  const rawActive = useMemo(() => activeEmployeesData?.employees || [], [activeEmployeesData])
  const rawPending = useMemo(
    () => pendingEmployeesData?.data?.employees || [],
    [pendingEmployeesData]
  )

  // Unify and normalize all employees
  const allEmployees: UnifiedEmployee[] = useMemo(() => {
    const activeList = rawActive.map((emp) =>
      normalizeEmployee(emp, "active", companies, departments)
    )
    const pendingList = rawPending.map((emp) =>
      normalizeEmployee(emp, "pending", companies, departments)
    )

    // Avoid duplicate IDs if an employee exists in both lists
    const seenIds = new Set<string>()
    const combined: UnifiedEmployee[] = []

    activeList.forEach((e) => {
      const key = `${e.id}-${e.status}`
      if (!seenIds.has(key)) {
        seenIds.add(key)
        combined.push(e)
      }
    })

    pendingList.forEach((e) => {
      const key = `${e.id}-${e.status}`
      if (!seenIds.has(key)) {
        seenIds.add(key)
        combined.push(e)
      }
    })

    return combined
  }, [rawActive, rawPending, companies, departments])

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((emp) => {
      // 1. Filter by Company / MDA
      if (selectedCompanyId !== "all") {
        const targetCompany = companies.find((c) => String(c.id) === selectedCompanyId)
        if (targetCompany) {
          const compNameLower = (targetCompany.name || "").trim().toLowerCase()
          const compCodeLower = ((targetCompany as any).company_code || "").trim().toLowerCase()
          const empMdaLower = emp.mdaName.trim().toLowerCase()

          const matchesId = emp.companyId !== undefined && String(emp.companyId) === selectedCompanyId
          const matchesName =
            empMdaLower === compNameLower ||
            empMdaLower.includes(compNameLower) ||
            compNameLower.includes(empMdaLower)
          const matchesCode =
            compCodeLower &&
            (emp.companyCode?.toLowerCase() === compCodeLower ||
              empMdaLower.includes(compCodeLower))

          if (!matchesId && !matchesName && !matchesCode) {
            return false
          }
        }
      }

      // 2. Filter by Status (active vs pending)
      if (statusFilter !== "all") {
        if (emp.status !== statusFilter) {
          return false
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchesQuery =
          emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.ippisNumber.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query) ||
          emp.position.toLowerCase().includes(query) ||
          emp.mdaName.toLowerCase().includes(query) ||
          emp.registrationId.toLowerCase().includes(query)

        if (!matchesQuery) return false
      }

      return true
    })
  }, [allEmployees, selectedCompanyId, statusFilter, searchQuery, companies])

  // Statistics for the selected filter scope
  const stats = useMemo(() => {
    const scope =
      selectedCompanyId === "all"
        ? allEmployees
        : allEmployees.filter((emp) => {
            const targetCompany = companies.find((c) => String(c.id) === selectedCompanyId)
            if (!targetCompany) return true
            const compNameLower = (targetCompany.name || "").trim().toLowerCase()
            const empMdaLower = emp.mdaName.trim().toLowerCase()
            return (
              String(emp.companyId) === selectedCompanyId ||
              empMdaLower === compNameLower ||
              empMdaLower.includes(compNameLower) ||
              compNameLower.includes(empMdaLower)
            )
          })

    const activeCount = scope.filter((e) => e.status === "active").length
    const pendingCount = scope.filter((e) => e.status === "pending").length

    return {
      total: scope.length,
      active: activeCount,
      pending: pendingCount,
    }
  }, [allEmployees, selectedCompanyId, companies])

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredEmployees.slice(start, start + pageSize)
  }, [filteredEmployees, currentPage])

  const handleRefresh = async () => {
    await Promise.allSettled([refetchActive(), refetchPending()])
  }

  const isLoading = isLoadingCompanies || isLoadingActive || isLoadingPending

  return (
    <Card className="border border-slate-200/90 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-5 pb-4 bg-gradient-to-r from-slate-50 via-white to-emerald-50/20 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#008751]/10 text-[#008751]">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                Institutional Workforce Directory by MDA & Company
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Filter and audit enrolled active civil servants and pending registrations across Federal
              Ministries, Departments & Agencies
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 text-xs text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh List
            </Button>
            <Button
              asChild
              size="sm"
              className="h-8 text-xs bg-[#008751] hover:bg-[#007043] text-white shadow-xs"
            >
              <Link href="/admin/employees">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Full Employee Portal
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mt-4 pt-3 border-t border-slate-100">
          {/* MDA / Company Selector */}
          <div className="lg:col-span-5 space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building className="h-3 w-3 text-[#008751]" /> Select Federal MDA / Company
            </label>
            <Select
              value={selectedCompanyId}
              onValueChange={(val) => {
                setSelectedCompanyId(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-9 text-xs bg-white border-slate-200 font-medium">
                <SelectValue placeholder="All MDAs & Companies" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                <SelectItem value="all" className="text-xs font-semibold text-slate-900">
                  🏛️ All Federal MDAs & Companies ({allEmployees.length} Staff)
                </SelectItem>
                {companies.map((company) => {
                  const compCount = allEmployees.filter((e) => {
                    const cNameLower = (company.name || "").trim().toLowerCase()
                    const eMdaLower = e.mdaName.trim().toLowerCase()
                    return (
                      String(e.companyId) === String(company.id) ||
                      eMdaLower === cNameLower ||
                      eMdaLower.includes(cNameLower) ||
                      cNameLower.includes(eMdaLower)
                    )
                  }).length

                  return (
                    <SelectItem key={company.id} value={String(company.id)} className="text-xs">
                      {company.name} ({compCount})
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Status Tabs */}
          <div className="lg:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-blue-600" /> Enrollment Status
            </label>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 h-9">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all")
                  setCurrentPage(1)
                }}
                className={`flex-1 text-xs font-medium py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1 ${
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("active")
                  setCurrentPage(1)
                }}
                className={`flex-1 text-xs font-medium py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1 ${
                  statusFilter === "active"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                <UserCheck className="h-3 w-3" /> Active ({stats.active})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("pending")
                  setCurrentPage(1)
                }}
                className={`flex-1 text-xs font-medium py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1 ${
                  statusFilter === "pending"
                    ? "bg-amber-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-amber-700"
                }`}
              >
                <Clock className="h-3 w-3" /> Pending ({stats.pending})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="lg:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Search className="h-3 w-3 text-slate-400" /> Quick Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Name, IPPIS, department..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-8 pr-7 h-9 text-xs bg-white border-slate-200"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Selected Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>Showing:</span>
            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 font-semibold">
              MDA:{" "}
              {selectedCompanyId === "all"
                ? "All Federal Entities"
                : companies.find((c) => String(c.id) === selectedCompanyId)?.name || "Selected MDA"}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold ${
                statusFilter === "active"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : statusFilter === "pending"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              Status: {statusFilter.toUpperCase()}
            </Badge>
            {searchQuery && (
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-800 border-blue-200">
                Search: &ldquo;{searchQuery}&rdquo;
              </Badge>
            )}
            <span className="font-semibold text-slate-700">
              ({filteredEmployees.length} personnel matching)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1">
              Layout:
            </span>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-6 px-2 text-[10px]"
            >
              Table
            </Button>
            <Button
              variant={viewMode === "cards" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-6 px-2 text-[10px]"
            >
              Grid Cards
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100/70 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              No Personnel Found for Current Filters
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {selectedCompanyId !== "all"
                ? "No employees are currently mapped to this MDA matching the status and query criteria."
                : "No employee enrollment records found matching the active filters."}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCompanyId("all")
                  setStatusFilter("all")
                  setSearchQuery("")
                }}
                className="text-xs h-8"
              >
                Reset All Filters
              </Button>
              <Button
                asChild
                size="sm"
                className="text-xs h-8 bg-[#008751] hover:bg-[#007043] text-white"
              >
                <Link href="/admin/employees">Onboard Employee</Link>
              </Button>
            </div>
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Personnel / Name</th>
                  <th className="py-3 px-3 font-semibold">IPPIS / ID</th>
                  <th className="py-3 px-3 font-semibold">Federal MDA / Agency</th>
                  <th className="py-3 px-3 font-semibold">Department & Rank</th>
                  <th className="py-3 px-3 font-semibold">Duty Station</th>
                  <th className="py-3 px-3 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEmployees.map((emp) => {
                  const initials = emp.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 rounded-full border border-slate-200 text-[11px] font-bold bg-[#008751]/10 text-[#008751]">
                            <AvatarFallback>{initials || "EM"}</AvatarFallback>
                          </Avatar>
                          <div className="truncate max-w-[190px]">
                            <p className="font-bold text-slate-900 group-hover:text-[#008751] transition-colors truncate">
                              {emp.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                          {emp.ippisNumber !== "—" ? emp.ippisNumber : emp.registrationId || "—"}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 max-w-[200px]">
                          <Building className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800 truncate" title={emp.mdaName}>
                            {emp.mdaName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="max-w-[180px]">
                          <p className="font-medium text-slate-800 truncate">{emp.department}</p>
                          <p className="text-[10px] text-slate-500 truncate">{emp.position}</p>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        <div className="flex items-center gap-1 max-w-[130px]">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{emp.workLocation}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <Badge
                          className={`text-[10px] font-bold capitalize ${
                            emp.status === "active"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {emp.status === "active" ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5 text-amber-600" /> Pending
                            </span>
                          )}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEmployee(emp)
                          }}
                          className="h-7 px-2.5 text-xs text-slate-700 hover:text-[#008751] hover:bg-emerald-50"
                        >
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {paginatedEmployees.map((emp) => {
              const initials = emp.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()

              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="rounded-xl border border-slate-200/90 bg-white p-4 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Avatar className="h-10 w-10 rounded-full border border-slate-200 font-bold bg-[#008751]/10 text-[#008751]">
                        <AvatarFallback>{initials || "EM"}</AvatarFallback>
                      </Avatar>
                      <Badge
                        className={`text-[10px] font-bold capitalize ${
                          emp.status === "active"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {emp.status}
                      </Badge>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#008751] transition-colors truncate">
                      {emp.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mb-2">{emp.email}</p>

                    <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2 text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="font-semibold truncate text-slate-700">{emp.mdaName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.department}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.workLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {emp.ippisNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-[#008751] hover:bg-emerald-50"
                    >
                      Details &rarr;
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {filteredEmployees.length > pageSize && (
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
            <span className="text-[11px]">
              Page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span> (
              {filteredEmployees.length} total)
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="h-7 px-2 text-xs"
              >
                Next <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Employee Profile Inspection Modal */}
      <Dialog
        open={Boolean(selectedEmployee)}
        onOpenChange={(open) => {
          if (!open) setSelectedEmployee(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedEmployee && (
            <>
              <DialogHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 rounded-full border-2 border-[#008751]/20 font-bold bg-[#008751]/10 text-[#008751] text-sm">
                    <AvatarFallback>
                      {selectedEmployee.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {selectedEmployee.name}
                      <Badge
                        className={`text-[10px] capitalize font-bold ${
                          selectedEmployee.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {selectedEmployee.status === "active" ? "Active Enrolled" : "Pending Approval"}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 mt-0.5">
                      IPPIS ID:{" "}
                      <span className="font-mono font-bold text-slate-800">
                        {selectedEmployee.ippisNumber}
                      </span>{" "}
                      &bull; {selectedEmployee.mdaName}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-xs">
                {/* 1. Institutional & Career Schema */}
                <div className="rounded-lg border border-slate-200/90 p-3.5 bg-slate-50/50">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#008751] mb-2 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Institutional & Career Placement
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Assigned MDA</p>
                      <p className="font-bold text-slate-800">{selectedEmployee.mdaName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Directorate</p>
                      <p className="font-bold text-slate-800">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Rank / Title</p>
                      <p className="font-bold text-slate-800">{selectedEmployee.position}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Designated Cadre</p>
                      <p className="font-semibold text-slate-700">{selectedEmployee.cadre}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Grade & Step</p>
                      <p className="font-semibold text-slate-700">
                        {selectedEmployee.gradeLevel} (Step {selectedEmployee.step})
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Duty Station</p>
                      <p className="font-semibold text-slate-700">{selectedEmployee.workLocation}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Official Identifiers */}
                <div className="rounded-lg border border-slate-200/90 p-3.5 bg-slate-50/50">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
                    <IdCard className="h-3.5 w-3.5" /> Statutory IPPIS Identifiers
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">IPPIS Number</p>
                      <p className="font-mono font-bold text-slate-800">{selectedEmployee.ippisNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Service Number</p>
                      <p className="font-mono font-semibold text-slate-700">{selectedEmployee.serviceNo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">File Number</p>
                      <p className="font-mono font-semibold text-slate-700">{selectedEmployee.fileNo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">National NIN</p>
                      <p className="font-mono font-semibold text-slate-700">{selectedEmployee.nin}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Personal & Contact Details */}
                <div className="rounded-lg border border-slate-200/90 p-3.5 bg-slate-50/50">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-700 mb-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Personnel & Demographics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Official Email</p>
                      <p className="font-medium text-slate-800 break-all">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Telephone</p>
                      <p className="font-medium text-slate-800">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Gender</p>
                      <p className="font-medium text-slate-800 capitalize">{selectedEmployee.gender}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">State of Origin</p>
                      <p className="font-medium text-slate-800">{selectedEmployee.stateOfOrigin}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Marital Status</p>
                      <p className="font-medium text-slate-800 capitalize">{selectedEmployee.maritalStatus}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Date Joined</p>
                      <p className="font-medium text-slate-800">{selectedEmployee.joinDate}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Bank & Pension Information */}
                {(selectedEmployee.bankName !== "—" || selectedEmployee.pfaName !== "—") && (
                  <div className="rounded-lg border border-slate-200/90 p-3.5 bg-slate-50/50">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" /> Payroll & Pension Records
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Bank Name</p>
                        <p className="font-medium text-slate-800">{selectedEmployee.bankName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Account Number</p>
                        <p className="font-mono font-medium text-slate-800">
                          {selectedEmployee.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">PFA Provider</p>
                        <p className="font-medium text-slate-800">{selectedEmployee.pfaName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">RSA PIN</p>
                        <p className="font-mono font-medium text-slate-800">{selectedEmployee.rsaPin}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-between sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmployee(null)}
                  className="text-xs"
                >
                  Close
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="bg-[#008751] hover:bg-[#007043] text-white text-xs"
                >
                  <Link
                    href={
                      selectedEmployee.status === "pending"
                        ? "/admin/employees?tab=pending"
                        : "/admin/employees"
                    }
                  >
                    Open in Full Employee Hub &rarr;
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
