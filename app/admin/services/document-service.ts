import type { Document } from "./mock-data-service"
import { EmailService } from "./email-service"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory storage for documents
let documents: Document[] = []

// Mock API service for Documents
export const DocumentService = {
  // Initialize with documents
  initialize: (initialDocuments: Document[]) => {
    documents = [...initialDocuments]
  },

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
    const newId = `DOC${Math.floor(10000 + Math.random() * 90000)}`
    const newDocument = { ...document, id: newId }
    documents = [...documents, newDocument]
    return newDocument
  },

  // Update document status with comment and email notification
  updateDocumentStatus: async (
    id: string,
    status: "verified" | "pending" | "rejected",
    comment = "",
  ): Promise<Document> => {
    await delay(500)
    const index = documents.findIndex((doc) => doc.id === id)
    if (index === -1) throw new Error("Document not found")

    const updatedDocument = { ...documents[index], status }
    documents = [...documents.slice(0, index), updatedDocument, ...documents.slice(index + 1)]

    // Send email notification
    try {
      if (status === "verified") {
        await EmailService.sendEmail(
          "employee@example.com", // In a real app, this would be the employee's email
          "Document Approved",
          "document_approved",
          {
            employeeName: updatedDocument.employeeName,
            documentName: updatedDocument.name,
            documentId: updatedDocument.id,
            comment,
          },
        )
      } else if (status === "rejected") {
        await EmailService.sendEmail(
          "employee@example.com", // In a real app, this would be the employee's email
          "Document Rejected",
          "document_rejected",
          {
            employeeName: updatedDocument.employeeName,
            documentName: updatedDocument.name,
            documentId: updatedDocument.id,
            comment,
          },
        )
      }
    } catch (error) {
      console.error("Failed to send email notification:", error)
      // Continue with the update even if email fails
    }

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

  // Verify all documents for an employee with comment and email
  verifyAllDocumentsForEmployee: async (employeeId: string, comment = ""): Promise<Document[]> => {
    await delay(800)

    const employeeDocs = documents.filter((doc) => doc.employeeId === employeeId)
    const updatedDocs: Document[] = []
    let employeeName = ""

    for (const doc of employeeDocs) {
      if (doc.status === "pending") {
        const index = documents.findIndex((d) => d.id === doc.id)
        const updatedDoc = { ...doc, status: "verified" }
        documents[index] = updatedDoc
        updatedDocs.push(updatedDoc)
        employeeName = doc.employeeName
      } else {
        updatedDocs.push(doc)
      }
    }

    // Send a single email for all approved documents
    if (updatedDocs.length > 0 && employeeName) {
      try {
        await EmailService.sendEmail(
          "employee@example.com", // In a real app, this would be the employee's email
          "Documents Approved",
          "document_approved",
          {
            employeeName,
            documentName: "multiple documents",
            comment,
          },
        )
      } catch (error) {
        console.error("Failed to send email notification:", error)
      }
    }

    return updatedDocs
  },

  // Reject all documents for an employee with comment and email
  rejectAllDocumentsForEmployee: async (employeeId: string, comment: string): Promise<Document[]> => {
    await delay(800)

    const employeeDocs = documents.filter((doc) => doc.employeeId === employeeId)
    const updatedDocs: Document[] = []
    let employeeName = ""

    for (const doc of employeeDocs) {
      if (doc.status === "pending") {
        const index = documents.findIndex((d) => d.id === doc.id)
        const updatedDoc = { ...doc, status: "rejected" }
        documents[index] = updatedDoc
        updatedDocs.push(updatedDoc)
        employeeName = doc.employeeName
      } else {
        updatedDocs.push(doc)
      }
    }

    // Send a single email for all rejected documents
    if (updatedDocs.length > 0 && employeeName) {
      try {
        await EmailService.sendEmail(
          "employee@example.com", // In a real app, this would be the employee's email
          "Documents Rejected",
          "document_rejected",
          {
            employeeName,
            documentName: "multiple documents",
            comment,
          },
        )
      } catch (error) {
        console.error("Failed to send email notification:", error)
      }
    }

    return updatedDocs
  },
}
