import type { Employee } from "@/types/employees/employee-management"

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 32
const NA = "N/A"

const escapePdfText = (text: string) =>
  String(text)
    .replace(/\r?\n/g, " ")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")

const bytesToHex = (bytes: Uint8Array) => {
  let output = ""
  for (let i = 0; i < bytes.length; i += 1) {
    output += bytes[i].toString(16).padStart(2, "0")
  }
  return output
}

const safeValue = (value?: string | number | null) =>
  value != null && `${value}`.trim() !== "" ? `${value}` : NA

const formatDate = (value?: string | null) => {
  if (!value || value === NA) return NA
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return NA
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

const formatDateTime = (value?: string | null) => {
  if (!value || value === NA) return NA
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return NA
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const normalizeRecord = (value: Employee["metadata"] | string | null | undefined) => {
  if (!value) return {}

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.entries(parsed).reduce<Record<string, string>>((acc, [key, entry]) => {
          if (entry === null || entry === undefined) return acc
          acc[key] = String(entry)
          return acc
        }, {})
      }
    } catch {
      return {}
    }

    return {}
  }

  return Object.entries(value).reduce<Record<string, string>>((acc, [key, entry]) => {
    if (entry === null || entry === undefined) return acc
    acc[key] = String(entry)
    return acc
  }, {})
}

const getValue = (employee: Employee, keys: string[]) => {
  const metadata = normalizeRecord(employee.metadata)

  for (const key of keys) {
    const directValue = (employee as unknown as Record<string, unknown>)[key]
    if (directValue != null && `${directValue}`.trim() !== "") return `${directValue}`

    const metadataValue = metadata[key]
    if (metadataValue != null && `${metadataValue}`.trim() !== "") return metadataValue
  }

  return NA
}

const buildPdfDocumentFromObjects = (sourceObjects: string[]) => {
  const objects = [...sourceObjects]
  let pdf = "%PDF-1.4\n"
  const offsets: number[] = [0]

  objects.forEach((body, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${objects.length} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new TextEncoder().encode(pdf)
}

const loadPdfImageResource = async (source: string) => {
  if (typeof window === "undefined") return null

  try {
    const response = await fetch(source, { credentials: "same-origin" })
    if (!response.ok) return null

    const bytes = new Uint8Array(await response.arrayBuffer())
    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }))
    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
        image.onerror = () => reject(new Error(`Failed to load image: ${source}`))
        image.src = blobUrl
      })

      return { bytes, width: dimensions.width, height: dimensions.height }
    } finally {
      URL.revokeObjectURL(blobUrl)
    }
  } catch {
    return null
  }
}

const buildBrandedPdfDocument = (pages: string[], logo: { bytes: Uint8Array; width: number; height: number } | null) => {
  const objects: string[] = []

  const pushObject = (body: string) => {
    objects.push(body)
    return objects.length
  }

  const fontRegular = pushObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  const fontBold = pushObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
  const logoObject = logo
    ? pushObject(
        `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [ /ASCIIHexDecode /DCTDecode ] /Length ${
          bytesToHex(logo.bytes).length + 1
        } >>\nstream\n${bytesToHex(logo.bytes)}>\nendstream`,
      )
    : null

  const pageObjectNumbers: number[] = []
  const pageContentObjects: number[] = []

  pages.forEach((pageContent) => {
    const contentObject = pushObject(`<< /Length ${pageContent.length} >>\nstream\n${pageContent}\nendstream`)
    pageContentObjects.push(contentObject)
    const pageObject = pushObject("<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 0 0 R /F2 0 0 R >> >> /Contents 0 0 R >>")
    pageObjectNumbers.push(pageObject)
  })

  const pagesObject = pushObject("<< /Type /Pages /Kids [] /Count 0 >>")
  const catalogObject = pushObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`)

  const kids = pageObjectNumbers.map((objectNumber) => `${objectNumber} 0 R`).join(" ")
  objects[pagesObject - 1] = `<< /Type /Pages /Kids [${kids}] /Count ${pageObjectNumbers.length} >>`

  pageObjectNumbers.forEach((pageObjectNumber, index) => {
    const contentObject = pageContentObjects[index]
    const resources = logoObject
      ? `<< /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> /XObject << /Im0 ${logoObject} 0 R >> >>`
      : `<< /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >>`
    objects[pageObjectNumber - 1] = `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources ${resources} /Contents ${contentObject} 0 R >>`
  })

  let pdf = "%PDF-1.4\n"
  const offsets: number[] = [0]
  objects.forEach((body) => {
    offsets.push(pdf.length)
    pdf += `${offsets.length - 1} 0 obj\n${body}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new TextEncoder().encode(pdf)
}

