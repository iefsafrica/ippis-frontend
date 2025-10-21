import { pgTable, serial, text, timestamp, integer, json } from "drizzle-orm/pg-core"

// Employees table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  department: text("department").notNull(),
  position: text("position").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, pending
  joinDate: timestamp("join_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  metadata: json("metadata"),
})

// Pending employees table
export const pendingEmployees = pgTable("pending_employees", {
  id: serial("id").primaryKey(),
  registrationId: text("registration_id").notNull().unique(),
  surname: text("surname").notNull(),
  firstname: text("firstname").notNull(),
  email: text("email").notNull(),
  department: text("department"),
  position: text("position"),
  status: text("status").notNull().default("pending_approval"), // pending_approval, document_verification, data_incomplete
  source: text("source").notNull().default("form"), // form, import
  submissionDate: timestamp("submission_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  missingFields: json("missing_fields"),
  metadata: json("metadata"),
})

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  documentId: text("document_id").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Appointment Letter, Educational Certificate, etc.
  employeeId: text("employee_id").notNull(),
  employeeName: text("employee_name").notNull(),
  status: text("status").notNull().default("pending"), // verified, pending, rejected
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  verifiedDate: timestamp("verified_date"),
  rejectedDate: timestamp("rejected_date"),
  verifiedBy: text("verified_by"),
  rejectedBy: text("rejected_by"),
  comments: text("comments"),
  fileUrl: text("file_url"),
  fileType: text("file_type"),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Activities table for audit trail
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(), // approved, rejected, verified, etc.
  entityType: text("entity_type").notNull(), // employee, document, etc.
  entityId: text("entity_id").notNull(),
  description: text("description").notNull(),
  performedBy: text("performed_by").notNull(),
  performedAt: timestamp("performed_at").notNull().defaultNow(),
  metadata: json("metadata"),
})

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Backups table
export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  backupId: text("backup_id").notNull().unique(),
  name: text("name"),
  type: text("type").notNull(), // full, incremental, differential
  status: text("status").notNull(), // completed, failed
  size: text("size"),
  location: text("location").notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  metadata: json("metadata"),
})
