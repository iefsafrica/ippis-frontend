// Types for our data models
export interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  status: "active" | "inactive" | "pending"
  joinDate: string
  avatar?: string
}

export interface PendingEmployee {
  id: string
  name: string
  email: string
  department: string
  position: string
  status: "document_verification" | "pending_approval" | "data_incomplete"
  submissionDate: string
  source: "form" | "import" // Track if employee came from form or import
  missingFields?: string[] // Track missing fields for imported employees
  avatar?: string
}

export interface Document {
  id: string
  name: string
  type:
    | "Appointment Letter"
    | "Educational Certificate"
    | "Promotion Letter"
    | "Other Document"
    | "Profile Image"
    | "Signature"
  employeeName: string
  employeeId: string
  status: "verified" | "pending" | "rejected"
  uploadDate: string
  fileUrl?: string // URL to the document file
  fileType?: string // MIME type of the file
  fileSize?: number // Size of the file in bytes
}

export interface EmailNotification {
  id: string
  to: string
  subject: string
  body: string
  sentAt: string
  status: "sent" | "failed"
}

// Initial mock data
const mockEmployees: Employee[] = [
  {
    id: "EMP12345",
    name: "John Doe",
    email: "john.doe@example.com",
    department: "Finance",
    position: "Senior Accountant",
    status: "active",
    joinDate: "2023-01-15",
  },
  {
    id: "EMP12346",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    department: "HR",
    position: "HR Manager",
    status: "active",
    joinDate: "2022-11-05",
  },
  {
    id: "EMP12347",
    name: "Michael Johnson",
    email: "michael.j@example.com",
    department: "IT",
    position: "Systems Administrator",
    status: "active",
    joinDate: "2023-03-22",
  },
  {
    id: "EMP12348",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    department: "Operations",
    position: "Operations Director",
    status: "inactive",
    joinDate: "2021-08-10",
  },
  {
    id: "EMP12349",
    name: "Robert Brown",
    email: "robert.b@example.com",
    department: "Legal",
    position: "Legal Counsel",
    status: "active",
    joinDate: "2022-05-18",
  },
]

const mockPendingEmployees: PendingEmployee[] = [
  {
    id: "REG54321",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    department: "Finance",
    position: "Accountant",
    status: "document_verification",
    submissionDate: "2023-11-20",
    source: "form",
  },
  {
    id: "REG54322",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    department: "HR",
    position: "HR Assistant",
    status: "pending_approval",
    submissionDate: "2023-11-19",
    source: "form",
  },
  {
    id: "REG54323",
    name: "Carol White",
    email: "carol.w@example.com",
    department: "IT",
    position: "Software Engineer",
    status: "pending_approval",
    submissionDate: "2023-11-18",
    source: "form",
  },
]

// Generate mock documents for each employee and pending employee
const generateMockDocuments = () => {
  const docs: Document[] = []

  // Document types from registration form
  const documentTypes: Document["type"][] = [
    "Appointment Letter",
    "Educational Certificate",
    "Promotion Letter",
    "Other Document",
    "Profile Image",
    "Signature",
  ]

  // Generate documents for active employees
  mockEmployees.forEach((employee) => {
    documentTypes.forEach((type) => {
      // Not all employees have all document types
      if (Math.random() > 0.2) {
        // 80% chance to have a document
        docs.push({
          id: `DOC${Math.floor(10000 + Math.random() * 90000)}`,
          name: `${type} - ${employee.name}`,
          type,
          employeeName: employee.name,
          employeeId: employee.id,
          status: Math.random() > 0.3 ? "verified" : "pending", // 70% chance to be verified
          uploadDate: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
            .toISOString()
            .split("T")[0], // Random date within last 90 days
          fileSize: Math.floor(100000 + Math.random() * 1900000), // 100KB to 2MB
          fileType: type === "Profile Image" || type === "Signature" ? "image/jpeg" : "application/pdf",
        })
      }
    })
  })

  // Generate documents for pending employees
  mockPendingEmployees.forEach((employee) => {
    documentTypes.forEach((type) => {
      // Pending employees have more pending documents
      if (Math.random() > 0.3) {
        // 70% chance to have a document
        docs.push({
          id: `DOC${Math.floor(10000 + Math.random() * 90000)}`,
          name: `${type} - ${employee.name}`,
          type,
          employeeName: employee.name,
          employeeId: employee.id,
          status: "pending", // All documents from pending employees are pending
          uploadDate: employee.submissionDate,
          fileSize: Math.floor(100000 + Math.random() * 1900000), // 100KB to 2MB
          fileType: type === "Profile Image" || type === "Signature" ? "image/jpeg" : "application/pdf",
        })
      }
    })
  })

  return docs
}

