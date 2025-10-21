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

  // Export data to PDF - simplified version without jspdf
  public static exportToPDF(data: any[], options: ExportOptions): void {
    const { filename, columns } = options

    // For now, we'll just export as CSV instead of PDF to avoid the dependency issues
    this.exportToCSV(data, options)

    // Show a message that PDF export is not available in this version
    alert("PDF export is currently simplified. Your data has been exported as CSV instead.")
  }

  // Print data
  public static printData(data: any[], options: ExportOptions): void {
    const { title, columns, organization = "IPPIS - Integrated Personnel and Payroll Information System" } = options

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to print data")
      return
    }

    // Generate HTML table
    const tableHeaders = columns.map((col) => `<th>${col.header}</th>`).join("")
    const tableRows = data
      .map((item, index) => {
        const cells = columns.map((col) => `<td>${this.getNestedValue(item, col.accessor)}</td>`).join("")
        return `<tr class="${index % 2 === 0 ? "even-row" : "odd-row"}">${cells}</tr>`
      })
      .join("")

    // Create HTML content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              button.no-print { 
                display: none !important; 
              }
            }
            
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.5;
            }
            
            .container {
              max-width: 100%;
              margin: 0 auto;
            }
            
            .header {
              border-bottom: 2px solid #2c3e50;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            
            .org-name {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              margin: 0;
            }
            
            h1 { 
              font-size: 24px; 
              margin-bottom: 10px; 
              color: #2c3e50;
            }
            
            .meta-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            th { 
              background-color: #2c3e50; 
              color: white; 
              text-align: left; 
              padding: 12px 8px; 
              font-weight: bold;
              font-size: 13px;
            }
            
            td { 
              padding: 10px 8px; 
              border-bottom: 1px solid #ddd; 
              font-size: 12px;
            }
            
            .even-row {
              background-color: #f9f9f9;
            }
            
            .odd-row {
              background-color: white;
            }
            
            tr:hover {
              background-color: #f1f1f1;
            }
            
            .footer {
              margin-top: 30px;
              font-size: 11px;
              color: #666;
              text-align: center;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            
            .print-button {
              background-color: #2c3e50;
              color: white;
              border: none;
              padding: 10px 20px;
              font-size: 14px;
              cursor: pointer;
              border-radius: 4px;
              margin-bottom: 20px;
              transition: background-color 0.3s;
            }
            
            .print-button:hover {
              background-color: #1a252f;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <p class="org-name">${organization}</p>
            </div>
            
            <h1>${title}</h1>
            
            <div class="meta-info">
              <div>
                <div>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
                <div>Generated by: Administrator</div>
              </div>
              <div>
                <button onclick="window.print()" class="print-button no-print">Print Document</button>
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
              ${organization} - Confidential | ${new Date().getFullYear()} © All Rights Reserved
            </div>
          </div>
          
          <script>
            // Auto-print after 1 second
            setTimeout(() => {
              if (confirm('Do you want to print this document now?')) {
                window.print();
              }
            }, 1000);
          </script>
        </body>
      </html>
    `

    // Write HTML to the new window and trigger print
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }
}

export default ExportService