const toRgb = (red: number, green: number, blue: number) =>
  `${(red / 255).toFixed(3)} ${(green / 255).toFixed(3)} ${(blue / 255).toFixed(3)}`

const drawText = (
  commands: string[],
  text: string,
  x: number,
  y: number,
  options: { size?: number; bold?: boolean; align?: "left" | "center" | "right"; color?: [number, number, number] } = {},
) => {
  const size = options.size ?? 9
  const font = options.bold ? "F2" : "F1"
  const safeText = escapePdfText(text)
  const width = safeText.length * size * 0.52
  let drawX = x
  if (options.align === "center") drawX = x - width / 2
  if (options.align === "right") drawX = x - width

  if (options.color) {
    commands.push(`${toRgb(...options.color)} rg`)
  }
  commands.push(`BT /${font} ${size} Tf 1 0 0 1 ${drawX.toFixed(2)} ${y.toFixed(2)} Tm (${safeText}) Tj ET`)
  if (options.color) {
    commands.push("0 0 0 rg")
  }
}

const drawLine = (commands: string[], x1: number, y1: number, x2: number, y2: number) => {
  commands.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`)
}

const drawRect = (
  commands: string[],
  x: number,
  topY: number,
  width: number,
  height: number,
  fill: [number, number, number],
  stroke?: [number, number, number],
) => {
  const parts = ["q", `${toRgb(...fill)} rg`]
  if (stroke) {
    parts.push(`${toRgb(...stroke)} RG`, "1 w")
  }
  parts.push(`${x.toFixed(2)} ${(topY - height).toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`, stroke ? "B" : "f", "Q")
  commands.push(parts.join(" "))
}

const wrapText = (text: string, maxChars: number) => {
  const value = safeValue(text)
  if (value === NA) return [NA]

  const words = value.split(/\s+/)
  const lines: string[] = []
  let current = ""
  words.forEach((word) => {
    if (!current) {
      current = word
      return
    }
    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`
    } else {
      lines.push(current)
      current = word
    }
  })
  if (current) lines.push(current)
  return lines
}

const measureTextWidth = (text: string, size: number) => text.length * size * 0.52

const drawFieldLine = (commands: string[], label: string, value: string, x: number, y: number, width: number) => {
  const labelText = `${label}:`
  const labelSize = 6.7
  const valueSize = 7.2
  const labelWidth = measureTextWidth(labelText, labelSize)
  const valueStartX = x + labelWidth + 4
  const maxChars = Math.max(18, Math.floor((width - labelWidth - 4) / (valueSize * 0.52)))
  const valueLines = wrapText(value, maxChars).slice(0, 2)

  drawText(commands, labelText, x, y, { size: labelSize, bold: true, color: [8, 68, 52] })
  drawText(commands, valueLines[0] ?? NA, valueStartX, y, { size: valueSize, color: [15, 23, 42] })

  if (valueLines[1]) {
    drawText(commands, valueLines[1], valueStartX, y - 8, { size: valueSize, color: [15, 23, 42] })
    return 16
  }

  return 9
}

