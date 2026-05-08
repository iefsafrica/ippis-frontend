import type { PayslipPayment } from "./payslip-dialog"

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 36
const EMPTY_VALUE = ""

type PdfImageResource = {
  bytes: Uint8Array
  width: number
  height: number
}

const bytesToHex = (bytes: Uint8Array) => {
  let output = ""
  for (let index = 0; index < bytes.length; index += 1) {
    output += bytes[index].toString(16).padStart(2, "0")
  }
  return output
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

const escapePdfText = (text: string) =>
  String(text)
    .replace(/\r?\n/g, " ")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")

const formatPdfCurrency = (value?: string | number) => {
  const amount = typeof value === "string" ? Number.parseFloat(value) : value
  if (amount == null || Number.isNaN(amount)) return EMPTY_VALUE

  return `NGN ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

const formatPdfDate = (value?: string | Date | null) => {
  if (!value) return EMPTY_VALUE
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/,/g, "")
}

const formatPdfMonth = (value?: string | Date | null) => {
  if (!value) return EMPTY_VALUE
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  })
    .format(date)
    .toUpperCase()
}

const sanitizeFilename = (value: string) =>
  value
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")

const safeValue = (value?: string | number | null) =>
  value != null && `${value}`.trim() !== "" ? `${value}` : EMPTY_VALUE

const normalizeRecord = (value: Record<string, unknown> | string | null | undefined) => {
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

const getValue = (payment: PayslipPayment, keys: string[]) => {
  const metadata = normalizeRecord(payment.metadata)
  const snapshot = normalizeRecord(payment.employee_snapshot)

  for (const key of keys) {
    const value = payment?.[key]
    if (value != null && `${value}`.trim() !== "") return `${value}`

    const snapshotValue = snapshot[key]
    if (snapshotValue != null && `${snapshotValue}`.trim() !== "") return `${snapshotValue}`

    const metadataValue = metadata[key]
    if (metadataValue != null && `${metadataValue}`.trim() !== "") return `${metadataValue}`
  }

  return EMPTY_VALUE
}

const calculateEarnings = (grossAmount: number) => {
  const basic = Number((grossAmount * 0.65).toFixed(2))
  const housing = Number((grossAmount * 0.15).toFixed(2))
  const transport = Number((grossAmount * 0.1).toFixed(2))
  const other = Math.max(Number((grossAmount - (basic + housing + transport)).toFixed(2)), 0)

  return [
    { label: "Basic Salary", amount: basic },
    { label: "Housing Allowance", amount: housing },
    { label: "Transport Allowance", amount: transport },
    { label: "Other Allowance", amount: other },
  ]
}

const calculateDeductions = (deductionAmount: number) => {
  const pension = Number((deductionAmount * 0.35).toFixed(2))
  const nhis = Number((deductionAmount * 0.15).toFixed(2))
  const tax = Number((deductionAmount * 0.25).toFixed(2))
  const other = Math.max(Number((deductionAmount - (pension + nhis + tax)).toFixed(2)), 0)

  return [
    { label: "Pension", amount: pension },
    { label: "NHIS", amount: nhis },
    { label: "PAYE / Tax", amount: tax },
    { label: "Other Deductions", amount: other },
  ]
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

const buildPdfDocument = (content: string, coatOfArms: PdfImageResource | null) => {
  const objects: string[] = []

  const pushObject = (body: string) => {
    objects.push(body)
    return objects.length
  }

  const fontRegular = pushObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  const fontBold = pushObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

  const imageObject = coatOfArms
    ? pushObject(
        (() => {
          const imageHex = bytesToHex(coatOfArms.bytes)
          return `<< /Type /XObject /Subtype /Image /Width ${coatOfArms.width} /Height ${coatOfArms.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [ /ASCIIHexDecode /DCTDecode ] /Length ${
            imageHex.length + 1
          } >>\nstream\n${imageHex}>\nendstream`
        })(),
      )
    : null

  const contentObject = pushObject(`<< /Length ${new TextEncoder().encode(`${content}\n`).length} >>\nstream\n${content}\nendstream`)
  const pageObject = pushObject("<< /Type /Page /Parent 0 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 0 0 R /F2 0 0 R >> >> /Contents 0 0 R >>")
  const pagesObject = pushObject("<< /Type /Pages /Kids [] /Count 0 >>")
  pushObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`)

  const resources = imageObject
    ? `<< /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> /XObject << /Im0 ${imageObject} 0 R >> >>`
    : `<< /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >>`

  objects[pageObject - 1] = `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources ${resources} /Contents ${contentObject} 0 R >>`
  objects[pagesObject - 1] = `<< /Type /Pages /Kids [${pageObject} 0 R] /Count 1 >>`

  return buildPdfDocumentFromObjects(objects)
}

const drawText = (
  commands: string[],
  text: string,
  x: number,
  y: number,
  options: { size?: number; bold?: boolean; align?: "left" | "center" | "right" } = {},
) => {
  const size = options.size ?? 10
  const font = options.bold ? "F2" : "F1"
  const safeText = escapePdfText(text)
  const width = safeText.length * size * 0.52
  let drawX = x

  if (options.align === "center") {
    drawX = x - width / 2
  } else if (options.align === "right") {
    drawX = x - width
  }

  commands.push(`BT /${font} ${size} Tf 1 0 0 1 ${drawX.toFixed(2)} ${y.toFixed(2)} Tm (${safeText}) Tj ET`)
}

const drawImage = (
  commands: string[],
  _image: PdfImageResource,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
) => {
  const leftX = centerX - width / 2
  const bottomY = centerY - height / 2
  const radius = Math.min(width, height) / 2
  const kappa = 0.5522847498
  const offset = radius * kappa
  const top = centerY + radius
  const right = centerX + radius
  const bottom = centerY - radius
  const left = centerX - radius
  const circlePath = [
    `${left.toFixed(2)} ${centerY.toFixed(2)} m`,
    `${left.toFixed(2)} ${(centerY + offset).toFixed(2)} ${(centerX - offset).toFixed(2)} ${top.toFixed(2)} ${centerX.toFixed(2)} ${top.toFixed(2)} c`,
    `${(centerX + offset).toFixed(2)} ${top.toFixed(2)} ${right.toFixed(2)} ${(centerY + offset).toFixed(2)} ${right.toFixed(2)} ${centerY.toFixed(2)} c`,
    `${right.toFixed(2)} ${(centerY - offset).toFixed(2)} ${(centerX + offset).toFixed(2)} ${bottom.toFixed(2)} ${centerX.toFixed(2)} ${bottom.toFixed(2)} c`,
    `${(centerX - offset).toFixed(2)} ${bottom.toFixed(2)} ${left.toFixed(2)} ${(centerY - offset).toFixed(2)} ${left.toFixed(2)} ${centerY.toFixed(2)} c`,
  ]

  commands.push("q")
  commands.push(`${circlePath.join("\n")} W n`)
  commands.push(`${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${leftX.toFixed(2)} ${bottomY.toFixed(2)} cm /Im0 Do`)
  commands.push("Q")
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
  fill: [number, number, number] = [255, 255, 255],
  stroke?: [number, number, number],
) => {
  const fillColor = `${(fill[0] / 255).toFixed(3)} ${(fill[1] / 255).toFixed(3)} ${(fill[2] / 255).toFixed(3)}`
  const bottomY = topY - height
  const parts = ["q", `${fillColor} rg`]

  if (stroke) {
    const strokeColor = `${(stroke[0] / 255).toFixed(3)} ${(stroke[1] / 255).toFixed(3)} ${(stroke[2] / 255).toFixed(3)}`
    parts.push(`${strokeColor} RG`, "1 w")
  }

  parts.push(`${x.toFixed(2)} ${bottomY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`, stroke ? "B" : "f", "Q")
  commands.push(parts.join(" "))
}

const wrapText = (text: string, maxChars: number) => {
  const value = String(text ?? "").trim()
  if (!value) return [EMPTY_VALUE]

  const words = value.split(/\s+/)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    if (!current) {
      current = word
      continue
    }

    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`
    } else {
      lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines.length ? lines : [value]
}

const drawLabeledValue = (
  commands: string[],
  label: string,
  value: string,
  x: number,
  topY: number,
  width: number,
) => {
  const labelLines = wrapText(label.toUpperCase(), Math.max(14, Math.floor(width / 7)))
  const valueLines = wrapText(value, Math.max(18, Math.floor(width / 6)))
  let y = topY

  labelLines.forEach((line) => {
    drawText(commands, line, x, y, { size: 7, bold: true })
    y -= 10
  })

  y -= 2
  valueLines.forEach((line) => {
    drawText(commands, line, x, y, { size: 9 })
    y -= 11
  })

  return topY - y + 6
}

const drawSectionTitle = (commands: string[], title: string, y: number) => {
  commands.push("0.008 0.53 0.31 rg", "0.008 0.53 0.31 RG")
  drawText(commands, title, MARGIN, y, { size: 9, bold: true })
  drawLine(commands, MARGIN, y - 6, PAGE_WIDTH - MARGIN, y - 6)
  commands.push("0 0 0 rg", "0 0 0 RG")
  return y - 18
}

const drawMoneyRows = (
  commands: string[],
  title: string,
  rows: { label: string; amount: number }[],
  x: number,
  y: number,
  width: number,
) => {
  drawText(commands, title, x, y, { size: 9, bold: true })
  drawLine(commands, x, y - 6, x + width, y - 6)

  let currentY = y - 22
  rows.forEach((row) => {
    const labelLines = wrapText(row.label, 28)
    drawText(commands, labelLines[0], x, currentY, { size: 8 })
    drawText(commands, formatPdfCurrency(row.amount), x + width, currentY, { size: 8, bold: true, align: "right" })
    currentY -= 14
  })

  return currentY
}

export const downloadPayslipPdf = async (payment: PayslipPayment, _previewElement?: HTMLElement | null) => {
  const grossAmount = Number(payment?.amount ?? 0) || 0
  const deductionAmount = Number(payment?.deduction_amount ?? payment?.deductions ?? 0) || 0
  const netAmount = Math.max(grossAmount - deductionAmount, 0)
  const paymentStatus = safeValue(payment?.status ?? payment?.payment_status)
  const earnings = calculateEarnings(grossAmount)
  const deductions = calculateDeductions(deductionAmount)
  const paymentDateValue = payment?.payment_date ?? payment?.paymentDate ?? payment?.created_at ?? payment?.createdAt
  const payslipDateValue = payment?.created_at ?? payment?.createdAt ?? paymentDateValue ?? payment?.month
  const payPeriod = payment?.month ? payment.month.toString().toUpperCase() : formatPdfMonth(paymentDateValue)
  const organization = safeValue(getValue(payment, ["organization", "Organization", "department", "command"]))
  const coatOfArms = await loadPdfImageResource("/images/coat-of-arms.jpg")

  const commands: string[] = ["0 0 0 RG", "0 0 0 rg"]
  let y = PAGE_HEIGHT - MARGIN

  drawRect(commands, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 92, [10, 68, 52])

  if (coatOfArms) {
    drawImage(commands, coatOfArms, PAGE_WIDTH / 2, y - 18, 52, 52)
  }

  commands.push("1 1 1 rg", "1 1 1 RG")
  const headerTitleY = y - 60
  const headerSubtitleY = y - 80
  drawText(commands, organization, PAGE_WIDTH / 2, headerTitleY, { size: 13, bold: true, align: "center" })
  drawText(commands, "EMPLOYEE PAYSLIP", PAGE_WIDTH / 2, headerSubtitleY, { size: 11, bold: true, align: "center" })
  drawText(commands, `Payslip Month: ${payPeriod}`, PAGE_WIDTH - MARGIN - 12, y - 34, {
    size: 8,
    bold: true,
    align: "right",
  })
  drawText(commands, `Payslip ID: ${safeValue(payment?.payment_id ?? payment?.id)}`, PAGE_WIDTH - MARGIN - 12, y - 48, {
    size: 8,
    bold: true,
    align: "right",
  })
  drawText(commands, `Status: ${paymentStatus}`, PAGE_WIDTH - MARGIN - 12, y - 62, {
    size: 8,
    bold: true,
    align: "right",
  })
  commands.push("0 0 0 rg", "0 0 0 RG")
  y -= 112

  y = drawSectionTitle(commands, "Employee Details", y)

  const details = [
    ["Employee Name", getValue(payment, ["employee_name", "name", "FirstName"]), "Grade", getValue(payment, ["grade", "Grade Level", "grade_level"])],
    ["Employee ID", getValue(payment, ["employee_id", "Employment ID No", "employment_id_no"]), "Step", getValue(payment, ["step", "Step"])],
    ["Legacy ID", getValue(payment, ["legacy_id", "File No", "file_no"]), "Gender", getValue(payment, ["gender", "Gender"])],
    ["Department", getValue(payment, ["department", "Department", "organization", "command"]), "Tax State", getValue(payment, ["tax_state", "State of Origin", "state_of_origin"])],
    ["Location", getValue(payment, ["location", "Work Location", "work_location"]), "Date of Appointment", formatPdfDate(getValue(payment, ["appointment", "appointment_date", "Date of First Appointment", "date_of_first_appointment"]))],
    ["Job", getValue(payment, ["position", "Rank/Position", "rank_position"]), "Date of Birth", formatPdfDate(getValue(payment, ["dob", "Birthdate", "birthdate"]))],
  ] as const

  details.forEach(([leftLabel, leftValue, rightLabel, rightValue]) => {
    const leftHeight = drawLabeledValue(commands, leftLabel, leftValue, MARGIN, y, 220)
    const rightHeight = drawLabeledValue(commands, rightLabel, rightValue, 312, y, 247)
    y -= Math.max(leftHeight, rightHeight) + 3
  })

  y -= 2
  const earningsBottom = drawMoneyRows(commands, "Gross Earnings Information", earnings, MARGIN, y, 235)
  const deductionsBottom = drawMoneyRows(commands, "Gross Deduction Information", deductions, 312, y, 247)
  y = Math.min(earningsBottom, deductionsBottom) - 16

  drawLine(commands, MARGIN, y, PAGE_WIDTH - MARGIN, y)
  y -= 18

  drawText(commands, "Summary of Payments", MARGIN, y, { size: 9, bold: true })
  y -= 16
  drawText(commands, "Total Gross Earnings", MARGIN, y, { size: 8 })
  drawText(commands, formatPdfCurrency(grossAmount), PAGE_WIDTH - MARGIN, y, { size: 8, bold: true, align: "right" })
  y -= 13
  drawText(commands, "Income Tax", MARGIN, y, { size: 8 })
  const tax = deductions.find((item) => item.label === "PAYE / Tax")?.amount ?? 0
  drawText(commands, formatPdfCurrency(tax), PAGE_WIDTH - MARGIN, y, { size: 8, bold: true, align: "right" })
  y -= 13
  drawText(commands, "Total Gross Deductions", MARGIN, y, { size: 8 })
  drawText(commands, formatPdfCurrency(deductionAmount), PAGE_WIDTH - MARGIN, y, { size: 8, bold: true, align: "right" })
  y -= 13
  drawText(commands, "Total Net Earnings", MARGIN, y, { size: 8, bold: true })
  drawText(commands, formatPdfCurrency(netAmount), PAGE_WIDTH - MARGIN, y, { size: 8, bold: true, align: "right" })
  y -= 24

  drawText(commands, "Generated By", MARGIN, y, { size: 7, bold: true })
  drawText(commands, "IPPIS - SoftSuite", MARGIN, y - 10, { size: 7 })
  drawText(commands, `Payment Date: ${formatPdfDate(paymentDateValue)}`, PAGE_WIDTH / 2, y, { size: 7, align: "center" })
  drawText(commands, `Payslip Date: ${formatPdfDate(payslipDateValue)}`, PAGE_WIDTH - MARGIN, y, { size: 7, align: "right" })

  const pdfBytes = buildPdfDocument(commands.join("\n"), coatOfArms)
  const blob = new Blob([pdfBytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  const employeeLabel = sanitizeFilename(
    safeValue(payment?.employee_name ?? payment?.employee_id ?? payment?.payment_id ?? payment?.id),
  )
  const monthLabel = sanitizeFilename(
    payment?.month
      ? `${payment.month}`
      : paymentDateValue
        ? new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(paymentDateValue))
        : "current-month",
  )

  const link = document.createElement("a")
  link.href = url
  link.download = `payslip-${employeeLabel}-${monthLabel}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}
