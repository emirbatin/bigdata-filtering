// src/services/fileService.js
import ExcelJS from 'exceljs'
import { matchHeader } from './mappingServices'

export const handleExcelFile = async (file, dbHeaders) => {
  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.worksheets[0]

  const headers = []
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers.push(cell.text)
  })

  const rows = []
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) {
      const rowData = {}
      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber - 1]] = cell.text
      })
      rows.push(rowData)
    }
  })

  const initialMapping = {}
  headers.forEach((header) => {
    const matchedHeader = matchHeader(header, dbHeaders)
    if (matchedHeader) {
      initialMapping[matchedHeader] = header
    }
  })

  return { headers, rows, initialMapping }
}

export const handleCsvFile = async (file, dbHeaders) => {
  const text = await file.text()
  const rows = text.split('\n').map((row) => row.split(','))
  const headers = rows[0]
  const csvData = rows.slice(1).map((row) =>
    headers.reduce((acc, header, index) => {
      acc[header] = row[index]
      return acc
    }, {})
  )

  const initialMapping = {}
  headers.forEach((header) => {
    const matchedHeader = matchHeader(header, dbHeaders)
    if (matchedHeader) {
      initialMapping[matchedHeader] = header
    }
  })

  return { headers, csvData, initialMapping }
}
