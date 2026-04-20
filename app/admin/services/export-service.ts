import { saveAs } from "file-saver"

interface ExportColumn {
  header: string
  accessor: string
}

interface ExportOptions {
  title: string
  filename: string
  columns: ExportColumn[]
  logo?: string
  organization?: string
}

class ExportService {
  // Convert data to CSV format
  private static convertToCSV(data: any[], columns: ExportColumn[]): string {
    // Header row
    const header = columns.map((col) => col.header).join(",")

    // Data rows
    const rows = data.map((item) => {
      return columns
        .map((col) => {
          const value = this.getNestedValue(item, col.accessor)
          // Escape commas and quotes in the value
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(",")
    })

    return [header, ...rows].join("\n")
  }

  // Get nested value from an object using dot notation
  private static getNestedValue(obj: any, path: string): any {
    const keys = path.split(".")
    return keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : ""), obj)
  }

  // Export data to CSV
  public static exportToCSV(data: any[], options: ExportOptions): void {
    const { filename, columns } = options
    const csv = this.convertToCSV(data, columns)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    saveAs(blob, `${filename}.csv`)
  }

  // Generate HTML for PDF/Print
  private static generateHTML(data: any[], options: ExportOptions): string {
    const { title, columns, organization = "IPPIS - Integrated Personnel and Payroll Information System" } = options

    // Generate table headers
    const tableHeaders = columns.map((col) => `<th>${col.header}</th>`).join("")
    
    // Generate table rows
    const tableRows = data
      .map((item, index) => {
        const cells = columns.map((col) => {
          const value = this.getNestedValue(item, col.accessor)
          return `<td>${this.sanitizeHTML(String(value))}</td>`
        }).join("")
        return `<tr class="${index % 2 === 0 ? "even-row" : "odd-row"}">${cells}</tr>`
      })
      .join("")

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 10mm;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
              button {
                display: none !important;
              }
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.6;
              background: #fff;
            }
            
            .container {
              max-width: 100%;
              margin: 0 auto;
            }
            
            .header {
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .org-name {
              font-size: 20px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 5px;
            }
            
            .document-title {
              font-size: 28px;
              font-weight: bold;
              margin: 20px 0 15px 0;
              color: #1a252f;
            }
            
            .meta-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
              padding: 10px;
              background-color: #f5f5f5;
              border-radius: 4px;
            }
            
            .meta-left {
              flex: 1;
            }
            
            .meta-right {
              text-align: right;
            }
            
            .meta-info div {
              margin: 3px 0;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              font-size: 13px;
            }
            
            thead {
              background-color: #2c3e50;
              color: white;
            }
            
            th {
              background-color: #2c3e50;
              color: white;
              text-align: left;
              padding: 12px 8px;
              font-weight: bold;
              border: 1px solid #1a252f;
              word-break: break-word;
            }
            