const drawSection = (commands: string[], title: string, fields: Array<{ label: string; value: string }>, x: number, y: number) => {
  drawText(commands, title, x, y, { size: 9, bold: true, color: [8, 145, 178] })
  drawLine(commands, x, y - 6, PAGE_WIDTH - x, y - 6)

  let currentY = y - 16
  const gap = 10
  const columns = 2
  const columnWidth = (PAGE_WIDTH - MARGIN * 2 - gap) / columns

  for (let index = 0; index < fields.length; index += columns) {
    const row = fields.slice(index, index + columns)
    const rowHeights = row.map((field, columnIndex) => {
      const fieldX = x + columnIndex * (columnWidth + gap)
      return drawFieldLine(commands, field.label, field.value, fieldX, currentY, columnWidth)
    })
    currentY -= Math.max(...rowHeights, 9) + 4
  }

  return currentY - 2
}

const buildPage = (
  employee: Employee,
  pageTitle: string,
  sections: Array<{ title: string; fields: Array<{ label: string; value: string }> }>,
  hasLogo: boolean,
) => {
  const commands: string[] = ["0 0 0 RG", "0 0 0 rg"]
  const logoBoxY = PAGE_HEIGHT - MARGIN
  drawRect(commands, MARGIN, logoBoxY, PAGE_WIDTH - MARGIN * 2, 74, [8, 68, 52])

  if (hasLogo) {
    commands.push(`q 34 0 0 34 ${MARGIN + 14} ${logoBoxY - 48} cm /Im0 Do Q`)
  }

  drawText(commands, "IPPIS", MARGIN + 62, logoBoxY - 18, { size: 16, bold: true, color: [255, 255, 255] })
  drawText(commands, pageTitle, MARGIN + 62, logoBoxY - 34, { size: 11, bold: true, color: [255, 255, 255] })
  drawText(commands, employee.name, MARGIN + 62, logoBoxY - 49, { size: 9, color: [226, 232, 240] })

  let y = logoBoxY - 86
  sections.forEach((section) => {
    y = drawSection(commands, section.title, section.fields, MARGIN, y)
  })

  drawText(commands, `Generated on ${new Date().toLocaleString()}`, PAGE_WIDTH / 2, 28, {
    size: 7,
    align: "center",
    color: [100, 116, 139],
  })

  return commands.join("\n")
}

