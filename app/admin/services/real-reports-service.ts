import { format } from "date-fns"

// Types for our report data
export interface OverviewStats {
  totalEmployees: number
  newHires: number
  pendingApprovals: number
  documentSubmissions: number
  growthRate: number
  approvalRate: number
}

export interface DepartmentStats {
  name: string
  count: number
  percentage: number
}

export interface EmployeeGrowthData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
}

export interface PayrollStats {
  totalSalary: number
  averageSalary: number
  departmentBreakdown: {
    department: string
    amount: number
    percentage: number
  }[]
}

export interface ReportFilters {
  startDate?: Date
  endDate?: Date
  department?: string
  reportType?: string
}

// Reports service for API calls
export const ReportsService = {
  // Get overview statistics
  getOverviewStats: async (filters?: ReportFilters): Promise<OverviewStats> => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("type", "overview")

      if (filters?.startDate) {
        queryParams.append("startDate", format(filters.startDate, "yyyy-MM-dd"))
      }

      if (filters?.endDate) {
        queryParams.append("endDate", format(filters.endDate, "yyyy-MM-dd"))
      }

      if (filters?.department && filters.department !== "all") {
        queryParams.append("department", filters.department)
      }

      const response = await fetch(`/api/admin/reports?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch overview stats: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error("Error fetching overview stats:", error)
      throw error
    }
  },

  // Get department statistics
  getDepartmentStats: async (filters?: ReportFilters): Promise<DepartmentStats[]> => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("type", "departments")

      if (filters?.startDate) {
        queryParams.append("startDate", format(filters.startDate, "yyyy-MM-dd"))
      }

      if (filters?.endDate) {
        queryParams.append("endDate", format(filters.endDate, "yyyy-MM-dd"))
      }

      if (filters?.department && filters.department !== "all") {
        queryParams.append("department", filters.department)
      }

      const response = await fetch(`/api/admin/reports?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch department stats: ${response.status}`)
      }

      const data = await response.json()
      return data.data.departments
    } catch (error) {
      console.error("Error fetching department stats:", error)
      throw error
    }
  },

  // Get employee growth data for charts
  getEmployeeGrowthData: async (filters?: ReportFilters): Promise<EmployeeGrowthData> => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("type", "employeeGrowth")

      if (filters?.startDate) {
        queryParams.append("startDate", format(filters.startDate, "yyyy-MM-dd"))
      }

      if (filters?.endDate) {
        queryParams.append("endDate", format(filters.endDate, "yyyy-MM-dd"))
      }

      if (filters?.department && filters.department !== "all") {
        queryParams.append("department", filters.department)
      }

      const response = await fetch(`/api/admin/reports?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch employee growth data: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error("Error fetching employee growth data:", error)
      throw error
    }
  },

  // Get payroll statistics
  getPayrollStats: async (filters?: ReportFilters): Promise<PayrollStats> => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("type", "payroll")

      if (filters?.startDate) {
        queryParams.append("startDate", format(filters.startDate, "yyyy-MM-dd"))
      }

      if (filters?.endDate) {
        queryParams.append("endDate", format(filters.endDate, "yyyy-MM-dd"))
      }

      if (filters?.department && filters.department !== "all") {
        queryParams.append("department", filters.department)
      }

      const response = await fetch(`/api/admin/reports?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch payroll stats: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error("Error fetching payroll stats:", error)
      throw error
    }
  },

  // Export report data
  exportReportData: async (
    reportType: string,
    format: "csv" | "json" | "pdf",
    filters?: ReportFilters,
  ): Promise<Blob> => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("type", reportType)
      queryParams.append("format", format)

      if (filters?.startDate) {
        queryParams.append("startDate", format(filters.startDate, "yyyy-MM-dd"))
      }

      if (filters?.endDate) {
        queryParams.append("endDate", format(filters.endDate, "yyyy-MM-dd"))
      }

      if (filters?.department && filters.department !== "all") {
        queryParams.append("department", filters.department)
      }

      const response = await fetch(`/api/admin/reports/export?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to export report data: ${response.status}`)
      }

      return await response.blob()
    } catch (error) {
      console.error("Error exporting report data:", error)
      throw error
    }
  },
}
