import { parse } from "csv-parse/sync"

export interface CSVValidationOptions {
  requiredFields: string[]
  dateFields?: string[]
  emailFields?: string[]
  numericFields?: string[]
}

export interface CSVValidationResult {
  success: boolean
  records: Record<string, string>[]
  validRecords: Record<string, string>[]
  invalidRecords: Record<string, string>[]
  errors: string[]
  warnings: string[]
  missingFieldsByRecord: Record<string, string[]>[]
  totalRecords: number
  validRecordsCount: number
  invalidRecordsCount: number
}

export function validateCSV(csvContent: string, options: CSVValidationOptions): CSVValidationResult {
  try {
    // Parse CSV content
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[]

    const result: CSVValidationResult = {
      success: true,
      records,
      validRecords: [],
      invalidRecords: [],
      errors: [],
      warnings: [],
      missingFieldsByRecord: [],
      totalRecords: records.length,
      validRecordsCount: 0,
      invalidRecordsCount: 0,
    }

    // No records found
    if (records.length === 0) {
      result.success = false
      result.errors.push("No records found in the CSV file")
      return result
    }

    // Check if all required fields are present in the header
    const headers = Object.keys(records[0])
    const missingHeaders = options.requiredFields.filter((field) => !headers.includes(field))

    if (missingHeaders.length > 0) {
      result.success = false
      result.errors.push(`Missing required columns in CSV header: ${missingHeaders.join(", ")}`)
      return result
    }

    // Validate each record
    records.forEach((record, index) => {
      const missingFields: string[] = []
      const recordErrors: string[] = []

      // Check required fields
      options.requiredFields.forEach((field) => {
        if (!record[field] || record[field].trim() === "") {
          missingFields.push(field)
        }
      })

      // Validate date fields
      if (options.dateFields) {
        options.dateFields.forEach((field) => {
          if (record[field] && !isValidDate(record[field])) {
            recordErrors.push(`Invalid date format for ${field}: ${record[field]}. Expected format: YYYY-MM-DD`)
          }
        })
      }

      // Validate email fields
      if (options.emailFields) {
        options.emailFields.forEach((field) => {
          if (record[field] && !isValidEmail(record[field])) {
            recordErrors.push(`Invalid email format for ${field}: ${record[field]}`)
          }
        })
      }

      // Validate numeric fields
      if (options.numericFields) {
        options.numericFields.forEach((field) => {
          if (record[field] && !isValidNumber(record[field])) {
            recordErrors.push(`Invalid numeric value for ${field}: ${record[field]}`)
          }
        })
      }

      // Add record to valid or invalid list
      if (missingFields.length > 0 || recordErrors.length > 0) {
        result.invalidRecords.push(record)
        result.invalidRecordsCount++

        // Add record-specific errors to warnings
        if (recordErrors.length > 0) {
          result.warnings.push(`Row ${index + 2}: ${recordErrors.join("; ")}`)
        }

        // Track missing fields for this record
        result.missingFieldsByRecord.push({
          rowIndex: (index + 2).toString(),
          fields: missingFields,
        })
      } else {
        result.validRecords.push(record)
        result.validRecordsCount++
      }
    })

    // Add summary warnings
    if (result.invalidRecordsCount > 0) {
      result.warnings.unshift(
        `${result.invalidRecordsCount} out of ${result.totalRecords} records have validation issues`,
      )
    }

    // Set overall success
    result.success = result.validRecordsCount > 0

    return result
  } catch (error) {
    return {
      success: false,
      records: [],
      validRecords: [],
      invalidRecords: [],
      errors: [error instanceof Error ? error.message : "Failed to parse CSV file"],
      warnings: [],
      missingFieldsByRecord: [],
      totalRecords: 0,
      validRecordsCount: 0,
      invalidRecordsCount: 0,
    }
  }
}

// Helper functions for validation
function isValidDate(dateString: string): boolean {
  // Check if the date is in YYYY-MM-DD format
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  // Check if it's a valid date
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function isValidNumber(value: string): boolean {
  return !isNaN(Number(value))
}
