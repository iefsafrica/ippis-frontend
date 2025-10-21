export interface Document {
  id: string
  name: string
  type: string
  employeeId: string
  employeeName: string
  status: "verified" | "pending" | "rejected"
  uploadDate: string
  fileUrl?: string
  fileType?: string
  fileSize?: number
  comments?: string
}

export interface DocumentFilters {
  search?: string
  status?: string
  type?: string
  employeeId?: string
  page?: number
  limit?: number
}

export const DocumentService = {
  // Get all documents with filtering
  getDocuments: async (filters?: DocumentFilters): Promise<Document[]> => {
    try {
      const queryParams = new URLSearchParams()

      if (filters?.search) queryParams.append("search", filters.search)
      if (filters?.status && filters.status !== "all") queryParams.append("status", filters.status)
      if (filters?.type && filters.type !== "all") queryParams.append("type", filters.type)
      if (filters?.employeeId) queryParams.append("employeeId", filters.employeeId)
      if (filters?.page) queryParams.append("page", filters.page.toString())
      if (filters?.limit) queryParams.append("limit", filters.limit.toString())

      const response = await fetch(`/api/admin/documents?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching documents: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data.documents
    } catch (error) {
      console.error("Failed to fetch documents:", error)
      throw error
    }
  },

  // Get document by ID
  getDocumentById: async (id: string): Promise<Document | null> => {
    try {
      const response = await fetch(`/api/admin/documents/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Error fetching document: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(`Failed to fetch document with ID ${id}:`, error)
      throw error
    }
  },

  // Get documents by employee ID
  getDocumentsByEmployeeId: async (employeeId: string): Promise<Document[]> => {
    try {
      const response = await fetch(`/api/admin/documents?employeeId=${employeeId}`)

      if (!response.ok) {
        throw new Error(`Error fetching documents for employee: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data.documents
    } catch (error) {
      console.error(`Failed to fetch documents for employee ${employeeId}:`, error)
      throw error
    }
  },

  // Update document status with comment
  updateDocumentStatus: async (
    id: string,
    status: "verified" | "pending" | "rejected",
    comment = "",
  ): Promise<Document> => {
    try {
      const response = await fetch(`/api/admin/documents/${id}/${status}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      })

      if (!response.ok) {
        throw new Error(`Error updating document status: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(`Failed to update document ${id} status to ${status}:`, error)
      throw error
    }
  },

  // Verify all documents for an employee with comment
  verifyAllDocumentsForEmployee: async (employeeId: string, comment = ""): Promise<Document[]> => {
    try {
      const response = await fetch(`/api/admin/documents/employee/${employeeId}/verify-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      })

      if (!response.ok) {
        throw new Error(`Error verifying all documents: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(`Failed to verify all documents for employee ${employeeId}:`, error)
      throw error
    }
  },

  // Reject all documents for an employee with comment
  rejectAllDocumentsForEmployee: async (employeeId: string, comment: string): Promise<Document[]> => {
    try {
      const response = await fetch(`/api/admin/documents/employee/${employeeId}/reject-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      })

      if (!response.ok) {
        throw new Error(`Error rejecting all documents: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(`Failed to reject all documents for employee ${employeeId}:`, error)
      throw error
    }
  },
}