const mockDocuments: Document[] = generateMockDocuments()
const mockEmailNotifications: EmailNotification[] = []

// In-memory storage
let employees = [...mockEmployees]
let pendingEmployees = [...mockPendingEmployees]
let documents = [...mockDocuments]
const emailNotifications = [...mockEmailNotifications]

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper function to generate a unique ID
const generateId = (prefix: string) => {
  return `${prefix}${Math.floor(10000 + Math.random() * 90000)}`
}

// Mock API service for Employees
export const EmployeeService = {
  // Get all employees with optional filtering
  getEmployees: async (filters?: {
    search?: string
    status?: string
    department?: string
  }): Promise<Employee[]> => {
    await delay(500) // Simulate network delay

    let result = [...employees]

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

      if (filters.status && filters.status !== "all") {
        result = result.filter((emp) => emp.status === filters.status)
      }

      if (filters.department && filters.department !== "all") {
        result = result.filter((emp) => emp.department === filters.department)
      }
    }

    return result
  },

  // Get employee by ID
  getEmployeeById: async (id: string): Promise<Employee | null> => {
    await delay(300)
    return employees.find((emp) => emp.id === id) || null
  },

  // Add new employee
  addEmployee: async (employee: Omit<Employee, "id">): Promise<Employee> => {
    await delay(700)
    const newId = generateId("EMP")
    const newEmployee = { ...employee, id: newId }
    employees = [...employees, newEmployee]
    return newEmployee
  },

  // Update employee
  updateEmployee: async (id: string, updates: Partial<Employee>): Promise<Employee> => {
    await delay(600)
    const index = employees.findIndex((emp) => emp.id === id)
    if (index === -1) throw new Error("Employee not found")

    const updatedEmployee = { ...employees[index], ...updates }
    employees = [...employees.slice(0, index), updatedEmployee, ...employees.slice(index + 1)]
    return updatedEmployee
  },

  // Delete employee
  deleteEmployee: async (id: string): Promise<boolean> => {
    await delay(500)
    const index = employees.findIndex((emp) => emp.id === id)
    if (index === -1) return false

    employees = [...employees.slice(0, index), ...employees.slice(index + 1)]
    return true
  },
}