            td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              word-break: break-word;
              max-width: 300px;
            }
            
            .even-row {
              background-color: #f9f9f9;
            }
            
            .odd-row {
              background-color: white;
            }
            
            tbody tr:hover {
              background-color: #efefef;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 15px;
              border-top: 2px solid #ddd;
              font-size: 11px;
              color: #666;
              text-align: center;
            }
            
            .export-info {
              font-size: 10px;
              color: #999;
              margin-top: 5px;
            }
            
            .action-buttons {
              margin-bottom: 20px;
              display: flex;
              gap: 10px;
            }
            
            button {
              background-color: #2c3e50;
              color: white;
              border: none;
              padding: 10px 20px;
              font-size: 14px;
              cursor: pointer;
              border-radius: 4px;
              transition: background-color 0.3s;
            }
            
            button:hover {
              background-color: #1a252f;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="action-buttons no-print">
              <button onclick="window.print()">Print PDF</button>
              <button onclick="window.close()">Close</button>
            </div>
            
            <div class="header">
              <div class="org-name">${organization}</div>
            </div>
            
            <div class="document-title">${title}</div>
            
            <div class="meta-info">
              <div class="meta-left">
                <div><strong>Generated on:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
                <div><strong>Total Records:</strong> ${data.length}</div>
              </div>
              <div class="meta-right">
                <div><strong>Report Type:</strong> Data Export</div>
                <div><strong>Format:</strong> PDF Document</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>${tableHeaders}</tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            
            <div class="footer">
              <div>${organization} - Confidential Report | ${new Date().getFullYear()} © All Rights Reserved</div>
              <div class="export-info">This document was generated from the system on ${new Date().toLocaleString()}</div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  // Sanitize HTML to prevent XSS
  private static sanitizeHTML(html: string): string {
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
  }

  // Export data to PDF
  public static exportToPDF(data: any[], options: ExportOptions): void {
    try {
      const { filename } = options
      const pdfBytes = this.generatePdf(data, options)
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      saveAs(blob, `${filename}.pdf`)
    } catch (error) {
      console.error('PDF export error:', error)
      throw new Error('Failed to generate PDF')
    }
  }

  private static generatePdf(data: any[], options: ExportOptions): Uint8Array {
    const { title, columns, organization = "IPPIS - Integrated Personnel and Payroll Information System" } = options
    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 40
    const fontSize = 10
    const lineHeight = 14
    const maxCharsPerLine = 95

    const lines: string[] = [
      this.pdfSafeText(organization),
      "",
      this.pdfSafeText(title),
      `Generated on: ${new Date().toLocaleString()}`,
      `Total Records: ${data.length}`,
      "",
      this.pdfSafeText(columns.map((col) => col.header).join(" | ")),
      this.pdfSafeText("-".repeat(Math.min(maxCharsPerLine, Math.max(20, columns.length * 12)))),
    ]

    data.forEach((item, index) => {
      const rowText = columns
        .map((col) => {
          const value = this.getNestedValue(item, col.accessor)
          return this.pdfSafeText(String(value ?? ""))
        })
        .join(" | ")

      const wrappedRow = this.wrapPdfText(`${index + 1}. ${rowText}`, maxCharsPerLine)
      lines.push(...wrappedRow)
    })

    const usableHeight = pageHeight - margin * 2
    const linesPerPage = Math.max(1, Math.floor(usableHeight / lineHeight))
    const pages: string[][] = []
    for (let i = 0; i < lines.length; i += linesPerPage) {
      pages.push(lines.slice(i, i + linesPerPage))
    }

    return this.buildPdfDocument(pages, pageWidth, pageHeight, margin, fontSize, lineHeight)
  }

  private static wrapPdfText(text: string, maxChars: number): string[] {
    const safeText = this.pdfSafeText(text)
    if (safeText.length <= maxChars) return [safeText]

    const words = safeText.split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let current = ""

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (candidate.length <= maxChars) {
        current = candidate
        continue
      }

      if (current) {
        lines.push(current)
      }

      if (word.length > maxChars) {
        for (let i = 0; i < word.length; i += maxChars) {
          const chunk = word.slice(i, i + maxChars)
          if (chunk.length === maxChars) {
            lines.push(chunk)
          } else {
            current = chunk
          }
        }
      } else {
        current = word
      }
    }

    if (current) {
      lines.push(current)
    }

    return lines.length > 0 ? lines : [safeText]
  }

  private static pdfSafeText(text: string): string {
    return String(text)
      .replace(/\r?\n/g, " ")
      .replace(/[^\x20-\x7E]/g, "?")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
  }

  private static buildPdfDocument(
    pages: string[][],
    pageWidth: number,
    pageHeight: number,
    margin: number,
    fontSize: number,
    lineHeight: number,
  ): Uint8Array {
    const objects: string[] = []
    const pageObjects: number[] = []
    const contentObjects: number[] = []

    const pushObject = (body: string) => {
      objects.push(body)
      return objects.length
    }

    const fontObject = pushObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    const pagesObjectIndex = pages.length * 2 + 2

    pages.forEach((pageLines, pageIndex) => {
      const content = [
        "BT",
        `/F1 ${fontSize} Tf`,
        `1 0 0 1 ${margin} ${pageHeight - margin - fontSize} Tm`,
        `14 TL`,
        ...pageLines.map((line) => `(${this.pdfSafeText(line)}) Tj T*`),
        "ET",
      ].join("\n")

      const contentObject = pushObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
      contentObjects.push(contentObject)

      const pageObject = pushObject(
        `<< /Type /Page /Parent ${pagesObjectIndex} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObject} 0 R >> >> /Contents ${contentObject} 0 R >>`,
      )
      pageObjects.push(pageObject)
    })

    const kids = pageObjects.map((objectNumber) => `${objectNumber} 0 R`).join(" ")
    const pagesObject = `<< /Type /Pages /Kids [${kids}] /Count ${pageObjects.length} >>`
    objects.splice(pagesObjectIndex - 1, 0, pagesObject)

    const catalogObject = pushObject(`<< /Type /Catalog /Pages ${pagesObjectIndex} 0 R >>`)

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
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

    return new TextEncoder().encode(pdf)
  }

  // Print data
  public static printData(data: any[], options: ExportOptions): void {
    try {
      const html = this.generateHTML(data, options)
      
      // Create a blob and open in new window
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      // Open in new window
      const printWindow = window.open(url, '_blank')
      if (!printWindow) {
        throw new Error('Could not open print window')
      }
      
      // Auto-trigger print after window loads
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
      
      // Clean up the URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 2000)
    } catch (error) {
      console.error('Print error:', error)
      throw new Error('Failed to open print dialog')
    }
  }
}

export default ExportService
