import * as XLSX from 'xlsx'
import type { ExcelData } from './types'

export function parseExcel(buffer: ArrayBuffer): ExcelData {
  const workbook = XLSX.read(buffer, { type: 'array', cellHTML: false })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  // Strip hyperlinks
  Object.keys(sheet).forEach(key => {
    if (key[0] === '!') return
    const cell = sheet[key]
    if (cell.l) delete cell.l          // remove hyperlink
    if (cell.h) delete cell.h
  })

  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, any>[]
  const columns = json.length > 0 ? Object.keys(json[0]) : []
  return { columns, data: json }
}

export function findEmailColumn(columns: string[]): string | null {
  const emailVariations = ['Email', 'EMAIL', 'email', 'E-Mail', 'E-MAIL', 'e-mail', 'Student Email', 'Student email']
  return columns.find(col => emailVariations.includes(col)) || null
}

export function buildStudentRowHtml(row: Record<string, any>, columns: string[]): string {
  const rows = columns.map(col => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;"><strong>${col}</strong></td>
      <td style="padding: 8px; border: 1px solid #ddd;">${row[col] || ''}</td>
    </tr>
  `).join('')

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tbody>${rows}</tbody>
    </table>
  `
}
