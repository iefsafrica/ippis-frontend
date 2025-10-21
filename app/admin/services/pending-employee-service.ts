import type { PendingEmployee, Employee } from "./mock-data-service"
import { EmailService } from "./email-service"
import { DocumentUploadEmailService } from "./document-upload-email-service"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory storage
let pendingEmployees: PendingEmployee[] = []
let employees: Employee[] = []
const emailNotifications: any[] = [] // Assuming EmailNotification type is defined elsewhere

const generateId = (prefix: string) => `${prefix}${Math.floor(10000 + Math.random() * 90000)}`

// Mock API service for Pending Employees
export const PendingEmployeeService = {
  // Initialize with data
  initialize: (initialPendingEmployees: PendingEmployee[], initialEmployees: Employee[]) => {
    pendingEmployees = [...initialPendingEmployees]
    employees = [...initialEmployees]
  },

  // Get pending employees with filtering
  getPendingEmployees: async (filters?: {
    search?: string
    date?: string
    department?: string
    source?: "form" | "import"
    status?: string
  }): Promise<PendingEmployee[]> => {
    await delay(500)

    let result = [...pendingEmployees]

    if (filters) {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        result = result.filter(
          (emp) =>
            emp.name.toLowerCase().includes(searchTerm) ||
            emp.email.toLowerCase().includes(searchTerm) ||
            emp.id.toLowerCase().includes(searchTerm),
        )
      }

      if (filters.date && filters.date !== "all") {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        const weekAgo = today - 7 * 24 * 60 * 60 * 1000
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime()

        result = result.filter((emp) => {
          const submissionTime = new Date(emp.submissionDate).getTime()
          if (filters.date === "today") {
            return submissionTime >= today
          } else if (filters.date === "week") {
            return submissionTime >= weekAgo
          } else if (filters.date === "month") {
            return submissionTime >= monthAgo
          }
          return true
        })
      }

      if (filters.department && filters.department !== "all") {
        result = result.filter((emp) => emp.department === filters.department)
      }

      if (filters.source) {
        result = result.filter((emp) => emp.source === filters.source)
      }

      if (filters.status && filters.status !== "all") {
        result = result.filter((emp) => emp.status === filters.status)
      }
    }

    return result
  },

  // Get pending employee by ID
  getPendingEmployeeById: async (id: string): Promise<PendingEmployee | null> => {
    await delay(300)
    return pendingEmployees.find((emp) => emp.id === id) || null
  },

  // Approve pending employee with comment and email notification
  approvePendingEmployee: async (id: string, comment = ""): Promise<Employee> => {
    await delay(800)
    const pendingIndex = pendingEmployees.findIndex((emp) => emp.id === id)
    if (pendingIndex === -1) throw new Error("Pending employee not found")

    const pendingEmp = pendingEmployees[pendingIndex]

    // Create new employee from pending employee
    const newId = `EMP${Math.floor(10000 + Math.random() * 90000)}`
    const newEmployee: Employee = {
      id: newId,
      name: pendingEmp.name,
      email: pendingEmp.email,
      department: pendingEmp.department,
      position: pendingEmp.position,
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
    }

    // Add to employees and remove from pending
    employees = [...employees, newEmployee]
    pendingEmployees = [...pendingEmployees.slice(0, pendingIndex), ...pendingEmployees.slice(pendingIndex + 1)]

    // Send email notification
    try {
      await EmailService.sendEmail(pendingEmp.email, "Registration Approved", "registration_approved", {
        employeeName: pendingEmp.name,
        employeeId: newId,
        comment,
      })
    } catch (error) {
      console.error("Failed to send approval email:", error)
      // Continue with the approval even if email fails
    }

    return newEmployee
  },

  // Reject pending employee with comment and email notification
  rejectPendingEmployee: async (id: string, comment: string): Promise<boolean> => {
    await delay(500)
    const index = pendingEmployees.findIndex((emp) => emp.id === id)
    if (index === -1) return false

    const pendingEmp = pendingEmployees[index]

    // Send rejection email before removing from the system
    try {
      await EmailService.sendEmail(pendingEmp.email, "Registration Rejected", "registration_rejected", {
        employeeName: pendingEmp.name,
        registrationId: pendingEmp.id,
        comment,
      })
    } catch (error) {
      console.error("Failed to send rejection email:", error)
      // Continue with the rejection even if email fails
    }

    pendingEmployees = [...pendingEmployees.slice(0, index), ...pendingEmployees.slice(index + 1)]
    return true
  },

  // Add multiple pending employees in ascending order without overriding existing data
  addMultiplePendingEmployeesInOrder: async (
    newEmployees: Omit<PendingEmployee, "id">[],
  ): Promise<{ added: PendingEmployee[]; emailsSent: any[] }> => {
    await delay(1500) // Longer delay for bulk operation

    const addedEmployees: PendingEmployee[] = []
    const emailsSent: any[] = []

    // Sort new employees by name in ascending order
    const sortedNewEmployees = [...newEmployees].sort((a, b) => a.name.localeCompare(b.name))

    for (const emp of sortedNewEmployees) {
      const newId = generateId("REG")
      const newEmployee = { ...emp, id: newId }
      addedEmployees.push(newEmployee)

      // If employee has missing fields, send an email notification
      if (emp.missingFields && emp.missingFields.length > 0) {
        const emailId = generateId("EMAIL")
        const updateLink = `https://ippis.gov.ng/update-profile/${newId}`

        const emailNotification: any = {
          id: emailId,
          to: emp.email,
          subject: "IPPIS: Complete Your Employee Profile",
          body: `
Dear ${emp.name},

Your employee record has been imported into the IPPIS system, but some information is missing. 
Please click the link below to complete your profile:

${updateLink}

The following information is missing:
${emp.missingFields.join(", ")}

Thank you,
IPPIS Admin Team
          `,
          sentAt: new Date().toISOString(),
          status: "sent",
        }

        emailNotifications.push(emailNotification)
        emailsSent.push(emailNotification)
      }

      // Send document upload link to all imported employees
      try {
        const documentUploadEmail = await DocumentUploadEmailService.sendDocumentUploadLink({
          employeeId: newEmployee.id,
          employeeName: newEmployee.name,
          email: newEmployee.email,
        })

        emailsSent.push(documentUploadEmail)
      } catch (error) {
        console.error("Failed to send document upload email:", error)
      }
    }

    // Add new employees to the existing list and sort the entire list by name
    pendingEmployees = [...pendingEmployees, ...addedEmployees].sort((a, b) => a.name.localeCompare(b.name))

    return { added: addedEmployees, emailsSent }
  },

  // Original method kept for backward compatibility
  addMultiplePendingEmployees: async (
    employees: Omit<PendingEmployee, "id">[],
  ): Promise<{ added: PendingEmployee[]; emailsSent: any[] }> => {
    // Now just calls the new method that maintains order
    return PendingEmployeeService.addMultiplePendingEmployeesInOrder(employees)
  },

  // Add a single pending employee - improved for direct form submissions
  addPendingEmployee: async (employee: Omit<PendingEmployee, "id">): Promise<PendingEmployee> => {
    await delay(700) // Simulate network delay

    // Generate a unique ID
    const newId = generateId("REG")

    // Create the complete employee object
    const newEmployee: PendingEmployee = {
      ...employee,
      id: newId,
      submissionDate: new Date().toISOString(), // Ensure submission date is set
    }

    // Add to the beginning of the array to make it more visible in the dashboard
    pendingEmployees = [newEmployee, ...pendingEmployees]

    // Log the addition for debugging
    console.log("New pending employee added:", newEmployee)

    // Send document upload link email
    try {
      await DocumentUploadEmailService.sendDocumentUploadLink({
        employeeId: newEmployee.id,
        employeeName: newEmployee.name,
        email: newEmployee.email,
      })
    } catch (error) {
      console.error("Failed to send document upload email:", error)
    }

    return newEmployee
  },
}