export const downloadEmployeeDetailsPdf = async (employee: Employee) => {
  const logo = await loadPdfImageResource("/images/ippis-logo.jpeg")

  const page1 = buildPage(employee, "EMPLOYEE DETAILS", [
    {
      title: "Employee Information",
      fields: [
        { label: "Employee ID", value: getValue(employee, ["id", "employee_id"]) },
        { label: "Name", value: getValue(employee, ["name", "firstname", "firstName", "first_name"]) },
        { label: "Email", value: getValue(employee, ["email"]) },
        { label: "Department", value: getValue(employee, ["department"]) },
        { label: "Position", value: getValue(employee, ["position"]) },
        { label: "Status", value: getValue(employee, ["status"]) },
        { label: "Registration ID", value: getValue(employee, ["registration_id"]) },
        { label: "Join Date", value: formatDate(getValue(employee, ["join_date", "submission_date"])) },
      ],
    },
    {
      title: "Personal Information",
      fields: [
        { label: "First Name", value: getValue(employee, ["FirstName", "firstName", "firstname"]) },
        { label: "Surname", value: getValue(employee, ["Surname", "lastName", "last_name"]) },
        { label: "Middle Name", value: getValue(employee, ["MiddleName", "middleName", "middlename"]) },
        { label: "Title", value: getValue(employee, ["Title", "title"]) },
        { label: "Gender", value: getValue(employee, ["Gender", "gender"]) },
        { label: "Phone Number", value: getValue(employee, ["Phone Number", "telephoneno", "phone_number"]) },
        { label: "Birthdate", value: formatDate(getValue(employee, ["Birthdate", "birthdate"])) },
        { label: "Marital Status", value: getValue(employee, ["Marital Status", "maritalstatus"]) },
        { label: "State of Origin", value: getValue(employee, ["State of Origin", "state_of_origin"]) },
        { label: "Residence State", value: getValue(employee, ["State of Residence", "residence_state"]) },
        { label: "Residential Address", value: getValue(employee, ["Residential Address", "residence_address"]) },
        { label: "LGA", value: getValue(employee, ["LGA", "residence_lga"]) },
        { label: "Profession", value: getValue(employee, ["Profession", "profession"]) },
        { label: "Next of Kin Name", value: getValue(employee, ["Next of Kin Name", "next_of_kin_name"]) },
        { label: "Next of Kin Relationship", value: getValue(employee, ["Next of Kin Relationship", "next_of_kin_relationship"]) },
        { label: "Next of Kin Phone", value: getValue(employee, ["Next of Kin Phone Number", "next_of_kin_phone_number"]) },
        { label: "Next of Kin Address", value: getValue(employee, ["Next of Kin Address", "next_of_kin_address"]) },
      ],
    },
    {
      title: "Employment Information",
      fields: [
        { label: "Employment ID No", value: getValue(employee, ["Employment ID No", "employment_id_no", "employmentIdNo"]) },
        { label: "Service No", value: getValue(employee, ["Service No", "service_no", "serviceNo"]) },
        { label: "File No", value: getValue(employee, ["File No", "file_no", "fileNo"]) },
        { label: "Rank / Position", value: getValue(employee, ["Rank/Position", "rank_position", "rankPosition"]) },
        { label: "Organization", value: getValue(employee, ["Organization", "organization"]) },
        { label: "Employment Type", value: getValue(employee, ["Employment Type", "employment_type", "employmentType"]) },
        { label: "Probation Period", value: getValue(employee, ["Probation Period", "probation_period", "probationPeriod"]) },
        { label: "Work Location", value: getValue(employee, ["Work Location", "work_location"]) },
        { label: "Grade Level", value: getValue(employee, ["Grade Level", "grade_level"]) },
        { label: "Step", value: getValue(employee, ["step", "Step"]) },
        { label: "Salary Structure", value: getValue(employee, ["Salary Structure", "salary_structure"]) },
        { label: "Cadre", value: getValue(employee, ["Cadre", "cadre"]) },
        { label: "Date of First Appointment", value: formatDate(getValue(employee, ["Date of First Appointment", "date_of_first_appointment"])) },
      ],
    },
    {
      title: "Bank & Pension Information",
      fields: [
        { label: "Bank Name", value: getValue(employee, ["Bank Name", "bank_name"]) },
        { label: "Account Number", value: getValue(employee, ["Account Number", "account_number"]) },
        { label: "NUBAN Account Number", value: getValue(employee, ["nuban_account_number", "NUBAN Account Number"]) },
        { label: "PFA Name", value: getValue(employee, ["PFA Name", "pfa_name"]) },
        { label: "RSA PIN", value: getValue(employee, ["RSA PIN", "rsa_pin", "rsapin"]) },
      ],
    },
    {
      title: "Education",
      fields: [
        { label: "Educational Background", value: getValue(employee, ["Educational Background", "educational_background"]) },
        { label: "Certifications", value: getValue(employee, ["Certifications", "certifications"]) },
      ],
    },
    {
      title: "Audit Trail",
      fields: [
        { label: "Source", value: getValue(employee, ["source"]) },
        { label: "Submission Date", value: formatDateTime(getValue(employee, ["submission_date"])) },
        { label: "Created At", value: formatDateTime(getValue(employee, ["created_at", "createdAt"])) },
        { label: "Updated At", value: formatDateTime(getValue(employee, ["updated_at", "updatedAt"])) },
      ],
    },
  ], Boolean(logo))

  const pdfBytes = buildBrandedPdfDocument([page1], logo)
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  const employeeLabel = safeValue(employee.name || employee.email || employee.id)
  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date()).replace(/,/g, "")
  const link = document.createElement("a")
  link.href = url
  link.download = `employee-details-${employeeLabel.replace(/\s+/g, "_")}-${monthLabel.replace(/\s+/g, "_")}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}