// Mock API service for Pending Employees
export const PendingEmployeeService = {
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

  // Add new pending employee
  addPendingEmployee: async (employee: Omit<PendingEmployee, "id">): Promise<PendingEmployee> => {
    await delay(700)
    const newId = generateId("REG")
    const newEmployee = { ...employee, id: newId }
    pendingEmployees = [...pendingEmployees, newEmployee]
    return newEmployee
  },

  // Add multiple pending employees (for CSV import)
  addMultiplePendingEmployees: async (
    employees: Omit<PendingEmployee, "id">[],
  ): Promise<{ added: PendingEmployee[]; emailsSent: EmailNotification[] }> => {
    await delay(1500) // Longer delay for bulk operation

    const addedEmployees: PendingEmployee[] = []
    const emailsSent: EmailNotification[] = []

    for (const emp of employees) {
      const newId = generateId("REG")
      const newEmployee = { ...emp, id: newId }
      addedEmployees.push(newEmployee)

      // If employee has missing fields, send an email notification
      if (emp.missingFields && emp.missingFields.length > 0) {
        const emailId = generateId("EMAIL")
        const updateLink = `https://ippis.gov.ng/update-profile/${newId}`

        const emailNotification: EmailNotification = {
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
    }

    pendingEmployees = [...pendingEmployees, ...addedEmployees]
    return { added: addedEmployees, emailsSent }
  },

  // Update pending employee
  updatePendingEmployee: async (id: string, updates: Partial<PendingEmployee>): Promise<PendingEmployee> => {
    await delay(600)
    const index = pendingEmployees.findIndex((emp) => emp.id === id)
    if (index === -1) throw new Error("Pending employee not found")

    const updatedEmployee = { ...pendingEmployees[index], ...updates }
    pendingEmployees = [...pendingEmployees.slice(0, index), updatedEmployee, ...pendingEmployees.slice(index + 1)]
    return updatedEmployee
  },

  // Delete pending employee
  deletePendingEmployee: async (id: string): Promise<boolean> => {
    await delay(500)
    const index = pendingEmployees.findIndex((emp) => emp.id === id)
    if (index === -1) return false

    pendingEmployees = [...pendingEmployees.slice(0, index), ...pendingEmployees.slice(index + 1)]
    return true
  },

  // Approve pending employee (move to employees)
  approvePendingEmployee: async (id: string): Promise<Employee> => {
    await delay(800)
    const pendingIndex = pendingEmployees.findIndex((emp) => emp.id === id)
    if (pendingIndex === -1) throw new Error("Pending employee not found")

    const pendingEmp = pendingEmployees[pendingIndex]

    // Create new employee from pending employee
    const newId = generateId("EMP")
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

    return newEmployee
  },

  // Reject pending employee
  rejectPendingEmployee: async (id: string): Promise<boolean> => {
    await delay(500)
    const index = pendingEmployees.findIndex((emp) => emp.id === id)
    if (index === -1) return false

    pendingEmployees = [...pendingEmployees.slice(0, index), ...pendingEmployees.slice(index + 1)]
    return true
  },

  initialize: (initialPendingEmployees: PendingEmployee[], initialEmployees: Employee[]) => {
    pendingEmployees = [...initialPendingEmployees]
    employees = [...initialEmployees]
  },
}

// Mock API service for Documents
export const DocumentService = {
  // Get all documents with filtering
  getDocuments: async (filters?: {
    search?: string
    status?: string
    type?: string
    employeeId?: string
  }): Promise<Document[]> => {
    await delay(500)

    let result = [...documents]

    if (filters) {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        result = result.filter(
          (doc) =>
            doc.name.toLowerCase().includes(searchTerm) ||
            doc.employeeName.toLowerCase().includes(searchTerm) ||
            doc.id.toLowerCase().includes(searchTerm) ||
            doc.employeeId.toLowerCase().includes(searchTerm),
        )
      }

      if (filters.status && filters.status !== "all") {
        result = result.filter((doc) => doc.status === filters.status)
      }

      if (filters.type && filters.type !== "all") {
        result = result.filter((doc) => doc.type === filters.type)
      }

      if (filters.employeeId) {
        result = result.filter((doc) => doc.employeeId === filters.employeeId)
      }
    }

    return result
  },

  // Get document by ID
  getDocumentById: async (id: string): Promise<Document | null> => {
    await delay(300)
    return documents.find((doc) => doc.id === id) || null
  },

  // Get documents by employee ID
  getDocumentsByEmployeeId: async (employeeId: string): Promise<Document[]> => {
    await delay(400)
    return documents.filter((doc) => doc.employeeId === employeeId)
  },

  // Add new document
  addDocument: async (document: Omit<Document, "id">): Promise<Document> => {
    await delay(700)
    const newId = generateId("DOC")
    const newDocument = { ...document, id: newId }
    documents = [...documents, newDocument]
    return newDocument
  },

  // Add documents from registration form
  addDocumentsFromRegistration: async (
    employeeId: string,
    employeeName: string,
    files: Record<string, File>,
  ): Promise<Document[]> => {
    await delay(1000)

    const newDocuments: Document[] = []

    // Map file keys to document types
    const fileTypeMap: Record<string, Document["type"]> = {
      appointmentLetter: "Appointment Letter",
      educationalCertificates: "Educational Certificate",
      promotionLetter: "Promotion Letter",
      otherDocuments: "Other Document",
      profileImage: "Profile Image",
      signature: "Signature",
    }

    // Create a document for each file
    for (const [key, file] of Object.entries(files)) {
      if (file) {
        const docType = fileTypeMap[key]
        if (docType) {
          const newDoc: Document = {
            id: generateId("DOC"),
            name: `${docType} - ${employeeName}`,
            type: docType,
            employeeName,
            employeeId,
            status: "pending",
            uploadDate: new Date().toISOString().split("T")[0],
            fileSize: file.size,
            fileType: file.type,
            fileUrl: URL.createObjectURL(file), // This would be a server URL in a real app
          }

          newDocuments.push(newDoc)
          documents = [...documents, newDoc]
        }
      }
    }

    return newDocuments
  },

  // Update document status
  updateDocumentStatus: async (id: string, status: "verified" | "pending" | "rejected"): Promise<Document> => {
    await delay(500)
    const index = documents.findIndex((doc) => doc.id === id)
    if (index === -1) throw new Error("Document not found")

    const updatedDocument = { ...documents[index], status }
    documents = [...documents.slice(0, index), updatedDocument, ...documents.slice(index + 1)]
    return updatedDocument
  },

  // Delete document
  deleteDocument: async (id: string): Promise<boolean> => {
    await delay(500)
    const index = documents.findIndex((doc) => doc.id === id)
    if (index === -1) return false

    documents = [...documents.slice(0, index), ...documents.slice(index + 1)]
    return true
  },

  // Verify all documents for an employee
  verifyAllDocumentsForEmployee: async (employeeId: string): Promise<Document[]> => {
    await delay(800)

    const employeeDocs = documents.filter((doc) => doc.employeeId === employeeId)
    const updatedDocs: Document[] = []

    for (const doc of employeeDocs) {
      if (doc.status === "pending") {
        const index = documents.findIndex((d) => d.id === doc.id)
        const updatedDoc = { ...doc, status: "verified" }
        documents[index] = updatedDoc
        updatedDocs.push(updatedDoc)
      } else {
        updatedDocs.push(doc)
      }
    }

    return updatedDocs
  },

  // Reject all documents for an employee
  rejectAllDocumentsForEmployee: async (employeeId: string): Promise<Document[]> => {
    await delay(800)

    const employeeDocs = documents.filter((doc) => doc.employeeId === employeeId)
    const updatedDocs: Document[] = []

    for (const doc of employeeDocs) {
      if (doc.status === "pending") {
        const index = documents.findIndex((d) => d.id === doc.id)
        const updatedDoc = { ...doc, status: "rejected" }
        documents[index] = updatedDoc
        updatedDocs.push(updatedDoc)
      } else {
        updatedDocs.push(doc)
      }
    }

    return updatedDocs
  },

  initialize: (initialDocuments: Document[]) => {
    documents = [...initialDocuments]
  },
}

// Mock API service for CSV Import
export const ImportService = {
  // Process CSV file
  processCSVFile: async (
    file: File,
    requiredFields: string[],
  ): Promise<{
    success: boolean
    message: string
    totalRecords: number
    validRecords: number
    invalidRecords: number
    pendingEmployees: PendingEmployee[]
    emailsSent: EmailNotification[]
  }> => {
    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return {
        success: false,
        message: "File size exceeds the maximum limit of 20MB",
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        pendingEmployees: [],
        emailsSent: [],
      }
    }

    // Check file type (only CSV)
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return {
        success: false,
        message: "Only CSV files are accepted",
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        pendingEmployees: [],
        emailsSent: [],
      }
    }

    // Simulate processing the CSV file
    await delay(2000) // Longer delay to simulate processing

    // Generate random number of records (10-20)
    const totalRecords = Math.floor(10 + Math.random() * 11)

    // Generate random number of valid records (60-90% of total)
    const validRecords = Math.floor(totalRecords * (0.6 + Math.random() * 0.3))
    const invalidRecords = totalRecords - validRecords

    // Generate mock pending employees from the "CSV"
    const pendingEmployeesFromCSV: Omit<PendingEmployee, "id">[] = []

    const departments = ["Finance", "HR", "IT", "Operations", "Legal", "Marketing"]
    const positions = {
      Finance: ["Accountant", "Financial Analyst", "Auditor"],
      HR: ["HR Assistant", "Recruitment Specialist", "Training Coordinator"],
      IT: ["Software Engineer", "Systems Administrator", "IT Support"],
      Operations: ["Operations Analyst", "Project Coordinator", "Business Analyst"],
      Legal: ["Legal Assistant", "Paralegal", "Contract Specialist"],
      Marketing: ["Marketing Coordinator", "Content Creator", "Digital Marketer"],
    }

    for (let i = 0; i < validRecords; i++) {
      // Randomly determine if this record has missing fields
      const hasMissingFields = Math.random() > 0.3 // 70% chance of having missing fields

      // Randomly select which fields are missing
      const missingFields: string[] = []
      if (hasMissingFields) {
        const possibleMissingFields = ["phone", "address", "emergency_contact", "bank_details", "qualification"]
        const numMissingFields = Math.floor(1 + Math.random() * 3) // 1-3 missing fields

        for (let j = 0; j < numMissingFields; j++) {
          const randomField = possibleMissingFields[Math.floor(Math.random() * possibleMissingFields.length)]
          if (!missingFields.includes(randomField)) {
            missingFields.push(randomField)
          }
        }
      }

      // Generate a random department
      const department = departments[Math.floor(Math.random() * departments.length)]
      // @ts-ignore - TypeScript doesn't know that department is a key of positions
      const departmentPositions = positions[department]
      const position = departmentPositions[Math.floor(Math.random() * departmentPositions.length)]

      // Generate a random name
      const firstNames = [
        "James",
        "Mary",
        "John",
        "Patricia",
        "Robert",
        "Jennifer",
        "Michael",
        "Linda",
        "William",
        "Elizabeth",
      ]
      const lastNames = [
        "Smith",
        "Johnson",
        "Williams",
        "Jones",
        "Brown",
        "Davis",
        "Miller",
        "Wilson",
        "Moore",
        "Taylor",
      ]
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const name = `${firstName} ${lastName}`

      // Generate email based on name
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`

      pendingEmployeesFromCSV.push({
        name,
        email,
        department,
        position,
        status: hasMissingFields ? "data_incomplete" : "pending_approval",
        submissionDate: new Date().toISOString().split("T")[0],
        source: "import",
        missingFields: hasMissingFields ? missingFields : undefined,
      })
    }

    // Add the pending employees to the database without overriding existing data
    // and ensure they are added in ascending order
    const { added, emailsSent } =
      await PendingEmployeeService.addMultiplePendingEmployeesInOrder(pendingEmployeesFromCSV)

    return {
      success: true,
      message: `Successfully processed ${validRecords} out of ${totalRecords} records`,
      totalRecords,
      validRecords,
      invalidRecords,
      pendingEmployees: added,
      emailsSent,
    }
  },

  // Get email notifications
  getEmailNotifications: async (): Promise<EmailNotification[]> => {
    await delay(300)
    return [...emailNotifications]
  },
}

// Dashboard statistics service
export const DashboardService = {
  getStatistics: async (): Promise<{
    totalEmployees: number
    activeEmployees: number
    pendingRegistrations: number
    documentVerifications: number
    employeesByStatus: { status: string; count: number }[]
    recentActivity: { action: string; user: string; time: string; description: string }[]
  }> => {
    await delay(700)

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((emp) => emp.status === "active").length,
      pendingRegistrations: pendingEmployees.length,
      documentVerifications: documents.filter((doc) => doc.status === "pending").length,
      employeesByStatus: [
        { status: "Active", count: employees.filter((emp) => emp.status === "active").length },
        { status: "Pending", count: pendingEmployees.length },
        { status: "Inactive", count: employees.filter((emp) => emp.status === "inactive").length },
      ],
      recentActivity: [
        {
          action: "approved",
          user: "Admin User",
          time: "10 minutes ago",
          description: "Approved employee registration for Alice Johnson",
        },
        {
          action: "verified",
          user: "Admin User",
          time: "25 minutes ago",
          description: "Verified educational certificate for John Doe",
        },
        {
          action: "rejected",
          user: "Admin User",
          time: "1 hour ago",
          description: "Rejected document upload from Sarah Williams",
        },
        { action: "added", user: "Admin User", time: "2 hours ago", description: "Added new employee Michael Johnson" },
        {
          action: "updated",
          user: "Admin User",
          time: "3 hours ago",
          description: "Updated employee information for Jane Smith",
        },
      ],
    }
  },

  getChartData: async (): Promise<{
    labels: string[]
    datasets: {
      label: string
      data: number[]
    }[]
  }> => {
    await delay(500)

    // Generate some random data for the chart
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "New Registrations",
          data: [65, 78, 52, 91, 43, 56, 61, 87, 75, 64, 68, 81],
        },
        {
          label: "Verifications",
          data: [45, 60, 43, 75, 35, 42, 55, 70, 60, 54, 59, 70],
        },
      ],
    }
  },
}

// Add this at the end of the file, after all the other service initializations
// Initialize the document service with our documents
DocumentService.initialize(documents)

// Initialize the pending employee service
PendingEmployeeService.initialize(pendingEmployees, employees)
